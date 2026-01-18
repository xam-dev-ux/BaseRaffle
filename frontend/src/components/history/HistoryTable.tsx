import { Link } from 'react-router-dom';
import { useChainId } from 'wagmi';
import { Trophy, ExternalLink, ArrowUpRight } from 'lucide-react';
import { Raffle, RaffleStatus } from '@/types/raffle';
import {
  formatETH,
  formatAddress,
  formatDate,
  getStatusLabel,
  getStatusColor,
  getExplorerUrl,
} from '@/lib/utils';
import { LoadingSkeleton } from '../shared/LoadingSkeleton';

interface HistoryTableProps {
  raffles: Raffle[];
  isLoading: boolean;
}

export function HistoryTable({ raffles, isLoading }: HistoryTableProps) {
  const chainId = useChainId();

  // Filter to only finalized and cancelled raffles
  const historicalRaffles = raffles.filter(
    (r) => r.status === RaffleStatus.Finalized || r.status === RaffleStatus.Cancelled
  );

  if (isLoading) {
    return (
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left p-4 text-sm font-medium text-gray-400">ID</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Description</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Prize Pool</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Winner</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Status</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Ended</th>
                <th className="text-right p-4 text-sm font-medium text-gray-400"></th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-800/50">
                  <td className="p-4"><LoadingSkeleton className="h-5 w-8" /></td>
                  <td className="p-4"><LoadingSkeleton className="h-5 w-32" /></td>
                  <td className="p-4"><LoadingSkeleton className="h-5 w-20" /></td>
                  <td className="p-4"><LoadingSkeleton className="h-5 w-24" /></td>
                  <td className="p-4"><LoadingSkeleton className="h-5 w-16 rounded-full" /></td>
                  <td className="p-4"><LoadingSkeleton className="h-5 w-28" /></td>
                  <td className="p-4"><LoadingSkeleton className="h-5 w-5" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (historicalRaffles.length === 0) {
    return (
      <div className="card text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
          <Trophy className="w-8 h-8 text-gray-600" />
        </div>
        <h3 className="text-lg font-medium text-white mb-2">No history yet</h3>
        <p className="text-gray-400">
          Completed raffles will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800 bg-gray-900/50">
              <th className="text-left p-4 text-sm font-medium text-gray-400">ID</th>
              <th className="text-left p-4 text-sm font-medium text-gray-400">Description</th>
              <th className="text-left p-4 text-sm font-medium text-gray-400">Prize Pool</th>
              <th className="text-left p-4 text-sm font-medium text-gray-400">Winner</th>
              <th className="text-left p-4 text-sm font-medium text-gray-400">Status</th>
              <th className="text-left p-4 text-sm font-medium text-gray-400">Ended</th>
              <th className="text-right p-4 text-sm font-medium text-gray-400"></th>
            </tr>
          </thead>
          <tbody>
            {historicalRaffles.map((raffle) => (
              <tr
                key={raffle.id.toString()}
                className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
              >
                <td className="p-4">
                  <span className="text-gray-400">#{raffle.id.toString()}</span>
                </td>
                <td className="p-4">
                  <Link
                    to={`/raffle/${raffle.id}`}
                    className="text-white hover:text-base-blue transition-colors font-medium"
                  >
                    {raffle.description.slice(0, 30)}
                    {raffle.description.length > 30 ? '...' : ''}
                  </Link>
                </td>
                <td className="p-4">
                  <span className="text-white font-medium">
                    {formatETH(raffle.prizePool)} ETH
                  </span>
                </td>
                <td className="p-4">
                  {raffle.winner !== '0x0000000000000000000000000000000000000000' ? (
                    <a
                      href={getExplorerUrl(chainId || 8453, raffle.winner, 'address')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-green-400 hover:text-green-300 transition-colors"
                    >
                      <Trophy className="w-3 h-3" />
                      {formatAddress(raffle.winner)}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </td>
                <td className="p-4">
                  <span className={getStatusColor(raffle.status)}>
                    {getStatusLabel(raffle.status)}
                  </span>
                </td>
                <td className="p-4">
                  <span className="text-gray-400 text-sm">
                    {formatDate(Number(raffle.endTime))}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <Link
                    to={`/raffle/${raffle.id}`}
                    className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors inline-block"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
