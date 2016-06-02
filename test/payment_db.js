web3.eth.getTransactionReceiptMined = function (txnHash) {
    var transactionReceiptAsync;
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

/**
 * We are testing for the features of the abstract PaymentDb withing MasterPay.
 */
contract('ProductPayment, regular operations,', function(accounts) {

  var owner = accounts[0];
  var otherAdder = accounts[1];
  var beneficiary = accounts[2];
  var paymentDb;

  it("should not deploy a contract with value", function (done) {

    new Promise(function (resolve, reject) {
            try {
                MasterPay.new(
                    { from: owner, value: 100 })
                    .catch(function (e) {
                        resolve();
                    });
            } catch (e) {
                reject(e);
            }
            reject("Should have thrown");
        })
        .then(function() {
            done("Should have thrown");
        })
        .catch(function (e) {
            // We expect an exception
            done();
        });

  });

  it("should deploy a new paymentDb, with owner", function (done) {

    MasterPay.new({ from: owner })
      .then(function (newPaymentDb) {
        paymentDb = newPaymentDb;
      })
      .then(done)
      .catch(done);

  });

  it("should have the proper initial values", function (done) {

    paymentDb.isOwner.call(owner)
        .then(function (isOwner0) {
            assert.isTrue(isOwner0, "should be proper owner");
            return paymentDb.getPaymentAdderCount.call();
        })
        .then(function (count1) {
            assert.equal(count1.toString(10), "1", "there should be only 1 paymentAdder at this stage");
            return paymentDb.paymentAdders(owner);
        })
        .then(function (paymentAdder2) {
            assert.equal(paymentAdder2[0], owner, "address of paymentAdder should be owner");
            assert.equal(paymentAdder2[1], 0, "index of paymentAdder should be 0");
            return paymentDb.paymentAdderList(0);
        })
        .then(function (paymentAdderAddress3) {
            assert.equal(paymentAdderAddress3, owner, "first paymentAdder should be owner");
            return paymentDb.isPaymentAdder.call(owner);
        })
        .then(function (isPaymentAdder4) {
            assert.isTrue(isPaymentAdder4, "owner should be a paymentAdder");
            return paymentDb.isPaymentAdder.call(otherAdder);
        })
        .then(function (isPaymentAdder5) {
            assert.isFalse(isPaymentAdder5, "un-added account should not be a paymentAdder");
            return paymentDb.getProductPaymentIdHashesCount.call();
        })
        .then(function (count4) {
            assert.equal(count4, 0, "should not have any payment");
        })
        .then(done)
        .catch(done);

  });

  it("should not be possible to call isPaymentAdder with value", function (done) {

    new Promise(function (resolve, reject) {
            try {
                resolve(paymentDb.isPaymentAdder(
                    owner, 
                    { 
                        from: owner, 
                        value: 100,
                        gas: 300000
                    }));
            } catch(e) {
                reject(e);
            }
        })
        .then(function (txn0) {
            return web3.eth.getTransactionReceiptMined(txn0);
        })
        .then(function (receipt1) {
            assert.equal(receipt1.gasUsed, 300000, "should have used all the gas");
        })
        .then(done)
        .catch(function (e) {
            if ((e + "").indexOf("invalid JUMP") > -1) {
                // We are in TestRPC
                done();
            } else {
                done(e);
            }
        });

  });

  it("should not be possible to call getPaymentAdderCount with value", function (done) {

    new Promise(function (resolve, reject) {
            try {
                resolve(paymentDb.getPaymentAdderCount({ 
                    from: owner, 
                    value: 100,
                    gas: 300000
                }));
            } catch(e) {
                reject(e);
            }
        })
        .then(function (txn0) {
            return web3.eth.getTransactionReceiptMined(txn0);
        })
        .then(function (receipt1) {
            assert.equal(receipt1.gasUsed, 300000, "should have used all the gas");
        })
        .then(done)
        .catch(function (e) {
            if ((e + "").indexOf("invalid JUMP") > -1) {
                // We are in TestRPC
                done();
            } else {
                done(e);
            }
        });

  });

  it("should not be possible to call getProductPaymentIdHashesCount with value", function (done) {

    new Promise(function (resolve, reject) {
            try {
                resolve(paymentDb.getProductPaymentIdHashesCount({ 
                    from: owner, 
                    value: 100,
                    gas: 300000
                }));
            } catch(e) {
                reject(e);
            }
        })
        .then(function (txn0) {
            return web3.eth.getTransactionReceiptMined(txn0);
        })
        .then(function (receipt1) {
            assert.equal(receipt1.gasUsed, 300000, "should have used all the gas");
        })
        .then(done)
        .catch(function (e) {
            if ((e + "").indexOf("invalid JUMP") > -1) {
                // We are in TestRPC
                done();
            } else {
                done(e);
            }
        });

  });

  it("should not be possible to call addPaymentAdder with value", function (done) {

    new Promise(function (resolve, reject) {
            try {
                resolve(paymentDb.addPaymentAdder(
                    otherAdder,
                    { 
                        from: owner, 
                        value: 100,
                        gas: 300000
                    }));
            } catch(e) {
                reject(e);
            }
        })
        .then(function (txn0) {
            return web3.eth.getTransactionReceiptMined(txn0);
        })
        .then(function (receipt1) {
            assert.equal(receipt1.gasUsed, 300000, "should have used all the gas");
        })
        .then(done)
        .catch(function (e) {
            if ((e + "").indexOf("invalid JUMP") > -1) {
                // We are in TestRPC
                done();
            } else {
                done(e);
            }
        });

  });

  it("should not be possible to call removePaymentAdder with value", function (done) {

    new Promise(function (resolve, reject) {
            try {
                resolve(paymentDb.removePaymentAdder(
                    otherAdder,
                    { 
                        from: owner, 
                        value: 100,
                        gas: 300000
                    }));
            } catch(e) {
                reject(e);
            }
        })
        .then(function (txn0) {
            return web3.eth.getTransactionReceiptMined(txn0);
        })
        .then(function (receipt1) {
            assert.equal(receipt1.gasUsed, 300000, "should have used all the gas");
        })
        .then(done)
        .catch(function (e) {
            if ((e + "").indexOf("invalid JUMP") > -1) {
                // We are in TestRPC
                done();
            } else {
                done(e);
            }
        });

  });

  it("should not be possible to call addProductPayment with value", function (done) {

    new Promise(function (resolve, reject) {
            try {
                resolve(paymentDb.addProductPayment(
                        "0x001122334455667788990011223344556677889900112233445566778899001122",
                        otherAdder,
                        { 
                            from: owner, 
                            value: 100,
                            gas: 300000
                        }));
            } catch(e) {
                reject(e);
            }
        })
        .then(function (txn0) {
            return web3.eth.getTransactionReceiptMined(txn0);
        })
        .then(function (receipt1) {
            assert.equal(receipt1.gasUsed, 300000, "should have used all the gas");
        })
        .then(done)
        .catch(function (e) {
            if ((e + "").indexOf("invalid JUMP") > -1) {
                // We are in TestRPC
                done();
            } else {
                done(e);
            }
        });

  });

    it("should be possible to remove owner as paymentAdder", function (done) {

        paymentDb.removePaymentAdder.call(owner, { from: owner })
            .then(function (success0) {
                assert.isTrue(success0, "should be possible to remove");
                return paymentDb.removePaymentAdder(owner, { from: owner, gas: 300000 });        
            })
            .then(function (txn0) {
                return web3.eth.getTransactionReceiptMined(txn0);
            })
            .then(function (receipt1) {
                return paymentDb.getPaymentAdderCount.call();
            })
            .then(function (count2) {
                assert.equal(count2.valueOf(), 0, "should not have any paymentAdder left");
                return paymentDb.paymentAdders(owner);
            })
            .then(function (paymentAdder3) {
                assert.isFalse(paymentAdder3[2], "flag should have been lowered");
            })
            .then(done)
            .catch(done);

    });

});