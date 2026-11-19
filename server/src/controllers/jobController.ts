import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { JobParserService } from '../services/jobParser';
import prisma from '../config/prisma';
import { logAudit } from '../utils/logger';

export class JobController {
  public static async getJobs(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { search, remote, type, status, location } = req.query;

      const where: any = {};
      if (status) {
        where.status = String(status);
      } else {
        where.status = 'PUBLISHED';
      }

      if (remote === 'true') {
        where.isRemote = true;
      }

      if (type) {
        where.employmentType = String(type);
      }

      if (location) {
        where.location = { contains: String(location) };
      }

      if (search) {
        where.OR = [
          { title: { contains: String(search) } },
          { description: { contains: String(search) } },
        ];
      }

      const jobs = await prisma.job.findMany({
        where,
        include: {
          company: true,
          _count: {
            select: { applications: true, matches: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.status(200).json({ success: true, count: jobs.length, jobs });
    } catch (error: any) {
      console.error('getJobs error:', error);
      res.status(500).json({ success: false, message: 'Failed to retrieve job listings.' });
    }
  }

  public static async getJobById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const job = await prisma.job.findUnique({
        where: { id },
        include: {
          company: true,
          recruiter: {
            include: { user: { select: { name: true, email: true, avatar: true } } },
          },
          requirements: {
            include: { skill: true },
          },
          _count: {
            select: { applications: true, matches: true },
          },
        },
      });

      if (!job) {
        res.status(404).json({ success: false, message: 'Job not found.' });
        return;
      }

      // If user is candidate, check if they have applied or have a match record
      let userMatch = null;
      let userApplication = null;

      if (req.user && req.user.role === 'CANDIDATE') {
        const profile = await prisma.candidateProfile.findUnique({ where: { userId: req.user.id } });
        if (profile) {
          userMatch = await prisma.candidateMatch.findUnique({
            where: { candidateId_jobId: { candidateId: profile.id, jobId: id } },
          });
          userApplication = await prisma.application.findUnique({
            where: { candidateId_jobId: { candidateId: profile.id, jobId: id } },
          });
        }
      }

      res.status(200).json({ success: true, job, userMatch, userApplication });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to retrieve job details.' });
    }
  }

  public static async parseJobDescription(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { text } = req.body;
      if (!text || text.trim().length < 20) {
        res.status(400).json({ success: false, message: 'Please provide substantive job description text.' });
        return;
      }

      const parsed = JobParserService.parseJobDescription(text);
      res.status(200).json({ success: true, parsed });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to parse job description.' });
    }
  }

  public static async createJob(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const recruiter = await prisma.recruiterProfile.findUnique({
        where: { userId: req.user.id },
      });

      if (!recruiter) {
        res.status(403).json({ success: false, message: 'Only registered recruiters can create jobs.' });
        return;
      }

      const {
        title,
        description,
        responsibilities,
        requiredSkills,
        preferredSkills,
        minimumExperience,
        maximumExperience,
        qualifications,
        location,
        employmentType,
        isRemote,
        salaryMin,
        salaryMax,
        currency,
        weightsConfig,
      } = req.body;

      if (!title || !description) {
        res.status(400).json({ success: false, message: 'Job title and description are required.' });
        return;
      }

      const job = await prisma.job.create({
        data: {
          recruiterId: recruiter.id,
          companyId: recruiter.companyId,
          title,
          description,
          responsibilities: Array.isArray(responsibilities) ? JSON.stringify(responsibilities) : responsibilities,
          requiredSkills: Array.isArray(requiredSkills) ? JSON.stringify(requiredSkills) : requiredSkills,
          preferredSkills: Array.isArray(preferredSkills) ? JSON.stringify(preferredSkills) : preferredSkills,
          minimumExperience: parseFloat(minimumExperience) || 0,
          maximumExperience: maximumExperience ? parseFloat(maximumExperience) : null,
          qualifications,
          location: location || 'Remote',
          employmentType: employmentType || 'FULL_TIME',
          isRemote: Boolean(isRemote),
          salaryMin: salaryMin ? parseInt(salaryMin, 10) : null,
          salaryMax: salaryMax ? parseInt(salaryMax, 10) : null,
          currency: currency || 'USD',
          weightsConfig: weightsConfig ? JSON.stringify(weightsConfig) : null,
          status: 'PUBLISHED',
        },
      });

      // Attach requirements
      const skillsToAttach = Array.isArray(requiredSkills) ? requiredSkills : [];
      for (const skName of skillsToAttach) {
        let skill = await prisma.skill.findUnique({ where: { name: skName } });
        if (!skill) {
          skill = await prisma.skill.create({ data: { name: skName } });
        }
        await prisma.jobRequirement.create({
          data: {
            jobId: job.id,
            skillId: skill.id,
            importance: 'MANDATORY',
          },
        });
      }

      await logAudit({
        userId: req.user.id,
        action: 'JOB_CREATED',
        resource: 'JOB',
        details: { jobId: job.id, title: job.title },
      });

      res.status(201).json({ success: true, message: 'Job created successfully.', job });
    } catch (error: any) {
      console.error('Create job error:', error);
      res.status(500).json({ success: false, message: 'Failed to create job opening.' });
    }
  }

  public static async updateJob(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data = { ...req.body };

      if (data.requiredSkills && Array.isArray(data.requiredSkills)) {
        data.requiredSkills = JSON.stringify(data.requiredSkills);
      }
      if (data.preferredSkills && Array.isArray(data.preferredSkills)) {
        data.preferredSkills = JSON.stringify(data.preferredSkills);
      }
      if (data.responsibilities && Array.isArray(data.responsibilities)) {
        data.responsibilities = JSON.stringify(data.responsibilities);
      }

      const updated = await prisma.job.update({
        where: { id },
        data,
      });

      res.status(200).json({ success: true, message: 'Job updated.', job: updated });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to update job.' });
    }
  }

  public static async deleteJob(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await prisma.job.delete({ where: { id } });
      res.status(200).json({ success: true, message: 'Job deleted.' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to delete job.' });
    }
  }
}
