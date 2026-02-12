// src/lib/trustlesswork/client.ts
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
    console.log(`🌐 Trustless Work: ${options?.method || 'GET'} ${url}`);

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Trustless Work API error (${response.status}): ${error}`);
    }

    return response.json();
  }

  // ============ DEPLOYER - SINGLE RELEASE ============

  /**
   * Despliega un nuevo escrow de liberación única
   * POST /deployer/single-release
   * 
   * Devuelve: { status: "SUCCESS", unsignedTransaction: string }
   */
  async deploySingleReleaseEscrow(params: DeploySingleReleaseEscrowPayload) {
    const response = await this.request('/deployer/single-release', {
      method: 'POST',
      body: JSON.stringify(params),
    });

    console.log('📦 Respuesta deploySingleReleaseEscrow:', JSON.stringify(response, null, 2));

    if (!response.unsignedTransaction) {
      throw new Error(`Trustless Work respondió pero falta unsignedTransaction: ${JSON.stringify(response)}`);
    }

    return {
      unsignedXdr: response.unsignedTransaction,
      status: response.status
    };
  }

  // ============ ESCROW ============

  /**
   * ⚠️ DEPRECATED - Usar deploySingleReleaseEscrow en su lugar
   * Este endpoint ya no existe en la API
   */
  async initializeSingleReleaseEscrow(_params: never) {
    throw new Error('❌ initializeSingleReleaseEscrow está DEPRECATED. Usa deploySingleReleaseEscrow en su lugar.');
  }

  /**
   * Fondea un escrow existente
   * POST /escrow/fund
   */
  async fundEscrow(params: FundEscrowPayload) {
    return this.request('/escrow/fund', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  /**
   * Actualiza un escrow de liberación única
   * PUT /escrow/update/single-release
   */
  async updateSingleReleaseEscrow(params: UpdateSingleReleaseEscrowPayload) {
    return this.request('/escrow/update/single-release', {
      method: 'PUT',
      body: JSON.stringify(params),
    });
  }

  /**
   * Libera fondos de un escrow de liberación única
   * POST /escrow/release-funds/single-release
   */
  async releaseFundsSingleRelease(params: SingleReleaseReleaseFundsPayload) {
    return this.request('/escrow/release-funds/single-release', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // ============ MILESTONE ============

  /**
   * Aprueba un hito
   * POST /milestone/approve
   */
  async approveMilestone(params: ApproveMilestonePayload) {
    return this.request('/milestone/approve', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  /**
   * Cambia el estado de un hito
   * POST /milestone/change-status
   */
  async changeMilestoneStatus(params: ChangeMilestoneStatusPayload) {
    return this.request('/milestone/change-status', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // ============ DISPUTE ============

  /**
   * Inicia una disputa en un escrow de liberación única
   * POST /dispute/start
   */
  async startDisputeSingleRelease(params: SingleReleaseStartDisputePayload) {
    return this.request('/dispute/start', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  /**
   * Resuelve una disputa en un escrow de liberación única
   * POST /dispute/resolve
   */
  async resolveDisputeSingleRelease(params: SingleReleaseResolveDisputePayload) {
    return this.request('/dispute/resolve', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // ============ TRANSACTION ============

  /**
   * Envía una transacción firmada a Stellar
   * POST /transaction/send
   * 
   * Devuelve: { contractId: string, status: string, ... }
   */
  async sendTransaction(params: SendTransactionPayload) {
    const response = await this.request('/transaction/send', {
      method: 'POST',
      body: JSON.stringify(params),
    });

    console.log('📦 Respuesta sendTransaction:', JSON.stringify(response, null, 2));

    if (!response.contractId) {
      throw new Error(`Trustless Work respondió pero falta contractId: ${JSON.stringify(response)}`);
    }

    return response;
  }

  // ============ INDEXER ============

  /**
   * Obtiene escrows por rol
   * GET /escrow/indexer/role?role=...&roleAddress=...
   */
  async getEscrowsByRole(params: GetEscrowsFromIndexerByRoleParams) {
    const queryParams = new URLSearchParams();
    
    // Parámetros obligatorios
    queryParams.append('role', params.role);
    queryParams.append('roleAddress', params.roleAddress);
    
    // Parámetros opcionales
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

    return this.request(`/escrow/indexer/role?${queryParams}`, {
      method: 'GET',
    });
  }

  /**
   * Obtiene escrows por signer
   * GET /escrow/indexer/signer?signer=...
   */
  async getEscrowsBySigner(params: GetEscrowsFromIndexerBySignerParams) {
    const queryParams = new URLSearchParams();
    
    // Parámetro obligatorio
    queryParams.append('signer', params.signer);
    
    // Parámetros opcionales
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

    return this.request(`/escrow/indexer/signer?${queryParams}`, {
      method: 'GET',
    });
  }

  /**
   * Obtiene escrows por IDs de contrato
   * GET /escrow/indexer/contract-ids?contractIds[]=...
   */
  async getEscrowsByContractIds(params: GetEscrowFromIndexerByContractIdsParams) {
    const queryParams = new URLSearchParams();
    
    params.contractIds.forEach((id: string) => {
      queryParams.append('contractIds[]', id);
    });
    
    if (params.validateOnChain !== undefined) {
      queryParams.append('validateOnChain', params.validateOnChain.toString());
    }

    return this.request(`/escrow/indexer/contract-ids?${queryParams}`, {
      method: 'GET',
    });
  }

  /**
   * Obtiene el balance de múltiples escrows
   * GET /escrow/balance?addresses[]=...
   */
  async getMultipleEscrowBalance(params: GetBalanceParams) {
    const queryParams = new URLSearchParams();
    
    params.addresses.forEach((address: string) => {
      queryParams.append('addresses[]', address);
    });

    return this.request(`/escrow/balance?${queryParams}`, {
      method: 'GET',
    });
  }

  // ============ UTILS ============

  /**
   * Actualiza datos del escrow desde un hash de transacción
   * POST /escrow/update-from-tx-hash
   */
  async updateFromTxHash(params: UpdateFromTxHashPayload) {
    return this.request('/escrow/update-from-tx-hash', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // ============ USERS (OPCIONAL, SI LOS NECESITAS) ============

  /**
   * Crea un usuario
   * POST /users/create-user
   */
  async createUser(params: { name: string; email: string; stellarAddress: string }) {
    return this.request('/users/create-user', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  /**
   * Obtiene un usuario por ID
   * GET /users/get-user?id=...
   */
  async getUser(id: string) {
    return this.request(`/users/get-user?id=${id}`, {
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
      throw new Error('❌ Faltan TRUSTLESS_WORK_API_URL y TRUSTLESS_WORK_API_KEY en .env.local');
    }

    const baseUrl = apiUrl.replace(/\/$/, '');
    client = new TrustlessWorkClient({
      apiUrl: baseUrl,
      apiKey: apiKey.trim(),
    });
  }
  return client;
}