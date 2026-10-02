// BINARY FROSTER ZERO-DEPENDENCY SERVERLESS DATABASE CLIENT
// Architecture: Supabase PostgREST over HTTPS via native Node.js fetch
// Fallback: Graceful in-memory state preservation when credentials are unset or cold
// Strictly zero emojis.

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const isConfigured = Boolean(
  SUPABASE_URL && 
  SUPABASE_KEY && 
  !SUPABASE_URL.includes('placeholder') && 
  !SUPABASE_KEY.includes('placeholder')
);

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Prefer': 'return=representation'
  };
}

async function select(table, query = '') {
  if (!isConfigured) return { data: null, error: 'SUPABASE_NOT_CONFIGURED', fallback: true };
  try {
    const url = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/${table}${query ? '?' + query : ''}`;
    const res = await fetch(url, { method: 'GET', headers: getHeaders() });
    if (!res.ok) {
      const errText = await res.text();
      return { data: null, error: errText, status: res.status, fallback: true };
    }
    const data = await res.json();
    return { data, error: null, fallback: false };
  } catch (err) {
    return { data: null, error: err.message, fallback: true };
  }
}

async function insert(table, records) {
  if (!isConfigured) return { data: null, error: 'SUPABASE_NOT_CONFIGURED', fallback: true };
  try {
    const url = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/${table}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(records)
    });
    if (!res.ok) {
      const errText = await res.text();
      return { data: null, error: errText, status: res.status, fallback: true };
    }
    const data = await res.json();
    return { data, error: null, fallback: false };
  } catch (err) {
    return { data: null, error: err.message, fallback: true };
  }
}

async function update(table, matchKey, matchVal, payload) {
  if (!isConfigured) return { data: null, error: 'SUPABASE_NOT_CONFIGURED', fallback: true };
  try {
    const url = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/${table}?${encodeURIComponent(matchKey)}=eq.${encodeURIComponent(matchVal)}`;
    const res = await fetch(url, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const errText = await res.text();
      return { data: null, error: errText, status: res.status, fallback: true };
    }
    const data = await res.json();
    return { data, error: null, fallback: false };
  } catch (err) {
    return { data: null, error: err.message, fallback: true };
  }
}

async function remove(table, matchKey, matchVal) {
  if (!isConfigured) return { data: null, error: 'SUPABASE_NOT_CONFIGURED', fallback: true };
  try {
    const url = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/${table}?${encodeURIComponent(matchKey)}=eq.${encodeURIComponent(matchVal)}`;
    const res = await fetch(url, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) {
      const errText = await res.text();
      return { data: null, error: errText, status: res.status, fallback: true };
    }
    return { success: true, error: null, fallback: false };
  } catch (err) {
    return { success: false, error: err.message, fallback: true };
  }
}

module.exports = {
  isConfigured,
  select,
  insert,
  update,
  remove
};
