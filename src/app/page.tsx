"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bot, Mail, Moon, Sun, LogOut, User as UserIcon, Sparkles, Zap, Shield, Rocket, ArrowRight, Check, Star, Cpu, Globe, Lock, TrendingUp, Users, MessageSquare, BarChart3, Layers, Send } from "lucide-react";
import { TelegramBotModal } from "@/components/TelegramBotModal";
import { DeploymentSuccessModal } from "@/components/DeploymentSuccessModal";
import { signIn, signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const { data: session } = useSession();
  const [selectedModel, setSelectedModel] = useState("claude-opus");
  const [showTelegramModal, setShowTelegramModal] = useState(false);
  const [telegramBotInfo, setTelegramBotInfo] = useState<any>(null);
  const [deploying, setDeploying] = useState(false);
  const { theme, setTheme } = useTheme();
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [userApiKey, setUserApiKey] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [deploymentResult, setDeploymentResult] = useState<any>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

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
      callbackUrl: `${window.location.origin}/dashboard`,
      redirect: false,
    }).then((result) => {
      if (result?.ok) {
        router.push('/dashboard');
      }
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg overflow-hidden">
                <img 
                  src="/claw.jpg" 
                  alt="Clawdwako" 
                  className="h-full w-full object-cover"
                  style={{
                    filter: 'hue-rotate(100deg) saturate(1.2) brightness(1.1)'
                  }}
                />
              </div>
              <span className="text-lg font-bold">Clawdwako<span className="text-muted-foreground">.ai</span></span>
            </div>
            
            {/* Mobile Navigation */}
            <div className="flex md:hidden items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="text-muted-foreground hover:text-foreground relative"
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
              {!session && (
                <button
                  onClick={() => signIn('google')}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white font-semibold text-sm transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                >
                  Sign In
                </button>
              )}
              {session && (
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="h-8 w-8 bg-primary rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
                >
                  <span className="text-primary-foreground text-sm font-medium">
                    {session?.user?.name?.charAt(0).toUpperCase() || session?.user?.email?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </button>
              )}
            </div>
            
            {/* Desktop Navigation */}
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
              {session && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/dashboard')}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Dashboard
                </Button>
              )}
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
              
              {/* User Profile or Sign In */}
              {!session && (
                <button
                  onClick={() => signIn('google')}
                  className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                >
                  Sign In
                </button>
              )}
              {session ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="h-8 w-8 bg-primary rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
                  >
                    <span className="text-primary-foreground text-sm font-medium">
                      {session?.user?.name?.charAt(0).toUpperCase() || session?.user?.email?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </button>
                  
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-background border border-border rounded-lg shadow-lg z-50">
                      <div className="p-4 border-b border-border">
                        <p className="text-sm font-medium text-foreground">
                          {session?.user?.name || 'User'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {session?.user?.email || 'Not signed in'}
                        </p>
                      </div>
                      <div className="p-2">
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            router.push('/dashboard');
                          }}
                          className="w-full flex items-center px-3 py-2 text-sm text-foreground hover:bg-accent rounded-md transition-colors"
                        >
                          <UserIcon className="h-4 w-4 mr-2" />
                          Dashboard
                        </button>
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            signOut({ callbackUrl: '/' });
                          }}
                          className="w-full flex items-center px-3 py-2 text-sm text-destructive hover:bg-accent rounded-md transition-colors"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </nav>

      {/* Minimalist Hero - Robot Inspired */}
      <section className="relative min-h-screen bg-background px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto pt-8 lg:pt-12 pb-12 lg:pb-20">
          {/* Top Section - Title */}
          <div className="mb-12 lg:mb-20">
            <div className="flex items-start justify-between mb-8">
              <div>
                <div className="text-sm tracking-[0.3em] text-muted-foreground mb-4">MEET CLAWDWAKO</div>
                <h1 className="text-5xl lg:text-[120px] leading-none font-light tracking-tight">
                  <span className="block text-foreground">YOUR</span>
                  <span className="block text-foreground">OWN</span>
                  <span className="block bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">AI AGENTS</span>
                </h1>
              </div>
              <div className="hidden lg:block text-right space-y-2">
                <div className="flex items-center justify-end gap-2">
                  <div className="w-3 h-3 rounded-full border-2 border-foreground" />
                  <div className="w-px h-32 bg-foreground" />
                  <span className="text-sm tracking-wider">EFFICIENT</span>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <div className="w-3 h-3 rounded-full border-2 border-foreground" />
                  <div className="w-px h-32 bg-foreground" />
                  <span className="text-sm tracking-wider">POTENTIAL</span>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <div className="w-3 h-3 rounded-full border-2 border-foreground" />
                  <div className="w-px h-32 bg-foreground" />
                  <span className="text-sm tracking-wider">AMPLIFY</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start">
            {/* Left - Agent Showcase */}
            <div className="space-y-8 lg:space-y-12">
              <div>
                <h2 className="text-4xl lg:text-6xl font-light mb-3 lg:mb-4">Clawdwako.</h2>
                <div className="text-xs lg:text-sm tracking-[0.2em] text-muted-foreground mb-6 lg:mb-8">THE WORLD'S LEADING AI AGENT</div>
                <div className="flex gap-2 mb-6 lg:mb-8">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <div className="w-8 h-2 rounded-full bg-green-400" />
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                </div>
              </div>

              {/* Configuration Section - Mobile Only */}
              <div className="lg:hidden space-y-6 rounded-lg border border-border p-4 bg-background/50">
                {/* Choose AI Model */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="w-4 h-4 text-green-400" />
                    <h3 className="text-lg font-bold tracking-tight">Choose Your AI Brain</h3>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">Pick the most powerful AI model for your needs</p>
                  
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      onClick={() => setSelectedModel('claude-opus')}
                      className={`p-3 rounded-lg border-2 transition-all flex items-center gap-2 ${
                        selectedModel === 'claude-opus'
                          ? 'border-green-400 bg-green-400/5'
                          : 'border-border hover:border-green-400/50'
                      }`}
                    >
                      <img src="/Claude-ai-logo.png" alt="Claude" className="w-4 h-4" />
                      <div className="text-left">
                        <div className="text-xs font-bold">Claude</div>
                        <div className="text-[10px] text-muted-foreground">Opus 4.5</div>
                      </div>
                    </button>
                    <button
                      onClick={() => setSelectedModel('gpt-4')}
                      className={`p-3 rounded-lg border-2 transition-all flex items-center gap-2 ${
                        selectedModel === 'gpt-4'
                          ? 'border-green-400 bg-green-400/5'
                          : 'border-border hover:border-green-400/50'
                      }`}
                    >
                      <img src="/gpt.png" alt="GPT" className="w-4 h-4" />
                      <div className="text-left">
                        <div className="text-xs font-bold">GPT</div>
                        <div className="text-[10px] text-muted-foreground">5.2</div>
                      </div>
                    </button>
                    <button
                      onClick={() => setSelectedModel('gemini-pro')}
                      className={`p-3 rounded-lg border-2 transition-all flex items-center gap-2 ${
                        selectedModel === 'gemini-pro'
                          ? 'border-green-400 bg-green-400/5'
                          : 'border-border hover:border-green-400/50'
                      }`}
                    >
                      <img src="/google gemini.png" alt="Gemini" className="w-4 h-4" />
                      <div className="text-left">
                        <div className="text-xs font-bold">Gemini</div>
                        <div className="text-[10px] text-muted-foreground">3 Flash</div>
                      </div>
                    </button>
                  </div>
                  
                  <div className="text-center mt-3">
                    <button
                      type="button"
                      onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                      className="text-[10px] text-muted-foreground hover:text-green-400 transition-colors underline"
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
                        className="w-full px-3 py-2 text-xs border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-green-400"
                      />
                    </div>
                  )}
                </div>

                {/* Connect Platform */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Rocket className="w-4 h-4 text-green-400" />
                    <h3 className="text-lg font-bold tracking-tight">Connect Your Platform</h3>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">Start with Telegram, more platforms coming soon</p>
                  
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      onClick={() => setShowTelegramModal(true)}
                      className="p-3 rounded-lg border-2 border-green-400 bg-green-400/5 transition-all flex items-center gap-2"
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                        <Send className="w-4 h-4 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="text-xs font-bold">Telegram</div>
                      </div>
                    </button>
                    <button
                      disabled
                      className="p-3 rounded-lg border-2 border-border bg-background/50 transition-all flex items-center gap-2 opacity-50 cursor-not-allowed"
                    >
                      <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                        </svg>
                      </div>
                      <div className="text-left">
                        <div className="text-xs font-bold">Discord</div>
                        <div className="text-[10px] text-muted-foreground">Coming soon</div>
                      </div>
                    </button>
                    <button
                      disabled
                      className="p-3 rounded-lg border-2 border-border bg-background/50 transition-all flex items-center gap-2 opacity-50 cursor-not-allowed"
                    >
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967c-.273-.099-.471-.148-.67.15c-.197.297-.767.966-.94 1.164c-.173.199-.347.223-.644.075c-.297-.15-1.255-.463-2.39-1.475c-.883-.788-1.48-1.761-1.653-2.059c-.173-.297-.018-.458.13-.606c.134-.133.298-.347.446-.52c.149-.174.198-.298.298-.497c.099-.198.05-.371-.025-.52c-.075-.149-.669-1.612-.916-2.207c-.242-.579-.487-.5-.669-.51c-.173-.008-.371-.01-.57-.01c-.198 0-.52.074-.792.372c-.272.297-1.04 1.016-1.04 2.479c0 1.462 1.065 2.875 1.213 3.074c.149.198 2.096 3.2 5.077 4.487c.709.306 1.262.489 1.694.625c.712.227 1.36.195 1.871.118c.571-.085 1.758-.719 2.006-1.413c.248-.694.248-1.289.173-1.413c-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214l-3.741.982l.998-3.648l-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884c2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                      </div>
                      <div className="text-left">
                        <div className="text-xs font-bold">WhatsApp</div>
                        <div className="text-[10px] text-muted-foreground">Coming soon</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Sign In / User Profile */}
                {session ? (
                  <>
                    {/* User Profile Card */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
                          {session.user?.name?.charAt(0).toUpperCase() || session.user?.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div className="text-sm font-bold">{session.user?.name || 'User'}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {session.user?.email}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => signOut()}
                        className="p-2 hover:bg-background rounded-lg transition-colors"
                        title="Sign out"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
                      </button>
                    </div>

                    {/* Deploy Agent Button */}
                    <button
                      onClick={handleDeploy}
                      disabled={!telegramBotInfo || deploying}
                      className={`w-full py-3 rounded-lg font-semibold transition-all ${
                        !telegramBotInfo
                          ? 'bg-muted text-muted-foreground cursor-not-allowed'
                          : deploying
                          ? 'bg-green-400/50 text-white cursor-wait'
                          : 'bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl'
                      }`}
                    >
                      {deploying ? 'Deploying...' : 'Deploy Agent'}
                    </button>

                    {!telegramBotInfo && (
                      <p className="text-xs text-center text-muted-foreground">
                        Connect Telegram first to proceed with deployment
                      </p>
                    )}
                  </>
                ) : (
                  <button
                    onClick={handleGoogleSignIn}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border-2 border-border hover:border-green-400/50 bg-background hover:bg-background/80 transition-all"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="font-semibold">Sign in with Google</span>
                  </button>
                )}
              </div>

              {/* Agent Visual Placeholder - Desktop Only */}
              <div className="hidden lg:block relative aspect-[3/4] bg-gradient-to-br from-green-500/5 to-emerald-500/5 rounded-2xl border border-green-500/20 overflow-hidden group">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Bot className="w-48 h-48 text-green-400/20" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-4 lg:gap-8">
                <div>
                  <div className="text-xs tracking-wider text-muted-foreground mb-2">RESPONSE TIME</div>
                  <div className="text-2xl font-light">&lt; 2s <span className="text-sm text-muted-foreground">(avg)</span></div>
                </div>
                <div>
                  <div className="text-xs tracking-wider text-muted-foreground mb-2">ACCURACY</div>
                  <div className="text-2xl font-light">99.9% <span className="text-sm text-muted-foreground">(verified)</span></div>
                </div>
                <div>
                  <div className="text-xs tracking-wider text-muted-foreground mb-2">LANGUAGES</div>
                  <div className="text-2xl font-light">95+ <span className="text-sm text-muted-foreground">(supported)</span></div>
                </div>
                <div>
                  <div className="text-xs tracking-wider text-muted-foreground mb-2">DEPLOY TIME</div>
                  <div className="text-2xl font-light">&lt; 60s</div>
                </div>
                <div>
                  <div className="text-xs tracking-wider text-muted-foreground mb-2">UPTIME</div>
                  <div className="text-2xl font-light">24/7</div>
                </div>
                <div>
                  <div className="text-xs tracking-wider text-muted-foreground mb-2">AI MODELS</div>
                  <div className="text-2xl font-light">3</div>
                </div>
              </div>
            </div>

            {/* Right - Description & CTA */}
            <div className="lg:pt-32 space-y-8">
              <div className="space-y-6">
                <button className="group px-6 py-3 bg-foreground text-background rounded-full text-sm font-medium hover:bg-green-400 transition-all flex items-center gap-2">
                  DISCOVER CLAWDWAKO
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <p className="text-xl leading-relaxed text-muted-foreground">
                  Clawdwako is our next-gen AI automation unit, providing highly efficient services across various use cases, starting with Telegram applications
                </p>
              </div>

              {/* Feature List */}
              <div className="space-y-4 pt-8 border-t border-border">
                <div className="flex items-start gap-4">
                  <div className="w-1 h-1 rounded-full bg-green-400 mt-2" />
                  <div>
                    <h3 className="font-medium mb-1">Multi-Model Intelligence</h3>
                    <p className="text-sm text-muted-foreground">Choose from Claude, GPT-4, or Gemini</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-1 h-1 rounded-full bg-green-400 mt-2" />
                  <div>
                    <h3 className="font-medium mb-1">Zero Configuration</h3>
                    <p className="text-sm text-muted-foreground">Deploy in under 60 seconds, no coding required</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-1 h-1 rounded-full bg-green-400 mt-2" />
                  <div>
                    <h3 className="font-medium mb-1">Enterprise Security</h3>
                    <p className="text-sm text-muted-foreground">Bank-grade encryption and data protection</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-1 h-1 rounded-full bg-green-400 mt-2" />
                  <div>
                    <h3 className="font-medium mb-1">24/7 Operation</h3>
                    <p className="text-sm text-muted-foreground">Always online, always responsive</p>
                  </div>
                </div>
              </div>

              {/* Configuration Section - Desktop Only */}
              <div className="hidden lg:block space-y-6 pt-6 border-t border-border mt-6 lg:border-0 lg:pt-6 lg:mt-6">
                {/* Choose AI Model */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="w-4 h-4 text-green-400" />
                    <h3 className="text-lg font-bold tracking-tight">Choose Your AI Brain</h3>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">Pick the most powerful AI model for your needs</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      onClick={() => setSelectedModel('claude-opus')}
                      className={`p-3 rounded-lg border-2 transition-all flex items-center gap-2 ${
                        selectedModel === 'claude-opus'
                          ? 'border-green-400 bg-green-400/5'
                          : 'border-border hover:border-green-400/50'
                      }`}
                    >
                      <img src="/Claude-ai-logo.png" alt="Claude" className="w-4 h-4" />
                      <div className="text-left">
                        <div className="text-xs font-bold">Claude</div>
                        <div className="text-[10px] text-muted-foreground">Opus 4.5</div>
                      </div>
                    </button>
                    <button
                      onClick={() => setSelectedModel('gpt-4')}
                      className={`p-3 rounded-lg border-2 transition-all flex items-center gap-2 ${
                        selectedModel === 'gpt-4'
                          ? 'border-green-400 bg-green-400/5'
                          : 'border-border hover:border-green-400/50'
                      }`}
                    >
                      <img src="/gpt.png" alt="GPT" className="w-4 h-4" />
                      <div className="text-left">
                        <div className="text-xs font-bold">GPT</div>
                        <div className="text-[10px] text-muted-foreground">5.2</div>
                      </div>
                    </button>
                    <button
                      onClick={() => setSelectedModel('gemini-pro')}
                      className={`p-3 rounded-lg border-2 transition-all flex items-center gap-2 ${
                        selectedModel === 'gemini-pro'
                          ? 'border-green-400 bg-green-400/5'
                          : 'border-border hover:border-green-400/50'
                      }`}
                    >
                      <img src="/google gemini.png" alt="Gemini" className="w-4 h-4" />
                      <div className="text-left">
                        <div className="text-xs font-bold">Gemini</div>
                        <div className="text-[10px] text-muted-foreground">3 Flash</div>
                      </div>
                    </button>
                  </div>
                  
                  <div className="text-center mt-3">
                    <button
                      type="button"
                      onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                      className="text-[10px] text-muted-foreground hover:text-green-400 transition-colors underline"
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
                        className="w-full px-3 py-2 text-xs border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-green-400"
                      />
                    </div>
                  )}
                </div>

                {/* Connect Platform */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Rocket className="w-4 h-4 text-green-400" />
                    <h3 className="text-lg font-bold tracking-tight">Connect Your Platform</h3>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">Start with Telegram, more platforms coming soon</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      onClick={() => setShowTelegramModal(true)}
                      className="p-3 rounded-lg border-2 border-green-400 bg-green-400/5 transition-all flex items-center gap-2"
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                        <Send className="w-4 h-4 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="text-xs font-bold">Telegram</div>
                      </div>
                    </button>
                    <button
                      disabled
                      className="p-3 rounded-lg border-2 border-border bg-background/50 transition-all flex items-center gap-2 opacity-50 cursor-not-allowed"
                    >
                      <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                        </svg>
                      </div>
                      <div className="text-left">
                        <div className="text-xs font-bold">Discord</div>
                        <div className="text-[10px] text-muted-foreground">Coming soon</div>
                      </div>
                    </button>
                    <button
                      disabled
                      className="p-3 rounded-lg border-2 border-border bg-background/50 transition-all flex items-center gap-2 opacity-50 cursor-not-allowed"
                    >
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967c-.273-.099-.471-.148-.67.15c-.197.297-.767.966-.94 1.164c-.173.199-.347.223-.644.075c-.297-.15-1.255-.463-2.39-1.475c-.883-.788-1.48-1.761-1.653-2.059c-.173-.297-.018-.458.13-.606c.134-.133.298-.347.446-.52c.149-.174.198-.298.298-.497c.099-.198.05-.371-.025-.52c-.075-.149-.669-1.612-.916-2.207c-.242-.579-.487-.5-.669-.51c-.173-.008-.371-.01-.57-.01c-.198 0-.52.074-.792.372c-.272.297-1.04 1.016-1.04 2.479c0 1.462 1.065 2.875 1.213 3.074c.149.198 2.096 3.2 5.077 4.487c.709.306 1.262.489 1.694.625c.712.227 1.36.195 1.871.118c.571-.085 1.758-.719 2.006-1.413c.248-.694.248-1.289.173-1.413c-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214l-3.741.982l.998-3.648l-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884c2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                      </div>
                      <div className="text-left">
                        <div className="text-xs font-bold">WhatsApp</div>
                        <div className="text-[10px] text-muted-foreground">Coming soon</div>
                      </div>
                    </button>
                  </div>
                  
                  {/* User Profile or Sign in */}
                  <div className="mt-6 space-y-3">
                    {session ? (
                      <>
                        {/* User Profile Card */}
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
                              {session.user?.name?.charAt(0).toUpperCase() || session.user?.email?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div>
                              <div className="text-sm font-bold">{session.user?.name || 'User'}</div>
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {session.user?.email}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => signOut()}
                            className="p-2 hover:bg-background rounded-lg transition-colors"
                            title="Sign out"
                          >
                            <LogOut className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                        
                        <p className="text-xs text-muted-foreground text-center">
                          {telegramBotInfo ? 'Ready to deploy!' : 'Connect Telegram first to proceed with deployment'}
                        </p>
                        <button
                          onClick={handleDeploy}
                          disabled={!telegramBotInfo || deploying}
                          className="w-full py-3 rounded-lg bg-gradient-to-r from-green-400 via-emerald-500 to-green-500 text-white font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
                        >
                          {deploying ? (
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Deploying...
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-2">
                              Deploy Agent
                              <ArrowRight className="w-4 h-4" />
                            </div>
                          )}
                        </button>
                        {!telegramBotInfo && (
                          <p className="text-[10px] text-muted-foreground text-center">
                            Link Telegram to proceed. <span className="text-green-400">Limited servers — 11 remaining</span>
                          </p>
                        )}
                      </>
                    ) : (
                      <>
                        <p className="text-xs text-muted-foreground text-center">
                          Connect Telegram first to proceed with deployment
                        </p>
                        <button
                          onClick={() => signIn('google')}
                          className="w-full py-3 rounded-lg border-2 border-border hover:border-green-400 transition-all flex items-center justify-center gap-2 bg-background"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                          </svg>
                          <span className="text-sm font-medium">Sign in with Google</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
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
