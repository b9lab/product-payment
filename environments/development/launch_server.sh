BASEDIR=$(dirname "$0")

if [ -f $BASEDIR/bottle.py ]; then
	echo "Bottle already downloaded"
else
	wget http://bottlepy.org/bottle.py -O $BASEDIR/bottle.py
fi

python $BASEDIR/server.py $BASEDIR