var iframe = document.createElement("iframe");
iframe.src = chrome.extension.getURL('iframe/hackbar.html');
iframe.classList.add("hackbar");
iframe.id = 'hackbar';
document.body.appendChild(iframe);

function toggleState(){
	var hackbar = $('#hackbar');

	if($(hackbar.is(':hidden')))
	{
		var tweetBox = $("#tweet-box-home-timeline")[0].getBoundingClientRect();
		var top = tweetBox['bottom']*1.40; // place iframe a little below tweetBox
		top = top.toString() + 'px';
		var left = tweetBox['left'];
		left = left.toString() + 'px';
		var width = tweetBox['width'].toString() + 'px';

		hackbar.css({
			'top': top,
			'left': left, 
			'width': width
		});
	}

	hackbar.slideToggle(450);
}

function initialize(){
	document.getElementById('triggerButton').addEventListener('click', toggleState);
}

window.addEventListener("load", initialize);
