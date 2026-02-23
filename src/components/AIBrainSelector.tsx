"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { CustomSelect } from "./CustomSelect";

interface AIBrainSelectorProps {
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  showApiKeyInput: boolean;
  setShowApiKeyInput: (show: boolean) => void;
  userApiKey: string;
  setUserApiKey: (key: string) => void;
}

export function AIBrainSelector({
  selectedModel,
  setSelectedModel,
  showApiKeyInput,
  setShowApiKeyInput,
  userApiKey,
  setUserApiKey
}: AIBrainSelectorProps) {
  const [activeTab, setActiveTab] = useState<'claude' | 'gpt' | 'gemini'>(
    selectedModel.includes('claude') ? 'claude' : 
    selectedModel.includes('gpt') ? 'gpt' : 'gemini'
  );

  // Update active tab when selectedModel changes externally
  useEffect(() => {
    if (selectedModel.includes('claude')) setActiveTab('claude');
    else if (selectedModel.includes('gpt')) setActiveTab('gpt');
    else if (selectedModel.includes('gemini')) setActiveTab('gemini');
  }, [selectedModel]);

  const handleTabChange = (tab: 'claude' | 'gpt' | 'gemini') => {
    setActiveTab(tab);
    // Auto-select default model for the tab
    if (tab === 'claude') setSelectedModel('claude-opus-4-20250514');
    if (tab === 'gpt') setSelectedModel('gpt-4o');
    if (tab === 'gemini') setSelectedModel('gemini-2.0-flash-exp');
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Star className="w-4 h-4 text-green-400" />
        <h3 className="text-lg font-bold tracking-tight">Choose Your AI Brain</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-4">Pick the most powerful AI model for your needs</p>
      
      {/* Tabs */}
      <div className="flex gap-2 mb-3 p-1 bg-muted/30 rounded-lg">
        <button
          onClick={() => handleTabChange('claude')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-md text-sm font-semibold transition-all ${
            activeTab === 'claude'
              ? 'bg-green-400 text-white shadow-md'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
          }`}
        >
          <img src="/Claude-ai-logo.png" alt="Claude" className="w-4 h-4" />
          Claude
        </button>
        <button
          onClick={() => handleTabChange('gpt')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-md text-sm font-semibold transition-all ${
            activeTab === 'gpt'
              ? 'bg-green-400 text-white shadow-md'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
          }`}
        >
          <img src="/gpt.png" alt="GPT" className="w-4 h-4" />
          GPT
        </button>
        <button
          onClick={() => handleTabChange('gemini')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-md text-sm font-semibold transition-all ${
            activeTab === 'gemini'
              ? 'bg-green-400 text-white shadow-md'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
          }`}
        >
          <img src="/google gemini.png" alt="Gemini" className="w-4 h-4" />
          Gemini
        </button>
      </div>

      {/* Model Selector */}
      {activeTab === 'claude' && (
        <CustomSelect
          options={[
            { value: 'claude-opus-4-20250514', label: 'Claude Opus 4 - Most capable' },
            { value: 'claude-3-7-sonnet-20250219', label: 'Claude 3.7 Sonnet - Latest balanced' },
            { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet - Balanced' },
            { value: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku - Fast' },
            { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus - Previous flagship' },
            { value: 'claude-3-sonnet-20240229', label: 'Claude 3 Sonnet - Previous balanced' },
            { value: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku - Efficient' }
          ]}
          value={selectedModel}
          onChange={setSelectedModel}
          isActive={true}
        />
      )}

      {activeTab === 'gpt' && (
        <CustomSelect
          options={[
            { value: 'gpt-5', label: 'GPT-5 - Latest flagship (if available)' },
            { value: 'o1', label: 'o1 - Advanced reasoning model' },
            { value: 'o1-mini', label: 'o1-mini - Fast reasoning' },
            { value: 'o1-preview', label: 'o1-preview - Reasoning preview' },
            { value: 'gpt-4o', label: 'GPT-4o - Multimodal optimized' },
            { value: 'gpt-4o-mini', label: 'GPT-4o Mini - Fast & affordable' },
            { value: 'gpt-4o-2024-11-20', label: 'GPT-4o (Nov 2024) - Latest' },
            { value: 'gpt-4o-2024-08-06', label: 'GPT-4o (Aug 2024)' },
            { value: 'gpt-4o-2024-05-13', label: 'GPT-4o (May 2024)' },
            { value: 'chatgpt-4o-latest', label: 'ChatGPT-4o Latest - Dynamic' },
            { value: 'gpt-4-turbo', label: 'GPT-4 Turbo - Advanced reasoning' },
            { value: 'gpt-4-turbo-2024-04-09', label: 'GPT-4 Turbo (Apr 2024)' },
            { value: 'gpt-4-turbo-preview', label: 'GPT-4 Turbo Preview' },
            { value: 'gpt-4-0125-preview', label: 'GPT-4 0125 Preview' },
            { value: 'gpt-4-1106-preview', label: 'GPT-4 1106 Preview' },
            { value: 'gpt-4', label: 'GPT-4 - Powerful & reliable' },
            { value: 'gpt-4-0613', label: 'GPT-4 (Jun 2023)' },
            { value: 'gpt-4-32k', label: 'GPT-4 32K - Extended context' },
            { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo - Fast & efficient' },
            { value: 'gpt-3.5-turbo-0125', label: 'GPT-3.5 Turbo (Jan 2024)' },
            { value: 'gpt-3.5-turbo-1106', label: 'GPT-3.5 Turbo (Nov 2023)' },
            { value: 'gpt-3.5-turbo-16k', label: 'GPT-3.5 Turbo 16K - Extended context' }
          ]}
          value={selectedModel}
          onChange={setSelectedModel}
          isActive={true}
        />
      )}

      {activeTab === 'gemini' && (
        <CustomSelect
          options={[
            { value: 'gemini-2.0-flash-exp', label: 'Gemini 2.0 Flash Exp - Latest experimental' },
            { value: 'gemini-2.0-flash-thinking-exp-1219', label: 'Gemini 2.0 Flash Thinking - Reasoning' },
            { value: 'gemini-exp-1206', label: 'Gemini Exp 1206 - Experimental' },
            { value: 'gemini-exp-1121', label: 'Gemini Exp 1121 - Experimental' },
            { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro - Most capable' },
            { value: 'gemini-1.5-pro-002', label: 'Gemini 1.5 Pro 002 - Latest stable' },
            { value: 'gemini-1.5-pro-001', label: 'Gemini 1.5 Pro 001' },
            { value: 'gemini-1.5-pro-exp-0827', label: 'Gemini 1.5 Pro Exp 0827' },
            { value: 'gemini-1.5-pro-exp-0801', label: 'Gemini 1.5 Pro Exp 0801' },
            { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash - Fast' },
            { value: 'gemini-1.5-flash-002', label: 'Gemini 1.5 Flash 002 - Latest fast' },
            { value: 'gemini-1.5-flash-001', label: 'Gemini 1.5 Flash 001' },
            { value: 'gemini-1.5-flash-8b', label: 'Gemini 1.5 Flash 8B - Ultra fast' },
            { value: 'gemini-1.5-flash-8b-001', label: 'Gemini 1.5 Flash 8B 001' },
            { value: 'gemini-1.5-flash-8b-exp-0924', label: 'Gemini 1.5 Flash 8B Exp' },
            { value: 'gemini-1.0-pro', label: 'Gemini 1.0 Pro - Stable' },
            { value: 'gemini-1.0-pro-001', label: 'Gemini 1.0 Pro 001' },
            { value: 'gemini-1.0-pro-vision', label: 'Gemini 1.0 Pro Vision - Multimodal' }
          ]}
          value={selectedModel}
          onChange={setSelectedModel}
          isActive={true}
        />
      )}

      <div className="text-center mt-3">
        <button
          type="button"
          onClick={() => setShowApiKeyInput(!showApiKeyInput)}
          className="text-xs text-muted-foreground hover:text-green-400 transition-colors underline"
        >
          Got your own API key? Add it here
        </button>
      </div>

      {showApiKeyInput && (
        <div className="mt-3">
          <input
            type="password"
            value={userApiKey}
            onChange={(e) => setUserApiKey(e.target.value)}
            placeholder="Enter your API key"
            className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>
      )}
    </div>
  );
}
