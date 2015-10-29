angular.module('crash', [
  'crash.eventService',
  'crash.userService',
  'crash.S3',
  'crash.sendGrid',
  'crash.crashEventObj',
  'crash.profile',
  'crash.createAccount',
  'crash.signIn',
  'crash.history',
  'crash.crashWitness',
  'crash.crashPhoto',
  'crash.crashDriverSearch',
  'crash.crashDriverInfo',
  'crash.crashEmail',
  'crash.crashFinalInfo',
  'ngRoute',
  'ngCookies'
])
.config(function($routeProvider, $httpProvider) {
	$routeProvider
    .when('/', {
      templateUrl: 'scripts/modules/crash/crashWitness/crashWitness.html',
      controller: 'CrashWitnessController',
      controllerAs: 'crashWitnessCtrl',
      data : {
        authenticate : true  
      }
    })
    .when('/profile', {
      templateUrl: 'scripts/modules/user/profile/profile.html',
      controller: 'ProfileController',
      controllerAs : 'profileCtrl',
      data : {
        authenticate : true  
      }
    })
    .when('/signin', {
      templateUrl: 'scripts/modules/user/signin/signIn.html',
      controller: 'SignInController',
      controllerAs : 'signInCtrl',
      data : {
        authenticate : false  
      }
    })
    .when('/createAccount', {
      templateUrl: 'scripts/modules/user/createAccount/createAccount.html',
      controller: 'CreateAccountController',
      controllerAs : 'createAccountCtrl',
      data : {
        authenticate : false  
      }
    })
    .when('/history', {
      templateUrl: 'scripts/modules/history/history.html',
      controller: 'HistoryController',
      controllerAs : 'historyCtrl',
      data : {
        authenticate : true  
      }
    })
    .when('/crashPhoto', {
      templateUrl: 'scripts/modules/crash/crashPhoto/crashPhoto.html',
      controller: 'CrashPhotoController',
      controllerAs: 'crashPhotoCtrl',
      data : {
        authenticate : true  
      }
    })
    .when('/crashDriverSearch', {
      templateUrl: 'scripts/modules/crash/crashDriverSearch/crashDriverSearch.html',
      controller: 'CrashDriverSearchController',
      controllerAs: 'crashDriverSearchCtrl',
      data : {
        authenticate : true  
      }
    })
    .when('/crashDriverInfo', {
      templateUrl: 'scripts/modules/crash/crashDriverInfo/crashDriverInfo.html',
      controller: 'CrashDriverInfoController',
      controllerAs: 'crashDriverInfoCtrl',
      data : {
        authenticate : true  
      }
    })
    .when('/crashEmail', {
      templateUrl: 'scripts/modules/crash/crashEmail/crashEmail.html',
      controller: 'CrashEmailController',
      controllerAs: 'crashEmailCtrl',
      data : {
        authenticate : true  
      }
    })
    .when('/crashFinalInfo', {
      templateUrl: 'scripts/modules/crash/crashFinalInfo/crashFinalInfo.html',
      controller: 'CrashFinalInfoController',
      controllerAs: 'crashFinalInfoCtrl',
      data : {
        authenticate : true  
      }
    })
    // .when('/authFacebook', {
    //   templateUrl: 'scripts/modules/user/profile/profile.html',
    //   controller: 'ProfileController',
    //   controllerAs : 'profileCtrl',
    //   data : {
    //     authenticate : true  
    //   }
    // })
    .otherwise( {
      redirectTo: '/'
    });

  /***
    On every single call to the server, the httpProvider intercepts the call and attaches the current token to the header
  ***/
  $httpProvider.interceptors.push('AttachToken');

})

/***
  Attach the user's token to the header of the server call
***/
.factory('AttachToken', function($window){
  return {
    request : function(object){
      var jwt = $window.localStorage.getItem('com.crash');
      if (jwt) {
        object.headers['x-access-token'] = jwt; // store the token into the header
      }
      object.headers['Allow-Control-Allow-Origin'] = '*';
      return object;
    }
  };
})

