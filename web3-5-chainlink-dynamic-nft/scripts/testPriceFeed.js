let signer, txn, txnReceipt

async function main() {
    const provider = ethers.provider
    ;[signer] = await ethers.getSigners()

    feed = await ethers.getContractAt(
        "ChainLinkPriceFeed",
        "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
    )

    console.log(await feed.getPrice())
}

main()
