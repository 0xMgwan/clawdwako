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
  const [selectedModel, setSelectedModel] = useState(bot.selectedModel);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(bot.id, { selectedModel });
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="glass-card rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Configure Bot</h2>
            <p className="text-sm text-muted-foreground mt-1">{bot.name}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Bot Info */}
        <div className="glass-stat-card rounded-xl p-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Bot Username</p>
              <p className="text-sm font-medium text-foreground">{bot.telegramBotUsername}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Status</p>
              <Badge className="text-xs">{bot.status}</Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Created</p>
              <p className="text-sm font-medium text-foreground">
                {new Date(bot.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Messages</p>
              <p className="text-sm font-medium text-foreground">{bot.messages || 0}</p>
            </div>
          </div>
        </div>

        {/* AI Model Selection */}
        <div className="mb-6">
          <label className="text-sm font-medium text-foreground mb-3 block">AI Model</label>
          <div className="grid grid-cols-2 gap-3">
            {['claude-opus', 'claude-sonnet', 'gpt-4o', 'gpt-5.2', 'gemini-pro', 'gemini-ultra'].map((model) => (
              <button
                key={model}
                onClick={() => setSelectedModel(model)}
                className={`glass-stat-card rounded-xl p-4 text-left transition-all ${
                  selectedModel === model
                    ? 'ring-2 ring-primary bg-primary/10'
                    : 'hover:bg-white/5'
                }`}
              >
                <p className="text-sm font-medium text-foreground capitalize">
                  {model.replace('-', ' ')}
                </p>
              </button>
            ))}
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
