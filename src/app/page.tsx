"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bot, Mail, Moon, Sun } from "lucide-react";
import { TelegramBotModal } from "@/components/TelegramBotModal";
import { DeploymentSuccessModal } from "@/components/DeploymentSuccessModal";
import { signIn } from "next-auth/react";
import { useTheme } from "next-themes";

export default function Home() {
  const [selectedModel, setSelectedModel] = useState("claude-opus");
  const [showTelegramModal, setShowTelegramModal] = useState(false);
  const [telegramBotInfo, setTelegramBotInfo] = useState<any>(null);
  const [deploying, setDeploying] = useState(false);
  const { theme, setTheme } = useTheme();
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [userApiKey, setUserApiKey] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [deploymentResult, setDeploymentResult] = useState<any>(null);

  const handleTelegramSuccess = (data: any) => {
    setTelegramBotInfo(data);
    console.log("Bot connected - Full data:", data);
    console.log("Bot connected - botInfo:", data.botInfo);
    console.log("Bot connected - username:", data.botInfo?.username);
    console.log("Bot connected - token:", data.token);
  };

  const handleDeploy = async () => {
    if (!telegramBotInfo) {
      alert("Please connect your Telegram bot first");
      return;
    }

    setDeploying(true);

    try {
      // Combine API keys from both sources (homepage and modal)
      const combinedApiKeys = {
        anthropic: userApiKey && selectedModel.includes("claude") ? userApiKey : (telegramBotInfo.apiKeys?.anthropic || ""),
        openai: userApiKey && selectedModel.includes("gpt") ? userApiKey : (telegramBotInfo.apiKeys?.openai || ""),
        google: userApiKey && selectedModel.includes("gemini") ? userApiKey : (telegramBotInfo.apiKeys?.google || ""),
      };

      const hasAnyUserKey = combinedApiKeys.anthropic || combinedApiKeys.openai || combinedApiKeys.google;

      const deploymentPayload = {
        botToken: telegramBotInfo.token,
        botUsername: telegramBotInfo.botInfo?.username,
        selectedModel: selectedModel,
        userApiKeys: hasAnyUserKey ? combinedApiKeys : null,
      };

      console.log('Sending deployment request:', {
        hasBotToken: !!deploymentPayload.botToken,
        botUsername: deploymentPayload.botUsername,
        selectedModel: deploymentPayload.selectedModel,
        hasUserApiKeys: !!deploymentPayload.userApiKeys
      });

      const response = await fetch("/api/deploy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(deploymentPayload),
      });

      console.log('Response status:', response.status);
      console.log('Response content-type:', response.headers.get('content-type'));
      
      const responseText = await response.text();
      console.log('Response text (first 200 chars):', responseText.substring(0, 200));
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse response as JSON');
        throw new Error('Server returned invalid response: ' + responseText.substring(0, 100));
      }

      if (!response.ok) {
        let errorMsg = data.error || "Deployment failed";
        
        // Make Railway errors more user-friendly
        if (errorMsg.includes("Free plan resource provision limit exceeded")) {
          errorMsg = "Railway free tier limit reached. Please upgrade your Railway account or delete old projects to continue deploying.";
        }
        
        console.error("Deployment error:", errorMsg, data);
        throw new Error(errorMsg);
      }

      // Show success modal instead of alert
      setDeploymentResult(data.bot);
      setShowSuccessModal(true);
      console.log("Deployment started:", data);
    } catch (error: any) {
      alert(`Deployment failed: ${error.message}`);
      console.error("Deployment error:", error);
    } finally {
      setDeploying(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn("google", { 
      callbackUrl: window.location.origin,
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Bot className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">Clawdwako<span className="text-muted-foreground">.ai</span></span>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="text-muted-foreground hover:text-foreground relative"
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
              <a href="mailto:support@nedapay.xyz">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Header */}
      <section className="pt-16 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Launch Your AI Agent in <span className="text-green-500">Under 60 Seconds</span>
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            Skip the technical setup entirely. Get your personal AI assistant running 
            instantly with zero configuration required.
          </p>
        </div>
      </section>

      {/* Model Selection Card */}
      <section className="pb-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto glass-card rounded-2xl p-6 md:p-8">
          <div className="mb-5">
            <h2 className="text-base font-semibold mb-3 text-center">Select your preferred AI model</h2>
            <div className="flex flex-wrap justify-center gap-2">
              <Button 
                variant={selectedModel === "claude-opus" ? "default" : "outline"}
                size="lg" 
                onClick={() => setSelectedModel("claude-opus")}
                className={selectedModel === "claude-opus" ? "bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 text-sm" : "border-border hover:bg-accent px-4 py-2 text-sm"}
              >
                <svg className="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="#D97757" stroke="#D97757" strokeWidth="1"/>
                  <circle cx="12" cy="12" r="3" fill="#1a1a1a"/>
                </svg>
                Claude Opus 4.5
              </Button>
              <Button 
                variant={selectedModel === "gpt-5" ? "default" : "outline"}
                size="lg" 
                onClick={() => setSelectedModel("gpt-5")}
                className={selectedModel === "gpt-5" ? "bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 text-sm" : "border-border hover:bg-accent px-4 py-2 text-sm"}
              >
                <svg className="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="#6B6B6B"/>
                  <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" fill="#6B6B6B"/>
                  <circle cx="12" cy="12" r="2" fill="#6B6B6B"/>
                </svg>
                GPT-5.2
              </Button>
              <Button 
                variant={selectedModel === "gemini" ? "default" : "outline"}
                size="lg" 
                onClick={() => setSelectedModel("gemini")}
                className={selectedModel === "gemini" ? "bg-primary hover:bg-primary/90 text-white px-4 py-2 text-sm" : "border-border hover:bg-accent px-4 py-2 text-sm"}
              >
                <svg className="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L16 8L22 12L16 16L12 22L8 16L2 12L8 8L12 2Z" fill="url(#gemini-gradient)"/>
                  <defs>
                    <linearGradient id="gemini-gradient" x1="2" y1="2" x2="22" y2="22">
                      <stop offset="0%" stopColor="#4285F4"/>
                      <stop offset="50%" stopColor="#9B72F2"/>
                      <stop offset="100%" stopColor="#D96570"/>
                    </linearGradient>
                  </defs>
                </svg>
                Gemini 3 Flash
              </Button>
            </div>
          </div>

          <div className="mb-5 text-center">
            <button
              type="button"
              onClick={() => setShowApiKeyInput(!showApiKeyInput)}
              className="text-xs text-muted-foreground hover:text-primary transition-colors underline"
            >
              {showApiKeyInput ? "Hide API key" : "Got your own API key? Add it here"}
            </button>
            
            {showApiKeyInput && (
              <div className="mt-3 max-w-md mx-auto">
                <input
                  type="password"
                  value={userApiKey}
                  onChange={(e) => setUserApiKey(e.target.value)}
                  placeholder={
                    selectedModel.includes("claude") ? "sk-ant-..." :
                    selectedModel.includes("gpt") ? "sk-..." :
                    "AI..."
                  }
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {selectedModel.includes("claude") && "Enter your Anthropic API key"}
                  {selectedModel.includes("gpt") && "Enter your OpenAI API key"}
                  {selectedModel.includes("gemini") && "Enter your Google AI API key"}
                </p>
              </div>
            )}
          </div>

          <div className="mb-5">
            <h2 className="text-base font-semibold mb-3 text-center">Choose your messaging platform</h2>
            <div className="flex flex-wrap justify-center gap-2">
              <Button 
                variant="default" 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm"
                onClick={() => setShowTelegramModal(true)}
              >
                <svg className="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" fill="white"/>
                </svg>
                Telegram
                {telegramBotInfo && (
                  <svg className="w-4 h-4 ml-1.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="#10b981"/>
                  </svg>
                )}
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                disabled
                className="border-border px-4 py-2 text-sm opacity-50 cursor-not-allowed"
              >
                <svg className="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" fill="#5865F2"/>
                </svg>
                Discord
                <span className="ml-2 text-xs text-muted-foreground">Coming soon</span>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                disabled
                className="border-border px-4 py-2 text-sm opacity-50 cursor-not-allowed"
              >
                <svg className="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" fill="#25D366"/>
                </svg>
                WhatsApp
                <span className="ml-2 text-xs text-muted-foreground">Coming soon</span>
              </Button>
            </div>
          </div>

          <div className="text-center mb-5">
            <Button 
              variant="outline" 
              size="lg"
              className="glass-card px-4 py-2 text-sm font-medium"
              onClick={handleGoogleSignIn}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign in with Google
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Authenticate to launch your bot and link communication channels.
            </p>
          </div>

          <div className="text-center">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleDeploy}
              disabled={!telegramBotInfo || deploying}
            >
              {deploying ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Deploying...
                </>
              ) : (
                <> Deploy Agent</>
              )}
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              {telegramBotInfo ? (
                <>
                  Ready to deploy <span className="text-primary font-medium">@{telegramBotInfo.botInfo?.username}</span>. <span className="text-blue-400">Limited servers — 11 remaining</span>
                </>
              ) : (
                <>
                  Link Telegram to proceed. <span className="text-blue-400">Limited servers — 11 remaining</span>
                </>
              )}
            </p>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <div className="text-xs text-primary font-medium mb-3">Comparison</div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Traditional Method vs ClawdWako
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12">
            {/* Traditional Method */}
            <div>
              <h3 className="text-xl font-semibold mb-6 text-muted-foreground italic">Traditional</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-foreground">Purchasing local virtual machine</span>
                  <span className="text-muted-foreground">15 min</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-foreground">Creating SSH keys and storing securely</span>
                  <span className="text-muted-foreground">10 min</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-foreground">Connecting to the server via SSH</span>
                  <span className="text-muted-foreground">5 min</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-foreground">Installing Node.js and NPM</span>
                  <span className="text-muted-foreground">5 min</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-foreground">Installing OpenClaw</span>
                  <span className="text-muted-foreground">7 min</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-foreground">Setting up OpenClaw</span>
                  <span className="text-muted-foreground">10 min</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-foreground">Connecting to AI provider</span>
                  <span className="text-muted-foreground">4 min</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-foreground">Pairing with Telegram</span>
                  <span className="text-muted-foreground">4 min</span>
                </div>
                
                <div className="pt-4">
                  <div className="text-lg font-semibold mb-2">Total</div>
                  <div className="text-3xl font-bold text-foreground">60 min</div>
                  <p className="text-xs text-muted-foreground mt-2 italic">
                    If you're <span className="text-red-400">non-technical</span>, multiply these <span className="text-red-400">times by 10</span> — you have to learn each step before doing.
                  </p>
                </div>
              </div>
            </div>

            {/* ClawdWako Method */}
            <div>
              <h3 className="text-xl font-semibold mb-6 text-foreground italic">ClawdWako</h3>
              <div className="text-center py-12">
                <div className="text-6xl font-bold text-primary mb-4">&lt;1 min</div>
                <p className="text-base text-muted-foreground mb-6">
                  Pick a model, connect Telegram, deploy — done under 1 minute.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Servers, SSH and OpenClaw Environment are already set up, waiting to get assigned. Simple, secure and fast connection to your bot.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-6xl mx-auto text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            What can Clawdwako.ai do for you?
          </h2>
          <p className="text-base text-muted-foreground">
            One assistant, thousands of use cases
          </p>
        </div>
        
        {/* Row 1 - Scroll Left */}
        <div className="relative mb-4 overflow-hidden">
          <div className="flex animate-scroll-left">
            <div className="flex gap-4 pr-4">
              <Button variant="outline" className="h-auto p-4 text-left justify-start whitespace-nowrap flex-shrink-0">
                <div className="text-sm font-medium">🌐 Translate messages in real time</div>
              </Button>
              <Button variant="outline" className="h-auto p-4 text-left justify-start whitespace-nowrap flex-shrink-0">
                <div className="text-sm font-medium">📧 Organize your inbox</div>
              </Button>
              <Button variant="outline" className="h-auto p-4 text-left justify-start whitespace-nowrap flex-shrink-0">
                <div className="text-sm font-medium">🎫 Answer support tickets</div>
              </Button>
              <Button variant="outline" className="h-auto p-4 text-left justify-start whitespace-nowrap flex-shrink-0">
                <div className="text-sm font-medium">� Summarize long documents</div>
              </Button>
            </div>
            <div className="flex gap-4 pr-4">
              <Button variant="outline" className="h-auto p-4 text-left justify-start whitespace-nowrap flex-shrink-0">
                <div className="text-sm font-medium">🌐 Translate messages in real time</div>
              </Button>
              <Button variant="outline" className="h-auto p-4 text-left justify-start whitespace-nowrap flex-shrink-0">
                <div className="text-sm font-medium">📧 Organize your inbox</div>
              </Button>
              <Button variant="outline" className="h-auto p-4 text-left justify-start whitespace-nowrap flex-shrink-0">
                <div className="text-sm font-medium">🎫 Answer support tickets</div>
              </Button>
              <Button variant="outline" className="h-auto p-4 text-left justify-start whitespace-nowrap flex-shrink-0">
                <div className="text-sm font-medium">📄 Summarize long documents</div>
              </Button>
            </div>
          </div>
        </div>

        {/* Row 2 - Scroll Right */}
        <div className="relative mb-4 overflow-hidden">
          <div className="flex animate-scroll-right">
            <div className="flex gap-4 pr-4">
              <Button variant="outline" className="h-auto p-4 text-left justify-start whitespace-nowrap flex-shrink-0">
                <div className="text-sm font-medium">💰 Do your taxes</div>
              </Button>
              <Button variant="outline" className="h-auto p-4 text-left justify-start whitespace-nowrap flex-shrink-0 border-2 border-dashed">
                <div className="text-sm font-medium">📊 Track expenses and receipts</div>
              </Button>
              <Button variant="outline" className="h-auto p-4 text-left justify-start whitespace-nowrap flex-shrink-0">
                <div className="text-sm font-medium">🔍 Compare insurance quotes</div>
              </Button>
              <Button variant="outline" className="h-auto p-4 text-left justify-start whitespace-nowrap flex-shrink-0">
                <div className="text-sm font-medium">📱 Manage subscriptions</div>
              </Button>
            </div>
            <div className="flex gap-4 pr-4">
              <Button variant="outline" className="h-auto p-4 text-left justify-start whitespace-nowrap flex-shrink-0">
                <div className="text-sm font-medium">� Do your taxes</div>
              </Button>
              <Button variant="outline" className="h-auto p-4 text-left justify-start whitespace-nowrap flex-shrink-0 border-2 border-dashed">
                <div className="text-sm font-medium">📊 Track expenses and receipts</div>
              </Button>
              <Button variant="outline" className="h-auto p-4 text-left justify-start whitespace-nowrap flex-shrink-0">
                <div className="text-sm font-medium">🔍 Compare insurance quotes</div>
              </Button>
              <Button variant="outline" className="h-auto p-4 text-left justify-start whitespace-nowrap flex-shrink-0">
                <div className="text-sm font-medium">📱 Manage subscriptions</div>
              </Button>
            </div>
          </div>
        </div>

        {/* Row 3 - Scroll Left */}
        <div className="relative mb-4 overflow-hidden">
          <div className="flex animate-scroll-left">
            <div className="flex gap-4 pr-4">
              <Button variant="outline" className="h-auto p-4 text-left justify-start whitespace-nowrap flex-shrink-0">
                <div className="text-sm font-medium">🛒 Find discount codes</div>
              </Button>
              <Button variant="outline" className="h-auto p-4 text-left justify-start whitespace-nowrap flex-shrink-0">
                <div className="text-sm font-medium">📉 Price-drop alerts</div>
              </Button>
              <Button variant="outline" className="h-auto p-4 text-left justify-start whitespace-nowrap flex-shrink-0">
                <div className="text-sm font-medium">📏 Compare product specs</div>
              </Button>
              <Button variant="outline" className="h-auto p-4 text-left justify-start whitespace-nowrap flex-shrink-0">
                <div className="text-sm font-medium">🤝 Negotiate deals</div>
              </Button>
            </div>
            <div className="flex gap-4 pr-4">
              <Button variant="outline" className="h-auto p-4 text-left justify-start whitespace-nowrap flex-shrink-0">
                <div className="text-sm font-medium">🛒 Find discount codes</div>
              </Button>
              <Button variant="outline" className="h-auto p-4 text-left justify-start whitespace-nowrap flex-shrink-0">
                <div className="text-sm font-medium">📉 Price-drop alerts</div>
              </Button>
              <Button variant="outline" className="h-auto p-4 text-left justify-start whitespace-nowrap flex-shrink-0">
                <div className="text-sm font-medium">📏 Compare product specs</div>
              </Button>
              <Button variant="outline" className="h-auto p-4 text-left justify-start whitespace-nowrap flex-shrink-0">
                <div className="text-sm font-medium">🤝 Negotiate deals</div>
              </Button>
            </div>
          </div>
        </div>

        {/* Row 4 - Scroll Right */}
        <div className="relative mb-8 overflow-hidden">
          <div className="flex animate-scroll-right">
            <div className="flex gap-4 pr-4">
              <Button variant="outline" className="h-auto p-4 text-left justify-start whitespace-nowrap flex-shrink-0">
                <div className="text-sm font-medium">📊 Create presentations from bullet points</div>
              </Button>
              <Button variant="outline" className="h-auto p-4 text-left justify-start whitespace-nowrap flex-shrink-0">
                <div className="text-sm font-medium">✈️ Book travel and hotels</div>
              </Button>
              <Button variant="outline" className="h-auto p-4 text-left justify-start whitespace-nowrap flex-shrink-0">
                <div className="text-sm font-medium">🍳 Find recipes from ingredients</div>
              </Button>
              <Button variant="outline" className="h-auto p-4 text-left justify-start whitespace-nowrap flex-shrink-0">
                <div className="text-sm font-medium">📈 Track OKRs and KPIs</div>
              </Button>
            </div>
            <div className="flex gap-4 pr-4">
              <Button variant="outline" className="h-auto p-4 text-left justify-start whitespace-nowrap flex-shrink-0">
                <div className="text-sm font-medium">📊 Create presentations from bullet points</div>
              </Button>
              <Button variant="outline" className="h-auto p-4 text-left justify-start whitespace-nowrap flex-shrink-0">
                <div className="text-sm font-medium">✈️ Book travel and hotels</div>
              </Button>
              <Button variant="outline" className="h-auto p-4 text-left justify-start whitespace-nowrap flex-shrink-0">
                <div className="text-sm font-medium">🍳 Find recipes from ingredients</div>
              </Button>
              <Button variant="outline" className="h-auto p-4 text-left justify-start whitespace-nowrap flex-shrink-0">
                <div className="text-sm font-medium">📈 Track OKRs and KPIs</div>
              </Button>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground italic">
            PS. You can add as many use cases as you want via natural language
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background/95 backdrop-blur-sm mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="col-span-1 md:col-span-2">
              <div className="text-2xl font-bold mb-4">
                <span className="text-foreground">ClawdWako</span>
                <span className="text-muted-foreground">.com</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Deploy your AI agent in under 60 seconds. No technical experience required.
              </p>
              <p className="text-xs text-muted-foreground">
                Built by <span className="text-primary font-medium">Neda Labs</span>
              </p>
            </div>

            {/* Product */}
            <div>
              <h3 className="text-sm font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#templates" className="hover:text-foreground transition-colors">Templates</a></li>
                <li><a href="#docs" className="hover:text-foreground transition-colors">Documentation</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-sm font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="mailto:support@nedapay.xyz" className="hover:text-foreground transition-colors">
                    Contact Support
                  </a>
                </li>
                <li><a href="#faq" className="hover:text-foreground transition-colors">FAQ</a></li>
                <li><a href="#status" className="hover:text-foreground transition-colors">Status</a></li>
                <li><a href="#community" className="hover:text-foreground transition-colors">Community</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Neda Labs. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#privacy" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </a>
              <a href="#terms" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Telegram Bot Modal */}
      <TelegramBotModal 
        open={showTelegramModal}
        onOpenChange={setShowTelegramModal}
        onSuccess={handleTelegramSuccess}
      />

      {/* Deployment Success Modal */}
      {deploymentResult && (
        <DeploymentSuccessModal
          open={showSuccessModal}
          onOpenChange={setShowSuccessModal}
          botUsername={deploymentResult.username}
          botId={deploymentResult.id}
          railwayProjectId={deploymentResult.railwayProjectId}
        />
      )}
    </div>
  );
}
