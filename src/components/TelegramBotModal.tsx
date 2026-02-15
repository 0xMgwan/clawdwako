"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface TelegramBotModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (botInfo: any) => void;
}

export function TelegramBotModal({ open, onOpenChange, onSuccess }: TelegramBotModalProps) {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [apiKeys, setApiKeys] = useState({
    anthropic: "",
    openai: "",
    google: "",
  });

  const handleSubmit = async () => {
    if (!token.trim()) {
      setError("Please enter a bot token");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/telegram/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: token.trim() }),
      });

      const data = await response.json();

      if (!response.ok || !data.valid) {
        setError(data.error || "Invalid bot token");
        setLoading(false);
        return;
      }

      // Success!
      toast.success(`Successfully connected @${data.botInfo.username}!`, {
        description: "Your Telegram bot is now ready to deploy.",
        duration: 5000,
      });

      onSuccess({
        token: token.trim(),
        botInfo: data.botInfo,
        apiKeys: showApiKeys ? apiKeys : null,
      });
      onOpenChange(false);
      setToken("");
      setError("");
      setApiKeys({ anthropic: "", openai: "", google: "" });
      setShowApiKeys(false);
    } catch (err: any) {
      setError(err.message || "Failed to verify bot token");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-background border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" fill="#0088cc"/>
            </svg>
            Connect Telegram
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">How to get your bot token?</p>
            
            <ol className="space-y-2 list-decimal list-inside">
              <li>
                Open Telegram and go to{" "}
                <a 
                  href="https://t.me/BotFather" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  @BotFather
                </a>
                .
              </li>
              <li>
                Start a chat and type <code className="bg-muted px-1.5 py-0.5 rounded text-xs">/newbot</code>.
              </li>
              <li>Follow the prompts to name your bot and choose a username.</li>
              <li>
                BotFather will send you a message with your bot token. Copy the entire token (it looks like a long string of numbers and letters).
              </li>
              <li>Paste the token in the field below and click Save & Connect.</li>
            </ol>
          </div>

          <div className="space-y-2">
            <label htmlFor="bot-token" className="text-sm font-medium text-foreground">
              Enter bot token
            </label>
            <input
              id="bot-token"
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
              className="w-full px-3 py-2 bg-muted border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={loading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !loading && token.trim()) {
                  handleSubmit();
                }
              }}
            />
            {error && (
              <p className="text-xs text-red-400">{error}</p>
            )}
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setShowApiKeys(!showApiKeys)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors underline"
            >
              {showApiKeys ? "Hide" : "Add your own AI API keys (optional)"}
            </button>

            {showApiKeys && (
              <div className="space-y-3 p-3 bg-muted/50 rounded-md">
                <p className="text-xs text-muted-foreground">
                  Provide your own API keys to use your own AI credits. Leave empty to use platform credits.
                </p>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs font-medium text-foreground">Claude API Key (Anthropic)</label>
                    <input
                      type="password"
                      value={apiKeys.anthropic}
                      onChange={(e) => setApiKeys({ ...apiKeys, anthropic: e.target.value })}
                      placeholder="sk-ant-..."
                      className="w-full px-3 py-2 mt-1 bg-background border border-border rounded-md text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground">OpenAI API Key</label>
                    <input
                      type="password"
                      value={apiKeys.openai}
                      onChange={(e) => setApiKeys({ ...apiKeys, openai: e.target.value })}
                      placeholder="sk-..."
                      className="w-full px-3 py-2 mt-1 bg-background border border-border rounded-md text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground">Google AI API Key (Gemini)</label>
                    <input
                      type="password"
                      value={apiKeys.google}
                      onChange={(e) => setApiKeys({ ...apiKeys, google: e.target.value })}
                      placeholder="AI..."
                      className="w-full px-3 py-2 mt-1 bg-background border border-border rounded-md text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <Button
            onClick={handleSubmit}
            disabled={loading || !token.trim()}
            className="w-full bg-muted hover:bg-muted/80 text-foreground"
            size="lg"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Save & Connect
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
