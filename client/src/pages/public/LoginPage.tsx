import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { JobzyButton } from '../../components/JobzyButton';
import { JobzyLogo } from '../../components/JobzyLogo';
import { AlertCircle, Lock, Mail, Sparkles, ShieldCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAdminDemo, setShowAdminDemo] = useState(false);

  const isDemoVisible = searchParams.get('admin') === 'true' || searchParams.get('demo') === 'admin' || showAdminDemo;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'CANDIDATE') navigate('/candidate/dashboard');
      else if (user.role === 'RECRUITER') navigate('/recruiter/dashboard');
      else navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
    setError(null);
    setIsLoading(true);

    try {
      const user = await login(demoEmail, 'password123');
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
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#000000]">
      <div className="max-w-md w-full space-y-8 bg-[#111111] border border-[#242424] p-8 sm:p-10 rounded-3xl shadow-2xl">
        <div className="text-center">
          <JobzyLogo size="lg" to="/" />
          <h2 className="mt-6 text-2xl font-black text-white tracking-tight">
            Sign In to JOBZY
          </h2>
          <p className="mt-1 text-xs text-[#A3A3A3]">
            Access your talent intelligence dashboard
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
                onClick={() => handleDemoLogin('candidate@jobzy.ai')}
                className="text-left p-2.5 rounded-xl bg-[#1f1f1f] hover:bg-[#282828] border border-[#2e2e2e] transition-colors cursor-pointer"
              >
                <span className="text-xs font-bold text-white block">Alex Rivera</span>
                <span className="text-[10px] text-[#A3A3A3] block">Candidate Portal</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('recruiter@jobzy.ai')}
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
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#666666] absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full bg-[#181818] border border-[#2a2a2a] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#555555] focus:outline-none focus:border-[#C4F167] transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-[#A3A3A3]">
                Password
              </label>
              <a href="#" className="text-[11px] text-[#C4F167] hover:underline">
                Forgot password?
              </a>
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
            Sign In
          </JobzyButton>
        </form>

        <p className="text-center text-xs text-[#888888] pt-2">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#C4F167] font-semibold hover:underline">
            Register now
          </Link>
        </p>

        <div className="pt-3 border-t border-[#1e1e1e] text-center">
          <button
            type="button"
            onClick={() => setShowAdminDemo(!showAdminDemo)}
            className="text-[11px] text-[#555555] hover:text-[#A3A3A3] transition-colors inline-flex items-center gap-1 cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isDemoVisible ? 'Hide Admin Demo Mode' : 'Admin Demo Access'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
