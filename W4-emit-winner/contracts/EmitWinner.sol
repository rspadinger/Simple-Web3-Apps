// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

interface IWinner {
    function attempt() external;
}

contract EmitWinner {    
    address public winnerContract = 0xcF469d3BEB3Fc24cEe979eFf83BE33ed50988502;

    function callAttempt() public {
        IWinner(winnerContract).attempt();
    }
}
