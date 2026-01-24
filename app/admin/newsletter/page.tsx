"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Mail, 
  Send, 
  Users, 
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Calendar
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function NewsletterPage() {
  const { data: statsData, isLoading } = useQuery({
    queryKey: ["/api/admin/newsletter/stats"],
    queryFn: async () => {
      const response = await fetch("/api/admin/newsletter/stats");
      return response.json();
    },
  });

  const stats = statsData?.stats || {};

  const handleSendNewsletter = () => {
    // Newsletter sending functionality
    console.log("Send newsletter");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Newsletter Management
          </h1>
          <p className="text-slate-600 text-lg">
            Manage your Sunday Swervice newsletter campaigns
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardDescription className="text-xs font-medium uppercase tracking-wider text-slate-500">
                    Total Contacts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-slate-900">
                        {isLoading ? (
                          <Skeleton className="h-8 w-20" />
                        ) : (
                          stats.totalContacts?.toLocaleString() || "0"
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Available for campaigns
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardDescription className="text-xs font-medium uppercase tracking-wider text-slate-500">
                    Email Coverage
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-100 rounded-lg">
                      <Mail className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-slate-900">
                        {isLoading ? (
                          <Skeleton className="h-8 w-20" />
                        ) : (
                          stats.contactsWithEmail?.toLocaleString() || "0"
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {stats.totalContacts && stats.contactsWithEmail
                          ? `${Math.round((stats.contactsWithEmail / stats.totalContacts) * 100)}% of total`
                          : "0% of total"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardDescription className="text-xs font-medium uppercase tracking-wider text-slate-500">
                    Contact Groups
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <FileText className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-slate-900">
                        {isLoading ? (
                          <Skeleton className="h-8 w-20" />
                        ) : (
                          stats.uniqueGroups?.length || 0
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Active groups
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Send newsletters and manage campaigns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <Button onClick={handleSendNewsletter} className="gap-2" size="lg">
                    <Send className="h-4 w-4" />
                    Send Newsletter
                  </Button>
                  <Button variant="outline" className="gap-2" size="lg">
                    <FileText className="h-4 w-4" />
                    View Templates
                  </Button>
                  <Button variant="outline" className="gap-2" size="lg">
                    <Calendar className="h-4 w-4" />
                    Schedule Campaign
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest newsletter operations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.latestExportDate ? (
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <CheckCircle2 className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">
                          Contacts Exported
                        </p>
                        <p className="text-sm text-slate-500">
                          {new Date(stats.latestExportDate).toLocaleString()}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {stats.totalContacts?.toLocaleString() || 0} contacts
                      </Badge>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      No recent activity
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-6">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle>Newsletter Campaigns</CardTitle>
                <CardDescription>
                  Manage and track your email campaigns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-slate-500">
                  <Send className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                  <p className="font-medium">No campaigns yet</p>
                  <p className="text-sm mt-1">
                    Create your first newsletter campaign to get started
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contacts" className="space-y-6">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle>Contact Groups</CardTitle>
                <CardDescription>
                  View contacts organized by group
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stats.uniqueGroups && stats.uniqueGroups.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {stats.uniqueGroups.map((group: string) => (
                      <div
                        key={group}
                        className="p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-slate-900">{group}</h3>
                          <Badge variant="outline">Active</Badge>
                        </div>
                        <p className="text-sm text-slate-500">
                          View contacts in this group
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-500">
                    <Users className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                    <p className="font-medium">No contact groups found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
