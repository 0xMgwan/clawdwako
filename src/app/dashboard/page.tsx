"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConfigureModal } from "@/components/ConfigureModal";
import { ViewLogsModal } from "@/components/ViewLogsModal";
import { 
  Bot, 
  Plus, 
  Settings, 
  Activity, 
  Users, 
  MessageSquare, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Clock,
  MoreVertical,
  Play,
  Pause,
  Trash2,
  RefreshCw,
  ExternalLink,
  Key,
  Sun,
  Moon,
  LogOut,
  User as UserIcon
} from "lucide-react";

const deployedAgents = [
  {
    id: 1,
    name: "Personal Assistant",
    type: "Productivity",
    status: "running",
    uptime: "99.9%",
    messages: 1247,
    users: 1,
    lastActive: "2 min ago",
    cost: "$8.50/mo",
    channels: ["Telegram", "WhatsApp"]
  },
  {
    id: 2,
    name: "Customer Support Bot",
    type: "Business",
    status: "running",
    uptime: "98.7%",
    messages: 3891,
    users: 156,
    lastActive: "1 min ago",
    cost: "$15.20/mo",
    channels: ["Discord", "Slack"]
  },
  {
    id: 3,
    name: "Crypto Trading Bot",
    type: "Finance",
    status: "paused",
    uptime: "95.2%",
    messages: 892,
    users: 1,
    lastActive: "1 hour ago",
    cost: "$22.00/mo",
    channels: ["Telegram"]
  },
  {
    id: 4,
    name: "Content Creator",
    type: "Content",
    status: "error",
    uptime: "89.1%",
    messages: 234,
    users: 1,
    lastActive: "3 hours ago",
    cost: "$12.00/mo",
    channels: ["Twitter", "LinkedIn"]
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "running": return "text-green-600 bg-green-100";
    case "paused": return "text-yellow-600 bg-yellow-100";
    case "error": return "text-red-600 bg-red-100";
    default: return "text-gray-600 bg-gray-100";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "running": return CheckCircle;
    case "paused": return Clock;
    case "error": return AlertCircle;
    default: return Clock;
  }
};

