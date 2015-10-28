var express = require('express')
  , passport = require('passport')
  , util = require('util')
  , FacebookStrategy = require('passport-facebook').Strategy
  // , GoogleStrategy = require('passport-google').Strategy
  , session = require('express-session')
  , bodyParser = require("body-parser")
  , cookieParser = require("cookie-parser")
  , Q = require('q')
  , jwt = require('jwt-simple')
  , User = require('../user/userModel.js');

var FACEBOOK_APP_ID = '727643380674076';
var FACEBOOK_APP_SECRET = '82696b2b0432b1f59fbef854f6774854';

// var APP_ID = '119177148950-g88jtbakr8tflt6i8acqjfiseeq47e9h.apps.googleusercontent.com';
// var APP_SECRET = 'xH48HGx2NL8MaeioArlI0QQx';

module.exports = function(app) {


// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Facebook profile is serialized
//   and deserialized.

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});
// How do serializeUser and deserializeUser work?
// What is 'done'?

// Use the FacebookStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Facebook
//   profile), and invoke a callback with a user object.
passport.use(new FacebookStrategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: "http://localhost:3001/api/auth/facebook/callback",
    profileFields: ['id','name','picture.type(large)']
  },
  function(accessToken, refreshToken, profile, done) {
    var token;
    // asynchronous verification, for effect...
    process.nextTick(function () {
      
      // To keep the example simple, the user's Facebook profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Facebook account with a user record in your database,
      // and return that user instead.
      console.log('profile',profile);

      var fineOne = Q.nbind(User.findOne, User);
      var create = Q.nbind(User.create, User);
      
      User.findOne({'username' : profile.name.givenName})
        .then(function(user) {
          if(!user) {
            var newUser = {
              firstName : profile.name.givenName,
              lastName : profile.name.familyName,
              username : profile.name.givenName,
              password : profile.id
            };
            return create(newUser);
          } else {
            return user;
          }
        })
      .then(function(newUserCreated) {
        token = jwt.encode(newUserCreated, 'secret');
        return done(null, token);       
      })
      .catch(function(err) {
        console.log('error created the user...', err);
        res.status(404).send({error: err.message});
      })

    });
  }
));

  app.use(session({ secret: 'keyboard cat' }));
  // Initialize Passport!  Also use passport.session() middleware, to support
  // persistent login sessions (recommended).
  app.use(passport.initialize());
  app.use(passport.session());

  app.use(cookieParser());

  app.get('/facebook',
    passport.authenticate('facebook'),
    function(req, res){
      // The request will be redirected to Facebook for authentication, so this
      // function will not be called.
    });

  // GET /auth/facebook/callback
  //   Use passport.authenticate() as route middleware to authenticate the
  //   request.  If authentication fails, the user will be redirected back to the
  //   login page.  Otherwise, the primary route function function will be called,
  //   which, in this example, will redirect the user to the home page.
  // { failureRedirect: '/signin' }
  app.get('/facebook/callback', 
    passport.authenticate('facebook'),
    function(req, res) {
      console.log('I am a req.session', req.session);
      console.log('Cookies Before', req.cookies);
      res.cookie('token', req.session.passport.user);

      // res.json({token : req.session.passport.user});
      res.redirect('/#/createAccount');
    });


// passport.use(new GoogleStrategy({
//     returnURL: "http://localhost:3001/api/auth/facebook/callback",
//     realm: 'http://localhost:3001'
//   },
//   function(identifier, profile, done) {
//     // asynchronous verification, for effect...
//     console.log('AM I HERE');
//     process.nextTick(function () {
      
//       // To keep the example simple, the user's Facebook profile is returned to
//       // represent the logged-in user.  In a typical application, you would want
//       // to associate the Facebook account with a user record in your database,
//       // and return that user instead.
//       profile.identifier = identifier;
//       return done(null, profile);
//     });
//   }
// ));


//   app.use(session({ secret: 'keyboard cat' }));
//   // Initialize Passport!  Also use passport.session() middleware, to support
//   // persistent login sessions (recommended).
//   app.use(passport.initialize());
//   app.use(passport.session());

//   app.get('/facebook',
//     passport.authenticate('google'),
//     function(req, res){
//       // The request will be redirected to Facebook for authentication, so this
//       // function will not be called.
//     });

//   // GET /auth/facebook/callback
//   //   Use passport.authenticate() as route middleware to authenticate the
//   //   request.  If authentication fails, the user will be redirected back to the
//   //   login page.  Otherwise, the primary route function function will be called,
//   //   which, in this example, will redirect the user to the home page.
//   // { failureRedirect: '/signin' }
//   app.get('/facebook/callback', 
//     passport.authenticate('google'),
//     function(req, res) {
//     console.log('AM I HERE');
//       res.redirect('/');
//     });


}