chrome.runtime.onConnect.addListener(function(port) {
	if(port.name == "my-channel"){
		port.onMessage.addListener(function(msg) {
			$.ajax({
				type: "GET", 
				url: "http://jsonplaceholder.typicode.com/posts/1",
				success: function(data){
              	// do something with data
			 	//console.log(data);
			 	port.postMessage({data1: data});
			 }
			});
		});
	}
});

var sendToIframe = function (data){
	chrome.tabs.getSelected(null, function (tab){
		//console.log('BG sending to iframe', tab.id);
		chrome.tabs.sendMessage(tab.id, data);
	});
};


//listen from content script
chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		// console.log(sender.tab ?
		// 	"from a content script:" + sender.tab.url :
		// 	"from the extension");
		// console.log(request);
		sendToIframe(request);
	});

