![Devflow](public/images/logo.png "Devflow")

An application allowing to monitor the state of servers and requests of different kinds (pullrequests, graylogs).

<h2>Prerequisites:</h2>

  * MongoDB
  * Google Account and App with Google+ API enabled 

<h2>Optional Services Integration:</h2>
  
  * GitHub
  * HipChat
  * Email

<h2>Configuration:</h2>
  
  config.js

  * Server Configuration - global, google, hipchat, mail and jobs settings.
  * Client Configuration - display setting for request types, links and the page refresh interval.

  See examples in the config.js.dev in the project 

<h2>Web Management Console (for admin role only):</h2>

  * User Management.
  * Server Management. (No enviroment additions/deletions available)

<h2>Setup and Local Use:</h2>
  
  * Create config.js in the root folder of the project (- rename config.js.dev to config.js and replace with your values)
  * Create a google app with Google+ API enabled in the google developers console
  * Update the google clientId, secret and callback in the config.

  Database setup:

    1. Enter mongo console by running: "mongo"
    2. Create the devflow db: "use devflow"
    3. Run the following scripts for initial population and creation of collections:

    Users: 

    db.Users.insert({id: null, email:'yourmail@yourdomain.com', name: null, image: null, associated: false, role: "admin" })

    Servers:

    db.ServerEnvironments.insert({name: "Env1", queue: [], servers: [{environment: "Env1", name:"Server11", queue: [], taken_since: null, user: null, url: null},{environment: "Env1", name:"Server12", queue: [], taken_since: null, user: null, url: null}]})
    db.ServerEnvironments.insert({name: "Env2", queue: [], servers: [{environment: "Env2", name:"Server21", queue: [], taken_since: null, user: null, url: null},{environment: "Env2", name:"Server22", queue: [], taken_since: null, user: null, url: null}]})

  Please Run "npm install" on first use or if changing node packages.

  In order to run locally please add this line to your hosts file:
  
  127.0.0.1 devflow.yourdomain.com # devflow

  Run with "npm start"

  (In order to debug it's possible to run "node debug app.js" - node's built-in debugger, breakpoints using: "debugger", evaluating vars: "repl", regular debug control commands)

  Enter: http://devflow.yourdomain.com:3000/ or localhost:3000

<h2>Deploy and Production Settings:</h2>

  configuration setup:

    use: export DEVFLOW_CONFIG=path in order to add a path to your production config.
    (you can also include this in your .bash_profile or .bashrc)
  
  Kill all node/npm processes related to devflow, for example:

    ps -eaf | grep node
    ps -eaf | grep npm
    kill x, y ,z

  Pull from master:

    git pull origin master

  Install packages if neccessary:

    npm install

  Run devflow in background on server:

    NODE_ENV=production nohup npm start &

  Log and Errors:

    nohup.out
