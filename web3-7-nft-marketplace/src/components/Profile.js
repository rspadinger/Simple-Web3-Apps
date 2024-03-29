import Navbar from "./Navbar"
import { GetIpfsUrlFromPinata } from "../utils"
import MarketplaceJSON from "../Marketplace.json"
import axios from "axios"
import { useState } from "react"
import NFTTile from "./NFTTile"

export default function Profile() {
    const [data, updateData] = useState([])
    const [dataFetched, updateFetched] = useState(false)
    const [address, updateAddress] = useState("0x")
    const [totalPrice, updateTotalPrice] = useState("0")

    async function getNFTData() {
        const ethers = require("ethers")
        let sumPrice = 0
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const addr = await signer.getAddress()

        let contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer)

        let nfts = await contract.getMyNFTs()

        //### Promise.all
        const items = await Promise.all(
            nfts.map(async (nft) => {
                //nft metadata
                const nftMetadataURIPinata = await contract.tokenURI(nft.tokenId)
                const nftMetadataURI = GetIpfsUrlFromPinata(nftMetadataURIPinata)
                let meta = (await axios.get(nftMetadataURI)).data
                //meta = meta.data

                let price = ethers.utils.formatUnits(nft.price.toString(), "ether")
                let item = {
                    price,
                    tokenId: nft.tokenId.toNumber(),
                    seller: nft.seller,
                    owner: nft.owner,
                    image: meta.image,
                    name: meta.name,
                    description: meta.description,
                }
                sumPrice += Number(price)
                return item
            })
        )

        updateData(items)
        updateFetched(true)
        updateAddress(addr)
        updateTotalPrice(sumPrice.toPrecision(3)) //### toPrecision
    }

    if (!dataFetched) getNFTData()

    return (
        <div className="profileClass" style={{ "min-height": "100vh" }}>
            <Navbar></Navbar>
            <div className="profileClass">
                <div className="flex text-center flex-col mt-11 md:text-2xl text-white">
                    <div className="mb-5">
                        <h2 className="font-bold">Wallet Address</h2>
                        {address}
                    </div>
                </div>
                <div className="flex flex-row text-center justify-center mt-10 md:text-2xl text-white">
                    <div>
                        <h2 className="font-bold">No. of NFTs</h2>
                        {data.length}
                    </div>
                    <div className="ml-20">
                        <h2 className="font-bold">Total Value</h2>
                        {totalPrice} ETH
                    </div>
                </div>
                <div className="flex flex-col text-center items-center mt-11 text-white">
                    <h2 className="font-bold">Your NFTs</h2>
                    <div className="flex justify-center flex-wrap max-w-screen-xl">
                        {data.map((value, index) => {
                            return <NFTTile data={value} key={index}></NFTTile>
                        })}
                    </div>
                    <div className="mt-10 text-xl">
                        {data.length == 0
                            ? "Oops, No NFT data to display (Are you logged in?)"
                            : ""}
                    </div>
                </div>
            </div>
        </div>
    )
}
