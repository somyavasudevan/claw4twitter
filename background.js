var endPointHashtag = 'http://clawenv.m3e3mwc9r8.us-west-2.elasticbeanstalk.com/flaskhw/hashtag';
var endPointSentiment = 'http://clawenv.m3e3mwc9r8.us-west-2.elasticbeanstalk.com/flaskhw/visualize';
var lastEvent = -1000;
var lastEventHandled = 0;
var tweet = '';
//var loadbutton = false;
var sched = false;
var port1;
chrome.runtime.onConnect.addListener(function(port) {
	//receive timestamp of last keyup event from content
	port1 = port;
	if(port.name == "my-channel"){
		port.onMessage.addListener(function(msg) {
			console.log('Received new keyup from content');
			lastEvent = msg.lastEvent;
			tweet = msg.tweet;
		//	loadingbutton = true;
			if(!sched){
				setTimeout(keyfunction,1000);
				sched = true;
				sendToIframe({type:"user-typing"});

			}

		});
	}
});


function keyfunction() {
	var currTime = + new Date();
	console.log(currTime,lastEvent);
	if(currTime-lastEvent>=1000)
	{	
		console.log('Calling API');
		callAPI();
		lastEventHandled = lastEvent;
	}

	if (lastEventHandled!=lastEvent) {
		setTimeout(keyfunction,1000);		
	}

	else
		sched = false;
}


var callAPI = function(msg){
	//POST req to get hastags
	$.ajax({
		type: "POST", 
		data: "query="+tweet,
		url: endPointHashtag,
		success: function(data){
          	// do something with data
          	data.type = 'hashtag-result';
		 	console.log(data);
//		 	port1.postMessage({loadbutton: loadbutton});
		 	sendToIframe(data);
//		 	loadbutton = false;
		 	// back to content 
	 }
	});

	//POST req to get past sentiment
	$.ajax({
		type: "POST", 
		data: "query="+tweet,
		url: endPointSentiment,
		success: function(data){
			var resp = {type:'sentiment-result',charts:data};
		 	console.log(resp);
		 	//port.postMessage({data1: data});
		 	sendToIframe(resp);
	 }
	});
}

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

