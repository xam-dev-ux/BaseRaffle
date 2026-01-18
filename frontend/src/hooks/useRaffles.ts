import { useReadContract, useReadContracts, useChainId } from 'wagmi';
import { BASE_RAFFLE_ABI, CONTRACT_ADDRESSES } from '@/lib/contracts';
import type { Raffle, RaffleStatus } from '@/types/raffle';

export function useRaffleContract() {
  const chainId = useChainId();
  const address = CONTRACT_ADDRESSES[chainId];

  return {
    address,
    abi: BASE_RAFFLE_ABI,
  };
}

export function useTotalRaffles() {
  const { address, abi } = useRaffleContract();

  return useReadContract({
    address,
    abi,
    functionName: 'getTotalRaffles',
  });
}

export function useActiveRaffleIds() {
  const { address, abi } = useRaffleContract();

  return useReadContract({
    address,
    abi,
    functionName: 'getActiveRaffles',
  });
}

export function useRaffleDetails(raffleId: bigint | undefined) {
  const { address, abi } = useRaffleContract();

  const { data, isLoading, error, refetch } = useReadContract({
    address,
    abi,
    functionName: 'getRaffleDetails',
    args: raffleId !== undefined ? [raffleId] : undefined,
    query: {
      enabled: raffleId !== undefined,
    },
  });

  const raffle: Raffle | undefined = data
    ? {
        id: raffleId!,
        creator: data[0],
        description: data[1],
        ticketPrice: data[2],
        maxTickets: data[3],
        minTickets: data[4],
        endTime: data[5],
        ticketsSold: data[6],
        prizePool: data[7],
        winner: data[8],
        status: data[9] as RaffleStatus,
      }
    : undefined;

  return { raffle, isLoading, error, refetch };
}

export function useRaffleParticipants(raffleId: bigint | undefined) {
  const { address, abi } = useRaffleContract();

  return useReadContract({
    address,
    abi,
    functionName: 'getRaffleParticipants',
    args: raffleId !== undefined ? [raffleId] : undefined,
    query: {
      enabled: raffleId !== undefined,
    },
  });
}

export function useUserTickets(raffleId: bigint | undefined, userAddress: `0x${string}` | undefined) {
  const { address, abi } = useRaffleContract();

  return useReadContract({
    address,
    abi,
    functionName: 'getUserTickets',
    args: raffleId !== undefined && userAddress ? [raffleId, userAddress] : undefined,
    query: {
      enabled: raffleId !== undefined && !!userAddress,
    },
  });
}

export function useEstimatedPrize(raffleId: bigint | undefined) {
  const { address, abi } = useRaffleContract();

  return useReadContract({
    address,
    abi,
    functionName: 'getEstimatedPrize',
    args: raffleId !== undefined ? [raffleId] : undefined,
    query: {
      enabled: raffleId !== undefined,
    },
  });
}

export function useMultipleRaffleDetails(raffleIds: bigint[]) {
  const { address, abi } = useRaffleContract();

  const contracts = raffleIds.map((id) => ({
    address,
    abi,
    functionName: 'getRaffleDetails' as const,
    args: [id] as const,
  }));

  const { data, isLoading, error, refetch } = useReadContracts({
    contracts,
    query: {
      enabled: raffleIds.length > 0,
    },
  });

  const raffles: Raffle[] = data
    ? data
        .map((result, index) => {
          if (result.status === 'success' && result.result) {
            const d = result.result as readonly [
              `0x${string}`,
              string,
              bigint,
              bigint,
              bigint,
              bigint,
              bigint,
              bigint,
              `0x${string}`,
              number
            ];
            return {
              id: raffleIds[index],
              creator: d[0],
              description: d[1],
              ticketPrice: d[2],
              maxTickets: d[3],
              minTickets: d[4],
              endTime: d[5],
              ticketsSold: d[6],
              prizePool: d[7],
              winner: d[8],
              status: d[9] as RaffleStatus,
            };
          }
          return null;
        })
        .filter((r): r is Raffle => r !== null)
    : [];

  return { raffles, isLoading, error, refetch };
}

export function useAllRaffles() {
  const { data: totalRaffles } = useTotalRaffles();

  const raffleIds = totalRaffles
    ? Array.from({ length: Number(totalRaffles) }, (_, i) => BigInt(i))
    : [];

  return useMultipleRaffleDetails(raffleIds);
}
