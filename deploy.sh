#!/bin/bash

PROCESS_ID=`pwdx $(pgrep node) | grep devflow | cut -d ":" -f 1`
if [ -n "$PROCESS_ID" ]; then
  kill $PROCESS_ID || true
fi

git reset --hard origin/master
git pull -r
npm install
sleep 5
NODE_ENV=production nohup npm start &