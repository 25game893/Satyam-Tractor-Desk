
import React from 'react';
import { ActivityLog } from '../types';
import { Clock, History, User as UserIcon } from 'lucide-react';

interface ActivityLogsProps {
  logs: ActivityLog[];
}

const ActivityLogs: React.FC<ActivityLogsProps> = ({ logs }) => {
  return (
    <div className="space-y-10 pb-20">
      {/* ERP Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 bg-hw-accent text-white text-[10px] font-mono font-bold uppercase tracking-widest">
              AUDIT_LOG_V4
            </span>
            <span className="hw-label">
              Security & Activity Tracking Matrix
            </span>
          </div>
          <h1 className="text-5xl font-display font-bold text-hw-text tracking-tighter uppercase">
            System Activity Logs
          </h1>
          <p className="text-hw-muted font-mono text-sm">Full audit trail of all showroom operations and security events.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="hw-btn-primary px-8 py-4">
            Download CSV Audit
          </button>
        </div>
      </div>

      <div className="bg-hw-surface border border-hw-border shadow-sm overflow-hidden">
        <div className="p-6 bg-hw-bg border-b border-hw-border flex items-center justify-between">
          <span className="text-[10px] font-mono font-bold text-hw-muted uppercase tracking-widest flex items-center gap-3">
            <History size={16} className="text-hw-accent" /> Latest 500 Actions Recorded
          </span>
          <div className="flex items-center gap-2 px-3 py-1 bg-hw-surface border border-hw-border text-[9px] font-mono font-bold text-hw-muted uppercase">
            <div className="w-1.5 h-1.5 bg-hw-accent animate-pulse"></div>
            Real-time Monitoring
          </div>
        </div>
        <div className="max-h-[700px] overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <tbody className="divide-y divide-hw-border">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-hw-bg group transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-start gap-6">
                      <div className="w-12 h-12 bg-hw-bg border border-hw-border flex items-center justify-center text-hw-muted group-hover:border-hw-accent group-hover:text-hw-accent transition-all">
                        <UserIcon size={20} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-lg font-display font-bold text-hw-text uppercase tracking-tight group-hover:text-hw-accent transition-colors">
                          {log.action}
                        </p>
                        <p className="text-[10px] text-hw-muted font-mono font-bold uppercase tracking-widest">
                          Executed by <span className="text-hw-text">@{log.username}</span>
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-2 text-hw-muted font-mono font-bold text-[10px] uppercase tracking-tighter">
                        <Clock size={12} />
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </div>
                      <div className="text-[9px] font-mono font-bold text-hw-muted/50 uppercase">
                        {new Date(log.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={2} className="py-32 text-center text-hw-muted font-mono font-bold uppercase tracking-widest italic opacity-50">
                    No activity logs recorded in current buffer.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ActivityLogs;
