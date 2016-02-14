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
export SHARED_APP_DIR="../../shared/"
export APP_CWD="/home/admin/apps/fiverr_devflow/current"

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
