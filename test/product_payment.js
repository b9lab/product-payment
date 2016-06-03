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

contract('ProductPayment, regular operations,', function(accounts) {

  var owner = accounts[0];
  var contributor = accounts[1];
  var beneficiary = accounts[2];
  var productPayment;

  it("should not deploy a contract with value", function (done) {

    new Promise(function (resolve, reject) {
            try {
                ProductPayment.new(
                    web3.toWei(100, "finney"),
                    owner,
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

  it("should deploy a new productPayment, with owner as beneficiary", function (done) {

    ProductPayment.new(
        web3.toWei(100, "finney"),
        owner,
        { from: owner })
      .then(function (newProductPayment) {
        productPayment = newProductPayment;
      })
      .then(done)
      .catch(done);

  });

  it("should have the proper initial values", function (done) {

    productPayment.owner()
        .then(function (ownerAddress0) {
            assert.equal(ownerAddress0, owner, "should be proper owner");
            return productPayment.price();
        })
        .then(function (price1) {
            assert.equal(price1.toString(10), web3.toWei(100, "finney"), "price should be same");
            return productPayment.beneficiary();
        })
        .then(function (beneficiaryAddress2) {
            assert.equal(beneficiaryAddress2, owner, "beneficiary not as built");
            return productPayment.isPaid();
        })
        .then(function (isPaid3) {
            assert.isFalse(isPaid3, "should not start as paid");
            return productPayment.getContributorsCount.call();
        })
        .then(function (count4) {
            assert.equal(count4, 0, "should not have any contributor");
        })
        .then(done)
        .catch(done);

  });

  it("should not be possible to call getContributorCount with value", function (done) {

    new Promise(function (resolve, reject) {
            try {
                resolve(productPayment.getContributorsCount({ 
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

  it("should be possible to change beneficiary", function (done) {

    productPayment.setBeneficiary.call(beneficiary)
        .then(function (success0) {
            assert.isTrue(success0, "setBeneficiary cannot be called");
            return productPayment.setBeneficiary(
                beneficiary,
                { from: owner });
        })
        .then(function (txn1) {
            return web3.eth.getTransactionReceiptMined(txn1);
        })
        .then(function (receipt2) {
            return productPayment.beneficiary();    
        })
        .then(function (beneficiaryAddress3) {
            assert.equal(beneficiaryAddress3, beneficiary, "beneficiary was not changed");
        })
        .then(done)
        .catch(done);

  });

  it("should not be possible to call setBeneficiary with value", function (done) {

    new Promise(function (resolve, reject) {
            try {
                resolve(productPayment.setBeneficiary(
                    beneficiary,
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

  it("should not be possible to call setBeneficiary other than from owner", function (done) {

    new Promise(function (resolve, reject) {
            try {
                resolve(productPayment.setBeneficiary(
                    beneficiary,
                    { 
                        from: beneficiary, 
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

  it("should not be possible to send value of zero", function (done) {

    new Promise(function (resolve, reject) {
            try {
                resolve(web3.eth.sendTransaction({
                        from: owner, 
                        to: productPayment.address,
                        value: 0,
                        gas: 3000000
                    }));
            } catch (e) {
                reject(e);
            }
        })
        .then(function (txn0) {
            return web3.eth.getTransactionReceiptMined(txn0);
        })
        .then(function (receipt1) {
            assert.equal(receipt1.gasUsed, 3000000, "There should have been an exception in sending the transaction");
        })
        .then(done)
        .catch(function(e) {
            if ((e + "").indexOf("invalid JUMP") > -1) {
                // We are in TestRPC
                done();
            } else {
                done(e);
            }
        });

  });

  it("should be possible to send some value twice, and see it saved", function (done) {

    txn0 = web3.eth.sendTransaction({
            from: owner, 
            to: productPayment.address,
            value: 345,
            gas: 2000000
        });

    web3.eth.getTransactionReceiptMined(txn0)
        .then(function (receipt0) {
            assert.isAtMost(receipt0.gasUsed, 200000, "Not all gas should have been consumed");
            return productPayment.contributors(0);
        })
        .then(function (contributorAddress1) {
            assert.equal(contributorAddress1, owner, "contributor was not saved?");
            return productPayment.contributions(contributorAddress1);
        })
        .then(function (contribution2) {
            assert.equal(contribution2.valueOf(), 345, "contribution not kept");
            return productPayment.isPaid();
        })
        .then(function (isPaid3) {
            assert.isFalse(isPaid3);
            return web3.eth.getTransactionReceiptMined(web3.eth.sendTransaction({
                from: owner, 
                to: productPayment.address,
                value: 111,
                gas: 1000000
            }));
        })
        .then(function (receipt4) {
            assert.isAtMost(receipt4.gasUsed, 200000, "Not all gas should have been consumed");
            return productPayment.contributors(0);
        })
        .then(function (contributorAddress5) {
            assert.equal(contributorAddress5, owner, "contributor was not saved?");
            return productPayment.getContributorsCount.call();
        })
        .then(function (contributorCount6) {
            assert.equal(contributorCount6, 1, "contributor should not have been saved again");
            return productPayment.contributions(owner);
        })
        .then(function (contribution7) {
            assert.equal(contribution7.valueOf(), 456, "contribution not kept");
            return productPayment.isPaid();
        })
        .then(function (isPaid8) {
            assert.isFalse(isPaid8);
        })
        .then(done)
        .catch(done);

  });

  it("should be possible to send, from another account, some value twice, and see it saved", function (done) {

    txn0 = web3.eth.sendTransaction({
            from: contributor, 
            to: productPayment.address,
            value: 543,
            gas: 2000000
        });

    web3.eth.getTransactionReceiptMined(txn0)
        .then(function (receipt0) {
            assert.isAtMost(receipt0.gasUsed, 200000, "Not all gas should have been consumed");
            return productPayment.contributors(1);
        })
        .then(function (contributorAddress1) {
            assert.equal(contributorAddress1, contributor, "contributor was not saved?");
            return productPayment.contributions(contributorAddress1);
        })
        .then(function (contribution2) {
            assert.equal(contribution2.valueOf(), 543, "contribution not kept");
            return productPayment.isPaid();
        })
        .then(function (isPaid3) {
            assert.isFalse(isPaid3);
            return web3.eth.getTransactionReceiptMined(web3.eth.sendTransaction({
                from: contributor, 
                to: productPayment.address,
                value: 111,
                gas: 1000000
            }));
        })
        .then(function (receipt4) {
            assert.isAtMost(receipt4.gasUsed, 200000, "Not all gas should have been consumed");
            return productPayment.contributors(1);
        })
        .then(function (contributorAddress5) {
            assert.equal(contributorAddress5, contributor, "contributor was not saved?");
            return productPayment.getContributorsCount.call();
        })
        .then(function (contributorCount6) {
            assert.equal(contributorCount6, 2, "contributor should not have been saved again");
            return productPayment.contributions(contributor);
        })
        .then(function (contribution7) {
            assert.equal(contribution7.valueOf(), 654, "contribution not kept");
            return productPayment.isPaid();
        })
        .then(function (isPaid8) {
            assert.isFalse(isPaid8);
        })
        .then(done)
        .catch(done);

  });

  it("should deploy a new productPayment again", function (done) {

    ProductPayment.new(
        web3.toWei(100, "finney"),
        beneficiary,
        { from: owner })
      .then(function (newProductPayment) {
        productPayment = newProductPayment;
      })
      .then(done)
      .catch(done);

  });

  it("should be possible to pass more than the price in 1 go", function (done) {

    var beneficiaryInitialBalance = web3.eth.getBalance(beneficiary);
    
    txn0 = web3.eth.sendTransaction({
            from: contributor, 
            to: productPayment.address,
            value: web3.toWei(1, "ether"),
            gas: 2000000
        });

    web3.eth.getTransactionReceiptMined(txn0)
        .then(function (receipt1) {
            assert.isAtMost(receipt1.gasUsed, 200000, "not all gas should have been used");
            var beneficiaryReceived = web3.eth.getBalance(beneficiary)
                .minus(beneficiaryInitialBalance);
            assert.equal(
                beneficiaryReceived.valueOf(),
                web3.toWei(100, "finney"),
                "beneficiary should have received");
            assert.equal(
                web3.eth.getBalance(productPayment.address).toString(10),
                "0",
                "contract should be empty");
            return productPayment.isPaid();
        })
        .then(function (isPaid2) {
            assert.isTrue(isPaid2);
        })
        .then(done)
        .catch(done);

  });

  it("should deploy a new productPayment again", function (done) {

    ProductPayment.new(
        web3.toWei(100, "finney"),
        beneficiary,
        { from: owner })
      .then(function (newProductPayment) {
        productPayment = newProductPayment;
      })
      .then(done)
      .catch(done);

  });

  it("should be possible to pass exactly the price in 1 go", function (done) {

    var beneficiaryInitialBalance = web3.eth.getBalance(beneficiary);
    
    txn0 = web3.eth.sendTransaction({
            from: contributor, 
            to: productPayment.address,
            value: web3.toWei(100, "finney"),
            gas: 2000000
        });

    web3.eth.getTransactionReceiptMined(txn0)
        .then(function (receipt1) {
            assert.isAtMost(receipt1.gasUsed, 200000, "not all gas should have been used");
            var beneficiaryReceived = web3.eth.getBalance(beneficiary)
                .minus(beneficiaryInitialBalance);
            assert.equal(
                beneficiaryReceived.valueOf(),
                web3.toWei(100, "finney"),
                "beneficiary should have received");
            assert.equal(
                web3.eth.getBalance(productPayment.address).toString(10),
                "0",
                "contract should be empty");
            return productPayment.isPaid();
        })
        .then(function (isPaid2) {
            assert.isTrue(isPaid2);
        })
        .then(done)
        .catch(done);

  });

  it("should not be possible to pass value after it was paid", function (done) {

    var beneficiaryInitialBalance = web3.eth.getBalance(beneficiary);

    new Promise(function (resolve, reject) {
            try {
                resolve(web3.eth.sendTransaction({
                        from: contributor, 
                        to: productPayment.address,
                        value: web3.toWei(100, "finney"),
                        gas: 3000000
                    }));
            } catch (e) {
                reject(e);
            }
        })
        .then(function (txn0) {
            return web3.eth.getTransactionReceiptMined(txn0);
        })
        .then(function (receipt1) {
            assert.equal(receipt1.gasUsed, 3000000, "There should have been an exception in sending the transaction");
        })
        .then(done)
        .catch(function(e) {
            if ((e + "").indexOf("invalid JUMP") > -1) {
                // We are in TestRPC
                done();
            } else {
                done(e);
            }
        });

  });

  it("should not be possible to call refund after it was paid", function (done) {

    var beneficiaryInitialBalance = web3.eth.getBalance(beneficiary);

    productPayment.refundMe({ from: contributor, gas: 3000000 })
        .then(function (txn0) {
            return web3.eth.getTransactionReceiptMined(txn0);
        })
        .then(function (receipt1) {
            assert.equal(receipt1.gasUsed, 3000000, "There should have been an exception in sending the transaction");
        })
        .then(done)
        .catch(function(e) {
            if ((e + "").indexOf("invalid JUMP") > -1) {
                // We are in TestRPC
                done();
            } else {
                done(e);
            }
        });

  });

  it("should deploy a new productPayment again", function (done) {

    ProductPayment.new(
        web3.toWei(100, "finney"),
        beneficiary,
        { from: owner })
      .then(function (newProductPayment) {
        productPayment = newProductPayment;
      })
      .then(done)
      .catch(done);

  });

  it("should be possible to pass exactly the price in 2 go's", function (done) {

    var beneficiaryInitialBalance = web3.eth.getBalance(beneficiary);
    
    txn0 = web3.eth.sendTransaction({
            from: contributor, 
            to: productPayment.address,
            value: web3.toWei(50, "finney"),
            gas: 2000000
        });

    web3.eth.getTransactionReceiptMined(txn0)
        .then(function (receipt1) {
            txn2 = web3.eth.sendTransaction({
                    from: contributor, 
                    to: productPayment.address,
                    value: web3.toWei(50, "finney"),
                    gas: 2000000
                });
            return web3.eth.getTransactionReceiptMined(txn2);
        })
        .then(function (receipt3) {
            assert.isAtMost(receipt3.gasUsed, 200000, "not all gas should have been used");
            var beneficiaryReceived = web3.eth.getBalance(beneficiary)
                .minus(beneficiaryInitialBalance);
            assert.equal(
                beneficiaryReceived.valueOf(),
                web3.toWei(100, "finney"),
                "beneficiary should have received");
            assert.equal(
                web3.eth.getBalance(productPayment.address).toString(10),
                "0",
                "contract should be empty");
            return productPayment.isPaid();
        })
        .then(function (isPaid4) {
            assert.isTrue(isPaid4);
        })
        .then(done)
        .catch(done);

  });

  it("should deploy a new productPayment again", function (done) {

    ProductPayment.new(
        web3.toWei(100, "finney"),
        beneficiary,
        { from: owner })
      .then(function (newProductPayment) {
        productPayment = newProductPayment;
      })
      .then(done)
      .catch(done);

  });

  it("should be possible to be refunded of 1 payment", function (done) {

    var contributorInitialBalance = web3.eth.getBalance(contributor);
    
    txn0 = web3.eth.sendTransaction({
            from: contributor, 
            to: productPayment.address,
            value: web3.toWei(50, "finney"),
            gas: 2000000
        });

    web3.eth.getTransactionReceiptMined(txn0)
        .then(function (receipt1) {
            return productPayment.contributions(contributor);
        })
        .then(function (contribution2) {
            assert.equal(
                contribution2.toString(10),
                web3.toWei(50, "finney").toString(10),
                "contribution was not accounted for");
            return productPayment.refundMe({ from: contributor });
        })
        .then(function (txn3) {
            return web3.eth.getTransactionReceiptMined(txn3);
        })
        .then(function (receipt4) {
            assert.isAtMost(receipt4.gasUsed, 200000, "not all gas should have been used");
            return productPayment.contributions(contributor);
        })
        .then(function (contribution5) {
            assert.equal(
                contribution5.valueOf(),
                0,
                "refund was not accounted for");
            assert.isAtMost(
                contributorInitialBalance.minus(web3.eth.getBalance(contributor)).valueOf(),
                2050000000000000,
                "contributor should have been refunded");
            assert.equal(
                web3.eth.getBalance(productPayment.address).toString(10),
                "0",
                "contract should be empty");
            return productPayment.isPaid();
        })
        .then(function (isPaid6) {
            assert.isFalse(isPaid6);
        })
        .then(done)
        .catch(done);

  });

  it("should deploy a new productPayment again", function (done) {

    ProductPayment.new(
        web3.toWei(100, "finney"),
        beneficiary,
        { from: owner })
      .then(function (newProductPayment) {
        productPayment = newProductPayment;
      })
      .then(done)
      .catch(done);

  });

  it("should not be possible to call refundMe with value", function (done) {

    txn0 = web3.eth.sendTransaction({
            from: contributor, 
            to: productPayment.address,
            value: web3.toWei(50, "finney"),
            gas: 2000000
        });

    web3.eth.getTransactionReceiptMined(txn0)
        .then(function (receipt1) {
            return new Promise(function (resolve, reject) {
                try {
                    resolve(productPayment.refundMe({ 
                            from: owner, 
                            value: 100,
                            gas: 300000
                        }));
                } catch(e) {
                    reject(e);
                }
            });
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

  it("should deploy a new productPayment again", function (done) {

    ProductPayment.new(
        web3.toWei(100, "finney"),
        beneficiary,
        { from: owner })
      .then(function (newProductPayment) {
        productPayment = newProductPayment;
      })
      .then(done)
      .catch(done);

  });

  it("should be possible to be refunded of 2 payments", function (done) {

    var contributorInitialBalance = web3.eth.getBalance(contributor);
    
    txn0 = web3.eth.sendTransaction({
            from: contributor, 
            to: productPayment.address,
            value: web3.toWei(50, "finney"),
            gas: 2000000
        });

    web3.eth.getTransactionReceiptMined(txn0)
        .then(function (receipt1) {
            return productPayment.contributions(contributor);
        })
        .then(function (contribution2) {
            assert.equal(
                contribution2.toString(10),
                web3.toWei(50, "finney").toString(10),
                "first contribution was not accounted for");
            txn3 = web3.eth.sendTransaction({
                    from: contributor, 
                    to: productPayment.address,
                    value: web3.toWei(25, "finney"),
                    gas: 2000000
                });
            return web3.eth.getTransactionReceiptMined(txn3);
        })
        .then(function (receipt4) {
            return productPayment.contributions(contributor);
        })
        .then(function (contribution5) {
            assert.equal(
                contribution5.toString(10),
                web3.toWei(75, "finney").toString(10),
                "second contribution was not accounted for");
            return productPayment.refundMe({ from: contributor });
        })
        .then(function (txn6) {
            return web3.eth.getTransactionReceiptMined(txn6);
        })
        .then(function (receipt7) {
            assert.isAtMost(receipt7.gasUsed, 200000, "not all gas should have been used");
            return productPayment.contributions(contributor);
        })
        .then(function (contribution8) {
            assert.equal(
                contribution8.valueOf(),
                0,
                "refund was not accounted for");
            assert.isAtMost(
                contributorInitialBalance.minus(web3.eth.getBalance(contributor)).valueOf(),
                33337112259999882052,
                "contributor should have been refunded");
            assert.equal(
                web3.eth.getBalance(productPayment.address).toString(10),
                "0",
                "contract should be empty");
            return productPayment.isPaid();
        })
        .then(function (isPaid9) {
            assert.isFalse(isPaid9);
        })
        .then(done)
        .catch(done);

  });

});