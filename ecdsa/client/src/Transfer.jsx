import { useState } from "react";
import * as secp from "ethereum-cryptography/secp256k1";
import {toHex, utf8ToBytes} from "ethereum-cryptography/utils";
import {keccak256} from "ethereum-cryptography/keccak";
import server from "./server";

function Transfer({ address, privateKey, setBalance }) {
  const [sendAmount, setSendAmount] = useState("1");
  const [recipient, setRecipient] = useState("0xfc9a500d7216bdcf57e61ef3a672ab0d3c9f033a");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();

    const txn = {
      from: address,  // test to generate arror : "0xe8d62b2b5173bc6d278193bb08aa43ebd3e59f5d",
      to: recipient,
      amount: sendAmount
    };
    const message = JSON.stringify(txn);

    const [sig, recoveryBit] = await secp.sign(hashMessage(message), privateKey, {recovered: true}); 

    try {
      const {
        data: { balance },
      } = await server.post(`send`, {
        sender: address,
        amount: sendAmount,
        recipient,
        sig,
        recoveryBit,
      });
      setBalance(balance);
    } catch (ex) {
      alert(ex.response.data.message);
    }
  }

  function hashMessage(message) {
      return keccak256(utf8ToBytes(message));    
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="10"
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Provide the recipient address..."
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
