pragma solidity ^0.4.23;

contract DappToken {
	// Name
	// Symbol

	string public name = "DApp Token";
	string public symbol = "DAT";
	string public standard = "DApp Token v1.0";

	event Transfer(
		address indexed _from,
		address indexed _to,
		uint256 _value
	);

	// Constructor
	// Set the total number of tokens
	// Read the total number of tokens
	uint256 public totalSupply;

	mapping(address => uint256) public balanceOf;

	constructor(uint256 _initialSupply) public {
		balanceOf[msg.sender] = _initialSupply;
		totalSupply = _initialSupply;
		// allocate the _initialSupply
	}

	// transfer


	function transfer(address _to, uint256 _value) public returns (bool success){
		// exception if account doesn't have enough
		require(balanceOf[msg.sender] >= _value);
		// transfer the balance

		balanceOf[msg.sender] -= _value;
		balanceOf[_to] += _value;
		// transfer event

		emit Transfer(msg.sender, _to, _value);

		// return a boolean
		
		return true;


	}
}