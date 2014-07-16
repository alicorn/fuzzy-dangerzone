chrome.browserAction.onClicked.addListener(function (tab) {
    if (tab.url.indexOf(".salesforce.com/") != -1) {
        chrome.tabs.executeScript(tab.id, {
            "file": "contentscript.js"
        }, function () {
            console.log("Script Executed .. ");
        });
    } else {
    	alert("Please navigate to a salesforce page prior to using this.");
    }
});