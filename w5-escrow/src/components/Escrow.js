import { ethers } from "ethers"
import { useEffect } from "react"
import { approveEscrow, removeEscrow, getContractFactory } from "../bcTools/bcInteraction.js"

const provider = new ethers.providers.Web3Provider(window.ethereum)
let contractFactory

export default function Escrow({
    contractAddress,
    depositor,
    arbiter,
    beneficiary,
    amount,
    isApproved,
    setStatus,
}) {
    useEffect(() => {
        async function init() {
            if (window.ethereum) {
                contractFactory = await getContractFactory()
                addEscrowApprovalListener()
            }
        }
        init()
    }, [])

    function addEscrowApprovalListener() {
        if (window.ethereum && contractFactory) {
            provider.once("block", () => {
                contractFactory.on("EscrowApproved", async (escrowAddress) => {
                    setStatus(`The selected escrow: ${escrowAddress} has been approved!`)
                    document.getElementById(escrowAddress).className = "complete"
                    document.getElementById(escrowAddress).innerText = "✓ Escrow is approved!"
                })
            })
        }
    }

    const handleApprove = async () => {
        if (!isApproved) {
            const { status } = await approveEscrow(contractAddress)
            //isApproved = true
            setStatus(status)
        }
    }

    const handleRemove = async () => {
        const { status } = await removeEscrow(contractAddress)
        setStatus(status)
    }

    return (
        <div className="existing-contract column">
            <ul className="">
                <li>
                    <div> Depositor: </div>
                    <div> {depositor} </div>
                </li>
                <li>
                    <div> Arbiter: </div>
                    <div> {arbiter} </div>
                </li>
                <li>
                    <div> Beneficiary: </div>
                    <div> {beneficiary} </div>
                </li>
                <li>
                    <div> Value: </div>
                    <div> {amount} </div>
                </li>
                <div className="buttonContainer">
                    <div
                        className={`button buttonApprove ${isApproved ? "complete" : ""}`}
                        id={contractAddress}
                        onClick={(e) => {
                            e.preventDefault()
                            handleApprove()
                        }}
                    >
                        {isApproved ? "✓ Escrow is approved!" : "Approve"}
                    </div>
                    <div
                        className="button buttonRemove"
                        onClick={(e) => {
                            e.preventDefault()
                            handleRemove()
                        }}
                    >
                        Remove
                    </div>
                </div>
            </ul>
        </div>
    )
}
