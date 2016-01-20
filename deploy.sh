
PROCESS_ID=`pwdx $(pgrep npm) | grep devflow | cut -d ":" -f 1`
if [ -n "$PROCESS_ID" ]; then
  kill $PROCESS_ID || true
fi

git reset --hard origin/master
git pull -r
npm install
sleep 5
NODE_ENV=production nohup npm start &