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
 * Build transaction to create a patient profile (Flow 1: Onboarding)
 * Maps to: health_platform::create_patient_profile
 */
export function buildCreatePatientProfileTx(
  name: string,
  age: number,
  bloodType: string,
  encryptedDataReference: string
) {
  return {
    target: `${SELORA_CONFIG.PACKAGE_ID}::health_platform::create_patient_profile`,
    arguments: [SELORA_CONFIG.REGISTRY_ID, name, age, bloodType, encryptedDataReference],
  };
}

// Legacy alias for avatar minting
export function buildMintAvatarTx(name: string, bloodType: string) {
  return buildCreatePatientProfileTx(name, 0, bloodType, '');
}

/**
 * Build transaction to upload self-reported record (OCR scanned)
 */
export function buildUploadSelfReportedRecordTx(
  recordType: string,
  ocrExtractedText: string,
  originalImageRef: string,
  tags: string
) {
  return {
    target: `${SELORA_CONFIG.PACKAGE_ID}::health_platform::upload_self_reported_record`,
    arguments: [recordType, ocrExtractedText, originalImageRef, tags],
  };
}

/**
 * Build transaction to sync IoT health data
 */
export function buildSyncIoTHealthDataTx(
  dataSource: string,
  dataType: string,
  value: string,
  unit: string,
  recordedAt: number,
  encryptedRawDataRef: string
) {
  return {
    target: `${SELORA_CONFIG.PACKAGE_ID}::health_platform::sync_iot_health_data`,
    arguments: [dataSource, dataType, value, unit, recordedAt, encryptedRawDataRef],
  };
}

// ==================== Access Control Functions (Flow 2) ====================

/**
 * Build transaction to grant temporary access to a medical record
 * Maps to: health_platform::grant_temporary_access
 * duration_type: ACCESS_ONE_TIME (3600000ms), ACCESS_24_HOURS, ACCESS_7_DAYS, ACCESS_30_DAYS
 */
export function buildGrantAccessTx(
  recordId: string,
  doctorAddress: string,
  durationType: number,
  accessType: string = 'general'
) {
  return {
    target: `${SELORA_CONFIG.PACKAGE_ID}::health_platform::grant_temporary_access`,
    arguments: [recordId, doctorAddress, accessType, durationType],
  };
}

/**
 * Build transaction to revoke doctor access
 * Maps to: health_platform::revoke_doctor_access
 */
export function buildRevokeAccessTx(recordId: string, doctorAddress: string) {
  return {
    target: `${SELORA_CONFIG.PACKAGE_ID}::health_platform::revoke_doctor_access`,
    arguments: [recordId, doctorAddress],
  };
}

/**
 * Build transaction to verify if doctor has access
 */
export function buildVerifyDoctorAccessTx(recordId: string, doctorAddress: string) {
  return {
    target: `${SELORA_CONFIG.PACKAGE_ID}::health_platform::verify_doctor_access`,
    arguments: [recordId, doctorAddress],
  };
}

// ==================== Doctor Functions ====================

/**
 * Build transaction to register a doctor profile
 * Maps to: health_platform::register_doctor
 */
export function buildRegisterDoctorTx(
  name: string,
  licenseNumber: string,
  specialty: string
) {
  return {
    target: `${SELORA_CONFIG.PACKAGE_ID}::health_platform::register_doctor`,
    arguments: [SELORA_CONFIG.REGISTRY_ID, name, licenseNumber, specialty],
  };
}

/**
 * Build transaction to subscribe doctor to a tier
 * Maps to: health_platform::subscribe_doctor
 * tier: 1 = Pro (2 SUI), 2 = Enterprise (10 SUI)
 */
export function buildDoctorSubscribeTx(doctorProfileId: string, tier: number, paymentCoin: string) {
  return {
    target: `${SELORA_CONFIG.PACKAGE_ID}::health_platform::subscribe_doctor`,
    arguments: [SELORA_CONFIG.REGISTRY_ID, doctorProfileId, tier, paymentCoin],
  };
}

/**
 * Build transaction to create a visit report (Provider-to-Patient Flow)
 * Maps to: health_platform::create_visit_report
 */
