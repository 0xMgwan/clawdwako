"use client";

import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="text-2xl font-bold">
                <span className="text-foreground">ClawdWako</span>
                <span className="text-muted-foreground">.com</span>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <Mail className="h-4 w-4 mr-2" />
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
            Deploy OpenClaw under 
            <span className="text-primary"> 1 minute</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            Avoid all technical complexity and one-click deploy your own 24/7 active 
            OpenClaw instance under 1 minute.
          </p>
        </div>
      </section>

      {/* Model Selection */}
      <section className="pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-8 text-center">Which model do you want as default?</h2>
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                variant="default" 
                size="lg" 
                className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3"
              >
                ⭐ Claude Opus 4.5
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-border hover:bg-accent px-6 py-3"
              >
                🔥 GPT-5.2
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-border hover:bg-accent px-6 py-3"
              >
                💎 Gemini 3 Flash
              </Button>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-8 text-center">Which channel do you want to use for sending messages?</h2>
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                variant="default" 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
              >
                📱 Telegram
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-border hover:bg-accent px-6 py-3"
              >
                💬 Discord
                <span className="ml-2 text-xs text-muted-foreground">Coming soon</span>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-border hover:bg-accent px-6 py-3"
              >
                📞 WhatsApp
                <span className="ml-2 text-xs text-muted-foreground">Coming soon</span>
              </Button>
            </div>
          </div>

          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-3 bg-card border border-border rounded-lg px-4 py-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold text-sm">
                M
              </div>
              <div className="text-left">
                <div className="text-sm font-medium">Mgwani</div>
                <div className="text-xs text-muted-foreground">mgwani86@gmail.com</div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-semibold"
              onClick={() => window.location.href = '/deploy'}
            >
              ⚡ Deploy OpenClaw
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              Connect Telegram to continue. <span className="text-blue-400">Limited cloud servers — only 11 left</span>
            </p>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-sm text-primary font-medium mb-4">Comparison</div>
            <h2 className="text-4xl md:text-5xl font-bold mb-8">
              Traditional Method vs ClawdWako
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12">
            {/* Traditional Method */}
            <div>
              <h3 className="text-2xl font-semibold mb-8 text-muted-foreground italic">Traditional</h3>
              <div className="space-y-4">
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
                
                <div className="pt-6">
                  <div className="text-xl font-semibold mb-2">Total</div>
                  <div className="text-4xl font-bold text-foreground">60 min</div>
                  <p className="text-sm text-muted-foreground mt-2 italic">
                    If you're <span className="text-red-400">non-technical</span>, multiply these <span className="text-red-400">times by 10</span> — you have to learn each step before doing.
                  </p>
                </div>
              </div>
            </div>

            {/* ClawdWako Method */}
            <div>
              <h3 className="text-2xl font-semibold mb-8 text-foreground italic">ClawdWako</h3>
              <div className="text-center py-20">
                <div className="text-8xl font-bold text-primary mb-6">&lt;1 min</div>
                <p className="text-lg text-muted-foreground mb-8">
                  Pick a model, connect Telegram, deploy — done under 1 minute.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Servers, SSH and OpenClaw Environment are already set up, waiting to get assigned. Simple, secure and fast connection to your bot.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            What can OpenClaw do for you?
          </h2>
          <p className="text-xl text-muted-foreground mb-16">
            One assistant, thousands of use cases
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Button variant="outline" className="h-auto p-4 text-left justify-start">
              <div>
                <div className="text-sm font-medium">🌐 Translate messages in real time</div>
              </div>
            </Button>
            <Button variant="outline" className="h-auto p-4 text-left justify-start">
              <div>
                <div className="text-sm font-medium">📧 Organize your inbox</div>
              </div>
            </Button>
            <Button variant="outline" className="h-auto p-4 text-left justify-start">
              <div>
                <div className="text-sm font-medium">🎫 Answer support tickets</div>
              </div>
            </Button>
            <Button variant="outline" className="h-auto p-4 text-left justify-start">
              <div>
                <div className="text-sm font-medium">📄 Summarize long documents</div>
              </div>
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Button variant="outline" className="h-auto p-4 text-left justify-start">
              <div>
                <div className="text-sm font-medium">💰 Do your taxes</div>
              </div>
            </Button>
            <Button variant="outline" className="h-auto p-4 text-left justify-start border-2 border-dashed">
              <div>
                <div className="text-sm font-medium">📊 Track expenses and receipts</div>
              </div>
            </Button>
            <Button variant="outline" className="h-auto p-4 text-left justify-start">
              <div>
                <div className="text-sm font-medium">🔍 Compare insurance quotes</div>
              </div>
            </Button>
            <Button variant="outline" className="h-auto p-4 text-left justify-start">
              <div>
                <div className="text-sm font-medium">📱 Manage subscriptions</div>
              </div>
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Button variant="outline" className="h-auto p-4 text-left justify-start">
              <div>
                <div className="text-sm font-medium">🛒 Find discount codes</div>
              </div>
            </Button>
            <Button variant="outline" className="h-auto p-4 text-left justify-start">
              <div>
                <div className="text-sm font-medium">📉 Price-drop alerts</div>
              </div>
            </Button>
            <Button variant="outline" className="h-auto p-4 text-left justify-start">
              <div>
                <div className="text-sm font-medium">📏 Compare product specs</div>
              </div>
            </Button>
            <Button variant="outline" className="h-auto p-4 text-left justify-start">
              <div>
                <div className="text-sm font-medium">🤝 Negotiate deals</div>
              </div>
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <Button variant="outline" className="h-auto p-4 text-left justify-start">
              <div>
                <div className="text-sm font-medium">📊 Create presentations from bullet points</div>
              </div>
            </Button>
            <Button variant="outline" className="h-auto p-4 text-left justify-start">
              <div>
                <div className="text-sm font-medium">✈️ Book travel and hotels</div>
              </div>
            </Button>
            <Button variant="outline" className="h-auto p-4 text-left justify-start">
              <div>
                <div className="text-sm font-medium">🍳 Find recipes from ingredients</div>
              </div>
            </Button>
            <Button variant="outline" className="h-auto p-4 text-left justify-start">
              <div>
                <div className="text-sm font-medium">📈 Track OKRs and KPIs</div>
              </div>
            </Button>
          </div>

          <p className="text-muted-foreground italic">
            PS. You can add as many use cases as you want via natural language
          </p>
        </div>
      </section>
    </div>
  );
}
              </Badge>
              <CardHeader>
                <CardTitle className="text-2xl">Pro</CardTitle>
                <CardDescription>For growing businesses</CardDescription>
                <div className="text-3xl font-bold text-gray-900 mt-4">
                  $30<span className="text-lg font-normal text-gray-600">/mo</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    5 AI Agents
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Premium templates
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Priority support
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Custom integrations
                  </li>
                </ul>
                <Button className="w-full mt-6">Get Started</Button>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-2xl">Enterprise</CardTitle>
                <CardDescription>For large organizations</CardDescription>
                <div className="text-3xl font-bold text-gray-900 mt-4">
                  $60<span className="text-lg font-normal text-gray-600">/mo</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Unlimited agents
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Custom templates
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    24/7 support
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Dedicated infrastructure
                  </li>
                </ul>
                <Button className="w-full mt-6">Contact Sales</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Deploy Your AI Employee?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of users who've deployed their agents in under 5 minutes
          </p>
          <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
            Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Bot className="h-6 w-6 text-blue-400" />
                <span className="text-lg font-bold">ClawdWako</span>
              </div>
              <p className="text-gray-400">
                Deploy AI agents with zero technical experience. Your own 24/7 AI employee, ready in minutes.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Templates</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Connect</h3>
              <div className="flex space-x-4">
                <Github className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
                <Twitter className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2026 ClawdWako. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
