var generator = require("ether-pudding/generator");

var accounts = web3.eth.accounts;
MasterPay.new(
		[accounts[0], accounts[1], accounts[2]],
		2,
		web3.toWei(10, "ether"))
	.catch(function (e) {
		console.error(e);
		process.exit(1); // Any non-zero exit value is an error
	})
	.then(function (masterPay) {
		console.log("Deployed MasterPay to " + masterPay.address);
		generator.save({"MasterPay": masterPay}, "environments/development/contracts", null);
		process.exit(0);
	});