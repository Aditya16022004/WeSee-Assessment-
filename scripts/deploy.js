const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Deploy MockUSDT first
  const MockUSDT = await ethers.getContractFactory("MockUSDT");
  const mockUSDT = await MockUSDT.deploy();
  await mockUSDT.waitForDeployment();
  console.log("MockUSDT deployed to:", await mockUSDT.getAddress());

  // Deploy GameToken
  const GameToken = await ethers.getContractFactory("GameToken");
  const gameToken = await GameToken.deploy();
  await gameToken.waitForDeployment();
  console.log("GameToken deployed to:", await gameToken.getAddress());

  // Deploy TokenStore
  const gtPerUsdt = ethers.parseEther("1"); // 1 USDT = 1 GT
  const TokenStore = await ethers.getContractFactory("TokenStore");
  const tokenStore = await TokenStore.deploy(
    await mockUSDT.getAddress(),
    await gameToken.getAddress(),
    gtPerUsdt
  );
  await tokenStore.waitForDeployment();
  console.log("TokenStore deployed to:", await tokenStore.getAddress());

  // Deploy PlayGame
  const PlayGame = await ethers.getContractFactory("PlayGame");
  const playGame = await PlayGame.deploy(await gameToken.getAddress());
  await playGame.waitForDeployment();
  console.log("PlayGame deployed to:", await playGame.getAddress());

  // Set up permissions
  await gameToken.setTokenStoreContract(await tokenStore.getAddress());
  console.log("GameToken permissions set");

  // Transfer ownership of PlayGame to deployer (will be transferred to backend later)
  console.log("All contracts deployed successfully!");

  // Save deployment addresses
  const deploymentInfo = {
    mockUSDT: await mockUSDT.getAddress(),
    gameToken: await gameToken.getAddress(),
    tokenStore: await tokenStore.getAddress(),
    playGame: await playGame.getAddress(),
    deployer: deployer.address
  };

  console.log("\nDeployment Summary:");
  console.log("====================");
  console.log("MockUSDT:", deploymentInfo.mockUSDT);
  console.log("GameToken:", deploymentInfo.gameToken);
  console.log("TokenStore:", deploymentInfo.tokenStore);
  console.log("PlayGame:", deploymentInfo.playGame);
  console.log("Deployer:", deploymentInfo.deployer);

  // Update .env with contract addresses only (preserve existing values for keys like RPC_URL and BACKEND_PRIVATE_KEY)
  const fs = require('fs');
  const path = require('path');
  const envPath = path.resolve(process.cwd(), '.env');
  let envLines = [];
  if (fs.existsSync(envPath)) {
    envLines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  } else {
    envLines = [
      '# Contract Addresses',
      'MOCK_USDT_ADDRESS=',
      'GAME_TOKEN_ADDRESS=',
      'TOKEN_STORE_ADDRESS=',
      'PLAY_GAME_ADDRESS=',
      '',
      '# Network Configuration',
      'RPC_URL=',
      'CHAIN_ID=',
      '',
      '# Backend Configuration',
      'BACKEND_PRIVATE_KEY=',
      'BACKEND_PORT=3000',
      '',
      '# Indexer Configuration',
      'INDEXER_PORT=3001'
    ];
  }

  const setOrAppend = (key, value) => {
    const idx = envLines.findIndex(l => l.startsWith(key + '='));
    const line = `${key}=${value}`;
    if (idx >= 0) envLines[idx] = line; else envLines.push(line);
  };

  setOrAppend('MOCK_USDT_ADDRESS', deploymentInfo.mockUSDT);
  setOrAppend('GAME_TOKEN_ADDRESS', deploymentInfo.gameToken);
  setOrAppend('TOKEN_STORE_ADDRESS', deploymentInfo.tokenStore);
  setOrAppend('PLAY_GAME_ADDRESS', deploymentInfo.playGame);

  fs.writeFileSync(envPath, envLines.join('\n'));
  console.log("\nUpdated .env with deployed contract addresses");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
