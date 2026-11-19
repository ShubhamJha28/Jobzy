import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import prisma from '../config/prisma';

export class ShortlistController {
  public static async toggleShortlist(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { jobId, candidateId, notes } = req.body;

      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const recruiter = await prisma.recruiterProfile.findUnique({
        where: { userId: req.user.id },
      });

      if (!recruiter) {
        res.status(403).json({ success: false, message: 'Only recruiters can manage shortlists.' });
        return;
      }

      const existing = await prisma.shortlist.findUnique({
        where: { jobId_candidateId: { jobId, candidateId } },
      });

      if (existing) {
        await prisma.shortlist.delete({
          where: { id: existing.id },
        });
        res.status(200).json({ success: true, isShortlisted: false, message: 'Removed from shortlist.' });
      } else {
        const created = await prisma.shortlist.create({
          data: {
            recruiterId: recruiter.id,
            jobId,
            candidateId,
            notes: notes || 'Shortlisted based on AI compatibility score and project experience.',
          },
        });

        // Also update application status to SHORTLISTED if application exists
        await prisma.application.updateMany({
          where: { jobId, candidateId },
          data: { status: 'SHORTLISTED' },
        });

        res.status(201).json({ success: true, isShortlisted: true, message: 'Added to shortlist.', shortlist: created });
      }
    } catch (error: any) {
      console.error('toggleShortlist error:', error);
      res.status(500).json({ success: false, message: 'Failed to update shortlist.' });
    }
  }

  public static async getShortlists(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { jobId } = req.params;
      const shortlists = await prisma.shortlist.findMany({
        where: { jobId },
        include: {
          candidate: {
            include: {
              user: { select: { id: true, name: true, email: true, avatar: true } },
              resumes: { take: 1, orderBy: { createdAt: 'desc' } },
              skills: { include: { skill: true } },
            },
          },
        },
      });

      res.status(200).json({ success: true, shortlists });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to retrieve shortlist.' });
    }
  }
}
