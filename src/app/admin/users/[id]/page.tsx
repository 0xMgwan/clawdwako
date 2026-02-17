"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bot, Calendar, Mail, User as UserIcon } from "lucide-react";

interface UserDetails {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  createdAt: string;
  bots: {
    id: string;
    name: string;
    telegramBotUsername: string;
    selectedModel: string;
    status: string;
    createdAt: string;
  }[];
}

export default function UserDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchUserDetails(params.id as string);
    }
  }, [params.id]);

  const fetchUserDetails = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      }
    } catch (error) {
      console.error("Failed to fetch user details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">User not found</p>
          <Button onClick={() => router.push("/admin")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/admin")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin
          </Button>
          <h1 className="text-4xl font-bold mb-2">User Details</h1>
          <p className="text-muted-foreground">View user information and activity</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Info Card */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>User Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center text-center">
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name || "User"}
                    className="w-24 h-24 rounded-full mb-4"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center text-white text-3xl font-bold mb-4">
                    {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
                <h3 className="text-xl font-bold">{user.name || "Anonymous"}</h3>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{user.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Joined {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Bot className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {user.bots.length} bot{user.bots.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bots Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>User's Bots</CardTitle>
              <CardDescription>
                All bots deployed by this user
              </CardDescription>
            </CardHeader>
            <CardContent>
              {user.bots.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No bots deployed yet
                </div>
              ) : (
                <div className="space-y-4">
                  {user.bots.map((bot) => (
                    <div
                      key={bot.id}
                      className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Bot className="w-5 h-5 text-green-400" />
                            <h4 className="font-semibold">{bot.name}</h4>
                          </div>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <p>@{bot.telegramBotUsername}</p>
                            <p>Model: {bot.selectedModel}</p>
                            <p>Created: {new Date(bot.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            bot.status === "active"
                              ? "bg-green-400/10 text-green-400"
                              : bot.status === "deploying"
                              ? "bg-blue-400/10 text-blue-400"
                              : bot.status === "failed"
                              ? "bg-red-400/10 text-red-400"
                              : "bg-yellow-400/10 text-yellow-400"
                          }`}
                        >
                          {bot.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
