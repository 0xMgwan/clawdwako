"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Save } from "lucide-react";

interface ConfigureModalProps {
  bot: any;
  onClose: () => void;
  onSave: (botId: string, data: any) => void;
}

export function ConfigureModal({ bot, onClose, onSave }: ConfigureModalProps) {
  const [selectedModel, setSelectedModel] = useState(bot.selectedModel || bot.model || 'claude-opus-4-20250514');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(bot.id, { selectedModel });
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Configure Bot</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{bot.name}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Bot Info */}
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Bot Username</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{bot.telegramBotUsername}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Status</p>
              <Badge className="text-xs">{bot.status}</Badge>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Created</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {new Date(bot.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Messages</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{bot.messages || 0}</p>
            </div>
          </div>
        </div>

        {/* AI Model Selection */}
        <div className="mb-6">
          <label className="text-sm font-semibold text-gray-900 dark:text-white mb-3 block">AI Model</label>
          <div className="space-y-3">
            {/* Claude Models */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <img src="/Claude-ai-logo.png" alt="Claude" className="w-4 h-4" />
                <span className="text-xs font-semibold text-gray-900 dark:text-white">Claude (Anthropic)</span>
              </div>
              <select
                value={selectedModel?.includes('claude') ? selectedModel : ''}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full p-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:border-green-400 focus:outline-none"
              >
                <option value="claude-opus-4-6">Opus 4.6 - Latest (Feb 2026)</option>
                <option value="claude-sonnet-4-6">Sonnet 4.6 - Latest (Feb 2026)</option>
                <option value="claude-opus-4-5">Opus 4.5 - Advanced</option>
                <option value="claude-sonnet-4-5">Sonnet 4.5 - Production</option>
                <option value="claude-haiku-4-5">Haiku 4.5 - Fast</option>
                <option value="claude-opus-4-1">Opus 4.1 - Agentic</option>
                <option value="claude-opus-4-20250514">Opus 4 (May 2025)</option>
                <option value="claude-sonnet-4">Sonnet 4</option>
                <option value="claude-3-7-sonnet-20250219">3.7 Sonnet</option>
                <option value="claude-3-5-sonnet-20241022">3.5 Sonnet</option>
                <option value="claude-3-5-haiku-20241022">3.5 Haiku</option>
              </select>
            </div>

            {/* GPT Models */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <img src="/gpt.png" alt="GPT" className="w-4 h-4" />
                <span className="text-xs font-semibold text-gray-900 dark:text-white">GPT (OpenAI)</span>
              </div>
              <select
                value={selectedModel?.includes('gpt') || selectedModel?.includes('o1') || selectedModel?.includes('o3') ? selectedModel : ''}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full p-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:border-green-400 focus:outline-none"
              >
                <option value="gpt-5.3-codex-spark">GPT-5.3 Codex Spark (Feb 2026)</option>
                <option value="gpt-5.2">GPT-5.2 - Smarter (2026)</option>
                <option value="gpt-5.1-codex-max">GPT-5.1 Codex Max</option>
                <option value="gpt-5.1-thinking">GPT-5.1 Thinking</option>
                <option value="gpt-5.1-instant">GPT-5.1 Instant</option>
                <option value="gpt-5.1">GPT-5.1 (Nov 2025)</option>
                <option value="gpt-5">GPT-5</option>
                <option value="o3-pro">o3-pro (Feb 2026)</option>
                <option value="o3">o3 - Reasoning</option>
                <option value="o3-mini">o3-mini - Fast</option>
                <option value="gpt-4.1">GPT-4.1 (2026)</option>
                <option value="o1-pro">o1-pro</option>
                <option value="o1">o1</option>
                <option value="gpt-4o">GPT-4o</option>
                <option value="gpt-4o-mini">GPT-4o Mini</option>
                <option value="gpt-4-turbo">GPT-4 Turbo</option>
                <option value="gpt-4">GPT-4</option>
              </select>
            </div>

            {/* Gemini Models */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <img src="/google gemini.png" alt="Gemini" className="w-4 h-4" />
                <span className="text-xs font-semibold text-gray-900 dark:text-white">Gemini (Google)</span>
              </div>
              <select
                value={selectedModel?.includes('gemini') ? selectedModel : ''}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full p-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:border-green-400 focus:outline-none"
              >
                <option value="gemini-2.0-flash-exp">2.0 Flash Exp</option>
                <option value="gemini-2.0-flash-thinking-exp-1219">2.0 Flash Thinking</option>
                <option value="gemini-exp-1206">Exp 1206</option>
                <option value="gemini-exp-1121">Exp 1121</option>
                <option value="gemini-1.5-pro">1.5 Pro</option>
                <option value="gemini-1.5-pro-002">1.5 Pro 002</option>
                <option value="gemini-1.5-flash">1.5 Flash</option>
                <option value="gemini-1.5-flash-002">1.5 Flash 002</option>
                <option value="gemini-1.5-flash-8b">1.5 Flash 8B</option>
                <option value="gemini-1.0-pro">1.0 Pro</option>
              </select>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}
