#!/bin/bash


start ()
{
  startAppCorrectly
}

stop ()
{
  npm run stop
}

restart ()
{
  startAppCorrectly
}

startAppCorrectly ()
{
  npm install
  npm run stop
  npm run start
}

# MAIN

CURR_DIR=`pwd`

action=$1
export NODE_ENV=$2

if [ $NODE_ENV == "development" ]
then
	export SHARED_APP_DIR="./"
	export APP_CWD="./"
else
	export SHARED_APP_DIR="../../shared/"
	export APP_CWD="/home/admin/apps/devflow/current"
fi

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