/***
  Everytime the route changes, check if the url data.authenticate property is true, check if a session token exists, otherwise redirect the user back to the sign in page
***/
.run(function($rootScope, $location, UserService, $window, $cookies){

  $rootScope.$on('$routeChangeStart', function(evt, next, current){

    if(!!$cookies.get('token')) {
      $window.localStorage.setItem('com.crash', $cookies.get('token'));
    }

    if (next.$$route && next.data.authenticate && !UserService.isAuthorized()) {
      $location.path('/signin');
    }
  });

});





angular.module('crash.crashEventObj', [])

.service('CrashEventObj', function(){ 

  this.crashEvent = {};
  

});

angular.module('crash.eventService', [])

.factory('EventService', function($http){ 

  /***
    url = 'api/event/create' ($http send crash obj and user obj)
    return from server
      success or failure
  ***/
  var createCrashEvent = function(crashObj){
    return $http({
      method : 'POST',
      url : 'api/event/create',
      data : crashObj
    })
    .then(function(res){
      return res.data;
    });
  };

  /***
    url = 'api/event/read' ($http send current user object)
    return from server
      all crash events related to the current user
  ***/
  var readCrashEvent = function(username){
    return $http({
      method : 'GET',
      url : 'api/event/read'
    })
    .then(function(res){
      return res.data;
    });
  };

  return {  
    createCrashEvent : createCrashEvent,
    readCrashEvent : readCrashEvent
  };

});

angular.module('crash.S3', [])

.factory('S3Service', function($http){ 

  /***
    Upload Image to S3
    description 'scene' 
    the date/time is stored as the name with the description
  ***/
  var uploadImage = function(imageData, description){

    return $http({
      method : 'POST',
      url : 'api/s3/upload',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      data: $.param({imgName : description, imageData: imageData}),
    })
    .then(function(res){
      return res.data;
    });
  };

  return {  
    uploadImage : uploadImage
  };

});

angular.module('crash.sendGrid', [])

  .factory('SendGridService', function($http){
  
  /***
    Final Crash Object sent to SendGrid
  ***/
  
    var sendEmail = function(crashObj){

      console.log('in sendGrid service');

      return $http({
        method : 'POST',
        url : 'api/sendGrid/sendEmail',
        data : crashObj
      })
      .then(function(res){
        return res.data;
      });


    };

    return {

      sendEmail : sendEmail

    }




  });



angular.module('crash.userService', ['ngCookies'])

.factory('UserService', function($cookies, $http, $window, $location){ 

  /***
    url = 'api/user/signin' ($http send user obj) 
    return from server
      success or failure
  ***/
  var signin = function(userObj){
    return $http({
      method : 'POST',
      url : 'api/user/signin',
      data : userObj
    })
    .then(function(res){
      return res.data;
    });
  };

  /***
    url = 'api/user/create' ($http send user obj)
    return from server : 
      success or failure 
      (future : get the user object and store the user info into window.localStorage)
  ***/
  var createAccount = function(userObj){
    return $http({
      method : 'POST',
      url : 'api/user/create',
      data : userObj
    })
    .then(function(res){ 
      return res.data;
    });
  };

  /***
    url = 'api/user/read' ($http send user token)
    return from server
      success and response with the user object asked to retreive or failure if that user doesn't exist
  ***/
  var readAccount = function(){
    return $http({
      method : 'GET',
      url : 'api/userAction/read'
    })
    .then(function(res){
      return res.data;
    });
  };

  /***
    url = 'api/user/updateuser' ($http send user token)
    return from server : 
      success or failure 
  ***/
  var updateUserAccount = function(userObj){
    return $http({
      method : 'POST',
      url : 'api/user/updateuser',
      data : userObj
    })
    .then(function(res){
      return res.data;
    });
  };

  /***
    url = 'api/user/read' ($http send user name via params)
    return from server
      success and response with the user object asked to retreive or failure if that user doesn't exist
  ***/
  var getAccountByUsername = function(username){
    return $http({
      method : 'GET',
      url : 'api/user/read',
      params : {username : username}
    })
    .then(function(res){
      return res.data;
    });
  };

  /***
    return a boolean value if there is a token in the window local storage
  ***/
  var isAuthorized = function(){
    return !!$window.localStorage.getItem('com.crash');
  };

  /***
    clear all information in local storage and send the user to the signin page
  ***/
  var signout = function(){
    $window.localStorage.clear();
    $cookies.remove('token');
    $cookies.remove('username');
    $location.path('/signin');
  };

  return {
    signin : signin,
    createAccount : createAccount,
    updateUserAccount: updateUserAccount,
    readAccount : readAccount,
    signout : signout,
    isAuthorized : isAuthorized,
    getAccountByUsername : getAccountByUsername
  };

});

