import { useSignAndExecuteTransaction, useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { SELORA_CONFIG } from '@/config/constants';
import { toast } from 'sonner';

// Type assertion to handle version mismatch between @mysten/sui and @mysten/dapp-kit
type AnyTransaction = any;

export function useSuiTransaction() {
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const { mutateAsync: signAndExecute, isPending } = useSignAndExecuteTransaction();

  const uploadScannedRecord = async (
    recordType: string,
    ocrText: string,
    imageRef: string,
    tags: string
  ) => {
    if (!currentAccount) {
      toast.error('Please connect your wallet first');
      return null;
    }

    try {
      const tx = new Transaction();

      tx.moveCall({
        target: `${SELORA_CONFIG.PACKAGE_ID}::health_platform::upload_scanned_record`,
        arguments: [
          tx.pure.string(recordType),
          tx.pure.string(ocrText),
          tx.pure.string(imageRef),
          tx.pure.string(tags),
          tx.object('0x6'), // Clock object
        ],
      });

      const result = await signAndExecute({
        transaction: tx as AnyTransaction,
      });

      await suiClient.waitForTransaction({
        digest: result.digest,
      });

      toast.success('Record uploaded to blockchain!');
      return { digest: result.digest };
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload record');
      return null;
    }
  };

  const mintAvatar = async (name: string) => {
    if (!currentAccount) {
      toast.error('Please connect your wallet first');
      return null;
    }

    try {
      const tx = new Transaction();
      
      tx.moveCall({
        target: `${SELORA_CONFIG.PACKAGE_ID}::health_platform::create_patient_profile`,
        arguments: [
          tx.object(SELORA_CONFIG.REGISTRY_ID),
          tx.pure.string(name),
          tx.pure.u8(0), // age placeholder
          tx.pure.string(''), // blood type placeholder
          tx.pure.string(''), // encrypted data ref placeholder
          tx.object('0x6'), // Clock object
        ],
      });

      const result = await signAndExecute({
        transaction: tx as AnyTransaction,
      });

      // Wait for transaction to be confirmed
      const txResponse = await suiClient.waitForTransaction({
        digest: result.digest,
        options: { showEffects: true, showObjectChanges: true },
      });

      toast.success('Avatar minted successfully!');
      return {
        digest: result.digest,
        objectId: txResponse.objectChanges?.find(
          (change) => change.type === 'created'
        )?.objectId,
      };
    } catch (error: any) {
      console.error('Mint avatar error:', error);
      toast.error(error.message || 'Failed to mint avatar');
      return null;
    }
  };

  const createPrescription = async (
    patientAddress: string,
    pharmacyAddress: string,
    medicationDetails: string,
    blobId: string
  ) => {
    if (!currentAccount) {
      toast.error('Please connect your wallet first');
      return null;
    }

    try {
      const tx = new Transaction();

      tx.moveCall({
        target: `${SELORA_CONFIG.PACKAGE_ID}::health_platform::create_prescription`,
        arguments: [
          tx.object(SELORA_CONFIG.REGISTRY_ID),
          tx.pure.address(patientAddress),
          tx.pure.address(pharmacyAddress),
          tx.pure.string(medicationDetails),
          tx.pure.string(blobId),
          tx.object('0x6'), // Clock object
        ],
      });

      const result = await signAndExecute({
        transaction: tx as AnyTransaction,
      });

      const txResponse = await suiClient.waitForTransaction({
        digest: result.digest,
        options: { showObjectChanges: true },
      });

      toast.success('Prescription created on-chain!');
      return { 
        digest: result.digest,
        objectId: txResponse.objectChanges?.find(
          (change) => change.type === 'created'
        )?.objectId,
      };
    } catch (error: any) {
      console.error('Create prescription error:', error);
      toast.error(error.message || 'Failed to create prescription');
      return null;
    }
  };

  const payPrescription = async (prescriptionId: string, amountInMist: number) => {
    if (!currentAccount) {
      toast.error('Please connect your wallet first');
      return null;
    }

    try {
      const tx = new Transaction();

      // Split coins for payment
      const [paymentCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(amountInMist)]);

      tx.moveCall({
        target: `${SELORA_CONFIG.PACKAGE_ID}::health_platform::pay_prescription_self_pay`,
        arguments: [
          tx.object(SELORA_CONFIG.REGISTRY_ID),
          tx.object(prescriptionId),
          paymentCoin,
          tx.object('0x6'), // Clock object
        ],
      });

      const result = await signAndExecute({
        transaction: tx as AnyTransaction,
      });

      await suiClient.waitForTransaction({
        digest: result.digest,
      });

      toast.success('Payment successful!');
      return { digest: result.digest };
    } catch (error: any) {
      console.error('Pay prescription error:', error);
      toast.error(error.message || 'Failed to process payment');
      return null;
    }
  };

  const payPrescriptionWithInsurance = async (
    prescriptionId: string,
    insuranceNftId: string,
    patientPaymentInMist: number
  ) => {
    if (!currentAccount) {
      toast.error('Please connect your wallet first');
      return null;
    }

    try {
      const tx = new Transaction();

      // Split coins for patient portion
      const [paymentCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(patientPaymentInMist)]);

      tx.moveCall({
        target: `${SELORA_CONFIG.PACKAGE_ID}::health_platform::pay_prescription_with_insurance`,
        arguments: [
          tx.object(SELORA_CONFIG.REGISTRY_ID),
          tx.object(prescriptionId),
          tx.object(insuranceNftId),
          paymentCoin,
          tx.object('0x6'), // Clock object
        ],
      });

      const result = await signAndExecute({
        transaction: tx as AnyTransaction,
      });

      await suiClient.waitForTransaction({
        digest: result.digest,
      });

      toast.success('Insurance payment successful!');
      return { digest: result.digest };
    } catch (error: any) {
      console.error('Insurance payment error:', error);
      toast.error(error.message || 'Failed to process insurance payment');
      return null;
    }
  };

  const grantAccess = async (
    recordId: string,
    granteeAddress: string,
    durationType: number
  ) => {
    if (!currentAccount) {
      toast.error('Please connect your wallet first');
      return null;
    }

    try {
      const tx = new Transaction();

      tx.moveCall({
        target: `${SELORA_CONFIG.PACKAGE_ID}::health_platform::grant_temporary_access`,
        arguments: [
          tx.object(recordId),
          tx.pure.address(granteeAddress),
          tx.pure.string('general'),
          tx.pure.u64(durationType),
          tx.object('0x6'), // Clock object
        ],
      });

      const result = await signAndExecute({
        transaction: tx as AnyTransaction,
      });

      await suiClient.waitForTransaction({
        digest: result.digest,
      });

      toast.success('Access granted successfully!');
      return { digest: result.digest };
    } catch (error: any) {
      console.error('Grant access error:', error);
      toast.error(error.message || 'Failed to grant access');
      return null;
    }
  };

  const revokeAccess = async (recordId: string, granteeAddress: string) => {
    if (!currentAccount) {
      toast.error('Please connect your wallet first');
      return null;
    }

    try {
      const tx = new Transaction();

      tx.moveCall({
        target: `${SELORA_CONFIG.PACKAGE_ID}::health_platform::revoke_doctor_access`,
        arguments: [
          tx.object(recordId),
          tx.pure.address(granteeAddress),
          tx.object('0x6'), // Clock object
        ],
      });

      const result = await signAndExecute({
        transaction: tx as AnyTransaction,
      });

      await suiClient.waitForTransaction({
        digest: result.digest,
      });

      toast.success('Access revoked successfully!');
      return { digest: result.digest };
    } catch (error: any) {
      console.error('Revoke access error:', error);
      toast.error(error.message || 'Failed to revoke access');
      return null;
    }
  };

  // Create visit report (Doctor sends to Patient)
  const createVisitReport = async (
    patientAddress: string,
    diagnosis: string,
    prescriptionDetails: string,
    notes: string,
    encryptedReportBlobId: string,
    reportType: string
  ) => {
    if (!currentAccount) {
      toast.error('Please connect your wallet first');
      return null;
    }

    try {
      const tx = new Transaction();

      tx.moveCall({
        target: `${SELORA_CONFIG.PACKAGE_ID}::health_platform::create_visit_report`,
        arguments: [
          tx.pure.address(patientAddress),
          tx.pure.string(diagnosis),
          tx.pure.string(prescriptionDetails),
          tx.pure.string(notes),
          tx.pure.string(encryptedReportBlobId),
          tx.pure.string(reportType),
          tx.object('0x6'), // Clock object
        ],
      });

      const result = await signAndExecute({
        transaction: tx as AnyTransaction,
      });

      const txResponse = await suiClient.waitForTransaction({
        digest: result.digest,
        options: { showObjectChanges: true },
      });

      toast.success('Visit report created and sent to patient!');
      return { 
        digest: result.digest,
        objectId: txResponse.objectChanges?.find(
          (change) => change.type === 'created'
        )?.objectId,
      };
    } catch (error: any) {
      console.error('Create visit report error:', error);
      toast.error(error.message || 'Failed to create visit report');
      return null;
    }
  };

  return {
    mintAvatar,
    createPrescription,
    payPrescription,
    payPrescriptionWithInsurance,
    grantAccess,
    revokeAccess,
    createVisitReport,
    uploadScannedRecord,
    isPending,
    isConnected: !!currentAccount,
    address: currentAccount?.address,
  };
}