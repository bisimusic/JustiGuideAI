import type { Lead } from '@/types';

interface LeadMagnet {
  id: string;
  title: string;
  url: string;
  type: string;
}

export class ResponseGenerator {
  async generateResponse(leadId: string, options?: { responseType?: string; customInstructions?: string }): Promise<string> {
    return '';
  }

  findRelevantLeadMagnet(lead: Lead): LeadMagnet | null {
    return null;
  }
}

export const responseGenerator = new ResponseGenerator();
