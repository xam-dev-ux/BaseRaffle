export enum RaffleStatus {
  Active = 0,
  Closed = 1,
  Finalized = 2,
  Cancelled = 3,
}

export interface Raffle {
  id: bigint;
  creator: `0x${string}`;
  description: string;
  ticketPrice: bigint;
  maxTickets: bigint;
  minTickets: bigint;
  endTime: bigint;
  ticketsSold: bigint;
  prizePool: bigint;
  winner: `0x${string}`;
  status: RaffleStatus;
}

export interface RaffleWithParticipants extends Raffle {
  participants: `0x${string}`[];
}

export interface CreateRaffleParams {
  description: string;
  ticketPrice: bigint;
  maxTickets: bigint;
  minTickets: bigint;
  duration: bigint;
}

export interface BuyTicketsParams {
  raffleId: bigint;
  quantity: bigint;
  value: bigint;
}

export type RaffleFilter = 'all' | 'active' | 'finalized' | 'my-raffles' | 'my-tickets';
