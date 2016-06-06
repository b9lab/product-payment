BASEDIR=$(dirname "$0")
geth --networkid 42 --genesis $BASEDIR/genesis42.js --datadir ~/.ethereum/net42 --rpc --rpcport 8545 --rpcaddr 0.0.0.0 --rpccorsdomain "*" --rpcapi "eth,web3" --unlock "0,1,2" --password $BASEDIR/password.txt console

# To create the 3 accounts
# geth --networkid 42 --genesis $BASEDIR/genesis42.js --datadir ~/.ethereum/net42 --password $BASEDIR/password.txt account new
# geth --networkid 42 --genesis $BASEDIR/genesis42.js --datadir ~/.ethereum/net42 --password $BASEDIR/password.txt account new
# geth --networkid 42 --genesis $BASEDIR/genesis42.js --datadir ~/.ethereum/net42 --password $BASEDIR/password.txt account new