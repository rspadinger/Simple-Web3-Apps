import server from "./server";
import * as secp from "ethereum-cryptography/secp256k1";
import {toHex} from "ethereum-cryptography/utils";
import {keccak256} from "ethereum-cryptography/keccak";

function Wallet({ privateKey, setPrivateKey, address, setAddress, balance, setBalance }) {
  async function onChange(evt) {
    const privateKey = evt.target.value;
    setPrivateKey(privateKey);
    
    if (privateKey) {
      const address = getAddressFromPrivateKey(privateKey);
      setAddress(address);
      
      if(address) {
        const {
          data: { balance },
        } = await server.get(`balance/${address}`);
        setBalance(balance);
      } else {
        setBalance(0);
      }
    } else {
      setBalance(0);
    }
  }

  function getAddressFromPrivateKey(privateKey) {
    const pubKey = secp.getPublicKey(privateKey);
    return "0x" + toHex((keccak256(pubKey).slice(1)).slice(-20));
  }

  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>

      <label>
        Wallet Private Key
        <input placeholder="Enter your Private Key..." style={{marginTop: "10px"}} value={privateKey} onChange={onChange}></input>
      </label>

      <div className="address">Address: {address}</div>
      <div className="balance">Balance: {balance}</div>
    </div>
  );
}

export default Wallet;
