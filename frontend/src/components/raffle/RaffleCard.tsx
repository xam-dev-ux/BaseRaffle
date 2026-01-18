import { Link } from 'react-router-dom';
import { Ticket, Users, Trophy, ArrowRight } from 'lucide-react';
import { Raffle, RaffleStatus } from '@/types/raffle';
import { formatETH, formatAddress, getStatusLabel, getStatusColor, cn } from '@/lib/utils';
import { CountdownTimer } from './CountdownTimer';

interface RaffleCardProps {
  raffle: Raffle;
}

export function RaffleCard({ raffle }: RaffleCardProps) {
  const isActive = raffle.status === RaffleStatus.Active;
  const isFinalized = raffle.status === RaffleStatus.Finalized;
  const progress =
    raffle.maxTickets > 0n
      ? Number((raffle.ticketsSold * 100n) / raffle.maxTickets)
      : 0;

  return (
    <Link
      to={`/raffle/${raffle.id}`}
      className="card-hover group block"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-white truncate group-hover:text-base-blue transition-colors">
            {raffle.description || `Raffle #${raffle.id}`}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            by {formatAddress(raffle.creator)}
          </p>
        </div>
        <span className={getStatusColor(raffle.status)}>
          {getStatusLabel(raffle.status)}
        </span>
      </div>

      {/* Prize Pool */}
      <div className="mb-4 p-3 rounded-lg bg-gradient-to-r from-base-blue/10 to-purple-500/10 border border-base-blue/20">
        <div className="flex items-center gap-2 mb-1">
          <Trophy className="w-4 h-4 text-base-blue" />
          <span className="text-xs text-gray-400">Prize Pool</span>
        </div>
        <p className="text-2xl font-bold text-white">
          {formatETH(raffle.prizePool)} ETH
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-1">
            <Ticket className="w-3.5 h-3.5" />
            <span>Ticket Price</span>
          </div>
          <p className="text-sm font-medium text-white">
            {formatETH(raffle.ticketPrice)} ETH
          </p>
        </div>
        <div>
          <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-1">
            <Users className="w-3.5 h-3.5" />
            <span>Tickets Sold</span>
          </div>
          <p className="text-sm font-medium text-white">
            {raffle.ticketsSold.toString()}
            {raffle.maxTickets > 0n && ` / ${raffle.maxTickets.toString()}`}
          </p>
        </div>
      </div>

      {/* Progress Bar (if max tickets set) */}
      {raffle.maxTickets > 0n && (
        <div className="mb-4">
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                progress >= 100
                  ? 'bg-green-500'
                  : progress >= 75
                  ? 'bg-yellow-500'
                  : 'bg-base-blue'
              )}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">{progress.toFixed(0)}% filled</p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-800">
        {isActive ? (
          <CountdownTimer endTime={raffle.endTime} />
        ) : isFinalized && raffle.winner !== '0x0000000000000000000000000000000000000000' ? (
          <div className="flex items-center gap-2 text-green-400">
            <Trophy className="w-4 h-4" />
            <span className="text-sm">Winner: {formatAddress(raffle.winner)}</span>
          </div>
        ) : (
          <span className="text-sm text-gray-500">
            {getStatusLabel(raffle.status)}
          </span>
        )}

        <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-base-blue group-hover:translate-x-1 transition-all" />
      </div>
    </Link>
  );
}
