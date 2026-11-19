import { EventEmitter } from 'events';
import { ResumeParserService } from './resumeParser';
import { MatchingEngineService } from './matchingEngine';
import prisma from '../config/prisma';

export interface BulkJobStatus {
  id: string;
  total: number;
  processed: number;
  failed: number;
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  results: Array<{
    candidateName: string;
    fileName: string;
    score: number;
    skills: string[];
    status: 'SUCCESS' | 'ERROR';
    error?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

class BackgroundQueueManager extends EventEmitter {
  private jobs: Map<string, BulkJobStatus> = new Map();

  public createBatchJob(totalFiles: number): string {
    const jobId = 'batch_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const initialStatus: BulkJobStatus = {
      id: jobId,
      total: totalFiles,
      processed: 0,
      failed: 0,
      status: 'QUEUED',
      results: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.jobs.set(jobId, initialStatus);
    return jobId;
  }

  public getJobStatus(jobId: string): BulkJobStatus | undefined {
    return this.jobs.get(jobId);
  }

  public async processBatchFiles(
    jobId: string,
    files: Express.Multer.File[],
    targetJobId: string,
    recruiterId: string
  ): Promise<void> {
    const jobRecord = this.jobs.get(jobId);
    if (!jobRecord) return;

    jobRecord.status = 'PROCESSING';
    jobRecord.updatedAt = new Date();

    const dbJob = await prisma.job.findUnique({
      where: { id: targetJobId },
    });

    if (!dbJob) {
      jobRecord.status = 'FAILED';
      return;
    }

    const jobRequirements = {
      requiredSkills: dbJob.requiredSkills ? JSON.parse(dbJob.requiredSkills) : [],
      preferredSkills: dbJob.preferredSkills ? JSON.parse(dbJob.preferredSkills) : [],
      minimumExperience: dbJob.minimumExperience,
      weightsConfig: dbJob.weightsConfig,
      title: dbJob.title,
    };

    // Process files sequentially or in micro-batches
    for (const file of files) {
      try {
        const rawText = await ResumeParserService.extractTextFromFile(file.path);
        const parsed = await ResumeParserService.parseResume(rawText);
        const matchResult = MatchingEngineService.evaluateMatch(parsed, jobRequirements);

        // Check if candidate user already exists or create shadow candidate
        const candidateEmail = parsed.personal.email || `applicant_${Date.now()}_${Math.random().toString(36).substring(2, 6)}@jobzy-applicant.com`;
        let user = await prisma.user.findUnique({ where: { email: candidateEmail } });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email: candidateEmail,
              name: parsed.personal.name || 'Candidate ' + file.originalname,
              passwordHash: '$2a$10$wT0l0...dummy',
              role: 'CANDIDATE',
              avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(parsed.personal.name || 'C')}&backgroundColor=111111&textColor=c4f167`,
            },
          });
        }

        let profile = await prisma.candidateProfile.findUnique({ where: { userId: user.id } });
        if (!profile) {
          profile = await prisma.candidateProfile.create({
            data: {
              userId: user.id,
              phone: parsed.personal.phone,
              location: parsed.personal.location,
              experienceYears: parsed.totalExperienceYears,
              extractedProfile: JSON.stringify(parsed),
            },
          });
        }

        // Save resume record
        const resume = await prisma.resume.create({
          data: {
            candidateId: profile.id,
            originalFileName: file.originalname,
            filePath: file.path,
            extractedText: rawText.slice(0, 5000),
            parsedData: JSON.stringify(parsed),
            atsScore: parsed.atsScore,
          },
        });

        // Save or update CandidateMatch
        await prisma.candidateMatch.upsert({
          where: {
            candidateId_jobId: {
              candidateId: profile.id,
              jobId: targetJobId,
            },
          },
          update: {
            overallScore: matchResult.overallScore,
            skillScore: matchResult.categoryScores.requiredSkills,
            experienceScore: matchResult.categoryScores.experience,
            projectScore: matchResult.categoryScores.projects,
            educationScore: matchResult.categoryScores.education,
            evidence: JSON.stringify(matchResult.evidence),
            missingRequirements: JSON.stringify(matchResult.missingMandatorySkills),
            confidence: matchResult.confidence,
          },
          create: {
            candidateId: profile.id,
            jobId: targetJobId,
            overallScore: matchResult.overallScore,
            skillScore: matchResult.categoryScores.requiredSkills,
            experienceScore: matchResult.categoryScores.experience,
            projectScore: matchResult.categoryScores.projects,
            educationScore: matchResult.categoryScores.education,
            evidence: JSON.stringify(matchResult.evidence),
            missingRequirements: JSON.stringify(matchResult.missingMandatorySkills),
            confidence: matchResult.confidence,
          },
        });

        // Create Application record if not exists
        await prisma.application.upsert({
          where: {
            candidateId_jobId: {
              candidateId: profile.id,
              jobId: targetJobId,
            },
          },
          update: {},
          create: {
            candidateId: profile.id,
            jobId: targetJobId,
            resumeId: resume.id,
            status: matchResult.overallScore >= 80 ? 'UNDER_REVIEW' : 'APPLIED',
          },
        });

        jobRecord.processed += 1;
        jobRecord.results.push({
          candidateName: parsed.personal.name,
          fileName: file.originalname,
          score: matchResult.overallScore,
          skills: parsed.skills,
          status: 'SUCCESS',
        });
      } catch (err: any) {
        console.error(`Batch processing error on ${file.originalname}:`, err);
        jobRecord.processed += 1;
        jobRecord.failed += 1;
        jobRecord.results.push({
          candidateName: file.originalname,
          fileName: file.originalname,
          score: 0,
          skills: [],
          status: 'ERROR',
          error: err.message,
        });
      }

      jobRecord.updatedAt = new Date();
    }

    jobRecord.status = 'COMPLETED';
    jobRecord.updatedAt = new Date();
  }
}

export const backgroundQueue = new BackgroundQueueManager();
