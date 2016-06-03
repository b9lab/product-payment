import "Multiowned.sol";

/**
 * This is an abstract class because the constructor of Multiowned is not called.
 */
contract PaymentDb is Multiowned {
	struct PaymentAdder {
		address who;
		uint index;
		bool isThere;
	}

	struct ProductPaymentStruct {
		bytes32 idHash;
		address where;
		uint index;
		bool isThere;
	}

	/**
	 * Are allowed to add payments.
	 */
	mapping(address => PaymentAdder) public paymentAdders;
	address[] public paymentAdderList;
	mapping (bytes32 => ProductPaymentStruct) public productPayments;
	bytes32[] public productPaymentIdHashes;

	event OnPaymentAdderAdded(address indexed who);
	event OnPaymentAdderRemoved(address indexed who);
	event OnProductPaymentAdded(bytes32 indexed idHash, address indexed where);

	function PaymentDb() 
		noValue {
    	paymentAdders[msg.sender] = PaymentAdder({
    		who: msg.sender,
    		index: 0,
    		isThere: true	
		});
    	paymentAdderList.push(msg.sender);
    }

	modifier noValue {
		if (msg.value > 0) {
			throw;
		}
		_
	}

	modifier canAddPayment {
		if (!isPaymentAdder(msg.sender)) {
			throw;
		}
		_
	}

	function isPaymentAdder(address who)
		noValue
		returns (bool) {
		return paymentAdders[who].isThere;
	}

	function getPaymentAdderCount()
		noValue
		returns (uint count) {
		count = paymentAdderList.length;
	}

	function addPaymentAdder(address who) 
		onlyowner noValue 
		returns (bool success) {
		if (!paymentAdders[who].isThere) {
			paymentAdders[who] = PaymentAdder({
				who: who,
				index: paymentAdderList.length,
				isThere: true
			}); 
			paymentAdderList.push(who);
			OnPaymentAdderAdded(who);
		}
		success = true;
	}

	function removePaymentAdder(address who)
		onlyowner noValue 
		returns (bool success) {
		if (paymentAdders[who].isThere) {
			uint index = paymentAdders[who].index;
			if (paymentAdderList.length > 1) {
				address moving = paymentAdderList[paymentAdderList.length - 1];
				paymentAdderList[index] = moving;
				paymentAdders[moving].index = index;
			}
			paymentAdderList.length--;
			delete paymentAdders[who];
			OnPaymentAdderRemoved(who);
		}
		success = true;
	}

    function getProductPaymentIdHashesCount() 
    	noValue
    	returns (uint count) {
    	count = productPaymentIdHashes.length;
    }

    function addProductPayment(bytes32 idHash, address where)
    	canAddPayment noValue
    	returns (bool success) {
		if (productPayments[idHash].isThere) {
			// You cannot add the same twice
			throw;
		}
		productPayments[idHash] = ProductPaymentStruct ({
			idHash: idHash,
			where: where,
			index: productPaymentIdHashes.length,
			isThere: true
		});
		productPaymentIdHashes.push(idHash);
		OnProductPaymentAdded(idHash, where);
		success = true;
	}
}