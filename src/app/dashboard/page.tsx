"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Moon
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
  const [bots, setBots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    // Fetch user's bots from the database
    const fetchBots = async () => {
      try {
        const response = await fetch('/api/bots');
        const data = await response.json();
        
        if (data.success) {
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
          
          setBots(mappedBots.length > 0 ? mappedBots : deployedAgents);
        } else {
          setBots(deployedAgents);
        }
      } catch (error) {
        console.error('Error fetching bots:', error);
        setBots(deployedAgents);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBots();
  }, []);

  const handleViewLogs = (botId: number) => {
    alert(`View logs for bot ${botId} - Coming soon!`);
  };

  const handleConfigure = (botId: number) => {
    alert(`Configure bot ${botId} - Coming soon!`);
  };

  const handlePause = (botId: number) => {
    alert(`Pause bot ${botId} - Coming soon!`);
  };

  const handleDelete = (botId: number) => {
    if (confirm('Are you sure you want to delete this bot?')) {
      setBots(bots.filter(bot => bot.id !== botId));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Bot className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground">ClawdWako</span>
            </div>
            <div className="flex items-center space-x-4">
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
              <Button variant="outline" size="sm" onClick={() => router.push('/settings')}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground text-sm font-medium">U</span>
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
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
              <Bot className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4</div>
              <p className="text-xs text-muted-foreground">2 running, 1 paused, 1 error</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">6,264</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">159</div>
              <p className="text-xs text-muted-foreground">+8% from last month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Cost</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$57.70</div>
              <p className="text-xs text-muted-foreground">Within budget limit</p>
            </CardContent>
          </Card>
        </div>

        {/* Agents List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Your AI Agents</h2>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">All</Button>
              <Button variant="outline" size="sm">Running</Button>
              <Button variant="outline" size="sm">Paused</Button>
              <Button variant="outline" size="sm">Error</Button>
            </div>
          </div>

          <div className="grid gap-6">
            {deployedAgents.map((agent) => {
              const StatusIcon = getStatusIcon(agent.status);
              return (
                <Card key={agent.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Bot className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{agent.name}</CardTitle>
                          <CardDescription className="flex items-center space-x-2">
                            <Badge variant="outline">{agent.type}</Badge>
                            <span>•</span>
                            <span>Last active {agent.lastActive}</span>
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(agent.status)}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {agent.status}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Uptime</p>
                        <p className="font-semibold">{agent.uptime}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Messages</p>
                        <p className="font-semibold">{agent.messages.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Users</p>
                        <p className="font-semibold">{agent.users}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Cost</p>
                        <p className="font-semibold">{agent.cost}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Channels</p>
                        <div className="flex flex-wrap gap-1">
                          {agent.channels.map((channel, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {channel}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
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
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleDelete(agent.id)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="h-5 w-5 mr-2 text-blue-600" />
                  Deploy New Agent
                </CardTitle>
                <CardDescription>
                  Choose from our template gallery or build custom
                </CardDescription>
              </CardHeader>
            </Card>
            
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
    </div>
  );
}
