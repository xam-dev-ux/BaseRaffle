import { useState, useEffect } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { X, Ticket, Minus, Plus, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { Raffle } from '@/types/raffle';
import { useBuyTickets } from '@/hooks/useBuyTickets';
import { formatETH, cn } from '@/lib/utils';

interface BuyTicketsModalProps {
  raffle: Raffle;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function BuyTicketsModal({ raffle, isOpen, onClose, onSuccess }: BuyTicketsModalProps) {
  const { address } = useAccount();
  const { data: balance } = useBalance({ address });
  const [quantity, setQuantity] = useState(1);

  const { buyTickets, isPending, isConfirming, isSuccess, error, reset } = useBuyTickets();

  const totalCost = raffle.ticketPrice * BigInt(quantity);
  const hasEnoughBalance = balance && balance.value >= totalCost;
  const ticketsRemaining =
    raffle.maxTickets > 0n ? Number(raffle.maxTickets - raffle.ticketsSold) : Infinity;
  const maxPurchasable = Math.min(ticketsRemaining, 100); // Cap at 100 per transaction

  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        onSuccess?.();
        onClose();
        reset();
        setQuantity(1);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, onSuccess, onClose, reset]);

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, Math.min(maxPurchasable, prev + delta)));
  };

  const handleBuy = () => {
    buyTickets({
      raffleId: raffle.id,
      quantity: BigInt(quantity),
      value: totalCost,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl animate-scale-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="p-6">
          {isSuccess ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Tickets Purchased!</h3>
              <p className="text-gray-400">
                You now have {quantity} more ticket{quantity > 1 ? 's' : ''} in this raffle.
              </p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="mb-6">
                <h2 className="text-xl font-bold text-white mb-1">Buy Tickets</h2>
                <p className="text-gray-400 text-sm">{raffle.description}</p>
              </div>

              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Number of Tickets
                </label>
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="p-3 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <div className="w-24 text-center">
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(
                          Math.max(1, Math.min(maxPurchasable, parseInt(e.target.value) || 1))
                        )
                      }
                      className="w-full text-center text-2xl font-bold bg-transparent border-none focus:outline-none text-white"
                    />
                    <p className="text-xs text-gray-500">
                      {ticketsRemaining < Infinity ? `${ticketsRemaining} left` : 'Unlimited'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= maxPurchasable}
                    className="p-3 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Cost Summary */}
              <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400">Price per ticket</span>
                  <span className="text-white">{formatETH(raffle.ticketPrice)} ETH</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400">Quantity</span>
                  <span className="text-white">x{quantity}</span>
                </div>
                <div className="border-t border-gray-700 my-2" />
                <div className="flex justify-between items-center">
                  <span className="text-white font-medium">Total</span>
                  <span className="text-xl font-bold text-base-blue">
                    {formatETH(totalCost)} ETH
                  </span>
                </div>
              </div>

              {/* Balance Warning */}
              {!hasEnoughBalance && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 mb-4">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">
                    Insufficient balance. You have {balance ? formatETH(balance.value) : '0'} ETH
                  </span>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 mb-4">
                  <p className="text-sm">{error.message}</p>
                </div>
              )}

              {/* Buy Button */}
              <button
                onClick={handleBuy}
                disabled={!hasEnoughBalance || isPending || isConfirming}
                className={cn(
                  'btn w-full py-3',
                  hasEnoughBalance
                    ? 'btn-primary'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                )}
              >
                {isPending || isConfirming ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {isPending ? 'Confirm in Wallet...' : 'Processing...'}
                  </>
                ) : (
                  <>
                    <Ticket className="w-4 h-4" />
                    Buy {quantity} Ticket{quantity > 1 ? 's' : ''}
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
