import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../api/client';
import { JobzyCard } from '../../components/JobzyCard';
import { LoadingIndicator } from '../../components/LoadingIndicator';
import { ShieldCheck, Clock, Terminal } from 'lucide-react';

export const AdminAuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setIsLoading(true);
      const res = await apiRequest<{ success: boolean; logs: any[] }>('/admin/logs');
      if (res.success) {
        setLogs(res.logs || []);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <Terminal className="w-6 h-6 text-[#C4F167]" />
          Platform System Audit Logs
        </h1>
        <p className="text-xs text-[#A3A3A3] mt-1">
          Immutable audit trail recording security events, authentication attempts, resume uploads, and role assignments.
        </p>
      </div>

      {isLoading ? (
        <LoadingIndicator label="Streaming audit records..." />
      ) : logs.length === 0 ? (
        <JobzyCard className="text-center py-12 text-xs text-[#888888]">
          No audit entries recorded yet.
        </JobzyCard>
      ) : (
        <JobzyCard className="p-0 overflow-hidden border-[#242424]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#D1D1D1]">
              <thead className="bg-[#161616] border-b border-[#242424] text-[11px] uppercase tracking-wider text-[#888888]">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Resource</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e1e1e] font-mono text-[11px]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#141414] transition-colors">
                    <td className="py-3 px-4 text-[#888888]">
                      {new Date(log.createdAt).toLocaleTimeString()} {new Date(log.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 font-bold text-[#C4F167]">
                      {log.action}
                    </td>
                    <td className="py-3 px-4 text-white">{log.resource}</td>
                    <td className="py-3 px-4 text-[#A3A3A3]">
                      {log.user ? `${log.user.name} (${log.user.role})` : 'System / Anonymous'}
                    </td>
                    <td className="py-3 px-4 text-[#777777]">{log.ipAddress || '127.0.0.1'}</td>
                    <td className="py-3 px-4 text-[#888888] max-w-xs truncate">
                      {log.details || '—'}
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
