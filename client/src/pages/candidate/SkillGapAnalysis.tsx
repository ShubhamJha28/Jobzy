import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../api/client';
import { JobzyCard } from '../../components/JobzyCard';
import { SkillBadge } from '../../components/SkillBadge';
import { LoadingIndicator } from '../../components/LoadingIndicator';
import { BarChart3, Layers, BookOpen, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const SkillGapAnalysis: React.FC = () => {
  const [profile, setProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const res = await apiRequest<{ success: boolean; profile: any }>('/candidates/profile');
      if (res.success) setProfile(res.profile);
    } catch (err) {
      console.error('Failed to load profile skills:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingIndicator label="Generating skill intelligence radar..." />;
  }

  const skills: any[] = profile?.skills || [];

  const categories = [
    {
      title: 'Frontend & Reactive UI',
      skills: ['React.js', 'TypeScript', 'JavaScript', 'Next.js', 'Tailwind CSS', 'HTML5/CSS3'],
    },
    {
      title: 'Backend & Distributed Services',
      skills: ['Node.js', 'REST APIs', 'GraphQL', 'Python', 'Go (Golang)', 'Microservices'],
    },
    {
      title: 'Databases & In-Memory Stores',
      skills: ['PostgreSQL', 'Redis', 'Prisma ORM', 'MongoDB'],
    },
    {
      title: 'Cloud & Infrastructure',
      skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD Pipelines', 'Terraform'],
    },
    {
      title: 'AI, LLMs & Vector Intelligence',
      skills: ['Machine Learning', 'LLM & Generative AI', 'Vector Databases'],
    },
    {
      title: 'Engineering Leadership & Architecture',
      skills: ['System Design', 'Technical Leadership', 'Agile / Scrum', 'Problem Solving'],
    },
  ];

  const candidateSkillNames = new Set(skills.map((s) => s.skill?.name));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
          <BarChart3 className="w-6 h-6 text-[#C4F167]" />
          Skill Taxonomy & Gap Radar
        </h1>
        <p className="text-xs text-[#A3A3A3] mt-1">
          Detailed breakdown of your technical and architectural skills across 6 core industry domains.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat, idx) => {
          const matchedCount = cat.skills.filter((s) => candidateSkillNames.has(s)).length;
          const percentage = Math.round((matchedCount / cat.skills.length) * 100);

          return (
            <JobzyCard key={idx} className="p-6 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">{cat.title}</h3>
                  <span className="text-xs font-bold text-[#C4F167] bg-[#C4F167]/10 px-2 py-0.5 rounded-full">
                    {percentage}%
                  </span>
                </div>

                <div className="h-1.5 w-full bg-[#1e1e1e] rounded-full overflow-hidden mt-3 mb-4">
                  <div
                    className="h-full bg-[#C4F167] rounded-full transition-all duration-700"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {cat.skills.map((s, si) => {
                    const isMatched = candidateSkillNames.has(s);
                    return (
                      <SkillBadge
                        key={si}
                        name={s}
                        status={isMatched ? 'matched' : 'missing'}
                        size="sm"
                      />
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-[#1f1f1f] text-[11px] text-[#777777] flex items-center justify-between">
                <span>{matchedCount} of {cat.skills.length} verified</span>
                <span className="text-[#C4F167] font-medium">Inferred Proficiency</span>
              </div>
            </JobzyCard>
          );
        })}
      </div>
    </div>
  );
};
