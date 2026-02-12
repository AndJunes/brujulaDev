import {
  DeploySingleReleaseEscrowPayload,
  FundEscrowPayload,
  UpdateSingleReleaseEscrowPayload,
  SingleReleaseReleaseFundsPayload,
  ApproveMilestonePayload,
  ChangeMilestoneStatusPayload,
  SingleReleaseStartDisputePayload,
  SingleReleaseResolveDisputePayload,
  GetEscrowsFromIndexerByRoleParams,
  GetEscrowFromIndexerByContractIdsParams,
  GetEscrowsFromIndexerBySignerParams,
  GetBalanceParams,
  UpdateFromTxHashPayload,
  SendTransactionPayload,
} from './types';

interface TrustlessWorkConfig {
  apiUrl: string;
  apiKey: string;
}

export class TrustlessWorkClient {
  private apiUrl: string;
  private apiKey: string;

  constructor(config: TrustlessWorkConfig) {
    this.apiUrl = config.apiUrl;
    this.apiKey = config.apiKey;
  }

  private async request(endpoint: string, options?: RequestInit) {
    const url = `${this.apiUrl}${endpoint}`;
    console.log(`[v0] Trustless Work: ${options?.method || 'GET'} ${url}`);

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      console.log(`[v0] Trustless Work error response: ${response.status} - ${error}`);
      throw new Error(`Trustless Work API error (${response.status}): ${error}`);
    }

    return response.json();
  }

  // ============ DEPLOYER ============

  async deploySingleReleaseEscrow(params: DeploySingleReleaseEscrowPayload) {
    const response = await this.request('/deployer/single-release', {
      method: 'POST',
      body: JSON.stringify(params),
    });

    console.log('[v0] deploySingleReleaseEscrow response:', JSON.stringify(response, null, 2));

    if (!response.unsignedTransaction) {
      throw new Error(`Trustless Work missing unsignedTransaction: ${JSON.stringify(response)}`);
    }

    return {
      unsignedXdr: response.unsignedTransaction,
      status: response.status
    };
  }

  // ============ SINGLE RELEASE ESCROW ============

  async fundEscrow(params: FundEscrowPayload) {
    return this.request('/escrow/single-release/fund-escrow', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async updateSingleReleaseEscrow(params: UpdateSingleReleaseEscrowPayload) {
    return this.request('/escrow/single-release/update-escrow', {
      method: 'PUT',
      body: JSON.stringify(params),
    });
  }

  async releaseFundsSingleRelease(params: SingleReleaseReleaseFundsPayload) {
    return this.request('/escrow/single-release/release-funds', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // ============ MILESTONE ============

  async approveMilestone(params: ApproveMilestonePayload) {
    return this.request('/escrow/single-release/approve-milestone', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async changeMilestoneStatus(params: ChangeMilestoneStatusPayload) {
    return this.request('/escrow/single-release/change-milestone-status', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // ============ DISPUTE ============

  async startDisputeSingleRelease(params: SingleReleaseStartDisputePayload) {
    return this.request('/escrow/single-release/dispute-escrow', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async resolveDisputeSingleRelease(params: SingleReleaseResolveDisputePayload) {
    return this.request('/escrow/single-release/resolve-dispute', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // ============ TRANSACTION ============

  async sendTransaction(params: SendTransactionPayload) {
    const response = await this.request('/helper/send-transaction', {
      method: 'POST',
      body: JSON.stringify(params),
    });

    console.log('[v0] sendTransaction response:', JSON.stringify(response, null, 2));
    return response;
  }

  // ============ HELPER / INDEXER ============

  async getEscrowsByRole(params: GetEscrowsFromIndexerByRoleParams) {
    const queryParams = new URLSearchParams();
    queryParams.append('role', params.role);
    queryParams.append('roleAddress', params.roleAddress);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.orderDirection) queryParams.append('orderDirection', params.orderDirection);
    if (params.orderBy) queryParams.append('orderBy', params.orderBy);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.maxAmount) queryParams.append('maxAmount', params.maxAmount.toString());
    if (params.minAmount) queryParams.append('minAmount', params.minAmount.toString());
    if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    if (params.title) queryParams.append('title', params.title);
    if (params.engagementId) queryParams.append('engagementId', params.engagementId);
    if (params.status) queryParams.append('status', params.status);
    if (params.type) queryParams.append('type', params.type);
    if (params.validateOnChain !== undefined) queryParams.append('validateOnChain', params.validateOnChain.toString());

    return this.request(`/helper/get-escrows-by-role?${queryParams}`, {
      method: 'GET',
    });
  }

  async getEscrowsBySigner(params: GetEscrowsFromIndexerBySignerParams) {
    const queryParams = new URLSearchParams();
    queryParams.append('signer', params.signer);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.orderDirection) queryParams.append('orderDirection', params.orderDirection);
    if (params.orderBy) queryParams.append('orderBy', params.orderBy);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.maxAmount) queryParams.append('maxAmount', params.maxAmount.toString());
    if (params.minAmount) queryParams.append('minAmount', params.minAmount.toString());
    if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    if (params.title) queryParams.append('title', params.title);
    if (params.engagementId) queryParams.append('engagementId', params.engagementId);
    if (params.status) queryParams.append('status', params.status);
    if (params.type) queryParams.append('type', params.type);
    if (params.validateOnChain !== undefined) queryParams.append('validateOnChain', params.validateOnChain.toString());

    return this.request(`/helper/get-escrows-by-signer?${queryParams}`, {
      method: 'GET',
    });
  }

  async getEscrowsByContractIds(params: GetEscrowFromIndexerByContractIdsParams) {
    const queryParams = new URLSearchParams();
    params.contractIds.forEach((id: string) => {
      queryParams.append('contractIds[]', id);
    });
    if (params.validateOnChain !== undefined) {
      queryParams.append('validateOnChain', params.validateOnChain.toString());
    }

    return this.request(`/helper/get-escrow-by-contract-ids?${queryParams}`, {
      method: 'GET',
    });
  }

  async getMultipleEscrowBalance(params: GetBalanceParams) {
    const queryParams = new URLSearchParams();
    params.addresses.forEach((address: string) => {
      queryParams.append('addresses[]', address);
    });

    return this.request(`/helper/get-multiple-escrow-balance?${queryParams}`, {
      method: 'GET',
    });
  }

  // ============ INDEXER ============

  async updateFromTxHash(params: UpdateFromTxHashPayload) {
    return this.request('/indexer/update-from-txhash', {
      method: 'PUT',
      body: JSON.stringify(params),
    });
  }

  // ============ USERS ============

  async createUser(params: { name: string; email: string; stellarAddress: string }) {
    return this.request('/user/create', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async getUser(id: string) {
    return this.request(`/user/${id}`, {
      method: 'GET',
    });
  }
}

// Singleton
let client: TrustlessWorkClient | null = null;

export function getTrustlessWorkClient() {
  if (!client) {
    const apiUrl = process.env.TRUSTLESS_WORK_API_URL;
    const apiKey = process.env.TRUSTLESS_WORK_API_KEY;

    if (!apiUrl || !apiKey) {
      throw new Error('Faltan TRUSTLESS_WORK_API_URL y/o TRUSTLESS_WORK_API_KEY en variables de entorno');
    }

    const baseUrl = apiUrl.replace(/\/$/, '');
    client = new TrustlessWorkClient({
      apiUrl: baseUrl,
      apiKey: apiKey.trim(),
    });
  }
  return client;
}
