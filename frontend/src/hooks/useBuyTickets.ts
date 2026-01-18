import { useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi';
import { BASE_RAFFLE_ABI, CONTRACT_ADDRESSES } from '@/lib/contracts';
import type { BuyTicketsParams } from '@/types/raffle';

export function useBuyTickets() {
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
    data: receipt,
  } = useWaitForTransactionReceipt({
    hash,
  });

  const buyTickets = (params: BuyTicketsParams) => {
    writeContract({
      address,
      abi: BASE_RAFFLE_ABI,
      functionName: 'buyTickets',
      args: [params.raffleId, params.quantity],
      value: params.value,
    });
  };

  return {
    buyTickets,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
    receipt,
    reset,
  };
}
