import React, { useState } from 'react';
import { JobzyCard } from '../../components/JobzyCard';
import { JobzyButton } from '../../components/JobzyButton';
import { Printer, Download, Sparkles, Plus, Trash2, CheckCircle2 } from 'lucide-react';

export const ResumeBuilder: React.FC = () => {
  const [template, setTemplate] = useState<'minimal' | 'modern' | 'tech'>('minimal');

  const [personal, setPersonal] = useState({
    name: 'Alex Rivera',
    email: 'alex@jobzy.ai',
    phone: '+1 (415) 890-4421',
    location: 'San Francisco, CA',
    title: 'Senior Full Stack & Cloud Engineer',
    linkedin: 'linkedin.com/in/alex-rivera-demo',
    github: 'github.com/alexrivera-demo',
  });

  const [summary, setSummary] = useState(
    'Senior Full Stack Engineer with 5+ years specializing in TypeScript, React, Node.js, and cloud-native architectures. Experienced building high-scale distributed systems, database optimization, and high-throughput microservices.'
  );

  const [skills, setSkills] = useState(
    'TypeScript, React.js, Node.js, PostgreSQL, AWS, Docker, REST APIs, GraphQL, Redis, CI/CD Pipelines, System Design'
  );

  const [experiences, setExperiences] = useState([
    {
      title: 'Senior Software Engineer',
      company: 'CloudVenture Labs',
      dates: '2022 - Present',
      bullets: [
        'Architected and delivered customer-facing dashboard in React 18 & TypeScript serving 180,000 DAU.',
        'Engineered high-throughput Node.js microservices processing 12M events daily with 99.98% uptime.',
        'Optimized PostgreSQL database schema and indexing strategies, reducing median API latency from 320ms to 85ms.',
      ],
    },
    {
      title: 'Full Stack Developer',
      company: 'NextGen Digital',
      dates: '2020 - 2022',
      bullets: [
        'Built responsive web interfaces with React and Tailwind CSS, increasing user engagement by 24%.',
        'Designed REST API microservices connected to PostgreSQL databases.',
      ],
    },
  ]);

  const [education, setEducation] = useState([
    {
      degree: 'B.S. in Computer Science',
      school: 'University of California, Berkeley',
      year: '2020',
      gpa: '3.85 / 4.0',
    },
  ]);

  const [projects, setProjects] = useState([
    {
      name: 'OmniStream Real-Time Analytics Platform',
      tech: 'React.js, Node.js, PostgreSQL, Redis, Docker',
      description: 'Distributed streaming platform handling 10k events/sec with WebSocket subscriptions and sub-second aggregation.',
    },
  ]);

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = `${personal.name.trim() || 'Resume'} - Jobzy`;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  const addExperience = () => {
    setExperiences([
      ...experiences,
      {
        title: 'Software Engineer',
        company: 'Company Name',
        dates: '2022 - Present',
        bullets: ['Led development of core features and automated test coverage.'],
      },
    ]);
  };

  const addBullet = (expIndex: number) => {
    const updated = [...experiences];
    updated[expIndex].bullets.push('Accomplished [X], measured by [Y], by doing [Z].');
    setExperiences(updated);
  };

  return (
    <div className="space-y-8 print:space-y-0 print:m-0 print:p-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-[#1f1f1f] print:hidden">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">AI Resume Builder</h1>
          <p className="text-xs text-[#A3A3A3] mt-1">
            Build clean, highly readable, 100% ATS-compliant resumes ready for PDF export.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <JobzyButton
            size="sm"
            variant="primary"
            leftIcon={<Printer className="w-4 h-4" />}
            onClick={handlePrint}
          >
            Print / Export PDF
          </JobzyButton>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start print:block print:w-full">
        {/* Left: Input Form Controls */}
        <div className="space-y-6 print:hidden">
          {/* Personal Info */}
          <JobzyCard className="p-5 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Personal Information
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[#A3A3A3] block mb-1">Full Name</label>
                <input
                  type="text"
                  value={personal.name}
                  onChange={(e) => setPersonal({ ...personal, name: e.target.value })}
                  className="w-full bg-[#161616] border border-[#282828] rounded-lg p-2 text-white"
                />
              </div>
              <div>
                <label className="text-[#A3A3A3] block mb-1">Professional Title</label>
                <input
                  type="text"
                  value={personal.title}
                  onChange={(e) => setPersonal({ ...personal, title: e.target.value })}
                  className="w-full bg-[#161616] border border-[#282828] rounded-lg p-2 text-white"
                />
              </div>
              <div>
                <label className="text-[#A3A3A3] block mb-1">Email</label>
                <input
                  type="email"
                  value={personal.email}
                  onChange={(e) => setPersonal({ ...personal, email: e.target.value })}
                  className="w-full bg-[#161616] border border-[#282828] rounded-lg p-2 text-white"
                />
              </div>
              <div>
                <label className="text-[#A3A3A3] block mb-1">Phone</label>
                <input
                  type="text"
                  value={personal.phone}
                  onChange={(e) => setPersonal({ ...personal, phone: e.target.value })}
                  className="w-full bg-[#161616] border border-[#282828] rounded-lg p-2 text-white"
                />
              </div>
              <div>
                <label className="text-[#A3A3A3] block mb-1">Location</label>
                <input
                  type="text"
                  value={personal.location}
                  onChange={(e) => setPersonal({ ...personal, location: e.target.value })}
                  className="w-full bg-[#161616] border border-[#282828] rounded-lg p-2 text-white"
                />
              </div>
              <div>
                <label className="text-[#A3A3A3] block mb-1">LinkedIn Profile</label>
                <input
                  type="text"
                  value={personal.linkedin}
                  onChange={(e) => setPersonal({ ...personal, linkedin: e.target.value })}
                  className="w-full bg-[#161616] border border-[#282828] rounded-lg p-2 text-white"
                />
              </div>
            </div>
          </JobzyCard>

          {/* Professional Summary */}
          <JobzyCard className="p-5 space-y-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Professional Summary
            </h3>
            <textarea
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full bg-[#161616] border border-[#282828] rounded-lg p-2.5 text-xs text-white"
            />
          </JobzyCard>

          {/* Skills */}
          <JobzyCard className="p-5 space-y-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Skills (Comma Separated)
            </h3>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className="w-full bg-[#161616] border border-[#282828] rounded-lg p-2.5 text-xs text-white"
            />
          </JobzyCard>

          {/* Experience list */}
          <JobzyCard className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Work Experience
              </h3>
              <button
                type="button"
                onClick={addExperience}
                className="text-xs text-[#C4F167] font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Position
              </button>
            </div>

            {experiences.map((exp, idx) => (
              <div key={idx} className="bg-[#161616] p-3.5 rounded-xl border border-[#262626] space-y-2 text-xs">
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={exp.title}
                    onChange={(e) => {
                      const updated = [...experiences];
                      updated[idx].title = e.target.value;
                      setExperiences(updated);
                    }}
                    placeholder="Job Title"
                    className="bg-[#111111] p-2 rounded border border-[#333333] text-white"
                  />
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) => {
                      const updated = [...experiences];
                      updated[idx].company = e.target.value;
                      setExperiences(updated);
                    }}
                    placeholder="Company"
                    className="bg-[#111111] p-2 rounded border border-[#333333] text-white"
                  />
                  <input
                    type="text"
                    value={exp.dates}
                    onChange={(e) => {
                      const updated = [...experiences];
                      updated[idx].dates = e.target.value;
                      setExperiences(updated);
                    }}
                    placeholder="2022 - Present"
                    className="bg-[#111111] p-2 rounded border border-[#333333] text-white"
                  />
                </div>

                <div className="space-y-1.5 pt-1">
                  {exp.bullets.map((b, bi) => (
                    <input
                      key={bi}
                      type="text"
                      value={b}
                      onChange={(e) => {
                        const updated = [...experiences];
                        updated[idx].bullets[bi] = e.target.value;
                        setExperiences(updated);
                      }}
                      className="w-full bg-[#111111] p-1.5 rounded border border-[#333333] text-white text-[11px]"
                    />
                  ))}
                  <button
                    type="button"
                    onClick={() => addBullet(idx)}
                    className="text-[11px] text-[#A3A3A3] hover:text-[#C4F167] flex items-center gap-1 pt-1 cursor-pointer"
                  >
                    + Add bullet point
                  </button>
                </div>
              </div>
            ))}
          </JobzyCard>
        </div>

        {/* Right: Live A4 Formatted Document Preview */}
        <div
          id="printable-resume"
          className="resume-sheet sticky top-20 bg-white text-black p-8 sm:p-10 rounded-2xl shadow-2xl border border-gray-300 font-sans print:static print:m-0 print:border-none print:shadow-none print:rounded-none print:w-full print:max-w-none print:min-h-0 min-h-[750px]"
        >
          {/* Header */}
          <div className="border-b-2 border-black pb-4 text-center break-inside-avoid print:break-inside-avoid">
            <h2 className="text-2xl font-black uppercase tracking-tight text-black">{personal.name}</h2>
            <p className="text-xs font-semibold text-gray-700 mt-1">{personal.title}</p>
            <p className="text-[11px] text-gray-600 mt-1 space-x-2">
              <span>{personal.email}</span> • <span>{personal.phone}</span> • <span>{personal.location}</span>
            </p>
            <p className="text-[10px] text-gray-500 font-mono mt-0.5 space-x-2">
              <span>{personal.linkedin}</span> • <span>{personal.github}</span>
            </p>
          </div>

          {/* Summary */}
          {summary && (
            <div className="mt-4 break-inside-avoid print:break-inside-avoid">
              <h3 className="text-xs font-bold uppercase tracking-wider border-b border-gray-400 pb-0.5 text-black">
                Professional Summary
              </h3>
              <p className="text-[11px] leading-relaxed text-gray-800 mt-1.5">{summary}</p>
            </div>
          )}

          {/* Skills */}
          {skills && (
            <div className="mt-4 break-inside-avoid print:break-inside-avoid">
              <h3 className="text-xs font-bold uppercase tracking-wider border-b border-gray-400 pb-0.5 text-black">
                Technical Skills
              </h3>
              <p className="text-[11px] text-gray-800 mt-1.5 leading-normal">{skills}</p>
            </div>
          )}

          {/* Experience */}
          <div className="mt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider border-b border-gray-400 pb-0.5 text-black">
              Work Experience
            </h3>
            <div className="space-y-3 mt-2">
              {experiences.map((exp, i) => (
                <div key={i} className="text-[11px] break-inside-avoid print:break-inside-avoid">
                  <div className="flex justify-between font-bold text-gray-900">
                    <span>{exp.title} | {exp.company}</span>
                    <span className="font-normal text-gray-600">{exp.dates}</span>
                  </div>
                  <ul className="list-disc pl-4 mt-1 space-y-1 text-gray-800">
                    {exp.bullets.map((b, bi) => (
                      <li key={bi}>{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Education */}
          <div className="mt-4 break-inside-avoid print:break-inside-avoid">
            <h3 className="text-xs font-bold uppercase tracking-wider border-b border-gray-400 pb-0.5 text-black">
              Education
            </h3>
            <div className="space-y-1.5 mt-2 text-[11px]">
              {education.map((edu, i) => (
                <div key={i} className="flex justify-between text-gray-800">
                  <span className="font-bold">{edu.degree} — {edu.school}</span>
                  <span className="text-gray-600">{edu.year} {edu.gpa ? `(GPA: ${edu.gpa})` : ''}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Projects */}
          <div className="mt-4 break-inside-avoid print:break-inside-avoid">
            <h3 className="text-xs font-bold uppercase tracking-wider border-b border-gray-400 pb-0.5 text-black">
              Key Projects
            </h3>
            <div className="space-y-2 mt-2 text-[11px]">
              {projects.map((proj, i) => (
                <div key={i} className="break-inside-avoid print:break-inside-avoid">
                  <div className="flex justify-between font-bold text-gray-900">
                    <span>{proj.name}</span>
                    <span className="font-mono text-[10px] text-gray-600 font-normal">{proj.tech}</span>
                  </div>
                  <p className="text-gray-800 mt-0.5">{proj.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
