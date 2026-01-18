import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Link } from 'react-router-dom';
import {
  Trophy,
  Ticket,
  Users,
  Clock,
  ExternalLink,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { Raffle, RaffleStatus } from '@/types/raffle';
import { useUserTickets, useEstimatedPrize } from '@/hooks/useRaffles';
import { useCloseRaffle, useCancelRaffle, useClaimRefund } from '@/hooks/useRaffleActions';
import {
  formatETH,
  formatAddress,
  formatDate,
  getStatusLabel,
  getStatusColor,
  getExplorerUrl,
  calculateWinProbability,
  cn,
} from '@/lib/utils';
import { CountdownTimer } from './CountdownTimer';
import { BuyTicketsModal } from './BuyTicketsModal';
import { ParticipantsList } from './ParticipantsList';
import { WinnerDisplay } from './WinnerDisplay';

interface RaffleDetailProps {
  raffle: Raffle;
  participants: `0x${string}`[];
  onRefresh: () => void;
}

export function RaffleDetail({ raffle, participants, onRefresh }: RaffleDetailProps) {
  const { address, chainId } = useAccount();
  const [showBuyModal, setShowBuyModal] = useState(false);

  const { data: userTickets } = useUserTickets(raffle.id, address);
  const { data: estimatedPrize } = useEstimatedPrize(raffle.id);

  const { closeRaffle, isPending: isClosing } = useCloseRaffle();
  const { cancelRaffle, isPending: isCancelling } = useCancelRaffle();
  const { claimRefund, isPending: isClaiming } = useClaimRefund();

  const isCreator = address?.toLowerCase() === raffle.creator.toLowerCase();
  const isActive = raffle.status === RaffleStatus.Active;
  const isFinalized = raffle.status === RaffleStatus.Finalized;
  const isCancelled = raffle.status === RaffleStatus.Cancelled;
  const isEnded = Number(raffle.endTime) * 1000 < Date.now();
  const canClose = isEnded && isActive && raffle.ticketsSold > 0n;
  const canCancel = isCreator && isActive && raffle.ticketsSold === 0n;
  const canRefund = isCancelled && userTickets !== undefined && userTickets > 0n;

  const progress =
    raffle.maxTickets > 0n
      ? Number((raffle.ticketsSold * 100n) / raffle.maxTickets)
      : 0;

  const winProbability =
    userTickets && raffle.ticketsSold > 0n
      ? calculateWinProbability(Number(userTickets), Number(raffle.ticketsSold))
      : 0;

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Raffles
      </Link>

      {/* Winner Display (if finalized) */}
      {isFinalized && raffle.winner !== '0x0000000000000000000000000000000000000000' && (
        <WinnerDisplay winner={raffle.winner} isCurrentUser={address?.toLowerCase() === raffle.winner.toLowerCase()} />
      )}

      {/* Main Card */}
      <div className="card">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-white">
                {raffle.description || `Raffle #${raffle.id}`}
              </h1>
              <span className={getStatusColor(raffle.status)}>
                {getStatusLabel(raffle.status)}
              </span>
            </div>
            <p className="text-gray-400">
              Created by{' '}
              <a
                href={getExplorerUrl(chainId || 8453, raffle.creator, 'address')}
                target="_blank"
                rel="noopener noreferrer"
                className="text-base-blue hover:text-base-blue-light"
              >
                {formatAddress(raffle.creator)}
                <ExternalLink className="w-3 h-3 inline ml-1" />
              </a>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            {isActive && !isEnded && (
              <button
                onClick={() => setShowBuyModal(true)}
                className="btn-primary"
              >
                <Ticket className="w-4 h-4" />
                Buy Tickets
              </button>
            )}
            {canClose && (
              <button
                onClick={() => closeRaffle(raffle.id)}
                disabled={isClosing}
                className="btn-secondary"
              >
                {isClosing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Draw Winner'
                )}
              </button>
            )}
            {canCancel && (
              <button
                onClick={() => cancelRaffle(raffle.id)}
                disabled={isCancelling}
                className="btn-outline text-red-400 border-red-500/30 hover:bg-red-500/10"
              >
                {isCancelling ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Cancel Raffle'
                )}
              </button>
            )}
            {canRefund && (
              <button
                onClick={() => claimRefund(raffle.id)}
                disabled={isClaiming}
                className="btn-secondary"
              >
                {isClaiming ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Claim Refund'
                )}
              </button>
            )}
          </div>
        </div>

        {/* Prize Pool */}
        <div className="p-6 rounded-xl bg-gradient-to-r from-base-blue/10 to-purple-500/10 border border-base-blue/20 mb-6">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <Trophy className="w-5 h-5 text-base-blue" />
            <span>Prize Pool</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-white">
              {formatETH(raffle.prizePool)}
            </span>
            <span className="text-xl text-gray-400">ETH</span>
          </div>
          {estimatedPrize !== undefined && estimatedPrize > 0n && (
            <p className="text-sm text-gray-500 mt-1">
              Winner receives: {formatETH(estimatedPrize)} ETH (after 2.5% fee)
            </p>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-lg bg-gray-800/50">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
              <Ticket className="w-4 h-4" />
              Ticket Price
            </div>
            <p className="text-lg font-semibold text-white">
              {formatETH(raffle.ticketPrice)} ETH
            </p>
          </div>
          <div className="p-4 rounded-lg bg-gray-800/50">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
              <Users className="w-4 h-4" />
              Tickets Sold
            </div>
            <p className="text-lg font-semibold text-white">
              {raffle.ticketsSold.toString()}
              {raffle.maxTickets > 0n && ` / ${raffle.maxTickets.toString()}`}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-gray-800/50">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
              <Clock className="w-4 h-4" />
              {isActive ? 'Ends In' : 'Ended At'}
            </div>
            {isActive ? (
              <CountdownTimer endTime={raffle.endTime} size="lg" showIcon={false} />
            ) : (
              <p className="text-lg font-semibold text-white">
                {formatDate(Number(raffle.endTime))}
              </p>
            )}
          </div>
          <div className="p-4 rounded-lg bg-gray-800/50">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
              Min Tickets
            </div>
            <p className="text-lg font-semibold text-white">
              {raffle.minTickets > 0n ? raffle.minTickets.toString() : 'None'}
            </p>
          </div>
        </div>

        {/* Progress Bar (if max tickets) */}
        {raffle.maxTickets > 0n && (
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Progress</span>
              <span className="text-white">{progress.toFixed(1)}%</span>
            </div>
            <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
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
          </div>
        )}

        {/* Your Tickets */}
        {userTickets !== undefined && userTickets > 0n && (
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-400 font-medium">Your Tickets</p>
                <p className="text-2xl font-bold text-white">
                  {userTickets.toString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-sm">Win Probability</p>
                <p className="text-xl font-bold text-green-400">
                  {winProbability.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Participants List */}
      <ParticipantsList
        participants={participants}
        ticketsSold={Number(raffle.ticketsSold)}
      />

      {/* Buy Tickets Modal */}
      <BuyTicketsModal
        raffle={raffle}
        isOpen={showBuyModal}
        onClose={() => setShowBuyModal(false)}
        onSuccess={onRefresh}
      />
    </div>
  );
}
