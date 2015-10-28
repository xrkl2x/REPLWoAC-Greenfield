/***

  Node Middleware

***/

var Utils = require('./utility.js');
    bodyParser = require('body-parser'); // for parsing the req body

module.exports = function(app, express){

  // Define Routers
  var userRouter = express.Router();
  var userActionRouter = express.Router();
  var eventRouter = express.Router();
  var s3Router = express.Router();
  var sendGridRouter = express.Router();
  var authRouter = express.Router();


  // Define Middleware
  app.use(bodyParser.json({ limit : '50mb' }));
  app.use(bodyParser.urlencoded({ extended : true , limit : '50mb' }));
  app.use(express.static(__dirname + '/../../client'));

  // Define URL's

// var allowCrossDomain = function(req, res, next) {
//     res.header('Access-Control-Allow-Origin', '*');
//     res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
//     res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, Access-Control-Allow-Origin');
//     res.header("Access-Control-Max-Age", "86400"); // 24 hours

//     // intercept OPTIONS method
//     if ('OPTIONS' == req.method) {
//         res.send(200);
//     }
//     else {
//         next();
//     }
// };

//    app.use(allowCrossDomain);


  app.use('/api/auth', authRouter); // auth Router

  app.use('/api/s3', s3Router); // use the userRouter for all user requests, note 
  app.use('/api/sendGrid', sendGridRouter); // use the sendGridRouter for all user emails
  app.use('/api/user', userRouter); // use the userRouter for all user requests, note the '/api/user'
  
  app.use('/api/userAction', Utils.decode); // decode user token before proceeding any 
  app.use('/api/userAction', userActionRouter); // use the userRouter for all user requests, note the '/api/user'

  app.use('/api/event', Utils.decode); // decode user token before proceeding any further
  app.use('/api/event', eventRouter); // use the eventRouter for all crash event requests, note the '/api/event'

  // Pass the userRouter to the function in userRouters
  require('../auth/authRoute.js')(authRouter);
  require('../s3/s3Route.js')(s3Router);
  require('../user/userRoute.js')(userRouter);
  require('../userAction/userActionRoute.js')(userActionRouter);
  require('../event/eventRoute.js')(eventRouter);
  require('../sendGrid/sendGridRoute.js')(sendGridRouter);
};
