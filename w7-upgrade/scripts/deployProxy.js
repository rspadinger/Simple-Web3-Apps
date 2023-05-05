//const { ethers, upgrades } = require("hardhat")

async function main() {
    const VendingMachineV1 = await ethers.getContractFactory("VendingMachineV1")
    const proxy = await upgrades.deployProxy(VendingMachineV1, [100])
    await proxy.deployed()

    const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxy.address)

    //0x030dD57e984405494FBcA1eB77726b2b07b94A6A
    //goerli.etherscan.io/address/0x030dD57e984405494FBcA1eB77726b2b07b94A6A#readProxyContract
    console.log("Proxy contract address: " + proxy.address)

    //0x6954334d031b6B88CCce95f3F271517C503ACB10
    //https://goerli.etherscan.io/address/0x6954334d031b6B88CCce95f3F271517C503ACB10#code
    console.log("Implementation contract address: " + implementationAddress)
}

main()
