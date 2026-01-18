import { useMemo } from 'react';
import { Trophy, Ticket, Users, TrendingUp } from 'lucide-react';
import { Raffle, RaffleStatus } from '@/types/raffle';
import { formatETH, formatNumber } from '@/lib/utils';
import { LoadingSkeleton } from '../shared/LoadingSkeleton';

interface GlobalStatsProps {
  raffles: Raffle[];
  isLoading: boolean;
}

export function GlobalStats({ raffles, isLoading }: GlobalStatsProps) {
  const stats = useMemo(() => {
    if (raffles.length === 0) {
      return {
        totalRaffles: 0,
        completedRaffles: 0,
        totalPrizeDistributed: 0n,
        totalTicketsSold: 0,
        uniqueParticipants: 0,
      };
    }

    const completedRaffles = raffles.filter(
      (r) => r.status === RaffleStatus.Finalized
    );

    const totalPrizeDistributed = completedRaffles.reduce(
      (acc, r) => acc + r.prizePool,
      0n
    );

    const totalTicketsSold = raffles.reduce(
      (acc, r) => acc + Number(r.ticketsSold),
      0
    );

    // Unique creators (as a proxy for unique participants)
    const uniqueCreators = new Set(raffles.map((r) => r.creator.toLowerCase())).size;

    return {
      totalRaffles: raffles.length,
      completedRaffles: completedRaffles.length,
      totalPrizeDistributed,
      totalTicketsSold,
      uniqueParticipants: uniqueCreators,
    };
  }, [raffles]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card p-5">
            <LoadingSkeleton className="h-4 w-20 mb-2" />
            <LoadingSkeleton className="h-8 w-24" />
          </div>
        ))}
      </div>
    );
  }

  const statItems = [
    {
      label: 'Total Raffles',
      value: formatNumber(stats.totalRaffles),
      icon: Ticket,
      color: 'text-base-blue',
      bgColor: 'bg-base-blue/10',
    },
    {
      label: 'Completed',
      value: formatNumber(stats.completedRaffles),
      icon: Trophy,
      color: 'text-green-400',
      bgColor: 'bg-green-400/10',
    },
    {
      label: 'Prize Distributed',
      value: `${formatETH(stats.totalPrizeDistributed)} ETH`,
      icon: TrendingUp,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/10',
    },
    {
      label: 'Tickets Sold',
      value: formatNumber(stats.totalTicketsSold),
      icon: Users,
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {statItems.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className="card p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <span className="text-sm text-gray-400">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
          </div>
        );
      })}
    </div>
  );
}
