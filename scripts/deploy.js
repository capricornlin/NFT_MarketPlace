const hre = require('hardhat');

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log('Deploying contracts with the account:', deployer.address);

  console.log('Account balance:', (await deployer.getBalance()).toString());

  const NFTMarketPlace = await hre.ethers.getContractFactory('NFTMarketPlace');
  const nftmarketplace = await NFTMarketPlace.deploy();

  await nftmarketplace.deployed();

  console.log('NFTMarketPlace deployed to:', nftmarketplace.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
