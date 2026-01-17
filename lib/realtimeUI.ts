// Real-time UI helper class matching the provided implementation
export class RealtimeUpdates {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;

  constructor() {
    this.connectWebSocket();
    this.setupEventHandlers();
  }

  private connectWebSocket() {
    // Robust WebSocket URL construction
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const hostname = window.location.hostname;
    const port = window.location.port;
    
    // Handle port construction more robustly
    let hostWithPort: string;
    if (port && port !== "80" && port !== "443") {
      hostWithPort = `${hostname}:${port}`;
    } else if (!port && window.location.hostname === "localhost") {
      // Development fallback - use default port 5000 for localhost if no port specified
      hostWithPort = `${hostname}:5000`;
    } else {
      hostWithPort = hostname;
    }
    
    const wsUrl = `${protocol}//${hostWithPort}/ws`;
    console.log('🔌 RealtimeUI connecting to WebSocket:', wsUrl);
    
    try {
      this.ws = new WebSocket(wsUrl);
      this.setupWebSocketEvents();
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.scheduleReconnect();
    }
  }

  private setupWebSocketEvents() {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('✅ WebSocket connected');
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    this.ws.onclose = () => {
      console.log('🔌 WebSocket disconnected');
      this.scheduleReconnect();
    };

    this.ws.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
    };
  }

  private handleMessage(message: any) {
    switch (message.type) {
      case 'new_lead':
        this.addLeadToUI(message.data);
        this.showNotification(`New ${message.data.visaType} lead from ${message.data.platform}`);
        break;
      case 'response_sent':
        this.updateLeadStatus(message.data.leadId, 'responded');
        this.incrementResponseCounter();
        break;
      case 'conversion':
        this.celebrateConversion(message.data);
        this.updateRevenue(message.data.amount);
        break;
      case 'analytics_update':
        this.updateAnalytics(message.data);
        break;
    }
  }

  private setupEventHandlers() {
    // Event handlers are set up in handleMessage method
  }

  public addLeadToUI(lead: any) {
    // Dispatch custom event for React components to listen to
    window.dispatchEvent(new CustomEvent('newLead', { detail: lead }));
    
    // Update DOM if needed
    const leadsCounter = document.querySelector('[data-leads-count]');
    if (leadsCounter) {
      const currentCount = parseInt(leadsCounter.textContent || '0');
      leadsCounter.textContent = (currentCount + 1).toString();
    }
  }

  public showNotification(message: string) {
    // Create toast notification
    const event = new CustomEvent('showToast', { 
      detail: { 
        title: 'New Lead!', 
        description: message,
        duration: 5000
      } 
    });
    window.dispatchEvent(event);

    // Browser notification if permission granted
    if (Notification.permission === 'granted') {
      new Notification('JustiGuide - New Lead', {
        body: message,
        icon: '/favicon.ico'
      });
    }
  }

  public updateLeadStatus(leadId: string, status: string) {
    // Dispatch event for React components
    window.dispatchEvent(new CustomEvent('leadStatusUpdate', { 
      detail: { leadId, status } 
    }));

    // Update DOM elements
    const leadElement = document.querySelector(`[data-lead-id="${leadId}"]`);
    if (leadElement) {
      leadElement.setAttribute('data-status', status);
      const statusBadge = leadElement.querySelector('.status-badge');
      if (statusBadge) {
        statusBadge.textContent = status;
        statusBadge.className = `status-badge badge-${status}`;
      }
    }
  }

  public incrementResponseCounter() {
    // Update response counter in UI
    const responseCounter = document.querySelector('[data-responses-count]');
    if (responseCounter) {
      const currentCount = parseInt(responseCounter.textContent || '0');
      responseCounter.textContent = (currentCount + 1).toString();
    }

    // Dispatch event
    window.dispatchEvent(new CustomEvent('responseCountUpdate'));
  }

  public celebrateConversion(conversion: any) {
    // Show celebration animation/notification
    this.showNotification(`🎉 Conversion! $${conversion.amount} from ${conversion.serviceType}`);
    
    // Add celebration effect
    const celebrationEvent = new CustomEvent('celebration', { 
      detail: conversion 
    });
    window.dispatchEvent(celebrationEvent);

    // Create confetti effect if library available
    if ((window as any).confetti) {
      (window as any).confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }

  public updateRevenue(amount: number) {
    // Update revenue displays
    const revenueElements = document.querySelectorAll('[data-revenue]');
    revenueElements.forEach(element => {
      const currentRevenue = parseFloat(element.getAttribute('data-revenue') || '0');
      const newRevenue = currentRevenue + amount;
      element.setAttribute('data-revenue', newRevenue.toString());
      element.textContent = `$${newRevenue.toLocaleString()}`;
    });

    // Dispatch revenue update event
    window.dispatchEvent(new CustomEvent('revenueUpdate', { 
      detail: { amount, total: amount } 
    }));
  }

  public updateAnalytics(data: any) {
    // Update various analytics displays
    Object.entries(data).forEach(([key, value]) => {
      const elements = document.querySelectorAll(`[data-stat="${key}"]`);
      elements.forEach(element => {
        element.textContent = value as string;
      });
    });

    // Dispatch analytics update event
    window.dispatchEvent(new CustomEvent('analyticsUpdate', { detail: data }));
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})...`);
        this.reconnectAttempts++;
        this.connectWebSocket();
      }, this.reconnectInterval);
    }
  }

  public disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// Global instance
export const realtimeUpdates = new RealtimeUpdates();