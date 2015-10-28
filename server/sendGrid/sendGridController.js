/***

sendEmail() sends the email out via SendGrid API

using sendGrid templates:

// add filter settings one at a time 
email.addFilter('templates', 'enable', 1);
email.addFilter('templates', 'template_id', '09c6ab89-9157-4710-8ca4-db7927c631d6');
 
// or set a filter using an object literal. 
email.setFilters({
    'templates': {
        'settings': {
            'enable': 1,
            'template_id' : '09c6ab89-9157-4710-8ca4-db7927c631d6',
        }
    }
});

***/

var sendgrid  = require('sendgrid')('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');
//consruct default email values in a params object:
var params = {
  to: 'xclnt.trees@gmail.com',
  from: 'me@crashNinja',
  subject: 'accident' ,
  text: 'This is working too'
};
//create new email instance:
var email = new sendgrid.Email(params);
//set individual email properties
email.html = '<h1>CRASH NINJA!</h1>';

//************bug : addTo() doesn't send to the original to property in params
// email.addTo('cyrus.gomeza@gmail.com');
// email.addTo('jordanwink201@gmail.com');

//this would take care of the other emails in the crashObject:
//******bug : sends multiple emails via bcc****
 //  email.bcc = ['cyrus.gomeza@gmail.com',  '1276stella@gmail.com', 'jordanwink201@gmail.com',
 // 'royceleung@gmail.com'];

//call the setFilters method to pass template parameters:
  // email.setFilters({
  //   templates : {
  //     settings : {

  //     }
  //   }
  // });

module.exports = {

  sendEmail : function(){
    sendgrid.send(email, function(err, json) {
      if (err) { return console.error(err); }
      console.log('', json);
    });
  }

}