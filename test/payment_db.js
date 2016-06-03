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

/**
 * We are testing for the features of the abstract PaymentDb withing MasterPay.
 */
contract('ProductPayment, regular operations,', function(accounts) {

  var owner = accounts[0];
  var otherAdder = accounts[1];
  var anotherAdder = accounts[2];
  var idHash1 = "0x0011223344556677889900112233445566778899001122334455667788990011";
  var productPayment1 = "0x0123456789012345678901234567890123456789";
  var idHash2 = "0x00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff";
  var productPayment2 = "0x0123456789abcdef0123456789abcdef01234567";
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
                        idHash1,
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
            .then(function (txn1) {
                return web3.eth.getTransactionReceiptMined(txn1);
            })
            .then(function (receipt2) {
                return paymentDb.getPaymentAdderCount.call();
            })
            .then(function (count3) {
                assert.equal(count3.valueOf(), 0, "should not have any paymentAdder left");
                return paymentDb.paymentAdders(owner);
            })
            .then(function (paymentAdder4) {
                assert.isFalse(paymentAdder4[2], "flag should have been lowered");
            })
            .then(done)
            .catch(done);

    });

    it("should be possible to add a paymentAdder", function (done) {

        paymentDb.addPaymentAdder.call(otherAdder, { from: owner })
            .then(function (success0) {
                assert.isTrue(success0, "should be possible to remove");
                return paymentDb.addPaymentAdder(otherAdder, { from: owner, gas: 300000 });        
            })
            .then(function (txn1) {
                return web3.eth.getTransactionReceiptMined(txn1);
            })
            .then(function (receipt2) {
                return paymentDb.getPaymentAdderCount.call();
            })
            .then(function (count3) {
                assert.equal(count3.valueOf(), 1, "should have 1 paymentAdder");
                return paymentDb.paymentAdderList(0);
            })
            .then(function (paymentAdderAddress4) {
                assert.equal(paymentAdderAddress4, otherAdder, "should be in first position");
                return paymentDb.paymentAdders(otherAdder);
            })
            .then(function (paymentAdder5) {
                assert.equal(paymentAdder5[0], otherAdder, "otherAdder should have been added");
                assert.equal(paymentAdder5[1], 0, "should come as first");
                assert.isTrue(paymentAdder5[2], "flag should have been raised");
            })
            .then(done)
            .catch(done);

    });

    it("should be possible to add another paymentAdder", function (done) {

        paymentDb.addPaymentAdder.call(anotherAdder, { from: owner })
            .then(function (success0) {
                assert.isTrue(success0, "should be possible to remove");
                return paymentDb.addPaymentAdder(anotherAdder, { from: owner, gas: 300000 });        
            })
            .then(function (txn1) {
                return web3.eth.getTransactionReceiptMined(txn1);
            })
            .then(function (receipt2) {
                return paymentDb.getPaymentAdderCount.call();
            })
            .then(function (count3) {
                assert.equal(count3.valueOf(), 2, "should have the second paymentAdder");
                return paymentDb.paymentAdderList(1);
            })
            .then(function (paymentAdderAddress4) {
                assert.equal(paymentAdderAddress4, anotherAdder, "should be in second position");
                return paymentDb.paymentAdders(anotherAdder);
            })
            .then(function (paymentAdder5) {
                assert.equal(paymentAdder5[0], anotherAdder, "anotherAdder should have been added");
                assert.equal(paymentAdder5[1], 1, "should come as second");
                assert.isTrue(paymentAdder5[2], "flag should have been raised");
            })
            .then(done)
            .catch(done);

    });

    it("should be possible to remove the first paymentAdder", function (done) {

        paymentDb.removePaymentAdder.call(otherAdder, { from: owner })
            .then(function (success0) {
                assert.isTrue(success0, "should be possible to remove the first");
                return paymentDb.removePaymentAdder(otherAdder, { from: owner, gas: 300000 });        
            })
            .then(function (txn1) {
                return web3.eth.getTransactionReceiptMined(txn1);
            })
            .then(function (receipt2) {
                return paymentDb.getPaymentAdderCount.call();
            })
            .then(function (count3) {
                assert.equal(count3.valueOf(), 1, "should have anotherAdder left");
                return paymentDb.paymentAdders(otherAdder);
            })
            .then(function (paymentAdder4) {
                assert.isFalse(paymentAdder4[2], "flag should have been lowered");
                return paymentDb.paymentAdders(anotherAdder);
            })
            .then(function (paymentAdder5) {
                assert.equal(paymentAdder5[0], anotherAdder, "anotherAdder should be here");
                assert.equal(paymentAdder5[1], 0, "anotherAdder should be said in first position");
                assert.isTrue(paymentAdder5[2], "anotherAdder should be flagged isThere");
                return paymentDb.paymentAdderList(0);
            })
            .then(function (paymentAdderAddress6) {
                assert.equal(paymentAdderAddress6, anotherAdder, "anotherAdder should be in first position");
            })
            .then(done)
            .catch(done);

    });

    it("should be possible to add a productPayment", function (done) {

        paymentDb.addProductPayment.call(idHash1, productPayment1, { from: anotherAdder })
            .then(function (success0) {
                assert.isTrue(success0, "adding idHash1 should be possible");
                return paymentDb.addProductPayment(idHash1, productPayment1, { from: anotherAdder });
            })
            .then(function (txn1) {
                return web3.eth.getTransactionReceiptMined(txn1);
            })
            .then(function (receipt2) {
                return paymentDb.getProductPaymentIdHashesCount.call();
            })
            .then(function (count3) {
                assert.equal(count3.valueOf(), 1, "should have added idHash1");
                return paymentDb.productPaymentIdHashes(0);
            })
            .then(function (productPaymentIdHash4) {
                assert.equal(web3.toHex(productPaymentIdHash4), idHash1, "should have been same hash");
                return paymentDb.productPayments(idHash1);
            })
            .then(function (productPaymentStruct5) {
                assert.equal(web3.toHex(productPaymentStruct5[0]), idHash1, "should get same hash");
                assert.equal(productPaymentStruct5[1], productPayment1, "should get same address");
                assert.equal(productPaymentStruct5[2], 0, "should be in first index");
                assert.isTrue(productPaymentStruct5[3], "should be flagged as there");
            })
            .then(done)
            .catch(done);

    });

    it("should not be possible to add the same productPayment again", function (done) {

    new Promise(function (resolve, reject) {
            try {
                resolve(paymentDb.addProductPayment.call(
                    idHash1,
                    productPayment1,
                    { from: anotherAdder, gas: 300000 }));
            } catch(e) {
                reject(e);
            }
        })
        .then(function (success0) {
            done("should have thrown");
        })
        .catch(function (e) {
            if ((e + "").indexOf("invalid JUMP") > -1) {
                // We are in TestRPC
                done();
            } else {
                done(e);
            }
        });

    });

    it("should be possible to add another productPayment", function (done) {

        paymentDb.addProductPayment.call(idHash2, productPayment2, { from: anotherAdder })
            .then(function (success0) {
                assert.isTrue(success0, "adding idHash2 should be possible");
                return paymentDb.addProductPayment(idHash2, productPayment2, { from: anotherAdder });
            })
            .then(function (txn1) {
                return web3.eth.getTransactionReceiptMined(txn1);
            })
            .then(function (receipt2) {
                return paymentDb.getProductPaymentIdHashesCount.call();
            })
            .then(function (count3) {
                assert.equal(count3.valueOf(), 2, "should have added idHash2");
                return paymentDb.productPaymentIdHashes(1);
            })
            .then(function (productPaymentIdHash4) {
                assert.equal(web3.toHex(productPaymentIdHash4), idHash2, "should have been same hash");
                return paymentDb.productPayments(idHash2);
            })
            .then(function (productPaymentStruct5) {
                assert.equal(web3.toHex(productPaymentStruct5[0]), idHash2, "should get same hash");
                assert.equal(productPaymentStruct5[1], productPayment2, "should get same address");
                assert.equal(productPaymentStruct5[2], 1, "should be in second index");
                assert.isTrue(productPaymentStruct5[3], "should be flagged as there");
            })
            .then(done)
            .catch(done);

    });

});