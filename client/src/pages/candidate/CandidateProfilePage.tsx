import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../api/client';
import { JobzyCard } from '../../components/JobzyCard';
import { JobzyButton } from '../../components/JobzyButton';
import { User, Phone, MapPin, Linkedin, Github, Globe, Briefcase, Save } from 'lucide-react';

export const CandidateProfilePage: React.FC = () => {
  const [profile, setProfile] = useState({
    title: '',
    phone: '',
    location: '',
    bio: '',
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',
    experienceYears: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const res = await apiRequest<{ success: boolean; profile: any }>('/candidates/profile');
      if (res.success && res.profile) {
        setProfile({
          title: res.profile.title || '',
          phone: res.profile.phone || '',
          location: res.profile.location || '',
          bio: res.profile.bio || '',
          linkedinUrl: res.profile.linkedinUrl || '',
          githubUrl: res.profile.githubUrl || '',
          portfolioUrl: res.profile.portfolioUrl || '',
          experienceYears: res.profile.experienceYears || 0,
        });
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setSuccessMessage(null);
      const res = await apiRequest('/candidates/profile', {
        method: 'PUT',
        body: JSON.stringify(profile),
      });
      if (res.success) {
        setSuccessMessage('Profile updated successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Candidate Profile Settings</h1>
        <p className="text-xs text-[#A3A3A3] mt-1">
          Keep your professional details and contact links up-to-date for recruiter verification.
        </p>
      </div>

      {successMessage && (
        <div className="p-3 bg-[#C4F167]/15 border border-[#C4F167]/40 text-[#C4F167] rounded-xl text-xs font-semibold">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSave}>
        <JobzyCard className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-[#A3A3A3] font-semibold block mb-1">Professional Title</label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-[#666666] absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={profile.title}
                  onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                  placeholder="e.g. Senior Full Stack & Cloud Engineer"
                  className="w-full bg-[#161616] border border-[#2a2a2a] rounded-xl pl-9 pr-3 py-2 text-white text-xs focus:outline-none focus:border-[#C4F167]"
                />
              </div>
            </div>

            <div>
              <label className="text-[#A3A3A3] font-semibold block mb-1">Years of Experience</label>
              <input
                type="number"
                step="0.5"
                value={profile.experienceYears}
                onChange={(e) => setProfile({ ...profile, experienceYears: parseFloat(e.target.value) || 0 })}
                className="w-full bg-[#161616] border border-[#2a2a2a] rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-[#C4F167]"
              />
            </div>

            <div>
              <label className="text-[#A3A3A3] font-semibold block mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#666666] absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="+1 (415) 890-4421"
                  className="w-full bg-[#161616] border border-[#2a2a2a] rounded-xl pl-9 pr-3 py-2 text-white text-xs focus:outline-none focus:border-[#C4F167]"
                />
              </div>
            </div>

            <div>
              <label className="text-[#A3A3A3] font-semibold block mb-1">Location</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-[#666666] absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={profile.location}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  placeholder="San Francisco, CA / Remote"
                  className="w-full bg-[#161616] border border-[#2a2a2a] rounded-xl pl-9 pr-3 py-2 text-white text-xs focus:outline-none focus:border-[#C4F167]"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="text-[#A3A3A3] font-semibold block mb-1">Bio / Executive Summary</label>
              <textarea
                rows={3}
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                className="w-full bg-[#161616] border border-[#2a2a2a] rounded-xl p-3 text-white text-xs focus:outline-none focus:border-[#C4F167]"
              />
            </div>

            <div>
              <label className="text-[#A3A3A3] font-semibold block mb-1">LinkedIn URL</label>
              <div className="relative">
                <Linkedin className="w-4 h-4 text-[#666666] absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={profile.linkedinUrl}
                  onChange={(e) => setProfile({ ...profile, linkedinUrl: e.target.value })}
                  className="w-full bg-[#161616] border border-[#2a2a2a] rounded-xl pl-9 pr-3 py-2 text-white text-xs focus:outline-none focus:border-[#C4F167]"
                />
              </div>
            </div>

            <div>
              <label className="text-[#A3A3A3] font-semibold block mb-1">GitHub URL</label>
              <div className="relative">
                <Github className="w-4 h-4 text-[#666666] absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={profile.githubUrl}
                  onChange={(e) => setProfile({ ...profile, githubUrl: e.target.value })}
                  className="w-full bg-[#161616] border border-[#2a2a2a] rounded-xl pl-9 pr-3 py-2 text-white text-xs focus:outline-none focus:border-[#C4F167]"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-[#222222]">
            <JobzyButton
              type="submit"
              size="md"
              variant="primary"
              isLoading={isSaving}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Profile Changes
            </JobzyButton>
          </div>
        </JobzyCard>
      </form>
    </div>
  );
};
