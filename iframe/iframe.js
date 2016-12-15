var taggle = new Taggle(document.getElementById('tags'));
taggle.add(['more', 'hash', 'tags', '#hashtags'])
//var closeButton = document.getElementById('closeButton');
var doc = $(this);	
$('#closeButton').click(function() {
	//toggle entire iframe visibility
	console.log('Inside closeButton toggle');
	chrome.runtime.sendMessage({param: "close-hackbar"});
});

$("#toggleButton").click(function(){
        $("#panel").slideToggle(450);
});

$("#panel").hide()