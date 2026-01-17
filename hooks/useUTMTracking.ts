import { useState, useEffect, useCallback } from 'react';

// Define all standard UTM parameters plus custom tracking fields
export interface UTMParameters {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  // Custom tracking parameters for referrals and attribution
  ref?: string; // Referral code
  gclid?: string; // Google Click ID
  fbclid?: string; // Facebook Click ID
  referrer?: string; // Document referrer
  landing_page?: string; // Initial landing page
  session_id?: string; // Session identifier
}

export interface UTMTrackingData extends UTMParameters {
  captured_at: string;
  page_path: string;
  user_agent: string;
  is_returning_visitor: boolean;
}

const UTM_STORAGE_KEY = 'justiguide_utm_tracking';
const UTM_SESSION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

class UTMTrackingService {
  private static instance: UTMTrackingService;
  private utmData: UTMTrackingData | null = null;
  private listeners: ((data: UTMTrackingData | null) => void)[] = [];

  static getInstance(): UTMTrackingService {
    if (!this.instance) {
      this.instance = new UTMTrackingService();
    }
    return this.instance;
  }

  private constructor() {
    this.initializeTracking();
  }

  private initializeTracking() {
    // Only run in browser environment
    if (typeof window === 'undefined') return;

    // Check for existing UTM data in sessionStorage
    const storedData = this.getStoredUTMData();
    
    // Get current URL parameters
    const currentUTMParams = this.extractUTMFromURL();
    
    // Determine if we should capture new UTM data
    const shouldCaptureNewData = this.shouldCaptureNewUTMData(storedData, currentUTMParams);
    
    if (shouldCaptureNewData && this.hasValidUTMData(currentUTMParams)) {
      // Capture fresh UTM data from current URL
      this.captureUTMData(currentUTMParams);
    } else if (storedData && this.isDataValid(storedData)) {
      // Use existing valid data
      this.utmData = storedData;
    } else {
      // Create minimal tracking data for attribution
      this.createMinimalTrackingData();
    }

    // Clean URL of UTM parameters to prevent confusion
    this.cleanURLParameters();
  }

  private extractUTMFromURL(): Partial<UTMParameters> {
    const params = new URLSearchParams(window.location.search);
    const utmParams: Partial<UTMParameters> = {};

    // Extract all possible tracking parameters
    const trackingParams = [
      'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
      'ref', 'gclid', 'fbclid'
    ];

    trackingParams.forEach(param => {
      const value = params.get(param);
      if (value) {
        utmParams[param as keyof UTMParameters] = value;
      }
    });

    return utmParams;
  }

  private hasValidUTMData(params: Partial<UTMParameters>): boolean {
    // At minimum, we need utm_source or a referral code
    return !!(params.utm_source || params.ref || params.gclid || params.fbclid);
  }

  private shouldCaptureNewUTMData(
    storedData: UTMTrackingData | null, 
    currentParams: Partial<UTMParameters>
  ): boolean {
    // Always capture if we have new UTM data and no stored data
    if (!storedData && this.hasValidUTMData(currentParams)) {
      return true;
    }

    // Capture if stored data is expired
    if (storedData && !this.isDataValid(storedData)) {
      return true;
    }

    // Capture if we have a new campaign (different utm_campaign)
    if (storedData && currentParams.utm_campaign && 
        currentParams.utm_campaign !== storedData.utm_campaign) {
      return true;
    }

    // Capture if we have a new referral code
    if (storedData && currentParams.ref && 
        currentParams.ref !== storedData.ref) {
      return true;
    }

    return false;
  }

  private captureUTMData(utmParams: Partial<UTMParameters>) {
    const trackingData: UTMTrackingData = {
      ...utmParams,
      captured_at: new Date().toISOString(),
      page_path: window.location.pathname,
      user_agent: navigator.userAgent,
      referrer: document.referrer || undefined,
      landing_page: window.location.pathname,
      session_id: this.generateSessionId(),
      is_returning_visitor: this.isReturningVisitor(),
    };

    this.utmData = trackingData;
    this.storeUTMData(trackingData);
    this.notifyListeners();

    console.log('🎯 UTM tracking captured:', trackingData);
  }

  private createMinimalTrackingData() {
    // Create basic tracking data even without UTM parameters
    const trackingData: UTMTrackingData = {
      captured_at: new Date().toISOString(),
      page_path: window.location.pathname,
      user_agent: navigator.userAgent,
      referrer: document.referrer || undefined,
      landing_page: window.location.pathname,
      session_id: this.generateSessionId(),
      is_returning_visitor: this.isReturningVisitor(),
      utm_source: this.inferTrafficSource(),
    };

    this.utmData = trackingData;
    this.storeUTMData(trackingData);
    this.notifyListeners();
  }

