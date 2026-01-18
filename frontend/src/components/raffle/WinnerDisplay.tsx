import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, ExternalLink } from 'lucide-react';
import { formatAddress, getExplorerUrl } from '@/lib/utils';
import { useChainId } from 'wagmi';

interface WinnerDisplayProps {
  winner: `0x${string}`;
  isCurrentUser: boolean;
}

export function WinnerDisplay({ winner, isCurrentUser }: WinnerDisplayProps) {
  const chainId = useChainId();

  useEffect(() => {
    if (isCurrentUser) {
      // Fire confetti!
      const duration = 3000;
      const animationEnd = Date.now() + duration;

      const randomInRange = (min: number, max: number) =>
        Math.random() * (max - min) + min;

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        confetti({
          particleCount,
          startVelocity: 30,
          spread: 360,
          origin: {
            x: randomInRange(0.1, 0.9),
            y: Math.random() - 0.2,
          },
          colors: ['#0052FF', '#4D8AFF', '#FFD700', '#FF6B6B', '#4ECDC4'],
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [isCurrentUser]);

  if (isCurrentUser) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-yellow-500/20 via-yellow-400/20 to-yellow-500/20 border border-yellow-500/30 p-8 text-center animate-fade-in">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-radial from-yellow-400/20 to-transparent opacity-50" />

        <div className="relative">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-yellow-500/30 flex items-center justify-center glow-green">
            <Trophy className="w-10 h-10 text-yellow-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Congratulations!
          </h2>
          <p className="text-xl text-yellow-400 font-semibold mb-4">
            You Won This Raffle!
          </p>
          <p className="text-gray-300">
            The prize has been automatically transferred to your wallet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-gradient-to-r from-base-blue/10 to-purple-500/10 border border-base-blue/20 p-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-base-blue/20 flex items-center justify-center">
          <Trophy className="w-6 h-6 text-base-blue" />
        </div>
        <div>
          <p className="text-gray-400 text-sm">Winner</p>
          <a
            href={getExplorerUrl(chainId || 8453, winner, 'address')}
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg font-semibold text-white hover:text-base-blue transition-colors inline-flex items-center gap-2"
          >
            {formatAddress(winner, 8)}
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
