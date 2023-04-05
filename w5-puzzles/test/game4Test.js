const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { assert } = require('chai');

describe('Game4', function () {
  async function deployContractAndSetVariables() {
    const Game = await ethers.getContractFactory('Game4');
    const game = await Game.deploy();

    const [s1] = await ethers.getSigners();

    return { game, s1 };
  }
  it('should be a winner', async function () {
    const { game, s1 } = await loadFixture(deployContractAndSetVariables);

    // nested mappings are rough :}
    const a1 = await s1.getAddress();

    await game.write(a1);

    await game.win(a1);

    // leave this assertion as-is
    assert(await game.isWon(), 'You did not win the game');
  });
});
