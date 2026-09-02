import { loadRazorpay, getRazorpayUpiComplianceOptions, type RazorpayResponse } from './razorpay';
import {
  createCartOrder,
  createServiceOrder,
  createSubscriptionOrder,
  verifyRazorpayPayment,
  type RazorpayOrderResponse,
  type VerifyPaymentPayload,
} from './payments-api';

type CheckoutCallbacks = {
  onSuccess?: () => void | Promise<void>;
  onDismiss?: () => void;
  onError?: (message: string) => void;
};

const buildCheckoutOptions = (
  orderData: RazorpayOrderResponse,
  description: string,
  handler: (response: RazorpayResponse) => void,
  onDismiss?: () => void,
) => {
  const base = {
    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
    name: 'DesignJockey',
    description,
    handler,
    theme: { color: '#C4FE01' },
    modal: { ondismiss: onDismiss },
    ...getRazorpayUpiComplianceOptions(),
    ...(import.meta.env.VITE_RAZORPAY_CHECKOUT_CONFIG_ID
      ? { checkout_config_id: import.meta.env.VITE_RAZORPAY_CHECKOUT_CONFIG_ID }
      : {}),
    ...(orderData.checkout_config_id ? { checkout_config_id: orderData.checkout_config_id } : {}),
  };

  if (orderData.razorpay_subscription_id) {
    return {
      ...base,
      subscription_id: orderData.razorpay_subscription_id,
    };
  }

  if (!orderData.order?.id) {
    throw new Error('Invalid Razorpay order response');
  }

  return {
    ...base,
    amount: orderData.order.amount,
    currency: orderData.order.currency,
    order_id: orderData.order.id,
  };
};

const openRazorpay = async (
  orderData: RazorpayOrderResponse,
  description: string,
  verifyPayload: (response: RazorpayResponse, orderData: RazorpayOrderResponse) => VerifyPaymentPayload,
  token: string,
  callbacks: CheckoutCallbacks = {},
) => {
  const isLoaded = await loadRazorpay();
  if (!isLoaded) {
    callbacks.onError?.('Razorpay SDK failed to load');
    return;
  }

  const options = buildCheckoutOptions(
    orderData,
    description,
    async (response) => {
      try {
        await verifyRazorpayPayment(token, verifyPayload(response, orderData));
        await callbacks.onSuccess?.();
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Payment verification failed';
        callbacks.onError?.(message);
      }
    },
    callbacks.onDismiss,
  );

  new window.Razorpay(options).open();
};

export const checkoutSubscription = async (
  token: string,
  planId: string,
  planName: string,
  callbacks: CheckoutCallbacks = {},
) => {
  try {
    const orderData = await createSubscriptionOrder(token, planId);
    await openRazorpay(
      orderData,
      `Subscription: ${planName}`,
      (response, data) => ({
        type: 'subscription',
        subscription_plan_id: planId,
        razorpay_subscription_id: data.razorpay_subscription_id,
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
      }),
      token,
      callbacks,
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Checkout failed';
    callbacks.onError?.(message);
  }
};

export const checkoutService = async (
  token: string,
  serviceId: string,
  serviceName: string,
  callbacks: CheckoutCallbacks = {},
) => {
  try {
    const orderData = await createServiceOrder(token, serviceId);
    await openRazorpay(
      orderData,
      serviceName,
      (response) => ({
        type: 'service',
        service_id: serviceId,
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
      }),
      token,
      callbacks,
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Checkout failed';
    callbacks.onError?.(message);
  }
};

export const checkoutCart = async (
  token: string,
  serviceIds: string[],
  callbacks: CheckoutCallbacks = {},
) => {
  try {
    const orderData = await createCartOrder(token);
    await openRazorpay(
      orderData,
      'Cart checkout',
      (response) => ({
        type: 'cart',
        service_id: serviceIds[0] || '',
        service_ids: serviceIds,
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
      }),
      token,
      callbacks,
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Checkout failed';
    callbacks.onError?.(message);
  }
};
