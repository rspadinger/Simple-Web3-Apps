//SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "hardhat/console.sol";

contract Game1 {
  event Winner(address winner);

  function win() public {
    emit Winner(msg.sender);
  }
}