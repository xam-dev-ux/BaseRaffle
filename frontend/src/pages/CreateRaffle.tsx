import { Helmet } from 'react-helmet-async';
import { useAccount } from 'wagmi';
import { Ticket, AlertCircle } from 'lucide-react';
import { CreateRaffleForm } from '@/components/raffle/CreateRaffleForm';

export function CreateRaffle() {
  const { isConnected } = useAccount();

  return (
    <>
      <Helmet>
        <title>Create Raffle - BaseRaffle</title>
        <meta name="description" content="Create a new decentralized raffle on Base with provably fair winner selection." />
      </Helmet>

      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-base-blue/10 mb-4">
            <Ticket className="w-8 h-8 text-base-blue" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Create a Raffle</h1>
          <p className="text-gray-400">
            Set up your raffle parameters. Winners are selected using Chainlink VRF
            for provable randomness.
          </p>
        </div>

        {/* Not Connected Warning */}
        {!isConnected && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 mb-6">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">
              Connect your wallet to create a raffle
            </p>
          </div>
        )}

        {/* Form Card */}
        <div className="card">
          <CreateRaffleForm />
        </div>

        {/* Info Section */}
        <div className="mt-8 p-6 rounded-xl bg-gray-800/30 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4">How it works</h3>
          <ul className="space-y-3 text-gray-400 text-sm">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-base-blue/20 text-base-blue text-xs font-bold flex items-center justify-center">
                1
              </span>
              <span>
                Set your raffle parameters: description, ticket price, max tickets, and duration.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-base-blue/20 text-base-blue text-xs font-bold flex items-center justify-center">
                2
              </span>
              <span>
                Participants buy tickets during the raffle period. Each ticket increases their winning odds.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-base-blue/20 text-base-blue text-xs font-bold flex items-center justify-center">
                3
              </span>
              <span>
                When the raffle ends, Chainlink VRF generates a provably random number to select the winner.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-base-blue/20 text-base-blue text-xs font-bold flex items-center justify-center">
                4
              </span>
              <span>
                The winner automatically receives 97.5% of the prize pool. A 2.5% protocol fee is collected.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
