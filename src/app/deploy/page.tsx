"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  Settings, 
  MessageSquare, 
  ShoppingCart, 
  TrendingUp, 
  FileText, 
  Users,
  Zap,
  Cloud,
  Key,
  Smartphone
} from "lucide-react";

const templates = [
  {
    id: 1,
    name: "Personal Assistant",
    description: "Your 24/7 AI assistant for scheduling, reminders, and general tasks",
    icon: Bot,
    category: "Productivity",
    deployTime: "2 min",
    price: "Free"
  },
  {
    id: 2,
    name: "Customer Support Bot",
    description: "Automated customer service with intelligent ticket routing",
    icon: MessageSquare,
    category: "Business",
    deployTime: "3 min",
    price: "$10/mo"
  },
  {
    id: 3,
    name: "E-commerce Assistant",
    description: "Sales bot for product recommendations and order processing",
    icon: ShoppingCart,
    category: "E-commerce",
    deployTime: "4 min",
    price: "$15/mo"
  },
  {
    id: 4,
    name: "Crypto Trading Bot",
    description: "Automated trading with risk management and portfolio tracking",
    icon: TrendingUp,
    category: "Finance",
    deployTime: "5 min",
    price: "$25/mo"
  }
];

const llmOptions = [
  { id: "gpt-4", name: "GPT-4", provider: "OpenAI", description: "Most capable model for complex tasks" },
  { id: "claude-3", name: "Claude 3 Opus", provider: "Anthropic", description: "Excellent for analysis and reasoning" },
  { id: "gemini-pro", name: "Gemini Pro", provider: "Google", description: "Great for multimodal tasks" },
  { id: "gpt-3.5", name: "GPT-3.5 Turbo", provider: "OpenAI", description: "Fast and cost-effective" }
];

const channels = [
  { id: "telegram", name: "Telegram", icon: MessageSquare, setup: "Bot token required" },
  { id: "whatsapp", name: "WhatsApp", icon: Smartphone, setup: "QR code scan" },
  { id: "discord", name: "Discord", icon: Users, setup: "Bot token required" },
  { id: "slack", name: "Slack", icon: MessageSquare, setup: "OAuth integration" }
];

export default function Deploy() {
  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [selectedLLM, setSelectedLLM] = useState<string | null>(null);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentComplete, setDeploymentComplete] = useState(false);

  const handleTemplateSelect = (templateId: number) => {
    setSelectedTemplate(templateId);
  };

  const handleLLMSelect = (llmId: string) => {
    setSelectedLLM(llmId);
  };

  const handleChannelToggle = (channelId: string) => {
    setSelectedChannels(prev => 
      prev.includes(channelId) 
        ? prev.filter(id => id !== channelId)
        : [...prev, channelId]
    );
  };

  const handleDeploy = async () => {
    setIsDeploying(true);
    // Simulate deployment process
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsDeploying(false);
    setDeploymentComplete(true);
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const canProceed = () => {
    switch (step) {
      case 1: return selectedTemplate !== null;
      case 2: return selectedLLM !== null;
      case 3: return selectedChannels.length > 0;
      default: return true;
    }
  };

  if (deploymentComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Deployment Successful!</CardTitle>
            <CardDescription>
              Your AI agent is now running and ready to serve
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Agent Details:</p>
              <p className="font-semibold">{templates.find(t => t.id === selectedTemplate)?.name}</p>
              <p className="text-sm text-gray-600">Status: Running</p>
              <p className="text-sm text-gray-600">Uptime: 100%</p>
            </div>
            <Button className="w-full" onClick={() => window.location.href = '/dashboard'}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Bot className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">ClawdWako</span>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline">Step {step} of 4</Badge>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Deployment Progress</span>
            <span className="text-sm font-medium text-gray-600">{Math.round((step / 4) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Step 1: Template Selection */}
        {step === 1 && (
          <div>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Choose Your AI Agent Template</h1>
              <p className="text-gray-600">Select a pre-built template to get started quickly</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {templates.map((template) => {
                const IconComponent = template.icon;
                return (
                  <Card 
                    key={template.id}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedTemplate === template.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                    onClick={() => handleTemplateSelect(template.id)}
                  >
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <IconComponent className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{template.name}</CardTitle>
                          <Badge variant="outline" className="text-xs mt-1">
                            {template.category}
                          </Badge>
                        </div>
                      </div>
                      <CardDescription className="mt-3">
                        {template.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center space-x-1">
                          <Zap className="h-4 w-4 text-gray-500" />
                          <span>Deploy in {template.deployTime}</span>
                        </div>
                        <span className="font-semibold">{template.price}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: LLM Selection */}
        {step === 2 && (
          <div>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Choose Your LLM</h1>
              <p className="text-gray-600">Select the AI model that will power your agent</p>
            </div>
            
            <div className="grid gap-4 mb-8">
              {llmOptions.map((llm) => (
                <Card 
                  key={llm.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedLLM === llm.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => handleLLMSelect(llm.id)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{llm.name}</CardTitle>
                        <CardDescription>{llm.provider}</CardDescription>
                      </div>
                      <Badge variant="outline">{llm.provider}</Badge>
                    </div>
                    <CardDescription className="mt-2">
                      {llm.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Channel Configuration */}
        {step === 3 && (
          <div>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Connect Channels</h1>
              <p className="text-gray-600">Choose where your AI agent will be available</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {channels.map((channel) => {
                const IconComponent = channel.icon;
                const isSelected = selectedChannels.includes(channel.id);
                return (
                  <Card 
                    key={channel.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                    onClick={() => handleChannelToggle(channel.id)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <IconComponent className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{channel.name}</CardTitle>
                            <CardDescription>{channel.setup}</CardDescription>
                          </div>
                        </div>
                        {isSelected && <CheckCircle className="h-5 w-5 text-blue-600" />}
                      </div>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 4: Review & Deploy */}
        {step === 4 && (
          <div>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Review & Deploy</h1>
              <p className="text-gray-600">Confirm your configuration and deploy your AI agent</p>
            </div>
            
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Deployment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Template:</p>
                  <p className="font-semibold">{templates.find(t => t.id === selectedTemplate)?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">LLM:</p>
                  <p className="font-semibold">{llmOptions.find(l => l.id === selectedLLM)?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Channels:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedChannels.map(channelId => {
                      const channel = channels.find(c => c.id === channelId);
                      return (
                        <Badge key={channelId} variant="secondary">
                          {channel?.name}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Estimated monthly cost:</p>
                  <p className="font-semibold text-lg">$12.50/mo</p>
                </div>
              </CardContent>
            </Card>

            <Button 
              onClick={handleDeploy}
              disabled={isDeploying}
              className="w-full h-12 text-lg"
            >
              {isDeploying ? (
                <>
                  <Cloud className="h-5 w-5 mr-2 animate-spin" />
                  Deploying Agent...
                </>
              ) : (
                <>
                  <Zap className="h-5 w-5 mr-2" />
                  Deploy Agent
                </>
              )}
            </Button>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button 
            variant="outline" 
            onClick={prevStep}
            disabled={step === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          {step < 4 && (
            <Button 
              onClick={nextStep}
              disabled={!canProceed()}
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
