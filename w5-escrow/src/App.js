import { ethers } from "ethers"
import { useEffect, useState } from "react"
import Escrow from "./components/Escrow"

import {
    initialSetup,
    connectWallet,
    getCurrentWalletConnected,
    getEscrows,
    createEscrow,
    getContractFactory,
} from "./bcTools/bcInteraction.js"

const provider = new ethers.providers.Web3Provider(window.ethereum)
let contractFactory

const App = () => {
    const [escrows, setEscrows] = useState([])
    const [wallet, setWallet] = useState("")
    const [status, setStatus] = useState("")
    const [arbiter, setArbiter] = useState("")
    const [beneficiary, setBeneficiary] = useState("")
    const [amount, setAmount] = useState("")

    useEffect(() => {
        async function init() {
            initialSetup()
            contractFactory = await getContractFactory()
            let { address, status } = await getCurrentWalletConnected()
            setWallet(address)

            addWalletListener()
            addEscrowCreationListener()
            addEscrowRemovalListener()

            await displayEscrows()
        }
        init()
    }, [wallet])

    function addWalletListener() {
        if (window.ethereum) {
            window.ethereum.on("accountsChanged", (accounts) => {
                if (accounts.length > 0) {
                    setWallet(accounts[0])
                    setStatus("Please make sure to provide all required details.")
                } else {
                    setWallet("")
                    setStatus("Connect to Metamask using the top right button.")
                }
            })
        } else {
            setStatus("Please install a web wallet in your browser.")
        }
    }

    function addEscrowCreationListener() {
        if (window.ethereum) {
            provider.once("block", () => {
                contractFactory.on(
                    "EscrowCreated",
                    async (depositor, arbiter, beneficiary, amount) => {
                        //setStatus("The new escrow has been created!")
                        //console.log(depositor, arbiter, beneficiary, amount)
                        await displayEscrows()
                    }
                )
            })
        }
    }

    function addEscrowRemovalListener() {
        if (window.ethereum) {
            provider.once("block", () => {
                contractFactory.on("EscrowRemoved", async (escrowAddress) => {
                    setStatus(`The escrow: ${escrowAddress} has been removed!`)
                    await displayEscrows()
                })
            })
        }
    }

    const displayEscrows = async () => {
        if (window.ethereum) {
            const { escrows, status } = await getEscrows()
            setEscrows(escrows)
            //setStatus(status)
        }
    }

    const connectWalletPressed = async () => {
        const { address, status } = await connectWallet()
        setStatus(status)
        setWallet(address)
    }

    const onCreateEscrowPressed = async () => {
        const { status } = await createEscrow(arbiter, beneficiary, amount)
        setStatus(status)
    }

    return (
        <div className="container">
            <div className="block header">
                <div className="row headline">
                    <div className="column" style={{ flexGrow: "4" }}>
                        <h1> Create a New Escrow Contract </h1>
                    </div>
                    <div className="column">
                        <button
                            className="button buttonConnect"
                            id="walletButton"
                            onClick={connectWalletPressed}
                        >
                            {wallet.length > 0 ? (
                                "Connected: " +
                                String(wallet).substring(0, 6) +
                                "..." +
                                String(wallet).substring(38)
                            ) : (
                                <span>Connect Wallet</span>
                            )}
                        </button>
                    </div>
                </div>

                <div className="line"></div>

                <div>
                    <div className="element">
                        <label>
                            Arbiter Address
                            <input
                                type="text"
                                id="arbiter"
                                onChange={(e) => setArbiter(e.target.value)}
                            />
                        </label>
                    </div>
                    <div className="element">
                        <label>
                            Beneficiary Address
                            <input
                                type="text"
                                id="beneficiary"
                                onChange={(e) => setBeneficiary(e.target.value)}
                            />
                        </label>
                    </div>
                    <div className="element">
                        <label>
                            Deposit Amount (in ETH)
                            <input
                                type="text"
                                id="wei"
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </label>
                    </div>
                </div>
                <div>
                    <div
                        className="button buttonDeploy"
                        id="deploy"
                        onClick={(e) => {
                            e.preventDefault()
                            onCreateEscrowPressed()
                        }}
                    >
                        Deploy
                    </div>
                    <div className="status" id="status">
                        {status}
                    </div>
                </div>
            </div>

            {escrows.length > 0 && (
                <div className="block">
                    <div className="headline">
                        <h1> Existing Contracts </h1>
                    </div>
                    <div className="row">
                        {escrows.map((escrow) => {
                            return (
                                <Escrow
                                    key={escrow.contractAddress}
                                    {...escrow}
                                    setStatus={setStatus}
                                />
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}

export default App
