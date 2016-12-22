var idMapping = {}; //maps tweet id to element id.
console.log('In Inject Script');
setTimeout(injectMaliciousButton, 3000);

//listen for messages from background
chrome.extension.onMessage.addListener(function(request, sender, sendResponse){
	console.log('Inject.js received msg from BG');
	console.log(request);
    if(request.type == 'malicious-ids-result')
    {
        console.log('Malicious tweets marked');
        markMaliciousTweets(request.ids); //mark mal tweets in red color
    }
});

function markMaliciousTweets(idString)
{
	var ids = idString.split(',');
	var id;
	for(id in ids){
		$('#claw-tweet-id-'+idMapping[id]).css('color', 'red');
		$('#claw-report-id-'+idMapping[id]).find('button').css('color', 'red');
	}
}

function sendToBackground(data){
	chrome.runtime.sendMessage(data);
}

function reportTweet(event){
	// get tweeet associated with click event of malicious button
	console.log(event.srcElement);
	var clickID = $(event.srcElement).parent().parent().parent()
					.parent().parent().parent()[0].getAttribute('data-item-id');
	console.log(clickID);	
}

function injectMaliciousButton(){
	console.log('Injecting buttons');
	//inject malicious tweet indicator in every tweet
	var maliciousButton = '<button class="ProfileTweet-actionButton u-textUserColorHover" type="button">☹</button>';

	var tweets = $('#stream-items-id').find('li.stream-item');
	var i=0;
	var len = tweets.length;
	var ids = '';
	while(i<len)
	{
		//console.log(tweets[i].getAttribute('data-item-id'));
		id = tweets[i].getAttribute('data-item-id');
		idMapping[id] = i; // id of tweet maps to claw-id
		ids += id;
		if(i!=len-1)
			ids+=','

		tweets[i].setAttribute('id', 'claw-tweet-id-'+i.toString()); //insert claw id in element for easy access later
		$(tweets[i]).find('div.stream-item-footer').find('div.js-actions')
						.append('<div class="ProfileTweet-action">'+maliciousButton+'</div>').attr('id', 'claw-report-id-'+i.toString()).click(reportTweet);
		i++;
	}
	console.log(ids);
	//send tweet ids to backend to check which ones are malicious
	//this must happen through background.js
	sendToBackground({'type':'get-malicious', 'ids':ids});
}
