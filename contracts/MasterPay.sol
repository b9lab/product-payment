import "PaymentDb.sol";
import "Wallet.sol";

contract MasterPay is PaymentDb, Wallet {
	function MasterPay(address[] _owners, uint _required, uint _daylimit)
            PaymentDb()
            Wallet(_owners, _required, _daylimit) {
    }
}