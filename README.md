# Product Payment

Offers the possibility for a customer to pay for a product with Ether.

* The merchant computes a `bytes32` hash to identify the pending payment.
* The merchant creates an instance of `ProductPayment`, named `productPayment`, and keeps a reference to it in the main instance of `PaymentDb` mapped from the `bytes32` hash.
* The merchant gives the address of `productPayment` to the customer.
* The customer queries `productPayment` to find out the price in Ether to pay.
* The customer sends Ethers to `productPayment` in 1 or more installments, from 1 or more addresses.
* As long as the full price has not been reached, the customer can be refunded in full on each account, by calling the contract.
* As soon as the full price has been reached or gone beyond:
 * the exact price is transferred to the main instance of `PaymentDb`.
 * the remainder, if above 0, is returned to the sender of the last transfer.
 * the contract becomes frozen, not killed, and remains there. It can no longer be funded.