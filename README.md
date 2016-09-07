![Devflow](public/images/logo.png "Devflow")

An application allowing to monitor the state of servers and requests of different kinds (pullrequests, graylogs).

##Prerequisites:
  
  * NodeJS and npm
  * MongoDB
  * Google Account and App with Google+ API enabled 

##Setup and Local Use:
  
  * Create a google app with Google+ API enabled in the google developers console, and prepare the: Client ID, Secret and Callback Url
  * Run: "npm install"
  * Run: "node setup" and enter the requested parameters
  * Add this line to your hosts file: 127.0.0.1 devflow.yourdomain.com # devflow
  * Run with "npm start"
  * Enter: localhost:3333 or http://devflow.yourdomain.com:3333/ 
  
  ( Please Run "npm install" again whenever changing node packages,
    In order to debug it's possible to run "node debug app.js" - node's built-in debugger )

##Optional Services Integration:
  
  * GitHub
  * HipChat
  * Slack
  * Email

##Configuration:
  
  config.js

  * Server Configuration - global, google, hipchat, slack, mail and jobs settings.
  * Client Configuration - display setting for request types, links and the page refresh interval.

  See examples in the config.js.dev in the project

##Web Management Console:

  * User Management. (admin role only)
  * Server Management. (admin role only, no environment additions/deletions available)
  * Tags Management

##Deploy and Production Settings:

  Configuration setup:

    For custom configuration path use: export DEVFLOW_CONFIG=path.
    (you can also include this in your .bash_profile or .bashrc)
  
  Deploy latest version and Restart (on Linux): 

    Enter your folder and run: ./deploy.sh

  Log and Errors:

    nohup.out
