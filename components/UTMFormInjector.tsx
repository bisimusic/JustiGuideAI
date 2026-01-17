"use client";

import { useEffect } from 'react';
import { useUTMTracking } from '@/hooks/useUTMTracking';

/**
 * UTMFormInjector - Automatically injects UTM parameters as hidden fields into all forms
 * This ensures UTM tracking data is captured in form submissions across the application
 */
export function UTMFormInjector({ children }: { children: React.ReactNode }) {
  const { getTrackingParameters } = useUTMTracking();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const injectUTMFields = () => {
      const trackingParams = getTrackingParameters();
      
      if (Object.keys(trackingParams).length === 0) {
        return; // No UTM data to inject
      }

      // Find all forms in the document
      const forms = document.querySelectorAll('form');
      
      forms.forEach(form => {
        // Skip forms that already have UTM injection marker
        if (form.dataset.utmInjected === 'true') {
          return;
        }

        // Add UTM parameters as hidden inputs
        Object.entries(trackingParams).forEach(([param, value]) => {
          if (value && !form.querySelector(`[name="${param}"]`)) {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = param;
            input.value = value;
            input.dataset.utmInjected = 'true';
            form.appendChild(input);
          }
        });

        // Mark form as having UTM injection
        form.dataset.utmInjected = 'true';
      });
    };

    // Initial injection
    injectUTMFields();

    // Re-inject when DOM changes (for dynamically added forms)
    const observer = new MutationObserver((mutations) => {
      let shouldReinject = false;
      
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            // Check if new form was added or if added element contains forms
            if (element.tagName === 'FORM' || element.querySelector('form')) {
              shouldReinject = true;
            }
          }
        });
      });

      if (shouldReinject) {
        // Small delay to ensure DOM is settled
        setTimeout(injectUTMFields, 100);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Cleanup
    return () => {
      observer.disconnect();
    };
  }, [getTrackingParameters]);

  // Render children while injecting UTM fields
  return <>{children}</>;
}

/**
 * Alternative hook-based approach for manual form UTM injection
 * Use this in specific components where you want more control
 */
export function useFormUTMInjection(formRef: React.RefObject<HTMLFormElement>) {
  const { getTrackingParameters } = useUTMTracking();

  useEffect(() => {
    if (!formRef.current) return;

    const form = formRef.current;
    const trackingParams = getTrackingParameters();

    // Remove existing UTM fields to avoid duplicates
    form.querySelectorAll('[data-utm-injected="true"]').forEach(el => el.remove());

    // Add current UTM parameters
    Object.entries(trackingParams).forEach(([param, value]) => {
      if (value && !form.querySelector(`[name="${param}"]`)) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = param;
        input.value = value;
        input.dataset.utmInjected = 'true';
        form.appendChild(input);
      }
    });
  }, [formRef, getTrackingParameters]);
}