import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { apiRequest } from '../../api/client';
import { JobzyCard } from '../../components/JobzyCard';
import { JobzyButton } from '../../components/JobzyButton';
import { MatchScoreCard } from '../../components/MatchScoreCard';
import { SkillBadge } from '../../components/SkillBadge';
import { ResumeUploadZone } from '../../components/ResumeUploadZone';
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
  UploadCloud,
  FileText,
  Globe,
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
  const [isCustomJd, setIsCustomJd] = useState(!preselectedJobId);

  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);

  useEffect(() => {
    loadPrerequisites();
  }, []);

  const SAMPLE_FULLSTACK_JD = `Role: Senior Full Stack Engineer (React, Node.js & Cloud)
Company: Tech Enterprise
Location: Remote (Global)
Experience: 3+ years of professional software engineering

Responsibilities:
- Build, test, and ship high-throughput web applications and REST APIs.
- Work with React.js, TypeScript, Node.js, and modern CSS frameworks.
- Design database schemas and optimize queries with MongoDB / PostgreSQL.
- Maintain CI/CD automated deployment pipelines and Docker containers.

Requirements:
- Strong proficiency in TypeScript, JavaScript, React.js, and Node.js.
- Solid understanding of REST APIs, database systems, and state management.
- Hands-on experience with Git version control and automated unit testing.
- Strong analytical and problem-solving skills.

Preferred:
- Experience with Docker, Redis caching, and cloud deployments (AWS/GCP).`;

  const SAMPLE_FRONTEND_JD = `Role: Frontend Engineer (React & TypeScript)
Company: Creative Studio
Location: Remote
Experience: 2+ years of frontend development

Responsibilities:
- Build beautiful, performant, responsive web interfaces using React.js and Tailwind CSS.
- Collaborate with UX/UI designers in Figma to build accessible components.
- Optimize frontend bundle size and web performance metrics.

Requirements:
- Deep expertise in React.js, TypeScript, Next.js, and HTML5/CSS3.
- Experience with Tailwind CSS, state management, and REST API integration.
- Eye for design, typography, accessibility (a11y), and responsiveness.`;

  const SAMPLE_BACKEND_JD = `Role: Backend Engineer (Python / Node.js & Distributed Systems)
Company: Cloud Systems
Location: Remote
Experience: 3+ years of backend systems development

Responsibilities:
- Architect high-performance backend microservices and data pipelines.
- Manage database design, migrations, and query performance in PostgreSQL and Redis.
- Secure API endpoints, manage auth tokens, and integrate cloud services.

Requirements:
- Strong experience with Node.js, Express, or Python (FastAPI / Django).
- Hands-on database modeling in PostgreSQL or MongoDB.
- Experience with microservices, Docker, Docker Compose, and RESTful APIs.`;

  const loadPrerequisites = async () => {
    try {
      setIsLoading(true);
      const [resumesRes, jobsRes] = await Promise.all([
        apiRequest<{ success: boolean; resumes: any[] }>('/resumes'),
        apiRequest<{ success: boolean; jobs: any[] }>('/jobs').catch(() => ({ success: true, jobs: [] })),
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

  const handleQuickUpload = async (file: File) => {
    try {
      setIsUploadingResume(true);
      const formData = new FormData();
      formData.append('resume', file);

      const res = await apiRequest<{ success: boolean; resume: any }>('/resumes/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.success && res.resume) {
        setResumes((prev) => [res.resume, ...prev]);
        setSelectedResumeId(res.resume.id);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to upload resume.');
    } finally {
      setIsUploadingResume(false);
    }
  };

  const handleRunAnalysis = async () => {
    if (!selectedResumeId) {
      alert('Please upload or select a resume first to run compatibility analysis.');
      return;
    }

    try {
      setIsAnalyzing(true);

      const res = await apiRequest<any>('/matching/analyze', {
        method: 'POST',
        body: JSON.stringify({
          resumeId: selectedResumeId,
          // Only send jobId if explicitly in platform jobs mode AND a jobId is chosen
          jobId: !isCustomJd && selectedJobId ? selectedJobId : undefined,
          // Pass custom text if provided
          customJdText: customJdText.trim() ? customJdText.trim() : undefined,
        }),
      });

      if (res.success) {
        setAnalysisResult(res);
      }
    } catch (err: any) {
      alert(err.message || 'Analysis failed. Please verify your resume and job description.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
          <Sparkles className="w-6 h-6 text-[#C4F167]" />
          Universal Resume & Job Description Compatibility Analyzer
        </h1>
        <p className="text-xs text-[#A3A3A3] mt-1">
          Perform deterministic and AI qualification matching against any job description. No job ID required.
        </p>
      </div>

      {/* Selection Control Panel */}
      <JobzyCard className="p-6 border-[#2a2a2a]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Select Resume */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#A3A3A3] flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#C4F167]" />
                1. Select Resume
              </label>
              {resumes.length > 0 && (
                <Link to="/candidate/resumes" className="text-[11px] text-[#C4F167] hover:underline">
                  Manage Resumes →
                </Link>
              )}
            </div>

            {resumes.length === 0 ? (
              <div className="space-y-3">
                <div className="p-3 bg-[#161616] border border-[#2a2a2a] rounded-xl text-xs text-[#A3A3A3]">
                  No resume found. Upload a resume file below to analyze it instantly:
                </div>
                <ResumeUploadZone onFileUpload={handleQuickUpload} isLoading={isUploadingResume} />
              </div>
            ) : (
              <div className="space-y-2">
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
                <div className="flex items-center justify-between text-[11px] text-[#888888] pt-1">
                  <span>Selected for AI compatibility parsing</span>
                  <Link to="/candidate/resumes" className="text-[#C4F167] hover:underline">
                    Upload another PDF
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Target Job Requirements */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#A3A3A3] flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#C4F167]" />
                2. Target Job Description
              </label>
              <div className="flex items-center gap-1 bg-[#181818] p-0.5 rounded-lg border border-[#2a2a2a]">
                <button
                  type="button"
                  onClick={() => setIsCustomJd(true)}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                    isCustomJd
                      ? 'bg-[#C4F167] text-black shadow-sm'
                      : 'text-[#888888] hover:text-white'
                  }`}
                >
                  Universal (Paste Any JD)
                </button>
                <button
                  type="button"
                  onClick={() => setIsCustomJd(false)}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                    !isCustomJd
                      ? 'bg-[#C4F167] text-black shadow-sm'
                      : 'text-[#888888] hover:text-white'
                  }`}
                >
                  Platform Jobs
                </button>
              </div>
            </div>

            {isCustomJd ? (
              <div className="space-y-2">
                <div className="relative">
                  <textarea
                    rows={7}
                    value={customJdText}
                    onChange={(e) => setCustomJdText(e.target.value)}
                    placeholder="Paste ANY job description from LinkedIn, Indeed, Glassdoor, company websites, or your notes. (Role title, responsibilities, required skills, experience level)..."
                    className="w-full bg-[#181818] border border-[#2e2e2e] rounded-xl p-3 text-xs text-white placeholder-[#555555] focus:outline-none focus:border-[#C4F167] font-mono leading-relaxed resize-y"
                  />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  <span className="text-[#666666]">
                    {customJdText.length} characters · ~{customJdText.trim() ? customJdText.trim().split(/\s+/).length : 0} words
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    {customJdText && (
                      <button
                        type="button"
                        onClick={() => setCustomJdText('')}
                        className="text-[#888888] hover:text-red-400 transition-colors cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                    <span className="text-[#555555]">Presets:</span>
                    <button
                      type="button"
                      onClick={() => setCustomJdText(SAMPLE_FULLSTACK_JD)}
                      className="text-[#C4F167] hover:underline cursor-pointer font-medium"
                    >
                      Full-Stack
                    </button>
                    <span className="text-[#333333]">·</span>
                    <button
                      type="button"
                      onClick={() => setCustomJdText(SAMPLE_FRONTEND_JD)}
                      className="text-[#C4F167] hover:underline cursor-pointer font-medium"
                    >
                      Frontend
                    </button>
                    <span className="text-[#333333]">·</span>
                    <button
                      type="button"
                      onClick={() => setCustomJdText(SAMPLE_BACKEND_JD)}
                      className="text-[#C4F167] hover:underline cursor-pointer font-medium"
                    >
                      Backend
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className="w-full bg-[#181818] border border-[#2e2e2e] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C4F167]"
                >
                  {jobs.length === 0 ? (
                    <option value="">No platform jobs found (switch to Universal Paste JD)</option>
                  ) : (
                    jobs.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.title} — {j.company?.name || 'Tech Company'} ({j.location})
                      </option>
                    ))
                  )}
                </select>
                <p className="text-[11px] text-[#888888]">
                  Select from live openings on Jobzy, or switch to Universal to paste any external JD.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-[#222222] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-[#888888] flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#C4F167]" />
            <span>Universal AI Matching: No target job ID required.</span>
          </div>
          <JobzyButton
            size="md"
            variant="primary"
            isLoading={isAnalyzing}
            leftIcon={<Sparkles className="w-4 h-4" />}
            onClick={handleRunAnalysis}
          >
            Run Universal Compatibility Evaluation
          </JobzyButton>
        </div>
      </JobzyCard>

      {/* Results View */}
      {analysisResult && (
        <div className="space-y-6">
          {/* Target Position Info Banner */}
          <div className="p-4 bg-[#141414] border border-[#2a2a2a] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#C4F167]/10 text-[#C4F167] shrink-0">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-mono text-[#888888] uppercase tracking-wider block">
                  {analysisResult.job?.isCustom ? 'Custom Pasted Job Description' : 'Platform Job Opening'}
                </span>
                <h3 className="text-base font-bold text-white">
                  {analysisResult.job?.title || 'Target Job Position'}
                  {analysisResult.job?.company && (
                    <span className="text-[#A3A3A3] font-normal text-xs sm:text-sm"> · {analysisResult.job.company}</span>
                  )}
                </h3>
              </div>
            </div>
            {analysisResult.job?.isCustom ? (
              <span className="self-start sm:self-auto text-xs font-semibold px-3 py-1 rounded-full bg-[#C4F167]/15 text-[#C4F167] border border-[#C4F167]/30">
                Custom JD Evaluated
              </span>
            ) : (
              <span className="self-start sm:self-auto text-xs font-semibold px-3 py-1 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30">
                Platform Job Match
              </span>
            )}
          </div>

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
