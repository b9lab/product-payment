import "Owned.sol";

/**
 * This contract is meant:
 *   - to be created by the beneficiary account or contract.
 *   - to be sent value by the customer for the purpose of paying a course.
 */
contract ProductPayment is Owned {
	uint public price;
	address public beneficiary;
	uint public timeOut;
	bool public isPaid;
	mapping (address => uint) public contributions;
	address[] public contributors;

	event OnRemaining(uint indexed leftToPay);

	function ProductPayment(uint _price, address _beneficiary, uint _durationSeconds) 
		noValue {
		price = _price;
		beneficiary = _beneficiary;
		timeOut = now + _durationSeconds;
	}

	modifier isNotPaidYet {
		if (isPaid) {
			throw;
		}
		_
	}

	modifier isNotTimedOut {
		if (timeOut < now) {
			throw;
		}
		_
	}

	modifier noValue {
		if (msg.value > 0) {
			throw;
		}
		_
	}

	function getContributorsCount()
		noValue
		returns (uint count) {
		count = contributors.length;		
	}

	function setBeneficiary(address _beneficiary)
		fromOwner isNotPaidYet noValue
		returns (bool success) {
		beneficiary = _beneficiary;
		success = true;
	}

	function refundMe()
		isNotPaidYet noValue {
		uint refund = contributions[msg.sender];
		// We set to 0 before sending to prevent a recursive call attack.
		contributions[msg.sender] = 0;
		if (!msg.sender.call.value(refund)()) {
			contributions[msg.sender] = refund;
		}
	}

	function ()
		isNotTimedOut isNotPaidYet {
		if (msg.value == 0) {
			throw;
		}
		if (contributions[msg.sender] == 0) {
			contributors.push(msg.sender);
		}
		if (this.balance > price) {
			uint refunded = this.balance - price;
			if (!msg.sender.send(refunded)) {
				throw;
			}
			contributions[msg.sender] += msg.value - refunded;
		} else {
			contributions[msg.sender] += msg.value;
		}
		OnRemaining(price - this.balance);
		if (this.balance == price) {
			if (!beneficiary.send(this.balance)) {
				throw;
			}
			isPaid = true;
		}
	}
}