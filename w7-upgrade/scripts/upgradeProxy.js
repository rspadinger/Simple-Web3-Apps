//const { ethers, upgrades } = require("hardhat")

// TO DO: Place the address of your proxy here!
const proxyAddress = "0x030dD57e984405494FBcA1eB77726b2b07b94A6A"

async function main() {
    const VendingMachineV2 = await ethers.getContractFactory("VendingMachineV2")
    const upgraded = await upgrades.upgradeProxy(proxyAddress, VendingMachineV2)

    const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress)

    console.log("The current contract owner is: " + (await upgraded.owner()))

    //0x2Ce74e17E78d456e0f11520E7A90fE8f155Bc53e
    //https://goerli.etherscan.io/address/0x2Ce74e17E78d456e0f11520E7A90fE8f155Bc53e#code
    console.log("Implementation contract address: " + implementationAddress)
}

main()
