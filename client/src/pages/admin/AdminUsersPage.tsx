import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../api/client';
import { JobzyCard } from '../../components/JobzyCard';
import { JobzyButton } from '../../components/JobzyButton';
import { LoadingIndicator } from '../../components/LoadingIndicator';
import { Users, Search, ShieldCheck, Eye } from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const { impersonate } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const handleSimulateUser = async (userObj: any) => {
    try {
      const target = await impersonate({ userId: userObj.id });
      if (target.role === 'CANDIDATE') navigate('/candidate/dashboard');
      else if (target.role === 'RECRUITER') navigate('/recruiter/dashboard');
      else navigate('/admin/dashboard');
    } catch (err: any) {
      alert(err.message || 'Failed to simulate user.');
    }
  };

  useEffect(() => {
    loadUsers();
  }, [searchTerm, roleFilter]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const params: any = {};
      if (searchTerm) params.search = searchTerm;
      if (roleFilter !== 'ALL') params.role = roleFilter;

      const res = await apiRequest<{ success: boolean; users: any[] }>('/admin/users', { params });
      if (res.success) {
        setUsers(res.users || []);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      await apiRequest(`/admin/users/${userId}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role: newRole }),
      });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to update user role.');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <Users className="w-6 h-6 text-[#C4F167]" />
          Platform User Directory & Role-Based Access Control
        </h1>
        <p className="text-xs text-[#A3A3A3] mt-1">
          Review registered candidates, recruiters, and platform administrators. Modify roles and access levels.
        </p>
      </div>

      {/* Filter toolbar */}
      <div className="bg-[#111111] border border-[#242424] p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#666666] absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full bg-[#181818] border border-[#2e2e2e] rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-[#C4F167]"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="bg-[#181818] border border-[#2e2e2e] rounded-xl px-4 py-2 text-xs text-white"
        >
          <option value="ALL">All Roles</option>
          <option value="CANDIDATE">Candidates Only</option>
          <option value="RECRUITER">Recruiters Only</option>
          <option value="ADMIN">Administrators Only</option>
        </select>
      </div>

      {isLoading ? (
        <LoadingIndicator label="Loading user directory..." />
      ) : (
        <JobzyCard className="p-0 overflow-hidden border-[#242424]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#D1D1D1]">
              <thead className="bg-[#161616] border-b border-[#242424] text-[11px] uppercase tracking-wider text-[#888888]">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Current Role</th>
                  <th className="py-3 px-4">Joined Date</th>
                  <th className="py-3 px-4 text-right">Actions & Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e1e1e]">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-[#141414] transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white flex items-center gap-2.5">
                      <img
                        src={u.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.name)}`}
                        alt={u.name}
                        className="w-7 h-7 rounded-lg object-cover"
                      />
                      <span>{u.name}</span>
                    </td>
                    <td className="py-3.5 px-4 text-[#A3A3A3]">{u.email}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                          u.role === 'ADMIN'
                            ? 'bg-purple-950/40 text-purple-300 border border-purple-800'
                            : u.role === 'RECRUITER'
                            ? 'bg-[#C4F167]/15 text-[#C4F167] border border-[#C4F167]/30'
                            : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#777777]">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleSimulateUser(u)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#222222] hover:bg-[#C4F167] hover:text-black text-[11px] font-semibold text-white transition-all cursor-pointer"
                          title={`Simulate ${u.name}'s account`}
                        >
                          <Eye className="w-3 h-3" />
                          <span>View As</span>
                        </button>
                        <select
                          value={u.role}
                          onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                          className="bg-[#181818] border border-[#2e2e2e] rounded-lg px-2 py-1 text-xs text-white"
                        >
                          <option value="CANDIDATE">Candidate</option>
                          <option value="RECRUITER">Recruiter</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </JobzyCard>
      )}
    </div>
  );
};
