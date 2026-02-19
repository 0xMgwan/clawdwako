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
                <span className="text-xs font-semibold">GPT (OpenAI)</span>
              </div>
              <select
                value={selectedModel.includes('gpt') ? selectedModel : ''}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full p-2 rounded-lg border-2 border-border bg-background text-xs focus:border-green-400 focus:outline-none"
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
                <span className="text-xs font-semibold">Gemini (Google)</span>
              </div>
              <select
                value={selectedModel.includes('gemini') ? selectedModel : ''}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full p-2 rounded-lg border-2 border-border bg-background text-xs focus:border-green-400 focus:outline-none"
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
