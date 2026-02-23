"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  User, 
  Key, 
  CreditCard, 
  Bell, 
  Shield,
  Sun,
  Moon,
  ArrowLeft,
  Check
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button onClick={() => router.push('/dashboard')} className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
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
            </button>
            <div className="flex items-center space-x-2 sm:space-x-4">
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
              <Button variant="outline" size="sm" onClick={() => router.push('/dashboard')} className="hidden sm:flex">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-3">
            <Card className="bg-gradient-to-br from-background via-background to-green-500/5">
              <CardContent className="p-2 sm:p-4">
                <nav className="flex lg:flex-col overflow-x-auto lg:overflow-visible space-x-2 lg:space-x-0 lg:space-y-2 pb-2 lg:pb-0">
                  <button
                    onClick={() => setActiveTab("profile")}
                    className={`flex-shrink-0 lg:w-full flex items-center justify-center lg:justify-start space-x-2 lg:space-x-3 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                      activeTab === "profile"
                        ? "bg-green-400 text-white shadow-md"
                        : "hover:bg-accent text-muted-foreground"
                    }`}
                  >
                    <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="whitespace-nowrap">Profile</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("api-keys")}
                    className={`flex-shrink-0 lg:w-full flex items-center justify-center lg:justify-start space-x-2 lg:space-x-3 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                      activeTab === "api-keys"
                        ? "bg-green-400 text-white shadow-md"
                        : "hover:bg-accent text-muted-foreground"
                    }`}
                  >
                    <Key className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="whitespace-nowrap">API Keys</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("billing")}
                    className={`flex-shrink-0 lg:w-full flex items-center justify-center lg:justify-start space-x-2 lg:space-x-3 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                      activeTab === "billing"
                        ? "bg-green-400 text-white shadow-md"
                        : "hover:bg-accent text-muted-foreground"
                    }`}
                  >
                    <CreditCard className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="whitespace-nowrap">Billing</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("notifications")}
                    className={`flex-shrink-0 lg:w-full flex items-center justify-center lg:justify-start space-x-2 lg:space-x-3 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                      activeTab === "notifications"
                        ? "bg-green-400 text-white shadow-md"
                        : "hover:bg-accent text-muted-foreground"
                    }`}
                  >
                    <Bell className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="whitespace-nowrap hidden sm:inline">Notifications</span>
                    <span className="whitespace-nowrap sm:hidden">Notif</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("security")}
                    className={`flex-shrink-0 lg:w-full flex items-center justify-center lg:justify-start space-x-2 lg:space-x-3 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                      activeTab === "security"
                        ? "bg-green-400 text-white shadow-md"
                        : "hover:bg-accent text-muted-foreground"
                    }`}
                  >
                    <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="whitespace-nowrap">Security</span>
                  </button>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9">
            {activeTab === "profile" && (
              <div className="space-y-6">
                <Card className="bg-gradient-to-br from-background via-background to-green-500/5">
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl">Profile Information</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">Update your account profile information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="text-xs sm:text-sm font-medium">Name</label>
                      <input
                        type="text"
                        className="w-full mt-1 px-3 py-2 text-sm border border-border rounded-lg bg-background focus:ring-2 focus:ring-green-400 focus:outline-none"
                        placeholder="Your name"
                        defaultValue="Anonymous User"
                      />
                    </div>
                    <div>
                      <label className="text-xs sm:text-sm font-medium">Email</label>
                      <input
                        type="email"
                        className="w-full mt-1 px-3 py-2 text-sm border border-border rounded-lg bg-background focus:ring-2 focus:ring-green-400 focus:outline-none"
                        placeholder="your@email.com"
                        defaultValue="anonymous@clawdwako.com"
                      />
                    </div>
                    <Button className="bg-green-500 hover:bg-green-600 text-white">Save Changes</Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "api-keys" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>AI API Keys</CardTitle>
                    <CardDescription>Manage your AI model API keys</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Anthropic API Key</label>
                      <input
                        type="password"
                        className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background"
                        placeholder="sk-ant-..."
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">OpenAI API Key</label>
                      <input
                        type="password"
                        className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background"
                        placeholder="sk-..."
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Google AI API Key</label>
                      <input
                        type="password"
                        className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background"
                        placeholder="AIza..."
                      />
                    </div>
                    <Button>Save API Keys</Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "billing" && (
              <div className="space-y-4 sm:space-y-6">
                <Card className="bg-gradient-to-br from-background via-background to-green-500/5">
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl">Current Plan</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">Manage your subscription and billing</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 sm:space-y-6">
                    <div className="flex items-center justify-between p-3 sm:p-4 border border-border rounded-lg bg-gradient-to-r from-muted/50 to-green-500/5">
                      <div>
                        <h3 className="font-semibold text-base sm:text-lg">Pay-as-you-go</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">One-time payment per deployment</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">Active</Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      <Card className="bg-gradient-to-br from-background to-green-500/5">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base sm:text-lg">Starter</CardTitle>
                          <CardDescription>
                            <span className="text-xl sm:text-2xl font-bold text-foreground">$20</span>
                            <span className="text-xs sm:text-sm text-muted-foreground">/one-time</span>
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-1.5 sm:space-y-2">
                          <div className="flex items-center space-x-2 text-xs sm:text-sm">
                            <Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                            <span>1 AI Bot</span>
                          </div>
                          <div className="flex items-center space-x-2 text-xs sm:text-sm">
                            <Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                            <span>~1,000 messages</span>
                          </div>
                          <div className="flex items-center space-x-2 text-xs sm:text-sm">
                            <Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                            <span>30 days active</span>
                          </div>
                          <Button className="w-full mt-3 sm:mt-4 text-xs sm:text-sm bg-green-500 hover:bg-green-600">Deploy Now</Button>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-background to-green-500/5 ring-2 ring-green-400">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base sm:text-lg">Professional</CardTitle>
                            <Badge className="bg-green-400 text-white text-[10px]">POPULAR</Badge>
                          </div>
                          <CardDescription>
                            <span className="text-xl sm:text-2xl font-bold text-foreground">$50</span>
                            <span className="text-xs sm:text-sm text-muted-foreground">/one-time</span>
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-1.5 sm:space-y-2">
                          <div className="flex items-center space-x-2 text-xs sm:text-sm">
                            <Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                            <span>3 AI Bots</span>
                          </div>
                          <div className="flex items-center space-x-2 text-xs sm:text-sm">
                            <Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                            <span>~3,000 messages</span>
                          </div>
                          <div className="flex items-center space-x-2 text-xs sm:text-sm">
                            <Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                            <span>90 days active</span>
                          </div>
                          <Button className="w-full mt-3 sm:mt-4 text-xs sm:text-sm bg-green-500 hover:bg-green-600">Deploy Now</Button>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-background to-green-500/5">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base sm:text-lg">Enterprise</CardTitle>
                          <CardDescription>
                            <span className="text-xl sm:text-2xl font-bold text-foreground">$100</span>
                            <span className="text-xs sm:text-sm text-muted-foreground">/one-time</span>
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-1.5 sm:space-y-2">
                          <div className="flex items-center space-x-2 text-xs sm:text-sm">
                            <Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                            <span>Unlimited bots</span>
                          </div>
                          <div className="flex items-center space-x-2 text-xs sm:text-sm">
                            <Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                            <span>~7,000 messages</span>
                          </div>
                          <div className="flex items-center space-x-2 text-xs sm:text-sm">
                            <Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                            <span>365 days active</span>
                          </div>
                          <Button variant="outline" className="w-full mt-3 sm:mt-4 text-xs sm:text-sm">Deploy Now</Button>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Payment Method</CardTitle>
                    <CardDescription>Manage your payment information</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">No payment method added</p>
                    <Button variant="outline">Add Payment Method</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Billing History</CardTitle>
                    <CardDescription>View your past invoices</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">No billing history yet</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "notifications" && (
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Manage how you receive notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">Receive email updates about your agents</p>
                    </div>
                    <input type="checkbox" defaultChecked className="h-4 w-4" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Agent Status Alerts</p>
                      <p className="text-sm text-muted-foreground">Get notified when agents go offline</p>
                    </div>
                    <input type="checkbox" defaultChecked className="h-4 w-4" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Usage Alerts</p>
                      <p className="text-sm text-muted-foreground">Alerts when approaching usage limits</p>
                    </div>
                    <input type="checkbox" className="h-4 w-4" />
                  </div>
                  <Button>Save Preferences</Button>
                </CardContent>
              </Card>
            )}

            {activeTab === "security" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>Update your password</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Current Password</label>
                      <input
                        type="password"
                        className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">New Password</label>
                      <input
                        type="password"
                        className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Confirm New Password</label>
                      <input
                        type="password"
                        className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background"
                      />
                    </div>
                    <Button>Update Password</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Two-Factor Authentication</CardTitle>
                    <CardDescription>Add an extra layer of security</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">Two-factor authentication is not enabled</p>
                    <Button variant="outline">Enable 2FA</Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
