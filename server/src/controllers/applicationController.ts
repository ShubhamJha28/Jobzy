import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import prisma from '../config/prisma';
import { logAudit } from '../utils/logger';

export class ApplicationController {
  public static async applyForJob(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { jobId, resumeId, coverLetter } = req.body;

      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const profile = await prisma.candidateProfile.findUnique({
        where: { userId: req.user.id },
      });

      if (!profile) {
        res.status(403).json({ success: false, message: 'Only registered candidates can apply.' });
        return;
      }

      const existing = await prisma.application.findUnique({
        where: { candidateId_jobId: { candidateId: profile.id, jobId } },
      });

      if (existing) {
        res.status(409).json({ success: false, message: 'You have already applied for this position.' });
        return;
      }

      const job = await prisma.job.findUnique({
        where: { id: jobId },
        include: { recruiter: { select: { userId: true } } },
      });

      if (!job) {
        res.status(404).json({ success: false, message: 'Job not found.' });
        return;
      }

      // Create application
      const application = await prisma.application.create({
        data: {
          candidateId: profile.id,
          jobId,
          resumeId: resumeId || null,
          coverLetter,
          status: 'APPLIED',
        },
      });

      // Add status history
      await prisma.applicationStatusHistory.create({
        data: {
          applicationId: application.id,
          newStatus: 'APPLIED',
          changedBy: req.user.name,
          note: 'Application submitted by candidate.',
        },
      });

      // Send in-app notification to recruiter
      if (job.recruiter?.userId) {
        await prisma.notification.create({
          data: {
            userId: job.recruiter.userId,
            title: 'New Applicant Received',
            message: `${req.user.name} applied for "${job.title}".`,
            type: 'APPLICATION',
            link: `/recruiter/jobs/${job.id}/applicants`,
          },
        });
      }

      // Notify candidate
      await prisma.notification.create({
        data: {
          userId: req.user.id,
          title: 'Application Submitted',
          message: `Your application for "${job.title}" has been successfully submitted.`,
          type: 'APPLICATION',
          link: '/candidate/applications',
        },
      });

      await logAudit({
        userId: req.user.id,
        action: 'JOB_APPLIED',
        resource: 'APPLICATION',
        details: { applicationId: application.id, jobId },
      });

      res.status(201).json({
        success: true,
        message: 'Application submitted successfully.',
        application,
      });
    } catch (error: any) {
      console.error('applyForJob error:', error);
      res.status(500).json({ success: false, message: 'Failed to submit application.' });
    }
  }

  public static async getMyApplications(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const profile = await prisma.candidateProfile.findUnique({
        where: { userId: req.user.id },
      });

      if (!profile) {
        res.status(200).json({ success: true, applications: [] });
        return;
      }

      const applications = await prisma.application.findMany({
        where: { candidateId: profile.id },
        include: {
          job: {
            include: { company: true },
          },
          resume: true,
          statusHistory: { orderBy: { createdAt: 'desc' } },
          interviews: { orderBy: { scheduledAt: 'asc' } },
        },
        orderBy: { appliedAt: 'desc' },
      });

      res.status(200).json({ success: true, applications });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to retrieve applications.' });
    }
  }

  public static async updateApplicationStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status, note } = req.body;

      const app = await prisma.application.findUnique({
        where: { id },
        include: {
          candidate: { include: { user: true } },
          job: true,
        },
      });

      if (!app) {
        res.status(404).json({ success: false, message: 'Application not found.' });
        return;
      }

      const previousStatus = app.status;

      const updated = await prisma.application.update({
        where: { id },
        data: { status, updatedAt: new Date() },
      });

      // Record in status history
      await prisma.applicationStatusHistory.create({
        data: {
          applicationId: id,
          previousStatus,
          newStatus: status,
          changedBy: req.user?.name || 'Recruiter',
          note: note || `Status updated from ${previousStatus} to ${status}.`,
        },
      });

      // Send notification to candidate
      await prisma.notification.create({
        data: {
          userId: app.candidate.userId,
          title: `Application Status Updated: ${status.replace('_', ' ')}`,
          message: `Your application for "${app.job.title}" is now: ${status.replace('_', ' ')}.`,
          type: status === 'OFFER_EXTENDED' ? 'OFFER' : status === 'SHORTLISTED' ? 'SHORTLIST' : 'INFO',
          link: '/candidate/applications',
        },
      });

      res.status(200).json({
        success: true,
        message: `Status updated to ${status}.`,
        application: updated,
      });
    } catch (error: any) {
      console.error('updateApplicationStatus error:', error);
      res.status(500).json({ success: false, message: 'Failed to update application status.' });
    }
  }
}
