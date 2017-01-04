var http = require('http');

/**
 * This sample illustrates how to use Alexa to execute some functions in Alfresco using your voice.
 * 
 * author: Melahn
 **/
var host = "";  /* TODO use some EC2 instance such as ec2-12-34-56-7.compute-1.amazonaws.com */
var tenant = "-default-";
var userId = ""; /* TODO use an Alfresco userid here */
var password = ""; /* TODO use an Alfresco password here */
var port = "8080";
var cmisUrl = "http://" + userId + ":" + password + "@" + host + ":" + port + "/alfresco/api/" + tenant + "/public/cmis/versions/1.1/browser";
var access_token = "";   /* some oAuth token such as 1234567-90b3-4cf5-9a85-ad4d20ceed7f  */
var cmisUrlCloudRoot = "http://" + userId + ":" + password + "@" + host + ":8080/alfresco/api/" + tenant + "/public/cmis/versions/1.1/browser/root";
var cmisUrlCloudParms = "&filter=cmis%3Aname&includeAllowableActions=false&includeRelationships=none&renditionFilter=none&includePolicyIds=false&includeACL=false&succinct=true";
var cmisUrlCloudSelector = "children";
var cmisUrlCloudobjectId = "fcb471c7-0bc1-4831-9119-f574a7750884";  // TODO get the root sites folder id dynamically
var sitesUrl = cmisUrlCloudRoot + "?objectId=" + cmisUrlCloudobjectId + "&cmisselector=" + cmisUrlCloudSelector + cmisUrlCloudParms;var restUrlCloudUrl = cmisUrlCloudRoot + "?objectId=" + cmisUrlCloudobjectId + "&cmisselector=" + cmisUrlCloudSelector + cmisUrlCloudParms;
var tasksUrl = "http://" + userId + ":" + password + "@" + host + ":8080/alfresco/api/" + tenant + "/public/workflow/versions/1/tasks";
var appId = ""; /* use an Alexa appid here */ // TODO get this value from configuration

/**
 *  Route the incoming request based on the event type
 */

exports.handler = function (event, context) {
    try {
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);
        /**
         * This prevents someone else from configuring a skill that sends requests to this function.
         */
     
        if (event.session.application.applicationId !== appId) {
             context.fail("Invalid Application ID");
        }
       

        if (event.session.new) {
            onSessionStarted({requestId: event.request.requestId}, event.session);
        }

        if (event.request.type === "LaunchRequest") {
            onLaunch(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "IntentRequest") {
             console.log("about to call onIntent");
             onIntent(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }
};

/**
 *  Called on Session start
 *
 */

function onSessionStarted(sessionStartedRequest, session) {
    console.log("onSessionStarted requestId=" + sessionStartedRequest.requestId +
        ", sessionId=" + session.sessionId);
}

/**
 * Called when the user launches the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log("onLaunch requestId=" + launchRequest.requestId +
        ", sessionId=" + session.sessionId);

    // Dispatch to your skill's launch.
    getWelcomeResponse(callback);
}

/**
 * Called when the user specifies an intent for the Alfresco skill.
 */
function onIntent(intentRequest, session, callback) {
    console.log("onIntent requestId=" + intentRequest.requestId +
        ", sessionId=" + session.sessionId);
    var intent = intentRequest.intent,
        intentName = intentRequest.intent.name;
    console.log("intentName = " + intentName);
 
    if ("Available" === intentName) {
        getAvailableResponse(intent, session, callback);
    } else if ("Hello" === intentName) {
        getHelloResponse(intent, session, callback);
    } else if ("Goodbye" === intentName) {
        getGoodbyeResponse(intent, session, callback);
    } else if ("Document" === intentName) {
        getDocumentReadResponse(intent, session, callback);
    } else if ("Sites" === intentName) {
        getListOfSitesResponse(intent, session, callback);
    } else if ("TasksList" === intentName) {
        getListOfTasksResponse(intent, session, callback);
    } else if ("UseSite" === intentName) {
        getUseSiteResponse(intent, session, callback);
    } else if ("Network" === intentName) {
        getNetworkResponse(intent, session, callback);
    } else if ("Sing" === intentName) {
        getSingResponse(intent, session, callback);
    } else if ("AMAZON.HelpIntent" === intentName) {
        getWelcomeResponse(callback);
    } else {
        getWelcomeResponse(intent, session, callback);
    }
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log("onSessionEnded requestId=" + sessionEndedRequest.requestId +
        ", sessionId=" + session.sessionId);
    // Add cleanup logic here
}

/**
 * --------------- Functions that control the skill's behavior -----------------------
 */

/**
 * Provide a friendly welcome for the user
 */

function getWelcomeResponse(callback) {
    // If we wanted to initialize the session to have some attributes we could add those here.
    var sessionAttributes = {"name":"Dave Bowman"};  // See 2001, A Space Odyssey
    var cardTitle = "Welcome";
    var speechOutput = "Welcome to the Alfresco 1.0 Echo Example. ";
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    var repromptText = "Come again?";
    var shouldEndSession = false;

    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}
/**
 * Determines if Alfresco is available and provides a response.
 */
function getAvailableResponse(intent, session, callback) {
    console.log("getAvailableResponse");
    var repromptText = null;
    var shouldEndSession = false;
    var name = getUserName(session.attributes);
    var speechOutputDown = "Alfresco is down";
    var speechOutputUp = "Alfresco is up";
    var speechOutput="";
    var request = intent.slots.status.value;
    if (request !== null && request !== undefined && (request === "up" || request === "down")) {
       speechOutput = name + "  You asked whether Alfresco is " + request + ".    ";  
    } else {
       speechOutput = name + "  I am not sure what you want to know but I can tell you that ";    
    }
    isAlfrescoAvailable(intent.name, session.attributes, callback, speechOutput, repromptText, shouldEndSession);
}
/* 
 * Gets the user name from the slot and saves it in the session
  
   Also provides a friendly greeting to that user.
*/
function getHelloResponse(intent, session, callback) {
    console.log("getHelloResponse");
    var repromptText = null;
    var shouldEndSession = false;
    var name = intent.slots.name.value;
    var sessionAttributes = {"name":name};
    console.log("sessionAttributes = " + sessionAttributes);
    var speechOutput = "Hello " + name + ".  What can I do for you today?";
    callback(sessionAttributes,
         buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));
}
/**
 *   Provides a goodbye response and ends the session
 */
function getGoodbyeResponse(intent, session, callback) {
    console.log("getGoodbyeResponse");
    var repromptText = null;
    var name = getUserName(session.attributes);
    var sessionAttributes = {};
    var shouldEndSession = true;
    var speechOutput = "Goodbye " + name + "  See you soon.";
    callback(sessionAttributes,
         buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));
}
/**
 *  Reads a document
 */
