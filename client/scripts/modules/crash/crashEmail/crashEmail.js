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
