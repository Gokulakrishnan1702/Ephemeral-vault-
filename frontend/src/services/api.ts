/**
 * Ephemeral Secret Vault - Frontend API Client
 */

const API_BASE = '/api';

export interface SecretMetadata {
  id: string;
  secret_type: string;
  max_views: number;
  views_remaining: number;
  expires_at: number;
  created_at: number;
  has_passphrase?: boolean;
  status?: string;
}

export interface SecretCreatedResponse {
  id: string;
  view_url: string;
  public_url?: string;
  lan_url?: string;
  local_url?: string;
  expires_at: string;
  expires_at_ms: number;
  max_views: number;
  views_remaining: number;
  secret_type: string;
}

export interface BurnResult {
  id: string;
  secret: string;
  secret_type: string;
  views_remaining: number;
  max_views: number;
  status: 'destroyed' | 'active';
  burned_at: string;
}

export interface SecurityStats {
  total_created: number;
  active_secrets: number;
  expired_secrets: number;
  destroyed_secrets: number;
  total_reveals: number;
  blocked_crawlers: number;
  timestamp: string;
}

export interface ConcurrencyTestResult {
  test_name: string;
  secret_id: string;
  total_requests: number;
  successful_reads: number;
  rejected_reads: number;
  row_physically_deleted: boolean;
  passed: boolean;
  total_duration_ms: number;
  results: Array<{
    request_index: number;
    status: number;
    outcome: string;
    duration_ms: number;
    revealed: boolean;
  }>;
}

export interface TamperTestResult {
  test_name: string;
  secret_id: string;
  tampered_bytes: number;
  authentication_failed_cleanly: boolean;
  plain_text_leaked: boolean;
  error_message: string | null;
  passed: boolean;
}

export interface AuditTest {
  id: string;
  title: string;
  status: 'PASS' | 'FAIL';
  duration_ms: number;
  details: string;
}

export interface AuditReport {
  audit_status: 'PASSED' | 'FAILED';
  total_tests: number;
  passed_tests: number;
  failed_tests: number;
  execution_time_ms: number;
  timestamp: string;
  tests: AuditTest[];
}

export interface DbInspectorRow {
  id: string;
  secret_type: string;
  ciphertext_hex: string;
  iv_hex: string;
  auth_tag_hex: string;
  views_remaining: number;
  max_views: number;
  expires_at: string;
  created_at: string;
  plaintext_stored: string;
}

// In-memory token store (no persistent localStorage token storage)
let inMemoryToken: string | null = null;

export function getToken(): string | null {
  return inMemoryToken;
}

export function setToken(token: string): void {
  inMemoryToken = token;
}

export function removeToken(): void {
  inMemoryToken = null;
  try {
    localStorage.removeItem('vault_auth_token');
  } catch {}
}

// Remember Me: stores ONLY the email address for convenience, NEVER the password
export function getRememberedEmail(): string {
  try {
    return localStorage.getItem('vault_remembered_email') || '';
  } catch {
    return '';
  }
}

export function setRememberedEmail(email: string, remember: boolean): void {
  try {
    if (remember && email) {
      localStorage.setItem('vault_remembered_email', email.trim());
    } else {
      localStorage.removeItem('vault_remembered_email');
    }
  } catch {}
}

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Secrets API
  async createSecret(payload: {
    secret: string;
    ttl_seconds: number;
    max_views: number;
    secret_type: string;
    passphrase?: string;
  }): Promise<SecretCreatedResponse> {
    const res = await fetch(`${API_BASE}/secret`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create secret');
    }
    return res.json();
  },

  async getSecretMeta(id: string): Promise<SecretMetadata> {
    const res = await fetch(`${API_BASE}/secret/${id}/meta`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Secret not found, expired, or already destroyed');
    }
    return res.json();
  },

  async burnSecret(id: string, passphrase?: string): Promise<BurnResult> {
    const res = await fetch(`${API_BASE}/secret/${id}/burn`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passphrase }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to reveal and burn secret');
    }
    return res.json();
  },

  async listSecrets(): Promise<SecretMetadata[]> {
    const res = await fetch(`${API_BASE}/secrets`, {
      headers: getHeaders(),
    });
    if (!res.ok) {
      throw new Error('Failed to retrieve secrets');
    }
    const data = await res.json();
    return data.secrets || [];
  },

  async deleteSecret(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/secret/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to delete secret');
    }
  },

  // Security Tests
  async getSecurityStats(): Promise<SecurityStats> {
    const res = await fetch(`${API_BASE}/security/stats`);
    if (!res.ok) throw new Error('Failed to load security statistics');
    return res.json();
  },

  async runConcurrencyTest(): Promise<ConcurrencyTestResult> {
    const res = await fetch(`${API_BASE}/security/test/concurrency`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to execute concurrency test');
    return res.json();
  },

  async runTamperTest(): Promise<TamperTestResult> {
    const res = await fetch(`${API_BASE}/security/test/tamper`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to execute tamper test');
    return res.json();
  },

  async runSecurityAudit(): Promise<AuditReport> {
    const res = await fetch(`${API_BASE}/security/audit`);
    if (!res.ok) throw new Error('Failed to execute security audit');
    return res.json();
  },

  async getDbInspector(): Promise<{ records: DbInspectorRow[]; total_rows: number }> {
    const res = await fetch(`${API_BASE}/security/db-inspector`);
    if (!res.ok) throw new Error('Failed to inspect database');
    return res.json();
  },

  async getHealth(): Promise<{ status: string; database: string; encryption: string; sweeper: string }> {
    const res = await fetch('/health');
    if (!res.ok) throw new Error('Health check probe failed');
    return res.json();
  },

  // Auth
  async register(name: string, email: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create account');
    }
    const data = await res.json();
    if (data.token) {
      setToken(data.token);
    }
    return data;
  },

  async login(email: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Invalid email or password.');
    }
    const data = await res.json();
    if (data.token) {
      setToken(data.token);
    }
    return data;
  },

  async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: getHeaders(),
      });
    } catch {
      // Ignore network errors on logout
    }
    removeToken();
  },

  async getProfile() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      credentials: 'same-origin',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Unauthorized');
    return res.json();
  },
};
