const { ethers } = require("hardhat");

async function main() {
  const Crud = await ethers.getContractFactory("Crud");
  const crud = await Crud.deploy();

  await crud.waitForDeployment();

  console.log(`Crud contract deployed to: ${crud.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
