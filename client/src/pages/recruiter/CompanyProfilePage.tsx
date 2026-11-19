import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../api/client';
import { JobzyCard } from '../../components/JobzyCard';
import { JobzyButton } from '../../components/JobzyButton';
import { Building2, Globe, MapPin, Users, Save } from 'lucide-react';

export const CompanyProfilePage: React.FC = () => {
  const [company, setCompany] = useState({
    name: 'TechVanguard Innovations',
    industry: 'Enterprise SaaS & Cloud Infrastructure',
    website: 'https://techvanguard.io',
    location: 'San Francisco, CA / Remote',
    size: '100-250 employees',
    description: 'Building next-generation distributed intelligence systems for high-growth tech teams.',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 600);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <Building2 className="w-6 h-6 text-[#C4F167]" />
          Company Profile & Brand Settings
        </h1>
        <p className="text-xs text-[#A3A3A3] mt-1">
          Candidate-facing organization profile displayed on your published requisitions.
        </p>
      </div>

      {success && (
        <div className="p-3 bg-[#C4F167]/15 border border-[#C4F167]/40 text-[#C4F167] rounded-xl text-xs font-semibold">
          Company profile updated successfully!
        </div>
      )}

      <form onSubmit={handleSave}>
        <JobzyCard className="p-6 space-y-4 text-xs">
          <div>
            <label className="text-[#A3A3A3] font-semibold block mb-1">Company Name</label>
            <input
              type="text"
              required
              value={company.name}
              onChange={(e) => setCompany({ ...company, name: e.target.value })}
              className="w-full bg-[#161616] border border-[#2a2a2a] rounded-xl p-2.5 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[#A3A3A3] font-semibold block mb-1">Industry</label>
              <input
                type="text"
                value={company.industry}
                onChange={(e) => setCompany({ ...company, industry: e.target.value })}
                className="w-full bg-[#161616] border border-[#2a2a2a] rounded-xl p-2.5 text-white"
              />
            </div>
            <div>
              <label className="text-[#A3A3A3] font-semibold block mb-1">Company Size</label>
              <input
                type="text"
                value={company.size}
                onChange={(e) => setCompany({ ...company, size: e.target.value })}
                className="w-full bg-[#161616] border border-[#2a2a2a] rounded-xl p-2.5 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[#A3A3A3] font-semibold block mb-1">Website URL</label>
              <input
                type="text"
                value={company.website}
                onChange={(e) => setCompany({ ...company, website: e.target.value })}
                className="w-full bg-[#161616] border border-[#2a2a2a] rounded-xl p-2.5 text-white"
              />
            </div>
            <div>
              <label className="text-[#A3A3A3] font-semibold block mb-1">Location</label>
              <input
                type="text"
                value={company.location}
                onChange={(e) => setCompany({ ...company, location: e.target.value })}
                className="w-full bg-[#161616] border border-[#2a2a2a] rounded-xl p-2.5 text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-[#A3A3A3] font-semibold block mb-1">Company Bio / Description</label>
            <textarea
              rows={4}
              value={company.description}
              onChange={(e) => setCompany({ ...company, description: e.target.value })}
              className="w-full bg-[#161616] border border-[#2a2a2a] rounded-xl p-3 text-white"
            />
          </div>

          <div className="pt-4 border-t border-[#222222] flex justify-end">
            <JobzyButton
              type="submit"
              size="md"
              variant="primary"
              isLoading={isSaving}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Company Profile
            </JobzyButton>
          </div>
        </JobzyCard>
      </form>
    </div>
  );
};
