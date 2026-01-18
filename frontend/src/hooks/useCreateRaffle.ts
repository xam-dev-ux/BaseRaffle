import { useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi';
import { BASE_RAFFLE_ABI, CONTRACT_ADDRESSES } from '@/lib/contracts';
import type { CreateRaffleParams } from '@/types/raffle';

export function useCreateRaffle() {
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

  const createRaffle = (params: CreateRaffleParams) => {
    writeContract({
      address,
      abi: BASE_RAFFLE_ABI,
      functionName: 'createRaffle',
      args: [
        params.description,
        params.ticketPrice,
        params.maxTickets,
        params.minTickets,
        params.duration,
      ],
    });
  };

  return {
    createRaffle,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
    receipt,
    reset,
  };
}
