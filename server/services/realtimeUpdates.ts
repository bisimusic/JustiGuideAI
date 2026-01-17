import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import type { Lead } from '@shared/schema';

interface LeadUpdate {
  type: 'new_lead';
  data: {
    lead: Lead;
    visaType: string;
    platform: string;
    urgency: 'low' | 'medium' | 'high' | 'critical';
  };
}

interface ResponseUpdate {
  type: 'response_sent';
  data: {
    leadId: string;
    platform: string;
    responseContent: string;
    timestamp: string;
  };
}

interface ConversionUpdate {
  type: 'conversion';
  data: {
    leadId: string;
    amount: number;
    serviceType: string;
    conversionPath: string;
    timestamp: string;
  };
}

interface AnalyticsUpdate {
  type: 'analytics_update';
  data: {
    totalLeads: number;
    dailyLeads: number;
    conversionRate: number;
    weeklyRevenue: number;
  };
}

interface MonitoringUpdate {
  type: 'monitoring_status';
  data: {
    platform: string;
    status: 'active' | 'limited' | 'error';
    newPosts: number;
    lastScanned: string;
  };
}

interface PongMessage {
  type: 'pong';
  data: {};
}

type WebSocketMessage = LeadUpdate | ResponseUpdate | ConversionUpdate | AnalyticsUpdate | MonitoringUpdate | PongMessage;

export class RealtimeUpdatesService {
  private wss: WebSocketServer | null = null;
  private clients: Set<WebSocket>;
  private server: Server | null = null;

  constructor(server?: Server) {
    this.clients = new Set();
    
    if (server) {
      this.initializeWebSocket(server);
    } else {
      console.log('🔌 RealtimeUpdatesService initialized without server - WebSocket will be set up later');
    }
  }
  
  public initializeWebSocket(server: Server): void {
    if (this.wss) {
      console.log('⚠️ WebSocket server already initialized');
      return;
    }
    
    try {
      this.server = server;
      // Create WebSocket server on distinct path to avoid conflicts with Vite HMR
      this.wss = new WebSocketServer({ 
        server: server, 
        path: '/ws',
        perMessageDeflate: false
      });
      
      // Handle WebSocket server errors gracefully
      this.wss.on('error', (error) => {
        console.warn('⚠️ WebSocket server error (non-critical):', error.message);
        // Don't crash the app if WebSocket fails
      });
      
      this.setupWebSocketServer();
      console.log('✅ WebSocket server initialized on /ws');
    } catch (error: any) {
      console.warn('⚠️ WebSocket initialization failed (non-critical):', error.message);
      // Continue without WebSocket - app will still work
      this.wss = null;
    }
  }

  private async sendInitialStats(ws: WebSocket): Promise<void> {
    try {
      const { storage } = await import('../storage');
      const stats = await storage.getDashboardStats();
      
      this.sendToClient(ws, {
        type: 'analytics_update',
        data: {
          totalLeads: typeof stats.totalLeads === 'string' ? parseInt(stats.totalLeads) : stats.totalLeads || 0,
          dailyLeads: 0,
          conversionRate: 0,
          weeklyRevenue: 0
        }
      });
    } catch (error) {
      console.error('❌ Failed to send initial stats:', error);
      // Send default stats as fallback
      this.sendToClient(ws, {
        type: 'analytics_update',
        data: {
          totalLeads: 0,
          dailyLeads: 0,
          conversionRate: 0,
          weeklyRevenue: 0
        }
      });
    }
  }

  private setupWebSocketServer(): void {
    this.wss.on('connection', (ws: WebSocket, request) => {
      console.log('📡 New WebSocket client connected from:', request.socket.remoteAddress);
      
      this.clients.add(ws);

      // Send welcome message with current stats
      this.sendInitialStats(ws);

      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleClientMessage(ws, message);
        } catch (error) {
          console.error('❌ Invalid WebSocket message:', error);
        }
      });

      // Store heartbeat interval for cleanup
      let heartbeatInterval: NodeJS.Timeout;
      
      ws.on('close', (code, reason) => {
        const closeReason = this.getCloseReason(code);
        console.log(`📡 WebSocket client disconnected: ${code} (${closeReason}) ${reason}`);
        this.clients.delete(ws);
        clearInterval(heartbeatInterval);
      });

      ws.on('error', (error) => {
        console.error('❌ WebSocket error:', error);
        this.clients.delete(ws);
        clearInterval(heartbeatInterval);
      });
      
