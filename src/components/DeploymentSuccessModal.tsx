"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, ExternalLink } from "lucide-react";

interface DeploymentSuccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  botUsername: string;
  botId: string;
  railwayProjectId: string;
}

export function DeploymentSuccessModal({ 
  open, 
  onOpenChange, 
  botUsername,
  botId,
  railwayProjectId 
}: DeploymentSuccessModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-background border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <CheckCircle className="w-6 h-6 text-green-500" />
            Agent is Live!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Bot Info */}
          <div className="text-center space-y-2">
            <div className="text-2xl font-bold text-primary">
              @{botUsername}
            </div>
            <p className="text-sm text-muted-foreground">
              Your AI agent is now deployed and running 24/7
            </p>
          </div>

          {/* Status */}
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-500">Online</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Your bot is connected and ready to respond to messages
            </p>
          </div>

          {/* Instructions */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Next Steps:</h3>
            <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
              <li>Open Telegram and search for <span className="text-primary font-medium">@{botUsername}</span></li>
              <li>Start a conversation by sending <code className="bg-muted px-1.5 py-0.5 rounded text-xs">/start</code></li>
              <li>Your AI agent will respond instantly!</li>
            </ol>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <Button
              onClick={() => window.open(`https://t.me/${botUsername}`, '_blank')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              size="lg"
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
              </svg>
              Go Message it on Telegram Now!
            </Button>

            <Button
              onClick={() => window.location.href = '/dashboard'}
              variant="outline"
              className="w-full"
              size="lg"
            >
              View Dashboard
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Railway Link */}
          <div className="text-center">
            <a
              href={`https://railway.app/project/${railwayProjectId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
            >
              View on Railway
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
