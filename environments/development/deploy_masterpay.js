web3.eth.getTransactionReceiptMined = function (txnHash, interval) {
    var transactionReceiptAsync;
    interval |= 500;
    transactionReceiptAsync = function(txnHash, resolve, reject) {
        try {
            var receipt = web3.eth.getTransactionReceipt(txnHash);
            if (receipt == null) {
                setTimeout(function () {
                    transactionReceiptAsync(txnHash, resolve, reject);
                }, 500);
            } else {
                resolve(receipt);
            }
        } catch(e) {
            reject(e);
        }
    };

    return new Promise(function (resolve, reject) {
        transactionReceiptAsync(txnHash, resolve, reject);
    });
};

var generator = require("ether-pudding/generator");

var accounts = web3.eth.accounts;
var masterPay;
MasterPay.new(
		[accounts[0], accounts[1], accounts[2]],
		2,
		web3.toWei(10, "ether"))
	.then(function (masterPay0) {
		console.log("Deployed MasterPay to " + masterPay0.address);
		generator.save({"MasterPay": masterPay0}, "environments/development/contracts", null);
		masterPay = masterPay0;
		return ProductPayment.new(
			web3.toWei(10, "ether"),
			masterPay0.address,
			86400,
			{ from: accounts[0] })
	})
	.then(function (productPayment) {
		console.log("Deployed ProductPayment to " + productPayment.address);
		return masterPay.addProductPayment(
			"0x0011223344556677889900112233445566778899001122334455667788990011",
			productPayment.address,
			{ from: accounts[0] });
	})
	.then(function (txn1) {
		return web3.eth.getTransactionReceiptMined(txn1);
	})
	.then(function (receipt1) {
		console.log("Added ProductPayment to MasterPay");
		process.exit(0);
	})
	.catch(function (e) {
		console.error(e);
		process.exit(1); // Any non-zero exit value is an error
	});
