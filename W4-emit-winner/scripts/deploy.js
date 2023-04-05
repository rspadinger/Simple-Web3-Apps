async function main() {
    const factory = await ethers.getContractFactory("EmitWinner")
    const myContract = await factory.deploy()

    await myContract.deployed()

    console.log("Contract deployed to:", myContract.address)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
