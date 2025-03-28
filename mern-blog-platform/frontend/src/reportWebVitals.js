// Performance metric thresholds (aligns with Google's Web Vitals)
const VITALS_THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 200, poor: 600 },
};

/**
 * Classifies a metric value based on thresholds
 * @param {string} name - Metric name
 * @param {number} value - Measured value
 * @returns {string} - 'good', 'needs-improvement', or 'poor'
 */
const classifyPerf = (name, value) => {
  const thresholds = VITALS_THRESHOLDS[name];
  if (!thresholds) return 'unknown';
  
  if (value <= thresholds.good) return 'good';
  if (value <= thresholds.poor) return 'needs-improvement';
  return 'poor';
};

/**
 * Formats the metric for logging/analytics
 * @param {Object} metric - Web Vitals metric object
 * @returns {Object} - Formatted metric data
 */
const formatMetric = (metric) => {
  const { name, value, rating } = metric;
  return {
    name,
    value: Math.round(value),
    rating: rating || classifyPerf(name, value),
    timestamp: Date.now(),
    path: window.location.pathname,
  };
};

/**
 * Sends metrics to analytics endpoint
 * @param {Object} metric - Formatted metric data
 */
const sendToAnalytics = (metric) => {
  // Example: Send to Google Analytics
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'web_vitals', {
      event_category: 'Web Vitals',
      event_value: metric.value,
      event_label: metric.name,
      non_interaction: true,
    });
  }

  // Example: Send to custom analytics endpoint
  const endpoint = process.env.REACT_APP_ANALYTICS_URL;
  if (endpoint) {
    navigator.sendBeacon?.(
      `${endpoint}/vitals`,
      JSON.stringify(metric)
    );
  }

  // Development logging
  if (process.env.NODE_ENV === 'development') {
    console.log('[Web Vitals]', metric);
  }
};

/**
 * Reports Core Web Vitals
 * @param {Function} onPerfEntry - Callback function
 */
const reportWebVitals = (onPerfEntry) => {
  if (onPerfEntry && typeof onPerfEntry === 'function') {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    }).catch((error) => {
      console.error('Error loading web-vitals:', error);
    });
  }
};

/**
 * Initializes performance monitoring
 */
export const initWebVitals = () => {
  reportWebVitals((metric) => {
    const formatted = formatMetric(metric);
    sendToAnalytics(formatted);
  });
};

export default reportWebVitals;