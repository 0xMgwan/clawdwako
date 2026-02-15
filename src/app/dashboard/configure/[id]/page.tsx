"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save } from "lucide-react";

export default function ConfigurePage() {
  const router = useRouter();
  const params = useParams();
  const botId = params.id as string;
  
  const [bot, setBot] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedModel, setSelectedModel] = useState("");
  const [anthropicKey, setAnthropicKey] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [googleKey, setGoogleKey] = useState("");

  useEffect(() => {
    fetchBot();
  }, [botId]);

  const fetchBot = async () => {
    try {
      const response = await fetch('/api/bots');
      const data = await response.json();
      
      if (data.success) {
        const foundBot = data.bots.find((b: any) => b.id === botId);
        if (foundBot) {
          setBot(foundBot);
          setSelectedModel(foundBot.selectedModel);
        }
      }
    } catch (error) {
      console.error('Error fetching bot:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/bots/${botId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedModel,
          anthropicApiKey: anthropicKey,
          openaiApiKey: openaiKey,
          googleApiKey: googleKey
        })
      });

      if (response.ok) {
        alert('Configuration saved successfully!');
        router.push('/dashboard');
      } else {
        alert('Failed to save configuration');
      }
    } catch (error) {
      console.error('Error saving:', error);
      alert('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <p>Loading...</p>
    </div>;
  }

  if (!bot) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <p>Bot not found</p>
    </div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Configure Bot</h1>
          <p className="text-muted-foreground mt-2">
            Update settings for {bot.telegramBotUsername}
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bot Information</CardTitle>
              <CardDescription>Basic information about your bot</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Bot Username</label>
                <input
                  type="text"
                  className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background"
                  value={bot.telegramBotUsername}
                  disabled
                />
              </div>
              <div>
                <label className="text-sm font-medium">Bot ID</label>
                <input
                  type="text"
                  className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background"
                  value={bot.id}
                  disabled
                />
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <input
                  type="text"
                  className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background"
                  value={bot.status}
                  disabled
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Model</CardTitle>
              <CardDescription>Select which AI model your bot should use</CardDescription>
            </CardHeader>
            <CardContent>
              <select
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
              >
                <option value="claude-opus">Claude 3.5 Opus</option>
                <option value="claude-sonnet">Claude 3.5 Sonnet</option>
                <option value="gpt-5.2">GPT-5.2</option>
                <option value="gpt-4o">GPT-4o</option>
                <option value="gemini-pro">Gemini Pro</option>
                <option value="gemini-ultra">Gemini Ultra</option>
              </select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Keys (Optional)</CardTitle>
              <CardDescription>
                Provide your own API keys to use your own credits. Leave empty to use platform keys.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Anthropic API Key</label>
                <input
                  type="password"
                  className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background"
                  placeholder="sk-ant-..."
                  value={anthropicKey}
                  onChange={(e) => setAnthropicKey(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">OpenAI API Key</label>
                <input
                  type="password"
                  className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background"
                  placeholder="sk-..."
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Google AI API Key</label>
                <input
                  type="password"
                  className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background"
                  placeholder="AIza..."
                  value={googleKey}
                  onChange={(e) => setGoogleKey(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={() => router.push('/dashboard')}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
