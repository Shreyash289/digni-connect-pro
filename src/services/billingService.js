import { supabase } from '../integrations/supabase/client';

/**
 * Public payment gateway key ID (optional, leave unset if not yet configured).
 * Never store secrets in the frontend.
 */
const VITE_PAYMENT_KEY_ID = import.meta.env.VITE_PAYMENT_KEY_ID || null;

/**
 * Helper to determine if an error represents an unavailable backend entity
 * (table, edge function, schema, or bucket not yet created).
 */
const isUnavailableError = (err) => {
  if (!err) return false;
  const msg = (err.message || String(err)).toLowerCase();
  const code = err.code || '';
  return (
    code === 'PGRST116' ||
    code === 'PGRST204' ||
    code === 'PGRST200' ||
    code === '42P01' || // relation does not exist
    code === '42883' || // function does not exist
    msg.includes('does not exist') ||
    msg.includes('not found') ||
    msg.includes('schema') ||
    msg.includes('relation') ||
    msg.includes('failed to send a request') ||
    msg.includes('function not found') ||
    msg.includes('functions_relay_error') ||
    msg.includes('fetch failed') ||
    msg.includes('missing supabase environment variable')
  );
};

const sanitizeError = (err, fallbackMessage) => {
  if (!err) return fallbackMessage;
  if (isUnavailableError(err)) return fallbackMessage;
  return typeof err === 'string' ? err : err.message || fallbackMessage;
};

/**
 * Fetch the active subscription for the currently authenticated user.
 * Returns { data, error, unavailable }
 */
export const getMySubscription = async () => {
  try {
    const { data: authData, error: authErr } = await supabase.auth.getUser();
    if (authErr || !authData?.user) {
      return { data: null, error: null, unavailable: false };
    }

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', authData.user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      const unavailable = isUnavailableError(error);
      return {
        data: null,
        error: unavailable ? null : 'Unable to retrieve subscription information',
        unavailable
      };
    }

    return { data, error: null, unavailable: false };
  } catch (err) {
    const unavailable = isUnavailableError(err);
    return {
      data: null,
      error: unavailable ? null : 'Unable to retrieve subscription information',
      unavailable
    };
  }
};

/**
 * Create an order by calling Supabase edge function "create-order".
 * Body: { planId, method }
 * method in: 'upi' | 'netbanking' | 'qr' | 'card'
 * Returns: { data: { orderId, amount, currency, gatewayKeyId?, qr? }, error, unavailable }
 */
export const createOrder = async (planId, method) => {
  const validMethods = ['upi', 'netbanking', 'qr', 'card'];
  if (!planId) {
    return { data: null, error: 'Please select a valid plan', unavailable: false };
  }
  if (!method || !validMethods.includes(method)) {
    return { data: null, error: 'Please choose a valid payment method', unavailable: false };
  }

  try {
    const { data, error } = await supabase.functions.invoke('create-order', {
      body: { planId, method, gatewayKeyId: VITE_PAYMENT_KEY_ID }
    });

    if (error) {
      const unavailable = isUnavailableError(error);
      return {
        data: null,
        error: unavailable
          ? 'Payment service is currently being set up. Please check back soon.'
          : 'Unable to initiate order. Please try again.',
        unavailable
      };
    }

    return { data, error: null, unavailable: false };
  } catch (err) {
    const unavailable = isUnavailableError(err);
    return {
      data: null,
      error: unavailable
        ? 'Payment service is currently being set up. Please check back soon.'
        : 'Unable to initiate order. Please try again.',
      unavailable
    };
  }
};

/**
 * Get the payment status of an order via Supabase edge function "payment-status".
 * Expected status: 'pending' | 'paid' | 'failed' | 'expired'
 * Returns { data: { status }, error, unavailable }
 */
export const getPaymentStatus = async (orderId) => {
  if (!orderId) {
    return { data: null, error: 'Order reference is required', unavailable: false };
  }

  try {
    const { data, error } = await supabase.functions.invoke('payment-status', {
      body: { orderId }
    });

    if (error) {
      const unavailable = isUnavailableError(error);
      return {
        data: null,
        error: unavailable
          ? 'Payment verification service is currently unavailable.'
          : 'Unable to verify payment status.',
        unavailable
      };
    }

    return { data, error: null, unavailable: false };
  } catch (err) {
    const unavailable = isUnavailableError(err);
    return {
      data: null,
      error: unavailable
        ? 'Payment verification service is currently unavailable.'
        : 'Unable to verify payment status.',
      unavailable
    };
  }
};

/**
 * List invoices for the authenticated user from the "invoices" table.
 * Fields: id, number, amount, issued_at, pdf_path
 * Returns { data, error, unavailable }
 */
