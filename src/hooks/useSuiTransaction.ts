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

  const mintAvatar = async (name: string) => {
    if (!currentAccount) {
      toast.error('Please connect your wallet first');
      return null;
    }

    try {
      const tx = new Transaction();
      
      tx.moveCall({
        target: `${SELORA_CONFIG.PACKAGE_ID}::avatar::mint`,
        arguments: [
          tx.pure.string(name),
          tx.object(SELORA_CONFIG.REGISTRY_ID),
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
    blobId: string,
    pharmacyAddress: string
  ) => {
    if (!currentAccount) {
      toast.error('Please connect your wallet first');
      return null;
    }

    try {
      const tx = new Transaction();

      tx.moveCall({
        target: `${SELORA_CONFIG.PACKAGE_ID}::prescriptions::create`,
        arguments: [
          tx.object(SELORA_CONFIG.REGISTRY_ID),
          tx.pure.address(patientAddress),
          tx.pure.string(blobId),
          tx.pure.address(pharmacyAddress),
        ],
      });

      const result = await signAndExecute({
        transaction: tx as AnyTransaction,
      });

      await suiClient.waitForTransaction({
        digest: result.digest,
      });

      toast.success('Prescription created on-chain!');
      return { digest: result.digest };
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
        target: `${SELORA_CONFIG.PACKAGE_ID}::prescriptions::pay`,
        arguments: [
          tx.object(prescriptionId),
          paymentCoin,
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

  const grantAccess = async (
    recordId: string,
    granteeAddress: string,
    expirationTimestamp: number
  ) => {
    if (!currentAccount) {
      toast.error('Please connect your wallet first');
      return null;
    }

    try {
      const tx = new Transaction();

      tx.moveCall({
        target: `${SELORA_CONFIG.PACKAGE_ID}::access::grant`,
        arguments: [
          tx.object(recordId),
          tx.pure.address(granteeAddress),
          tx.pure.u64(expirationTimestamp),
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
        target: `${SELORA_CONFIG.PACKAGE_ID}::access::revoke`,
        arguments: [
          tx.object(recordId),
          tx.pure.address(granteeAddress),
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

  return {
    mintAvatar,
    createPrescription,
    payPrescription,
    grantAccess,
    revokeAccess,
    isPending,
    isConnected: !!currentAccount,
    address: currentAccount?.address,
  };
}