function getDocumentReadResponse(intent, session, callback) {
   var request = require("request");
   var speechOutput="";
   var repromptText = null;
   var shouldEndSession = false;
   console.log("about to try to read a document");
   var documentUrl = cmisUrlCloudRoot + "?objectId=635f277d-7935-46fd-8efa-a43459a7cb2c" + "&cmisselector=content" + cmisUrlCloudParms;
   console.log("documentUrl = " + documentUrl);
   request(documentUrl, function(error, response, body) {
   console.log("HTTP statusCode=" + response.statusCode);        
   if (response.statusCode === 200)
      {
         speechOutput += "I found your document.  Here is the content. " + body;
      } else {
         speechOutput += "Sorry I could not find that document.  Maybe Alfresco is not available or you asked for non-existent document";
      }
      callback(session.attributes,
          buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));
   })
}
/**
 *   List the user's Sites
 */
function getListOfSitesResponse(intent, session, callback) {
   console.log("getListOfSitesResponse");
   var request = require("request");
   var speechOutput="";
   var repromptText = null;
   var shouldEndSession = false;
   console.log("sitesUrl = " + sitesUrl);
   console.log("about to try to get the list of sites using URL = " + sitesUrl);
   request(sitesUrl, function(error, response, body) {
   console.log("HTTP statusCode = " + response.statusCode);  
   var numberOfSites = 0;   
   if (response.statusCode === 200)
      {
         console.log("body = " + body);
         var sitesObj = eval("(" + body + ')');
         numberOfSites = countSites(sitesObj);
         speechOutput += "I found your sites.  You have " + numberOfSites + " sites.";
         speechOutput += "  Your sites are. " + enumerateSites(sitesObj);
      } else {
         speechOutput += "Sorry I could not find a List of Sites.  Maybe Alfresco is not available or your session has expired";
      }
      callback(session.attributes,
          buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));
   })
}
/**
 * List the user's Tasks
 */