export function buildCreateVisitReportTx(
  patientAddress: string,
  diagnosis: string,
  prescriptionDetails: string,
  notes: string,
  encryptedFullReportRef: string,
  reportType: string
) {
  return {
    target: `${SELORA_CONFIG.PACKAGE_ID}::health_platform::create_visit_report`,
    arguments: [patientAddress, diagnosis, prescriptionDetails, notes, encryptedFullReportRef, reportType],
  };
}

// ==================== Prescription Functions (Flow 3) ====================

/**
 * Build transaction to create a prescription
 * Maps to: health_platform::create_prescription
 */
export function buildCreatePrescriptionTx(
  patientAddress: string,
  pharmacyAddress: string,
  medicationDetails: string,
  encryptedPrescriptionRef: string
) {
  return {
    target: `${SELORA_CONFIG.PACKAGE_ID}::health_platform::create_prescription`,
    arguments: [
      SELORA_CONFIG.REGISTRY_ID,
      patientAddress,
      pharmacyAddress,
      medicationDetails,
      encryptedPrescriptionRef,
    ],
  };
}

/**
 * Build transaction to set prescription price (pharmacy)
 */
export function buildSetPrescriptionPriceTx(prescriptionId: string, priceInMist: number) {
  return {
    target: `${SELORA_CONFIG.PACKAGE_ID}::health_platform::set_prescription_price`,
    arguments: [prescriptionId, priceInMist],
  };
}

/**
 * Build transaction to pay for a prescription (self-pay)
 * Maps to: health_platform::pay_prescription_self_pay
 * Applies 0.5% platform fee automatically
 */
export function buildPayPrescriptionSelfPayTx(prescriptionId: string, paymentCoin: string) {
  return {
    target: `${SELORA_CONFIG.PACKAGE_ID}::health_platform::pay_prescription_self_pay`,
    arguments: [SELORA_CONFIG.REGISTRY_ID, prescriptionId, paymentCoin],
  };
}

/**
 * Build transaction to pay for a prescription with insurance
 * Maps to: health_platform::pay_prescription_with_insurance
 */
export function buildPayPrescriptionWithInsuranceTx(
  prescriptionId: string,
  insuranceNftId: string,
  patientPaymentCoin: string
) {
  return {
    target: `${SELORA_CONFIG.PACKAGE_ID}::health_platform::pay_prescription_with_insurance`,
    arguments: [SELORA_CONFIG.REGISTRY_ID, prescriptionId, insuranceNftId, patientPaymentCoin],
  };
}

/**
 * Build transaction to fulfill a prescription (pharmacy)
 * Maps to: health_platform::fulfill_prescription
 */
export function buildFulfillPrescriptionTx(prescriptionId: string) {
  return {
    target: `${SELORA_CONFIG.PACKAGE_ID}::health_platform::fulfill_prescription`,
    arguments: [prescriptionId],
  };
}

/**
 * Build transaction to purchase micro-insurance
 */
export function buildPurchaseMicroInsuranceTx(
  insurerAddress: string,
  coveragePercentage: number,
  coverageLimit: number,
  durationDays: number,
  premiumCoin: string
) {
  return {
    target: `${SELORA_CONFIG.PACKAGE_ID}::health_platform::purchase_micro_insurance`,
    arguments: [insurerAddress, coveragePercentage, coverageLimit, durationDays, premiumCoin],
  };
}

// ==================== Research Functions (Flow 4) ====================

/**
 * Build transaction to create a research data request
 * Maps to: health_platform::create_research_request
 */
export function buildCreateResearchRequestTx(
  title: string,
  criteria: string,
  rewardPerPatient: number,
  maxParticipants: number,
  durationDays: number,
  fundingCoin: string
) {
  return {
    target: `${SELORA_CONFIG.PACKAGE_ID}::health_platform::create_research_request`,
    arguments: [
      SELORA_CONFIG.REGISTRY_ID,
      title,
      criteria,
      rewardPerPatient,
      maxParticipants,
      durationDays,
      fundingCoin,
    ],
  };
}

/**
 * Build transaction to consent to research (patient)
 * Maps to: health_platform::consent_to_research
 * Platform takes 1% commission, patient gets 99%
 */
export function buildConsentToResearchTx(requestId: string, anonymizedDataRef: string) {
  return {
    target: `${SELORA_CONFIG.PACKAGE_ID}::health_platform::consent_to_research`,
    arguments: [SELORA_CONFIG.REGISTRY_ID, requestId, anonymizedDataRef],
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
