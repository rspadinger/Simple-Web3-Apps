const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

const secp = require("ethereum-cryptography/secp256k1");
const {toHex, utf8ToBytes} = require("ethereum-cryptography/utils");
const {keccak256} = require("ethereum-cryptography/keccak");

app.use(cors());
app.use(express.json());

const balances = {
  //private keys & accounts for testing
  //72c29fcf80820e968a13986fd6dac1508e4212c7f12ec3125236f75425b6f89d => 0x983de0c28468417371583efe659598df4b09f368
  //3a9ed994f3267f439b02ed942a0892478255e06f8a64ca9712d645badfd7acf1 => 0xfc9a500d7216bdcf57e61ef3a672ab0d3c9f033a
  //ed2b39c59f3583565cd79b5db23c3f7da513b3541a45170f134659816ee4348c => e8d62b2b5173bc6d278193bb08aa43ebd3e59f5d
  
  "0x983de0c28468417371583efe659598df4b09f368": 100,
  "0xfc9a500d7216bdcf57e61ef3a672ab0d3c9f033a": 75,
  "0xe8d62b2b5173bc6d278193bb08aa43ebd3e59f5d": 50,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", async (req, res) => {

  const { sender, recipient, amount, sig, recoveryBit } = req.body;

  const txn = {
    from: sender,
    to: recipient,
    amount: amount
  };
  const message = JSON.stringify(txn);
  const sigUint8Arr = Uint8Array.from(Object.values(sig));

  const pubKey = await secp.recoverPublicKey(hashMessage(message), sigUint8Arr, recoveryBit);
  const recoveredAddress = getAddressFromPublicKey(pubKey);

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if(recoveredAddress === sender){
    const intAmount = parseInt(amount);
    if (balances[sender] < intAmount) {
      res.status(400).send({ message: "Not enough funds!" });
    } else {
      balances[sender] -= intAmount;
      balances[recipient] += intAmount;
      res.send({ balance: balances[sender] });
    }
  } else {
    console.log("The address recovered from the signature does not correspond with the address of the sender of the transaction!");
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}

function hashMessage(message) {
      return keccak256(utf8ToBytes(message));    
}

function getAddressFromPublicKey(publicKey) {
    return "0x" + toHex((keccak256(publicKey).slice(1)).slice(-20));
}