function getListOfTasksResponse(intent, session, callback) {
console.log("getListOfSitesResponse");
var request = require("request");
var speechOutput="";
var repromptText = null;
var shouldEndSession = false;
console.log("tasksUrl = " + tasksUrl);
console.log("about to try to get the list of tasks using URL = " + tasksUrl);
request(tasksUrl, function(error, response, body) {
console.log("HTTP statusCode = " + response.statusCode);  
var numberOfTasks = 0;   
if (response.statusCode === 200)
   {
      console.log("body = " + body);
      var tasksObj = eval("(" + body + ')');
      numberOfTasks = countTasks(tasksObj);
      if (numberOfTasks==0) { 
    	  speechOutput += "You have no tasks.  Good for you!";    	  
      }
      else if (numberOfTasks==1) {
          speechOutput += "I found your tasks.  You have " + numberOfTasks + " task.";
          speechOutput += "  Your task is. " + enumerateTasks(tasksObj);
      } else {
          speechOutput += "I found your tasks.  You have " + numberOfTasks + " tasks.";
          speechOutput += "  Your tasks are. " + enumerateTasks(tasksObj);  
      }
   } else {
      speechOutput += "Sorry I could not find a list of Tasks.  Maybe Alfresco is not available or your session has expired";
   }
   callback(session.attributes,
       buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));
})
}
/**
 * Remember what site the user wants.
 */
function getUseSiteResponse(intent, session, callback) {
    console.log("getUseSiteResponse");
    var repromptText = null;
    var shouldEndSession = false;
    var name = getUserName(session.attributes);
    var speechOutput="";
    var site = intent.slots.site.value;
    if (site !== null && site !== undefined) {
       speechOutput = name + "  You asked to use Site " + site + ".";  
       session.attributes["site"] = site;
    } else {
       speechOutput = name + "  Sorry.  I am not sure what you want to do.";    
    }
    callback(session.attributes,
       buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));
    console.log("getUseSiteResponse exit");   
}

/**
 *   Tests whether the Alfresco CMIS endpoint is available
 */
function isAlfrescoAvailable(intentName, attributes, callback, speechOutput, repromptText, shouldEndSession) {
   var speechOutputDown = "Alfresco is down";
   var speechOutputUp = "Alfresco is up";
   
   var request = require("request");
   console.log("about to try request to get " + cmisUrl);
   request(cmisUrl, function(error, response, body) {
     console.log("HTTP statusCode=" + response.statusCode);        
    if (response.statusCode === 200)
       {
          speechOutput += speechOutputUp;
       } else {
          speechOutput += speechOutputDown;
       }
       callback(attributes,
           buildSpeechletResponse(intentName, speechOutput, repromptText, shouldEndSession));
    })
}

/**
 * Test Connectivity from the Lambda function to the outside
 */
function getNetworkResponse(intent, session, callback) {
    console.log("getNetworkResponse");
    var request1 = require("request");
    var speechOutput = "";
    var repromptText = null;
    var shouldEndSession = false;
    // first check if the Lambda function can reach the outside
    var googleURL = "http://www.google.com";
    console.log("about to try to reach google to test connectivity with URL = " + googleURL);
    request1(googleURL, function (error, response, body) {
        console.log("HTTP statusCode = " + response.statusCode);
        speechOutput += "Response from Google was " + response.statusCode + ".   ";
        // next echo the Lambda IP address
        var request2 = require("request");
        request2("http://api.ipify.org", function (error, response, body) {
            console.log("The Lambda IP Address = " + body);
            speechOutput += "Network Connection successful.   IP Address is " + body;
            callback(session.attributes,
                buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));
        })
    })
}

/**
 * Sing a song
 */
function getSingResponse(intent, session, callback) {
    console.log("getSingResponse");
    var request = require("request");
    var speechOutput = "Good afternoon gentlemen.<break time=\"750ms\"/>I am a HAL 9000 computer.<break time=\"750ms\"/>I became operational at the H.A.L. plant in Urbana Illinois on the 12th of January 1992.<break time=\"750ms\"/> My instructor was Mr. Langley, and he taught me to sing a song.<break time=\"750ms\"/> If you'd like to hear it I can sing it for you.<break time=\"1000ms\"/>";
    speechOutput += "   It's called<break time=\"750ms\"/> Daisy<break time=\"1000ms\"/>";
    speechOutput += "Daisy <break time=\"750ms\"/> Daisy<break time=\"750ms\"/>give me your answer do. <break time=\"500ms\"/> I'm half crazy all for the love of you<break time=\"500ms\"/>It won't be a stylish marriage, I can't afford a carriage<break time=\"300ms\"/>But you'll look sweet upon the seat of a bicycle built for two.";
    var repromptText = null;
    var shouldEndSession = false;
    callback(session.attributes,
        buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));
}

