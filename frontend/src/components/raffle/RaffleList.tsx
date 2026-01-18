import { useMemo, useState } from 'react';
import { useAccount } from 'wagmi';
import { Search, Filter } from 'lucide-react';
import { Raffle, RaffleStatus, RaffleFilter } from '@/types/raffle';
import { RaffleCard } from './RaffleCard';
import { LoadingSkeleton } from '../shared/LoadingSkeleton';
import { cn } from '@/lib/utils';

interface RaffleListProps {
  raffles: Raffle[];
  isLoading: boolean;
  showFilters?: boolean;
}

const filters: { label: string; value: RaffleFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'finalized' },
  { label: 'My Raffles', value: 'my-raffles' },
  { label: 'My Tickets', value: 'my-tickets' },
];

export function RaffleList({ raffles, isLoading, showFilters = true }: RaffleListProps) {
  const { address } = useAccount();
  const [activeFilter, setActiveFilter] = useState<RaffleFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRaffles = useMemo(() => {
    let result = [...raffles];

    // Apply status filter
    switch (activeFilter) {
      case 'active':
        result = result.filter((r) => r.status === RaffleStatus.Active);
        break;
      case 'finalized':
        result = result.filter((r) => r.status === RaffleStatus.Finalized);
        break;
      case 'my-raffles':
        result = result.filter(
          (r) => address && r.creator.toLowerCase() === address.toLowerCase()
        );
        break;
      case 'my-tickets':
        // This would need additional data about user tickets per raffle
        // For now, filter by if user is the creator (placeholder)
        result = result.filter(
          (r) => address && r.creator.toLowerCase() === address.toLowerCase()
        );
        break;
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.description.toLowerCase().includes(query) ||
          r.creator.toLowerCase().includes(query) ||
          r.id.toString().includes(query)
      );
    }

    // Sort: Active first, then by end time (soonest first)
    result.sort((a, b) => {
      if (a.status === RaffleStatus.Active && b.status !== RaffleStatus.Active) return -1;
      if (a.status !== RaffleStatus.Active && b.status === RaffleStatus.Active) return 1;
      return Number(a.endTime - b.endTime);
    });

    return result;
  }, [raffles, activeFilter, searchQuery, address]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <LoadingSkeleton key={i} className="h-80" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showFilters && (
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search raffles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
            <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
            {filters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setActiveFilter(filter.value)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200',
                  activeFilter === filter.value
                    ? 'bg-base-blue text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {filteredRaffles.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
            <Search className="w-8 h-8 text-gray-600" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No raffles found</h3>
          <p className="text-gray-400">
            {searchQuery
              ? 'Try adjusting your search or filter'
              : 'Be the first to create a raffle!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRaffles.map((raffle) => (
            <RaffleCard key={raffle.id.toString()} raffle={raffle} />
          ))}
        </div>
      )}
    </div>
  );
}
