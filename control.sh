start ()
{
	startAppCorrectly
}

stop ()
{
	npm stop
}

restart ()
{
	startAppCorrectly
}

startAppCorrectly ()
{
	npm install
    	if [ $? -ne "0" ]
    	then
    		echo "${APP} is down , starting..."
        	npm start
	fi
}

# MAIN

CURR_DIR=`pwd`

action=$1
export NODE_ENV=$2

case "$action" in
	stop)
		stop
	;;
	start)
		start
	;;
	restart)
		restart
	;;
esac
