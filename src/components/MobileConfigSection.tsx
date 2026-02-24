"use client";

import { useState } from "react";
import { Star, Rocket, Send, Mail } from "lucide-react";
import { CustomSelect } from "./CustomSelect";

interface MobileConfigSectionProps {
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  showApiKeyInput: boolean;
  setShowApiKeyInput: (show: boolean) => void;
  userApiKey: string;
  setUserApiKey: (key: string) => void;
  setShowTelegramModal: (show: boolean) => void;
  session: any;
  handleGoogleSignIn: () => void;
  handleInitiateDeploy: () => void;
  telegramBotInfo: any;
  deploying: boolean;
  signOut: () => void;
}

export function MobileConfigSection({
  selectedModel,
  setSelectedModel,
  showApiKeyInput,
  setShowApiKeyInput,
  userApiKey,
  setUserApiKey,
  setShowTelegramModal,
  session,
  handleGoogleSignIn,
  handleInitiateDeploy,
  telegramBotInfo,
  deploying,
  signOut
}: MobileConfigSectionProps) {
  const [activeTab, setActiveTab] = useState<'claude' | 'gpt' | 'gemini'>(
    selectedModel.includes('claude') ? 'claude' : 
    selectedModel.includes('gpt') ? 'gpt' : 'gemini'
  );

  const handleTabChange = (tab: 'claude' | 'gpt' | 'gemini') => {
    setActiveTab(tab);
    // Auto-select default model for the tab
    if (tab === 'claude') setSelectedModel('claude-opus-4-20250514');
    if (tab === 'gpt') setSelectedModel('gpt-4o');
    if (tab === 'gemini') setSelectedModel('gemini-2.0-flash-exp');
  };

  return (
    <div className="lg:hidden space-y-3 rounded-2xl border border-border p-3 bg-gradient-to-br from-background via-background to-green-500/5 backdrop-blur-sm shadow-lg">
      {/* AI Model Selection with Tabs */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Star className="w-4 h-4 text-green-400" />
          <h3 className="text-sm font-bold">Choose AI Brain</h3>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-1 mb-2 p-1 bg-muted/30 rounded-lg">
          <button
            onClick={() => handleTabChange('claude')}
            className={`flex-1 flex items-center justify-center gap-1 py-2 px-2 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'claude'
                ? 'bg-green-400 text-white shadow-md'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <img src="/Claude-ai-logo.png" alt="Claude" className="w-3 h-3" />
            Claude
          </button>
          <button
            onClick={() => handleTabChange('gpt')}
            className={`flex-1 flex items-center justify-center gap-1 py-2 px-2 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'gpt'
                ? 'bg-green-400 text-white shadow-md'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <img src="/gpt.png" alt="GPT" className="w-3 h-3" />
            GPT
          </button>
          <button
            onClick={() => handleTabChange('gemini')}
            className={`flex-1 flex items-center justify-center gap-1 py-2 px-2 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'gemini'
                ? 'bg-green-400 text-white shadow-md'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <img src="/google gemini.png" alt="Gemini" className="w-3 h-3" />
            Gemini
          </button>
        </div>

        {/* Model Selector */}
        {activeTab === 'claude' && (
          <CustomSelect
            options={[
              { value: 'claude-opus-4-6', label: 'Opus 4.6 - Latest (Feb 2026)' },
              { value: 'claude-sonnet-4-6', label: 'Sonnet 4.6 - Latest (Feb 2026)' },
              { value: 'claude-opus-4-5', label: 'Opus 4.5 - Advanced' },
              { value: 'claude-sonnet-4-5', label: 'Sonnet 4.5 - Production' },
              { value: 'claude-haiku-4-5', label: 'Haiku 4.5 - Fast' },
              { value: 'claude-opus-4-1', label: 'Opus 4.1 - Agentic' },
              { value: 'claude-opus-4-20250514', label: 'Opus 4 (May 2025)' },
              { value: 'claude-sonnet-4', label: 'Sonnet 4' },
              { value: 'claude-3-7-sonnet-20250219', label: '3.7 Sonnet' },
              { value: 'claude-3-5-sonnet-20241022', label: '3.5 Sonnet' },
              { value: 'claude-3-5-haiku-20241022', label: '3.5 Haiku' }
            ]}
            value={selectedModel}
            onChange={setSelectedModel}
            isActive={true}
          />
        )}

        {activeTab === 'gpt' && (
          <CustomSelect
            options={[
              { value: 'gpt-5.3-codex-spark', label: 'GPT-5.3 Codex Spark (Feb 2026)' },
              { value: 'gpt-5.2', label: 'GPT-5.2 - Smarter (2026)' },
              { value: 'gpt-5.1-codex-max', label: 'GPT-5.1 Codex Max' },
              { value: 'gpt-5.1-thinking', label: 'GPT-5.1 Thinking' },
              { value: 'gpt-5.1-instant', label: 'GPT-5.1 Instant' },
              { value: 'gpt-5.1', label: 'GPT-5.1 (Nov 2025)' },
              { value: 'gpt-5', label: 'GPT-5' },
              { value: 'o3-pro', label: 'o3-pro (Feb 2026)' },
              { value: 'o3', label: 'o3 - Reasoning' },
              { value: 'o3-mini', label: 'o3-mini - Fast' },
              { value: 'gpt-4.1', label: 'GPT-4.1 (2026)' },
              { value: 'o1-pro', label: 'o1-pro' },
              { value: 'o1', label: 'o1' },
              { value: 'gpt-4o', label: 'GPT-4o' },
              { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
              { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
              { value: 'gpt-4', label: 'GPT-4' }
            ]}
            value={selectedModel}
            onChange={setSelectedModel}
            isActive={true}
          />
        )}

        {activeTab === 'gemini' && (
          <CustomSelect
            options={[
              { value: 'gemini-2.0-flash-exp', label: '2.0 Flash Exp' },
              { value: 'gemini-2.0-flash-thinking-exp-1219', label: '2.0 Flash Thinking' },
              { value: 'gemini-exp-1206', label: 'Exp 1206' },
              { value: 'gemini-exp-1121', label: 'Exp 1121' },
              { value: 'gemini-1.5-pro', label: '1.5 Pro' },
              { value: 'gemini-1.5-pro-002', label: '1.5 Pro 002' },
              { value: 'gemini-1.5-flash', label: '1.5 Flash' },
              { value: 'gemini-1.5-flash-002', label: '1.5 Flash 002' },
              { value: 'gemini-1.5-flash-8b', label: '1.5 Flash 8B' },
              { value: 'gemini-1.0-pro', label: '1.0 Pro' }
            ]}
            value={selectedModel}
            onChange={setSelectedModel}
            isActive={true}
          />
        )}

        <button
          type="button"
          onClick={() => setShowApiKeyInput(!showApiKeyInput)}
          className="text-[9px] text-muted-foreground hover:text-green-400 transition-colors underline mt-2 w-full text-center"
        >
          {showApiKeyInput ? 'Hide' : 'Got your own API key?'}
        </button>

        {showApiKeyInput && (
          <input
            type="password"
            value={userApiKey}
            onChange={(e) => setUserApiKey(e.target.value)}
            placeholder="Enter your API key"
            className="w-full px-2 py-1.5 text-xs border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-green-400 mt-2"
          />
        )}
      </div>

      {/* Connect Platform - Compact */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Rocket className="w-4 h-4 text-green-400" />
          <h3 className="text-sm font-bold">Connect Platform</h3>
        </div>
        
        <button
          onClick={() => setShowTelegramModal(true)}
          className="w-full p-2.5 rounded-xl border-2 border-green-400 bg-gradient-to-r from-green-400/10 to-emerald-400/10 hover:from-green-400/20 hover:to-emerald-400/20 transition-all flex items-center gap-2 shadow-sm"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-md">
            <Send className="w-4 h-4 text-white" />
          </div>
          <div className="text-left flex-1">
            <div className="text-xs font-bold">Telegram</div>
            <div className="text-[9px] text-green-400">Ready to deploy</div>
          </div>
        </button>
      </div>

      {/* User Section */}
      {session ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 rounded-xl bg-gradient-to-r from-muted/50 to-green-500/5 border border-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold">
                {session.user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <div className="text-xs font-bold">{session.user?.name || 'User'}</div>
                <div className="text-[9px] text-muted-foreground truncate max-w-[150px]">
                  {session.user?.email}
                </div>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              className="text-[9px] text-red-500 hover:text-red-600 font-medium"
            >
              Sign out
            </button>
          </div>

          <button
            onClick={handleInitiateDeploy}
            disabled={!telegramBotInfo || deploying}
            className={`w-full py-3 rounded-xl font-bold text-sm transition-all shadow-lg ${
              !telegramBotInfo
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : deploying
                ? 'bg-green-400/50 text-white cursor-wait'
                : 'bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white'
            }`}
          >
            {deploying ? 'Deploying...' : 'Deploy Agent'}
          </button>

          {!telegramBotInfo && (
            <p className="text-[9px] text-center text-muted-foreground">
              Connect Telegram first
            </p>
          )}
        </div>
      ) : (
        <button
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-border hover:border-green-400/50 bg-background hover:bg-background/80 transition-all"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span className="text-xs font-semibold">Sign in with Google</span>
        </button>
      )}
    </div>
  );
}
