import { ExternalLink, Github, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-gray-800 mt-auto">
      <div className="container mx-auto px-4 max-w-7xl py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left side */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <p className="text-sm text-gray-400">
              Built on{' '}
              <a
                href="https://base.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-base-blue hover:text-base-blue-light transition-colors"
              >
                Base
              </a>{' '}
              with{' '}
              <a
                href="https://chain.link/vrf"
                target="_blank"
                rel="noopener noreferrer"
                className="text-base-blue hover:text-base-blue-light transition-colors"
              >
                Chainlink VRF
              </a>
            </p>
            <p className="text-xs text-gray-500">
              Provably fair and transparent raffles
            </p>
          </div>

          {/* Right side - Links */}
          <div className="flex items-center gap-4">
            <a
              href="https://docs.chain.link/vrf"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Docs
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Twitter className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-6 pt-6 border-t border-gray-800 text-center">
          <p className="text-xs text-gray-500">
            2024 BaseRaffle. Smart contract verified on{' '}
            <a
              href="https://basescan.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              BaseScan
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
