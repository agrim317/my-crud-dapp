const { ethers } = require("hardhat");

async function main() {
  // Deploy the secure Crud contract
  const Crud = await ethers.getContractFactory("Crud");
  const crud = await Crud.deploy();
  await crud.waitForDeployment();
  console.log(`✅ Secure Crud contract deployed to: ${crud.target}`);

  // Deploy the VulnerableCrud contract
  const VulnerableCrud = await ethers.getContractFactory("VulnerableCrud");
  const vulnerableCrud = await VulnerableCrud.deploy();
  await vulnerableCrud.waitForDeployment();
  console.log(`🔴 VulnerableCrud contract deployed to: ${vulnerableCrud.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});