contract Owned {
	address public owner;

	event OnOwnerChanged(address indexed owner);

	function Owned() {
		owner = msg.sender;
	}

	modifier fromOwner {
		if (msg.sender != owner) {
			throw;
		}
		_
	}

	function setOwner(address _owner) fromOwner {
		owner = _owner;
		OnOwnerChanged(owner);
	}
}