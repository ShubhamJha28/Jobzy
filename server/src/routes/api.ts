import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';
import { uploadSingleResume, uploadBulkResumes } from '../middleware/upload';

import { AuthController } from '../controllers/authController';
import { ResumeController } from '../controllers/resumeController';
import { JobController } from '../controllers/jobController';
import { MatchingController } from '../controllers/matchingController';
import { ApplicationController } from '../controllers/applicationController';
import { ShortlistController } from '../controllers/shortlistController';
import { InterviewController } from '../controllers/interviewController';
import { OptimizerController } from '../controllers/optimizerController';
import { CandidateController } from '../controllers/candidateController';
import { RecruiterController } from '../controllers/recruiterController';
import { NotificationController } from '../controllers/notificationController';
import { AdminController } from '../controllers/adminController';

const router = Router();

// ==================== AUTH ====================
router.post('/auth/register', AuthController.register);
router.post('/auth/login', AuthController.login);
router.post('/auth/forgot-password', AuthController.forgotPassword);
router.post('/auth/reset-password', AuthController.resetPassword);
router.get('/auth/me', authenticateToken, AuthController.getMe);

// ==================== RESUMES ====================
router.post('/resumes/upload', authenticateToken, uploadSingleResume, ResumeController.uploadResume);
router.post('/resumes/bulk-upload', authenticateToken, requireRole(['RECRUITER', 'ADMIN']), uploadBulkResumes, ResumeController.bulkUpload);
router.get('/resumes/batch/:batchId', authenticateToken, ResumeController.getBatchStatus);
router.get('/resumes', authenticateToken, ResumeController.getResumes);
router.get('/resumes/:id', authenticateToken, ResumeController.getResumeById);
router.delete('/resumes/:id', authenticateToken, ResumeController.deleteResume);

// ==================== JOBS ====================
router.get('/jobs', JobController.getJobs);
router.get('/jobs/:id', JobController.getJobById);
router.post('/jobs/parse-jd', authenticateToken, requireRole(['RECRUITER', 'ADMIN']), JobController.parseJobDescription);
router.post('/jobs', authenticateToken, requireRole(['RECRUITER', 'ADMIN']), JobController.createJob);
router.put('/jobs/:id', authenticateToken, requireRole(['RECRUITER', 'ADMIN']), JobController.updateJob);
router.delete('/jobs/:id', authenticateToken, requireRole(['RECRUITER', 'ADMIN']), JobController.deleteJob);

// ==================== MATCHING & RANKING ====================
router.post('/matching/analyze', authenticateToken, MatchingController.analyzeCandidateVsJob);
router.get('/matching/:jobId/candidates', authenticateToken, requireRole(['RECRUITER', 'ADMIN']), MatchingController.getJobCandidates);
router.post('/matching/compare', authenticateToken, requireRole(['RECRUITER', 'ADMIN']), MatchingController.compareCandidates);

// ==================== APPLICATIONS ====================
router.post('/applications', authenticateToken, requireRole(['CANDIDATE']), ApplicationController.applyForJob);
router.get('/applications/my', authenticateToken, requireRole(['CANDIDATE']), ApplicationController.getMyApplications);
router.patch('/applications/:id/status', authenticateToken, requireRole(['RECRUITER', 'ADMIN']), ApplicationController.updateApplicationStatus);

// ==================== SHORTLISTS ====================
router.post('/shortlists/toggle', authenticateToken, requireRole(['RECRUITER', 'ADMIN']), ShortlistController.toggleShortlist);
router.get('/shortlists/:jobId', authenticateToken, requireRole(['RECRUITER', 'ADMIN']), ShortlistController.getShortlists);

// ==================== INTERVIEWS ====================
router.post('/interviews', authenticateToken, requireRole(['RECRUITER', 'ADMIN']), InterviewController.scheduleInterview);
router.get('/interviews', authenticateToken, InterviewController.getInterviews);
router.put('/interviews/:id', authenticateToken, InterviewController.updateInterview);

// ==================== AI OPTIMIZER ====================
router.post('/optimizer/rewrite-bullet', authenticateToken, OptimizerController.rewriteBullet);
router.post('/optimizer/optimize-summary', authenticateToken, OptimizerController.optimizeSummary);
router.get('/optimizer/recommendations/:resumeId', authenticateToken, OptimizerController.getRecommendations);
router.patch('/optimizer/recommendations/:id/status', authenticateToken, OptimizerController.updateRecommendationStatus);

// ==================== CANDIDATE ====================
router.get('/candidates/profile', authenticateToken, CandidateController.getProfile);
router.put('/candidates/profile', authenticateToken, CandidateController.updateProfile);
router.get('/candidates/recommendations', authenticateToken, CandidateController.getRecommendations);
router.get('/candidates/dashboard-stats', authenticateToken, CandidateController.getDashboardStats);

// ==================== RECRUITER ====================
router.get('/recruiters/dashboard-stats', authenticateToken, requireRole(['RECRUITER', 'ADMIN']), RecruiterController.getDashboardStats);
router.get('/recruiters/analytics', authenticateToken, requireRole(['RECRUITER', 'ADMIN']), RecruiterController.getAnalytics);

// ==================== NOTIFICATIONS ====================
router.get('/notifications', authenticateToken, NotificationController.getNotifications);
router.patch('/notifications/:id/read', authenticateToken, NotificationController.markAsRead);

// ==================== ADMIN ====================
router.get('/admin/stats', authenticateToken, requireRole(['ADMIN']), AdminController.getSystemStats);
router.get('/admin/users', authenticateToken, requireRole(['ADMIN']), AdminController.getUsers);
router.patch('/admin/users/:id/role', authenticateToken, requireRole(['ADMIN']), AdminController.updateUserRole);
router.get('/admin/logs', authenticateToken, requireRole(['ADMIN']), AdminController.getAuditLogs);
router.post('/admin/impersonate', authenticateToken, requireRole(['ADMIN']), AdminController.impersonateUser);

export default router;
