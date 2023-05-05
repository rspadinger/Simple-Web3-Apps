require("@nomicfoundation/hardhat-toolbox")
require("@openzeppelin/hardhat-upgrades")
require("dotenv").config()

module.exports = {
    solidity: {
        version: "0.8.17",
        settings: {
            optimizer: { enabled: true, runs: 200 },
        },
    },
    defaultNetwork: "goerli",
    networks: {
        goerli: {
            url: process.env.ALCHEMY_GOERLI_URL,
            accounts: [process.env.GOERLI_PRIVATE_KEY],
        },
    },
    etherscan: {
        apiKey: process.env.ETHERSCAN_KEY,
    },
}
