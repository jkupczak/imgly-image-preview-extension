// Refreshes the current tab.
// Implemented specifically to compliment the .reload function below.
// When I click the Korra icon the extension reloads. After its done reloading this code runs and refreshes my active tab.
// This was added to make development of the extension quicker.
// Instead of opening the Extensions settings tab I can reload the extension without ever leaving the page I'm looking at.

chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {

  chrome.tabs.reload(tabs[0].id);

});



// Handle clicks on the icon.
chrome.browserAction.onClicked.addListener(function(tab) {

  chrome.runtime.reload();

});
