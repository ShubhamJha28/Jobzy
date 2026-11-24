import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { GradFlow } from 'gradflow';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { JobzyButton } from '../../components/JobzyButton';
import { JobzyLogo } from '../../components/JobzyLogo';
import { Modal } from '../../components/Modal';
import { apiRequest } from '../../api/client';
import {
  AlertCircle,
  Lock,
  Mail,
  Sparkles,
  ShieldCheck,
  User,
  Briefcase,
  CheckCircle2,
  Circle,
  Eye,
  EyeOff,
  KeyRound,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [hasAdminHash, setHasAdminHash] = useState<boolean>(() => {
    return window.location.hash.toLowerCase() === '#admin' || location.hash.toLowerCase() === '#admin';
  });

  useEffect(() => {
    const handleHash = () => {
      setHasAdminHash(window.location.hash.toLowerCase() === '#admin' || location.hash.toLowerCase() === '#admin');
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [location.hash]);

  const [role, setRole] = useState<'CANDIDATE' | 'RECRUITER'>(() => {
    const r = searchParams.get('role')?.toUpperCase();
    if (r === 'RECRUITER') return 'RECRUITER';
    return 'CANDIDATE';
  });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Forgot Password Modal State
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [resetStep, setResetStep] = useState<'EMAIL' | 'NEW_PASSWORD' | 'SUCCESS'>('EMAIL');
  const [resetEmail, setResetEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  const passwordRules = [
    {
      id: 'length',
      label: 'Minimum 8 characters in length',
      valid: newPassword.length >= 8,
    },
    {
      id: 'uppercase',
      label: 'At least one uppercase letter (A–Z)',
      valid: /[A-Z]/.test(newPassword),
    },
    {
      id: 'lowercase',
      label: 'At least one lowercase letter (a–z)',
      valid: /[a-z]/.test(newPassword),
    },
    {
      id: 'number',
      label: 'At least one number (0–9)',
      valid: /[0-9]/.test(newPassword),
    },
    {
      id: 'special',
      label: 'At least one special character (!@#$%^&*)',
      valid: /[!@#$%^&*`~()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword),
    },
  ];

  const isNewPasswordValid =
    passwordRules.every((rule) => rule.valid) &&
    newPassword.length > 0 &&
    newPassword === confirmPassword;

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    if (!resetEmail.trim()) {
      setResetError('Please enter your registered email address.');
      return;
    }
    setResetLoading(true);
    try {
      const res = await apiRequest<{ success: boolean; resetToken: string; message: string }>(
        '/auth/forgot-password',
        {
          method: 'POST',
          body: JSON.stringify({ email: resetEmail }),
        }
      );
      if (res.success && res.resetToken) {
        setResetToken(res.resetToken);
        setResetStep('NEW_PASSWORD');
      }
    } catch (err: any) {
      setResetError(err.message || 'Failed to verify email address.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);

    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match.');
      return;
    }

    if (!passwordRules.every((r) => r.valid)) {
      setResetError('Please satisfy all 5 password requirements.');
      return;
    }

    setResetLoading(true);
    try {
      const res = await apiRequest<{ success: boolean; message: string }>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ resetToken, newPassword }),
      });
      if (res.success) {
        setResetStep('SUCCESS');
      }
    } catch (err: any) {
      setResetError(err.message || 'Failed to reset password.');
    } finally {
      setResetLoading(false);
    }
  };

  const isDemoVisible = hasAdminHash || location.hash.toLowerCase() === '#admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const user = await login(email, password, role);
      if (user.role === 'CANDIDATE') navigate('/candidate/dashboard');
      else if (user.role === 'RECRUITER') navigate('/recruiter/dashboard');
      else navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string, demoRole?: 'CANDIDATE' | 'RECRUITER') => {
    if (demoRole) setRole(demoRole);
    setEmail(demoEmail);
    setPassword('password123');
    setError(null);
    setIsLoading(true);

    try {
      const user = await login(demoEmail, 'password123', demoRole);
      if (user.role === 'CANDIDATE') navigate('/candidate/dashboard');
      else if (user.role === 'RECRUITER') navigate('/recruiter/dashboard');
      else navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate demo account.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Animated GradFlow */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-[-1] overflow-hidden">
        <GradFlow
          className="w-full h-full"
          config={
            isDark
              ? {
                  type: 'fold',
                  color1: '#000000',
                  color2: '#000000',
                  color3: '#e0fe9e',
                  speed: 0.5,
                  scale: 1,
                  noise: 0.12,
                }
              : {
                  type: 'fold',
                  color1: '#f8fafc',
                  color2: '#f1f5f9',
                  color3: '#84cc16',
                  speed: 0.5,
                  scale: 1,
                  noise: 0.12,
                }
          }
          interactive
        />
      </div>

      <div className="relative z-10 max-w-md w-full space-y-6 bg-[#111111]/90 backdrop-blur-xl border border-[#242424] p-8 sm:p-10 rounded-3xl shadow-2xl">
        <div className="text-center">
          <JobzyLogo size="lg" to="/" />
          <h2 className="mt-6 text-2xl font-black text-white tracking-tight">
            Sign In to JOBZY
          </h2>
          <p className="mt-1 text-xs text-[#A3A3A3]">
            Access your talent intelligence dashboard
          </p>
        </div>

        {/* 1. ROLE SELECTION TOGGLE: CANDIDATE VS RECRUITER */}
        <div className="space-y-1.5">
          <div className="grid grid-cols-2 gap-2 bg-[#181818] p-1.5 rounded-2xl border border-[#2a2a2a]">
            <button
              type="button"
              onClick={() => {
                setRole('CANDIDATE');
                setError(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                role === 'CANDIDATE'
                  ? 'bg-[#C4F167] text-[#000000] shadow-sm'
                  : 'text-[#A3A3A3] hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Candidate Login</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setRole('RECRUITER');
                setError(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                role === 'RECRUITER'
                  ? 'bg-[#C4F167] text-[#000000] shadow-sm'
                  : 'text-[#A3A3A3] hover:text-white'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Recruiter Login</span>
            </button>
          </div>
          <p className="text-[11px] text-center text-[#737373] font-mono">
            {role === 'CANDIDATE'
              ? 'Candidate Portal · Resume AI & Precision Job Matching'
              : 'Recruiter Portal · Sourcing & Automated ATS Screening'}
          </p>
        </div>

        {/* Demo Fast Login Buttons - Only visible to Admin or via ?admin=true */}
        {isDemoVisible && (
          <div className="space-y-2 bg-[#161616] p-3.5 rounded-2xl border border-[#C4F167]/30 transition-all">
            <div className="flex items-center justify-between text-xs font-bold text-[#C4F167]">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Demo Mode (1-Click)</span>
              </div>
              <span className="text-[10px] bg-[#C4F167]/20 px-2 py-0.5 rounded font-mono">STAFF ONLY</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleDemoLogin('candidate@jobzy.ai', 'CANDIDATE')}
                className="text-left p-2.5 rounded-xl bg-[#1f1f1f] hover:bg-[#282828] border border-[#2e2e2e] transition-colors cursor-pointer"
              >
                <span className="text-xs font-bold text-white block">Alex Rivera</span>
                <span className="text-[10px] text-[#A3A3A3] block">Candidate Portal</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('recruiter@jobzy.ai', 'RECRUITER')}
                className="text-left p-2.5 rounded-xl bg-[#1f1f1f] hover:bg-[#282828] border border-[#2e2e2e] transition-colors cursor-pointer"
              >
                <span className="text-xs font-bold text-white block">Sarah Chen</span>
                <span className="text-[10px] text-[#C4F167] block">Recruiter Portal</span>
              </button>
            </div>
            <button
              type="button"
              onClick={() => handleDemoLogin('admin@jobzy.ai')}
              className="w-full text-center py-1.5 rounded-lg text-[11px] font-medium text-[#888888] hover:text-[#C4F167] transition-colors cursor-pointer"
            >
              Sign in as Elena Vance (Platform Admin) →
            </button>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-3 text-xs text-red-400 bg-red-950/20 border border-red-900/40 rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-semibold text-[#A3A3A3] mb-1">
              {role === 'CANDIDATE' ? 'Candidate Email Address' : 'Work Email Address'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#666666] absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={role === 'CANDIDATE' ? 'alex@candidate.com' : 'recruiter@company.com'}
                className="w-full bg-[#181818] border border-[#2a2a2a] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#555555] focus:outline-none focus:border-[#C4F167] transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-[#A3A3A3]">
                Password
              </label>
              <button
                type="button"
                onClick={() => {
                  setForgotModalOpen(true);
                  setResetStep('EMAIL');
                  setResetEmail(email || '');
                  setNewPassword('');
                  setConfirmPassword('');
                  setResetError(null);
                }}
                className="text-[11px] text-[#C4F167] hover:underline cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#666666] absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#181818] border border-[#2a2a2a] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#555555] focus:outline-none focus:border-[#C4F167] transition-colors"
              />
            </div>
          </div>

          <JobzyButton
            type="submit"
            size="md"
            variant="primary"
            isLoading={isLoading}
            className="w-full mt-2"
          >
            Sign In as {role === 'CANDIDATE' ? 'Candidate' : 'Recruiter'}
          </JobzyButton>
        </form>

        <p className="text-center text-xs text-[#888888] pt-2">
          Don't have an account?{' '}
          <Link
            to={`/register?role=${role.toLowerCase()}`}
            className="text-[#C4F167] font-semibold hover:underline"
          >
            Register as {role === 'CANDIDATE' ? 'Candidate' : 'Recruiter'}
          </Link>
        </p>

        {isDemoVisible && (
          <div className="pt-3 border-t border-[#1e1e1e] text-center">
            <button
              type="button"
              onClick={() => {
                navigate(location.pathname + location.search, { replace: true });
                setHasAdminHash(false);
              }}
              className="text-[11px] text-[#555555] hover:text-[#A3A3A3] transition-colors inline-flex items-center gap-1 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Exit Admin Mode (#admin)</span>
            </button>
          </div>
        )}
      </div>

      {/* Forgot / Reset Password Modal */}
      <Modal
        isOpen={forgotModalOpen}
        onClose={() => setForgotModalOpen(false)}
        title={
          resetStep === 'SUCCESS'
            ? 'Password Reset Complete'
            : resetStep === 'NEW_PASSWORD'
            ? 'Set New Password'
            : 'Reset Your Password'
        }
        maxWidth="md"
      >
        {resetStep === 'EMAIL' && (
          <form onSubmit={handleRequestReset} className="space-y-4">
            <p className="text-xs text-[#A3A3A3] leading-relaxed">
              Enter your registered email address below. We'll verify your account so you can securely set a new password.
            </p>

            {resetError && (
              <div className="flex items-center gap-2 p-3 text-xs text-red-400 bg-red-950/20 border border-red-900/40 rounded-xl">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{resetError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#A3A3A3] mb-1">
                Registered Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#666666] absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="e.g. alex@candidate.com"
                  className="w-full bg-[#181818] border border-[#2a2a2a] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#555555] focus:outline-none focus:border-[#C4F167] transition-colors"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <JobzyButton
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setForgotModalOpen(false)}
              >
                Cancel
              </JobzyButton>
              <JobzyButton
                type="submit"
                variant="primary"
                size="sm"
                isLoading={resetLoading}
              >
                Continue
              </JobzyButton>
            </div>
          </form>
        )}

        {resetStep === 'NEW_PASSWORD' && (
          <form onSubmit={handleResetSubmit} className="space-y-4">
            <div className="p-3 bg-[#181818] border border-[#2a2a2a] rounded-xl text-xs text-[#A3A3A3]">
              Setting new password for: <span className="font-semibold text-white">{resetEmail}</span>
            </div>

            {resetError && (
              <div className="flex items-center gap-2 p-3 text-xs text-red-400 bg-red-950/20 border border-red-900/40 rounded-xl">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{resetError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#A3A3A3] mb-1">
                New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#666666] absolute left-3.5 top-3" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full bg-[#181818] border border-[#2a2a2a] rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-[#555555] focus:outline-none focus:border-[#C4F167] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3.5 top-3 text-[#666666] hover:text-[#A3A3A3] transition-colors cursor-pointer"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* 5-Rule Checklist */}
              <div className="mt-2.5 p-3.5 bg-[#161616] border border-[#262626] rounded-2xl space-y-2">
                <p className="text-[11px] font-bold text-[#A3A3A3] uppercase tracking-wider">
                  Password Requirements
                </p>
                <div className="space-y-1.5 pt-0.5">
                  {passwordRules.map((rule) => (
                    <div
                      key={rule.id}
                      className={`flex items-center gap-2 text-xs transition-colors duration-200 ${
                        rule.valid ? 'text-[#C4F167] font-medium' : 'text-[#777777]'
                      }`}
                    >
                      {rule.valid ? (
                        <CheckCircle2 className="w-4 h-4 text-[#C4F167] shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-[#444444] shrink-0" />
                      )}
                      <span>{rule.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A3A3A3] mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#666666] absolute left-3.5 top-3" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full bg-[#181818] border border-[#2a2a2a] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#555555] focus:outline-none focus:border-[#C4F167] transition-colors"
                />
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-[11px] text-red-400 mt-1">Passwords do not match</p>
              )}
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <JobzyButton
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setResetStep('EMAIL')}
              >
                Back
              </JobzyButton>
              <JobzyButton
                type="submit"
                variant="primary"
                size="sm"
                disabled={!isNewPasswordValid}
                isLoading={resetLoading}
              >
                Reset Password
              </JobzyButton>
            </div>
          </form>
        )}

        {resetStep === 'SUCCESS' && (
          <div className="text-center py-4 space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#C4F167]/10 border border-[#C4F167]/30 flex items-center justify-center mx-auto text-[#C4F167]">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">Password Reset Successful!</h4>
              <p className="text-xs text-[#A3A3A3] mt-1 max-w-sm mx-auto">
                Your password has been securely updated in the database. You can now log in with your new credentials.
              </p>
            </div>
            <JobzyButton
              type="button"
              variant="primary"
              size="md"
              className="w-full mt-2"
              onClick={() => {
                setForgotModalOpen(false);
                setEmail(resetEmail);
                setPassword('');
              }}
            >
              Back to Sign In
            </JobzyButton>
          </div>
        )}
      </Modal>
    </div>
  );
};
