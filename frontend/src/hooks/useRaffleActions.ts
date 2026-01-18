import { useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi';
import { BASE_RAFFLE_ABI, CONTRACT_ADDRESSES } from '@/lib/contracts';

export function useCloseRaffle() {
  const chainId = useChainId();
  const address = CONTRACT_ADDRESSES[chainId];

  const {
    writeContract,
    data: hash,
    isPending,
    error,
    reset,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
  } = useWaitForTransactionReceipt({
    hash,
  });

  const closeRaffle = (raffleId: bigint) => {
    writeContract({
      address,
      abi: BASE_RAFFLE_ABI,
      functionName: 'closeRaffle',
      args: [raffleId],
    });
  };

  return {
    closeRaffle,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
    reset,
  };
}

export function useCancelRaffle() {
  const chainId = useChainId();
  const address = CONTRACT_ADDRESSES[chainId];

  const {
    writeContract,
    data: hash,
    isPending,
    error,
    reset,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
  } = useWaitForTransactionReceipt({
    hash,
  });

  const cancelRaffle = (raffleId: bigint) => {
    writeContract({
      address,
      abi: BASE_RAFFLE_ABI,
      functionName: 'cancelRaffle',
      args: [raffleId],
    });
  };

  return {
    cancelRaffle,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
    reset,
  };
}

export function useClaimRefund() {
  const chainId = useChainId();
  const address = CONTRACT_ADDRESSES[chainId];

  const {
    writeContract,
    data: hash,
    isPending,
    error,
    reset,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
  } = useWaitForTransactionReceipt({
    hash,
  });

  const claimRefund = (raffleId: bigint) => {
    writeContract({
      address,
      abi: BASE_RAFFLE_ABI,
      functionName: 'claimRefund',
      args: [raffleId],
    });
  };

  return {
    claimRefund,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
    reset,
  };
}
