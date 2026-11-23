import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/prisma';
import { signToken, AuthenticatedRequest } from '../middleware/auth';
import { logAudit } from '../utils/logger';

export class AuthController {
  public static async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, name, role, companyName, designation, phone, location } = req.body;

      if (!email || !password || !name) {
        res.status(400).json({ success: false, message: 'Email, password, and name are required.' });
        return;
      }

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        res.status(409).json({ success: false, message: 'An account with this email already exists.' });
        return;
      }

      const validRoles = ['CANDIDATE', 'RECRUITER', 'ADMIN'];
      const userRole = validRoles.includes(role?.toUpperCase()) ? role.toUpperCase() : 'CANDIDATE';

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          email,
          name,
          passwordHash,
          role: userRole,
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=111111&textColor=c4f167`,
        },
      });

      // Role specific profile creation
      if (userRole === 'RECRUITER') {
        let company = null;
        if (companyName) {
          company = await prisma.company.create({
            data: {
              name: companyName,
              location: location || 'Remote',
              industry: 'Technology & Software',
            },
          });
        }

        await prisma.recruiterProfile.create({
          data: {
            userId: user.id,
            companyId: company ? company.id : null,
            designation: designation || 'Technical Recruiter',
            department: 'Talent Acquisition',
          },
        });
      } else if (userRole === 'CANDIDATE') {
        await prisma.candidateProfile.create({
          data: {
            userId: user.id,
            phone,
            location,
            title: 'Software Professional',
            experienceYears: 0,
          },
        });
      }

      const token = signToken({ id: user.id, email: user.email, role: user.role, name: user.name });

      await logAudit({
        userId: user.id,
        action: 'USER_REGISTERED',
        resource: 'AUTH',
        details: { role: user.role, email: user.email },
      });

      res.status(201).json({
        success: true,
        message: 'Account registered successfully.',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        },
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      res.status(500).json({ success: false, message: 'Internal server error during registration.' });
    }
  }

  public static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, role } = req.body;

      if (!email || !password) {
        res.status(400).json({ success: false, message: 'Email and password are required.' });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          candidateProfile: true,
          recruiterProfile: {
            include: { company: true },
          },
        },
      });

      if (!user) {
        res.status(401).json({ success: false, message: 'Invalid email or password.' });
        return;
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        res.status(401).json({ success: false, message: 'Invalid email or password.' });
        return;
      }

      // Role differentiation check
      if (role && user.role !== 'ADMIN') {
        const expectedRole = (role as string).toUpperCase();
        if (user.role !== expectedRole) {
          const actualRoleLabel = user.role === 'RECRUITER' ? 'Recruiter' : 'Candidate';
          res.status(403).json({
            success: false,
            message: `This account is registered as a ${actualRoleLabel}. Please switch to ${actualRoleLabel} Login.`,
          });
          return;
        }
      }

      const token = signToken({ id: user.id, email: user.email, role: user.role, name: user.name });

      await logAudit({
        userId: user.id,
        action: 'USER_LOGIN',
        resource: 'AUTH',
        details: { loginRole: role || user.role, userRole: user.role },
      });

      res.status(200).json({
        success: true,
        message: 'Logged in successfully.',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          candidateProfile: user.candidateProfile,
          recruiterProfile: user.recruiterProfile,
        },
      });
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(500).json({ success: false, message: 'Internal server error during login.' });
    }
  }

  public static async getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          avatar: true,
          candidateProfile: {
            include: {
              skills: { include: { skill: true } },
              resumes: { orderBy: { createdAt: 'desc' } },
            },
          },
          recruiterProfile: {
            include: { company: true },
          },
        },
      });

      if (!user) {
        res.status(404).json({ success: false, message: 'User not found.' });
        return;
      }

      res.status(200).json({ success: true, user });
    } catch (error: any) {
      console.error('getMe error:', error);
      res.status(500).json({ success: false, message: 'Failed to retrieve profile.' });
    }
  }
}
