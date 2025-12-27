// Sui smart contract interactions
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

/**
 * Build transaction to mint a Selora Avatar
 */
export function buildMintAvatarTx() {
  return {
    target: `${SELORA_CONFIG.PACKAGE_ID}::avatar::mint`,
    arguments: [SELORA_CONFIG.REGISTRY_ID],
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
    arguments: [
      SELORA_CONFIG.REGISTRY_ID,
      blobId,
      recordType,
      encryptedMetadata,
    ],
  };
}

/**
 * Build transaction to grant access to a record
 */
export function buildGrantAccessTx(
  recordId: string,
  granteeAddress: string,
  expirationTimestamp: number
) {
  return {
    target: `${SELORA_CONFIG.PACKAGE_ID}::access::grant`,
    arguments: [recordId, granteeAddress, expirationTimestamp],
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
 * Build transaction to create a prescription
 */
export function buildCreatePrescriptionTx(
  patientAddress: string,
  encryptedPrescriptionBlobId: string,
  pharmacyAddress: string
) {
  return {
    target: `${SELORA_CONFIG.PACKAGE_ID}::prescriptions::create`,
    arguments: [
      SELORA_CONFIG.REGISTRY_ID,
      patientAddress,
      encryptedPrescriptionBlobId,
      pharmacyAddress,
    ],
  };
}

/**
 * Build transaction to pay for a prescription
 */
export function buildPayPrescriptionTx(
  prescriptionId: string,
  paymentCoin: string
) {
  return {
    target: `${SELORA_CONFIG.PACKAGE_ID}::prescriptions::pay`,
    arguments: [prescriptionId, paymentCoin],
  };
}

/**
 * Build transaction to fulfill a prescription
 */
export function buildFulfillPrescriptionTx(prescriptionId: string) {
  return {
    target: `${SELORA_CONFIG.PACKAGE_ID}::prescriptions::fulfill`,
    arguments: [prescriptionId],
  };
}
