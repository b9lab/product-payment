var accounts;
var account;
var paymentHash;
var paymentAddress;
var isPaid = false;

/**
 * where: address string
 */
function updatePaymentAddress(where) {
  paymentAddress = where;
  $("#paymentAddress").html(paymentAddress);
  var productPayment = ProductPayment.at(where);
  return Promise.all([
      productPayment.price()
        .then(setPrice),
      productPayment.isPaid()
        .then(setIsPaid),
      productPayment.OnRemaining({ toBlock: 'latest' })
        .watch(function (e, values) {
          if (e) {
            console.error("Got error on OnProductPaymentAdded");
            console.error(e);
          } else {
            setRemaining(values.args.leftToPay);
          }
        })
    ])
    .catch(function (e) {
      console.error("Failed to updatePaymentAddress for " + where);
      console.error(e);
    });
}

/**
 * price: BigNumber
 */
function setPrice(price) {
  $("#priceInWei").html(price.toString(10));
  $("#priceInEther").html(web3.fromWei(price, "ether").toString(10));
  var balance = web3.eth.getBalance(paymentAddress);
  setRemaining(price.minus(balance));
}

/**
 * remaining: BigNumber
 */
function setRemaining(remaining) {
  remaining = isPaid ? web3.toBigNumber(0) : remaining;
  $("#remainingToPayWei").html(remaining.toString(10));
  $("#remainingToPayEther").html(web3.fromWei(remaining, "ether").toString(10));
  if (!isPaid) {
    setIsPaid(remaining.toString(10) == "0");
  }
}

/**
 * isPaid: boolean
 */
function setIsPaid(newIsPaid) {
  isPaid = newIsPaid;
  $("#isPaid").html(isPaid ? "true" : "false");
  if (isPaid) {
    setRemaining(web3.toBigNumber(0));
  }
  // TODO add a button to move on?
}

/**
 * newPaymentHash: bytes32 hex string
 */
function updatePaymentHash(newPaymentHash) {
  paymentHash = newPaymentHash;
  $("#paymentHash").html(paymentHash);

  return Promise.all([
      MasterPay.deployed().productPayments(paymentHash)
        .then(function (values) {
          if (values[3]) {
            return updatePaymentAddress(values[1]);
          } else {
            // We need to wait for the event
            var filter = MasterPay.deployed().OnProductPaymentAdded({ toBlock: 'latest' });
            return filter.watch(function(e, values) {
                if (e) {
                  console.error("Got error on OnProductPaymentAdded");
                  console.error(e);
                } else if (values.args.idHash == paymentHash) {
                  filter.stopWatching();
                  return updatePaymentAddress(values.args.where);
                }
              });
          }
        })
    ])
    .catch(function (e) {
      console.error("Failed to get productPayments for " + paymentHash);
      console.error(e);
    });
}

window.onload = function() {
  web3.eth.getAccounts(function(err, accs) {
    if (err != null) {
      alert("There was an error fetching your accounts.");
      return;
    }

    if (accs.length == 0) {
      alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
      return;
    }

    accounts = accs;
    account = accounts[0];

    $("#deployedMasterPay").html(MasterPay.deployed().address);

    $.get({
      url: '/myProductPurchaseHash/' + productId,
      success: updatePaymentHash
    });

  });
}
