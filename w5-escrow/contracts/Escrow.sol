// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

contract EscrowFactory {

    struct EscrowData {
        address contr;
        address depositor;
        address arbiter;
        address beneficiary;
        uint amount;
        bool isApproved;
    }

    address[] public deployedEscrows;

    mapping(address => EscrowData) public escrowContracts;

	event EscrowCreated(address indexed depositor, address indexed arbiter, address indexed beneficiary, uint amount);
	event EscrowRemoved(address indexed escrowAddress);
    event EscrowApproved(address indexed escrowAddress);

	/// No escrow contract was deployed at the specified address
    error ArrayIndexDoesNotExist(address escrowContract);

    //address _depositor, address _arbiter, address _beneficiary
    function createEscrow(address _depositor, address _arbiter, address _beneficiary) public payable {
		// for testing
        // address _depositor = 0x5B38Da6a701c568545dCfcB03FcB875f56beddC4;
        // address _arbiter = 0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2;
        // address _beneficiary = 0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2;

        uint amount = msg.value;
        Escrow newEscrow = new Escrow{value: amount}(_depositor, _arbiter, _beneficiary);

        address contractAddress = address(newEscrow);
        escrowContracts[contractAddress] = EscrowData(contractAddress, _depositor, _arbiter, _beneficiary, amount, false);
        deployedEscrows.push(contractAddress);

		emit EscrowCreated(_depositor, _arbiter, _beneficiary, amount);
    }

    function approveEscrow(address escrowAddr) public {           
        EscrowData storage myEscrow = escrowContracts[escrowAddr]; 

        address arbiter = myEscrow.arbiter;      
        require(msg.sender == arbiter, "Only the arbiter can remove the escrow!");
        require(!myEscrow.isApproved, "The escrow has already been approved!");

        myEscrow.isApproved = true;
		Escrow(escrowAddr).approve();

		emit EscrowApproved(escrowAddr);   
    }

    function removeEscrow(address escrowAddr) public {           
        EscrowData memory myEscrow = escrowContracts[escrowAddr]; 

        address contr = myEscrow.contr;
        address arbiter = myEscrow.arbiter;      
        require(msg.sender == arbiter, "Only the arbiter can remove the escrow!");

        uint index = type(uint256).max;
        for(uint i=0; i<deployedEscrows.length; i++){
            if(deployedEscrows[i] == contr){
                index=i;
                break;
            }
        }

        if(index == type(uint256).max)
            revert ArrayIndexDoesNotExist(contr);
       
        deployedEscrows[index] = deployedEscrows[deployedEscrows.length-1];
        deployedEscrows.pop(); 

		Escrow(contr).destroyContract();

		emit EscrowRemoved(escrowAddr);   
    }

    function getDeployedEscrows() public view returns (address[] memory) {
        return deployedEscrows;
    }
}

contract Escrow {
    address public factoryContract;
	address public arbiter;
	address public beneficiary;
	address public depositor;
	bool public isApproved;

	constructor(address _depositor, address _arbiter, address _beneficiary) payable {
        factoryContract = msg.sender;
		arbiter = _arbiter;
		beneficiary = _beneficiary;
		depositor = _depositor;
	}

    modifier onlyFactory() {
        require(msg.sender == factoryContract, "Only the factory contract can perform this action!");
        _;
    }

	function approve() external onlyFactory {		
		uint balance = address(this).balance;
        isApproved = true;

		(bool sent, ) = payable(beneficiary).call{value: balance}("");
 		require(sent, "Failed to send Ether");
	}

    function destroyContract() public onlyFactory {
        selfdestruct(payable(depositor));
	}
}
