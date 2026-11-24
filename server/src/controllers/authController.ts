import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
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

      // Password security policy
      const hasMinLength = password.length >= 8;
      const hasUppercase = /[A-Z]/.test(password);
      const hasLowercase = /[a-z]/.test(password);
      const hasNumber = /[0-9]/.test(password);
      const hasSpecial = /[!@#$%^&*`~()_+\-=[\]{};':"\\|,.<>/?]/.test(password);

      if (!hasMinLength || !hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
        res.status(400).json({
          success: false,
          message:
            'Password must be at least 8 characters long and contain at least one uppercase letter (A–Z), one lowercase letter (a–z), one number (0–9), and one special character (!@#$%^&*).',
        });
        return;
      }

      const normalizedEmail = email.trim().toLowerCase();

      const existingUser = await prisma.user.findFirst({
        where: { email: { equals: normalizedEmail, mode: 'insensitive' } },
      });
      if (existingUser) {
        res.status(409).json({ success: false, message: 'An account with this email already exists. Please sign in instead.' });
        return;
      }

      const validRoles = ['CANDIDATE', 'RECRUITER', 'ADMIN'];
      const userRole = validRoles.includes(role?.toUpperCase()) ? role.toUpperCase() : 'CANDIDATE';

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          name: name.trim(),
          passwordHash,
          role: userRole,
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim())}&backgroundColor=111111&textColor=c4f167`,
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

      const normalizedEmail = email.trim().toLowerCase();

      const user = await prisma.user.findFirst({
        where: { email: { equals: normalizedEmail, mode: 'insensitive' } },
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

  public static async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      if (!email) {
        res.status(400).json({ success: false, message: 'Email address is required.' });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { email: email.trim().toLowerCase() },
      });

      if (!user) {
        res.status(404).json({ success: false, message: 'No registered account found with this email address.' });
        return;
      }

      // Generate a signed password-reset token valid for 15 minutes
      const resetToken = jwt.sign(
        { id: user.id, email: user.email, type: 'password_reset' },
        process.env.JWT_SECRET || 'jobzy_jwt_secret_enterprise_grade_security_key_2026',
        { expiresIn: '15m' }
      );

      res.status(200).json({
        success: true,
        message: 'Account verified. You may now choose your new password.',
        resetToken,
        email: user.email,
      });
    } catch (error: any) {
      console.error('forgotPassword error:', error);
      res.status(500).json({ success: false, message: 'Failed to process password reset request.' });
    }
  }

  public static async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { resetToken, newPassword } = req.body;

      if (!resetToken || !newPassword) {
        res.status(400).json({ success: false, message: 'Reset token and new password are required.' });
        return;
      }

      let decoded: any;
      try {
        decoded = jwt.verify(
          resetToken,
          process.env.JWT_SECRET || 'jobzy_jwt_secret_enterprise_grade_security_key_2026'
        );
      } catch (err: any) {
        res.status(401).json({ success: false, message: 'Reset session has expired or is invalid. Please request a new one.' });
        return;
      }

      if (decoded.type !== 'password_reset' || !decoded.id) {
        res.status(401).json({ success: false, message: 'Invalid reset token.' });
        return;
      }

      // Enforce the 5 password security criteria
      const hasMinLength = newPassword.length >= 8;
      const hasUppercase = /[A-Z]/.test(newPassword);
      const hasLowercase = /[a-z]/.test(newPassword);
      const hasNumber = /[0-9]/.test(newPassword);
      const hasSpecial = /[!@#$%^&*`~()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword);

      if (!hasMinLength || !hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
        res.status(400).json({
          success: false,
          message:
            'Password must be at least 8 characters long and contain at least one uppercase letter (A–Z), one lowercase letter (a–z), one number (0–9), and one special character (!@#$%^&*).',
        });
        return;
      }

      const passwordHash = await bcrypt.hash(newPassword, 10);

      await prisma.user.update({
        where: { id: decoded.id },
        data: { passwordHash },
      });

      await logAudit({
        userId: decoded.id,
        action: 'PASSWORD_RESET',
        resource: 'USER',
        details: { email: decoded.email },
      });

      res.status(200).json({
        success: true,
        message: 'Your password has been reset successfully. Please log in with your new password.',
      });
    } catch (error: any) {
      console.error('resetPassword error:', error);
      res.status(500).json({ success: false, message: 'Failed to reset password.' });
    }
  }
}
