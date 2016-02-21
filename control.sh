#!/bin/bash
start ()
{
	startAppCorrectly
}

stop ()
{
	PROCESS_ID=`pgrep node`
	if [ -n "$PROCESS_ID" ]; then
          kill $PROCESS_ID || true
  	fi
}

restart ()
{
	PROCESS_ID=`pgrep node`
	if [ -n "$PROCESS_ID" ]; then
	  kill $PROCESS_ID || true
	fi
        sleep 10
	startAppCorrectly
}

startAppCorrectly ()
{
  	npm install
  	sleep 5
        NODE_ENV=production nohup npm start &
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
