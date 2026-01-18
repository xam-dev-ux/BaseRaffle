import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatEther, parseEther } from 'viem';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAddress(address: string, length = 4): string {
  if (!address) return '';
  return `${address.slice(0, length + 2)}...${address.slice(-length)}`;
}

export function formatETH(wei: bigint, decimals = 4): string {
  const eth = formatEther(wei);
  const num = parseFloat(eth);
  if (num === 0) return '0';
  if (num < 0.0001) return '<0.0001';
  return num.toFixed(decimals).replace(/\.?0+$/, '');
}

export function parseETH(eth: string): bigint {
  return parseEther(eth);
}

export function formatNumber(num: number | bigint): string {
  return new Intl.NumberFormat('en-US').format(num);
}

export function formatTimeRemaining(endTime: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = endTime - now;

  if (diff <= 0) return 'Ended';

  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  const seconds = diff % 60;

  if (days > 0) {
    return `${days}d ${hours}h`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function calculateWinProbability(userTickets: number, totalTickets: number): number {
  if (totalTickets === 0) return 0;
  return (userTickets / totalTickets) * 100;
}

export function getExplorerUrl(chainId: number, hash: string, type: 'tx' | 'address' = 'tx'): string {
  const baseUrl = chainId === 8453
    ? 'https://basescan.org'
    : 'https://sepolia.basescan.org';

  return `${baseUrl}/${type}/${hash}`;
}

export const RaffleStatus = {
  Active: 0,
  Closed: 1,
  Finalized: 2,
  Cancelled: 3,
} as const;

export type RaffleStatusType = (typeof RaffleStatus)[keyof typeof RaffleStatus];

export function getStatusLabel(status: number): string {
  switch (status) {
    case RaffleStatus.Active:
      return 'Active';
    case RaffleStatus.Closed:
      return 'Drawing...';
    case RaffleStatus.Finalized:
      return 'Completed';
    case RaffleStatus.Cancelled:
      return 'Cancelled';
    default:
      return 'Unknown';
  }
}

export function getStatusColor(status: number): string {
  switch (status) {
    case RaffleStatus.Active:
      return 'badge-active';
    case RaffleStatus.Closed:
      return 'badge-closed';
    case RaffleStatus.Finalized:
      return 'badge-finalized';
    case RaffleStatus.Cancelled:
      return 'badge-cancelled';
    default:
      return 'badge';
  }
}
