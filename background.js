var endPointHashtag = 'http://clawenv.m3e3mwc9r8.us-west-2.elasticbeanstalk.com/flaskhw/hashtag';
var endPointSentiment = 'http://clawenv.m3e3mwc9r8.us-west-2.elasticbeanstalk.com/flaskhw/visualize';
var endPointMalicious = 'http://clawenv.m3e3mwc9r8.us-west-2.elasticbeanstalk.com/flaskhw/checkFake';
var endPointReport = 'http://clawenv.m3e3mwc9r8.us-west-2.elasticbeanstalk.com/flaskhw/updateWeights';

var userHandle = '';

var lastEvent = -1000;
var lastEventHandled = 0;
var tweet = '';
var sched = false;
var port1;

var injected = {};

chrome.webNavigation.onHistoryStateUpdated.addListener(function(details){
	//if navigated to a page that does not have the injection, peform the injection
	console.log('State pushed to '+details.url);
	if(injected[details.url] == null)
	{
		injected[details.url] = true; //dont run again on this page
		chrome.tabs.executeScript(null,{file:"inject.js"});
		
	}
	//else do nothing, as injected components are preserved in app state history
});
    

chrome.runtime.onConnect.addListener(function(port) {
	//receive timestamp of last keyup event from content
	port1 = port;
	if(port.name == "my-channel"){
		port.onMessage.addListener(function(msg) {
			console.log('Received new keyup from content');
			lastEvent = msg.lastEvent;
			tweet = msg.tweet;
			if(!sched){
				setTimeout(keyfunction,1000);
				sched = true;
				sendToContentScripts({type:"user-typing"});

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
		 	//port.postMessage({data1: data});
		 	sendToContentScripts(data);
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
		 	sendToContentScripts(resp);
	 }
	});
}

var sendToContentScripts = function (data){
	chrome.tabs.getSelected(null, function (tab){
		//console.log('BG sending to iframe', tab.id);
		chrome.tabs.sendMessage(tab.id, data);
	});
};


//listen from content scripts
chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if(request.type=='get-malicious') //from inject.js
		{
			console.log('Checking malicious tweets');
			//make API call to get IDs of malicious tweets
			$.ajax({
				type: "POST", 
				data: 'query='+request.ids,
				url: endPointMalicious,
				success: function(data){
					var resp = {type:'malicious-ids-result', ids:data};
				 	console.log(resp);
				 	sendToContentScripts(resp);
			 }
			});
		}

		else if(request.type == 'report-tweet')
		{
			console.log('Reporting tweet');
			//send user handle and ID of reported tweet to backend
			$.ajax({
				type: "POST", 
				data: JSON.stringify({'user':userHandle, 'tweet-id':request.tweetID}),
				url: endPointReport,
				success: function(data){
					console.log('Successfully reported tweet');
			 	}
			});
		}

		else if(request.type == 'user-handle-msg')
		{
			//receive user handle from content.js on page load
			//one time operation
			console.log('Hi @'+request.handle);
			userHandle = request.handle;
		}

		else if(request.type == 'fresh-load')
		{
			//on fresh load, the injected components are lost
			console.log('Resetting history variables');
			injected = {};
		}
	});

