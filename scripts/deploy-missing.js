const { ethers } = require('hardhat');
require('dotenv').config();

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying missing contracts with account:', deployer.address);
  
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log('Account balance:', balance.toString());

  // Use existing contract addresses
  const mockUSDTAddress = '0x3477c5AdA74b2a50a1Fc93dbDa569fAffE4c07e7';
  const gameTokenAddress = '0xA5E7f98A21C4215B2762029ce0e58B4b4FfF2d5a';
  const tokenStoreAddress = '0x60D15c8848E212D8BD5373741D0D5E233316649d';

  // Deploy only PlayGame
  const PlayGame = await ethers.getContractFactory('PlayGame');
  const playGame = await PlayGame.deploy(gameTokenAddress, tokenStoreAddress, mockUSDTAddress);
  await playGame.waitForDeployment();
  
  console.log('PlayGame deployed to:', await playGame.getAddress());
  
  // Update .env file
  const fs = require('fs');
  let envContent = fs.readFileSync('.env', 'utf8');
  envContent = envContent.replace(/MOCK_USDT_ADDRESS=.*/, MOCK_USDT_ADDRESS=);
  envContent = envContent.replace(/GAME_TOKEN_ADDRESS=.*/, GAME_TOKEN_ADDRESS=);
  envContent = envContent.replace(/TOKEN_STORE_ADDRESS=.*/, TOKEN_STORE_ADDRESS=);
  envContent = envContent.replace(/PLAY_GAME_ADDRESS=.*/, PLAY_GAME_ADDRESS=);
  fs.writeFileSync('.env', envContent);
  
  console.log('All contracts ready!');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
