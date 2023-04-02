const secp = require("ethereum-cryptography/secp256k1");
const {toHex} = require("ethereum-cryptography/utils");
const {keccak256} = require("ethereum-cryptography/keccak");

const privateKey = secp.utils.randomPrivateKey();
console.log("Private Key: ", toHex(privateKey));
console.log("Address2: ", getAddressFromPrivateKey(privateKey));

function getAddressFromPrivateKey(privateKey) {
    const pubKey = secp.getPublicKey(privateKey);
    return "0x" + toHex((keccak256(pubKey).slice(1)).slice(-20));
}