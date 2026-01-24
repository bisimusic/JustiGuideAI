"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  Mail, 
  Building2, 
  Linkedin, 
  Users, 
  Download,
  RefreshCw,
  Filter,
  X
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Contact {
  firstName?: string;
  lastName?: string;
  email: string;
  company?: string;
  linkedin?: string;
  phone?: string;
  source: string;
  notes?: string;
}

export default function ContactsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const limit = 50;

  const { data: contactsData, isLoading, refetch } = useQuery({
    queryKey: ["/api/admin/contacts", page, search, selectedGroup],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (search) params.append("search", search);
      if (selectedGroup) params.append("group", selectedGroup);
      
      const response = await fetch(`/api/admin/contacts?${params}`);
      return response.json();
    },
  });

  const { data: statsData } = useQuery({
    queryKey: ["/api/admin/newsletter/stats"],
    queryFn: async () => {
      const response = await fetch("/api/admin/newsletter/stats");
      return response.json();
    },
  });

  const contacts = contactsData?.contacts || [];
  const stats = statsData?.stats || {};

  const handleExport = () => {
    // Export functionality can be added here
    console.log("Export contacts");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">
                Contact Management
              </h1>
              <p className="text-slate-600 text-lg">
                Manage and organize your Sunday Service & Founder Events contacts
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => refetch()}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
              <Button onClick={handleExport} className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardDescription className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  Total Contacts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="text-3xl font-bold text-slate-900">
                      {stats.totalContacts?.toLocaleString() || "0"}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      All imported contacts
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardDescription className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  With Email
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-emerald-600" />
                  <div>
                    <div className="text-3xl font-bold text-slate-900">
                      {stats.contactsWithEmail?.toLocaleString() || "0"}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {stats.totalContacts 
                        ? `${Math.round((stats.contactsWithEmail / stats.totalContacts) * 100)}% coverage`
                        : "0% coverage"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardDescription className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  With Company
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-purple-600" />
                  <div>
                    <div className="text-3xl font-bold text-slate-900">
                      {stats.contactsWithCompany?.toLocaleString() || "0"}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Company info available
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardDescription className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  With LinkedIn
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Linkedin className="h-5 w-5 text-blue-700" />
                  <div>
                    <div className="text-3xl font-bold text-slate-900">
                      {stats.contactsWithLinkedIn?.toLocaleString() || "0"}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      LinkedIn profiles
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6 border-slate-200 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by name, email, company..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="pl-10 h-11"
                />
              </div>
              <Select value={selectedGroup} onValueChange={(value) => {
                setSelectedGroup(value);
                setPage(1);
              }}>
                <SelectTrigger className="w-full md:w-[250px] h-11">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Groups</SelectItem>
                  {contactsData?.groups?.map((group: string) => (
                    <SelectItem key={group} value={group}>
                      {group}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedGroup && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedGroup("")}
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Clear
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contacts Table */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Contacts</CardTitle>
                <CardDescription className="mt-1">
                  {contactsData?.total 
                    ? `Showing ${((page - 1) * limit) + 1}-${Math.min(page * limit, contactsData.total)} of ${contactsData.total.toLocaleString()} contacts`
                    : "No contacts found"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex gap-4">
                    <Skeleton className="h-12 flex-1" />
                    <Skeleton className="h-12 w-48" />
                    <Skeleton className="h-12 w-48" />
                  </div>
                ))}
              </div>
            ) : contacts.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 font-medium">No contacts found</p>
                <p className="text-slate-500 text-sm mt-1">
                  Try adjusting your search or filters
                </p>
              </div>
            ) : (
              <>
                <div className="rounded-lg border border-slate-200 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50/50">
                        <TableHead className="font-semibold text-slate-700">Name</TableHead>
                        <TableHead className="font-semibold text-slate-700">Email</TableHead>
                        <TableHead className="font-semibold text-slate-700">Company</TableHead>
                        <TableHead className="font-semibold text-slate-700">Source</TableHead>
                        <TableHead className="font-semibold text-slate-700">LinkedIn</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contacts.map((contact: Contact, index: number) => (
                        <TableRow 
                          key={`${contact.email}-${index}`}
                          className="hover:bg-slate-50/50 transition-colors"
                        >
                          <TableCell className="font-medium">
                            {contact.firstName || contact.lastName
                              ? `${contact.firstName || ""} ${contact.lastName || ""}`.trim()
                              : <span className="text-slate-400">—</span>}
                          </TableCell>
                          <TableCell>
                            <a 
                              href={`mailto:${contact.email}`}
                              className="text-blue-600 hover:text-blue-700 hover:underline"
                            >
                              {contact.email}
                            </a>
                          </TableCell>
                          <TableCell>
                            {contact.company ? (
                              <span className="flex items-center gap-1">
                                <Building2 className="h-3 w-3 text-slate-400" />
                                {contact.company}
                              </span>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {contact.source?.split(" - ")[0] || "Unknown"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {contact.linkedin ? (
                              <a
                                href={contact.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
                              >
                                <Linkedin className="h-3 w-3" />
                                Profile
                              </a>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {contactsData?.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <p className="text-sm text-slate-600">
                      Page {page} of {contactsData.totalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.min(contactsData.totalPages, p + 1))}
                        disabled={page === contactsData.totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
