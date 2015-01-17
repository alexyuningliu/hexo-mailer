// Hello.
//
// This is JSHint, a tool that helps to detect errors and potential
// problems in your JavaScript code.
//
// To start, simply enter some JavaScript anywhere on this page. Your
// report will appear on the right side.
//
// Additionally, you can toggle specific options in the Configure
// menu.
var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill('Cl0v9Gnx9AdLB-PuLJJvEw');

var ejs = require('ejs');
var fs = require('fs');

var latestPosts = [];

function sendEmail(to_name, to_email, from_name, from_email, subject, message_html){
  var message = {
      "html": message_html,
      "subject": subject,
      "from_email": from_email,
      "from_name": from_name,
      "to": [{
              "email": to_email,
              "name": to_name
          }],
      "important": false,
      "track_opens": true,    
      "auto_html": false,
      "preserve_recipients": true,
      "merge": false,
      "tags": [
          "Fullstack_Hexomailer_Workshop"
      ]    
  };
  var async = false;
  var ip_pool = "Main Pool";
  mandrill_client.messages.send({"message": message, "async": async, "ip_pool": ip_pool}, function(result) {
      // console.log(message);
      // console.log(result);   
  }, function(e) {
      // Mandrill returns the error as an object with name and message keys
      console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
      // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
  });
}

function csvParse(csvFile) {
	var finalArray = [];
	var tempArrayFull = csvFile.split("\n");
	var headerArray = tempArrayFull[0].split(",");
	var tempArrayWithoutHeader = tempArrayFull.slice(1);
	
	function objectifyRow(rowArray) {
		var rowObject = {};
		for (var i = 0; i < rowArray.length; i++) {
			rowObject[(headerArray[i])] = rowArray[i];
		}
		return rowObject;
	}

	for (var i = 0; i < tempArrayWithoutHeader.length; i++) {
		var rowArray = tempArrayWithoutHeader[i].split(",");
		finalArray.push(objectifyRow(rowArray));
	}

	return finalArray;
}
 
var csvFile = fs.readFileSync("friend_list.csv","utf8");
var emailTemplate = fs.readFileSync("email_template.ejs", "utf8");

//Start FeedSub

var FeedSub = require('feedsub');
 
var blogContent = new FeedSub('http://alexyuningliu.github.io/atom.xml', {
        emitOnStart: true
});
 
blogContent.read(function(err, blogPosts) {
	blogPosts.forEach(function(post) {
	// CHECK IF POST IS 60 Days old or Less. If it is, put the post object in the array.
		publishDate = new Date(blogPosts[0].published);
		currentDate = new Date();
			if ((currentDate.getTime() - publishDate.getTime()) < (60 * 24 * 60 * 60 * 1000)) {
				latestPosts.push(post);
			}
  	});
	csvData = csvParse(csvFile);
	csvData.forEach(function(row) {
		var firstName = row["firstName"];
		var fullName = row["firstName"] + " " + row["lastName"];
		var emailAddress = row["emailAddress"];
		var monthsSinceContact = row["monthsSinceContact"];

		var copyTemplate = emailTemplate;
		var customizedTemplate = ejs.render(copyTemplate, 
				{
					latestPosts: latestPosts,
					firstName: firstName,
				  	monthsSinceContact: monthsSinceContact
				});
		sendEmail(fullName, emailAddress, "Alex Liu", "yuningalexliu@gmail.com", "An Announcement", customizedTemplate);
		});
});