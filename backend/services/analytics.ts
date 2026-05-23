/**
 * TripMate Analytics Service
 * Wraps Sentry for error tracking + simple event logging.
 * Falls back gracefully if Sentry is not configured.
 */

import * as Sentry from '@sentry/react-native';

let initialized = false;

const analytics = {
  init() {
    try {
      const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
      if (!dsn) {
        console.log('[Analytics] Sentry DSN not configured – running in dev mode');
        return;
      }
      Sentry.init({
        dsn,
        environment: process.env.EXPO_PUBLIC_ENV || 'development',
        tracesSampleRate: 0.2,
        debug: __DEV__,
        enableAutoSessionTracking: true,
        sessionTrackingIntervalMillis: 30000,
      });
      initialized = true;
      console.log('[Analytics] Sentry initialized');
    } catch (e) {
      console.warn('[Analytics] Failed to initialize Sentry:', e);
    }
  },

  identify(userId: string, traits?: Record<string, any>) {
    try {
      if (initialized) {
        Sentry.setUser({ id: userId, ...traits });
      }
      console.log('[Analytics] identify', userId, traits);
    } catch (e) {
      console.warn('[Analytics] identify error:', e);
    }
  },

  reset() {
    try {
      if (initialized) Sentry.setUser(null);
      console.log('[Analytics] reset user');
    } catch (e) {
      console.warn('[Analytics] reset error:', e);
    }
  },

  track(event: string, properties?: Record<string, any>) {
    try {
      if (initialized) {
        Sentry.addBreadcrumb({
          category: 'user_action',
          message: event,
          data: properties,
          level: 'info',
        });
      }
      console.log(`[Analytics] ${event}`, properties);
    } catch (e) {
      console.warn('[Analytics] track error:', e);
    }
  },

  screen(name: string, properties?: Record<string, any>) {
    try {
      if (initialized) {
        Sentry.addBreadcrumb({
          category: 'navigation',
          message: `Screen: ${name}`,
          data: properties,
          level: 'info',
        });
      }
      console.log(`[Analytics] Screen: ${name}`, properties);
    } catch (e) {
      console.warn('[Analytics] screen error:', e);
    }
  },

  error(error: Error | string, context?: Record<string, any>) {
    try {
      const err = typeof error === 'string' ? new Error(error) : error;
      if (initialized) {
        Sentry.captureException(err, { extra: context });
      }
      console.error('[Analytics] Error captured:', err.message, context);
    } catch (e) {
      console.warn('[Analytics] error capture failed:', e);
    }
  },
};

export default analytics;
