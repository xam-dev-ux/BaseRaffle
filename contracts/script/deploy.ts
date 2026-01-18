import { ethers, network } from "hardhat";

// Chainlink VRF V2.5 Configuration
const VRF_CONFIG = {
  // Base Mainnet
  8453: {
    vrfCoordinator: "0xDf24F0718E2415Cc2B3A3fb12751E1A9428AcC97",
    keyHash: "0x00b81c5ee9d42b3b70570c3c6b3d97affe3090e9e4b2aff3fb76b21f2ce80a85",
  },
  // Base Sepolia
  84532: {
    vrfCoordinator: "0xC5E5F5C84243FDdC33c4ed5A0B3697D7D8535Cc9",
    keyHash: "0x9e1344a1247c8a1785d0a4681a27152bffdb43666ae5bf7d14d24a5efd44bf71",
  },
};

async function main() {
  const chainId = network.config.chainId;

  if (!chainId || !VRF_CONFIG[chainId as keyof typeof VRF_CONFIG]) {
    throw new Error(`Unsupported network: chainId=${chainId}`);
  }

  const config = VRF_CONFIG[chainId as keyof typeof VRF_CONFIG];
  const subscriptionId = process.env.VRF_SUBSCRIPTION_ID;
  const protocolFeeBps = process.env.PROTOCOL_FEE_BPS;

  if (!subscriptionId) {
    throw new Error("VRF_SUBSCRIPTION_ID environment variable not set");
  }

  if (!protocolFeeBps) {
    throw new Error("PROTOCOL_FEE_BPS environment variable not set");
  }

  const feeBps = parseInt(protocolFeeBps);
  if (isNaN(feeBps) || feeBps < 0 || feeBps > 1000) {
    throw new Error("PROTOCOL_FEE_BPS must be between 0 and 1000 (0-10%)");
  }

  console.log(`Deploying to network with chainId: ${chainId}`);
  console.log(`VRF Coordinator: ${config.vrfCoordinator}`);
  console.log(`Key Hash: ${config.keyHash}`);
  console.log(`Subscription ID: ${subscriptionId}`);
  console.log(`Protocol Fee: ${feeBps} BPS (${feeBps / 100}%)`);

  const [deployer] = await ethers.getSigners();
  console.log(`Deploying with account: ${deployer.address}`);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Account balance: ${ethers.formatEther(balance)} ETH`);

  const BaseRaffle = await ethers.getContractFactory("BaseRaffle");
  const raffle = await BaseRaffle.deploy(
    config.vrfCoordinator,
    config.keyHash,
    BigInt(subscriptionId),
    BigInt(feeBps)
  );

  await raffle.waitForDeployment();

  const address = await raffle.getAddress();
  console.log(`BaseRaffle deployed to: ${address}`);

  // Wait for a few blocks before verification
  console.log("Waiting for block confirmations...");
  await raffle.deploymentTransaction()?.wait(5);

  console.log("\nDeployment complete!");
  console.log("\nIMPORTANT: Add the contract address as a consumer to your VRF subscription:");
  console.log(`Contract Address: ${address}`);
  console.log(`Subscription ID: ${subscriptionId}`);

  // Output verification command
  console.log("\nTo verify on BaseScan, run:");
  console.log(
    `npx hardhat verify --network ${network.name} ${address} "${config.vrfCoordinator}" "${config.keyHash}" "${subscriptionId}" "${feeBps}"`
  );

  return address;
}

main()
  .then((address) => {
    console.log(`\nContract deployed at: ${address}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