export default function Dashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [bots, setBots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [configureBot, setConfigureBot] = useState<any>(null);
  const [viewLogsBot, setViewLogsBot] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Fetch user's bots from the database
    const fetchBots = async () => {
      console.log('🔍 FETCHING BOTS FROM DATABASE...');
      try {
        const response = await fetch('/api/bots');
        const data = await response.json();
        console.log('📦 API Response:', data);
        
        if (data.success && data.bots.length > 0) {
          console.log('✅ Found', data.bots.length, 'bots in database');
          // Map database bots to dashboard format
          const mappedBots = data.bots.map((bot: any) => ({
            id: bot.id,
            name: bot.name || bot.telegramBotUsername,
            type: 'AI Agent',
            status: bot.status === 'configured' ? 'paused' : bot.status,
            uptime: '99.9%',
            messages: 0,
            users: 0,
            cost: '$0.00/mo',
            channels: ['Telegram'],
            lastActive: new Date(bot.deployedAt).toLocaleString(),
            model: bot.selectedModel
          }));
          
          console.log('🤖 Mapped bots:', mappedBots);
          setBots(mappedBots);
        } else {
          console.log('⚠️ No bots found, using mock data');
          setBots(deployedAgents);
        }
      } catch (error) {
        console.error('❌ Error fetching bots:', error);
        setBots(deployedAgents);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBots();
  }, []);

  const handleViewLogs = (botId: string) => {
    const bot = bots.find(b => b.id === botId);
    if (bot) setViewLogsBot(bot);
  };

  const handleConfigure = (botId: string) => {
    const bot = bots.find(b => b.id === botId);
    if (bot) setConfigureBot(bot);
  };

  const handleSaveConfig = async (botId: string, data: any) => {
    try {
      const response = await fetch(`/api/bots/${botId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (response.ok) {
        // Refresh bots
        const botsResponse = await fetch('/api/bots');
        const botsData = await botsResponse.json();
        if (botsData.success) {
          setBots(botsData.bots.map((bot: any) => ({
            ...bot,
            type: 'AI Agent',
            uptime: '99.9%',
            lastActive: new Date(bot.updatedAt).toLocaleString(),
            cost: '$0.00/mo',
            channels: ['Telegram']
          })));
        }
      }
    } catch (error) {
      console.error('Error saving config:', error);
    }
  };

  const handlePause = async (botId: string) => {
    const bot = bots.find(b => b.id === botId);
    if (!bot) return;
    
    const newStatus = bot.status === 'paused' ? 'running' : 'paused';
    
    // Update bot status in database
    try {
      const response = await fetch(`/api/bots/${botId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        // Update local state
        setBots(bots.map(b => b.id === botId ? { ...b, status: newStatus } : b));
      }
    } catch (error) {
      console.error('Failed to update bot status:', error);
      alert('Failed to update bot status. Please try again.');
    }
  };

  const handleDelete = async (botId: string) => {
    if (!confirm('Are you sure you want to delete this bot? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/bots/${botId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setBots(bots.filter(bot => bot.id !== botId));
      } else {
        alert('Failed to delete bot. Please try again.');
      }
    } catch (error) {
      console.error('Failed to delete bot:', error);
      alert('Failed to delete bot. Please try again.');
    }
  };

  console.log('🎯 Current bots state:', bots);
  console.log('🎯 Number of bots:', bots.length);

  // Calculate real stats from bots
  const activeAgents = bots.length;
  const runningBots = bots.filter(b => b.status === 'running').length;
  const pausedBots = bots.filter(b => b.status === 'paused').length;
  const errorBots = bots.filter(b => b.status === 'error').length;
  const totalMessages = bots.reduce((sum, b) => sum + (b.messages || 0), 0);
  const totalUsers = bots.reduce((sum, b) => sum + (b.users || 0), 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button onClick={() => router.push('/')} className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <Bot className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground">Clawdwako.ai</span>
            </button>
            <div className="flex items-center space-x-4">
              {mounted && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="relative"
                >
                  {theme === "dark" ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => router.push('/settings')}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              
              {/* User Profile Dropdown */}
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
                          router.push('/settings');
                        }}
                        className="w-full flex items-center px-3 py-2 text-sm text-foreground hover:bg-accent rounded-md transition-colors"
                      >
                        <UserIcon className="h-4 w-4 mr-2" />
                        Profile Settings
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
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage your AI agents and monitor performance</p>
          </div>
          <Button onClick={() => window.location.href = '/'}>
            <Plus className="h-4 w-4 mr-2" />
            Deploy New Agent
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="glass-stat-card rounded-2xl p-6 hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground font-medium">Active Agents</p>
                <p className="text-3xl font-bold text-foreground mt-1">{activeAgents}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{runningBots} running • {pausedBots} paused • {errorBots} error</p>
          </div>
          
          <div className="glass-stat-card rounded-2xl p-6 hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <MessageSquare className="h-6 w-6 text-blue-500" />
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground font-medium">Total Messages</p>
                <p className="text-3xl font-bold text-foreground mt-1">{totalMessages.toLocaleString()}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Across all agents</p>
          </div>
          
          <div className="glass-stat-card rounded-2xl p-6 hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500/10 rounded-xl">
                <Users className="h-6 w-6 text-purple-500" />
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground font-medium">Active Users</p>
                <p className="text-3xl font-bold text-foreground mt-1">{totalUsers}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Total users served</p>
          </div>
          
          <div className="glass-stat-card rounded-2xl p-6 hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/10 rounded-xl">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground font-medium">Monthly Cost</p>
                <p className="text-3xl font-bold text-foreground mt-1">$57.70</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Within budget limit</p>
          </div>
        </div>

        {/* Agents List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">Your AI Agents</h2>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">All</Button>
              <Button variant="outline" size="sm">Running</Button>
              <Button variant="outline" size="sm">Paused</Button>
              <Button variant="outline" size="sm">Error</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bots.map((agent) => {
              const StatusIcon = getStatusIcon(agent.status);
              return (
                <div key={agent.id} className="glass-agent-card rounded-xl p-5 flex flex-col">
                  {/* Compact Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg">
                        <Bot className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-foreground">{agent.name}</h3>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs px-2 py-0.5">{agent.type}</Badge>
                          <span className="text-xs text-muted-foreground">• {agent.lastActive}</span>
                        </div>
                      </div>
                    </div>
                    <Badge className={`${getStatusColor(agent.status)} px-2 py-1 text-xs`}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {agent.status}
                    </Badge>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="glass-stat-card rounded-lg p-2">
                      <p className="text-xs text-muted-foreground">Uptime</p>
                      <p className="text-sm font-bold text-foreground">{agent.uptime}</p>
                    </div>
                    <div className="glass-stat-card rounded-lg p-2">
                      <p className="text-xs text-muted-foreground">Messages</p>
                      <p className="text-sm font-bold text-foreground">{agent.messages || 0}</p>
                    </div>
                    <div className="glass-stat-card rounded-lg p-2">
                      <p className="text-xs text-muted-foreground">Users</p>
                      <p className="text-sm font-bold text-foreground">{agent.users || 0}</p>
                    </div>
                    <div className="glass-stat-card rounded-lg p-2">
                      <p className="text-xs text-muted-foreground">Cost</p>
                      <p className="text-sm font-bold text-foreground">{agent.cost}</p>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex flex-col gap-2 mt-auto">
                    <Button variant="outline" size="sm" onClick={() => handleViewLogs(agent.id)}>
                      <Activity className="h-4 w-4 mr-2" />
                      View Logs
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleConfigure(agent.id)}>
                      <Settings className="h-4 w-4 mr-2" />
                      Configure
                    </Button>
                    {agent.status === "running" ? (
                      <Button variant="outline" size="sm" onClick={() => handlePause(agent.id)}>
                        <Pause className="h-4 w-4 mr-2" />
                        Pause
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => handlePause(agent.id)}>
                        <Play className="h-4 w-4 mr-2" />
                        Resume
                      </Button>
                    )}
                    <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(agent.id)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-foreground mb-6">Quick Actions</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="glass-card rounded-2xl p-6 hover:scale-105 transition-transform duration-300 cursor-pointer">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-3 bg-blue-500/10 rounded-xl">
                  <Plus className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Deploy New Agent</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Choose from our template gallery or build custom
              </p>
            </div>
            
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2 text-blue-600" />
                  Manage Integrations
                </CardTitle>
                <CardDescription>
                  Connect new channels and services
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                  View Analytics
                </CardTitle>
                <CardDescription>
                  Detailed performance metrics and insights
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      {configureBot && (
        <ConfigureModal
          bot={configureBot}
          onClose={() => setConfigureBot(null)}
          onSave={handleSaveConfig}
        />
      )}
      
      {viewLogsBot && (
        <ViewLogsModal
          bot={viewLogsBot}
          onClose={() => setViewLogsBot(null)}
        />
      )}
    </div>
  );
}
