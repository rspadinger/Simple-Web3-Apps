// Contract on Sepolia: 0x7a8F36e0F99AADA22d0769d8290338712d1E06ef

async function main() {
    let priceFeedAddress = "0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43" // BTC/USD

    priceFeedAddress = await deployMockPriceFeed()

    await deployChainLinkPriceFeed(priceFeedAddress)

    //await deployBullBearContract()
}

async function deployBullBearContract() {
    const factory = await ethers.getContractFactory("BullBear")
    const myContract = await factory.deploy()
    await myContract.deployed()

    console.log("BullBear contract deployed to:", myContract.address)
}

async function deployMockPriceFeed() {
    const factory = await ethers.getContractFactory("MockPriceFeed")
    const myContract = await factory.deploy(8, 2000000000000) //20k BTC price with 8 decimals
    await myContract.deployed()
    console.log("MockPriceFeed deployed to:", myContract.address)

    return myContract.address
}

async function deployChainLinkPriceFeed(priceFeedAddress) {
    const factory = await ethers.getContractFactory("ChainLinkPriceFeed")
    const myContract = await factory.deploy(priceFeedAddress)
    await myContract.deployed()

    console.log("ChainLinkPriceFeed deployed to:", myContract.address)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Err: ", error)
        process.exit(1)
    })