angular.module('crash.crashDriverInfo', [])

.controller('CrashDriverInfoController', function(CrashEventObj){

  // Things to think about... maybe there's more than one other drive info that you want to enter...
  // Maybe by you entering their info since they don't have an account, this actually creates one for them and sends them the info to signup and everything...
  
  var self = this;
  self.person = {};
  self.personMaster = {
    firstname : '',
    lastname : '',
    dob : '',
    phoneNumber : '',
    email : '',
    driverLicenseNum : '',
    insuranceCompany : '',
    policyNum : '',
    agentName : '',
    agentEmail : ''
  };

  /***
    save the crash user obj into the CrashEventObj.crashEvent object
  ***/
  self.save = function(){
    console.log('saving...');
    CrashEventObj.crashEvent.crashDriver = self.person;
    self.person = self.personMaster;
  };

});

angular.module('crash.crashDriverSearch', [])

.controller('CrashDriverSearchController', function(UserService, CrashEventObj) {
  
  var self = this;
  self.errorMessage = '';
  self.crashDriver = {};

  /***
    retreive the user's information by their username
    save the crash driver obj into the CrashEventObj.crashEvent object
    (Future: only be able to retreive non personal data of the other user)
  ***/
  self.getUser = function(){
    var inputUsername = self.username;
    UserService.getAccountByUsername(inputUsername)
      .then(function(user){
        self.crashDriver = user;
        CrashEventObj.crashEvent.crashDriver = self.crashDriver;
        console.log('crash event object : ', CrashEventObj.crashEvent);
      })
      .catch(function(err){
        console.log('user not received...', err.data);
        self.errorMessage = err.data.error;
      });
  };

});

angular.module('crash.crashEmail', [])

.controller('CrashEmailController', function(UserService, CrashEventObj) {
  
  // Possibly in the future connect to any insurance API's...

  var self = this;
  // self.person = {};
  var userEmailAddresses = [];

  self.insuranceAgentEmail = '';
  /***
    get the username from window.localStorage
  ***/
  // self.getUser = function(){
  //   UserService.readAccount()
  //     .then(function(user){
  //       console.log('user : ', user);
  //       self.person = user.data;
  //     })
  //     .catch(function(err){
  //       console.log('user not received...', err);
  //     });
  // };

/***
    
A note on UX: as it stands the save function ignores the last value in the form.  Make the save function smarter by checking the form for a value and making sure it is in the array before moving to the next view.

***/

  self.addEmail = function(){
    
    //on click store the value in the userEmailAddresses array
    userEmailAddresses.push(self.insuranceAgentEmail);

    //form value is cleared:
    self.insuranceAgentEmail = '';

  };

  self.save = function(){
    //adds the value as a property on the crash object:
    CrashEventObj.crashEvent.userEmailAddresses = userEmailAddresses;
    console.log(CrashEventObj.crashEvent.userEmailAddresses);

  }
  
});

angular.module('crash.crashFinalInfo', [])

.controller('CrashFinalInfoController', function(CrashEventObj, EventService, SendGridService){
  
  var self = this;

  self.finalCrashObj = {};

  self.witnessArr = [];
  self.crashDriver = {};

  /***
    load the crash obj that's been being built over the past screens, allow the user to change any details before sending the entire object to the database
  ***/
  self.loadCrashObj = function(){
    console.log('CrashEventObj: ', CrashEventObj);

    var crashObj = CrashEventObj.crashEvent;

    // Load witnesses information
    if (crashObj.witnessArr) {
      self.witnessArr = crashObj.witnessArr;
    }

    // Load crash driver's information
    if (crashObj) {
      self.crashDriver = crashObj.crashDriver;
    }

    self.finalCrashObj = crashObj;

  };

  /***
    save the final crash object into the database, which will be added to the driver's crash history

    this is also where the object is sent to the sendGrid factory...
  ***/
  
  self.save = function(){
    console.log('save final information...');

    console.log('final crash object : ', self.finalCrashObj);
//should send the final crashObj to the factory:
    

    EventService.createCrashEvent(self.finalCrashObj)
      .then(function(data){
        console.log('success data : ', data);
      })
      .catch(function(err){
        console.log('error saving crash object...', err);
      });

  };

  self.sendGridEmail = function(){
    SendGridService.sendEmail()
      .then(function(data){
        console.log('success : ', data);
      })
      .catch(function(err){
        console.log('error : ', err);
      });
  };

});

