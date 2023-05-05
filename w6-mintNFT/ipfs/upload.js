async function run() {
    const { create } = await import("ipfs-http-client")
    const ipfs = await create()

    // we added three attributes, add as many as you want!
    // Qmd17pF2uHL1ZocvZi6yH4651ka6wNRUcMsDBW9mc14J1H
    const metadata = {
        path: "/",
        content: JSON.stringify({
            name: "My First NFT",
            attributes: [
                {
                    trait_type: "Peace",
                    value: "10",
                },
                {
                    trait_type: "Love",
                    value: "100",
                },
                {
                    trait_type: "Web3",
                    value: "1000",
                },
            ],
            // update the IPFS CID to be your image CID
            image: "https://ipfs.io/ipfs/Qmd17pF2uHL1ZocvZi6yH4651ka6wNRUcMsDBW9mc14J1H",
            description: "Cat image...",
        }),
    }

    const result = await ipfs.add(metadata)
    console.log(result)

    process.exit(0)
}

run()

//generated CID: QmXSGVjvrQGHNRi4G61SaHyY5wpx5jUVpJGvLqsLqxDecZ
//https://ipfs.io/ipfs/QmXSGVjvrQGHNRi4G61SaHyY5wpx5jUVpJGvLqsLqxDecZ