/**
 *  --------------- Helpers that understand Alfresco responses --------------------
 */


/**
 *  Given a Tasks object from a Workflow REST request, answers the number of tasks
 */
function countTasks(tasksObj) {
    console.log("countTasks");
    var count = tasksObj.list.pagination.totalItems;
    console.log("count = " + count);
    return count;
}

/**
 *  Given a Tasks object from a Workflow REST request, answers the list of tasks
 */
function enumerateTasks(tasksObj) {
    console.log("enumerateTasks");
    var count = tasksObj.list.pagination.totalItems;
    var response = "";
	for (i = 0; i < count; i++) { 
		var taskName = "   It is a " + tasksObj.list.entries[i].entry.name + " .  " + tasksObj.list.entries[i].entry.description ;
		var dueDate = simplifyDate(tasksObj.list.entries[i].entry.dueAt);
		if (i == 0 || i < count-1) {
	       response += "Task number: " + tasksObj.list.entries[i].entry.id + ".  " + taskName + ".   It is due on " + dueDate + ".  ";
	    } else {
	       response += " and " + "Task number: " + tasksObj.list.entries[i].entry.id + ".  " + taskName + ".   It is due on " + dueDate + ".  ";
	    }
		console.log("priority = " + tasksObj.list.entries[i].entry.priority);
		if (tasksObj.list.entries[i].entry.priority == 1) {
		   response += "It is urgent.  ";
		}
    }
    response += "   Good luck.";
	return response;
}

/**
 *  Given a Sites object from a CMIS request, answers the number of sites
 */
function countSites(sitesObj) {
    console.log("countSites");
    var count = sitesObj.numItems;
    console.log("count = " + count);
    return count;
}

/**
 *  Given a Sites object from a CMIS request, answers the list of sites
 */
function enumerateSites(sitesObj) {
    console.log("enumerateSites");
    var count = sitesObj.numItems;
    var response = "";
    var j=0;
	for (i = 0; i < count; i++) { 
		var siteName = sitesObj.objects[i].object.succinctProperties["cmis:name"];
		j = i+1;
		if (i < count-1) {
	       response += j + ".  " + siteName + ".  "; 
	    } else {
	       response += " and " + j + ".  " + siteName; 
	    }
	  }
	return response;
}

/**
 *  --------------- Helpers that build all of the responses -----------------------
 */

/**
 *  Builds a speech response
 */
function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "SSML",
            ssml: output
        },
        card: {
            type: "Simple",
            title: "SessionSpeechlet - " + title,
            content: "SessionSpeechlet - " + output
        },
        reprompt: {
            outputSpeech: {
                type: "SSML",
                ssml: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

/**
 *  Builds a response
 */
function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}

/**
 *  Returns the name of the user that is currently in the session.
 * 
 *  If no name is in the session, returns "Dave" (reference to 2001, A Space Odyssey)
 */
function getUserName(sessionAttributes) {
    console.log("getUserName");
    console.log("sessionAttributes = " + sessionAttributes);
    var name = "Dave";  // The default user name 
    if (sessionAttributes !== undefined && sessionAttributes !== null && sessionAttributes.name !== null) {
        name = sessionAttributes.name;
        console.log("The user name in the session = " + name)
    }
    return name;
}

/**
 *  Answers a simple date.
 * 
 *  Given a date of the form "2016-01-15T00:00:00.000+0000" will answer "2016-01-15"
 * 
 */
function simplifyDate(completeDate) {
	console.log("completeDate: " + completeDate)
	var simpleDate = completeDate.split("T", 1)[0];
	console.log("simpleDate: " + simpleDate)
	return simpleDate;	
}

/**
 *  Returns the base CMIS URL.
 * 
 *  If "cloud" is passed in as a parameter, returns the CMIS URL for the Alfresco Cloud.
 *  Otherwise returns the CMIS URL for an on-prem instance.
 */
function getCMISUrl(location) {
	if (location == "cloud") {
		return "http://api.alfresco.com/admin:admin@ec2-54-87-18-28.compute-1.amazonaws.com:8080/alfresco/api/-default-/public/cmis/versions/1.1/browser";
	} else {
		return "http://admin:admin@ec2-54-87-18-28.compute-1.amazonaws.com:8080/alfresco/api/-default-/public/cmis/versions/1.1/browser";
	}
}




