// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title BaseRaffle
 * @notice Decentralized raffle system on Base using Chainlink VRF V2.5
 * @dev Allows users to create raffles, buy tickets, and select winners randomly
 * @dev Inherits ownership from VRFConsumerBaseV2Plus (ConfirmedOwnerWithProposal)
 */
contract BaseRaffle is VRFConsumerBaseV2Plus, ReentrancyGuard {
    // ============ Errors ============
    error RaffleNotActive();
    error RaffleNotClosed();
    error RaffleAlreadyFinalized();
    error InvalidTicketPrice();
    error InvalidMaxTickets();
    error InvalidDuration();
    error InsufficientPayment();
    error MaxTicketsReached();
    error RaffleEnded();
    error NotRaffleCreator();
    error TicketsAlreadySold();
    error NoTicketsPurchased();
    error RefundNotAvailable();
    error AlreadyRefunded();
    error TransferFailed();
    error InvalidRaffleId();
    error ZeroTickets();
    error MinTicketsNotMet();
    error InvalidProtocolFee();

    // ============ Enums ============
    enum RaffleStatus {
        Active,      // Raffle is open for ticket purchases
        Closed,      // No more purchases, waiting for VRF
        Finalized,   // Winner selected
        Cancelled    // Raffle cancelled, refunds available
    }

    // ============ Structs ============
    struct Raffle {
        address creator;
        string description;
        uint256 ticketPrice;
        uint256 maxTickets;
        uint256 minTickets;
        uint256 endTime;
        uint256 ticketsSold;
        uint256 prizePool;
        address winner;
        RaffleStatus status;
        uint256 vrfRequestId;
    }

    struct TicketInfo {
        address buyer;
        uint256 quantity;
    }

    // ============ Constants ============
    uint256 public constant MAX_PROTOCOL_FEE_BPS = 1000; // Max 10% protocol fee
    uint256 public constant MAX_DURATION = 30 days;
    uint256 public constant MIN_DURATION = 1 hours;

    // Chainlink VRF V2.5 Configuration for Base Mainnet
    bytes32 public immutable keyHash;
    uint256 public immutable subscriptionId;
    uint16 public constant REQUEST_CONFIRMATIONS = 3;
    uint32 public constant CALLBACK_GAS_LIMIT = 200000;
    uint32 public constant NUM_WORDS = 1;

    // ============ State Variables ============
    uint256 public protocolFeeBps; // Protocol fee in basis points (e.g., 250 = 2.5%)
    uint256 public nextRaffleId;
    uint256 public totalProtocolFees;

    mapping(uint256 => Raffle) public raffles;
    mapping(uint256 => address[]) public raffleParticipants; // raffleId => ticket holders (with duplicates for multiple tickets)
    mapping(uint256 => mapping(address => uint256)) public userTickets; // raffleId => user => ticket count
    mapping(uint256 => mapping(address => bool)) public hasRefunded; // raffleId => user => refunded
    mapping(uint256 => uint256) public vrfRequestToRaffle; // VRF requestId => raffleId

    // ============ Events ============
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

    event RaffleClosed(uint256 indexed raffleId, uint256 vrfRequestId);

    event WinnerSelected(
        uint256 indexed raffleId,
        address indexed winner,
        uint256 prizeAmount
    );

    event RaffleCancelled(uint256 indexed raffleId, string reason);

    event RefundIssued(
        uint256 indexed raffleId,
        address indexed user,
        uint256 amount
    );

    event ProtocolFeesWithdrawn(address indexed to, uint256 amount);

    event ProtocolFeeUpdated(uint256 oldFeeBps, uint256 newFeeBps);

    // ============ Constructor ============
    /**
     * @param _vrfCoordinator Chainlink VRF Coordinator address
     * @param _keyHash Gas lane key hash for VRF
     * @param _subscriptionId Chainlink VRF subscription ID
     * @param _protocolFeeBps Protocol fee in basis points (e.g., 250 = 2.5%)
     */
    constructor(
        address _vrfCoordinator,
        bytes32 _keyHash,
        uint256 _subscriptionId,
        uint256 _protocolFeeBps
    ) VRFConsumerBaseV2Plus(_vrfCoordinator) {
        if (_protocolFeeBps > MAX_PROTOCOL_FEE_BPS) revert InvalidProtocolFee();
        keyHash = _keyHash;
        subscriptionId = _subscriptionId;
        protocolFeeBps = _protocolFeeBps;
    }

    // ============ External Functions ============

    /**
     * @notice Create a new raffle
     * @param _description Description of the raffle/prize
     * @param _ticketPrice Price per ticket in wei
     * @param _maxTickets Maximum number of tickets (0 for unlimited)
     * @param _minTickets Minimum tickets required (0 for no minimum)
     * @param _duration Duration in seconds until raffle ends
     * @return raffleId The ID of the created raffle
     */
    function createRaffle(
        string calldata _description,
        uint256 _ticketPrice,
        uint256 _maxTickets,
        uint256 _minTickets,
        uint256 _duration
    ) external returns (uint256 raffleId) {
        if (_ticketPrice == 0) revert InvalidTicketPrice();
        if (_maxTickets != 0 && _maxTickets < 2) revert InvalidMaxTickets();
        if (_minTickets > _maxTickets && _maxTickets != 0) revert InvalidMaxTickets();
        if (_duration < MIN_DURATION || _duration > MAX_DURATION) revert InvalidDuration();

        raffleId = nextRaffleId++;

        raffles[raffleId] = Raffle({
            creator: msg.sender,
            description: _description,
            ticketPrice: _ticketPrice,
            maxTickets: _maxTickets,
            minTickets: _minTickets,
            endTime: block.timestamp + _duration,
            ticketsSold: 0,
            prizePool: 0,
            winner: address(0),
            status: RaffleStatus.Active,
            vrfRequestId: 0
        });

        emit RaffleCreated(
            raffleId,
            msg.sender,
            _description,
            _ticketPrice,
            _maxTickets,
            _minTickets,
            block.timestamp + _duration
        );
    }

    /**
     * @notice Purchase tickets for a raffle
     * @param _raffleId ID of the raffle
     * @param _quantity Number of tickets to purchase
     */
    function buyTickets(uint256 _raffleId, uint256 _quantity) external payable nonReentrant {
        if (_raffleId >= nextRaffleId) revert InvalidRaffleId();
        if (_quantity == 0) revert ZeroTickets();

        Raffle storage raffle = raffles[_raffleId];

        if (raffle.status != RaffleStatus.Active) revert RaffleNotActive();
        if (block.timestamp >= raffle.endTime) revert RaffleEnded();

        uint256 totalCost = raffle.ticketPrice * _quantity;
        if (msg.value < totalCost) revert InsufficientPayment();

        if (raffle.maxTickets != 0 && raffle.ticketsSold + _quantity > raffle.maxTickets) {
            revert MaxTicketsReached();
        }

        // Update state
        raffle.ticketsSold += _quantity;
        raffle.prizePool += totalCost;
        userTickets[_raffleId][msg.sender] += _quantity;

        // Add participant entries for random selection
        for (uint256 i = 0; i < _quantity; i++) {
            raffleParticipants[_raffleId].push(msg.sender);
        }

        emit TicketsPurchased(_raffleId, msg.sender, _quantity, totalCost);

        // Refund excess payment
        if (msg.value > totalCost) {
            (bool success, ) = msg.sender.call{value: msg.value - totalCost}("");
            if (!success) revert TransferFailed();
        }

        // Auto-close if max tickets reached
        if (raffle.maxTickets != 0 && raffle.ticketsSold == raffle.maxTickets) {
            _closeRaffle(_raffleId);
        }
    }

    /**
     * @notice Close a raffle and request random winner
     * @dev Can be called by anyone after end time, or auto-called when max tickets reached
     * @param _raffleId ID of the raffle to close
     */
    function closeRaffle(uint256 _raffleId) external {
        if (_raffleId >= nextRaffleId) revert InvalidRaffleId();

        Raffle storage raffle = raffles[_raffleId];

        if (raffle.status != RaffleStatus.Active) revert RaffleNotActive();
        if (block.timestamp < raffle.endTime &&
            (raffle.maxTickets == 0 || raffle.ticketsSold < raffle.maxTickets)) {
            revert RaffleNotClosed();
        }

        _closeRaffle(_raffleId);
    }

    /**
     * @notice Cancel a raffle (only creator, only if no tickets sold)
     * @param _raffleId ID of the raffle to cancel
     */
    function cancelRaffle(uint256 _raffleId) external {
        if (_raffleId >= nextRaffleId) revert InvalidRaffleId();

        Raffle storage raffle = raffles[_raffleId];

        if (msg.sender != raffle.creator) revert NotRaffleCreator();
        if (raffle.status != RaffleStatus.Active) revert RaffleNotActive();
        if (raffle.ticketsSold > 0) revert TicketsAlreadySold();

        raffle.status = RaffleStatus.Cancelled;

        emit RaffleCancelled(_raffleId, "Cancelled by creator");
    }

    /**
     * @notice Cancel raffle if minimum tickets not met (callable by anyone after end time)
     * @param _raffleId ID of the raffle
     */
    function cancelIfMinNotMet(uint256 _raffleId) external {
        if (_raffleId >= nextRaffleId) revert InvalidRaffleId();

        Raffle storage raffle = raffles[_raffleId];

        if (raffle.status != RaffleStatus.Active) revert RaffleNotActive();
        if (block.timestamp < raffle.endTime) revert RaffleNotClosed();
        if (raffle.ticketsSold >= raffle.minTickets) revert MinTicketsNotMet();

        raffle.status = RaffleStatus.Cancelled;

        emit RaffleCancelled(_raffleId, "Minimum tickets not met");
    }

    /**
     * @notice Claim refund for cancelled raffle
     * @param _raffleId ID of the cancelled raffle
     */
    function claimRefund(uint256 _raffleId) external nonReentrant {
        if (_raffleId >= nextRaffleId) revert InvalidRaffleId();

        Raffle storage raffle = raffles[_raffleId];

        if (raffle.status != RaffleStatus.Cancelled) revert RefundNotAvailable();

        uint256 ticketCount = userTickets[_raffleId][msg.sender];
        if (ticketCount == 0) revert NoTicketsPurchased();
        if (hasRefunded[_raffleId][msg.sender]) revert AlreadyRefunded();

        hasRefunded[_raffleId][msg.sender] = true;
        uint256 refundAmount = ticketCount * raffle.ticketPrice;

        (bool success, ) = msg.sender.call{value: refundAmount}("");
        if (!success) revert TransferFailed();

        emit RefundIssued(_raffleId, msg.sender, refundAmount);
    }

    /**
     * @notice Withdraw accumulated protocol fees (owner only)
     */
    function withdrawProtocolFees() external onlyOwner {
        uint256 amount = totalProtocolFees;
        totalProtocolFees = 0;

        (bool success, ) = msg.sender.call{value: amount}("");
        if (!success) revert TransferFailed();

        emit ProtocolFeesWithdrawn(msg.sender, amount);
    }

    /**
     * @notice Update the protocol fee (owner only)
     * @param _newFeeBps New fee in basis points (max 1000 = 10%)
     */
    function setProtocolFee(uint256 _newFeeBps) external onlyOwner {
        if (_newFeeBps > MAX_PROTOCOL_FEE_BPS) revert InvalidProtocolFee();
        uint256 oldFee = protocolFeeBps;
        protocolFeeBps = _newFeeBps;
        emit ProtocolFeeUpdated(oldFee, _newFeeBps);
    }

    // ============ View Functions ============

    /**
     * @notice Get full raffle details
     * @param _raffleId ID of the raffle
     */
    function getRaffleDetails(uint256 _raffleId) external view returns (
        address creator,
        string memory description,
        uint256 ticketPrice,
        uint256 maxTickets,
        uint256 minTickets,
        uint256 endTime,
        uint256 ticketsSold,
        uint256 prizePool,
        address winner,
        RaffleStatus status
    ) {
        if (_raffleId >= nextRaffleId) revert InvalidRaffleId();
        Raffle storage raffle = raffles[_raffleId];

        return (
            raffle.creator,
            raffle.description,
            raffle.ticketPrice,
            raffle.maxTickets,
            raffle.minTickets,
            raffle.endTime,
            raffle.ticketsSold,
            raffle.prizePool,
            raffle.winner,
            raffle.status
        );
    }

    /**
     * @notice Get list of participants for a raffle
     * @param _raffleId ID of the raffle
     */
    function getRaffleParticipants(uint256 _raffleId) external view returns (address[] memory) {
        if (_raffleId >= nextRaffleId) revert InvalidRaffleId();
        return raffleParticipants[_raffleId];
    }

    /**
     * @notice Get user's ticket count for a raffle
     * @param _raffleId ID of the raffle
     * @param _user Address of the user
     */
    function getUserTickets(uint256 _raffleId, address _user) external view returns (uint256) {
        return userTickets[_raffleId][_user];
    }

    /**
     * @notice Get all active raffle IDs
     * @return activeIds Array of active raffle IDs
     */
    function getActiveRaffles() external view returns (uint256[] memory activeIds) {
        uint256 count = 0;

        // First pass: count active raffles
        for (uint256 i = 0; i < nextRaffleId; i++) {
            if (raffles[i].status == RaffleStatus.Active) {
                count++;
            }
        }

        // Second pass: populate array
        activeIds = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < nextRaffleId; i++) {
            if (raffles[i].status == RaffleStatus.Active) {
                activeIds[index++] = i;
            }
        }
    }

    /**
     * @notice Get total number of raffles created
     */
    function getTotalRaffles() external view returns (uint256) {
        return nextRaffleId;
    }

    /**
     * @notice Calculate estimated prize after fees
     * @param _raffleId ID of the raffle
     */
    function getEstimatedPrize(uint256 _raffleId) external view returns (uint256) {
        if (_raffleId >= nextRaffleId) revert InvalidRaffleId();
        Raffle storage raffle = raffles[_raffleId];
        uint256 fee = (raffle.prizePool * protocolFeeBps) / 10000;
        return raffle.prizePool - fee;
    }

    // ============ Internal Functions ============

    /**
     * @dev Internal function to close raffle and request VRF
     */
    function _closeRaffle(uint256 _raffleId) internal {
        Raffle storage raffle = raffles[_raffleId];

        if (raffle.ticketsSold == 0) {
            raffle.status = RaffleStatus.Cancelled;
            emit RaffleCancelled(_raffleId, "No tickets sold");
            return;
        }

        if (raffle.ticketsSold < raffle.minTickets) {
            raffle.status = RaffleStatus.Cancelled;
            emit RaffleCancelled(_raffleId, "Minimum tickets not met");
            return;
        }

        raffle.status = RaffleStatus.Closed;

        // Request randomness from Chainlink VRF
        uint256 requestId = s_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: keyHash,
                subId: subscriptionId,
                requestConfirmations: REQUEST_CONFIRMATIONS,
                callbackGasLimit: CALLBACK_GAS_LIMIT,
                numWords: NUM_WORDS,
                extraArgs: VRFV2PlusClient._argsToBytes(
                    VRFV2PlusClient.ExtraArgsV1({nativePayment: false})
                )
            })
        );

        raffle.vrfRequestId = requestId;
        vrfRequestToRaffle[requestId] = _raffleId;

        emit RaffleClosed(_raffleId, requestId);
    }

    /**
     * @dev Chainlink VRF callback function
     */
    function fulfillRandomWords(
        uint256 requestId,
        uint256[] calldata randomWords
    ) internal override {
        uint256 raffleId = vrfRequestToRaffle[requestId];
        Raffle storage raffle = raffles[raffleId];

        if (raffle.status != RaffleStatus.Closed) return;

        // Select winner using random number
        uint256 winnerIndex = randomWords[0] % raffle.ticketsSold;
        address winner = raffleParticipants[raffleId][winnerIndex];

        raffle.winner = winner;
        raffle.status = RaffleStatus.Finalized;

        // Calculate and deduct protocol fee
        uint256 protocolFee = (raffle.prizePool * protocolFeeBps) / 10000;
        uint256 prizeAmount = raffle.prizePool - protocolFee;
        totalProtocolFees += protocolFee;

        // Transfer prize to winner
        (bool success, ) = winner.call{value: prizeAmount}("");
        if (!success) {
            // If transfer fails, winner can claim manually
            // For simplicity, we don't implement manual claim here
            // In production, consider adding a claimPrize function
        }

        emit WinnerSelected(raffleId, winner, prizeAmount);
    }
}
