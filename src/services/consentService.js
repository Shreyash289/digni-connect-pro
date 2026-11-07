import { supabase } from '../integrations/supabase/client';

export const CONSENT_VERSION = '2026-11-v1';

/**
 * Helper to identify missing tables or backend database schema.
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
    msg.includes('missing supabase environment variable')
  );
};

/**
 * Save consent choices to table "consent_records".
 * Always attaches CONSENT_VERSION.
 * Returns { data, error, unavailable }
 */
export const saveConsent = async (consentPayload = {}) => {
  try {
    const { data: authData, error: authErr } = await supabase.auth.getUser();
    const userId = authData?.user?.id || null;

    const payload = {
      user_id: userId,
      consent_version: CONSENT_VERSION,
      basic_processing: Boolean(consentPayload.basic_processing),
      share_profile: Boolean(consentPayload.share_profile),
      ai_processing: Boolean(consentPayload.ai_processing),
      billing_tax: Boolean(consentPayload.billing_tax),
      updates_reminders: Boolean(consentPayload.updates_reminders),
      recorded_at: new Date().toISOString()
    };

    if (!userId) {
      // Demo / unauthenticated mode: preserve choices locally without failing
      return { data: payload, error: null, unavailable: false };
    }

    const { data, error } = await supabase
      .from('consent_records')
      .upsert(payload)
      .select()
      .single();

    if (error) {
      const unavailable = isUnavailableError(error);
      return {
        data: null,
        error: unavailable ? null : 'Unable to store consent preference',
        unavailable
      };
    }

    return { data, error: null, unavailable: false };
  } catch (err) {
    const unavailable = isUnavailableError(err);
    return {
      data: null,
      error: unavailable ? null : 'Unable to store consent preference',
      unavailable
    };
  }
};

/**
 * Retrieve the latest saved consent record for the authenticated user.
 * Returns { data, error, unavailable }
 */
export const getConsent = async () => {
  try {
    const { data: authData, error: authErr } = await supabase.auth.getUser();
    if (authErr || !authData?.user) {
      return { data: null, error: null, unavailable: false };
    }

    const { data, error } = await supabase
      .from('consent_records')
      .select('*')
      .eq('user_id', authData.user.id)
      .order('recorded_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      const unavailable = isUnavailableError(error);
      return {
        data: null,
        error: unavailable ? null : 'Unable to load consent preferences',
        unavailable
      };
    }

    return { data, error: null, unavailable: false };
  } catch (err) {
    const unavailable = isUnavailableError(err);
    return {
      data: null,
      error: unavailable ? null : 'Unable to load consent preferences',
      unavailable
    };
  }
};

/**
 * Withdraw non-essential consent preferences.
 * Updates consent_records and marks withdrawn status.
 * Returns { data, error, unavailable }
 */
export const withdrawConsent = async () => {
  try {
    const { data: authData, error: authErr } = await supabase.auth.getUser();
    const userId = authData?.user?.id || null;

    const payload = {
      user_id: userId,
      consent_version: CONSENT_VERSION,
      share_profile: false,
      ai_processing: false,
      updates_reminders: false,
      withdrawn_at: new Date().toISOString()
    };

    if (!userId) {
      return { data: payload, error: null, unavailable: false };
    }

    const { data, error } = await supabase
      .from('consent_records')
      .upsert(payload)
      .select()
      .single();

    if (error) {
      const unavailable = isUnavailableError(error);
      return {
        data: null,
        error: unavailable ? null : 'Unable to process consent withdrawal',
        unavailable
      };
    }

    return { data, error: null, unavailable: false };
  } catch (err) {
    const unavailable = isUnavailableError(err);
    return {
      data: null,
      error: unavailable ? null : 'Unable to process consent withdrawal',
      unavailable
    };
  }
};

/**
 * Request an export of personal data.
 * Records request in table "data_requests".
 * Returns { data, error, unavailable }
 */
export const requestDataExport = async () => {
  try {
    const { data: authData, error: authErr } = await supabase.auth.getUser();
    if (authErr || !authData?.user) {
      return {
        data: null,
        error: 'Please sign in to submit a formal data export request',
        unavailable: false
      };
    }

    const { data, error } = await supabase
      .from('data_requests')
      .insert({
        user_id: authData.user.id,
        request_type: 'export',
        status: 'pending',
        requested_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      const unavailable = isUnavailableError(error);
      return {
        data: null,
        error: unavailable
          ? 'Data request processing is currently being configured.'
          : 'Unable to submit data request',
        unavailable
      };
    }

    return { data, error: null, unavailable: false };
  } catch (err) {
    const unavailable = isUnavailableError(err);
    return {
      data: null,
      error: unavailable
        ? 'Data request processing is currently being configured.'
        : 'Unable to submit data request',
      unavailable
    };
  }
};

/**
 * Request erasure of personal data under statutory data protection guidelines.
 * Records request in table "data_requests".
 * Returns { data, error, unavailable }
 */
export const requestErasure = async () => {
  try {
    const { data: authData, error: authErr } = await supabase.auth.getUser();
    if (authErr || !authData?.user) {
      return {
        data: null,
        error: 'Please sign in to submit a formal erasure request',
        unavailable: false
      };
    }

    const { data, error } = await supabase
      .from('data_requests')
      .insert({
        user_id: authData.user.id,
        request_type: 'erasure',
        status: 'pending',
        requested_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      const unavailable = isUnavailableError(error);
      return {
        data: null,
        error: unavailable
          ? 'Data request processing is currently being configured.'
          : 'Unable to submit erasure request',
        unavailable
      };
    }

    return { data, error: null, unavailable: false };
  } catch (err) {
    const unavailable = isUnavailableError(err);
    return {
      data: null,
      error: unavailable
        ? 'Data request processing is currently being configured.'
        : 'Unable to submit erasure request',
      unavailable
    };
  }
};

export const consentService = {
  CONSENT_VERSION,
  saveConsent,
  getConsent,
  withdrawConsent,
  requestDataExport,
  requestErasure
};

export default consentService;

