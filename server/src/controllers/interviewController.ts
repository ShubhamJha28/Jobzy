import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import prisma from '../config/prisma';

export class InterviewController {
  public static async scheduleInterview(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { applicationId, scheduledAt, interviewType, meetingLink, interviewer } = req.body;

      if (!applicationId || !scheduledAt) {
        res.status(400).json({ success: false, message: 'applicationId and scheduledAt are required.' });
        return;
      }

      const application = await prisma.application.findUnique({
        where: { id: applicationId },
        include: {
          candidate: { include: { user: true } },
          job: true,
        },
      });

      if (!application) {
        res.status(404).json({ success: false, message: 'Application not found.' });
        return;
      }

      const interview = await prisma.interview.create({
        data: {
          applicationId,
          scheduledAt: new Date(scheduledAt),
          interviewType: interviewType || 'TECHNICAL',
          meetingLink: meetingLink || 'https://meet.google.com/chh-mkmp-cqn',
          interviewer: interviewer || req.user?.name || 'Technical Team',
          status: 'SCHEDULED',
        },
      });

      // Update application stage to INTERVIEW_SCHEDULED
      await prisma.application.update({
        where: { id: applicationId },
        data: { status: 'INTERVIEW_SCHEDULED' },
      });

      // Add to history
      await prisma.applicationStatusHistory.create({
        data: {
          applicationId,
          previousStatus: application.status,
          newStatus: 'INTERVIEW_SCHEDULED',
          changedBy: req.user?.name || 'Recruiter',
          note: `${interviewType || 'Technical'} interview scheduled for ${new Date(scheduledAt).toLocaleString()}.`,
        },
      });

      // Notify candidate
      await prisma.notification.create({
        data: {
          userId: application.candidate.userId,
          title: 'Interview Scheduled!',
          message: `${interviewType || 'Technical'} interview scheduled with ${application.job.title} team for ${new Date(scheduledAt).toLocaleString()}.`,
          type: 'INTERVIEW',
          link: '/candidate/applications',
        },
      });

      res.status(201).json({ success: true, message: 'Interview scheduled successfully.', interview });
    } catch (error: any) {
      console.error('scheduleInterview error:', error);
      res.status(500).json({ success: false, message: 'Failed to schedule interview.' });
    }
  }

  public static async getInterviews(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      let interviews;
      if (req.user.role === 'CANDIDATE') {
        const profile = await prisma.candidateProfile.findUnique({ where: { userId: req.user.id } });
        interviews = await prisma.interview.findMany({
          where: { application: { candidateId: profile?.id } },
          include: {
            application: {
              include: {
                candidate: { include: { user: true } },
                job: { include: { company: true } },
              },
            },
          },
          orderBy: { scheduledAt: 'asc' },
        });
      } else {
        const recruiter = await prisma.recruiterProfile.findUnique({ where: { userId: req.user.id } });
        interviews = await prisma.interview.findMany({
          where: { application: { job: { recruiterId: recruiter?.id } } },
          include: {
            application: {
              include: {
                candidate: { include: { user: true } },
                job: true,
              },
            },
          },
          orderBy: { scheduledAt: 'asc' },
        });
      }

      res.status(200).json({ success: true, interviews });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to retrieve interviews.' });
    }
  }

  public static async updateInterview(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status, feedback, rating } = req.body;

      const updated = await prisma.interview.update({
        where: { id },
        data: {
          status: status || undefined,
          feedback: feedback || undefined,
          rating: rating ? parseInt(rating, 10) : undefined,
        },
      });

      res.status(200).json({ success: true, message: 'Interview updated.', interview: updated });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to update interview.' });
    }
  }
}
