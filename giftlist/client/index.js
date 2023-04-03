const axios = require('axios');
const niceList = require('../utils/niceList.json');
const MerkleTree = require('../utils/MerkleTree');

const serverUrl = 'http://localhost:1225';

async function main() {
  // TODO: how do we prove to the server we're on the nice list? 
  let mt = new MerkleTree(niceList)
  //console.log("Merkle root: ", mt.getRoot())

  const leaf = "Omar Brown"
  const index = niceList.indexOf(leaf)
  const proof = mt.getProof(index)
  //console.log("Index: ", index)
  //console.log("Proof: ", proof)

  const { data: gift } = await axios.post(`${serverUrl}/gift`, { proof, leaf });

  console.log({ gift });
}

main();