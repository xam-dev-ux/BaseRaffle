import { Helmet } from 'react-helmet-async';
import { Clock } from 'lucide-react';
import { useAllRaffles } from '@/hooks/useRaffles';
import { HistoryTable } from '@/components/history/HistoryTable';
import { GlobalStats } from '@/components/history/GlobalStats';

export function History() {
  const { raffles, isLoading } = useAllRaffles();

  return (
    <>
      <Helmet>
        <title>History - BaseRaffle</title>
        <meta name="description" content="View completed raffles and global statistics on BaseRaffle." />
      </Helmet>

      <div className="space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-base-blue/10">
              <Clock className="w-5 h-5 text-base-blue" />
            </div>
            <h1 className="text-2xl font-bold text-white">Raffle History</h1>
          </div>
          <p className="text-gray-400">
            View completed and cancelled raffles, along with global statistics.
          </p>
        </div>

        {/* Global Stats */}
        <GlobalStats raffles={raffles} isLoading={isLoading} />

        {/* History Table */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Past Raffles</h2>
          <HistoryTable raffles={raffles} isLoading={isLoading} />
        </div>
      </div>
    </>
  );
}
