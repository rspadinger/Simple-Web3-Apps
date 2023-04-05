const { PRIVATE_KEY } = process.env

async function main() {
    let provider = ethers.provider
    let contract = await ethers.getContractAt("EmitWinner", "0x81821e23fA18Bc9a36a0EfF7E2aAb9d5703F1A26")
    let signer = new ethers.Wallet(PRIVATE_KEY, provider)

    let txn = await contract.callAttempt()
    let txnReceipt = await txn.wait()

    console.log("Txn Receipt: ", txnReceipt)

    // Link to event log: https://goerli.etherscan.io/tx/0x04d14b934adfbff53f35bc6172d2c1e6347a010d1517a461352f042c8ccfdd00#eventlog
}

main()