      // Send heartbeat every 30 seconds with connection validation
      heartbeatInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          try {
            // Only ping if connection is truly stable
            if (this.clients.has(ws)) {
              ws.ping();
            }
          } catch (error) {
            console.log('📡 Heartbeat failed, cleaning up connection');
            clearInterval(heartbeatInterval);
            this.clients.delete(ws);
          }
        } else {
          clearInterval(heartbeatInterval);
        }
      }, 30000);

      ws.on('pong', () => {
        // Client responded to heartbeat - connection is healthy
      });
    });
  }

  private handleClientMessage(ws: WebSocket, message: any): void {
    switch (message.type) {
      case 'subscribe_analytics':
        // Client wants analytics updates
        this.sendAnalyticsUpdate();
        break;
      case 'subscribe_leads':
        // Client wants lead updates
        break;
      case 'ping':
        this.sendToClient(ws, { type: 'pong', data: {} });
        break;
      default:
        console.log('📡 Unknown message type:', message.type);
    }
  }

  private sendToClient(ws: WebSocket, message: WebSocketMessage): void {
    if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify(message));
      } catch (error) {
        console.error('❌ Failed to send WebSocket message:', error);
      }
    }
  }

  private broadcast(message: WebSocketMessage): void {
    this.clients.forEach(ws => {
      this.sendToClient(ws, message);
    });
  }

  // Public methods for broadcasting updates

  public broadcastNewLead(lead: Lead, visaType: string, urgency: 'low' | 'medium' | 'high' | 'critical' = 'medium'): void {
    const update: LeadUpdate = {
      type: 'new_lead',
      data: {
        lead,
        visaType,
        platform: lead.sourcePlatform,
        urgency
      }
    };

    this.broadcast(update);
    console.log(`📢 Broadcasted new ${visaType} lead from ${lead.sourcePlatform} (${urgency} priority)`);
  }

  public broadcastResponseSent(leadId: string, platform: string, responseContent: string): void {
    const update: ResponseUpdate = {
      type: 'response_sent',
      data: {
        leadId,
        platform,
        responseContent: responseContent.substring(0, 100) + '...', // Truncate for privacy
        timestamp: new Date().toISOString()
      }
    };

    this.broadcast(update);
    console.log(`📢 Broadcasted response sent for lead ${leadId} on ${platform}`);
  }

  public broadcastConversion(leadId: string, amount: number, serviceType: string, conversionPath: string): void {
    const update: ConversionUpdate = {
      type: 'conversion',
      data: {
        leadId,
        amount,
        serviceType,
        conversionPath,
        timestamp: new Date().toISOString()
      }
    };

    this.broadcast(update);
    console.log(`🎉 Broadcasted conversion: $${amount} from ${serviceType} (${conversionPath})`);
  }

  public broadcastAnalyticsUpdate(stats: { totalLeads: number; dailyLeads: number; conversionRate: number; weeklyRevenue: number }): void {
    const update: AnalyticsUpdate = {
      type: 'analytics_update',
      data: stats
    };

    this.broadcast(update);
  }

  public broadcastMonitoringUpdate(platform: string, status: 'active' | 'limited' | 'error', newPosts: number, lastScanned: string): void {
    const update: MonitoringUpdate = {
      type: 'monitoring_status',
      data: {
        platform,
        status,
        newPosts,
        lastScanned
      }
    };

    this.broadcast(update);
  }

  private getCloseReason(code: number): string {
    const closeReasons: Record<number, string> = {
      1000: 'Normal Closure',
      1001: 'Going Away (browser refresh/tab close)',
      1002: 'Protocol Error',
      1003: 'Unsupported Data',
      1004: 'Reserved',
      1005: 'No Status Received',
      1006: 'Abnormal Closure',
      1007: 'Invalid Frame Payload Data',
      1008: 'Policy Violation',
      1009: 'Message Too Big',
      1010: 'Mandatory Extension',
      1011: 'Internal Server Error',
      1012: 'Service Restart',
      1013: 'Try Again Later',
      1015: 'TLS Handshake'
    };
    return closeReasons[code] || 'Unknown';
  }

  private async sendAnalyticsUpdate(): Promise<void> {
    try {
      // Get current analytics from storage
      const { storage } = await import('../storage');
      const leads = await storage.getLeads(100);
      const responses = await storage.getAllLeadResponses();
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const dailyLeads = leads.filter(lead => 
        lead.updatedAt && new Date(lead.updatedAt) >= today
      ).length;

      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const weeklyLeads = leads.filter(lead => 
        lead.updatedAt && new Date(lead.updatedAt) >= weekAgo
      ).length;

      const conversionRate = weeklyLeads > 0 ? (responses.length / weeklyLeads) * 0.15 : 0;
      const weeklyRevenue = weeklyLeads * conversionRate * 300; // Estimated revenue per conversion

      this.broadcastAnalyticsUpdate({
        totalLeads: leads.length,
        dailyLeads,
        conversionRate: Math.round(conversionRate * 100) / 100,
        weeklyRevenue: Math.round(weeklyRevenue)
      });
    } catch (error) {
      console.error('❌ Failed to send analytics update:', error);
    }
  }

  public getConnectionCount(): number {
    return this.clients.size;
  }

  public close(): void {
    this.clients.forEach(ws => {
      ws.close();
    });
    this.wss.close();
    console.log('🔌 WebSocket server closed');
  }
}