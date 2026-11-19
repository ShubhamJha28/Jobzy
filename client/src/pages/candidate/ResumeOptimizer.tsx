import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiRequest } from '../../api/client';
import { JobzyCard } from '../../components/JobzyCard';
import { JobzyButton } from '../../components/JobzyButton';
import { LoadingIndicator } from '../../components/LoadingIndicator';
import {
  Sparkles,
  Check,
  X,
  Edit3,
  ArrowRight,
  ThumbsUp,
  FileText,
  Lightbulb,
} from 'lucide-react';

export const ResumeOptimizer: React.FC = () => {
  const [searchParams] = useSearchParams();
  const preselectedResumeId = searchParams.get('resumeId');

  const [resumes, setResumes] = useState<any[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>(preselectedResumeId || '');
  const [inputBullet, setInputBullet] = useState(
    'Created RESTful API endpoints in Node.js and Express connected to PostgreSQL.'
  );
  const [targetSkill, setTargetSkill] = useState('REST APIs');
  const [isRewriting, setIsRewriting] = useState(false);
  const [latestSuggestion, setLatestSuggestion] = useState<any | null>(null);

  const [summaryInput, setSummaryInput] = useState(
    'Senior Full Stack Engineer with 5+ years of production experience building web applications.'
  );
  const [summaryTargetTitle, setSummaryTargetTitle] = useState('Senior Full-Stack & Cloud Engineer');
  const [isRewritingSummary, setIsRewritingSummary] = useState(false);
  const [summarySuggestion, setSummarySuggestion] = useState<any | null>(null);

  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);

  useEffect(() => {
    loadResumesAndRecs();
  }, []);

  useEffect(() => {
    if (selectedResumeId) {
      loadRecommendations(selectedResumeId);
    }
  }, [selectedResumeId]);

  const loadResumesAndRecs = async () => {
    try {
      const res = await apiRequest<{ success: boolean; resumes: any[] }>('/resumes');
      if (res.success && res.resumes?.length > 0) {
        setResumes(res.resumes);
        const targetId = preselectedResumeId || res.resumes[0].id;
        setSelectedResumeId(targetId);
        loadRecommendations(targetId);
      }
    } catch (err) {
      console.error('Failed to load resumes:', err);
    }
  };

  const loadRecommendations = async (resumeId: string) => {
    try {
      setIsLoadingRecs(true);
      const res = await apiRequest<{ success: boolean; recommendations: any[] }>(
        `/optimizer/recommendations/${resumeId}`
      );
      if (res.success) {
        setRecommendations(res.recommendations || []);
      }
    } catch (err) {
      console.error('Failed to load recommendations:', err);
    } finally {
      setIsLoadingRecs(false);
    }
  };

  const handleRewriteBullet = async () => {
    if (!inputBullet.trim()) return;
    try {
      setIsRewriting(true);
      const res = await apiRequest<{ success: boolean; suggestion: any }>(
        '/optimizer/rewrite-bullet',
        {
          method: 'POST',
          body: JSON.stringify({
            text: inputBullet,
            targetSkill,
            resumeId: selectedResumeId || undefined,
          }),
        }
      );
      if (res.success) {
        setLatestSuggestion(res.suggestion);
        if (selectedResumeId) loadRecommendations(selectedResumeId);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to rewrite bullet point.');
    } finally {
      setIsRewriting(false);
    }
  };

  const handleOptimizeSummary = async () => {
    if (!summaryInput.trim()) return;
    try {
      setIsRewritingSummary(true);
      const res = await apiRequest<{ success: boolean; suggestion: any }>(
        '/optimizer/optimize-summary',
        {
          method: 'POST',
          body: JSON.stringify({
            summary: summaryInput,
            targetJobTitle: summaryTargetTitle,
            resumeId: selectedResumeId || undefined,
          }),
        }
      );
      if (res.success) {
        setSummarySuggestion(res.suggestion);
        if (selectedResumeId) loadRecommendations(selectedResumeId);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to optimize summary.');
    } finally {
      setIsRewritingSummary(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: 'ACCEPTED' | 'REJECTED') => {
    try {
      await apiRequest(`/optimizer/recommendations/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      setRecommendations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to update status.');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
          <Sparkles className="w-6 h-6 text-[#C4F167]" />
          AI Resume Optimizer
        </h1>
        <p className="text-xs text-[#A3A3A3] mt-1">
          Elevate your resume bullet points and professional summary into high-impact, achievement-oriented statements with quantified metrics.
        </p>
      </div>

      {/* Target Resume Picker */}
      {resumes.length > 0 && (
        <div className="flex items-center gap-3 bg-[#111111] p-4 rounded-2xl border border-[#242424]">
          <FileText className="w-4 h-4 text-[#C4F167]" />
          <span className="text-xs font-semibold text-white">Target Resume:</span>
          <select
            value={selectedResumeId}
            onChange={(e) => setSelectedResumeId(e.target.value)}
            className="bg-[#181818] border border-[#2e2e2e] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#C4F167]"
          >
            {resumes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.originalFileName} (ATS: {r.atsScore || 90}%)
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 1. BULLET POINT REWRITER */}
      <JobzyCard className="p-6 space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-[#222222]">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-[#C4F167]" />
            Experience Bullet Point Transformer
          </h3>
          <span className="text-xs text-[#C4F167] bg-[#C4F167]/10 px-2.5 py-0.5 rounded-full border border-[#C4F167]/20">
            Action Verb + Metric Injection
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold text-[#A3A3A3]">
              Original Bullet Point / Responsibility:
            </label>
            <textarea
              rows={3}
              value={inputBullet}
              onChange={(e) => setInputBullet(e.target.value)}
              placeholder="e.g. Worked on backend APIs using Node.js and Postgres..."
              className="w-full bg-[#161616] border border-[#282828] rounded-xl p-3 text-xs text-white placeholder-[#555555] focus:outline-none focus:border-[#C4F167]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#A3A3A3]">
              Target Skill / Keyword Alignment:
            </label>
            <input
              type="text"
              value={targetSkill}
              onChange={(e) => setTargetSkill(e.target.value)}
              placeholder="e.g. REST APIs, AWS, Docker"
              className="w-full bg-[#161616] border border-[#282828] rounded-xl px-3 py-2.5 text-xs text-white placeholder-[#555555] focus:outline-none focus:border-[#C4F167]"
            />
            <p className="text-[11px] text-[#777777] pt-1">
              Connects the bullet to key ATS job requirements without fabricating false claims.
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <JobzyButton
            size="sm"
            variant="primary"
            isLoading={isRewriting}
            leftIcon={<Sparkles className="w-3.5 h-3.5" />}
            onClick={handleRewriteBullet}
          >
            Generate High-Impact Rewrite
          </JobzyButton>
        </div>

        {/* Side-by-side comparison result */}
        {latestSuggestion && (
          <div className="pt-4 mt-4 border-t border-[#222222] space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-[#C4F167]" />
              Side-by-Side Impact Comparison
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Original */}
              <div className="bg-[#141414] border border-[#242424] p-4 rounded-xl space-y-1">
                <span className="text-[11px] font-bold text-[#888888] uppercase block">
                  Original (Passive Responsibility)
                </span>
                <p className="text-[#A3A3A3] leading-relaxed line-through">
                  {latestSuggestion.originalText}
                </p>
              </div>

              {/* Improved */}
              <div className="bg-[#141414] border border-[#C4F167]/40 p-4 rounded-xl space-y-1 relative">
                <span className="text-[11px] font-bold text-[#C4F167] uppercase block">
                  Improved (Action + Quantified Metric)
                </span>
                <p className="text-white leading-relaxed font-medium">
                  {latestSuggestion.suggestedText}
                </p>
              </div>
            </div>

            <div className="p-3 bg-[#161616] border border-[#262626] rounded-xl text-xs text-[#A3A3A3] flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-[#C4F167] shrink-0 mt-0.5" />
              <span>{latestSuggestion.explanation}</span>
            </div>
          </div>
        )}
      </JobzyCard>

      {/* 2. SUMMARY OPTIMIZER */}
      <JobzyCard className="p-6 space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-[#222222]">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#C4F167]" />
            Professional Summary Headline Optimizer
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold text-[#A3A3A3]">
              Current Opening Summary:
            </label>
            <textarea
              rows={3}
              value={summaryInput}
              onChange={(e) => setSummaryInput(e.target.value)}
              className="w-full bg-[#161616] border border-[#282828] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#C4F167]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#A3A3A3]">
              Target Job Title:
            </label>
            <input
              type="text"
              value={summaryTargetTitle}
              onChange={(e) => setSummaryTargetTitle(e.target.value)}
              className="w-full bg-[#161616] border border-[#282828] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#C4F167]"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <JobzyButton
            size="sm"
            variant="outline"
            isLoading={isRewritingSummary}
            leftIcon={<Sparkles className="w-3.5 h-3.5" />}
            onClick={handleOptimizeSummary}
          >
            Optimize Summary
          </JobzyButton>
        </div>

        {summarySuggestion && (
          <div className="p-4 bg-[#161616] border border-[#C4F167]/30 rounded-xl space-y-2 text-xs">
            <span className="text-[11px] font-bold text-[#C4F167] uppercase block">
              Suggested Executive Summary
            </span>
            <p className="text-white leading-relaxed">{summarySuggestion.suggestedText}</p>
            <p className="text-[11px] text-[#888888] pt-1">{summarySuggestion.explanation}</p>
          </div>
        )}
      </JobzyCard>

      {/* 3. SAVED RECOMMENDATIONS FEED */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider text-[#A3A3A3]">
          Recommendations for Current Resume ({recommendations.length})
        </h3>

        {recommendations.length === 0 ? (
          <JobzyCard className="text-center py-8 text-xs text-[#777777]">
            No saved optimization recommendations yet. Generate your first one above!
          </JobzyCard>
        ) : (
          <div className="space-y-3">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className="bg-[#111111] border border-[#242424] p-5 rounded-2xl space-y-3 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#C4F167] uppercase tracking-wider text-[11px]">
                    {rec.category} Optimization ({rec.priority} Priority)
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      rec.status === 'ACCEPTED'
                        ? 'bg-[#C4F167]/20 text-[#C4F167]'
                        : rec.status === 'REJECTED'
                        ? 'bg-red-950/30 text-red-400'
                        : 'bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    {rec.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-[#161616] p-3 rounded-xl border border-[#262626]">
                    <span className="text-[10px] text-[#777777] block font-bold">ORIGINAL:</span>
                    <p className="text-[#A3A3A3] mt-0.5">{rec.originalText}</p>
                  </div>
                  <div className="bg-[#161616] p-3 rounded-xl border border-[#C4F167]/30">
                    <span className="text-[10px] text-[#C4F167] block font-bold">IMPROVED:</span>
                    <p className="text-white mt-0.5 font-medium">{rec.suggestedText}</p>
                  </div>
                </div>

                <p className="text-[11px] text-[#888888]">{rec.explanation}</p>

                {rec.status === 'PENDING' && (
                  <div className="flex justify-end gap-2 pt-2 border-t border-[#1f1f1f]">
                    <button
                      onClick={() => handleUpdateStatus(rec.id, 'REJECTED')}
                      className="px-3 py-1.5 rounded-lg border border-[#2a2a2a] text-[#A3A3A3] hover:text-white hover:bg-[#1a1a1a] transition-colors cursor-pointer"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(rec.id, 'ACCEPTED')}
                      className="px-3 py-1.5 rounded-lg bg-[#C4F167] text-black font-bold hover:bg-[#b0df52] transition-colors cursor-pointer"
                    >
                      Accept Suggestion
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
