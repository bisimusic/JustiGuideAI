import type { LeadResponse } from '@/types';

export class LawyerLeadConnector {
  async createResponse(
    leadId: string, 
    platform: string, 
    responseContent: string, 
    responseType: string
  ): Promise<LeadResponse> {
    // Include postedAt in the response object
    return {
      id: '',
      leadId,
      responseContent,
      platform,
      responseType,
      status: 'pending',
      postedAt: new Date().toISOString(), // Add postedAt property
      createdAt: new Date().toISOString(),
    };
  }

  async connectLawyerToLead(leadId: string, lawyerId: string): Promise<void> {
    return Promise.resolve();
  }

  async generateLawyerResponse(
    leadId: string,
    platform: string,
    responseContent: string,
    responseType: string
  ): Promise<LeadResponse> {
    // Another method that creates responses - include postedAt
    return {
      id: '',
      leadId,
      responseContent,
      platform,
      responseType,
      status: 'pending',
      postedAt: new Date().toISOString(), // Add postedAt property
      createdAt: new Date().toISOString(),
    };
  }
}

export const lawyerLeadConnector = new LawyerLeadConnector();
