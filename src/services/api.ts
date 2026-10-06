import {
  User,
  InfrastructureAsset,
  AIAnalysisResult,
  WorkOrder,
  AuditLog,
  HealthScoreConfig,
  DashboardStatistics,
} from '../types';

const BASE_URL = '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('geoinfra_token') || 'token-usr-eng';
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to authenticate');
    }
    return res.json();
  },

  async getCurrentUser(): Promise<User> {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      throw new Error('Failed to retrieve user profile');
    }
    const data = await res.json();
    return data.user;
  },

  // Infrastructure
  async getInfrastructure(filters?: {
    type?: string;
    status?: string;
    priority?: string;
    search?: string;
  }): Promise<InfrastructureAsset[]> {
    const params = new URLSearchParams();
    if (filters?.type && filters.type !== 'ALL') params.append('type', filters.type);
    if (filters?.status && filters.status !== 'ALL') params.append('status', filters.status);
    if (filters?.priority && filters.priority !== 'ALL') params.append('priority', filters.priority);
    if (filters?.search) params.append('search', filters.search);

    const res = await fetch(`${BASE_URL}/infrastructure?${params.toString()}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load infrastructure list');
    const data = await res.json();
    return data.infrastructure;
  },

  async getInfrastructureById(id: string): Promise<{
    asset: InfrastructureAsset;
    analyses: AIAnalysisResult[];
    workOrders: WorkOrder[];
  }> {
    const res = await fetch(`${BASE_URL}/infrastructure/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch infrastructure detail');
    return res.json();
  },

  async createInfrastructure(asset: Partial<InfrastructureAsset>): Promise<InfrastructureAsset> {
    const res = await fetch(`${BASE_URL}/infrastructure`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(asset),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create infrastructure asset');
    }
    const data = await res.json();
    return data.asset;
  },

  async deleteInfrastructure(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/infrastructure/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to delete asset');
    }
  },

  // AI Deep Learning Defect Analysis
  async runDefectDetection(payload: {
    imageBase64?: string;
    imageUrl?: string;
    infrastructureId?: string;
    mode?: 'gemini' | 'mock';
    notes?: string;
    gpsLocation?: { lat: number; lng: number };
  }): Promise<AIAnalysisResult> {
    const res = await fetch(`${BASE_URL}/analysis/detect`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Defect detection failed');
    }
    const data = await res.json();
    return data.analysis;
  },

  async getAnalyses(): Promise<AIAnalysisResult[]> {
    const res = await fetch(`${BASE_URL}/analysis`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to retrieve inspection history');
    const data = await res.json();
    return data.analyses;
  },

  async getAnalysisById(id: string): Promise<AIAnalysisResult> {
    const res = await fetch(`${BASE_URL}/analysis/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load analysis record');
    const data = await res.json();
    return data.analysis;
  },

  // Work Orders
  async getWorkOrders(): Promise<WorkOrder[]> {
    const res = await fetch(`${BASE_URL}/work-orders`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to retrieve work orders');
    const data = await res.json();
    return data.workOrders;
  },

  async createWorkOrder(order: Partial<WorkOrder>): Promise<WorkOrder> {
    const res = await fetch(`${BASE_URL}/work-orders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(order),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create work order');
    }
    const data = await res.json();
    return data.workOrder;
  },

  async updateWorkOrderStatus(id: string, status: string): Promise<WorkOrder> {
    const res = await fetch(`${BASE_URL}/work-orders/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update work order status');
    const data = await res.json();
    return data.workOrder;
  },

  // Dashboard Stats
  async getDashboardStats(): Promise<DashboardStatistics> {
    const res = await fetch(`${BASE_URL}/dashboard/stats`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load dashboard statistics');
    const data = await res.json();
    return data.stats;
  },

  // Audit Logs
  async getAuditLogs(): Promise<AuditLog[]> {
    const res = await fetch(`${BASE_URL}/audit-logs`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to retrieve audit trail');
    const data = await res.json();
    return data.logs;
  },

  // Config
  async getHealthConfig(): Promise<HealthScoreConfig> {
    const res = await fetch(`${BASE_URL}/config/health-score`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load health configuration');
    const data = await res.json();
    return data.config;
  },

  async updateHealthConfig(config: HealthScoreConfig): Promise<HealthScoreConfig> {
    const res = await fetch(`${BASE_URL}/config/health-score`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(config),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update scoring configuration');
    }
    const data = await res.json();
    return data.config;
  },
};