export const listInvoices = async () => {
  try {
    const { data: authData, error: authErr } = await supabase.auth.getUser();
    if (authErr || !authData?.user) {
      return { data: [], error: null, unavailable: false };
    }

    const { data, error } = await supabase
      .from('invoices')
      .select('id, number, amount, issued_at, pdf_path')
      .eq('user_id', authData.user.id)
      .order('issued_at', { ascending: false });

    if (error) {
      const unavailable = isUnavailableError(error);
      return {
        data: [],
        error: unavailable ? null : 'Unable to load invoice records',
        unavailable
      };
    }

    return { data: data || [], error: null, unavailable: false };
  } catch (err) {
    const unavailable = isUnavailableError(err);
    return {
      data: [],
      error: unavailable ? null : 'Unable to load invoice records',
      unavailable
    };
  }
};

/**
 * Generate a short-lived signed download URL for an invoice PDF.
 * Returns { data: { signedUrl }, error, unavailable }
 */
export const getInvoiceDownloadUrl = async (pdfPath) => {
  if (!pdfPath) {
    return { data: null, error: 'Invoice document path is missing', unavailable: false };
  }

  try {
    const { data, error } = await supabase.storage
      .from('invoices')
      .createSignedUrl(pdfPath, 60);

    if (error) {
      const unavailable = isUnavailableError(error);
      return {
        data: null,
        error: unavailable ? 'Invoice storage is currently unavailable' : 'Failed to generate download link',
        unavailable
      };
    }

    return { data, error: null, unavailable: false };
  } catch (err) {
    const unavailable = isUnavailableError(err);
    return {
      data: null,
      error: unavailable ? 'Invoice storage is currently unavailable' : 'Failed to generate download link',
      unavailable
    };
  }
};

/**
 * Retrieve the saved billing profile from table "billing_profiles".
 * Fields: org_name, gstin, address, contact_name, phone
 * Returns { data, error, unavailable }
 */
export const getBillingProfile = async () => {
  try {
    const { data: authData, error: authErr } = await supabase.auth.getUser();
    if (authErr || !authData?.user) {
      return { data: null, error: null, unavailable: false };
    }

    const { data, error } = await supabase
      .from('billing_profiles')
      .select('org_name, gstin, address, contact_name, phone')
      .eq('user_id', authData.user.id)
      .maybeSingle();

    if (error) {
      const unavailable = isUnavailableError(error);
      return {
        data: null,
        error: unavailable ? null : 'Unable to load billing profile',
        unavailable
      };
    }

    return { data, error: null, unavailable: false };
  } catch (err) {
    const unavailable = isUnavailableError(err);
    return {
      data: null,
      error: unavailable ? null : 'Unable to load billing profile',
      unavailable
    };
  }
};

/**
 * Save or update the billing profile in table "billing_profiles".
 * Profile: { org_name, gstin, address, contact_name, phone }
 * Returns { data, error, unavailable }
 */
export const saveBillingProfile = async (profile) => {
  try {
    const { data: authData, error: authErr } = await supabase.auth.getUser();
    if (authErr || !authData?.user) {
      return { data: null, error: 'User must be authenticated to save billing details', unavailable: false };
    }

    const payload = {
      user_id: authData.user.id,
      org_name: profile.org_name || null,
      gstin: profile.gstin || null,
      address: profile.address || null,
      contact_name: profile.contact_name || null,
      phone: profile.phone || null,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('billing_profiles')
      .upsert(payload)
      .select('org_name, gstin, address, contact_name, phone')
      .single();

    if (error) {
      const unavailable = isUnavailableError(error);
      return {
        data: null,
        error: unavailable
          ? 'Billing profile service is currently being set up.'
          : 'Unable to save billing profile',
        unavailable
      };
    }

    return { data, error: null, unavailable: false };
  } catch (err) {
    const unavailable = isUnavailableError(err);
    return {
      data: null,
      error: unavailable
        ? 'Billing profile service is currently being set up.'
        : 'Unable to save billing profile',
      unavailable
    };
  }
};

/**
 * openCheckout: ADAPTER STUB.
 *
 * TODO: Payment provider not chosen yet. Implement hosted checkout here
 * (e.g. Razorpay/Cashfree) once the gateway is selected.
 */
export const openCheckout = async (order) => {
  // ADAPTER STUB: Returns unavailable: true until gateway SDK is integrated
  return {
    data: null,
    error: 'Payments are being set up. Please check back soon.',
    unavailable: true
  };
};

export const billingService = {
  getMySubscription,
  createOrder,
  getPaymentStatus,
  listInvoices,
  getInvoiceDownloadUrl,
  getBillingProfile,
  saveBillingProfile,
  openCheckout
};

export default billingService;

