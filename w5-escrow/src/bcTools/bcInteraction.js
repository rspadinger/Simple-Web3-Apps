import { ethers } from "ethers"
import escrowJson from "../Escrow.json"
import escrowFactoryJson from "../EscrowFactory.json"

const { REACT_APP_CONTRFACTORY_ADDRESS } = process.env

let provider, signer, contrFactory, contrFactoryAddress, selectedAddress

export const initialSetup = async () => {
    if (window.ethereum) {
        provider = new ethers.providers.Web3Provider(window.ethereum)
        signer = provider.getSigner()
        contrFactoryAddress = REACT_APP_CONTRFACTORY_ADDRESS
        contrFactory = new ethers.Contract(contrFactoryAddress, escrowFactoryJson.abi, signer)
    }
}

export const getContractFactory = async () => {
    return contrFactory
}

export const getCurrentWalletConnected = async () => {
    if (window.ethereum) {
        try {
            const addressArray = await window.ethereum.request({
                method: "eth_accounts",
            })
            if (addressArray.length > 0) {
                selectedAddress = addressArray[0]
                return {
                    address: selectedAddress,
                }
            } else {
                return {
                    address: "",
                    status: "Connect to your web wallet using the top right button.",
                }
            }
        } catch (err) {
            return {
                address: "",
                status: "Something went wrong: " + err.message,
            }
        }
    } else {
        return {
            address: "",
            status: "Please install a web wallet in your browser.",
        }
    }
}

export const connectWallet = async () => {
    if (window.ethereum) {
        try {
            const addressArray = await window.ethereum.request({
                method: "eth_requestAccounts",
            })
            if (addressArray.length > 0) {
                selectedAddress = addressArray[0]
                return {
                    address: selectedAddress,
                    status: "To create a new escrow, provide an arbiter and beneficiary address and the deopist amount in ETH.",
                }
            } else {
                return {
                    address: "",
                    status: "Connect to your web wallet using the top right button.",
                }
            }
        } catch (err) {
            return {
                address: "",
                status: "Something went wrong: " + err.message,
            }
        }
    } else {
        return {
            address: "",
            status: "Please install a web wallet in your browser.",
        }
    }
}

export const getEscrows = async () => {
    if (window.ethereum) {
        try {
            let escrowAddresses = await contrFactory.getDeployedEscrows()
            let escrows = []

            for (const addr of escrowAddresses) {
                let escrow = await contrFactory.escrowContracts(addr)
                let contractEscrow = new ethers.Contract(addr, escrowJson.abi, signer)
                escrows.push({
                    contract: contractEscrow,
                    contractAddress: addr,
                    depositor: escrow.depositor,
                    arbiter: escrow.arbiter,
                    beneficiary: escrow.beneficiary,
                    amount: ethers.utils.formatEther(escrow.amount),
                    isApproved: escrow.isApproved,
                })
            }

            return {
                escrows,
                //status: "",
            }
        } catch (err) {
            return {
                escrows: [],
                status: "Something went wrong: " + err.message,
            }
        }
    } else {
        return { escrows: [], status: "Please install a web wallet in your browser." }
    }
}

export const createEscrow = async (arbitor, beneficiary, amount) => {
    if (arbitor.trim() === "" || beneficiary.trim() === "" || amount.trim() === "") {
        return {
            status: "Please provide all required details!",
        }
    }

    if (window.ethereum) {
        try {
            // test
            // let txn = await contrFactory.createEscrow(
            //     "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
            //     "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
            //     "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
            //     { value: ethers.utils.parseEther(amount) }
            // )

            let txn = await contrFactory.createEscrow(selectedAddress, arbitor, beneficiary, {
                value: ethers.utils.parseEther(amount),
            })
            //await txn.wait()

            return {
                status: (
                    <a
                        target="_blank"
                        rel="noreferrer"
                        href={`https://sepolia.etherscan.io/tx/${txn.hash}`}
                    >
                        ✅ A new escrow has been created, you can check the transaction on Etherscan
                    </a>
                ),
            }
        } catch (error) {
            //console.log(error.reason)
            return {
                status: "Something went wrong - you may not be allowed to perform this action!",
            }
        }
    } else {
        return {
            status: "Please install a web wallet in your browser.",
        }
    }
}

export const approveEscrow = async (escrowAddress) => {
    if (window.ethereum) {
        try {
            //let contractEscrow = new ethers.Contract(escrowAddress, escrowJson.abi, signer)
            let txn = await contrFactory.approveEscrow(escrowAddress)
            //await txn.wait()

            return {
                status: `An approval request has been initiated for the escrow : ${escrowAddress} !`,
            }
        } catch (error) {
            console.log("err:", error, error.reason)
            return {
                status: "Something went wrong - you may not be allowed to perform this action!",
            }
        }
    } else {
        return {
            status: "Please install a web wallet in your browser.",
        }
    }
}

export const removeEscrow = async (escrowAddress) => {
    if (window.ethereum) {
        try {
            let txn = await contrFactory.removeEscrow(escrowAddress)
            await txn.wait()

            return {
                status: `The selected escrow: ${escrowAddress} has been deleted!`,
            }
        } catch (error) {
            return {
                status: "Something went wrong - you may not be allowed to perform this action!",
            }
        }
    } else {
        return {
            status: "Please install a web wallet in your browser.",
        }
    }
}
