import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { MatchingEngineService } from '../services/matchingEngine';
import prisma from '../config/prisma';

export class CandidateController {
  public static async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const profile = await prisma.candidateProfile.findUnique({
        where: { userId: req.user.id },
        include: {
          skills: { include: { skill: true } },
          projects: true,
          resumes: { orderBy: { createdAt: 'desc' } },
        },
      });

      res.status(200).json({ success: true, profile });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to retrieve profile.' });
    }
  }

  public static async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const { phone, location, title, bio, linkedinUrl, githubUrl, portfolioUrl, experienceYears } = req.body;

      const profile = await prisma.candidateProfile.update({
        where: { userId: req.user.id },
        data: {
          phone,
          location,
          title,
          bio,
          linkedinUrl,
          githubUrl,
          portfolioUrl,
          experienceYears: experienceYears ? parseFloat(experienceYears) : undefined,
        },
      });

      res.status(200).json({ success: true, message: 'Profile updated successfully.', profile });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to update profile.' });
    }
  }

  public static async getRecommendations(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const profile = await prisma.candidateProfile.findUnique({
        where: { userId: req.user.id },
        include: {
          resumes: { take: 1, orderBy: { createdAt: 'desc' } },
          skills: { include: { skill: true } },
        },
      });

      if (!profile || profile.resumes.length === 0) {
        // Return latest jobs with 0 score
        const jobs = await prisma.job.findMany({
          where: { status: 'PUBLISHED' },
          include: { company: true },
          take: 6,
        });
        res.status(200).json({
          success: true,
          recommendations: jobs.map((j) => ({ job: j, matchScore: 70, matchedSkills: [] })),
        });
        return;
      }

      const latestResume = profile.resumes[0];
      const parsedResume = latestResume.parsedData ? JSON.parse(latestResume.parsedData) : null;

      const allJobs = await prisma.job.findMany({
        where: { status: 'PUBLISHED' },
        include: { company: true },
      });

      const scoredRecommendations = allJobs.map((job) => {
        let matchScore = 75;
        let matchedSkills: string[] = [];
        let missingSkills: string[] = [];

        if (parsedResume) {
          const evalResult = MatchingEngineService.evaluateMatch(parsedResume, {
            requiredSkills: job.requiredSkills ? JSON.parse(job.requiredSkills) : [],
            preferredSkills: job.preferredSkills ? JSON.parse(job.preferredSkills) : [],
            minimumExperience: job.minimumExperience,
            title: job.title,
          });
          matchScore = evalResult.overallScore;
          matchedSkills = evalResult.matchedSkills;
          missingSkills = evalResult.missingMandatorySkills;
        }

        return {
          job,
          matchScore,
          matchedSkills,
          missingSkills,
        };
      });

      scoredRecommendations.sort((a, b) => b.matchScore - a.matchScore);

      res.status(200).json({ success: true, recommendations: scoredRecommendations });
    } catch (error: any) {
      console.error('getRecommendations error:', error);
      res.status(500).json({ success: false, message: 'Failed to retrieve recommendations.' });
    }
  }

  public static async getDashboardStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const profile = await prisma.candidateProfile.findUnique({
        where: { userId: req.user.id },
        include: {
          applications: true,
          resumes: { orderBy: { createdAt: 'desc' } },
          analyses: { orderBy: { createdAt: 'desc' }, take: 5, include: { job: { include: { company: true } } } },
          skills: { include: { skill: true } },
        },
      });

      if (!profile) {
        res.status(200).json({
          success: true,
          stats: {
            totalApplications: 0,
            underReview: 0,
            shortlisted: 0,
            interviews: 0,
            offers: 0,
            totalResumes: 0,
            avgAtsScore: 0,
            detectedSkillsCount: 0,
            recentAnalyses: [],
          },
        });
        return;
      }

      const apps = profile.applications;
      const totalApplications = apps.length;
      const underReview = apps.filter((a) => a.status === 'UNDER_REVIEW').length;
      const shortlisted = apps.filter((a) => a.status === 'SHORTLISTED').length;
      const interviews = apps.filter((a) => a.status === 'INTERVIEW_SCHEDULED' || a.status === 'INTERVIEW_COMPLETED').length;
      const offers = apps.filter((a) => a.status === 'OFFER_EXTENDED' || a.status === 'HIRED').length;

      const totalResumes = profile.resumes.length;
      const avgAtsScore = totalResumes > 0
        ? Math.round(profile.resumes.reduce((acc, r) => acc + (r.atsScore || 0), 0) / totalResumes)
        : 0;

      res.status(200).json({
        success: true,
        stats: {
          totalApplications,
          underReview,
          shortlisted,
          interviews,
          offers,
          totalResumes,
          avgAtsScore,
          detectedSkillsCount: profile.skills.length,
          skills: profile.skills.map((s) => s.skill.name),
          recentAnalyses: profile.analyses,
        },
      });
    } catch (error: any) {
      console.error('getDashboardStats error:', error);
      res.status(500).json({ success: false, message: 'Failed to retrieve candidate dashboard statistics.' });
    }
  }
}
