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

	// approval event
	event Approve(
		address indexed _owner,
		address indexed	_spender,
		uint256 _value
	);

	// Constructor
	// Set the total number of tokens
	// Read the total number of tokens
	uint256 public totalSupply;

	mapping(address => uint256) public balanceOf;

	// Allowance
	mapping(address => mapping(address => uint256)) public allowance;

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

	// Delegated transfer

	// Approval

	function approve(address _spender, uint256 _value) public returns (bool success) {
		// handle Allowance
		allowance[msg.sender][_spender] = _value;

		// handle approve event
		emit Approve(msg.sender, _spender, _value);

		return true;

	}

	// Transfer from

	function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {

		require(_value <= balanceOf[_from]);
		require(_value <= allowance[_from][msg.sender]);
		// return a boolean
		// transfer event
		// Change the balance
		balanceOf[_from] -= _value;
		balanceOf[_to] += _value;
		// Update the allowance
		allowance[_from][msg.sender] -= _value;
		// Require  _from has enough tokens
		// Require the allowance is big enough
		emit Transfer(_from, _to, _value);
		return true;
	}
}