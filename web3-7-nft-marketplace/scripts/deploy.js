const fs = require("fs")

async function main() {
    const [deployer] = await ethers.getSigners()
    const balance = await deployer.getBalance()
    const Marketplace = await ethers.getContractFactory("NFTMarketplace")
    const marketplace = await Marketplace.deploy()

    await marketplace.deployed()

    console.log("Contract deployed to:", marketplace.address)

    const data = {
        address: marketplace.address,
        abi: JSON.parse(marketplace.interface.format("json")),
    }

    //### This writes the ABI and address to the mktplace.json
    fs.writeFileSync("./src/Marketplace.json", JSON.stringify(data))
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
