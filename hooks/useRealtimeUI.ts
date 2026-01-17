import { useEffect, useRef } from 'react';
import { toast } from '@/hooks/use-toast';

export function useRealtimeUI() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectInterval = 3000;

  useEffect(() => {
    // Only connect WebSocket if we're on an authenticated page
    const isPublicPage = ['/services', '/checkout', '/payment-success', '/login'].some(path => 
      window.location.pathname === path
    );
    
    if (!isPublicPage) {
      connectWebSocket();
    }

    // Listen for custom events from the realtimeUI class
    const handleNewLead = (event: CustomEvent) => {
      console.log('New lead received:', event.detail);
    };

    const handleToast = (event: CustomEvent) => {
      const { title, description, duration } = event.detail;
      toast({ title, description, duration });
    };

    const handleCelebration = (event: CustomEvent) => {
      const conversion = event.detail;
      toast({
        title: "🎉 Conversion Celebration!",
        description: `$${conversion.amount} from ${conversion.serviceType}`,
        duration: 8000,
      });
      
      // Add visual celebration effect
      const celebrationDiv = document.createElement('div');
      celebrationDiv.innerHTML = '🎉';
      celebrationDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 4rem;
        z-index: 9999;
        pointer-events: none;
        animation: celebrationBounce 2s ease-out forwards;
      `;
      
      // Add keyframes if not already present
      if (!document.querySelector('#celebration-styles')) {
        const style = document.createElement('style');
        style.id = 'celebration-styles';
        style.textContent = `
          @keyframes celebrationBounce {
            0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
            50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
            100% { transform: translate(-50%, -50%) scale(1) translateY(-100px); opacity: 0; }
          }
        `;
        document.head.appendChild(style);
      }
      
      document.body.appendChild(celebrationDiv);
      setTimeout(() => {
        document.body.removeChild(celebrationDiv);
      }, 2000);
    };

    window.addEventListener('newLead', handleNewLead);
    window.addEventListener('showToast', handleToast);
    window.addEventListener('celebration', handleCelebration);

    return () => {
      window.removeEventListener('newLead', handleNewLead);
      window.removeEventListener('showToast', handleToast);
      window.removeEventListener('celebration', handleCelebration);
      
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const connectWebSocket = () => {
    try {
      // More robust WebSocket URL construction
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const host = window.location.hostname;
      const port = window.location.port || (window.location.protocol === "https:" ? "443" : "80");
      
      // For development, use the known port
      const actualPort = host === "localhost" ? "5000" : port;
      const wsUrl = `${protocol}//${host}:${actualPort}/ws`;
      
      console.log('🔌 Connecting WebSocket to:', wsUrl);
      wsRef.current = new WebSocket(wsUrl);
      setupWebSocketEvents();
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      // Don't crash the app - just log the error and continue
      return;
    }
  };

  const setupWebSocketEvents = () => {
    if (!wsRef.current) return;

    wsRef.current.onopen = () => {
      console.log('✅ WebSocket connected');
      reconnectAttemptsRef.current = 0;
    };

    wsRef.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        handleWebSocketMessage(message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    wsRef.current.onclose = () => {
      console.log('🔌 WebSocket disconnected');
      scheduleReconnect();
    };

    wsRef.current.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
    };
  };

  const handleWebSocketMessage = (message: any) => {
    switch (message.type) {
      case 'new_lead':
        addLeadToUI(message.data);
        showNotification(`New ${message.data.visaType} lead from ${message.data.platform}`);
        break;
      case 'response_sent':
        updateLeadStatus(message.data.leadId, 'responded');
        incrementResponseCounter();
        break;
      case 'conversion':
        celebrateConversion(message.data);
        updateRevenue(message.data.amount);
        break;
      case 'analytics_update':
        updateAnalytics(message.data);
        break;
    }
  };

  const addLeadToUI = (lead: any) => {
    window.dispatchEvent(new CustomEvent('newLead', { detail: lead }));
  };

  const showNotification = (message: string) => {
    window.dispatchEvent(new CustomEvent('showToast', { 
      detail: { 
        title: 'New Lead!', 
        description: message,
        duration: 5000
      } 
    }));

    // Request notification permission if not already granted
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    if (Notification.permission === 'granted') {
      new Notification('JustiGuide - New Lead', {
        body: message,
        icon: '/favicon.ico'
      });
    }
  };

  const updateLeadStatus = (leadId: string, status: string) => {
    window.dispatchEvent(new CustomEvent('leadStatusUpdate', { 
      detail: { leadId, status } 
    }));
  };

  const incrementResponseCounter = () => {
    window.dispatchEvent(new CustomEvent('responseCountUpdate'));
  };

  const celebrateConversion = (conversion: any) => {
    window.dispatchEvent(new CustomEvent('celebration', { 
      detail: conversion 
    }));
  };

  const updateRevenue = (amount: number) => {
    window.dispatchEvent(new CustomEvent('revenueUpdate', { 
      detail: { amount } 
    }));
  };

  const updateAnalytics = (data: any) => {
    window.dispatchEvent(new CustomEvent('analyticsUpdate', { detail: data }));
  };

  const scheduleReconnect = () => {
    if (reconnectAttemptsRef.current < maxReconnectAttempts) {
      setTimeout(() => {
        console.log(`🔄 Attempting to reconnect (${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})...`);
        reconnectAttemptsRef.current++;
        connectWebSocket();
      }, reconnectInterval);
    }
  };

  return {
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
    reconnectAttempts: reconnectAttemptsRef.current
  };
}