function toggleState(){ 
	//toggle entire iframe visibility
	var hackbar = $('#hackbar');
	if($(hackbar.is(':hidden')))
	{
		var tweetBox = $("#tweet-box-home-timeline")[0].getBoundingClientRect();
		var width = tweetBox['width'];
		var inc = width*0.2;
		width += 2*inc;
		width = width.toString() + 'px';
		var top = tweetBox['bottom']*1.30; // place iframe a little below tweet inputarea
		top = top.toString() + 'px';
		var left = tweetBox['left']-inc; //align iframe left edge with tweet inputarea left edge
		left = left.toString() + 'px';
		hackbar.css({
			'top': top,
			'left': left, 
			'width': width
		});
	}
	hackbar.slideToggle(450);
}

function addTag(tag){
	$('#tweet-box-home-timeline > div')[0].innerHTML += ' ' + tag;
}

function sendToBackground(data){
	chrome.runtime.sendMessage(data);
}

function initOnLoad(){
	console.log('Page Loaded');
	var userHandle = $.find('div.account-group.js-mini-current-user')[0].getAttribute('data-screen-name');
	sendToBackground({'type':'user-handle-msg', 'handle':userHandle});
	// initialize components after page loads
	//create iframe
	var iframe = document.createElement("iframe");
	iframe.src = chrome.extension.getURL('/iframe/hackbar.html?view=hackbar');
	iframe.classList.add("hackbar");
	iframe.id = 'hackbar';
	//add iframe to Twitter page
	document.body.appendChild(iframe);

	//inject button to toggle overlay into Twitter page
	//var clawImgSrc = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTvBr985oxuesm0Ar2pwnvshcJIVt1G_XMxio1m5ya_B4WweI-bHA'; //
	//var clawImg = '<img src="'+clawImgSrc+'" alt="Cl@w" height="30" width="30">';
	$(".TweetBoxToolbar-tweetButton").append('<button id = "triggerButton" class="btn primary-btn tweet-action tweet-btn js-tweet-btn"  type="button" >Cl@W</button>');
	//add clickhandler for triggerButton
	document.getElementById('triggerButton').addEventListener('click', toggleState);

	//get current tweet inputarea text
	var nameValue = $('#tweet-box-home-timeline > div')[0].innerHTML;
	console.log(nameValue);

	//handle tweeet typing event
	$('#tweet-box-home-timeline').bind('keyup', function(event) {
		var nameValue = $('#tweet-box-home-timeline > div')[0].innerHTML;
		if(nameValue.length > 5){
			var currTime = + new Date();
 			console.log(nameValue);
 			var port = chrome.runtime.connect({name: "my-channel"});
 			console.log('Sending keyup event to BG');
			port.postMessage({tweet: nameValue, lastEvent: currTime});

			port.onMessage.addListener(function(msg) {

				if(msg.loadbutton == false)
					{}
//   			console.log("from background getting it back" + msg.data1);

			});
		}
	});

	//listen to messages from iframe
	window.addEventListener('message', function(event) {
		if (!event.data.type) return; //check if data has type param to identify if message is meant for current iframe
    	if(event.data.type=='iframe' && event.data.data=='close-hackbar')
    		toggleState();
    	else if(event.data.type=='insert-tag')
	    	addTag(event.data.data);
	}, false);

	var viewNewTweetsButton = '#timeline > div.stream-container.conversations-enabled > div.stream-item.js-new-items-bar-container.new-tweets-bar-visible > div';
	console.log($(viewNewTweetsButton));
	$(viewNewTweetsButton).click(function(){
		console.log('User wants new tweets');
	})

}

window.addEventListener("load", initOnLoad);

