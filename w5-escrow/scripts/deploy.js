async function main() {
    const factory = await ethers.getContractFactory("EscrowFactory")
    const myContract = await factory.deploy()

    await myContract.deployed()

    console.log("Contract deployed to:", myContract.address)

    //createEscrow()
}

async function createEscrow() {
    const [depositor, arbiter, beneficiary] = await ethers.getSigners()

    // create new escrow
    let txn = await myContract.createEscrow(
        depositor.address,
        arbiter.address,
        beneficiary.address,
        {
            value: ethers.utils.parseEther("1"),
        }
    )
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
