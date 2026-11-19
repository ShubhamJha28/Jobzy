import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../../api/client';
import { ResumeUploadZone } from '../../components/ResumeUploadZone';
import { JobzyCard } from '../../components/JobzyCard';
import { JobzyButton } from '../../components/JobzyButton';
import { ScoreIndicator } from '../../components/ScoreIndicator';
import { Modal } from '../../components/Modal';
import { LoadingIndicator } from '../../components/LoadingIndicator';
import { FileText, Sparkles, Trash2, Eye, Calendar, CheckCircle2 } from 'lucide-react';

export const ResumeManager: React.FC = () => {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedResume, setSelectedResume] = useState<any | null>(null);

  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = async () => {
    try {
      setIsLoading(true);
      const res = await apiRequest<{ success: boolean; resumes: any[] }>('/resumes');
      if (res.success) {
        setResumes(res.resumes || []);
      }
    } catch (err) {
      console.error('Failed to load resumes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (file: File) => {
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('resume', file);

      const res = await apiRequest<{ success: boolean; resume: any }>('/resumes/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.success) {
        await loadResumes();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to upload resume.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resume?')) return;
    try {
      await apiRequest(`/resumes/${id}`, { method: 'DELETE' });
      setResumes((prev) => prev.filter((r) => r.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete resume.');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Resume Management</h1>
        <p className="text-xs text-[#A3A3A3] mt-1">
          Upload and maintain your resume files. Our engine automatically parses contacts, work history, projects, and calculates ATS readability.
        </p>
      </div>

      {/* Upload Zone */}
      <JobzyCard className="p-6">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#C4F167]" />
          Upload New Resume
        </h3>
        <ResumeUploadZone onFileUpload={handleUpload} isLoading={isUploading} />
      </JobzyCard>

      {/* Resumes List */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider text-[#A3A3A3]">
          Uploaded Resumes ({resumes.length})
        </h3>

        {isLoading ? (
          <LoadingIndicator label="Loading resume files..." />
        ) : resumes.length === 0 ? (
          <JobzyCard className="text-center py-12">
            <FileText className="w-10 h-10 text-[#666666] mx-auto mb-3" />
            <h4 className="text-base font-bold text-white">No Resumes Uploaded Yet</h4>
            <p className="text-xs text-[#A3A3A3] max-w-sm mx-auto mt-1">
              Upload your first resume in PDF or DOCX format above to start analyzing job matches.
            </p>
          </JobzyCard>
        ) : (
          <div className="space-y-3">
            {resumes.map((resume) => {
              const parsed = resume.parsedData ? JSON.parse(resume.parsedData) : null;

              return (
                <div
                  key={resume.id}
                  className="bg-[#111111] border border-[#242424] hover:border-[#383838] p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#191919] border border-[#2e2e2e] flex items-center justify-center text-[#C4F167] shrink-0">
                      <FileText className="w-6 h-6" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-sm">{resume.originalFileName}</h4>
                        {resume.isPrimary && (
                          <span className="text-[10px] bg-[#C4F167]/15 text-[#C4F167] px-2 py-0.5 rounded-full font-bold border border-[#C4F167]/30">
                            Primary Resume
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-[#888888] mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          Uploaded on {new Date(resume.createdAt).toLocaleDateString()}
                        </span>
                        {parsed?.skills && (
                          <span>• {parsed.skills.length} skills detected</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-5 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-[#222222]">
                    <ScoreIndicator score={resume.atsScore || 90} size="sm" label="ATS Score" />

                    <div className="flex items-center gap-2">
                      <JobzyButton
                        size="sm"
                        variant="secondary"
                        leftIcon={<Eye className="w-3.5 h-3.5" />}
                        onClick={() => setSelectedResume(resume)}
                      >
                        Parsed Data
                      </JobzyButton>

                      <JobzyButton
                        size="sm"
                        variant="primary"
                        leftIcon={<Sparkles className="w-3.5 h-3.5" />}
                        onClick={() => navigate(`/candidate/analyze?resumeId=${resume.id}`)}
                      >
                        Analyze Fit
                      </JobzyButton>

                      <button
                        onClick={() => handleDelete(resume.id)}
                        className="p-2 rounded-xl border border-[#2a2a2a] text-[#888888] hover:text-red-400 hover:border-red-900/40 transition-colors cursor-pointer"
                        title="Delete resume"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Parsed Data Preview Modal */}
      <Modal
        isOpen={Boolean(selectedResume)}
        onClose={() => setSelectedResume(null)}
        title={`Parsed Resume: ${selectedResume?.originalFileName}`}
        maxWidth="2xl"
      >
        {selectedResume && (
          <div className="space-y-4 text-xs">
            {(() => {
              const parsed = selectedResume.parsedData ? JSON.parse(selectedResume.parsedData) : null;
              if (!parsed) return <p className="text-[#888888]">No structured JSON data available.</p>;

              return (
                <div className="space-y-4">
                  {/* Personal info */}
                  <div className="bg-[#161616] p-4 rounded-xl border border-[#282828] space-y-1">
                    <p className="font-bold text-white text-sm">{parsed.personal?.name}</p>
                    <p className="text-[#A3A3A3]">{parsed.personal?.email} • {parsed.personal?.phone} • {parsed.personal?.location}</p>
                    <p className="text-[#C4F167] font-mono text-[11px]">{parsed.personal?.linkedin} {parsed.personal?.github}</p>
                  </div>

                  {/* Skills */}
                  <div>
                    <h5 className="font-bold text-white mb-2">Extracted Skills ({parsed.skills?.length})</h5>
                    <div className="flex flex-wrap gap-1.5">
                      {parsed.skills?.map((s: string, idx: number) => (
                        <span key={idx} className="bg-[#1f1f1f] text-white px-2.5 py-1 rounded-lg border border-[#333333]">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Summary */}
                  {parsed.summary && (
                    <div>
                      <h5 className="font-bold text-white mb-1">Extracted Summary</h5>
                      <p className="text-[#A3A3A3] leading-relaxed bg-[#141414] p-3 rounded-xl border border-[#222222]">
                        {parsed.summary}
                      </p>
                    </div>
                  )}

                  {/* Experience Timeline */}
                  <div>
                    <h5 className="font-bold text-white mb-1">
                      Timeline: {parsed.totalExperienceYears} yrs documented experience
                    </h5>
                    <div className="space-y-2 mt-2">
                      {parsed.experience?.map((exp: any, i: number) => (
                        <div key={i} className="bg-[#161616] p-3 rounded-xl border border-[#262626]">
                          <p className="font-semibold text-white">{exp.title} • {exp.company}</p>
                          <p className="text-[11px] text-[#888888]">{exp.startDate} - {exp.endDate}</p>
                          {exp.responsibilities?.length > 0 && (
                            <ul className="mt-1.5 space-y-1 text-[#A3A3A3] pl-3 list-disc">
                              {exp.responsibilities.slice(0, 3).map((r: string, ri: number) => (
                                <li key={ri}>{r}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </Modal>
    </div>
  );
};
