var endPointHashtag = 'http://clawenv.m3e3mwc9r8.us-west-2.elasticbeanstalk.com/flaskhw/hashtag';
var endPointSentiment = 'http://clawenv.m3e3mwc9r8.us-west-2.elasticbeanstalk.com/flaskhw/visualize';
chrome.runtime.onConnect.addListener(function(port) {
	if(port.name == "my-channel"){
		port.onMessage.addListener(function(msg) {
			//POST req to get hastags
			$.ajax({
				type: "POST", 
				data: "query="+msg.tweet,
				url: endPointHashtag,
				success: function(data){
	              	// do something with data
	              	data.type = 'hashtag-result';
				 	console.log(data);
				 	//port.postMessage({data1: data});
				 	sendToIframe(data);
			 }
			});

			//POST req to get past sentiment
			$.ajax({
				type: "POST", 
				data: "query="+msg.tweet,
				url: endPointSentiment,
				success: function(data){
					var resp = {type:'sentiment-result',charts:data};
				 	console.log(resp);
				 	//port.postMessage({data1: data});
				 	sendToIframe(resp);
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

