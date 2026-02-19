"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, RefreshCw, Download } from "lucide-react";

interface LogEntry {
  id: string;
  timestamp: Date;
  type: 'message' | 'api_call' | 'error' | 'webhook';
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

  useEffect(() => {
    fetchLogs();
  }, [bot.id]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/bots/${bot.id}/logs`);
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
      } else {
        // Mock logs for now
        setLogs([
          {
            id: '1',
            timestamp: new Date(),
            type: 'webhook',
            content: 'Webhook received from Telegram',
            metadata: { chatId: '123456' }
          },
          {
            id: '2',
            timestamp: new Date(Date.now() - 60000),
            type: 'message',
            content: 'User message: "Hello bot"',
            metadata: { userId: '123456', messageId: '789' }
          },
          {
            id: '3',
            timestamp: new Date(Date.now() - 120000),
            type: 'api_call',
            content: 'Claude API call successful',
            metadata: { model: 'claude-3-5-sonnet', tokens: 150 }
          },
          {
            id: '4',
            timestamp: new Date(Date.now() - 180000),
            type: 'message',
            content: 'Bot response: "Hello! How can I help you today?"',
            metadata: { messageId: '790' }
          },
        ]);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLogTypeColor = (type: string) => {
    switch (type) {
      case 'message': return 'bg-blue-500/10 text-blue-500';
      case 'api_call': return 'bg-green-500/10 text-green-500';
      case 'error': return 'bg-red-500/10 text-red-500';
      case 'webhook': return 'bg-purple-500/10 text-purple-500';
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
