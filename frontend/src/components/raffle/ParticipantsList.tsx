import { useMemo, useState } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { Users, ExternalLink, ChevronDown } from 'lucide-react';
import { formatAddress, getExplorerUrl, cn } from '@/lib/utils';

interface ParticipantsListProps {
  participants: `0x${string}`[];
  ticketsSold: number;
}

interface ParticipantEntry {
  address: `0x${string}`;
  tickets: number;
  probability: number;
}

export function ParticipantsList({ participants, ticketsSold }: ParticipantsListProps) {
  const { address: currentUser } = useAccount();
  const chainId = useChainId();
  const [isExpanded, setIsExpanded] = useState(false);

  const aggregatedParticipants = useMemo(() => {
    const counts: Record<string, number> = {};

    participants.forEach((addr) => {
      const key = addr.toLowerCase();
      counts[key] = (counts[key] || 0) + 1;
    });

    const entries: ParticipantEntry[] = Object.entries(counts)
      .map(([addr, tickets]) => ({
        address: addr as `0x${string}`,
        tickets,
        probability: (tickets / ticketsSold) * 100,
      }))
      .sort((a, b) => b.tickets - a.tickets);

    return entries;
  }, [participants, ticketsSold]);

  const uniqueParticipants = aggregatedParticipants.length;
  const displayedParticipants = isExpanded
    ? aggregatedParticipants
    : aggregatedParticipants.slice(0, 5);

  if (participants.length === 0) {
    return (
      <div className="card">
        <div className="flex items-center gap-2 text-gray-400 mb-4">
          <Users className="w-5 h-5" />
          <h3 className="text-lg font-semibold text-white">Participants</h3>
        </div>
        <div className="text-center py-8">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-800 flex items-center justify-center">
            <Users className="w-6 h-6 text-gray-600" />
          </div>
          <p className="text-gray-400">No participants yet</p>
          <p className="text-gray-500 text-sm">Be the first to buy tickets!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-white">Participants</h3>
        </div>
        <span className="text-sm text-gray-400">
          {uniqueParticipants} unique / {ticketsSold} tickets
        </span>
      </div>

      <div className="space-y-2">
        {displayedParticipants.map((participant, index) => {
          const isCurrentUser =
            currentUser?.toLowerCase() === participant.address.toLowerCase();

          return (
            <div
              key={participant.address}
              className={cn(
                'flex items-center justify-between p-3 rounded-lg',
                isCurrentUser ? 'bg-base-blue/10 border border-base-blue/30' : 'bg-gray-800/50'
              )}
            >
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500 w-6">#{index + 1}</span>
                <a
                  href={getExplorerUrl(chainId || 8453, participant.address, 'address')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'font-mono text-sm hover:text-base-blue transition-colors inline-flex items-center gap-1',
                    isCurrentUser ? 'text-base-blue' : 'text-white'
                  )}
                >
                  {formatAddress(participant.address, 6)}
                  <ExternalLink className="w-3 h-3" />
                </a>
                {isCurrentUser && (
                  <span className="text-xs bg-base-blue/20 text-base-blue px-2 py-0.5 rounded">
                    You
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-400">
                  {participant.tickets} ticket{participant.tickets > 1 ? 's' : ''}
                </span>
                <span className="text-green-400 font-medium w-16 text-right">
                  {participant.probability.toFixed(1)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {aggregatedParticipants.length > 5 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full mt-4 p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-2"
        >
          <span className="text-sm">
            {isExpanded ? 'Show less' : `Show all ${uniqueParticipants} participants`}
          </span>
          <ChevronDown
            className={cn('w-4 h-4 transition-transform', isExpanded && 'rotate-180')}
          />
        </button>
      )}
    </div>
  );
}
