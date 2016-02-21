start ()
{
	startAppCorrectly
}

stop ()
{
  PROCESS_ID=`pwdx $(pgrep node) | grep devflow | cut -d ":" -f 1`
  if [ -n "$PROCESS_ID" ]; then
    kill $PROCESS_ID || true
  fi
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
                NODE_ENV=production nohup npm start &
	fi
}

# MAIN

CURR_DIR=`pwd`

action=$1

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
