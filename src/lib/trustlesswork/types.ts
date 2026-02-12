// src/lib/trustlesswork/types.ts

// ============ TIPOS BÁSICOS ============

export type baseURL = "https://api.trustlesswork.com" | "https://dev.api.trustlesswork.com";
export type EscrowType = "single-release" | "multi-release";
export type HttpMethod = "get" | "post" | "put" | "delete";
export type Status = "SUCCESS" | "FAILED";

export type Date = {
  _seconds: number;
  _nanoseconds: number;
};

// ============ TRUSTLINE ============

export type Trustline = {
  symbol: string;
  address: string;
};

// ============ FLAGS ============

export type Flags = {
  disputed?: boolean;
  released?: boolean;
  resolved?: boolean;
  approved?: boolean;
};

// ============ ROLES ============

export type Roles = {
  approver: string;
  serviceProvider: string;
  platformAddress: string;
  releaseSigner: string;
  disputeResolver: string;
  receiver: string;
};

export type Role =
  | "approver"
  | "serviceProvider"
  | "platformAddress"
  | "releaseSigner"
  | "disputeResolver"
  | "receiver"
  | "signer";

// ============ MILESTONES ============

export type BaseMilestone = {
  description: string;
  status?: string;
  evidence?: string;
};

export type SingleReleaseMilestone = BaseMilestone & {
  approved?: boolean;
};

export type MultiReleaseMilestone = BaseMilestone & {
  amount: number;
  receiver: string;
  flags?: Flags;
};

// ============ ESCROW ============

export type SingleReleaseEscrow = {
  signer: string;
  contractId: string;
  engagementId: string;
  title: string;
  roles: Roles;
  description: string;
  amount: number;
  platformFee: number;
  balance: number;
  milestones: SingleReleaseMilestone[];
  flags?: Flags;
  trustline: Trustline;
};

export type MultiReleaseEscrow = Omit<
  SingleReleaseEscrow,
  "milestones" | "flags" | "amount" | "roles"
> & {
  milestones: MultiReleaseMilestone[];
  roles: Omit<Roles, "receiver">;
};

// ============ PAYLOADS ============

export type SingleReleaseMilestonePayload = {
  description: string;
};

export type MultiReleaseMilestonePayload = {
  description: string;
  amount: number;
  receiver: string;
};

/**
 * @deprecated Usar DeploySingleReleaseEscrowPayload en su lugar
 * Este endpoint ya no existe en la API v2
 */
export type InitializeSingleReleaseEscrowPayload = Omit<
  SingleReleaseEscrow,
  "contractId" | "balance" | "milestones"
> & {
  milestones: SingleReleaseMilestonePayload[];
};

export type InitializeMultiReleaseEscrowPayload = Omit<
  MultiReleaseEscrow,
  "contractId" | "balance" | "milestones"
> & {
  milestones: MultiReleaseMilestonePayload[];
};

// ============ NUEVOS TIPOS PARA DEPLOYER ============

/**
 * Payload para desplegar un nuevo escrow de liberación única
 * POST /deployer/single-release
 */
export type DeploySingleReleaseEscrowPayload = {
  signer: string;
  engagementId: string;
  title: string;
  description: string;
  roles: Roles;
  amount: number;
  platformFee: number;
  milestones: SingleReleaseMilestonePayload[];
  trustline: Trustline;
};

/**
 * Respuesta del endpoint /deployer/single-release
 */
export type DeploySingleReleaseEscrowResponse = {
  status: "SUCCESS";
  unsignedTransaction: string;
};

// ============ TRANSACTION ============

/**
 * Payload para enviar una transacción firmada
 * POST /transaction/send
 */
export type SendTransactionPayload = {
  signedXdr: string;
};

/**
 * Respuesta del endpoint /transaction/send
 */
export type SendTransactionResponse = {
  contractId: string;
  status: string;
  transactionHash?: string;
  [key: string]: any;
};

// ============ ENDPOINTS EXISTENTES ============

export type UpdateSingleReleaseEscrowPayload = {
  contractId: string;
  escrow: Omit<SingleReleaseEscrow, "contractId" | "signer" | "balance"> & {
    isActive?: boolean;
  };
  signer: string;
};

export type FundEscrowPayload = {
  amount: number;
  contractId: string;
  signer: string;
};

export type ChangeMilestoneStatusPayload = {
  contractId: string;
  milestoneIndex: string;
  newStatus: string;
  newEvidence?: string;
  serviceProvider: string;
};

export type ApproveMilestonePayload = Omit<
  ChangeMilestoneStatusPayload,
  "serviceProvider" | "newStatus"
> & {
  approver: string;
};

export type SingleReleaseStartDisputePayload = {
  contractId: string;
  signer: string;
};

export type MultiReleaseStartDisputePayload = SingleReleaseStartDisputePayload & {
  milestoneIndex: string;
};

export type SingleReleaseReleaseFundsPayload = {
  contractId: string;
  releaseSigner: string;
};

export type MultiReleaseReleaseFundsPayload = SingleReleaseReleaseFundsPayload & {
  milestoneIndex: string;
};

export type SingleReleaseResolveDisputePayload = {
  contractId: string;
  disputeResolver: string;
  distributions: Array<{
    address: string;
    amount: number;
  }>;
};

export type MultiReleaseResolveDisputePayload = SingleReleaseResolveDisputePayload & {
  milestoneIndex: string;
};

export type WithdrawRemainingFundsPayload = SingleReleaseResolveDisputePayload;

export type GetBalanceParams = {
  addresses: string[];
};

export type UpdateFromTxHashPayload = {
  txHash: string;
};

// ============ INDEXER PARAMS ============

export type SingleReleaseEscrowStatus = 
  | "initialized" 
  | "funded" 
  | "completed" 
  | "disputed" 
  | "cancelled"
  | "deployed"; // Añadido estado deployed

export type GetEscrowsFromIndexerParams = {
  page?: number;
  orderDirection?: "asc" | "desc";
  orderBy?: "createdAt" | "updatedAt" | "amount";
  startDate?: string;
  endDate?: string;
  maxAmount?: number;
  minAmount?: number;
  isActive?: boolean;
  title?: string;
  engagementId?: string;
  status?: SingleReleaseEscrowStatus;
  type?: EscrowType;
  validateOnChain?: boolean;
};

export type GetEscrowsFromIndexerBySignerParams = GetEscrowsFromIndexerParams & {
  signer: string;
};

export type GetEscrowsFromIndexerByRoleParams = GetEscrowsFromIndexerParams & {
  role: Role;
  roleAddress: string;
};

export type GetEscrowFromIndexerByContractIdsParams = {
  contractIds: string[];
  validateOnChain?: boolean;
};