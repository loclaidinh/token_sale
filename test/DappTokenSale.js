var DappToken = artifacts.require('./DappToken.sol');
var DappTokenSale = artifacts.require('./DappTokenSale.sol');

contract('DappTokenSale', function(accounts) {
	var tokenInstance;
	var tokenSaleInstance;
	var numberOfTokens = 10;
	var admin = accounts[0];
	console.log('admin address: '+ admin);
	var buyer = accounts[1];
	var tokenPrice = 1000000000000000; //in wei
	var tokensAvailable = 750000;

	it('Initializes the contract with correct values', function() {
		return DappTokenSale.deployed().then(function(instance) {
			tokenSaleInstance = instance;
			return tokenSaleInstance.address;
		}).then(function(address){
			assert.notEqual(address, 0x0, 'has contract address');
			console.log("contract address: " + address);
			return tokenSaleInstance.tokenContract();
		}).then(function(address){
			assert.notEqual(address, 0x0, 'has token contract address');
			console.log('token contract address:' + address);
			return tokenSaleInstance.tokenPrice();
		}).then(function(price){
			assert.equal(price, tokenPrice, 'token price is correct');
		});
	});

	it('Facilitates token buying',function(){
		return DappToken.deployed().then(function(instance){
			tokenInstance = instance;
			return DappTokenSale.deployed();
		}).then(function(instance){	
			tokenSaleInstance = instance;
			return tokenInstance.transfer(tokenSaleInstance.address, tokensAvailable, {from: admin});
		}).then(function(receipt) {	
			
			return tokenSaleInstance.buyTokens(numberOfTokens, {from: buyer, value: numberOfTokens * tokenPrice});
		}).then(function(receipt) {
			assert.equal(receipt.logs.length, 1, 'triggers one event');
			assert.equal(receipt.logs[0].event, 'Sell', 'should be the "Sell" event');
			assert.equal(receipt.logs[0].args._buyer, buyer, 'logs for purchase address');
			assert.equal(receipt.logs[0].args._amount, numberOfTokens, 'logs for the number of tokens purchased');
			return tokenSaleInstance.tokensSold();
		}).then(function(amount) {
			assert.equal(amount.toNumber(), numberOfTokens, 'Increments the number of token sold');
			return tokenSaleInstance.buyTokens(numberOfTokens, {from: buyer, value: 1});
		}).then(assert.fail).catch(function(error) {
			assert(error.message.indexOf('revert') >= 0, 'msg.value must be equal number of tokens in Wei');
			return tokenInstance.balanceOf(buyer);
		}).then(function(balance) {
			assert.equal(balance.toNumber(), numberOfTokens, 'balance of buyer is correct');
			console.log("buyer balance:" + balance);
			return tokenInstance.balanceOf(tokenSaleInstance.address);
		}).then(function(balance) {
			console.log("token sale contract balance:" + balance);
			assert.equal(balance.toNumber(), tokensAvailable - numberOfTokens, 'The remaining balance is correct');
			return tokenSaleInstance.buyTokens(800000, {from: buyer, value: numberOfTokens * tokenPrice});
		}).then(assert.fail).catch(function(error) {
			assert(error.message.indexOf('revert') >= 0, 'Cannot purchase more than token available');
		});	
	});

	it('Endsale test', function(){
		return DappToken.deployed().then(function(instance){
			tokenInstance = instance;
			return DappTokenSale.deployed();
		}).then(function(instance){	
			tokenSaleInstance = instance;
			return tokenSaleInstance.endSale({ from: buyer });
		}).then(assert.fail).catch(function(error){
			assert(error.message.indexOf('revert' >= 0, 'cannot end sale by another account'));
			return tokenSaleInstance.endSale({ from: admin });
		}).then(function(receipt){
			return tokenInstance.balanceOf(admin);
		}).then(function(balance){
			assert.equal(balance.toNumber(), 999990, 'Return unsold token to the admin');
			console.log("Admin balance: " + balance.toNumber());
			//return tokenSaleInstance.tokenPrice();
			ethBalance = web3.eth.getBalance(tokenSaleInstance.address);
			assert.equal(ethBalance.toNumber(), 0);
		})
		/*.then(function(price){
			assert.equal(price.toNumber(), 0, 'token price is reset to 0 when call self-distruct function');
		});*/
	})

});