import { useState } from 'react';
import { useAccount, useConnect, useDisconnect, useBalance, useChainId, useSwitchChain } from 'wagmi';
import { base } from 'wagmi/chains';
import { Wallet, ChevronDown, LogOut, Copy, ExternalLink, AlertTriangle } from 'lucide-react';
import { formatAddress, formatETH, getExplorerUrl, cn } from '@/lib/utils';

export function ConnectButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const { data: balance } = useBalance({ address });

  const isWrongNetwork = isConnected && chainId !== base.id;

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
    }
  };

  if (!isConnected) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="btn-primary"
          disabled={isPending}
        >
          <Wallet className="w-4 h-4" />
          {isPending ? 'Connecting...' : 'Connect Wallet'}
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute right-0 mt-2 w-64 bg-gray-900 border border-gray-800 rounded-xl shadow-xl z-50 animate-scale-in overflow-hidden">
              <div className="p-3 border-b border-gray-800">
                <p className="text-sm font-medium text-gray-300">Connect a wallet</p>
              </div>
              <div className="p-2">
                {connectors.map((connector) => (
                  <button
                    key={connector.uid}
                    onClick={() => {
                      connect({ connector });
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center">
                      <Wallet className="w-4 h-4 text-gray-400" />
                    </div>
                    <span className="text-sm font-medium text-white">
                      {connector.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  if (isWrongNetwork) {
    return (
      <button
        onClick={() => switchChain({ chainId: base.id })}
        className="btn bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30"
      >
        <AlertTriangle className="w-4 h-4" />
        Switch to Base
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200',
          isOpen
            ? 'bg-gray-800 border-gray-700'
            : 'bg-gray-900 border-gray-800 hover:border-gray-700'
        )}
      >
        <div className="w-2 h-2 rounded-full bg-green-500" />
        <span className="text-sm font-medium text-white">
          {formatAddress(address!)}
        </span>
        <ChevronDown className={cn(
          'w-4 h-4 text-gray-400 transition-transform',
          isOpen && 'rotate-180'
        )} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-72 bg-gray-900 border border-gray-800 rounded-xl shadow-xl z-50 animate-scale-in overflow-hidden">
            {/* Balance Section */}
            <div className="p-4 border-b border-gray-800">
              <p className="text-xs text-gray-500 mb-1">Balance</p>
              <p className="text-2xl font-bold text-white">
                {balance ? formatETH(balance.value) : '0'} ETH
              </p>
            </div>

            {/* Address Section */}
            <div className="p-4 border-b border-gray-800">
              <p className="text-xs text-gray-500 mb-2">Connected Address</p>
              <div className="flex items-center gap-2">
                <code className="text-sm text-gray-300 bg-gray-800 px-2 py-1 rounded">
                  {formatAddress(address!, 6)}
                </code>
                <button
                  onClick={handleCopyAddress}
                  className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                  title="Copy address"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <a
                  href={getExplorerUrl(chainId, address!, 'address')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                  title="View on BaseScan"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Actions */}
            <div className="p-2">
              <button
                onClick={() => {
                  disconnect();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors text-red-400 hover:text-red-300"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Disconnect</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
