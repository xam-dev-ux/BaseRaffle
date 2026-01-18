// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {BaseRaffle} from "../src/BaseRaffle.sol";

contract DeployBaseRaffle is Script {
    // Chainlink VRF V2.5 Configuration for Base Mainnet
    address constant VRF_COORDINATOR_BASE = 0xDf24F0718E2415Cc2B3A3fb12751E1A9428AcC97;
    bytes32 constant KEY_HASH_BASE = 0x00b81c5ee9d42b3b70570c3c6b3d97affe3090e9e4b2aff3fb76b21f2ce80a85;

    // Chainlink VRF V2.5 Configuration for Base Sepolia
    address constant VRF_COORDINATOR_BASE_SEPOLIA = 0xC5E5f5C84243FDdc33c4Ed5a0b3697D7D8535cc9;
    bytes32 constant KEY_HASH_BASE_SEPOLIA = 0x9e1344a1247c8a1785d0a4681a27152bffdb43666ae5bf7d14d24a5efd44bf71;

    function run() external returns (BaseRaffle) {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        uint256 subscriptionId = vm.envUint("VRF_SUBSCRIPTION_ID");
        uint256 protocolFeeBps = vm.envUint("PROTOCOL_FEE_BPS");

        // Determine network and set appropriate addresses
        address vrfCoordinator;
        bytes32 keyHash;

        if (block.chainid == 8453) {
            // Base Mainnet
            vrfCoordinator = VRF_COORDINATOR_BASE;
            keyHash = KEY_HASH_BASE;
            console.log("Deploying to Base Mainnet");
        } else if (block.chainid == 84532) {
            // Base Sepolia
            vrfCoordinator = VRF_COORDINATOR_BASE_SEPOLIA;
            keyHash = KEY_HASH_BASE_SEPOLIA;
            console.log("Deploying to Base Sepolia");
        } else {
            revert("Unsupported network");
        }

        vm.startBroadcast(deployerPrivateKey);

        BaseRaffle raffle = new BaseRaffle(
            vrfCoordinator,
            keyHash,
            subscriptionId,
            protocolFeeBps
        );

        console.log("BaseRaffle deployed at:", address(raffle));
        console.log("VRF Coordinator:", vrfCoordinator);
        console.log("Key Hash:", vm.toString(keyHash));
        console.log("Subscription ID:", subscriptionId);
        console.log("Protocol Fee (BPS):", protocolFeeBps);

        vm.stopBroadcast();

        return raffle;
    }
}
