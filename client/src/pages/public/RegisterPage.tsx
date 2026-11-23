import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { GradFlow } from 'gradflow';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { JobzyButton } from '../../components/JobzyButton';
import { JobzyLogo } from '../../components/JobzyLogo';
import { AlertCircle, User, Mail, Lock, Building, Briefcase } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [role, setRole] = useState<'CANDIDATE' | 'RECRUITER'>(() => {
    const r = searchParams.get('role')?.toUpperCase();
    if (r === 'RECRUITER') return 'RECRUITER';
    return 'CANDIDATE';
  });
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [designation, setDesignation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const user = await register({
        role,
        name,
        email,
        password,
        companyName: role === 'RECRUITER' ? companyName : undefined,
        designation: role === 'RECRUITER' ? designation : undefined,
      });

      if (user.role === 'CANDIDATE') navigate('/candidate/dashboard');
      else navigate('/recruiter/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
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
            Create Your Account
          </h2>
          <p className="mt-1 text-xs text-[#A3A3A3]">
            Choose your persona to unlock customized talent intelligence
          </p>
        </div>

        {/* Role toggle tabs */}
        <div className="grid grid-cols-2 gap-2 bg-[#181818] p-1.5 rounded-2xl border border-[#2a2a2a]">
          <button
            type="button"
            onClick={() => setRole('CANDIDATE')}
            className={`flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              role === 'CANDIDATE'
                ? 'bg-[#C4F167] text-[#000000] shadow-sm'
                : 'text-[#A3A3A3] hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>I'm a Candidate</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('RECRUITER')}
            className={`flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              role === 'RECRUITER'
                ? 'bg-[#C4F167] text-[#000000] shadow-sm'
                : 'text-[#A3A3A3] hover:text-white'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>I'm a Recruiter</span>
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 text-xs text-red-400 bg-red-950/20 border border-red-900/40 rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-semibold text-[#A3A3A3] mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#666666] absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={role === 'CANDIDATE' ? 'e.g. Alex Rivera' : 'e.g. Sarah Chen'}
                className="w-full bg-[#181818] border border-[#2a2a2a] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#555555] focus:outline-none focus:border-[#C4F167] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#A3A3A3] mb-1">
              Work Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#666666] absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full bg-[#181818] border border-[#2a2a2a] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#555555] focus:outline-none focus:border-[#C4F167] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#A3A3A3] mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#666666] absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="w-full bg-[#181818] border border-[#2a2a2a] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#555555] focus:outline-none focus:border-[#C4F167] transition-colors"
              />
            </div>
          </div>

          {role === 'RECRUITER' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-[#A3A3A3] mb-1">
                  Company Name
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-[#666666] absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. TechVanguard Inc."
                    className="w-full bg-[#181818] border border-[#2a2a2a] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#555555] focus:outline-none focus:border-[#C4F167] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A3A3A3] mb-1">
                  Your Designation
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-[#666666] absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="e.g. Lead Technical Recruiter"
                    className="w-full bg-[#181818] border border-[#2a2a2a] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#555555] focus:outline-none focus:border-[#C4F167] transition-colors"
                  />
                </div>
              </div>
            </>
          )}

          <JobzyButton
            type="submit"
            size="md"
            variant="primary"
            isLoading={isLoading}
            className="w-full mt-4"
          >
            Complete Registration
          </JobzyButton>
        </form>

        <p className="text-center text-xs text-[#888888] pt-2">
          Already have an account?{' '}
          <Link to="/login" className="text-[#C4F167] font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};