  private inferTrafficSource(): string {
    const referrer = document.referrer;
    if (!referrer) return 'direct';
    
    if (referrer.includes('google.com')) return 'google';
    if (referrer.includes('reddit.com')) return 'reddit';
    if (referrer.includes('linkedin.com')) return 'linkedin';
    if (referrer.includes('facebook.com')) return 'facebook';
    if (referrer.includes('twitter.com') || referrer.includes('x.com')) return 'twitter';
    
    return 'referral';
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private isReturningVisitor(): boolean {
    return !!localStorage.getItem('justiguide_visitor_id');
  }

  private storeUTMData(data: UTMTrackingData) {
    try {
      sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(data));
      
      // Also store visitor ID for return visitor detection
      if (!localStorage.getItem('justiguide_visitor_id')) {
        localStorage.setItem('justiguide_visitor_id', data.session_id || '');
      }
    } catch (error) {
      console.warn('Failed to store UTM data:', error);
    }
  }

  private getStoredUTMData(): UTMTrackingData | null {
    try {
      const stored = sessionStorage.getItem(UTM_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn('Failed to retrieve UTM data:', error);
      return null;
    }
  }

  private isDataValid(data: UTMTrackingData): boolean {
    const capturedAt = new Date(data.captured_at);
    const now = new Date();
    return (now.getTime() - capturedAt.getTime()) < UTM_SESSION_DURATION;
  }

  private cleanURLParameters() {
    // Remove UTM parameters from URL to keep it clean
    const url = new URL(window.location.href);
    const utmParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'ref', 'gclid', 'fbclid'];
    
    let hasChanges = false;
    utmParams.forEach(param => {
      if (url.searchParams.has(param)) {
        url.searchParams.delete(param);
        hasChanges = true;
      }
    });

    if (hasChanges) {
      window.history.replaceState({}, '', url.toString());
    }
  }

  // Public methods
  public getUTMData(): UTMTrackingData | null {
    return this.utmData;
  }

  public getUTMParameters(): UTMParameters {
    if (!this.utmData) return {};
    
    const { captured_at, page_path, user_agent, is_returning_visitor, ...utmParams } = this.utmData;
    return utmParams;
  }

  public getTrackingParameters(): Record<string, string> {
    const utmParams = this.getUTMParameters();
    const params: Record<string, string> = {};
    
    Object.entries(utmParams).forEach(([key, value]) => {
      if (value) {
        params[key] = String(value);
      }
    });

    return params;
  }

  public appendUTMToUrl(baseUrl: string): string {
    const params = this.getTrackingParameters();
    if (Object.keys(params).length === 0) return baseUrl;

    const url = new URL(baseUrl);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });

    return url.toString();
  }

  public subscribe(callback: (data: UTMTrackingData | null) => void) {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(callback => callback(this.utmData));
  }

  public updateUTMData(updates: Partial<UTMParameters>) {
    if (this.utmData) {
      this.utmData = { ...this.utmData, ...updates };
      this.storeUTMData(this.utmData);
      this.notifyListeners();
    }
  }

  public clearUTMData() {
    this.utmData = null;
    sessionStorage.removeItem(UTM_STORAGE_KEY);
    this.notifyListeners();
  }
}

// React hook for using UTM tracking
export function useUTMTracking() {
  const [utmData, setUTMData] = useState<UTMTrackingData | null>(null);
  const service = UTMTrackingService.getInstance();

  useEffect(() => {
    // Get initial data
    setUTMData(service.getUTMData());

    // Subscribe to changes
    const unsubscribe = service.subscribe(setUTMData);
    return unsubscribe;
  }, [service]);

  const getUTMParameters = useCallback(() => {
    return service.getUTMParameters();
  }, [service]);

  const getTrackingParameters = useCallback(() => {
    return service.getTrackingParameters();
  }, [service]);

  const appendUTMToUrl = useCallback((url: string) => {
    return service.appendUTMToUrl(url);
  }, [service]);

  const updateUTMData = useCallback((updates: Partial<UTMParameters>) => {
    service.updateUTMData(updates);
  }, [service]);

  return {
    utmData,
    getUTMParameters,
    getTrackingParameters,
    appendUTMToUrl,
    updateUTMData,
    hasUTMData: !!utmData,
    isReturningVisitor: utmData?.is_returning_visitor || false,
  };
}

// Utility function for direct access without React hook
export function getUTMTrackingService() {
  return UTMTrackingService.getInstance();
}