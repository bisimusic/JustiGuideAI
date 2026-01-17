import { useEffect, useRef, useState, useCallback } from 'react';

// Global WebSocket instance to prevent multiple connections
let globalWebSocket: WebSocket | null = null;
let globalListeners: Set<Function> = new Set();

interface WebSocketMessage {
  type: 'new_lead' | 'response_sent' | 'conversion' | 'analytics_update' | 'monitoring_status';
  data: any;
}

interface UseWebSocketOptions {
  onNewLead?: (lead: any) => void;
  onResponseSent?: (response: any) => void;
  onConversion?: (conversion: any) => void;
  onAnalyticsUpdate?: (analytics: any) => void;
  onMonitoringUpdate?: (monitoring: any) => void;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  enableAutoReconnect?: boolean;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    onNewLead,
    onResponseSent,
    onConversion,
    onAnalyticsUpdate,
    onMonitoringUpdate,
    reconnectInterval = 5000,
    maxReconnectAttempts = 3,
    enableAutoReconnect = true
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isReconnectingRef = useRef(false);
  const lastConnectAttempt = useRef<number>(0);

  const connect = useCallback(() => {
    if (isReconnectingRef.current) return;
    
    // Use global WebSocket instance if available and connected
    if (globalWebSocket && globalWebSocket.readyState === WebSocket.OPEN) {
      wsRef.current = globalWebSocket;
      setIsConnected(true);
      setConnectionError(null);
      setReconnectAttempts(0);
      return;
    }
    
    // Throttle connection attempts (minimum 2 seconds between attempts)
    const now = Date.now();
    if (now - lastConnectAttempt.current < 2000) {
      return;
    }
    lastConnectAttempt.current = now;

    try {
      // Clean up existing connection
      if (wsRef.current && wsRef.current !== globalWebSocket) {
        wsRef.current.close();
        wsRef.current = null;
      }

      // Robust WebSocket URL construction
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const hostname = window.location.hostname;
      const port = window.location.port;
      
      // Handle port construction more robustly
      let hostWithPort: string;
      
      // For Replit and similar environments, use the current host directly
      if (hostname.includes('replit.dev') || hostname.includes('replit.app') || hostname.includes('replit.co')) {
        hostWithPort = window.location.host; // This includes port automatically
      } else if (port && port !== "" && port !== "80" && port !== "443") {
        // Port is explicitly specified and not default HTTP/HTTPS ports
        hostWithPort = `${hostname}:${port}`;
      } else if (hostname === "localhost") {
        // Development fallback - always use window.location.host for localhost to avoid undefined port
        hostWithPort = window.location.host || `localhost:5000`;
      } else {
        // Use hostname only (for production domains with standard ports)
        hostWithPort = hostname;
      }
      
      const wsUrl = `${protocol}//${hostWithPort}/ws`;
      console.log('🔌 Attempting WebSocket connection to:', wsUrl);
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      globalWebSocket = ws;

      ws.onopen = () => {
        console.log('✅ WebSocket connected');
        setIsConnected(true);
        setConnectionError(null);
        setReconnectAttempts(0);
        isReconnectingRef.current = false;

        // Subscribe to analytics updates with error handling
        try {
          ws.send(JSON.stringify({ type: 'subscribe_analytics' }));
          ws.send(JSON.stringify({ type: 'subscribe_leads' }));
        } catch (error) {
          console.error('Failed to send subscription messages:', error);
        }
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          
          switch (message.type) {
            case 'new_lead':
              onNewLead?.(message.data);
              break;
            case 'response_sent':
              onResponseSent?.(message.data);
              break;
            case 'conversion':
              onConversion?.(message.data);
              break;
            case 'analytics_update':
              onAnalyticsUpdate?.(message.data);
              break;
            case 'monitoring_status':
              onMonitoringUpdate?.(message.data);
              break;
            default:
              console.log('Unknown WebSocket message type:', message.type);
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('🔌 WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        wsRef.current = null;
        
        // Clean up global reference if this was the global connection
        if (globalWebSocket === ws) {
          globalWebSocket = null;
        }

        // Reconnect for abnormal closures but not normal disconnections
        if (enableAutoReconnect && (event.code === 1006 || event.code === 1001) && reconnectAttempts < maxReconnectAttempts && !isReconnectingRef.current) {
          isReconnectingRef.current = true;
          const delay = Math.min(reconnectInterval * Math.pow(2, reconnectAttempts), 10000); // Exponential backoff, max 10s
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`🔄 Attempting to reconnect (${reconnectAttempts + 1}/${maxReconnectAttempts})...`);
            setReconnectAttempts(prev => prev + 1);
            isReconnectingRef.current = false;
            connect();
          }, delay);
        } else if (reconnectAttempts >= maxReconnectAttempts) {
          setConnectionError(`Failed to reconnect after ${maxReconnectAttempts} attempts`);
          console.log('🔌 Max reconnection attempts reached. Connection disabled.');
        }
      };

      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setConnectionError('WebSocket connection failed');
      };

    } catch (error) {
      console.error('❌ Failed to create WebSocket connection:', error);
      setConnectionError('Failed to create WebSocket connection');
    }
  }, []); // Remove dependencies to prevent connection instability

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Normal closure');
      wsRef.current = null;
    }
    
    setIsConnected(false);
    isReconnectingRef.current = false;
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    // Only connect if not already connected
    if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED) {
      connect();
    }

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, []); // Remove dependencies to prevent reconnections on every render

  return {
    isConnected,
    connectionError,
    reconnectAttempts,
    sendMessage,
    connect,
    disconnect
  };
}