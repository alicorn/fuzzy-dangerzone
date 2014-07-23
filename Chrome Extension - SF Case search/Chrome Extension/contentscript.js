this.__sfdcSessionId = document.cookie.match(/(^|;\s*)sid=(.+?);/)[2];

function loadScript(url, callback) {
    var head = document.getElementsByTagName("head")[0];
    var script = document.createElement("script");
    script.src = url;
    var done = false;
    script.onload = script.onreadystatechange = function () {
        if (!done && (!this.readyState || this.readyState == "loaded" || this.readyState == "complete")) {
            done = true;
            callback();
            script.onload = script.onreadystatechange = null;
            head.removeChild(script);
        }
    };
    head.appendChild(script);
}
loadScript("/soap/ajax/29.0/connection.js", function () {
    caseQuery();
});

var JSFile = "https://" + window.location.host + "/soap/ajax/29.0/connection.js";

var req = (window.XMLHttpRequest)?new XMLHttpRequest():new ActiveXObject("Microsoft.XMLHTTP");
if(req == null) {
    console.log("Error: XMLHttpRequest failed to initiate.");
}
req.onload = function() {
    try {
        eval(req.responseText);
        console.log("There was no error in the script file.");
    } catch(e) {
        console.log("There was an error in the script file.");
    }
}
try {
    req.open("GET", JSFile, true);
    req.send(null);
    console.log("test");
} catch(e) {
    console.log("Error retrieving data httpReq. Some browsers only accept cross-domain request with HTTP.");
}

var promptMessage = chrome.i18n.getMessage("errorMsg");
var whatCase = chrome.i18n.getMessage("whatCase");

function caseQuery() {
    var result = prompt(whatCase);
    var caseQuery = sforce.connection.query("SELECT Id FROM Case WHERE CaseNumber = '" + result + "'");
    caseId = caseQuery.getArray("records");
    if (result == null) {
        return false;
    } else if (caseQuery.size == 1) {
        window.location = URL = "https://" + window.location.host + "/" + caseId[0].Id;
    } else {
        alert("'" + result + "'" + promptMessage);
    }
};
