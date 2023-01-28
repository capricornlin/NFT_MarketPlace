// const fs = require('fs');
require('@nomiclabs/hardhat-waffle');
require('dotenv').config();

module.exports = {
  solidity: '0.8.4',
  networks: {
    goerli: {
      url: 'https://goerli.infura.io/v3/4a336c45a610447ebcc52981cd8e43c3',
      accounts: [`0x${process.env.PRIVATE_KEY}`],
    },
  },
};

// hardhat: {
//     chainId: 1337,
//    },
