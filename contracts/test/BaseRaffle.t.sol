// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console} from "forge-std/Test.sol";
import {BaseRaffle} from "../src/BaseRaffle.sol";
import {VRFCoordinatorV2_5Mock} from "@chainlink/contracts/src/v0.8/vrf/mocks/VRFCoordinatorV2_5Mock.sol";

contract BaseRaffleTest is Test {
    BaseRaffle public raffle;
    VRFCoordinatorV2_5Mock public vrfCoordinator;

    address public owner = makeAddr("owner");
    address public alice = makeAddr("alice");
    address public bob = makeAddr("bob");
    address public charlie = makeAddr("charlie");

    bytes32 public constant KEY_HASH = bytes32(uint256(1));
    uint256 public subscriptionId;
    uint256 public constant PROTOCOL_FEE_BPS = 250; // 2.5%

    uint256 public constant TICKET_PRICE = 0.01 ether;
    uint256 public constant MAX_TICKETS = 100;
    uint256 public constant MIN_TICKETS = 2;
    uint256 public constant DURATION = 1 days;

    event RaffleCreated(
        uint256 indexed raffleId,
        address indexed creator,
        string description,
        uint256 ticketPrice,
        uint256 maxTickets,
        uint256 minTickets,
        uint256 endTime
    );

    event TicketsPurchased(
        uint256 indexed raffleId,
        address indexed buyer,
        uint256 quantity,
        uint256 totalPaid
    );

    event WinnerSelected(
        uint256 indexed raffleId,
        address indexed winner,
        uint256 prizeAmount
    );

    event RaffleCancelled(uint256 indexed raffleId, string reason);

    function setUp() public {
        vm.startPrank(owner);

        // Deploy VRF Coordinator Mock
        // Constructor args: baseFee, gasPriceLink, weiPerUnitLink
        vrfCoordinator = new VRFCoordinatorV2_5Mock(100000, 100000, 1e18);

        // Create subscription
        subscriptionId = vrfCoordinator.createSubscription();

        // Fund subscription
        vrfCoordinator.fundSubscription(subscriptionId, 100 ether);

        // Deploy raffle contract
        raffle = new BaseRaffle(
            address(vrfCoordinator),
            KEY_HASH,
            subscriptionId,
            PROTOCOL_FEE_BPS
        );

        // Add raffle as consumer
        vrfCoordinator.addConsumer(subscriptionId, address(raffle));

        vm.stopPrank();

        // Fund test accounts
        vm.deal(alice, 100 ether);
        vm.deal(bob, 100 ether);
        vm.deal(charlie, 100 ether);
    }

    // ============ Create Raffle Tests ============

    function test_CreateRaffle() public {
        vm.startPrank(alice);

        vm.expectEmit(true, true, false, true);
        emit RaffleCreated(
            0,
            alice,
            "Test Raffle",
            TICKET_PRICE,
            MAX_TICKETS,
            MIN_TICKETS,
            block.timestamp + DURATION
        );

        uint256 raffleId = raffle.createRaffle(
            "Test Raffle",
            TICKET_PRICE,
            MAX_TICKETS,
            MIN_TICKETS,
            DURATION
        );

        assertEq(raffleId, 0);

        (
            address creator,
            string memory description,
            uint256 ticketPrice,
            uint256 maxTickets,
            uint256 minTickets,
            uint256 endTime,
            uint256 ticketsSold,
            uint256 prizePool,
            address winner,
            BaseRaffle.RaffleStatus status
        ) = raffle.getRaffleDetails(0);

        assertEq(creator, alice);
        assertEq(description, "Test Raffle");
        assertEq(ticketPrice, TICKET_PRICE);
        assertEq(maxTickets, MAX_TICKETS);
        assertEq(minTickets, MIN_TICKETS);
        assertEq(endTime, block.timestamp + DURATION);
        assertEq(ticketsSold, 0);
        assertEq(prizePool, 0);
        assertEq(winner, address(0));
        assertEq(uint256(status), uint256(BaseRaffle.RaffleStatus.Active));

        vm.stopPrank();
    }

    function test_CreateRaffle_RevertInvalidPrice() public {
        vm.startPrank(alice);

        vm.expectRevert(BaseRaffle.InvalidTicketPrice.selector);
        raffle.createRaffle("Test", 0, MAX_TICKETS, MIN_TICKETS, DURATION);

        vm.stopPrank();
    }

    function test_CreateRaffle_RevertInvalidMaxTickets() public {
        vm.startPrank(alice);

        vm.expectRevert(BaseRaffle.InvalidMaxTickets.selector);
        raffle.createRaffle("Test", TICKET_PRICE, 1, 0, DURATION); // max < 2

        vm.stopPrank();
    }

    function test_CreateRaffle_RevertInvalidDuration() public {
        vm.startPrank(alice);

        vm.expectRevert(BaseRaffle.InvalidDuration.selector);
        raffle.createRaffle("Test", TICKET_PRICE, MAX_TICKETS, MIN_TICKETS, 30 minutes); // too short

        vm.expectRevert(BaseRaffle.InvalidDuration.selector);
        raffle.createRaffle("Test", TICKET_PRICE, MAX_TICKETS, MIN_TICKETS, 31 days); // too long

        vm.stopPrank();
    }

    function test_CreateRaffle_UnlimitedTickets() public {
        vm.startPrank(alice);

        uint256 raffleId = raffle.createRaffle(
            "Unlimited Raffle",
            TICKET_PRICE,
            0, // unlimited
            0, // no minimum
            DURATION
        );

        (,, , uint256 maxTickets, , , , , ,) = raffle.getRaffleDetails(raffleId);
        assertEq(maxTickets, 0);

        vm.stopPrank();
    }

    // ============ Buy Tickets Tests ============

    function test_BuyTickets() public {
        _createDefaultRaffle();

        vm.startPrank(bob);

        vm.expectEmit(true, true, false, true);
        emit TicketsPurchased(0, bob, 5, 5 * TICKET_PRICE);

        raffle.buyTickets{value: 5 * TICKET_PRICE}(0, 5);

        assertEq(raffle.getUserTickets(0, bob), 5);

        (,, , , , , uint256 ticketsSold, uint256 prizePool, ,) = raffle.getRaffleDetails(0);
        assertEq(ticketsSold, 5);
        assertEq(prizePool, 5 * TICKET_PRICE);

        vm.stopPrank();
    }

    function test_BuyTickets_RefundExcess() public {
        _createDefaultRaffle();

        vm.startPrank(bob);

        uint256 balanceBefore = bob.balance;
        uint256 excess = 0.1 ether;

        raffle.buyTickets{value: TICKET_PRICE + excess}(0, 1);

        assertEq(bob.balance, balanceBefore - TICKET_PRICE);

        vm.stopPrank();
    }

    function test_BuyTickets_RevertInsufficientPayment() public {
        _createDefaultRaffle();

        vm.startPrank(bob);

        vm.expectRevert(BaseRaffle.InsufficientPayment.selector);
        raffle.buyTickets{value: TICKET_PRICE - 1}(0, 1);

        vm.stopPrank();
    }

    function test_BuyTickets_RevertRaffleEnded() public {
        _createDefaultRaffle();

        vm.warp(block.timestamp + DURATION + 1);

        vm.startPrank(bob);

        vm.expectRevert(BaseRaffle.RaffleEnded.selector);
        raffle.buyTickets{value: TICKET_PRICE}(0, 1);

        vm.stopPrank();
    }

    function test_BuyTickets_RevertMaxTicketsReached() public {
        vm.prank(alice);
        raffle.createRaffle("Small Raffle", TICKET_PRICE, 5, 0, DURATION);

        vm.startPrank(bob);

        vm.expectRevert(BaseRaffle.MaxTicketsReached.selector);
        raffle.buyTickets{value: 6 * TICKET_PRICE}(0, 6);

        vm.stopPrank();
    }

    function test_BuyTickets_AutoCloseWhenMaxReached() public {
        vm.prank(alice);
        raffle.createRaffle("Small Raffle", TICKET_PRICE, 3, 0, DURATION);

        vm.prank(bob);
        raffle.buyTickets{value: 2 * TICKET_PRICE}(0, 2);

        vm.prank(charlie);
        raffle.buyTickets{value: TICKET_PRICE}(0, 1); // This should auto-close

        (,, , , , , , , , BaseRaffle.RaffleStatus status) = raffle.getRaffleDetails(0);
        assertEq(uint256(status), uint256(BaseRaffle.RaffleStatus.Closed));
    }

    // ============ Close Raffle Tests ============

    function test_CloseRaffle() public {
        _createDefaultRaffle();

        // Buy tickets
        vm.prank(bob);
        raffle.buyTickets{value: 2 * TICKET_PRICE}(0, 2);

        vm.prank(charlie);
        raffle.buyTickets{value: TICKET_PRICE}(0, 1);

        // Warp to after end time
        vm.warp(block.timestamp + DURATION + 1);

        // Close raffle
        raffle.closeRaffle(0);

        (,, , , , , , , , BaseRaffle.RaffleStatus status) = raffle.getRaffleDetails(0);
        assertEq(uint256(status), uint256(BaseRaffle.RaffleStatus.Closed));
    }

    function test_CloseRaffle_RevertBeforeEndTime() public {
        _createDefaultRaffle();

        vm.prank(bob);
        raffle.buyTickets{value: 2 * TICKET_PRICE}(0, 2);

        vm.expectRevert(BaseRaffle.RaffleNotClosed.selector);
        raffle.closeRaffle(0);
    }

    function test_CloseRaffle_CancelledIfNoTickets() public {
        _createDefaultRaffle();

        vm.warp(block.timestamp + DURATION + 1);

        vm.expectEmit(true, false, false, true);
        emit RaffleCancelled(0, "No tickets sold");

        raffle.closeRaffle(0);

        (,, , , , , , , , BaseRaffle.RaffleStatus status) = raffle.getRaffleDetails(0);
        assertEq(uint256(status), uint256(BaseRaffle.RaffleStatus.Cancelled));
    }

    function test_CloseRaffle_CancelledIfMinNotMet() public {
        vm.prank(alice);
        raffle.createRaffle("Min Required", TICKET_PRICE, MAX_TICKETS, 5, DURATION);

        // Buy only 2 tickets (min is 5)
        vm.prank(bob);
        raffle.buyTickets{value: 2 * TICKET_PRICE}(0, 2);

        vm.warp(block.timestamp + DURATION + 1);

        vm.expectEmit(true, false, false, true);
        emit RaffleCancelled(0, "Minimum tickets not met");

        raffle.closeRaffle(0);

        (,, , , , , , , , BaseRaffle.RaffleStatus status) = raffle.getRaffleDetails(0);
        assertEq(uint256(status), uint256(BaseRaffle.RaffleStatus.Cancelled));
    }

    // ============ Cancel Raffle Tests ============

    function test_CancelRaffle() public {
        _createDefaultRaffle();

        vm.prank(alice);

        vm.expectEmit(true, false, false, true);
        emit RaffleCancelled(0, "Cancelled by creator");

        raffle.cancelRaffle(0);

        (,, , , , , , , , BaseRaffle.RaffleStatus status) = raffle.getRaffleDetails(0);
        assertEq(uint256(status), uint256(BaseRaffle.RaffleStatus.Cancelled));
    }

    function test_CancelRaffle_RevertNotCreator() public {
        _createDefaultRaffle();

        vm.prank(bob);

        vm.expectRevert(BaseRaffle.NotRaffleCreator.selector);
        raffle.cancelRaffle(0);
    }

    function test_CancelRaffle_RevertTicketsAlreadySold() public {
        _createDefaultRaffle();

        vm.prank(bob);
        raffle.buyTickets{value: TICKET_PRICE}(0, 1);

        vm.prank(alice);

        vm.expectRevert(BaseRaffle.TicketsAlreadySold.selector);
        raffle.cancelRaffle(0);
    }

    // ============ Refund Tests ============

    function test_ClaimRefund() public {
        vm.prank(alice);
        raffle.createRaffle("Refund Test", TICKET_PRICE, MAX_TICKETS, 10, DURATION);

        // Buy tickets (less than minimum)
        vm.prank(bob);
        raffle.buyTickets{value: 3 * TICKET_PRICE}(0, 3);

        vm.warp(block.timestamp + DURATION + 1);

        // Close (will be cancelled due to min not met)
        raffle.closeRaffle(0);

        // Claim refund
        uint256 balanceBefore = bob.balance;

        vm.prank(bob);
        raffle.claimRefund(0);

        assertEq(bob.balance, balanceBefore + 3 * TICKET_PRICE);
    }

    function test_ClaimRefund_RevertNotCancelled() public {
        _createDefaultRaffle();

        vm.prank(bob);
        raffle.buyTickets{value: TICKET_PRICE}(0, 1);

        vm.prank(bob);

        vm.expectRevert(BaseRaffle.RefundNotAvailable.selector);
        raffle.claimRefund(0);
    }

    function test_ClaimRefund_RevertAlreadyRefunded() public {
        vm.prank(alice);
        raffle.createRaffle("Refund Test", TICKET_PRICE, MAX_TICKETS, 10, DURATION);

        vm.prank(bob);
        raffle.buyTickets{value: TICKET_PRICE}(0, 1);

        vm.warp(block.timestamp + DURATION + 1);
        raffle.closeRaffle(0);

        vm.startPrank(bob);
        raffle.claimRefund(0);

        vm.expectRevert(BaseRaffle.AlreadyRefunded.selector);
        raffle.claimRefund(0);
        vm.stopPrank();
    }

    // ============ Winner Selection Tests ============

    function test_WinnerSelection() public {
        _createDefaultRaffle();

        // Buy tickets
        vm.prank(bob);
        raffle.buyTickets{value: 2 * TICKET_PRICE}(0, 2);

        vm.prank(charlie);
        raffle.buyTickets{value: 3 * TICKET_PRICE}(0, 3);

        vm.warp(block.timestamp + DURATION + 1);
        raffle.closeRaffle(0);

        // Get the request ID
        (,, , , , , , , , BaseRaffle.RaffleStatus statusBefore) = raffle.getRaffleDetails(0);
        assertEq(uint256(statusBefore), uint256(BaseRaffle.RaffleStatus.Closed));

        // Fulfill random words (this simulates Chainlink VRF callback)
        // The request ID should be 1 (first request)
        vrfCoordinator.fulfillRandomWords(1, address(raffle));

        (,, , , , , uint256 ticketsSold, uint256 prizePool, address winner, BaseRaffle.RaffleStatus statusAfter) = raffle.getRaffleDetails(0);

        assertEq(uint256(statusAfter), uint256(BaseRaffle.RaffleStatus.Finalized));
        assertTrue(winner == bob || winner == charlie);

        // Check prize was transferred (minus 2.5% fee)
        uint256 expectedFee = (prizePool * 250) / 10000;
        uint256 expectedPrize = prizePool - expectedFee;

        if (winner == bob) {
            assertGe(bob.balance, 100 ether - 2 * TICKET_PRICE + expectedPrize);
        } else {
            assertGe(charlie.balance, 100 ether - 3 * TICKET_PRICE + expectedPrize);
        }

        assertEq(raffle.totalProtocolFees(), expectedFee);
    }

    // ============ View Functions Tests ============

    function test_GetActiveRaffles() public {
        // Create multiple raffles
        vm.startPrank(alice);
        raffle.createRaffle("Raffle 1", TICKET_PRICE, MAX_TICKETS, 0, DURATION);
        raffle.createRaffle("Raffle 2", TICKET_PRICE, MAX_TICKETS, 0, DURATION);
        raffle.createRaffle("Raffle 3", TICKET_PRICE, MAX_TICKETS, 0, DURATION);
        vm.stopPrank();

        // Cancel one
        vm.prank(alice);
        raffle.cancelRaffle(1);

        uint256[] memory active = raffle.getActiveRaffles();

        assertEq(active.length, 2);
        assertEq(active[0], 0);
        assertEq(active[1], 2);
    }

    function test_GetRaffleParticipants() public {
        _createDefaultRaffle();

        vm.prank(bob);
        raffle.buyTickets{value: 2 * TICKET_PRICE}(0, 2);

        vm.prank(charlie);
        raffle.buyTickets{value: 3 * TICKET_PRICE}(0, 3);

        address[] memory participants = raffle.getRaffleParticipants(0);

        assertEq(participants.length, 5);

        // First 2 should be bob
        assertEq(participants[0], bob);
        assertEq(participants[1], bob);

        // Last 3 should be charlie
        assertEq(participants[2], charlie);
        assertEq(participants[3], charlie);
        assertEq(participants[4], charlie);
    }

    function test_GetEstimatedPrize() public {
        _createDefaultRaffle();

        vm.prank(bob);
        raffle.buyTickets{value: 10 * TICKET_PRICE}(0, 10);

        uint256 totalPool = 10 * TICKET_PRICE; // 0.1 ether
        uint256 expectedFee = (totalPool * 250) / 10000; // 2.5%
        uint256 expectedPrize = totalPool - expectedFee;

        assertEq(raffle.getEstimatedPrize(0), expectedPrize);
    }

    // ============ Protocol Fees Tests ============

    function test_WithdrawProtocolFees() public {
        _createDefaultRaffle();

        // Complete a raffle
        vm.prank(bob);
        raffle.buyTickets{value: 10 * TICKET_PRICE}(0, 10);

        vm.warp(block.timestamp + DURATION + 1);
        raffle.closeRaffle(0);
        vrfCoordinator.fulfillRandomWords(1, address(raffle));

        uint256 fees = raffle.totalProtocolFees();
        assertTrue(fees > 0);

        uint256 ownerBalanceBefore = owner.balance;

        vm.prank(owner);
        raffle.withdrawProtocolFees();

        assertEq(owner.balance, ownerBalanceBefore + fees);
        assertEq(raffle.totalProtocolFees(), 0);
    }

    function test_WithdrawProtocolFees_RevertNotOwner() public {
        vm.prank(bob);
        vm.expectRevert();
        raffle.withdrawProtocolFees();
    }

    // ============ Helper Functions ============

    function _createDefaultRaffle() internal {
        vm.prank(alice);
        raffle.createRaffle(
            "Test Raffle",
            TICKET_PRICE,
            MAX_TICKETS,
            MIN_TICKETS,
            DURATION
        );
    }
}
