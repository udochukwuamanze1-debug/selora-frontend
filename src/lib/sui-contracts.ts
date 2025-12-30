// Sui smart contract interactions for Selora Health Platform
import { SELORA_CONFIG } from '@/config/constants';

export interface AvatarData {
  objectId: string;
  name: string;
  description: string;
  createdAt: number;
}

export interface RecordReference {
  objectId: string;
  blobId: string;
  recordType: string;
  timestamp: number;
}

export interface DoctorProfile {
  objectId: string;
  walletAddress: string;
  fullName: string;
  specialty: string;
  licenseNumber: string;
  clinicName?: string;
  city: string;
  country: string;
  lat: number;
  lon: number;
  verified: boolean;
  subscriptionTier: number;
  subscriptionExpiry: number;
  stakeAmount: number;
}

export interface Prescription {
  objectId: string;
  doctorAddress: string;
  patientAddress: string;
  pharmacyAddress: string;
  blobId: string;
  status: 'pending' | 'paid' | 'fulfilled';
  amount: number;
  platformFee: number;
}

export interface AccessGrant {
  recordId: string;
  granteeAddress: string;
  grantorAddress: string;
  expirationTimestamp: number;
  accessType: 'view' | 'full';
}

// ==================== Patient Functions ====================

/**
 * Build transaction to mint a Selora Avatar/Patient Profile
 */
export function buildMintAvatarTx(name: string, bloodType: string) {
  return {
    target: `${SELORA_CONFIG.PACKAGE_ID}::patient::create_profile`,
    arguments: [SELORA_CONFIG.REGISTRY_ID, name, bloodType],
  };
}

/**
 * Build transaction to register a health record reference on-chain
 */
export function buildRegisterRecordTx(
  blobId: string,
  recordType: string,
  encryptedMetadata: string
) {
  return {
    target: `${SELORA_CONFIG.PACKAGE_ID}::records::register`,
    arguments: [SELORA_CONFIG.REGISTRY_ID, blobId, recordType, encryptedMetadata],
  };
}

// ==================== Access Control Functions ====================

/**
 * Build transaction to grant access to a record
 */
export function buildGrantAccessTx(
  recordId: string,
  granteeAddress: string,
  expirationTimestamp: number,
  accessType: 'view' | 'full' = 'view'
) {
  return {
    target: `${SELORA_CONFIG.PACKAGE_ID}::access::grant`,
    arguments: [recordId, granteeAddress, expirationTimestamp, accessType],
  };
}

/**
 * Build transaction to revoke access
 */
export function buildRevokeAccessTx(recordId: string, granteeAddress: string) {
  return {
    target: `${SELORA_CONFIG.PACKAGE_ID}::access::revoke`,
    arguments: [recordId, granteeAddress],
  };
}

/**
 * Build transaction to request access (doctor requesting from patient)
 */
export function buildRequestAccessTx(
  patientAddress: string,
  accessType: 'general' | 'full',
  requestMessage: string
) {
  return {
    target: `${SELORA_CONFIG.PACKAGE_ID}::access::request`,
    arguments: [SELORA_CONFIG.REGISTRY_ID, patientAddress, accessType, requestMessage],
  };
}

// ==================== Doctor Functions ====================

/**
 * Build transaction to register a doctor profile
 */
export function buildRegisterDoctorTx(
  fullName: string,
  specialty: string,
  licenseNumber: string,
  clinicName: string,
  city: string,
  country: string,
  lat: number,
  lon: number
) {
  return {
    target: `${SELORA_CONFIG.PACKAGE_ID}::doctor::register`,
    arguments: [
      SELORA_CONFIG.REGISTRY_ID,
      fullName,
      specialty,
      licenseNumber,
      clinicName,
      city,
      country,
      Math.floor(lat * 1000000), // Store as fixed-point
      Math.floor(lon * 1000000),
    ],
  };
}

/**
 * Build transaction to stake tokens for doctor verification
 */
export function buildDoctorStakeTx(stakeAmount: number) {
  return {
    target: `${SELORA_CONFIG.PACKAGE_ID}::doctor::stake_for_verification`,
    arguments: [SELORA_CONFIG.REGISTRY_ID, stakeAmount],
  };
}

/**
 * Build transaction to subscribe doctor to a tier
 */
export function buildDoctorSubscribeTx(tier: number, paymentCoin: string) {
  return {
    target: `${SELORA_CONFIG.PACKAGE_ID}::doctor::subscribe`,
    arguments: [SELORA_CONFIG.REGISTRY_ID, tier, paymentCoin],
  };
}

// ==================== Prescription Functions ====================

