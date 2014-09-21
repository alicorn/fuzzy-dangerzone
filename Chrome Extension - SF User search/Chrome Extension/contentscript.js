/* Create variable and set to false, used later to throw error if need be */
var blockSearch = false;

/* Check SF session cookie in try catch, change to true if session cookie is matched */
try {
    this.__sfdcSessionId = document.cookie.match(/(^|;\s*)sid=(.+?);/)[2];
} catch (e) {
    blockSearch = true;
}

/* Create a scriipt element in head of HTML and put /soap/ajax/31.0/connection.js in the src  */
var connectJsUrl = "/soap/ajax/31.0/connection.js";

function loadScript(url, callback) {
    var head = document.getElementsByTagName("head")[0];
    var script = document.createElement("script");
    script.src = url;
    var done = false;
    script.onload = script.onreadystatechange = function() {
        if (!done && (!this.readyState || this.readyState == "loaded" || this.readyState == "complete")) {
            done = true;
            callback();
            script.onload = script.onreadystatechange = null;
            head.removeChild(script);
        }
    };
    head.appendChild(script);
}

loadScript(connectJsUrl, function() {
    userQuery();
});

/* Check to see if the file have been appended correctly and works correctly */
var JSFile = "https://" + window.location.host + connectJsUrl;
var req = (window.XMLHttpRequest) ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
if (req == null) {
    console.log("Error: XMLHttpRequest failed to initiate.");
};
req.onload = function() {
    try {
        eval(req.responseText);
    } catch (e) {
        console.log("There was an error in the script file.");
    }
};
try {
    req.open("GET", JSFile, true);
    req.send(null);
} catch (e) {
    console.log("Error retrieving data httpReq. Some browsers only accept cross-domain request with HTTP.");
};

/* Create variable messages for the user to see */
var whatUser = /* chrome.i18n.getMessage("whatCase"); */ "Please enter a users name, email address or Id.";
var promptMessage = /* chrome.i18n.getMessage("errorMsg"); */ " was not a valid user's Name, Email Address or Id or it could not be found.\r\nPlease try again.";
var result = prompt(whatUser.trim());

/* Start search function */
function userQuery() {
    if(result == null) {
        return false;
    } else {
        /* Make use of session ID RegEx, if the session ID is not found or valid then it skips to the else part of the IF statement */
        if(blockSearch == false){
            /* Searches the string that the user entered, if it contains an @ symbol then it runs a query for the email and username in SF */
            if(result.indexOf("@") != -1) {
                var userQuery = sforce.connection.query("SELECT Id, FirstName, LastName FROM User WHERE Email LIKE '%" + result + "%' OR Username LIKE '%" + result + "%' LIMIT 10");
                /* Converts the query to an Array so it can be read easier by the JS */
                var userId = userQuery.getArray("records");
                    /* If the query only eturns one user, then automatically go to the users profile page */
                if (userQuery.size == 1) {
                    window.location = URL = "https://" + window.location.host + "/" + userId[0].Id + "?noredirect=1";
                } else  if (userQuery.size > 1) {
                    /* Create blank variable called num, in the case of the query returning multiple users */
                    var num = "";
                    /* Run through all of the users in a for loop and append a number to the beginning of the user */
                    for(var i = 0; i < userQuery.size; i++){
                        num +=  (i+1) + ") " + userId[i].FirstName + userId[i].LastName + "\r\n";
                    };
                    /* Prompt the user to select the corresponding number to the the relevant name on the search list, then open the users profile */
                    var idSelect = prompt("Please enter the User number from the list below, if they have not been foudn then please try again:\r\n" + num);
                    var id = userId[idSelect + 1].Id;
                    window.location = URL = "https://" + window.location.host + "/" + id + "?noredirect=1";
                } else {
                    /* If there is an error and no one if found, throw error alert message */
                    alert("'" + result + "'" + promptMessage);
                }
                /* If a user ID is entered, instanly open user profile */
            } else if(result.indexOf("005") != -1) {
                window.location = URL = "https://" + window.location.host + "/" + result + "?noredirect=1";
                /* If user enters something that is not recognised as an Email or ID then search for user name's */
            } else if(result != ""){
                var userQuery = sforce.connection.query("SELECT Id, Full_Name__c FROM User WHERE Full_Name__c LIKE '%" + result + "%' LIMIT 10");
                var userId = userQuery.getArray("records");
                /* If only one user is found, instantly go to the users profile */
                if (userQuery.size == 1) {
                    window.location = URL = "https://" + window.location.host + "/" + userId[0].Id + "?noredirect=1";
                } else  if (userQuery.size > 1) {
                    /* Create blank variable called num, in the case of the query returning multiple users */
                    var num = "";
                    /* Run through all of the users in a for loop and append a number to the beginning of the user */
                    for(var i = 0; i < userQuery.size; i++){
                        num +=  (i+1) + ") " + userId[i].Full_Name__c + "\r\n";
                    };
                    /* Prompt the user to select the corresponding number to the the relevant name on the search list, then open the users profile */
                    var idSelect = prompt("Please enter the User number from the list below, if they have not been found then please try again:\r\n" + num + "\r\nMax of 10 loaded.");
                    var id = userId[idSelect].Id;
                    window.location = URL = "https://" + window.location.host + "/" + id + "?noredirect=1";
                } else {
                    alert("'" + result + "'" + promptMessage);
                }
            } else {
                alert("'" + result + "'" + promptMessage);
            }
            /* If the session ID is not recognised or is not valid then throw error to the user */
        } else if(blockSearch == true){
            alert("You must log into Salesforce prior to running the User search.");
        }
    }
}