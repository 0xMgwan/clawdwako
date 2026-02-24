"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface ChangeModelModalProps {
  isOpen: boolean;
  onClose: () => void;
  botId: string;
  currentModel: string;
  onSuccess: () => void;
}

export function ChangeModelModal({ isOpen, onClose, botId, currentModel, onSuccess }: ChangeModelModalProps) {
  const [selectedModel, setSelectedModel] = useState(currentModel);
  const [updating, setUpdating] = useState(false);

  const handleUpdate = async () => {
    if (selectedModel === currentModel) {
      alert("Please select a different model");
      return;
    }

    setUpdating(true);
    try {
      const response = await fetch(`/api/bots/${botId}/model`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedModel })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update model');
      }

      alert('Model updated successfully! Bot will use the new model for future messages.');
      onSuccess();
      onClose();
    } catch (error: any) {
      alert(`Failed to update model: ${error.message}`);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Change AI Model</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            Select a new AI model for your bot. The bot will use this model for all future conversations.
          </p>

          <div className="space-y-3">
            {/* Claude Models */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <img src="/Claude-ai-logo.png" alt="Claude" className="w-4 h-4" />
                <span className="text-xs font-semibold">Claude (Anthropic)</span>
              </div>
              <select
                value={selectedModel.includes('claude') ? selectedModel : ''}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full p-2 rounded-lg border-2 border-border bg-background text-xs focus:border-green-400 focus:outline-none"
              >
                <option value="claude-opus-4-6">Claude Opus 4.6 - Latest flagship (Feb 2026)</option>
                <option value="claude-sonnet-4-6">Claude Sonnet 4.6 - Latest balanced (Feb 2026)</option>
                <option value="claude-opus-4-5">Claude Opus 4.5 - Advanced intelligence</option>
                <option value="claude-sonnet-4-5">Claude Sonnet 4.5 - Production agents</option>
                <option value="claude-haiku-4-5">Claude Haiku 4.5 - Fast & efficient</option>
                <option value="claude-opus-4-1">Claude Opus 4.1 - Agentic search</option>
                <option value="claude-opus-4-20250514">Claude Opus 4 (May 2025)</option>
                <option value="claude-sonnet-4">Claude Sonnet 4</option>
                <option value="claude-3-7-sonnet-20250219">Claude 3.7 Sonnet</option>
                <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</option>
                <option value="claude-3-5-haiku-20241022">Claude 3.5 Haiku</option>
                <option value="claude-3-opus-20240229">Claude 3 Opus</option>
                <option value="claude-3-sonnet-20240229">Claude 3 Sonnet</option>
                <option value="claude-3-haiku-20240307">Claude 3 Haiku</option>
              </select>
            </div>

            {/* GPT Models */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <img src="/gpt.png" alt="GPT" className="w-4 h-4" />
                <span className="text-xs font-semibold">GPT (OpenAI)</span>
              </div>
              <select
                value={selectedModel.includes('gpt') || selectedModel.includes('o1') || selectedModel.includes('o3') || selectedModel.includes('computer-use') ? selectedModel : ''}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full p-2 rounded-lg border-2 border-border bg-background text-xs focus:border-green-400 focus:outline-none"
              >
                <option value="gpt-5.3-codex-spark">GPT-5.3 Codex Spark - Latest coding (Feb 2026)</option>
                <option value="gpt-5.2">GPT-5.2 - Smarter & more precise (2026)</option>
                <option value="gpt-5.1-codex-max">GPT-5.1 Codex Max - Agentic coding</option>
                <option value="gpt-5.1-codex">GPT-5.1 Codex - Long running tasks</option>
                <option value="gpt-5.1-thinking">GPT-5.1 Thinking - Complex reasoning</option>
                <option value="gpt-5.1-instant">GPT-5.1 Instant - Fast responses</option>
                <option value="gpt-5.1">GPT-5.1 - Latest flagship (Nov 2025)</option>
                <option value="gpt-5">GPT-5 - Flagship model</option>
                <option value="o3-pro">o3-pro - Pro reasoning (Feb 2026)</option>
                <option value="o3">o3 - Advanced reasoning (Feb 2026)</option>
                <option value="o3-mini">o3-mini - Fast reasoning (Feb 2026)</option>
                <option value="gpt-4.1">GPT-4.1 - Latest GPT-4 (2026)</option>
                <option value="computer-use-preview">Computer Use Preview - Specialized</option>
                <option value="gpt-4o-search-preview">GPT-4o Search - Web search</option>
                <option value="gpt-4o-mini-search-preview">GPT-4o Mini Search - Fast search</option>
                <option value="o1-pro">o1-pro - Pro reasoning</option>
                <option value="o1">o1 - Advanced reasoning</option>
                <option value="o1-mini">o1-mini - Fast reasoning</option>
                <option value="o1-preview">o1-preview - Reasoning preview</option>
                <option value="gpt-4o">GPT-4o - Multimodal optimized</option>
                <option value="gpt-4o-mini">GPT-4o Mini - Fast & affordable</option>
                <option value="gpt-4o-2024-11-20">GPT-4o (Nov 2024)</option>
                <option value="chatgpt-4o-latest">ChatGPT-4o Latest - Dynamic</option>
                <option value="gpt-4-turbo">GPT-4 Turbo</option>
                <option value="gpt-4">GPT-4</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              </select>
            </div>

            {/* Gemini Models */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <img src="/google gemini.png" alt="Gemini" className="w-4 h-4" />
                <span className="text-xs font-semibold">Gemini (Google)</span>
              </div>
              <select
                value={selectedModel.includes('gemini') ? selectedModel : ''}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full p-2 rounded-lg border-2 border-border bg-background text-xs focus:border-green-400 focus:outline-none"
              >
                <option value="gemini-2.0-flash-exp">Gemini 2.0 Flash Exp - Latest experimental</option>
                <option value="gemini-2.0-flash-thinking-exp-1219">Gemini 2.0 Flash Thinking - Reasoning</option>
                <option value="gemini-exp-1206">Gemini Exp 1206 - Experimental</option>
                <option value="gemini-exp-1121">Gemini Exp 1121 - Experimental</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro - Most capable</option>
                <option value="gemini-1.5-pro-002">Gemini 1.5 Pro 002 - Latest stable</option>
                <option value="gemini-1.5-pro-001">Gemini 1.5 Pro 001</option>
                <option value="gemini-1.5-pro-exp-0827">Gemini 1.5 Pro Exp 0827</option>
                <option value="gemini-1.5-pro-exp-0801">Gemini 1.5 Pro Exp 0801</option>
                <option value="gemini-1.5-flash">Gemini 1.5 Flash - Fast</option>
                <option value="gemini-1.5-flash-002">Gemini 1.5 Flash 002 - Latest fast</option>
                <option value="gemini-1.5-flash-001">Gemini 1.5 Flash 001</option>
                <option value="gemini-1.5-flash-8b">Gemini 1.5 Flash 8B - Ultra fast</option>
                <option value="gemini-1.5-flash-8b-001">Gemini 1.5 Flash 8B 001</option>
                <option value="gemini-1.5-flash-8b-exp-0924">Gemini 1.5 Flash 8B Exp</option>
                <option value="gemini-1.0-pro">Gemini 1.0 Pro - Stable</option>
                <option value="gemini-1.0-pro-001">Gemini 1.0 Pro 001</option>
                <option value="gemini-1.0-pro-vision">Gemini 1.0 Pro Vision - Multimodal</option>
              </select>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
            <strong>Note:</strong> Changing the model will redeploy your bot on Railway. This may take a few moments.
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={updating}>
            Cancel
          </Button>
          <Button onClick={handleUpdate} disabled={updating}>
            {updating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              'Update Model'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
