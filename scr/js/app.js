App = {
	web3Provider: null,
	contracts: {},
	account: '0x0',
	loading: false,
	tokenPrice: 1000000000000000,
	tokensSold: 0,
	tokensAvailable: 750000,

	init: function() {
		console.log("App initialized...");
		return App.initWeb3();
	},

	initWeb3: function() {
		if (typeof web3 !== 'undefined') {
			App.web3Provider = web3.currentProvider;
		  	web3 = new Web3(web3.currentProvider);
		} else {
		  // Set the provider you want from Web3.providers
		  App.web3Provider = new Web3.providers.HttpProvider("HTTP://127.0.0.1:7545");
		  web3 = new Web3(new App.web3Provider);
		}

		return App.initContracts();
	},

	initContracts: function() {
		$.getJSON("DappTokenSale.json", function(DappTokenSale) {
			App.contracts.DappTokenSale = TruffleContract(DappTokenSale);
			App.contracts.DappTokenSale.setProvider(App.web3Provider);
			App.contracts.DappTokenSale.deployed().then(function(DappTokenSale){
				console.log("Dapp token sale address: " + DappTokenSale.address);
			})
		}).done(function(){
			$.getJSON("DappToken.json", function(DappToken) {
				App.contracts.DappToken = TruffleContract(DappToken);
				App.contracts.DappToken.setProvider(App.web3Provider);
				App.contracts.DappToken.deployed().then(function(DappToken){
					console.log("Dapp token address: " + DappToken.address);
				});

				App.listenForEvents();
				return App.render();	
			})				
		})
	},

	listenForEvents: function() {
		App.contracts.DappTokenSale.deployed().then(function(instance) {
			instance.Sell({}, {
				fromBlock: 0,
				toBlock: 'latest'
			}).watch(function(error, event){
				console.log("event triggered ", event);
				App.render();
			})
		})
	},
		
	render: function() {
		if(App.loading) {
			return;
		};
		App.loading = true;

		var loader = $('#loader');
		var content = $('#content');

		loader.show();
		content.hide()

		web3.eth.getCoinbase(function(err, account) {
			if(err === null) {
				App.account = account;
				$('#account-address').html("Your Account: " + account);
			}
		
		//Load token sale contract

			App.contracts.DappTokenSale.deployed().then(function(instance){
				dappTokenSaleInstance = instance;
				return dappTokenSaleInstance.tokenPrice();
			}).then(function(tokenPrice) {
				App.tokenPrice = tokenPrice;
				$('.token-price').html(web3.fromWei(App.tokenPrice, 'ether').toNumber());
				return dappTokenSaleInstance.tokensSold();
			}).then(function(tokensSold){
				console.log(tokensSold);
				//App.tokensSold = 350000;
				App.tokensSold = tokensSold.toNumber();
				$('.tokens-sold').html(App.tokensSold);
				$('.tokens-available').html(App.tokensAvailable);

				var progressPercent = Math.ceil((App.tokensSold / App.tokensAvailable) * 100);
				$('#progress').css('width', progressPercent + '%');

				// Load Token contract

				App.contracts.DappToken.deployed().then(function(instance){
					dappTokenInstance = instance;
					console.log(App.account);
					return dappTokenInstance.balanceOf(App.account);
				}).then(function(balance) {
					console.log("balance: " + balance);
					$('.dapp-balance').html(balance.toNumber());
					App.loading = false;
					loader.hide();
					content.show();
				})
			})
		})

	},

	buyTokens: function() {
		$('#content').hide();
		$('#loader').show();
		var numberOfTokens = $('#numberOfTokens').val();
		App.contracts.DappTokenSale.deployed().then(function(instance){
			return instance.buyTokens(numberOfTokens, {
				from: App.account,
				value: numberOfTokens * App.tokenPrice,
				gas: 500000
			});
		}).then(function(result){
			console.log('Token bought ....');
			$('form').trigger('reset');
		})
	}
}

$(function() {
	$(window).load(function(){
		App.init();
	})
});