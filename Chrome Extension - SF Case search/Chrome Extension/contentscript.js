var blockSearch = false;

try {
    this.__sfdcSessionId = document.cookie.match(/(^|;\s*)sid=(.+?);/)[2];
} catch (e) {
    blockSearch = true;
}

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
loadScript("/soap/ajax/31.0/connection.js", function() {
    caseQuery();
});

var JSFile = "https://" + window.location.host + "/soap/ajax/31.0/connection.js";

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

var promptMessage = chrome.i18n.getMessage("errorMsg");
var whatCase = chrome.i18n.getMessage("whatCase");

function caseQuery() {
    if(blockSearch == false){
        var result = prompt(whatCase.trim());
        if(result.search(":ref") == -1) {
            var caseQuery = sforce.connection.query("SELECT Id FROM Case WHERE CaseNumber = '" + result + "'");
            caseId = caseQuery.getArray("records");
            if (result == null) {
                return false;
            } else if (caseQuery.size == 1) {
                window.location = URL = "https://" + window.location.host + "/" + caseId[0].Id;
            } else {
                alert("'" + result + "'" + promptMessage);
            }
        } else if(result.search(":ref") != -1) {
            var search = result.search("500");
            var queryId = result.substring(search);
            var finalQueryId = queryId.substring(0,10).split("C").join("C00000");
            var caseQuery = sforce.connection.query("SELECT Id FROM Case WHERE Id = '" + finalQueryId + "'");
            caseId = caseQuery.getArray("records");
            if (result == null) {
                return false;
            } else if (caseQuery.size == 1) {
                window.location = URL = "https://" + window.location.host + "/" + caseId[0].Id;
            } else {
                alert("'" + result + "'" + promptMessage);
            }
        }
    } else if(blockSearch == true){
        alert("You must log into Salesforce prior to running the case search.");
    }
};