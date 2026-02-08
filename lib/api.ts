import { apiRequest } from "./queryClient";
import type { Lead, DashboardStats, AIInsights, AuditResult } from "@/types";

export const api = {
  // Dashboard
  getDashboardStats: async (): Promise<DashboardStats> => {
    const res = await fetch("/api/dashboard/stats");
    if (!res.ok) {
      throw new Error(`Failed to fetch dashboard stats: ${res.status}`);
    }
    return res.json();
  },

  // Leads
  getLeads: (platform?: string, limit?: number, offset = 0): Promise<Lead[]> => {
    const params = new URLSearchParams({
      offset: offset.toString()
    });
    if (limit) params.append('limit', limit.toString());
    if (platform) params.append('platform', platform);
    
    return fetch(`/api/leads?${params}`).then(res => res.json());
  },

  getLead: (id: string): Promise<Lead> =>
    fetch(`/api/leads/${id}`).then(res => res.json()),

  validateLead: (id: string) =>
    apiRequest(`/api/leads/${id}/validate`, { method: "POST" }),

  // Scanning
  scanReddit: () =>
    apiRequest("/api/scan/reddit", { method: "POST" }),

  scanLinkedIn: () =>
    apiRequest("/api/scan/linkedin", { method: "POST" }),

  scanTwitter: () =>
    apiRequest("/api/scan/twitter", { method: "POST" }),

  refreshData: () =>
    apiRequest("/api/refresh", { method: "POST" }),

  // Analytics
  getInsights: (): Promise<AIInsights> =>
    fetch("/api/insights").then(res => res.json()),

  getMonitoringStats: () =>
    fetch("/api/monitoring").then(res => res.json()),

  // Audit
  getIntegrityAudit: (): Promise<AuditResult> =>
    fetch("/api/audit/integrity").then(res => res.json()),

  validateAllSources: () =>
    apiRequest("/api/audit/validate-sources", { method: "POST" }),

  // Response Generation
  generateResponse: (leadId: string, options?: { responseType?: string; customInstructions?: string }) =>
    apiRequest(`/api/leads/${leadId}/generate-response`, { 
      method: "POST", 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify(options) 
    }),

  generateMultipleResponses: (leadId: string) =>
    apiRequest(`/api/leads/${leadId}/generate-multiple-responses`, { method: "POST" }),

  getResponseTemplates: () =>
    fetch("/api/response-templates").then(res => res.json()),

  // Lead Responses
  getLeadResponses: (leadId: string) =>
    fetch(`/api/leads/${leadId}/responses`).then(res => res.json()),

  hasLeadBeenRespondedTo: (leadId: string) =>
    fetch(`/api/leads/${leadId}/has-responses`).then(res => res.json()),

  getLeadsWithResponses: () =>
    fetch("/api/leads/with-responses").then(res => res.json()),

  // Dashboard data
  getPriorityActions: () =>
    fetch("/api/dashboard/priority-actions").then(res => res.json()),

  getLeadSegmentation: () =>
    fetch("/api/dashboard/lead-segmentation").then(res => res.json()),

  getWeeklyTrend: () =>
    fetch("/api/dashboard/weekly-trend").then(res => res.json()),

  getLiveActivity: () =>
    fetch("/api/dashboard/live-activity").then(res => res.json()),
};
