import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { MatchingEngineService } from '../services/matchingEngine';
import { AIService } from '../services/aiService';
import { JobParserService } from '../services/jobParser';
import prisma from '../config/prisma';

export class MatchingController {
  /**
   * Run job compatibility and skill gap analysis for a candidate resume against a target job or custom pasted JD
   */
  public static async analyzeCandidateVsJob(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { resumeId, jobId, customJdText } = req.body;

      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      // Auto-find or create candidate profile
      let profile = await prisma.candidateProfile.findUnique({
        where: { userId: req.user.id },
      });

      if (!profile) {
        profile = await prisma.candidateProfile.create({
          data: {
            userId: req.user.id,
            title: 'Software Engineer',
            experienceYears: 1.0,
          },
        });
      }

      // Find target resume
      let resume = null;
      if (resumeId) {
        resume = await prisma.resume.findUnique({ where: { id: resumeId } });
      }
      if (!resume) {
        resume = await prisma.resume.findFirst({
          where: { candidateId: profile.id },
          orderBy: { createdAt: 'desc' },
        });
      }

      if (!resume || !resume.parsedData) {
        res.status(400).json({
          success: false,
          message: 'No parsed resume found. Please upload a resume first to run compatibility analysis.',
        });
        return;
      }

      let jobRequirements: any = null;
      let targetJob: any = null;
      let targetJobTitle = 'Universal Software Engineer';
      let isCustom = true;

      // 1. If jobId is provided, check if valid platform job
      if (jobId && typeof jobId === 'string' && jobId !== 'custom' && jobId !== 'universal') {
        try {
          targetJob = await prisma.job.findUnique({
            where: { id: jobId },
            include: { company: true },
          });

          if (targetJob) {
            isCustom = false;
            targetJobTitle = targetJob.title;
            jobRequirements = {
              requiredSkills: targetJob.requiredSkills ? JSON.parse(targetJob.requiredSkills) : [],
              preferredSkills: targetJob.preferredSkills ? JSON.parse(targetJob.preferredSkills) : [],
              minimumExperience: targetJob.minimumExperience,
              weightsConfig: targetJob.weightsConfig,
              title: targetJob.title,
            };
          }
        } catch (e) {
          // If invalid MongoDB ObjectId format or job not found, fall through to universal/custom
          targetJob = null;
        }
      }

      // 2. If no platform job was matched, evaluate custom JD text or universal baseline
      if (!jobRequirements) {
        const rawJd = (customJdText && typeof customJdText === 'string') ? customJdText.trim() : '';

        if (rawJd.length >= 5) {
          const parsedJD = JobParserService.parseJobDescription(rawJd);
          targetJobTitle = parsedJD.title || 'Target Job Position';
          jobRequirements = {
            requiredSkills: parsedJD.requiredSkills.length > 0
              ? parsedJD.requiredSkills
              : ['Problem Solving', 'Software Engineering', 'Technical Architecture', 'Git'],
            preferredSkills: parsedJD.preferredSkills || [],
            minimumExperience: parsedJD.minimumExperience || 1.0,
            weightsConfig: null,
            title: targetJobTitle,
          };
        } else {
          // Universal Software Engineering standard requirements if field was left blank
          targetJobTitle = 'Full Stack Software Engineer (Industry Baseline)';
          jobRequirements = {
            requiredSkills: ['JavaScript', 'TypeScript', 'React.js', 'Node.js', 'REST APIs', 'Git', 'Problem Solving'],
            preferredSkills: ['Docker', 'PostgreSQL', 'MongoDB', 'CI/CD Pipelines'],
            minimumExperience: 1.0,
            weightsConfig: null,
            title: targetJobTitle,
          };
        }
      }

      const parsedResume = JSON.parse(resume.parsedData);
      const matchResult = MatchingEngineService.evaluateMatch(parsedResume, jobRequirements);
      const learningRoadmap = AIService.generateLearningRoadmap(matchResult.missingMandatorySkills);

      // Save Analysis record
      const analysis = await prisma.analysis.create({
        data: {
          candidateId: profile.id,
          resumeId: resume.id,
          jobId: targetJob ? targetJob.id : null,
          overallScore: matchResult.overallScore,
          atsReadabilityScore: resume.atsScore || 90,
          matchScore: matchResult.overallScore,
          skillScore: matchResult.categoryScores.requiredSkills,
          experienceScore: matchResult.categoryScores.experience,
          projectScore: matchResult.categoryScores.projects,
          educationScore: matchResult.categoryScores.education,
          matchedSkills: JSON.stringify(matchResult.matchedSkills),
          missingSkills: JSON.stringify(matchResult.missingMandatorySkills),
          detailedBreakdown: JSON.stringify({
            categoryScores: matchResult.categoryScores,
            evidence: matchResult.evidence,
            learningRoadmap,
            jobTitle: targetJobTitle,
            isCustomJd: !targetJob,
          }),
          recommendations: JSON.stringify(matchResult.evidence.gaps),
          formattingWarnings: JSON.stringify(parsedResume.atsWarnings || []),
        },
      });

      // Upsert candidate match only for platform jobs
      if (targetJob) {
        await prisma.candidateMatch.upsert({
          where: {
            candidateId_jobId: {
              candidateId: profile.id,
              jobId: targetJob.id,
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
            jobId: targetJob.id,
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
      }

      res.status(200).json({
        success: true,
        analysisId: analysis.id,
        overallScore: matchResult.overallScore,
        atsReadabilityScore: resume.atsScore || 90,
        categoryScores: matchResult.categoryScores,
        matchedSkills: matchResult.matchedSkills,
        missingSkills: matchResult.missingMandatorySkills,
        missingPreferredSkills: matchResult.missingPreferredSkills,
        evidence: matchResult.evidence,
        learningRoadmap,
        formattingWarnings: parsedResume.atsWarnings || [],
        job: targetJob
          ? { id: targetJob.id, title: targetJob.title, company: targetJob.company?.name }
          : { id: 'custom', title: targetJobTitle, company: 'Custom Job Description (Pasted)', isCustom: true },
      });
    } catch (error: any) {
      console.error('analyzeCandidateVsJob error:', error);
      res.status(500).json({ success: false, message: 'Failed to analyze job compatibility.' });
    }
  }

  /**
   * Recruiter Candidate Ranking for a Job
   */
  public static async getJobCandidates(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { jobId } = req.params;
      const { minScore, sortBy, search, status } = req.query;

      const job = await prisma.job.findUnique({
        where: { id: jobId },
        include: { company: true },
      });

      if (!job) {
        res.status(404).json({ success: false, message: 'Job not found.' });
        return;
      }

      // Fetch matches for this job
      const matches = await prisma.candidateMatch.findMany({
        where: {
          jobId,
          overallScore: minScore ? { gte: parseFloat(String(minScore)) } : undefined,
        },
        include: {
          candidate: {
            include: {
              user: { select: { id: true, name: true, email: true, avatar: true } },
              resumes: { orderBy: { createdAt: 'desc' }, take: 1 },
              applications: { where: { jobId } },
              shortlists: { where: { jobId } },
              skills: { include: { skill: true } },
            },
          },
        },
      });

      // Map and enrich candidates
      let candidateList = matches.map((m) => {
        const app = m.candidate.applications[0];
        const isShortlisted = m.candidate.shortlists.length > 0;
        const skills = m.candidate.skills.map((s) => s.skill.name);
        const resume = m.candidate.resumes[0];

        return {
          id: m.candidate.id,
          userId: m.candidate.user.id,
          name: m.candidate.user.name,
          email: m.candidate.user.email,
          avatar: m.candidate.user.avatar,
          title: m.candidate.title || 'Engineer',
          overallScore: m.overallScore,
          skillScore: m.skillScore,
          experienceScore: m.experienceScore,
          projectScore: m.projectScore,
          educationScore: m.educationScore,
          experienceYears: m.candidate.experienceYears,
          location: m.candidate.location || 'Remote',
          skills,
          resumeId: resume?.id,
          resumeUrl: resume?.filePath,
          atsScore: resume?.atsScore || 85,
          applicationStatus: app ? app.status : 'SCREENED',
          applicationId: app?.id,
          isShortlisted,
          evidence: m.evidence ? JSON.parse(m.evidence) : null,
          missingRequirements: m.missingRequirements ? JSON.parse(m.missingRequirements) : [],
        };
      });

      // Filter by search
      if (search) {
        const q = String(search).toLowerCase();
        candidateList = candidateList.filter((c) =>
          c.name.toLowerCase().includes(q) ||
          c.skills.some((s) => s.toLowerCase().includes(q))
        );
      }

      // Filter by application status
      if (status && status !== 'ALL') {
        candidateList = candidateList.filter((c) => c.applicationStatus === status);
      }

      // Sort
      if (sortBy === 'experience') {
        candidateList.sort((a, b) => b.experienceYears - a.experienceYears);
      } else if (sortBy === 'skills') {
        candidateList.sort((a, b) => b.skillScore - a.skillScore);
      } else if (sortBy === 'project') {
        candidateList.sort((a, b) => b.projectScore - a.projectScore);
      } else {
        // default overallScore
        candidateList.sort((a, b) => b.overallScore - a.overallScore);
      }

      // Assign rank
      const ranked = candidateList.map((c, index) => ({
        ...c,
        rank: index + 1,
      }));

      res.status(200).json({
        success: true,
        count: ranked.length,
        job: { id: job.id, title: job.title, company: job.company?.name },
        candidates: ranked,
      });
    } catch (error: any) {
      console.error('getJobCandidates error:', error);
      res.status(500).json({ success: false, message: 'Failed to retrieve candidate rankings.' });
    }
  }

  /**
   * Candidate Comparison (Side-by-side up to 5 candidates)
   */
  public static async compareCandidates(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { jobId, candidateIds } = req.body;

      if (!jobId || !Array.isArray(candidateIds) || candidateIds.length === 0) {
        res.status(400).json({ success: false, message: 'jobId and candidateIds array are required.' });
        return;
      }

      const targetIds = candidateIds.slice(0, 5);

      const job = await prisma.job.findUnique({
        where: { id: jobId },
        include: { company: true },
      });

      const matches = await prisma.candidateMatch.findMany({
        where: {
          jobId,
          candidateId: { in: targetIds },
        },
        include: {
          candidate: {
            include: {
              user: { select: { name: true, email: true, avatar: true } },
              resumes: { take: 1, orderBy: { createdAt: 'desc' } },
              skills: { include: { skill: true } },
              projects: true,
            },
          },
        },
      });

      const comparison = matches.map((m) => {
        const parsedResume = m.candidate.resumes[0]?.parsedData
          ? JSON.parse(m.candidate.resumes[0].parsedData)
          : null;

        return {
          id: m.candidate.id,
          name: m.candidate.user.name,
          avatar: m.candidate.user.avatar,
          title: m.candidate.title,
          overallScore: m.overallScore,
          categoryScores: {
            requiredSkills: m.skillScore,
            experience: m.experienceScore,
            projects: m.projectScore,
            education: m.educationScore,
          },
          experienceYears: m.candidate.experienceYears,
          skills: m.candidate.skills.map((s) => s.skill.name),
          projects: m.candidate.projects.map((p) => ({
            name: p.name,
            complexity: p.complexityAssessment,
          })),
          education: parsedResume?.education || [],
          evidence: m.evidence ? JSON.parse(m.evidence) : null,
          missingRequirements: m.missingRequirements ? JSON.parse(m.missingRequirements) : [],
          atsScore: m.candidate.resumes[0]?.atsScore || 85,
        };
      });

      res.status(200).json({
        success: true,
        job: { id: job?.id, title: job?.title, company: job?.company?.name },
        candidates: comparison,
      });
    } catch (error: any) {
      console.error('compareCandidates error:', error);
      res.status(500).json({ success: false, message: 'Failed to compare candidates.' });
    }
  }
}
