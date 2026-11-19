import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { apiRequest } from '../../api/client';
import { JobzyCard } from '../../components/JobzyCard';
import { JobzyButton } from '../../components/JobzyButton';
import { MatchScoreCard } from '../../components/MatchScoreCard';
import { SkillBadge } from '../../components/SkillBadge';
import { LoadingIndicator } from '../../components/LoadingIndicator';
import {
  Sparkles,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  ArrowRight,
  Target,
  Briefcase,
  Layers,
} from 'lucide-react';

export const ResumeAnalyzer: React.FC = () => {
  const [searchParams] = useSearchParams();
  const preselectedResumeId = searchParams.get('resumeId');
  const preselectedJobId = searchParams.get('jobId');

  const [resumes, setResumes] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>(preselectedResumeId || '');
  const [selectedJobId, setSelectedJobId] = useState<string>(preselectedJobId || '');
  const [customJdText, setCustomJdText] = useState('');
  const [isCustomJd, setIsCustomJd] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);

  useEffect(() => {
    loadPrerequisites();
  }, []);

  const loadPrerequisites = async () => {
    try {
      setIsLoading(true);
      const [resumesRes, jobsRes] = await Promise.all([
        apiRequest<{ success: boolean; resumes: any[] }>('/resumes'),
        apiRequest<{ success: boolean; jobs: any[] }>('/jobs'),
      ]);

      if (resumesRes.success && resumesRes.resumes?.length > 0) {
        setResumes(resumesRes.resumes);
        if (!selectedResumeId) setSelectedResumeId(resumesRes.resumes[0].id);
      }

      if (jobsRes.success && jobsRes.jobs?.length > 0) {
        setJobs(jobsRes.jobs);
        if (!selectedJobId) setSelectedJobId(jobsRes.jobs[0].id);
      }
    } catch (err) {
      console.error('Failed to load analyzer options:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunAnalysis = async () => {
    if (!selectedResumeId) {
      alert('Please select or upload a resume first.');
      return;
    }

    try {
      setIsAnalyzing(true);
      let targetJobIdToAnalyze = selectedJobId;

      // If user pasted a custom JD text, first parse and create a temporary opening
      if (isCustomJd && customJdText) {
        const parseRes = await apiRequest<{ success: boolean; parsed: any }>('/jobs/parse-jd', {
          method: 'POST',
          body: JSON.stringify({ text: customJdText }),
        });
        if (parseRes.success) {
          // create a draft job to match against
          const createRes = await apiRequest<{ success: boolean; job: any }>('/jobs', {
            method: 'POST',
            body: JSON.stringify({
              ...parseRes.parsed,
              description: customJdText,
            }),
          });
          targetJobIdToAnalyze = createRes.job.id;
        }
      }

      const res = await apiRequest<any>('/matching/analyze', {
        method: 'POST',
        body: JSON.stringify({
          resumeId: selectedResumeId,
          jobId: targetJobIdToAnalyze,
        }),
      });

      if (res.success) {
        setAnalysisResult(res);
      }
    } catch (err: any) {
      alert(err.message || 'Analysis failed. Please ensure a valid resume and job are selected.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
          <Sparkles className="w-6 h-6 text-[#C4F167]" />
          Resume & Job Compatibility Analyzer
        </h1>
        <p className="text-xs text-[#A3A3A3] mt-1">
          Perform a hybrid deterministic and AI evaluation comparing your resume qualifications against target job requirements.
        </p>
      </div>

      {/* Selection Control Panel */}
      <JobzyCard className="p-6 border-[#2a2a2a]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Select Resume */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#A3A3A3] mb-2">
              1. Select Resume
            </label>
            {resumes.length === 0 ? (
              <div className="p-4 bg-[#161616] border border-[#2a2a2a] rounded-xl text-xs text-[#888888]">
                No resumes uploaded yet.{' '}
                <Link to="/candidate/resumes" className="text-[#C4F167] font-semibold hover:underline">
                  Upload a resume first →
                </Link>
              </div>
            ) : (
              <select
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                className="w-full bg-[#181818] border border-[#2e2e2e] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C4F167]"
              >
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.originalFileName} (ATS Score: {r.atsScore || 90}%)
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Select Target Job */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#A3A3A3]">
                2. Target Job Description
              </label>
              <button
                type="button"
                onClick={() => setIsCustomJd(!isCustomJd)}
                className="text-[11px] text-[#C4F167] hover:underline cursor-pointer"
              >
                {isCustomJd ? 'Choose Existing Job Openings' : 'Paste Custom Job Description'}
              </button>
            </div>

            {isCustomJd ? (
              <textarea
                rows={4}
                value={customJdText}
                onChange={(e) => setCustomJdText(e.target.value)}
                placeholder="Paste any job description text here (requirements, responsibilities, years of experience)..."
                className="w-full bg-[#181818] border border-[#2e2e2e] rounded-xl p-3 text-xs text-white placeholder-[#555555] focus:outline-none focus:border-[#C4F167]"
              />
            ) : (
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="w-full bg-[#181818] border border-[#2e2e2e] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C4F167]"
              >
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title} — {j.company?.name || 'Tech Company'} ({j.location})
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-[#222222] flex justify-end">
          <JobzyButton
            size="md"
            variant="primary"
            isLoading={isAnalyzing}
            leftIcon={<Sparkles className="w-4 h-4" />}
            onClick={handleRunAnalysis}
          >
            Run Compatibility Evaluation
          </JobzyButton>
        </div>
      </JobzyCard>

      {/* Results View */}
      {analysisResult && (
        <div className="space-y-6">
          {/* Main Compatibility & Breakdown Card */}
          <MatchScoreCard
            overallScore={analysisResult.overallScore}
            categoryScores={analysisResult.categoryScores}
            atsScore={analysisResult.atsReadabilityScore}
            confidence={analysisResult.confidence || 0.95}
          />

          {/* Matched & Missing Skills Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Matched Skills */}
            <JobzyCard className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4 text-[#C4F167]" />
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                  Verified Skills Matched ({analysisResult.matchedSkills?.length ?? 0})
                </h4>
              </div>
              <p className="text-xs text-[#A3A3A3] mb-4">
                Documented in your professional history, projects, or skill taxonomy:
              </p>
              <div className="flex flex-wrap gap-2">
                {analysisResult.matchedSkills?.map((s: string, idx: number) => (
                  <SkillBadge key={idx} name={s} status="matched" size="md" />
                ))}
              </div>
            </JobzyCard>

            {/* Missing Skills */}
            <JobzyCard className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                  Missing Or Preferred Gaps ({analysisResult.missingSkills?.length ?? 0})
                </h4>
              </div>
              <p className="text-xs text-[#A3A3A3] mb-4">
                Required skills not detected in your resume:
              </p>
              <div className="flex flex-wrap gap-2">
                {analysisResult.missingSkills?.length > 0 ? (
                  analysisResult.missingSkills.map((s: string, idx: number) => (
                    <SkillBadge key={idx} name={s} status="missing" size="md" />
                  ))
                ) : (
                  <span className="text-xs text-[#C4F167] font-medium">
                    ✓ All mandatory skills detected! Zero critical gaps.
                  </span>
                )}
              </div>
            </JobzyCard>
          </div>

          {/* Explainable Evidence Box */}
          <JobzyCard className="p-6 space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Target className="w-4 h-4 text-[#C4F167]" />
              Explainable AI Evidence & Analysis Summary
            </h4>

            <p className="text-xs text-[#D1D1D1] bg-[#141414] p-4 rounded-xl border border-[#222222] leading-relaxed">
              {analysisResult.evidence?.summary}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
              <div>
                <span className="font-semibold text-white block mb-1">Experience Alignment</span>
                <p className="text-[#A3A3A3]">{analysisResult.evidence?.experienceEvaluation}</p>
              </div>
              <div>
                <span className="font-semibold text-white block mb-1">Project Scale & Architecture</span>
                <p className="text-[#A3A3A3]">{analysisResult.evidence?.projectEvaluation}</p>
              </div>
            </div>
          </JobzyCard>

          {/* Learning Roadmap for Gaps */}
          {analysisResult.learningRoadmap?.length > 0 && (
            <JobzyCard className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#C4F167]" />
                  Tailored Skill Bridge Roadmap
                </h4>
                <span className="text-xs text-[#A3A3A3]">Accelerate your match score to 98%</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysisResult.learningRoadmap.map((item: any, idx: number) => (
                  <div key={idx} className="bg-[#141414] border border-[#242424] p-4 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">{item.skill}</span>
                      <span className="text-[11px] text-[#C4F167] font-semibold bg-[#C4F167]/10 px-2 py-0.5 rounded-md">
                        {item.estimatedTimeToLearn}
                      </span>
                    </div>
                    <p className="text-[#A3A3A3] leading-relaxed">{item.description}</p>
                    <div className="pt-2 border-t border-[#1f1f1f]">
                      <span className="font-semibold text-white block text-[11px]">Recommended Project:</span>
                      <p className="text-[#888888] mt-0.5 text-[11px]">{item.recommendedProject}</p>
                    </div>
                  </div>
                ))}
              </div>
            </JobzyCard>
          )}

          {/* Direct CTA to Optimizer */}
          <div className="bg-[#111111] border border-[#C4F167]/30 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-white text-base">Optimize Your Resume Bullets with AI</h4>
              <p className="text-xs text-[#A3A3A3] mt-0.5">
                Reword responsibilities into achievement-oriented statements with metrics and action verbs.
              </p>
            </div>
            <Link to={`/candidate/optimizer?resumeId=${selectedResumeId}`}>
              <JobzyButton variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Launch AI Optimizer
              </JobzyButton>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
