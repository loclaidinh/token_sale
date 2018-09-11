var DappToken = artifacts.require("./DappToken.sol")

contract('DappToken', function(accounts) {

	var tokenInstance;

	it('initializes the correct values', function() {
		return DappToken.deployed().then(function(instance){
			tokenInstance = instance;
			return tokenInstance.name();
		}).then(function(name){
			assert(name, 'DApp Token', 'sets the correct name');
			return tokenInstance.symbol();
		}).then(function(symbol){
			assert(symbol, 'DAT', 'sets the correct symbol');
			return tokenInstance.standard();
		}).then(function(standard){
			assert.equal(standard, 'DApp Token v1.0', 'has correct version');
		});
	})

	it('Allocates the initiale supply upon deployment', function() {
		return DappToken.deployed().then(function(instance) {
			tokenInstance = instance;
			return tokenInstance.totalSupply();
			}).then(function(totalSupply) {
				assert.equal(totalSupply.toNumber(), 1000000, 'sets the total supply to 1,000,000')
				return tokenInstance.balanceOf(accounts[0]);
				}).then(function(adminBalance) {
			assert.equal(adminBalance.toNumber(), 1000000, 'it allocates the initial supply to Admin')
		});	
	});

	it('transfer token ownership', function(){
		return DappToken.deployed().then(function(instance){
			tokenInstance = instance;
			return tokenInstance.transfer.call(accounts[1], 99999999999999999);
		}).then(assert.fail).catch(function(error){
			assert(error.message.indexOf('revert') >= 0, 'error message must contain revert');
			return tokenInstance.transfer.call(accounts[1], 250000, { from: accounts[0] });
		}).then(function(success){
			assert.equal(success, true, 'it returns true!');
			return tokenInstance.transfer(accounts[1], 250000, { from: accounts[0]} );
		}).then(function(receipt) {
			assert.equal(receipt.logs.length, 1, 'triggers one event');
			assert.equal(receipt.logs[0].event, 'Transfer', 'should be the "Transfer" event');
			assert.equal(receipt.logs[0].args._from, accounts[0], 'logs for the sender address');
			assert.equal(receipt.logs[0].args._to, accounts[1], 'logs for receiver address');
			assert.equal(receipt.logs[0].args._value, 250000, 'logs for the amount');
			return tokenInstance.balanceOf(accounts[1]);
		}).then(function(balance) {
			assert.equal(balance.toNumber(), 250000, 'send correct amount to receiver');
			return tokenInstance.balanceOf(accounts[0]);
		}).then(function(balance) {
			assert.equal(balance.toNumber(), 750000, 'deduct correct amount from sender');
		});
	});

	it('approve token from delegated transfer', function() {
		return DappToken.deployed().then(function(instance) {
			tokenInstance = instance;
			return tokenInstance.approve.call(accounts[1], 100);
		}).then(function(success) {
			assert.equal(success, true, 'it returns true');
			return tokenInstance.approve(accounts[1], 100, { from: accounts[0] });
		}).then(function(receipt){
			assert.equal(receipt.logs.length, 1, 'triggers one event');
			assert.equal(receipt.logs[0].event, 'Approve', 'should be the "Approve" event');
			assert.equal(receipt.logs[0].args._owner, accounts[0], 'logs for the owner address');
			assert.equal(receipt.logs[0].args._spender, accounts[1], 'logs for spender address');
			assert.equal(receipt.logs[0].args._value, 100, 'logs for the amount');
			return tokenInstance.allowance(accounts[0], accounts[1]);
		}).then(function(allowance) {
			assert.equal(allowance.toNumber(), 100, 'returns correct amount of allowance');
		});
	});


	it('Handle delegated token transfer', function(){
		return DappToken.deployed().then(function(instance){
			tokenInstance = instance;
			fromAccount = accounts[2];
			toAccount = accounts[3];
			spendingAccount = accounts[4];
			return tokenInstance.transfer(fromAccount, 100, { from: accounts[0]} );
		}).then(function(receipt){
			return tokenInstance.approve(spendingAccount, 10, { from: fromAccount} );
		}).then(function(receipt){
			return tokenInstance.transferFrom(fromAccount, toAccount, 101, { from: spendingAccount});
		}).then(assert.fail).catch(function(error) {
			assert(error.message.indexOf('revert') >= 0, 'cannot transfer the amount greater than the balance');
			return tokenInstance.transferFrom(fromAccount, toAccount, 11, {from: spendingAccount});
		}).then(assert.fail).catch(function(error){
			assert(error.message.indexOf('revert') >= 0, 'cannot transfer the amount greater than the approval amount');
			//console.log(error);
			return tokenInstance.transferFrom.call(fromAccount, toAccount, 10, {from: spendingAccount});
		}).then(function(success){
			assert.equal(success, true, 'return true');
			return tokenInstance.transferFrom(fromAccount, toAccount, 10, {from: spendingAccount});
		}).then(function(receipt){
			assert.equal(receipt.logs.length, 1, 'triggers one event');
			assert.equal(receipt.logs[0].event, 'Transfer', 'should be the "Transfer" event');
			assert.equal(receipt.logs[0].args._from, fromAccount, 'logs for the transfer from address');
			assert.equal(receipt.logs[0].args._to, toAccount, 'logs for to account address');
			assert.equal(receipt.logs[0].args._value, 10, 'logs for the amount');
			return tokenInstance.balanceOf(fromAccount);
		}).then(function(balance){
			assert.equal(balance.toNumber(), 90, 'Deduct the amount from sending account');
			return tokenInstance.balanceOf(toAccount);
		}).then(function(balance){
			assert.equal(balance.toNumber(), 10, 'Receive an amount from spending account');
			return tokenInstance.allowance(fromAccount, spendingAccount);
		}).then(function(allowance) {
			assert.equal(allowance.toNumber(), 0, 'Deduct allowance');
		});
		
	});


});