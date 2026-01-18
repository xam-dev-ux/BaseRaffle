import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Plus, Trophy, Ticket, Users } from 'lucide-react';
import { useAllRaffles, useTotalRaffles, useActiveRaffleIds } from '@/hooks/useRaffles';
import { RaffleList } from '@/components/raffle/RaffleList';
import { formatETH } from '@/lib/utils';
import { RaffleStatus } from '@/types/raffle';

export function Dashboard() {
  const { raffles, isLoading } = useAllRaffles();
  const { data: totalRaffles } = useTotalRaffles();
  const { data: activeRaffleIds } = useActiveRaffleIds();

  // Calculate stats
  const activeCount = activeRaffleIds?.length || 0;
  const totalPrizePool = raffles.reduce((acc, r) => {
    if (r.status === RaffleStatus.Active || r.status === RaffleStatus.Closed) {
      return acc + r.prizePool;
    }
    return acc;
  }, 0n);
  const totalTickets = raffles.reduce((acc, r) => acc + Number(r.ticketsSold), 0);

  return (
    <>
      <Helmet>
        <title>BaseRaffle - Decentralized Raffles on Base</title>
        <meta name="description" content="Create and participate in provably fair raffles on Base. Powered by Chainlink VRF for true randomness." />
      </Helmet>

      <div className="space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-base-blue/20 via-purple-500/10 to-base-blue/20 border border-base-blue/20 p-8 md:p-12">
          <div className="absolute inset-0 bg-gradient-radial from-base-blue/10 to-transparent" />
          <div className="relative">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Decentralized Raffles on{' '}
              <span className="gradient-text">Base</span>
            </h1>
            <p className="text-gray-300 text-lg mb-6 max-w-2xl">
              Create or join provably fair raffles powered by Chainlink VRF.
              Every draw is verifiable on-chain.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/create" className="btn-primary py-3 px-6">
                <Plus className="w-5 h-5" />
                Create Raffle
              </Link>
              <a
                href="https://docs.chain.link/vrf"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary py-3 px-6"
              >
                Learn about VRF
              </a>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-base-blue/10">
                <Ticket className="w-4 h-4 text-base-blue" />
              </div>
              <span className="text-sm text-gray-400">Active Raffles</span>
            </div>
            <p className="text-2xl font-bold text-white">{activeCount}</p>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-green-400/10">
                <Trophy className="w-4 h-4 text-green-400" />
              </div>
              <span className="text-sm text-gray-400">Total Raffles</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {totalRaffles?.toString() || '0'}
            </p>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-yellow-400/10">
                <Trophy className="w-4 h-4 text-yellow-400" />
              </div>
              <span className="text-sm text-gray-400">Active Prize Pool</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {formatETH(totalPrizePool)} ETH
            </p>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-purple-400/10">
                <Users className="w-4 h-4 text-purple-400" />
              </div>
              <span className="text-sm text-gray-400">Tickets Sold</span>
            </div>
            <p className="text-2xl font-bold text-white">{totalTickets}</p>
          </div>
        </div>

        {/* Raffle List */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">All Raffles</h2>
          </div>
          <RaffleList raffles={raffles} isLoading={isLoading} />
        </div>
      </div>
    </>
  );
}
