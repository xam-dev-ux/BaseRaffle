import { base, baseSepolia } from 'wagmi/chains';

// Contract addresses per chain
export const CONTRACT_ADDRESSES: Record<number, `0x${string}`> = {
  [base.id]: '0xe954FB47a231afD03897c59A64Fe07eE5c959D1E',
  [baseSepolia.id]: '0x0000000000000000000000000000000000000000', // TODO: Replace after deployment
};

// BaseRaffle ABI - Only the functions we need on the frontend
export const BASE_RAFFLE_ABI = [
  // Read functions
  {
    inputs: [],
    name: 'nextRaffleId',
    outputs: [{ type: 'uint256', name: '' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getTotalRaffles',
    outputs: [{ type: 'uint256', name: '' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getActiveRaffles',
    outputs: [{ type: 'uint256[]', name: 'activeIds' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ type: 'uint256', name: '_raffleId' }],
    name: 'getRaffleDetails',
    outputs: [
      { type: 'address', name: 'creator' },
      { type: 'string', name: 'description' },
      { type: 'uint256', name: 'ticketPrice' },
      { type: 'uint256', name: 'maxTickets' },
      { type: 'uint256', name: 'minTickets' },
      { type: 'uint256', name: 'endTime' },
      { type: 'uint256', name: 'ticketsSold' },
      { type: 'uint256', name: 'prizePool' },
      { type: 'address', name: 'winner' },
      { type: 'uint8', name: 'status' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ type: 'uint256', name: '_raffleId' }],
    name: 'getRaffleParticipants',
    outputs: [{ type: 'address[]', name: '' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { type: 'uint256', name: '_raffleId' },
      { type: 'address', name: '_user' },
    ],
    name: 'getUserTickets',
    outputs: [{ type: 'uint256', name: '' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ type: 'uint256', name: '_raffleId' }],
    name: 'getEstimatedPrize',
    outputs: [{ type: 'uint256', name: '' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'PROTOCOL_FEE_BPS',
    outputs: [{ type: 'uint256', name: '' }],
    stateMutability: 'view',
    type: 'function',
  },
  // Write functions
  {
    inputs: [
      { type: 'string', name: '_description' },
      { type: 'uint256', name: '_ticketPrice' },
      { type: 'uint256', name: '_maxTickets' },
      { type: 'uint256', name: '_minTickets' },
      { type: 'uint256', name: '_duration' },
    ],
    name: 'createRaffle',
    outputs: [{ type: 'uint256', name: 'raffleId' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { type: 'uint256', name: '_raffleId' },
      { type: 'uint256', name: '_quantity' },
    ],
    name: 'buyTickets',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [{ type: 'uint256', name: '_raffleId' }],
    name: 'closeRaffle',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ type: 'uint256', name: '_raffleId' }],
    name: 'cancelRaffle',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ type: 'uint256', name: '_raffleId' }],
    name: 'claimRefund',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, type: 'uint256', name: 'raffleId' },
      { indexed: true, type: 'address', name: 'creator' },
      { indexed: false, type: 'string', name: 'description' },
      { indexed: false, type: 'uint256', name: 'ticketPrice' },
      { indexed: false, type: 'uint256', name: 'maxTickets' },
      { indexed: false, type: 'uint256', name: 'minTickets' },
      { indexed: false, type: 'uint256', name: 'endTime' },
    ],
    name: 'RaffleCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, type: 'uint256', name: 'raffleId' },
      { indexed: true, type: 'address', name: 'buyer' },
      { indexed: false, type: 'uint256', name: 'quantity' },
      { indexed: false, type: 'uint256', name: 'totalPaid' },
    ],
    name: 'TicketsPurchased',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, type: 'uint256', name: 'raffleId' },
      { indexed: true, type: 'address', name: 'winner' },
      { indexed: false, type: 'uint256', name: 'prizeAmount' },
    ],
    name: 'WinnerSelected',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, type: 'uint256', name: 'raffleId' },
      { indexed: false, type: 'string', name: 'reason' },
    ],
    name: 'RaffleCancelled',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, type: 'uint256', name: 'raffleId' },
      { indexed: true, type: 'address', name: 'user' },
      { indexed: false, type: 'uint256', name: 'amount' },
    ],
    name: 'RefundIssued',
    type: 'event',
  },
] as const;
