window.addEventListener("load", initialize);
function initialize(){
	var nameValue = $('#tweet-box-home-timeline > div')[0].innerHTML;
	console.log(nameValue);
	$(".TweetBoxToolbar-tweetButton").append('<button id = "triggerButton" class="btn primary-btn tweet-action tweet-btn js-tweet-btn"  type="button" > B-) </button>');
	document.getElementById("triggerButton").addEventListener("click",handleClick);
	$('#tweet-box-home-timeline').bind('keydown', function(event) {
		var nameValue = $('#tweet-box-home-timeline > div')[0].innerHTML;
		if(nameValue.length > 5){
 			console.log(nameValue);
 			var port = chrome.runtime.connect({name: "my-channel"});
			port.postMessage({myProperty: "value"});
			port.onMessage.addListener(function(msg) {
				console.log("inside content listener");
    			console.log(msg.data1);
			});
		}
	});
}

function handleClick(){
	console.log("yo");
}