angular.module('crash.crashPhoto', [])

.controller('CrashPhotoController', function($scope, CrashEventObj, S3Service) {
  var self = this;
  self.eventImages = [];

  var streaming = false;
  var width = 320; // We will scale the photo width to this
  var height = 0;

  video = document.getElementById('video');
  canvas = document.getElementById('canvas');
  photo = document.getElementById('photo');

  /***
    Get the Media Stream
    Fetch and start the stream
  ***/
  navigator.getMedia = ( navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
  
  navigator.getMedia( { video: true, audio: false },
    function(stream) {
      if (navigator.mozGetUserMedia) {
        video.mozSrcObject = stream;
      } else {
        var vendorURL = window.URL || window.webkitURL;
        video.src = vendorURL.createObjectURL(stream);
      }
      video.play();
    },
    function(err) {
      console.log("An error occured! " + err);
    }
  );

  video.addEventListener('canplay', function(ev){
    if (!streaming) {
      height = video.videoHeight / (video.videoWidth/width);
      if (isNaN(height)) { height = width / (4/3);}

      video.setAttribute('width', width);
      video.setAttribute('height', height);
      canvas.setAttribute('width', width);
      canvas.setAttribute('height', height);
      streaming = true;
    }
  }, false);

  function takepicture() {
    var context = canvas.getContext('2d');
    if (width && height) {
      canvas.width = width;
      canvas.height = height;
      context.drawImage(video, 0, 0, width, height);

      var imageData = canvas.toDataURL('image/png');
      photo.setAttribute('src', imageData);
      /***
        Send the buffer to the server
        send the image description 'scene'
      ***/
      S3Service.uploadImage(imageData, 'scene')
        .then(function(imgUrl){
          self.eventImages.push(imgUrl);
        })
        .catch(function(err){
          console.log('error saving image...', err);
        });

    }
  }

  $scope.takePhoto = function(){
    takepicture();
  };

  /***
    save the images into the CrashEventObj.crashEvent object
  ***/
  self.save = function(){
    CrashEventObj.crashEvent.eventImages = self.eventImages;
    console.log('CrashEventObj.crashEvent.images : ', CrashEventObj.crashEvent.eventImages);
  };

});

angular.module('crash.crashWitness', [])

.controller('CrashWitnessController', function(CrashEventObj, SendGridService) {
  
  var self = this;
  self.witnessArr = [];
  self.person = {};
  self.personMaster = {
    firstname : '',
    lastname : '',
    phoneNumber : '',
    email : ''
  };

  /***
    store the person object into the witness array
    clear the input text fields after adding the person, so the user can easily add another witness
    angular.copy(self.master) clears ubinds the person object
  ***/
  self.addWitness = function(){
    console.log('add witness...');
    self.witnessArr.push(self.person);
    self.person = angular.copy(self.master);
  };

  /***
    save the witness array into the CrashEventObj.crashEvent object
  ***/
  self.save = function(){
    console.log('saving...');
    CrashEventObj.crashEvent.witnessArr = self.witnessArr;
  };

  self.sendGrid = function(){
    console.log('SEND GRID');
  };

});

angular.module('crash.history', [])

.controller('HistoryController', function(EventService){

  // user the event service to retreive crash events by the curret user name 
  var self = this;

  self.crashEvents = [];

  /***
    Retreive all crash events that are in the database associated to the current user
  ***/
  self.getCrashEvents = function(){
    EventService.readCrashEvent()
      .then(function(data){
        console.log('events : ', data);
        self.crashEvents = data;
      })
      .catch(function(err){
        console.log('ERror getting events...', err);
      });
  };

});

angular.module('crash.createAccount', ['ngCookies'])

.controller('CreateAccountController', function($cookies, UserService, $window, $location){

  var self = this;
  self.user = {};
  self.errorMessage = '';
  var flag = false;

  /***
    get the username from cookies
  ***/
  self.getUser = function(){

    UserService.getAccountByUsername($cookies.get('username'))
      .then(function(user){
        console.log('user : ', user);
        
        if(user) {
          self.user = user;
          flag = true;
        }
        console.log('self.user : ', self.user);
      })
      .catch(function(err){
        console.log('user not received...', err);
      });
  };


  /***
    send the new user to the server to be stored in the database
    get a session token back to be stored into window localStorage
  ***/
  self.createAccount = function(){
    console.log('create account for user : ', self.user);
    var promise;
    if(!flag) {
      promise = UserService.createAccount(self.user);
    } else {
      promise = UserService.updateUserAccount(self.user);
    }
      /***
        response will be an {token:token, user:user}
      ***/
    promise.then(function(data){
        console.log('created account, session :', data.token);

        $window.localStorage.setItem('com.crash', data.token);

        $location.path('/');
      })
      /***
        Tell the user the error, ex: username already exists, allow them to enter in a different username...
      ***/
      .catch(function(err){
        console.log('Error creating account...', err.data);
        self.errorMessage = err.data.error;
        self.user.username = '';
      });
  };

});

angular.module('crash.profile', [])

.controller('ProfileController', function(UserService, $window, $location){

  // Get the current user's information either from window.localStorage or using GET request

  // Be able to update the user's information (everything just be able to be updated except for their username, if they want to change their password then they'll be signed out and have to sign back in with their new password)

  var self = this;

  self.userObj = {};

  /***
    get the username from window.localStorage
  ***/
  self.getUser = function(){
    UserService.readAccount()
      .then(function(user){
        console.log('user : ', user);
        self.userObj = user.data;
      })
      .catch(function(err){
        console.log('user not received...', err);
      });
  };

  /***
    update the user's profile
  ***/
  self.updateUser = function() {
    UserService.updateUserAccount(self.userObj)
      /***
        response will be an {token:token, user:user}
      ***/
      .then(function(data){
        console.log('updated account, session :', data.token);

        $window.localStorage.setItem('com.crash', data.token);

        $location.path('/profile');
      })
      .catch(function(err){
        console.log('Error updating account...', err.data);
        self.errorMessage = err.data.error;
        self.user.username = '';
      });
  };
  
  /***
    sign the user out by destroying the window.localStorage token and info
  ***/
  self.signOut = function(){
    UserService.signout();
  };

});

angular.module('crash.signIn', ['ngCookies'])

.controller('SignInController', function($cookies, UserService, $window, $location){
  
  var self = this;
  self.errorMessage = '';
  self.user = {};

  /***
    Pass the user object to the signin function which holds the username and password
    Sign the User In and get a session back from the server
  ***/

  self.signIn = function(){
    console.log('sign user in...');
    UserService.signin(self.user)
      .then(function(data){
        console.log('token : ', data);
        $window.localStorage.setItem('com.crash', data.token);
        $location.path('/');
      })
      /***
        Tell the user the error, ex: the username or password provided didn't match the DB
        Reset the input so the user can enter the information again
      ***/
      .catch(function(err){
        console.log('Error signing in the user ...', err.data);
        self.errorMessage = err.data.error;
        self.user.username = '';
        self.user.password = '';
      });
  };

  // setInterval(function() {
  //  var token = $cookies.get('token');
  //  $window.localStorage.setItem('com.crash', token);
  //       $location.path('/profile');   
  //  console.log('Cookies Clinet', token);
  // }, 5000);
  // $window.localStorage.setItem('com.crash', token);
  // $location.path('/profile');

  self.signInFacebook = function() {
    UserService.signinFacebook()
      .then(function(data){
        console.log('data', data);
        $window.localStorage.setItem('com.crash', data.token);
        $location.path('/profile');
      })
      .catch(function(err){
        console.log('Error signing in the user ...', err.data);
        // self.errorMessage = err.data.error;
        // self.user.username = '';
        // self.user.password = '';
      });
  };
  
});
