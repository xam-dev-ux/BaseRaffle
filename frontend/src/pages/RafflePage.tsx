import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useRaffleDetails, useRaffleParticipants } from '@/hooks/useRaffles';
import { RaffleDetail } from '@/components/raffle/RaffleDetail';
import { RaffleDetailSkeleton } from '@/components/shared/LoadingSkeleton';
import { formatETH } from '@/lib/utils';

export function RafflePage() {
  const { id } = useParams<{ id: string }>();
  const raffleId = id ? BigInt(id) : undefined;

  const { raffle, isLoading, refetch } = useRaffleDetails(raffleId);
  const { data: participants } = useRaffleParticipants(raffleId);

  if (isLoading) {
    return <RaffleDetailSkeleton />;
  }

  if (!raffle) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-white mb-2">Raffle not found</h2>
        <p className="text-gray-400">
          The raffle you're looking for doesn't exist or may have been removed.
        </p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{raffle.description || `Raffle #${raffle.id}`} - BaseRaffle</title>
        <meta
          name="description"
          content={`Join this raffle on BaseRaffle. Prize pool: ${formatETH(raffle.prizePool)} ETH. Ticket price: ${formatETH(raffle.ticketPrice)} ETH.`}
        />
        <meta property="og:title" content={`${raffle.description || `Raffle #${raffle.id}`} - BaseRaffle`} />
        <meta
          property="og:description"
          content={`Prize pool: ${formatETH(raffle.prizePool)} ETH. Ticket price: ${formatETH(raffle.ticketPrice)} ETH.`}
        />
      </Helmet>

      <RaffleDetail
        raffle={raffle}
        participants={[...(participants || [])]}
        onRefresh={refetch}
      />
    </>
  );
}
