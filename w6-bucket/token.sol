//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

interface IBucket {
    function drop(address, uint) external;
}

contract MyToken is ERC20 {

    //deploy this contract on Goerli =>
    //call drop on etherscan: https://goerli.etherscan.io/address/0x873289a1aD6Cf024B927bd13bd183B264d274c68#writeContract
    //as arguments, pass the address of this contract and an amount > 0
    address public contr = 0x873289a1aD6Cf024B927bd13bd183B264d274c68;

    constructor() ERC20("MyToken", "MT") {
        _mint(msg.sender, 100000 * 10**decimals());
        approve(contr, 10000);
    }
}