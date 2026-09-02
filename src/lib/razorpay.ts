export interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export type RazorpayCheckoutOptions = Record<string, unknown>;

/**
 * NPCI deprecated manual UPI Collect (VPA entry) from Feb 28, 2026.
 * Prefer UPI Intent on mobile and UPI QR on desktop.
 * @see https://razorpay.com/docs/payments/payment-methods/upi/
 */
export const getRazorpayUpiComplianceOptions = (): RazorpayCheckoutOptions => ({
  config: {
    display: {
      hide: [{ method: 'upi', flow: 'collect' }],
      preferences: {
        show_default_blocks: true,
      },
    },
  },
  method: {
    upi: {
      collect: false,
      intent: true,
      qr: true,
    },
  },
});

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export const loadRazorpay = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};
