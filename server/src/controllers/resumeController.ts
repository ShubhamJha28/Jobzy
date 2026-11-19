import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { ResumeParserService } from '../services/resumeParser';
import { backgroundQueue } from '../services/queueService';
import prisma from '../config/prisma';
import { logAudit } from '../utils/logger';

export class ResumeController {
  public static async uploadResume(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, message: 'Please provide a resume file (PDF, DOCX, TXT).' });
        return;
      }

      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      // Find or create candidate profile
      let profile = await prisma.candidateProfile.findUnique({
        where: { userId: req.user.id },
      });

      if (!profile) {
        profile = await prisma.candidateProfile.create({
          data: {
            userId: req.user.id,
            title: 'Software Professional',
          },
        });
      }

      const filePath = req.file.path;
      const originalFileName = req.file.originalname;

      // 1. Extract raw text
      const extractedText = await ResumeParserService.extractTextFromFile(filePath);

      // 2. Parse structured data & evaluate ATS score
      const parsedData = await ResumeParserService.parseResume(extractedText);

      // 3. Save to database
      const resume = await prisma.resume.create({
        data: {
          candidateId: profile.id,
          originalFileName,
          filePath,
          fileType: req.file.mimetype,
          extractedText,
          parsedData: JSON.stringify(parsedData),
          atsScore: parsedData.atsScore,
          isPrimary: true,
        },
      });

      // 4. Update candidate profile with extracted contact/experience info
      await prisma.candidateProfile.update({
        where: { id: profile.id },
        data: {
          phone: parsedData.personal.phone || profile.phone,
          location: parsedData.personal.location || profile.location,
          linkedinUrl: parsedData.personal.linkedin || profile.linkedinUrl,
          githubUrl: parsedData.personal.github || profile.githubUrl,
          experienceYears: parsedData.totalExperienceYears || profile.experienceYears,
          extractedProfile: JSON.stringify({
            summary: parsedData.summary,
            skills: parsedData.skills,
            education: parsedData.education,
          }),
        },
      });

      // 5. Link detected skills to candidate skills
      for (const skillName of parsedData.skills) {
        let skillRecord = await prisma.skill.findUnique({ where: { name: skillName } });
        if (!skillRecord) {
          skillRecord = await prisma.skill.create({
            data: { name: skillName, category: 'TECHNICAL' },
          });
        }

        await prisma.candidateSkill.upsert({
          where: {
            candidateId_skillId: {
              candidateId: profile.id,
              skillId: skillRecord.id,
            },
          },
          update: {},
          create: {
            candidateId: profile.id,
            skillId: skillRecord.id,
            proficiencyEstimate: 'INTERMEDIATE',
            experienceMonths: Math.round((parsedData.totalExperienceYears || 1) * 12),
            evidence: `Extracted from resume ${originalFileName}`,
          },
        });
      }

      await logAudit({
        userId: req.user.id,
        action: 'RESUME_UPLOADED',
        resource: 'RESUME',
        details: { resumeId: resume.id, atsScore: parsedData.atsScore },
      });

      res.status(201).json({
        success: true,
        message: 'Resume uploaded and parsed successfully.',
        resume: {
          id: resume.id,
          originalFileName: resume.originalFileName,
          atsScore: resume.atsScore,
          parsedData,
          createdAt: resume.createdAt,
        },
      });
    } catch (error: any) {
      console.error('Upload resume error:', error);
      res.status(500).json({ success: false, message: error.message || 'Failed to upload and parse resume.' });
    }
  }

  public static async bulkUpload(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const files = req.files as Express.Multer.File[];
      const { jobId } = req.body;

      if (!files || files.length === 0) {
        res.status(400).json({ success: false, message: 'Please upload at least one resume file.' });
        return;
      }

      if (!jobId) {
        res.status(400).json({ success: false, message: 'target jobId is required for bulk screening.' });
        return;
      }

      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      // Initiate batch in background queue
      const batchJobId = backgroundQueue.createBatchJob(files.length);

      // Trigger background processing asynchronously without blocking response
      backgroundQueue.processBatchFiles(batchJobId, files, jobId, req.user.id).catch((err) => {
        console.error('Batch background processing error:', err);
      });

      res.status(202).json({
        success: true,
        message: `Bulk processing queued for ${files.length} resumes.`,
        batchJobId,
        totalFiles: files.length,
      });
    } catch (error: any) {
      console.error('Bulk upload error:', error);
      res.status(500).json({ success: false, message: 'Failed to initiate bulk screening.' });
    }
  }

  public static async getBatchStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { batchId } = req.params;
      const status = backgroundQueue.getJobStatus(batchId);

      if (!status) {
        res.status(404).json({ success: false, message: 'Batch task not found.' });
        return;
      }

      res.status(200).json({ success: true, batch: status });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to get batch status.' });
    }
  }

  public static async getResumes(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const profile = await prisma.candidateProfile.findUnique({
        where: { userId: req.user.id },
      });

      if (!profile) {
        res.status(200).json({ success: true, resumes: [] });
        return;
      }

      const resumes = await prisma.resume.findMany({
        where: { candidateId: profile.id },
        orderBy: { createdAt: 'desc' },
      });

      res.status(200).json({ success: true, resumes });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to retrieve resumes.' });
    }
  }

  public static async getResumeById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const resume = await prisma.resume.findUnique({
        where: { id },
        include: {
          candidate: {
            include: { user: { select: { name: true, email: true, avatar: true } } },
          },
        },
      });

      if (!resume) {
        res.status(404).json({ success: false, message: 'Resume not found.' });
        return;
      }

      res.status(200).json({ success: true, resume });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to retrieve resume details.' });
    }
  }

  public static async deleteResume(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await prisma.resume.delete({ where: { id } });
      res.status(200).json({ success: true, message: 'Resume deleted successfully.' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to delete resume.' });
    }
  }
}
