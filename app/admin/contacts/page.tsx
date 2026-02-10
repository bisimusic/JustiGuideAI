"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
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
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const limit = 50;

  const { data: contactsData, isLoading, refetch } = useQuery({
    queryKey: ["/api/admin/contacts", page, search, selectedGroup],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (search) params.append("search", search);
      if (selectedGroup && selectedGroup !== "all") params.append("group", selectedGroup);
      
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
    console.log("Export contacts");
  };

  return (
    <AdminLayout
      title="Contact Management"
      subtitle="Manage and organize your Sunday Service & Founder Events contacts"
      headerActions={
        <>
          <Button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-5 py-3 rounded-[10px] text-sm font-semibold bg-[#181b22] text-[#f5f5f7] border border-white/10 hover:bg-[#1a1d25] hover:border-white/15 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Button 
            onClick={handleExport}
            className="flex items-center gap-2 px-5 py-3 rounded-[10px] text-sm font-semibold bg-gradient-to-br from-[#00d4aa] to-[#00b894] text-[#0a0b0d] hover:shadow-[0_8px_24px_rgba(0,212,170,0.15)] hover:-translate-y-0.5 transition-all"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
        </>
      }
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[13px] text-[#8e919a] font-medium">Total Contacts</span>
            <div className="w-10 h-10 rounded-[10px] bg-[rgba(0,212,170,0.15)] text-[#00d4aa] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="font-['JetBrains_Mono',monospace] text-[36px] font-semibold tracking-tight mb-2">
            {stats.totalContacts?.toLocaleString() || "0"}
          </div>
          <div className="text-xs text-[#5a5d66]">All imported contacts</div>
        </div>

        <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[13px] text-[#8e919a] font-medium">With Email</span>
            <div className="w-10 h-10 rounded-[10px] bg-[rgba(16,185,129,0.15)] text-[#10b981] flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
          </div>
          <div className="font-['JetBrains_Mono',monospace] text-[36px] font-semibold tracking-tight mb-2">
            {stats.contactsWithEmail?.toLocaleString() || "0"}
          </div>
          <div className="text-xs text-[#5a5d66]">
            {stats.totalContacts 
              ? `${Math.round((stats.contactsWithEmail / stats.totalContacts) * 100)}% coverage`
              : "0% coverage"}
          </div>
        </div>

        <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[13px] text-[#8e919a] font-medium">With Company</span>
            <div className="w-10 h-10 rounded-[10px] bg-[rgba(167,139,250,0.15)] text-[#a78bfa] flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="font-['JetBrains_Mono',monospace] text-[36px] font-semibold tracking-tight mb-2">
            {stats.contactsWithCompany?.toLocaleString() || "0"}
          </div>
          <div className="text-xs text-[#5a5d66]">Company info available</div>
        </div>

        <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[13px] text-[#8e919a] font-medium">With LinkedIn</span>
            <div className="w-10 h-10 rounded-[10px] bg-[rgba(96,165,250,0.15)] text-[#60a5fa] flex items-center justify-center">
              <Linkedin className="w-5 h-5" />
            </div>
          </div>
          <div className="font-['JetBrains_Mono',monospace] text-[36px] font-semibold tracking-tight mb-2">
            {stats.contactsWithLinkedIn?.toLocaleString() || "0"}
          </div>
          <div className="text-xs text-[#5a5d66]">LinkedIn profiles</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#8e919a]" />
            <Input
              placeholder="Search by name, email, company..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-10 h-11 bg-[#181b22] border-white/5 text-[#f5f5f7] placeholder:text-[#5a5d66] focus:border-[#00d4aa]/30"
            />
          </div>
          <Select value={selectedGroup} onValueChange={(value) => {
            setSelectedGroup(value);
            setPage(1);
          }}>
            <SelectTrigger className="w-full md:w-[250px] h-11 bg-[#181b22] border-white/5 text-[#f5f5f7]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by group" />
            </SelectTrigger>
            <SelectContent className="bg-[#14161c] border-white/5">
              <SelectItem value="all">All Groups</SelectItem>
              {contactsData?.groups?.map((group: string) => (
                <SelectItem key={group} value={group}>
                  {group}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedGroup && selectedGroup !== "all" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedGroup("all")}
              className="gap-2 text-[#8e919a] hover:text-[#f5f5f7] hover:bg-[#181b22]"
            >
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Contacts Table */}
      <div className="bg-[#14161c] border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-[#f5f5f7]">Contacts</h2>
              <p className="text-sm text-[#8e919a] mt-1">
                {contactsData?.total 
                  ? `Showing ${((page - 1) * limit) + 1}-${Math.min(page * limit, contactsData.total)} of ${contactsData.total.toLocaleString()} contacts`
                  : "No contacts found"}
              </p>
            </div>
          </div>
        </div>
        <div className="p-6">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-4">
                  <div className="h-12 flex-1 bg-[#181b22] rounded-lg animate-pulse" />
                  <div className="h-12 w-48 bg-[#181b22] rounded-lg animate-pulse" />
                  <div className="h-12 w-48 bg-[#181b22] rounded-lg animate-pulse" />
                </div>
              ))}
            </div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-[#5a5d66] mx-auto mb-4" />
              <p className="text-[#8e919a] font-medium">No contacts found</p>
              <p className="text-[#5a5d66] text-sm mt-1">
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-lg border border-white/5 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#181b22]">
                      <TableHead className="font-semibold text-[#8e919a]">Name</TableHead>
                      <TableHead className="font-semibold text-[#8e919a]">Email</TableHead>
                      <TableHead className="font-semibold text-[#8e919a]">Company</TableHead>
                      <TableHead className="font-semibold text-[#8e919a]">Source</TableHead>
                      <TableHead className="font-semibold text-[#8e919a]">LinkedIn</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contacts.map((contact: Contact, index: number) => (
                      <TableRow 
                        key={`${contact.email}-${index}`}
                        className="hover:bg-[#181b22] transition-colors border-white/5"
                      >
                        <TableCell className="font-medium text-[#f5f5f7]">
                          {contact.firstName || contact.lastName
                            ? `${contact.firstName || ""} ${contact.lastName || ""}`.trim()
                            : <span className="text-[#5a5d66]">—</span>}
                        </TableCell>
                        <TableCell>
                          <a 
                            href={`mailto:${contact.email}`}
                            className="text-[#00d4aa] hover:text-[#00b894] hover:underline"
                          >
                            {contact.email}
                          </a>
                        </TableCell>
                        <TableCell>
                          {contact.company ? (
                            <span className="flex items-center gap-1 text-[#f5f5f7]">
                              <Building2 className="h-3 w-3 text-[#5a5d66]" />
                              {contact.company}
                            </span>
                          ) : (
                            <span className="text-[#5a5d66]">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs border-white/10 text-[#8e919a]">
                            {contact.source?.split(" - ")[0] || "Unknown"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {contact.linkedin ? (
                            <a
                              href={contact.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#60a5fa] hover:text-[#3b82f6] hover:underline flex items-center gap-1"
                            >
                              <Linkedin className="h-3 w-3" />
                              Profile
                            </a>
                          ) : (
                            <span className="text-[#5a5d66]">—</span>
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
                  <p className="text-sm text-[#8e919a]">
                    Page {page} of {contactsData.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="bg-[#181b22] border-white/5 text-[#f5f5f7] hover:bg-[#1a1d25]"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(contactsData.totalPages, p + 1))}
                      disabled={page === contactsData.totalPages}
                      className="bg-[#181b22] border-white/5 text-[#f5f5f7] hover:bg-[#1a1d25]"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
