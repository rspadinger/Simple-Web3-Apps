const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { assert } = require('chai');

describe('Game5', function () {
  async function deployContractAndSetVariables() {
    const Game = await ethers.getContractFactory('Game5');
    const game = await Game.deploy();

    const [signer] = await ethers.getSigners();
    return { game, signer };
  }

  it('should be a winner', async function () {
    const { game, signer } = await loadFixture(deployContractAndSetVariables);

    const threshold = "0x00FfFFfFFFfFFFFFfFfFfffFFFfffFfFffFfFFFf";
    let smallerAddressFound = false;
    let wallet;

    while(!smallerAddressFound) {
      wallet = ethers.Wallet.createRandom();      
      if (wallet.address < threshold) {
        smallerAddressFound = true;
      }
    }

    const signer2 = new ethers.Wallet(wallet.privateKey, ethers.provider)

    txn = await signer.sendTransaction({
        to: wallet.address,
        value: ethers.utils.parseEther("10"),
    })
    txnReceipt = await txn.wait()

    await game.connect(signer2).win();

    // leave this assertion as-is
    assert(await game.isWon(), 'You did not win the game');
  });
});
