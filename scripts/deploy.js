const { ethers } = require("hardhat");

async function main() {
  // Deploy the secure Crud contract
  const Crud = await ethers.getContractFactory("Crud");
  const crud = await Crud.deploy();
  await crud.waitForDeployment();
  console.log(`✅ Secure Crud contract deployed to: ${crud.target}`);

  // Deploy the SC04_LackOfInputValidation_Vulnerable contract
  const SC04_Vulnerable = await ethers.getContractFactory("SC04_LackOfInputValidation_Vulnerable");
  const sc04_vulnerable = await SC04_Vulnerable.deploy();
  await sc04_vulnerable.waitForDeployment();
  console.log(`🔴 SC04_LackOfInputValidation_Vulnerable contract deployed to: ${sc04_vulnerable.target}`);

  // Deploy the SC04_LackOfInputValidation_Fixed contract
  const SC04_Fixed = await ethers.getContractFactory("SC04_LackOfInputValidation_Fixed");
  const sc04_fixed = await SC04_Fixed.deploy();
  await sc04_fixed.waitForDeployment();
  console.log(`🟢 SC04_LackOfInputValidation_Fixed contract deployed to: ${sc04_fixed.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
