const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { assert } = require('chai');

describe('Game3', function () {
  async function deployContractAndSetVariables() {
    const Game = await ethers.getContractFactory('Game3');
    const game = await Game.deploy();

    // Hardhat will create 10 accounts for you by default
    // you can get one of this accounts with ethers.provider.getSigner
    // and passing in the zero-based indexed of the signer you want:
    const [s1,s2,s3] = await ethers.getSigners();    

    // you can get that signer's address via .getAddress()
    // this variable is NOT used for Contract 3, just here as an example
    //const address = await signer.getAddress();

    return { game, s1, s2, s3 };
  }

  it('should be a winner', async function () {
    const { game, s1, s2, s3 } = await loadFixture(deployContractAndSetVariables);

    // you'll need to update the `balances` mapping to win this stage

    // to call a contract as a signer you can use contract.connect
    const a1 = await s1.getAddress();
    const a2 = await s2.getAddress();
    const a3 = await s3.getAddress();
    
    await game.connect(s1).buy({ value: '2' });
    await game.connect(s2).buy({ value: '3' });
    await game.connect(s3).buy({ value: '1' });

    // TODO: win expects three arguments
    await game.win(a1, a2, a3);

    // leave this assertion as-is
    assert(await game.isWon(), 'You did not win the game');
  });
});
