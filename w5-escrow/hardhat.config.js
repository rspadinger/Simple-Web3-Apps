require("@nomicfoundation/hardhat-toolbox")
require("dotenv").config()

const { REACT_APP_ALCHEMY_API_URL, REACT_APP_PRIVATE_KEY, REACT_APP_ETHERSCAN_API_KEY } =
    process.env

module.exports = {
    solidity: {
        version: "0.8.17",
        settings: {
            optimizer: { enabled: true, runs: 200 },
        },
    },
    defaultNetwork: "sepolia",
    networks: {
        sepolia: {
            url: REACT_APP_ALCHEMY_API_URL,
            accounts: [`0x${REACT_APP_PRIVATE_KEY}`],
        },
    },
    etherscan: {
        apiKey: REACT_APP_ETHERSCAN_API_KEY,
    },
}
