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
    caseQuery();
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

/* Create variable with messages called from the manifest.json script */
var promptMessage = chrome.i18n.getMessage("errorMsg");
var whatCase = chrome.i18n.getMessage("whatCase");
var result = prompt(whatCase.trim());

/* Start search function */
function caseQuery() {
    if (result == null){
        return false;
    } else {
        /* Make use of session ID RegEx, if the session ID is not found or valid then it skips to the else part of the IF statement */
        if(blockSearch == false){
            /* Searches the string that the user entered, if it contains a the string ":ref" is NOT found then it runs a query for case number in SF */
            if(result.search(":ref") == -1) {
                var caseQuery = sforce.connection.query("SELECT Id FROM Case WHERE CaseNumber = '" + result + "'");
                var caseId = caseQuery.getArray("records");
                /* If only one case is found, instantly go to the case */
                if (caseQuery.size == 1) {
                    window.location = URL = "https://" + window.location.host + "/" + caseId[0].Id;
                    /* If no cases are found then display error message to the user */
                } else {
                    alert("'" + result + "'" + promptMessage);
                }
            } else if(result.search(":ref") != -1) {
                var search = result.search("500");
                var queryId = result.substring(search);
                var finalQueryId = queryId.substring(0,10).split("C").join("C00000");
                var caseQuery = sforce.connection.query("SELECT Id, Subject FROM Case WHERE Id = '" + finalQueryId + "'");
                var caseId = caseQuery.getArray("records");
                if (caseQuery.size == 1) {
                    window.location = URL = "https://" + window.location.host + "/" + caseId[0].Id;
                } else if (caseQuery.size > 1) {
                    /* Create blank variable called num, in the case of the query returning multiple cases */
                    var num = "";
                    /* Run through all of the cases in a for loop and append a number to the beginning of the case along with subject (that has had the method substring() used on it for a max of 15 chars) of the case */
                    for(var i = 0; i < caseQuery.size; i++){
                        num +=  (i+1) + ") " + caseId[i].CaseNumber + " " + caseId[i].CaseNumber.substring(0,15) + "...\r\n";
                    };
                    /* Prompt the user to select the corresponding number to the the relevant case number and case subject on the search list, then open the case */
                    var idSelect = prompt("Please enter the corresponding Case number on the left, from the list below, if they have not been found then please try again:\r\n" + num + "\r\nMax of 10 loaded.");
                    var id = caseId[idSelect + 1].Id;
                    window.location = URL = "https://" + window.location.host + "/" + id;
                } else {
                    alert("'" + result + "'" + promptMessage);
                }
                /* If the session ID is not recognised or is not valid then throw error to the user */
            } else if(blockSearch == true){
                alert("You must log into Salesforce prior to running the case search.");
            }
        }
    }
}