/**
 * Build transaction to create a prescription
 */
export function buildCreatePrescriptionTx(
  patientAddress: string,
  encryptedPrescriptionBlobId: string,
  pharmacyAddress: string
) {
  return {
    target: `${SELORA_CONFIG.PACKAGE_ID}::prescription::create`,
    arguments: [
      SELORA_CONFIG.REGISTRY_ID,
      patientAddress,
      encryptedPrescriptionBlobId,
      pharmacyAddress,
    ],
  };
}

/**
 * Build transaction to pay for a prescription (self-pay)
 * Applies 0.5% platform fee automatically
 */
export function buildPayPrescriptionSelfPayTx(
  prescriptionId: string,
  paymentCoin: string
) {
  return {
    target: `${SELORA_CONFIG.PACKAGE_ID}::prescription::pay_self`,
    arguments: [SELORA_CONFIG.REGISTRY_ID, prescriptionId, paymentCoin],
  };
}

/**
 * Build transaction to pay for a prescription with insurance
 */
export function buildPayPrescriptionWithInsuranceTx(
  prescriptionId: string,
  insurerPaymentCoin: string,
  patientPaymentCoin: string
) {
  return {
    target: `${SELORA_CONFIG.PACKAGE_ID}::prescription::pay_with_insurance`,
    arguments: [
      SELORA_CONFIG.REGISTRY_ID,
      prescriptionId,
      insurerPaymentCoin,
      patientPaymentCoin,
    ],
  };
}

/**
 * Build transaction to fulfill a prescription (pharmacy)
 */
export function buildFulfillPrescriptionTx(prescriptionId: string) {
  return {
    target: `${SELORA_CONFIG.PACKAGE_ID}::prescription::fulfill`,
    arguments: [prescriptionId],
  };
}

// ==================== Research Functions ====================

/**
 * Build transaction to create a research data request
 */
export function buildCreateResearchRequestTx(
  criteria: string,
  rewardPerPatient: number,
  totalBudget: number,
  paymentCoin: string
) {
  return {
    target: `${SELORA_CONFIG.PACKAGE_ID}::research::create_request`,
    arguments: [
      SELORA_CONFIG.REGISTRY_ID,
      criteria,
      rewardPerPatient,
      totalBudget,
      paymentCoin,
    ],
  };
}

/**
 * Build transaction to consent to research (patient)
 * Platform takes 1% commission, patient gets 99%
 */
export function buildConsentToResearchTx(researchRequestId: string) {
  return {
    target: `${SELORA_CONFIG.PACKAGE_ID}::research::consent`,
    arguments: [SELORA_CONFIG.REGISTRY_ID, researchRequestId],
  };
}

// ==================== Platform Admin Functions ====================

/**
 * Build transaction to withdraw platform fees (owner only)
 */
export function buildWithdrawFeesTx(amount: number) {
  return {
    target: `${SELORA_CONFIG.PACKAGE_ID}::platform::withdraw_fees`,
    arguments: [SELORA_CONFIG.REGISTRY_ID, amount],
  };
}

/**
 * Build transaction to verify a doctor (platform admin)
 */
export function buildVerifyDoctorTx(doctorAddress: string) {
  return {
    target: `${SELORA_CONFIG.PACKAGE_ID}::doctor::verify`,
    arguments: [SELORA_CONFIG.REGISTRY_ID, doctorAddress],
  };
}

/**
 * Build transaction to slash a doctor's stake (for misconduct)
 */
export function buildSlashDoctorStakeTx(doctorAddress: string, reason: string) {
  return {
    target: `${SELORA_CONFIG.PACKAGE_ID}::doctor::slash_stake`,
    arguments: [SELORA_CONFIG.REGISTRY_ID, doctorAddress, reason],
  };
}

// ==================== Utility Functions ====================

/**
 * Calculate prescription platform fee
 */
export function calculatePrescriptionFee(amountInMist: number): number {
  return Math.floor((amountInMist * SELORA_CONFIG.PRESCRIPTION_FEE_BPS) / 10000);
}

/**
 * Calculate research commission
 */
export function calculateResearchCommission(rewardInMist: number): number {
  return Math.floor((rewardInMist * SELORA_CONFIG.RESEARCH_COMMISSION_BPS) / 10000);
}

/**
 * Convert SUI to MIST (1 SUI = 1,000,000,000 MIST)
 */
export function suiToMist(sui: number): number {
  return Math.floor(sui * 1_000_000_000);
}

/**
 * Convert MIST to SUI
 */
export function mistToSui(mist: number): number {
  return mist / 1_000_000_000;
}
