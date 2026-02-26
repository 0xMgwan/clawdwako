"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, RefreshCw, Download } from "lucide-react";

interface LogEntry {
  id: string;
  timestamp: string;
  type: 'message' | 'api_call' | 'error' | 'gateway' | 'config' | 'info';
  content: string;
  metadata?: any;
}

interface ViewLogsModalProps {
  bot: any;
  onClose: () => void;
}

export function ViewLogsModal({ bot, onClose }: ViewLogsModalProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLogs();
  }, [bot.id]);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch real logs from Railway via OpenClaw instances API
      const response = await fetch(`/api/openclaw/instances/${bot.id}/logs`);
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
      } else {
        const errData = await response.json();
        setError(errData.message || 'Failed to fetch logs');
        setLogs([]);
      }
    } catch (err) {
      console.error('Error fetching logs:', err);
      setError('Failed to connect to logs service');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const getLogTypeColor = (type: string) => {
    switch (type) {
      case 'message': return 'bg-blue-500/10 text-blue-500';
      case 'api_call': return 'bg-green-500/10 text-green-500';
      case 'error': return 'bg-red-500/10 text-red-500';
      case 'gateway': return 'bg-purple-500/10 text-purple-500';
      case 'config': return 'bg-yellow-500/10 text-yellow-500';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Activity Logs</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{bot.name}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={fetchLogs}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Total Events</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{logs.length}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Messages</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {logs.filter(l => l.type === 'message').length}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">API Calls</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {logs.filter(l => l.type === 'api_call').length}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Errors</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {logs.filter(l => l.type === 'error').length}
            </p>
          </div>
        </div>

        {/* Logs List */}
        <div className="flex-1 overflow-y-auto space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 font-medium">Failed to fetch logs</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchLogs} className="mt-4">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">No logs yet</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Logs will appear here once your bot starts receiving messages
              </p>
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Badge className={`${getLogTypeColor(log.type)} text-xs px-2 py-1`}>
                      {log.type.replace('_', ' ')}
                    </Badge>
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{log.content}</p>
                {log.metadata && (
                  <pre className="text-xs font-mono text-gray-700 dark:text-gray-300 mt-2 bg-gray-200 dark:bg-gray-900 rounded p-2 overflow-x-auto">
                    {JSON.stringify(log.metadata, null, 2)}
                  </pre>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
            Showing last 50 events
          </p>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Logs
          </Button>
        </div>
      </div>
    </div>
  );
}
