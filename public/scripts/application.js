var devflowApp=angular.module("devflowApp",["ngRoute","ngDialog","ngAnimate"]);devflowApp.config(["$routeProvider",function($routeProvider){$routeProvider.when("/main",{templateUrl:"views/templates/dashboard.html",controller:"dashboardController"}).when("/servers",{templateUrl:"views/templates/servers.html",controller:"serverController"}).when("/pullrequests",{templateUrl:"views/templates/requests.html",controller:"requestController"}).when("/graylogs",{templateUrl:"views/templates/requests.html",controller:"requestController"}).when("/manage-users",{templateUrl:"views/templates/manageUsers.html",controller:"usersController"}).when("/manage-servers",{templateUrl:"views/templates/manageServers.html",controller:"manageServersController"}).when("/manage-repos",{templateUrl:"views/templates/manageRepos.html",controller:"reposController"}).when("/manage-tags",{templateUrl:"views/templates/manageTags.html",controller:"tagController"}).otherwise({redirectTo:"/main"})}]),devflowApp.factory("socket",function($rootScope){var socket=io.connect();return{on:function(eventName,callback){socket.on(eventName,function(){var args=arguments;$rootScope.$apply(function(){callback.apply(socket,args)})})},emit:function(eventName,data,callback){socket.emit(eventName,data,function(){var args=arguments;$rootScope.$apply(function(){callback&&callback.apply(socket,args)})})}}}),String.prototype.lpad=function(padString,length){for(var str=this;str.length<length;)str=padString+str;return str},Date.prototype.toFormattedTimeString=function(){var date=this;return date.getHours().toString().lpad("0",2)+":"+date.getMinutes().toString().lpad("0",2)},Date.prototype.toFormattedDateString=function(){var date=this;return date.getDate().toString().lpad("0",2)+"/"+(date.getMonth()+1).toString().lpad("0",2)+"/"+date.getFullYear().toString()},Date.prototype.toFormattedDateTimeString=function(){var date=this;return date.getDate().toString().lpad("0",2)+"/"+(date.getMonth()+1).toString().lpad("0",2)+"/"+date.getFullYear().toString()+" "+date.getHours().toString().lpad("0",2)+":"+date.getMinutes().toString().lpad("0",2)},Date.prototype.toFormattedShortDateTimeString=function(){var date=this;return date.getDate().toString().lpad("0",2)+"/"+(date.getMonth()+1).toString().lpad("0",2)+" "+date.getHours().toString().lpad("0",2)+":"+date.getMinutes().toString().lpad("0",2)},devflowApp.factory("config",[function(){return window.config}]),devflowApp.factory("userService",["$http",function($http){return{currentUser:null,getCurrentUser:function(onSuccess,onFailure){return this.currentUser?(onSuccess(this.currentUser),this.currentUser):void $http.get("/users/currentUser").success(function(data,status,headers,config){"function"==typeof onSuccess&&(this.currentUser=data,onSuccess(data))}).error(function(data,status,headers,config){"function"==typeof onFailure&&onFailure(data)})},newUser:function(){return{id:null,email:null,name:null,image:null,associated:!1,role:"user"}},updateUser:function(user,onSuccess,onFailure){$http.post("/users/currentUser",{user:user}).success(function(data,status,headers,config){"function"==typeof onSuccess&&onSuccess(data)}).error(function(data,status,headers,config){"function"==typeof onFailure&&onFailure(data)})},allUsers:function(onSuccess,onFailure){$http.get("/users").success(function(data,status,headers,config){"function"==typeof onSuccess&&onSuccess(data)}).error(function(data,status,headers,config){"function"==typeof onFailure&&onFailure(data)})},updateUsers:function(users,onSuccess,onFailure){$http.post("/users",{users:users}).success(function(data,status,headers,config){"function"==typeof onSuccess&&onSuccess(data)}).error(function(data,status,headers,config){"function"==typeof onFailure&&onFailure(data)})},isManagingUser:function(user){return"admin"==user.role||"devops"==user.role}}}]),devflowApp.factory("notificationService",["userService",function(userService){var unreadCallback,currentUser,notifcations=[];return userService.getCurrentUser(function(user){currentUser=user}),{getNotifications:function(){return notifcations},add:function(text,image,relatedUser){var notification={text:text,image:image};relatedUser.email==currentUser.email&&(notifcations.unshift(notification),unreadCallback&&unreadCallback())},setUnreadCallback:function(callback){unreadCallback=callback}}}]),devflowApp.factory("requestService",["$http","socket","notificationService","repoService","config",function($http,socket,notificationService,repoService,config){var requests={},repos=[],methods={userData:function(user){return{name:user.name,image:user.image,email:user.email}},update:function(request,data,raiseEvent){if(request){for(var field in request)request[field]=data[field];raiseEvent&&socket.emit("updateRequest",request)}},getCollection:function(request){return requests[request.type]},find:function(request){for(var requestCollection=this.getCollection(request),requestIndex=0;requestIndex<requestCollection.length;requestIndex++)if(requestCollection[requestIndex]._id==request._id||requestCollection[requestIndex].data.title==request.data.title)return requestCollection[requestIndex];return null},nudge:function(request,isCallback){var requestCollection=methods.getCollection(request);requestCollection.splice(requestCollection.indexOf(request),1),requestCollection.unshift(request),request.created_date=new Date,isCallback||socket.emit("nudgeRequest",request)},initSockets:function(){var that=this;socket.on("requestTaken",function(data){that.update(that.find(data),data),notificationService.add(data.reviewer.name+" has taken your request",data.reviewer.image,data.user)}),socket.on("requestCompleted",function(data){that.update(that.find(data),data),notificationService.add(data.reviewer.name+" has reviewed your request",data.reviewer.image,data.user)}),socket.on("requestUpdated",function(data){that.update(that.find(data),data),data.reviewer&&notificationService.add(data.user.name+" has updated the request you took",data.user.image,data.reviewer)}),socket.on("requestAdded",function(data){that.getCollection(data).unshift(data)}),socket.on("requestNudged",function(data){that.nudge(that.find(data),!0)}),socket.on("requestDeleted",function(data){var collection=that.getCollection(data),request=that.find(data);index=collection.indexOf(request),index>=0&&collection.splice(index,1)})},fetchRepos:function(){repos.length||repoService.getRepos(function(data){repos=data})}};return methods.initSockets(),methods.fetchRepos(),{getRequests:function(type,notTaken,count,onSuccess,onFailure,skipStore){var params={};notTaken&&(params.notTaken=!0),count&&(params.count=count),$http.get("/request/"+type,{params:params}).success(function(data,status,headers,config){"function"==typeof onSuccess&&(skipStore||(requests[type]=data),onSuccess(data))}).error(function(data,status,headers,config){"function"==typeof onFailure&&onFailure(data)})},allowedToReview:function(user){return"reviewer"==user.role||"admin"==user.role||"devops"==user.role},take:function(request,user){request.state="taken",request.sort_order=2,request.reviewer=methods.userData(user),request.taken_date=new Date,socket.emit("takeRequest",request)},getEnv:function(request){if(config.requests[request.type].constantEnv)return config.requests[request.type].constantEnv;if(request.data.title&&request.data.title.indexOf("http")>=0){var arr=request.data.title.split("/"),env=arr[arr.length-3];return env="pull"==env?arr[arr.length-4]:env,env.replace("_"," ")}return"Pull Request"},getNumber:function(request){if(!config.requests[request.type].hasNumber)return"";if(request.data.title&&request.data.title.indexOf("http")>=0){var arr=request.data.title.split("/"),pullNum=arr[arr.length-1];return"#"+("files"==pullNum?arr[arr.length-2]:pullNum)}return"Not Valid"},"new":function(type,defaultType,user){return user=methods.userData(user),{type:type,urgency:"high",state:"posted",data:{title:null,desc:null,sub_type:defaultType},user:user,sort_order:1,reviewer:null,created_date:null,taken_date:null,reviewed_date:null,rejected:!1,tag:null}},complete:function(request,rejected){request.state="reviewed",request.sort_order=3,request.reviewed_date=new Date,request.rejected=rejected?!0:!1,socket.emit("completeRequest",request)},isUserRequest:function(request,user){return request.user.email==user.email},isPosted:function(request){return"posted"==request.state},isTaken:function(request){return"taken"==request.state},isReviewed:function(request){return"reviewed"==request.state},wasRejected:function(request){return request.rejected},canEdit:function(request,user){return this.isUserRequest(request,user)&&"reviewed"!=request.state},canComplete:function(request,user){var selfTakable=config.requests[request.type].selfTakable;return"taken"==request.state&&request.reviewer.email==user.email&&this.allowedToReview(user)&&(request.user.email!=user.email||selfTakable)},canTake:function(request,user){var selfTakable=config.requests[request.type].selfTakable;return"posted"==request.state&&this.allowedToReview(user)&&(request.user.email!=user.email||selfTakable)},release:function(request){request.state="posted",request.reviewer=null,request.taken_date=null,request.sort_order=1,socket.emit("updateRequest",request)},nudge:methods.nudge,"delete":function(request){var collection=methods.getCollection(request);index=collection.indexOf(request),index>=0&&collection.splice(index,1),socket.emit("deleteRequest",request)},createOrUpdate:function(request,user,isNew){if(isNew)request.data.title.length>0&&(request.user=methods.userData(user),request.created_date=new Date,methods.getCollection(request).unshift(request),socket.emit("addRequest",request,function(newRequest){request._id=newRequest._id}));else{var realRequest=methods.find(request);realRequest&&methods.update(realRequest,request,!0)}},loadMore:function(type){this.getRequests(type,!1,requests[type].length+9,function(newRequests){for(var requestsToAdd=newRequests.slice(requests[type].length),i=0;i<requestsToAdd.length;i++)requests[type].push(requestsToAdd[i])},null,!0)},preCheck:function(url,callback){socket.emit("preCheckRequest",url,callback)},getTeam:function(request){for(var repoIndex=0;repoIndex<repos.length;repoIndex++)if(request.data.title.split("/")[4]==repos[repoIndex].name)return repos[repoIndex].team_name;return"None"}}}]),devflowApp.factory("serverService",["$http","socket","notificationService",function($http,socket,notificationService){var serverEnvironments=[],freeOnly=!1,methods={findEnvByName:function(name){for(var serverEnvIndex=0;serverEnvIndex<serverEnvironments.length;serverEnvIndex++)if(serverEnvironments[serverEnvIndex].name==name)return serverEnvironments[serverEnvIndex];return null},find:function(server){for(var serverEnvIndex=0;serverEnvIndex<serverEnvironments.length;serverEnvIndex++)for(var serverEnv=serverEnvironments[serverEnvIndex],serverIndex=0;serverIndex<serverEnv.servers.length;serverIndex++)if(serverEnv.servers[serverIndex].name==server.name)return serverEnv.servers[serverIndex];return null},update:function(server,data){if(server)for(var field in data)server[field]=data[field]},userData:function(user){return{name:user.name,image:user.image,email:user.email}},initSockets:function(){var that=this;socket.on("serverTaken",function(data){var server=that.find(data);if(that.update(server,data),freeOnly){var env=that.findEnvByName(data.environment);env.servers.splice(env.servers.indexOf(server),1)}}),socket.on("serverReleased",function(data){var server=that.find(data);if(that.update(server,data),freeOnly){var env=that.findEnvByName(data.environment);env.servers.push(data)}data.user&&notificationService.add(data.name+" is free and you are next in line, use it wisely",data.user.image,data.user)}),socket.on("serverDownStateChanged",function(data){that.update(that.find(data),data)}),socket.on("serverQueued",function(data){that.update(that.find(data.server),data.server)}),socket.on("serverExtended",function(data){that.update(that.find(data),data)}),socket.on("serverUnqueued",function(data){that.update(that.find(data.server),data.server)}),socket.on("envQueued",function(data){that.update(that.findEnvByName(data.env.name),data.env)}),socket.on("envUnqueued",function(data){that.update(that.findEnvByName(data.env.name),data.env)}),socket.on("serverCreated",function(data){var env=that.findEnvByName(data.environment);env.servers.push(data)}),socket.on("serverKilled",function(data){var env=that.findEnvByName(data.environment);env.servers.splice(env.servers.indexOf(data),1)})}};return methods.initSockets(),{getServers:function(freeOnly,onSuccess,onFailure){var params={};freeOnly&&(params.free=!0,freeOnly=!0),$http.get("/server",{params:params}).success(function(data,status,headers,config){"function"==typeof onSuccess&&(serverEnvironments=data,onSuccess(data))}).error(function(data,status,headers,config){"function"==typeof onFailure&&onFailure(data)})},newServer:function(envName){return{name:"",environment:envName,url:"",user:null,queue:[],taken_since:null,is_down:!1,release_date:null}},updateServers:function(envs,onSuccess,onFailure){$http.post("/servers",{envs:envs}).success(function(data,status,headers,config){"function"==typeof onSuccess&&onSuccess(data)}).error(function(data,status,headers,config){"function"==typeof onFailure&&onFailure(data)})},take:function(server,user){server.user=methods.userData(user),server.taken_since=new Date,server.release_date=new Date,this.setReleaseDate(server,1),socket.emit("takeServer",server),this.removeUserFromQueue(server.queue,server.user)},create:function(envName,branchName,user,customGems,callback){server={},server.user=methods.userData(user),server.taken_since=new Date,server.release_date=new Date,server.environment=envName,server.branch_name=branchName,server.custom_gemset=customGems,this.setReleaseDate(server,1),socket.emit("createServer",server,function(data){var env=methods.findEnvByName(data.environment);env.servers.push(data)})},kill:function(server){var env=methods.findEnvByName(server.environment);env.servers.splice(env.servers.indexOf(server),1),socket.emit("killServer",server)},extend:function(server,hours){this.setReleaseDate(server,hours),socket.emit("extendServer",server)},release:function(server){var that=this,env=methods.findEnvByName(server.environment),unqueuEnv=!1,nextUser=null;0==server.queue.length&&0==env.queue.length?(server.user=null,server.taken_since=null,server.release_date=null):(server.queue.length>0?(nextUser=server.queue[0],server.queue.splice(0,1)):env.queue.length>0&&(nextUser=env.queue[0],env.queue.splice(0,1),unqueuEnv=!0),server.user=nextUser,server.taken_since=new Date,server.release_date=new Date,that.setReleaseDate(server,1)),socket.emit("releaseServer",server),unqueuEnv&&socket.emit("unqueueEnv",{env:env,user:methods.userData(nextUser)})},joinQueue:function(server,user,isEnv){user=methods.userData(user),server.queue.push(user),isEnv?socket.emit("queueEnv",{env:server,user:user}):socket.emit("queueServer",{server:server,user:user})},unqueue:function(server,user,isEnv){user=methods.userData(user),this.removeUserFromQueue(server.queue,user),isEnv?socket.emit("unqueueEnv",{env:server,user:user}):socket.emit("unqueueServer",{server:server,user:user})},changeDownState:function(server,isDown){server.is_down=isDown,this.release(server),socket.emit("changeServerDownState",server)},isTaken:function(server){return"undefined"!=typeof server.user&&null!==server.user},isDown:function(server){return server.is_down},isTakenByUser:function(server,user){return server.user&&server.user.email==user.email},allowedToTakeDown:function(server,user){return("admin"==user.role||"devops"==user.role)&&!server.on_demand},canJoin:function(server,user,isEnv){var that=this,env=isEnv?server:methods.findEnvByName(server.environment);if(that.isDown(server)||that.isUserInQueue(env.queue,user)||server.on_demand&&!isEnv)return!1;for(var serverIndex=0;serverIndex<env.servers.length;serverIndex++){var currServer=env.servers[serverIndex];if(that.isTakenByUser(currServer,user)||that.isUserInQueue(currServer.queue,user))return!1}return!0},canJoinEnvQueue:function(env,user){for(var serverIndex=0;serverIndex<env.servers.length;serverIndex++)if(!env.servers[serverIndex].user)return!1;return this.canJoin(env,user,!0)},isUserInQueue:function(queue,user){for(var queueIndex=0;queueIndex<queue.length;queueIndex++)if(queue[queueIndex].email==user.email)return!0;return!1},setReleaseDate:function(server,hours){var releaseDate=new Date(server.release_date);server.release_date=releaseDate.setHours(releaseDate.getHours()+hours)},removeUserFromQueue:function(queue,user){for(var i=0;i<queue.length;i++)queue[i].email==user.email&&queue.splice(i,1)}}}]),devflowApp.factory("reviewService",["$http",function($http){return{getReviews:function(type,count,onSuccess,onFailure){var params={};count&&(params.count=count),$http.get("/review/"+type,{params:params}).success(function(data,status,headers,config){"function"==typeof onSuccess&&onSuccess(data)}).error(function(data,status,headers,config){"function"==typeof onFailure&&onFailure(data)})},getReviewCount:function(type,onSuccess,onFailure){$http.get("/review/count/"+type).success(function(data,status,headers,config){"function"==typeof onSuccess&&onSuccess(data)}).error(function(data,status,headers,config){"function"==typeof onFailure&&onFailure(data)})}}}]),devflowApp.factory("repoService",["$http",function($http){return{getRepos:function(onSuccess,onFailure){$http.get("/repos").success(function(data,status,headers,config){"function"==typeof onSuccess&&onSuccess(data)}).error(function(data,status,headers,config){"function"==typeof onFailure&&onFailure(data)})},newRepo:function(){return{name:null,team_name:null,hipchat_group:null,slack_group:null}},updateRepos:function(repos,onSuccess,onFailure){$http.post("/repos",{repos:repos}).success(function(data,status,headers,config){"function"==typeof onSuccess&&onSuccess(data)}).error(function(data,status,headers,config){"function"==typeof onFailure&&onFailure(data)})}}}]),devflowApp.factory("tagService",["$http",function($http){return{getTags:function(onSuccess,onFailure){$http.get("/tags").success(function(data,status,headers,config){"function"==typeof onSuccess&&onSuccess(data)}).error(function(data,status,headers,config){"function"==typeof onFailure&&onFailure(data)})},newTag:function(){return{name:null,owner:null}},updateTags:function(tags,onSuccess,onFailure){$http.post("/tags",{tags:tags}).success(function(data,status,headers,config){"function"==typeof onSuccess&&onSuccess(data)}).error(function(data,status,headers,config){"function"==typeof onFailure&&onFailure(data)})}}}]),devflowApp.controller("mainController",["$scope","$interval","userService","reviewService","ngDialog","notificationService","config",function($scope,$interval,userService,reviewService,ngDialog,notificationService,config){userService.getCurrentUser(function(user){$scope.currentUser=user,$scope.isManagingUser=userService.isManagingUser(user)}),$scope.userCounts={},reviewService.getReviewCount("pullrequest",function(count){$scope.userCounts.pullrequest=count}),reviewService.getReviewCount("graylog",function(count){$scope.userCounts.graylog=count}),$scope.showNotifications=!1,$scope.notifications=notificationService.getNotifications(),$scope.hasUnreadNotifications=!1,notificationService.setUnreadCallback(function(){$scope.hasUnreadNotifications=!0}),$interval(function(){window.location.reload()},config.refreshInterval),$scope.isSelected=function(path){return window.location.hash=="#/"+path},$scope.showUserImagePopup=function(){ngDialog.open({template:"/views/templates/popups/userImage.html",controller:["$scope","userService",function($scope,userService){userService.getCurrentUser(function(user){$scope.currentUser=user}),$scope.saveUserImage=function(){userService.updateUser($scope.currentUser),$scope.closeThisDialog()}}]})},$scope.showAboutPopup=function(){ngDialog.open({template:"/views/templates/popups/about.html"})},$scope.toggleNotifications=function(show){$scope.showNotifications=show,show&&($scope.hasUnreadNotifications=!1)},$scope.search=function(){}}]),devflowApp.controller("dashboardController",["$scope","userService","requestService","serverService","reviewService","config",function($scope,userService,requestService,serverService,reviewService,config){userService.getCurrentUser(function(user){$scope.currentUser=user}),requestService.getRequests("pullrequest",!0,3,function(pullrequests){$scope.pullrequests=pullrequests}),requestService.getRequests("graylog",!0,3,function(graylogs){$scope.graylogs=graylogs}),serverService.getServers(!0,function(servers){$scope.serverEnvironments=servers}),reviewService.getReviews("pullrequest",3,function(reviews){$scope.pullrequestReviews=reviews}),reviewService.getReviews("graylog",3,function(reviews){$scope.graylogReviews=reviews}),$scope.links=config.links}]),devflowApp.controller("serverController",["$scope","userService","serverService",function($scope,userService,serverService,socket){userService.getCurrentUser(function(user){$scope.currentUser=user}),serverService.getServers(!1,function(servers){$scope.serverEnvironments=servers})}]),devflowApp.controller("usersController",["$scope",function($scope){$scope.service={name:"userService",fetchAllAction:"allUsers",updateAllAction:"updateUsers",newModel:"newUser"};var emailValidator=function(value){var emailRegex=new RegExp("^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$");return emailRegex.test(value)},nameValidator=function(value){return value.length>=3};$scope.fields=[{key:"image",type:"image",name:"Photo",viewClass:"user-image"},{key:"name",type:"text",name:"Name",placeholder:"New User",unique:!0,validator:nameValidator},{key:"id",type:"readonly",name:"Google ID"},{key:"email",type:"text",name:"Email",unique:!0,validator:emailValidator},{key:"image",type:"text",name:"Image"},{key:"associated",type:"checkbox",name:"Associated?"},{key:"role",type:"text",name:"Role"}]}]),devflowApp.controller("requestController",["$scope","userService","requestService","reviewService",function($scope,userService,requestService,reviewService){$scope.requestType=window.location.hash.replace("#/","").slice(0,-1),userService.getCurrentUser(function(user){$scope.currentUser=user}),requestService.getRequests($scope.requestType,!1,8,function(requests){$scope.requests=requests}),reviewService.getReviews($scope.requestType,6,function(reviews){$scope.reviews=reviews}),$scope.loadMore=function(){requestService.loadMore($scope.requestType)},$scope.isFirstReview=function(review){return 0==$scope.reviews.indexOf(review)}}]),devflowApp.controller("manageServersController",["$scope","serverService",function($scope,serverService){serverService.getServers(!1,function(envs){$scope.envs=envs}),$scope.addServer=function(env){env.servers.unshift(serverService.newServer(env.name))},$scope.deleteServer=function(env,server){env.servers.splice(env.servers.indexOf(server),1)},$scope.saveServers=function(){serverService.updateServers($scope.envs)}}]),devflowApp.controller("reposController",["$scope",function($scope){$scope.service={name:"repoService",fetchAllAction:"getRepos",updateAllAction:"updateRepos",newModel:"newRepo"},$scope.fields=[{key:"name",type:"text",name:"Name",placeholder:"New Repo",unique:!0},{key:"team_name",type:"text",name:"Team Name"},{key:"hipchat_group",type:"text",name:"Hipchat Group"},{key:"slack_group",type:"text",name:"Slack Tag"}]}]),devflowApp.controller("tagController",["$scope",function($scope){$scope.service={name:"tagService",fetchAllAction:"getTags",updateAllAction:"updateTags",newModel:"newTag"},$scope.fields=[{key:"name",type:"text",name:"Name",placeholder:"New Tag",unique:!0},{key:"owner",type:"text",name:"Owner"}]}]),devflowApp.directive("ngSrc",function(){return{link:function(scope,element,attrs){element.bind("error",function(){element.attr("src","../images/noimage.jpg")})}}}),devflowApp.directive("request",["userService","requestService","tagService","config","ngDialog",function(userService,requestService,tagService,config,ngDialog){return{restrict:"E",scope:{request:"=requestObject",currentUser:"=",isNew:"=",type:"="},templateUrl:"scripts/directives/request/view.html",controller:function($scope){var currentUser=$scope.currentUser,requestType=$scope.type||$scope.request.type,requestConfig=config.requests[requestType];$scope.smallLabels=requestConfig.useSmallLabels,$scope.rejectable=requestConfig.rejectable,$scope.showTeam=requestConfig.showTeam,$scope.getEnv=function(request){return requestService.getEnv(request)},$scope.getNumber=function(request){return requestService.getNumber(request)},$scope.getTeam=function(request){return requestService.getTeam(request)},$scope.canEdit=function(request){return requestService.canEdit(request,currentUser)},$scope.openEdit=function(request){var isNew=!1,requestInEdit=null;request?requestInEdit=JSON.parse(JSON.stringify(request)):(requestInEdit=requestService["new"](requestType,requestConfig.types[0],currentUser),isNew=!0),ngDialog.open({template:"/views/templates/popups/editRequest.html",controller:["$scope",function($scope){var typeRegex=new RegExp(requestConfig.linkRegex);$scope.request=requestInEdit,$scope.isNew=isNew,$scope.linkTitle=requestConfig.linkTitle,$scope.typeTitle=requestConfig.typeTitle,$scope.requestTypes=requestConfig.types,$scope.invalidFields={title:!1,desc:!1},$scope.shouldSquash=!1,$scope.mergeable=!0,tagService.getTags(function(tags){$scope.tags=tags});var validateRequest=function(request){return request.data.title&&typeRegex.test(request.data.title)?!request.data.desc||request.data.desc.length>378?($scope.invalidFields.desc=!0,!1):!0:($scope.invalidFields.title=!0,!1)};$scope.saveRequest=function(request){if(validateRequest(request)){if(requestService.createOrUpdate(request,currentUser,isNew),isNew&&$scope.additionalType){var secondRequest=JSON.parse(JSON.stringify(request));secondRequest.data.sub_type=$scope.additionalType,requestService.createOrUpdate(secondRequest,currentUser,!0)}$scope.closeThisDialog()}},$scope.fieldChanged=function(fieldName){$scope.invalidFields[fieldName]=!1},$scope.addAdditionalType=function(){$scope.additionalType||($scope.additionalTypes=$scope.requestTypes.slice(0),$scope.additionalTypes.splice($scope.additionalTypes.indexOf($scope.request.data.sub_type),1),$scope.additionalType=$scope.additionalTypes[0])},$scope.removeAdditionalType=function(){$scope.additionalType=null},$scope.titleBlur=function(url){url&&requestService.preCheck(url,function(response){response&&($scope.request.data.desc=response.description,$scope.shouldSquash=response.shouldSquash,$scope.mergeable=response.mergeable)})}}]})},$scope.isPosted=function(request){return requestService.isPosted(request)},$scope.wasRejected=function(request){return requestService.wasRejected(request)},$scope.nudge=function(request){requestService.nudge(request)},$scope.canComplete=function(request){return requestService.canComplete(request,currentUser)},$scope.release=function(request){requestService.release(request,currentUser)},$scope.getDisplayTitle=function(request){return request.data.title.length>50?request.data.title.substr(0,47)+"...":request.data.title},$scope.getDisplayDate=function(date){return new Date(date).toFormattedDateTimeString()},$scope.canTake=function(request){return requestService.canTake(request,currentUser)},$scope.take=function(request){requestService.take(request,currentUser)},$scope.isWaitingForReviewStart=function(request){return!requestService.canTake(request,currentUser)&&requestService.isPosted(request)},$scope.isWaitingForReviewEnd=function(request){return requestService.isTaken(request)&&!requestService.canComplete(request,currentUser)},$scope["delete"]=function(request){requestService["delete"](request)},$scope.hasReviewer=function(request){return requestService.isTaken(request)||requestService.isReviewed(request)},$scope.complete=function(request){requestService.complete(request)},$scope.reject=function(request){ngDialog.open({template:"/views/templates/popups/rejectionReasons.html",controller:["$scope",function($scope){request.rejection_reasons=[],$scope.request=request,$scope.reasons=requestConfig.rejectionReasons,$scope.reject=function(){requestService.complete(request,!0),$scope.closeThisDialog()},$scope.toggleRejectionReason=function(reason){var reasonIndex=$scope.request.rejection_reasons.indexOf(reason);reasonIndex>-1?$scope.request.rejection_reasons.splice(reasonIndex,1):$scope.request.rejection_reasons.push(reason)},$scope.isSelected=function(reason){return $scope.request.rejection_reasons.indexOf(reason)>-1}}]})},$scope.isReviewed=function(request){return requestService.isReviewed(request)}}}}]),devflowApp.directive("review",[function(){return{restrict:"E",scope:{review:"=reviewObject",isFirst:"=",index:"="},templateUrl:"scripts/directives/review/view.html",controller:function($scope){}}}]),devflowApp.directive("serverEnv",["userService","serverService","ngDialog",function(userService,serverService,ngDialog){return{restrict:"E",scope:{env:"=envObject",currentUser:"="},templateUrl:"scripts/directives/server-env/view.html",controller:function($scope){$scope.canJoinEnvQueue=function(env){return serverService.canJoinEnvQueue(env,currentUser)},$scope.isUserInQueue=function(env){return serverService.isUserInQueue(env.queue,currentUser)},$scope.joinQueue=function(env){serverService.joinQueue(env,currentUser,!0)},$scope.canAddServer=function(env){return env.on_demand&&serverService.canJoin(env,currentUser,!0)},$scope.unqueue=function(env){serverService.unqueue(env,currentUser,!0)},$scope.openCreate=function(env){ngDialog.open({template:"/views/templates/popups/createServer.html",controller:["$scope",function($scope){$scope.env=JSON.parse(JSON.stringify(env));var validateServer=function(env){return env.data.branchName?!0:($scope.invalidFields.branchName=!0,!1)};$scope.saveServer=function(env){validateServer(env)&&serverService.create(env.name,env.data.branchName,currentUser,env.data.customGems,env),$scope.closeThisDialog()}}]})}}}}]),devflowApp.directive("server",["userService","serverService","ngDialog",function(userService,serverService,ngDialog){return{restrict:"E",scope:{server:"=serverObject",currentUser:"="},templateUrl:"scripts/directives/server/view.html",controller:function($scope){$scope.isTaken=function(server){return serverService.isTaken(server)},$scope.canJoin=function(server){return serverService.canJoin(server,currentUser,!1)},$scope.canTakeDown=function(server){return serverService.allowedToTakeDown(server,currentUser)&&!serverService.isDown(server)},$scope.canTakeUp=function(server){return serverService.allowedToTakeDown(server,currentUser)&&serverService.isDown(server)},$scope.changeDownState=function(server,isDown){serverService.changeDownState(server,isDown)},$scope.showExtendForm=function(server){ngDialog.open({template:"/views/templates/popups/serverExtend.html",controller:["$scope",function($scope){$scope.server=server,$scope.time=1,$scope.timeInvalid=!1,$scope.extend=function(server){$scope.time>=1&&$scope.time<=12?(serverService.extend(server,$scope.time),$scope.closeThisDialog()):$scope.timeInvalid=!0},$scope.fieldChanged=function(){$scope.timeInvalid=!1}}]})},$scope.releaseTime=function(server){var releaseDate=new Date(server.release_date);return releaseDate.toFormattedShortDateTimeString()},$scope.isCurrentUser=function(server){return serverService.isTakenByUser(server,currentUser)},$scope.isOnDemand=function(server){return server.on_demand},$scope.take=function(server){serverService.take(server,currentUser),window.open(server.url,"_blank")},$scope.navigateToServer=function(server){window.open(server.server_url,"_blank")},$scope.navigateToDeploy=function(server){window.open(server.url,"_blank")},$scope.kill=function(server){serverService.kill(server,currentUser,!0)},$scope.release=function(server){serverService.release(server)},$scope.joinQueue=function(server){serverService.joinQueue(server,currentUser,!1)},$scope.isUserInQueue=function(server){
return serverService.isUserInQueue(server.queue,currentUser)},$scope.unqueue=function(server){serverService.unqueue(server,currentUser,!1)},$scope.getState=function(server){return serverService.isDown(server)?"down":serverService.isTaken(server)?"taken":"free"}}}}]),devflowApp.directive("modelManager",["$injector",function($injector){return{restrict:"E",scope:{caption:"=",service:"=",fields:"="},templateUrl:"scripts/directives/model-manager/view.html",controller:function($scope){var service=$injector.get($scope.service.name);service[$scope.service.fetchAllAction](function(models){$scope.models=models}),$scope.invalidFields=[],$scope.saving=!1;var validateModels=function(){for(var fieldCounts={},setInvalid=function(i,fieldName){$scope.invalidFields[i]={},$scope.invalidFields[i][fieldName]=!0},i=0;i<$scope.models.length;i++)for(var model=$scope.models[i],fieldIndex=0;fieldIndex<$scope.fields.length;fieldIndex++){var field=$scope.fields[fieldIndex],fieldValue=model[field.key];if(field.unique&&(fieldCounts[fieldValue]||(fieldCounts[fieldValue]=0),fieldCounts[fieldValue]++,fieldCounts[fieldValue]>1))return setInvalid($scope.models[0][field.key]==fieldValue?0:i,field.key),!1;if(field.validator&&!field.validator(fieldValue))return setInvalid(i,field.key),!1}return!0};$scope.addModel=function(){$scope.models.unshift(service[$scope.service.newModel]())},$scope.deleteModel=function(model){var modelIndex=$scope.models.indexOf(model);$scope.invalidFields.length&&$scope.invalidFields[modelIndex]&&$scope.invalidFields.splice(modelIndex,1),$scope.models.splice(modelIndex,1)},$scope.saveModels=function(){validateModels()&&($scope.saving=!0,service[$scope.service.updateAllAction]($scope.models,function(){$scope.saving=!1}))},$scope.fieldChanged=function(model,fieldName){$scope.invalidFields.length&&$scope.invalidFields[$scope.models.indexOf(model)]&&($scope.invalidFields[$scope.models.indexOf(model)][fieldName]=!1)},$scope.isInvalid=function(model,fieldName){return $scope.invalidFields.length&&$scope.invalidFields[$scope.models.indexOf(model)]?$scope.invalidFields[$scope.models.indexOf(model)][fieldName]:!1}}}}]),devflowApp.directive("inputDropdown",["$timeout",function($timeout){return{restrict:"E",scope:{items:"=",selectedItem:"=",displayProperty:"=",label:"="},templateUrl:"scripts/directives/input-dropdown/view.html",controller:function($scope){$scope.displayItems=[],$scope.inputFocused=!1,$scope.focusedIndex=-1;var setSelectedText=function(){$scope.selectedText=$scope.selectedItem[$scope.displayProperty]};$scope.selectedItem&&setSelectedText(),$scope.selectItem=function(item){$scope.selectedItem=item,setSelectedText(),$scope.displayItems=[],$scope.focusedIndex=-1},$scope.itemTextChanged=function(){if($scope.selectedItem=null,$scope.displayItems=[],$scope.focusedIndex=-1,$scope.selectedText&&""!=$scope.selectedText)for(i=0;i<$scope.items.length;i++)$scope.items[i][$scope.displayProperty].toLowerCase().indexOf($scope.selectedText.toLowerCase())>=0&&$scope.displayItems.push($scope.items[i])},$scope.inputBlur=function(){$timeout(function(){$scope.inputFocused=!1,$scope.focusedIndex=-1},100)},$scope.inputFocus=function(){$scope.inputFocused=!0},$scope.keyDown=function(keyEvent){$scope.displayItems.length>0&&$scope.selectedText.length>0&&$scope.inputFocused&&(40==keyEvent.keyCode&&$scope.focusedIndex<$scope.displayItems.length-1?$scope.focusedIndex++:38==keyEvent.keyCode&&$scope.focusedIndex>0?$scope.focusedIndex--:13==keyEvent.keyCode&&$scope.selectItem($scope.displayItems[$scope.focusedIndex]))},$scope.isFocused=function(item){return $scope.focusedIndex==$scope.displayItems.indexOf(item)}}}}]);