![Devflow](public/images/logo.png "Devflow")

An application allowing to monitor the state of servers and requests of different kinds (pullrequests, graylogs).

<h2>Prerequisites:</h2>
  
  * NodeJS and npm
  * MongoDB
  * Google Account and App with Google+ API enabled 

<h2>Setup and Local Use:</h2>
  
  * Create a google app with Google+ API enabled in the google developers console, and prepare the: Client ID, Secret and Callback Url
  * Run: "npm install"
  * Run: "node setup" and enter the requested parameters
  * Add this line to your hosts file: 127.0.0.1 devflow.yourdomain.com # devflow
  * Run with "npm start"
  * Enter: localhost:3000 or http://devflow.yourdomain.com:3000/ 
  
  ( Please Run "npm install" again whenever changing node packages,
    In order to debug it's possible to run "node debug app.js" - node's built-in debugger )

<h2>Optional Services Integration:</h2>
  
  * GitHub
  * HipChat
  * Slack
  * Email

<h2>Configuration:</h2>
  
  config.js

  * Server Configuration - global, google, hipchat, slack, mail and jobs settings.
  * Client Configuration - display setting for request types, links and the page refresh interval.

  See examples in the config.js.dev in the project

<h2>Web Management Console:</h2>

  * User Management. (admin role only)
  * Server Management. (admin role only, no enviroment additions/deletions available)
  * Tags Management

<h2>Deploy and Production Settings:</h2>

  Configuration setup:

    For custom configuration path use: export DEVFLOW_CONFIG=path.
    (you can also include this in your .bash_profile or .bashrc)
  
  Deploy latest version and Restart (on Linux): 

    Enter your folder and run: ./deploy

  Log and Errors:

    nohup.out
