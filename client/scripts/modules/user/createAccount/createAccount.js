angular.module('crash.createAccount', [])

.controller('CreateAccountController', function(UserService, $window, $location){

  var self = this;
  self.user = {};
  self.errorMessage = '';
  var flag = false;

  /***
    get the username from window.localStorage
  ***/
  self.getUser = function(){

    UserService.getAccountByUsername('Jia')
      .then(function(user){
        console.log('user : ', user);
        self.user = user;
        if(user) {
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
