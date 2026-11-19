import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../../api/client';
import { JobzyCard } from '../../components/JobzyCard';
import { JobzyButton } from '../../components/JobzyButton';
import { SkillBadge } from '../../components/SkillBadge';
import {
  Sparkles,
  Sliders,
  CheckCircle2,
  FileText,
  Briefcase,
  Layers,
  ArrowRight,
} from 'lucide-react';

export const CreateJobPage: React.FC = () => {
  const navigate = useNavigate();

  // Raw JD paste for AI parser
  const [rawJdText, setRawJdText] = useState('');
  const [isParsingJd, setIsParsingJd] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requiredSkills, setRequiredSkills] = useState<string[]>([
    'React.js',
    'TypeScript',
    'Node.js',
    'PostgreSQL',
  ]);
  const [skillInput, setSkillInput] = useState('');
  const [preferredSkills, setPreferredSkills] = useState<string[]>(['AWS', 'Docker']);
  const [prefSkillInput, setPrefSkillInput] = useState('');
  const [minimumExperience, setMinimumExperience] = useState(3.0);
  const [maximumExperience, setMaximumExperience] = useState<number | undefined>(7.0);
  const [location, setLocation] = useState('San Francisco, CA');
  const [isRemote, setIsRemote] = useState(true);
  const [employmentType, setEmploymentType] = useState('FULL_TIME');
  const [salaryMin, setSalaryMin] = useState(135000);
  const [salaryMax, setSalaryMax] = useState(175000);

  // Scoring Weights Configuration
  const [weights, setWeights] = useState({
    requiredSkills: 30,
    experience: 20,
    technicalDepth: 15,
    projects: 15,
    education: 10,
    preferredSkills: 10,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleParseJd = async () => {
    if (!rawJdText.trim() || rawJdText.length < 25) {
      alert('Please paste a substantive job description.');
      return;
    }

    try {
      setIsParsingJd(true);
      const res = await apiRequest<{ success: boolean; parsed: any }>('/jobs/parse-jd', {
        method: 'POST',
        body: JSON.stringify({ text: rawJdText }),
      });

      if (res.success && res.parsed) {
        const p = res.parsed;
        setTitle(p.title || title);
        setDescription(rawJdText);
        if (p.requiredSkills?.length) setRequiredSkills(p.requiredSkills);
        if (p.preferredSkills?.length) setPreferredSkills(p.preferredSkills);
        if (p.minimumExperience) setMinimumExperience(p.minimumExperience);
        if (p.maximumExperience) setMaximumExperience(p.maximumExperience);
        if (p.location) setLocation(p.location);
        if (p.isRemote !== undefined) setIsRemote(p.isRemote);
        if (p.employmentType) setEmploymentType(p.employmentType);
        if (p.salaryRange) {
          setSalaryMin(p.salaryRange.min);
          setSalaryMax(p.salaryRange.max);
        }
      }
    } catch (err: any) {
      alert(err.message || 'Failed to parse job description.');
    } finally {
      setIsParsingJd(false);
    }
  };

  const addRequiredSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      if (!requiredSkills.includes(skillInput.trim())) {
        setRequiredSkills([...requiredSkills, skillInput.trim()]);
      }
      setSkillInput('');
    }
  };

  const removeRequiredSkill = (name: string) => {
    setRequiredSkills(requiredSkills.filter((s) => s !== name));
  };

  const addPreferredSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && prefSkillInput.trim()) {
      e.preventDefault();
      if (!preferredSkills.includes(prefSkillInput.trim())) {
        setPreferredSkills([...preferredSkills, prefSkillInput.trim()]);
      }
      setPrefSkillInput('');
    }
  };

  const removePreferredSkill = (name: string) => {
    setPreferredSkills(preferredSkills.filter((s) => s !== name));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
      alert('Job title and description are required.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await apiRequest('/jobs', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description,
          requiredSkills,
          preferredSkills,
          minimumExperience,
          maximumExperience,
          location,
          isRemote,
          employmentType,
          salaryMin,
          salaryMax,
          weightsConfig: weights,
        }),
      });

      if (res.success) {
        navigate('/recruiter/jobs');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create job.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-[#C4F167]" />
          Create Job Opening & Candidate Match Profile
        </h1>
        <p className="text-xs text-[#A3A3A3] mt-1">
          Define job specifications manually or paste an existing JD to let AI automatically extract requirements and calibrate matching weights.
        </p>
      </div>

      {/* 1. AI JD PARSER BOX */}
      <JobzyCard className="p-6 border-[#C4F167]/30 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#C4F167]" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              AI Job Description Extractor
            </h3>
          </div>
          <span className="text-[11px] text-[#A3A3A3]">Paste text from any source</span>
        </div>

        <textarea
          rows={4}
          value={rawJdText}
          onChange={(e) => setRawJdText(e.target.value)}
          placeholder="Paste raw JD text here (e.g. 'We are hiring a Senior Backend Engineer with 4+ years in Node.js, PostgreSQL, Docker, AWS. Salary $140k-$170k...')..."
          className="w-full bg-[#161616] border border-[#2a2a2a] rounded-xl p-3 text-xs text-white placeholder-[#555555] focus:outline-none focus:border-[#C4F167]"
        />

        <div className="flex justify-end">
          <JobzyButton
            type="button"
            size="sm"
            variant="primary"
            isLoading={isParsingJd}
            leftIcon={<Sparkles className="w-3.5 h-3.5" />}
            onClick={handleParseJd}
          >
            Extract Requirements With AI
          </JobzyButton>
        </div>
      </JobzyCard>

      {/* 2. REQUISITION DETAILS FORM */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <JobzyCard className="p-6 space-y-5">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider pb-3 border-b border-[#222222]">
            Requisition Specifications
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="md:col-span-2">
              <label className="text-[#A3A3A3] font-semibold block mb-1">Job Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Full Stack Engineer (React / Node / Cloud)"
                className="w-full bg-[#161616] border border-[#2a2a2a] rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-[#C4F167]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-[#A3A3A3] font-semibold block mb-1">Full Description *</label>
              <textarea
                rows={5}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed role overview, team context, and responsibilities..."
                className="w-full bg-[#161616] border border-[#2a2a2a] rounded-xl p-3 text-white text-xs focus:outline-none focus:border-[#C4F167]"
              />
            </div>

            <div>
              <label className="text-[#A3A3A3] font-semibold block mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="San Francisco, CA"
                className="w-full bg-[#161616] border border-[#2a2a2a] rounded-xl px-3 py-2 text-white text-xs"
              />
            </div>

            <div className="flex items-center gap-4 pt-5">
              <label className="flex items-center gap-2 text-xs text-white cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isRemote}
                  onChange={(e) => setIsRemote(e.target.checked)}
                  className="rounded bg-[#1a1a1a] border-[#333333] text-[#C4F167] focus:ring-0"
                />
                <span>Eligible for 100% Remote Work</span>
              </label>
            </div>

            <div>
              <label className="text-[#A3A3A3] font-semibold block mb-1">
                Minimum Professional Seniority (Years)
              </label>
              <input
                type="number"
                step="0.5"
                value={minimumExperience}
                onChange={(e) => setMinimumExperience(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#161616] border border-[#2a2a2a] rounded-xl px-3 py-2 text-white text-xs"
              />
            </div>

            <div>
              <label className="text-[#A3A3A3] font-semibold block mb-1">
                Salary Range (Annual USD)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(parseInt(e.target.value, 10) || 0)}
                  placeholder="Min"
                  className="w-1/2 bg-[#161616] border border-[#2a2a2a] rounded-xl px-3 py-2 text-white text-xs"
                />
                <span className="text-[#777777]">-</span>
                <input
                  type="number"
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(parseInt(e.target.value, 10) || 0)}
                  placeholder="Max"
                  className="w-1/2 bg-[#161616] border border-[#2a2a2a] rounded-xl px-3 py-2 text-white text-xs"
                />
              </div>
            </div>
          </div>

          {/* Mandatory Skills */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-semibold text-white block">
              Required / Mandatory Skills (Press Enter to add)
            </label>
            <div className="flex flex-wrap gap-1.5 p-3 bg-[#161616] border border-[#2a2a2a] rounded-xl min-h-[50px]">
              {requiredSkills.map((s, idx) => (
                <SkillBadge
                  key={idx}
                  name={s}
                  status="matched"
                  size="sm"
                  onRemove={() => removeRequiredSkill(s)}
                />
              ))}
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={addRequiredSkill}
                placeholder="Type skill & press Enter..."
                className="bg-transparent text-xs text-white placeholder-[#555555] focus:outline-none flex-1 min-w-[150px]"
              />
            </div>
          </div>

          {/* Preferred Skills */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-semibold text-white block">
              Preferred / Nice-to-Have Skills (Press Enter to add)
            </label>
            <div className="flex flex-wrap gap-1.5 p-3 bg-[#161616] border border-[#2a2a2a] rounded-xl min-h-[50px]">
              {preferredSkills.map((s, idx) => (
                <SkillBadge
                  key={idx}
                  name={s}
                  status="preferred"
                  size="sm"
                  onRemove={() => removePreferredSkill(s)}
                />
              ))}
              <input
                type="text"
                value={prefSkillInput}
                onChange={(e) => setPrefSkillInput(e.target.value)}
                onKeyDown={addPreferredSkill}
                placeholder="Type nice-to-have & press Enter..."
                className="bg-transparent text-xs text-white placeholder-[#555555] focus:outline-none flex-1 min-w-[150px]"
              />
            </div>
          </div>
        </JobzyCard>

        {/* 3. CONFIGURABLE WEIGHTED SCORING MODEL */}
        <JobzyCard className="p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#222222]">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#C4F167]" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Configurable AI Match Weights (Total: 100%)
              </h3>
            </div>
            <span className="text-xs text-[#C4F167] font-bold">Transparent Formula</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[#A3A3A3]">Required Skills:</span>
                <span className="font-bold text-white">{weights.requiredSkills}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                value={weights.requiredSkills}
                onChange={(e) => setWeights({ ...weights, requiredSkills: parseInt(e.target.value, 10) })}
                className="w-full accent-[#C4F167]"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[#A3A3A3]">Experience Alignment:</span>
                <span className="font-bold text-white">{weights.experience}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="50"
                value={weights.experience}
                onChange={(e) => setWeights({ ...weights, experience: parseInt(e.target.value, 10) })}
                className="w-full accent-[#C4F167]"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[#A3A3A3]">Technical Depth & Breadth:</span>
                <span className="font-bold text-white">{weights.technicalDepth}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                value={weights.technicalDepth}
                onChange={(e) => setWeights({ ...weights, technicalDepth: parseInt(e.target.value, 10) })}
                className="w-full accent-[#C4F167]"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[#A3A3A3]">Project Architecture & Complexity:</span>
                <span className="font-bold text-white">{weights.projects}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                value={weights.projects}
                onChange={(e) => setWeights({ ...weights, projects: parseInt(e.target.value, 10) })}
                className="w-full accent-[#C4F167]"
              />
            </div>
          </div>
        </JobzyCard>

        <div className="flex justify-end gap-3 pt-2">
          <JobzyButton
            type="button"
            variant="secondary"
            size="md"
            onClick={() => navigate('/recruiter/jobs')}
          >
            Cancel
          </JobzyButton>
          <JobzyButton
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSubmitting}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Publish Job Opening
          </JobzyButton>
        </div>
      </form>
    </div>
  );
};
