import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, RefreshCw, UserCheck } from 'lucide-react';

export const AdminSimulationBanner: React.FC = () => {
  const { user, isImpersonating, exitImpersonation, impersonate } = useAuth();
  const navigate = useNavigate();

  if (!isImpersonating || !user) return null;

  const handleReturnToAdmin = () => {
    exitImpersonation();
    navigate('/admin/dashboard');
  };

  const handleSwitchPersona = async (email: string) => {
    try {
      const newUser = await impersonate({ email });
      if (newUser.role === 'CANDIDATE') navigate('/candidate/dashboard');
      else if (newUser.role === 'RECRUITER') navigate('/recruiter/dashboard');
      else navigate('/admin/dashboard');
    } catch (err: any) {
      alert(err.message || 'Failed to switch demo persona.');
    }
  };

  return (
    <aside aria-label="Admin Demo Simulation" className="bg-[#C4F167] text-[#000000] px-4 py-2.5 flex flex-wrap items-center justify-between text-xs font-bold sticky top-0 z-50 shadow-md border-b border-[#a6d14d]">
      <div className="flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 text-black shrink-0" />
        <span>
          <strong className="font-extrabold uppercase tracking-wide">Admin Mode:</strong> Viewing as{' '}
          <span className="underline decoration-black">{user.name}</span> ({user.role}) — {user.email}
        </span>
      </div>

      <div className="flex items-center gap-2 mt-1 sm:mt-0">
        {user.role !== 'CANDIDATE' && (
          <button
            type="button"
            onClick={() => handleSwitchPersona('candidate@jobzy.ai')}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-black/10 hover:bg-black/20 text-black text-[11px] font-semibold transition-colors cursor-pointer"
          >
            <UserCheck className="w-3 h-3" />
            Switch to Candidate (Alex)
          </button>
        )}
        {user.role !== 'RECRUITER' && (
          <button
            type="button"
            onClick={() => handleSwitchPersona('recruiter@jobzy.ai')}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-black/10 hover:bg-black/20 text-black text-[11px] font-semibold transition-colors cursor-pointer"
          >
            <UserCheck className="w-3 h-3" />
            Switch to Recruiter (Sarah)
          </button>
        )}
        <button
          type="button"
          onClick={handleReturnToAdmin}
          className="flex items-center gap-1 px-3 py-1 rounded-lg bg-black text-[#C4F167] hover:bg-[#1a1a1a] text-[11px] font-bold transition-all cursor-pointer ml-1 shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Return to Admin Dashboard
        </button>
      </div>
    </aside>
  );
};
