import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import prisma from '../config/prisma';

export class AdminController {
  public static async getSystemStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const totalUsers = await prisma.user.count();
      const totalCandidates = await prisma.user.count({ where: { role: 'CANDIDATE' } });
      const totalRecruiters = await prisma.user.count({ where: { role: 'RECRUITER' } });
      const totalCompanies = await prisma.company.count();
      const totalJobs = await prisma.job.count();
      const totalApplications = await prisma.application.count();
      const totalResumes = await prisma.resume.count();
      const totalInterviews = await prisma.interview.count();

      const memoryUsage = process.memoryUsage();

      res.status(200).json({
        success: true,
        stats: {
          totalUsers,
          totalCandidates,
          totalRecruiters,
          totalCompanies,
          totalJobs,
          totalApplications,
          totalResumes,
          totalInterviews,
          systemHealth: {
            status: 'HEALTHY',
            uptimeSeconds: Math.round(process.uptime()),
            memoryRssMB: Math.round(memoryUsage.rss / (1024 * 1024)),
            heapUsedMB: Math.round(memoryUsage.heapUsed / (1024 * 1024)),
            nodeVersion: process.version,
            dbProvider: 'SQLite / Prisma ORM',
          },
        },
      });
    } catch (error: any) {
      console.error('Admin getSystemStats error:', error);
      res.status(500).json({ success: false, message: 'Failed to retrieve admin statistics.' });
    }
  }

  public static async getUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { role, search } = req.query;

      const where: any = {};
      if (role && role !== 'ALL') {
        where.role = String(role);
      }
      if (search) {
        where.OR = [
          { name: { contains: String(search) } },
          { email: { contains: String(search) } },
        ];
      }

      const users = await prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatar: true,
          createdAt: true,
          candidateProfile: { select: { id: true, title: true, experienceYears: true } },
          recruiterProfile: { select: { id: true, designation: true, company: { select: { name: true } } } },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.status(200).json({ success: true, count: users.length, users });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to retrieve users.' });
    }
  }

  public static async updateUserRole(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { role } = req.body;

      const updated = await prisma.user.update({
        where: { id },
        data: { role },
      });

      res.status(200).json({ success: true, message: `User role updated to ${role}.`, user: updated });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to update user role.' });
    }
  }

  public static async getAuditLogs(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const logs = await prisma.auditLog.findMany({
        take: 50,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, email: true, role: true } } },
      });

      res.status(200).json({ success: true, logs });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to retrieve audit logs.' });
    }
  }
}
