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
                <option value="claude-opus-4-20250514">Claude Opus 4 - Most capable</option>
                <option value="claude-3-7-sonnet-20250219">Claude 3.7 Sonnet - Latest balanced</option>
                <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet - Balanced</option>
                <option value="claude-3-5-haiku-20241022">Claude 3.5 Haiku - Fast</option>
                <option value="claude-3-opus-20240229">Claude 3 Opus - Previous flagship</option>
                <option value="claude-3-sonnet-20240229">Claude 3 Sonnet - Previous balanced</option>
                <option value="claude-3-haiku-20240307">Claude 3 Haiku - Efficient</option>
              </select>
            </div>

            {/* GPT Models */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <img src="/gpt.png" alt="GPT" className="w-4 h-4" />
                <span className="text-xs font-semibold text-gray-900 dark:text-white">GPT (OpenAI)</span>
              </div>
              <select
                value={selectedModel?.includes('gpt') ? selectedModel : ''}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full p-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:border-green-400 focus:outline-none"
              >
                <option value="gpt-5">GPT-5 - Latest flagship (if available)</option>
                <option value="gpt-4o">GPT-4o - Multimodal optimized</option>
                <option value="gpt-4o-mini">GPT-4o Mini - Fast & affordable</option>
                <option value="gpt-4-turbo">GPT-4 Turbo - Advanced reasoning</option>
                <option value="gpt-4">GPT-4 - Powerful & reliable</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo - Fast & efficient</option>
                <option value="gpt-3.5-turbo-16k">GPT-3.5 Turbo 16K - Extended context</option>
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
                <option value="gemini-2.0-flash-exp">Gemini 2.0 Flash - Experimental</option>
                <option value="gemini-exp-1206">Gemini Exp 1206 - Experimental</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro - Most capable</option>
                <option value="gemini-1.5-pro-exp-0827">Gemini 1.5 Pro Exp - Extended</option>
                <option value="gemini-1.5-flash">Gemini 1.5 Flash - Fast</option>
                <option value="gemini-1.5-flash-8b">Gemini 1.5 Flash 8B - Ultra fast</option>
                <option value="gemini-1.0-pro">Gemini 1.0 Pro - Stable</option>
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
