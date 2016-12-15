//extend jquery for animation
var open = false;
$.fn.extend({
    animateCss: function (animationName) {
        var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
        this.addClass('animated ' + animationName).one(animationEnd, function() {
            $(this).removeClass('animated ' + animationName);
        });
    }
});
var sendToContent = function(msg)
{
	window.parent.postMessage({type:'iframe', data:msg}, '*');
};

var taggle = new Taggle(document.getElementById('tags'));
taggle.add(['#more', '#hash', '#tags', '#hashtags'])

$('#closeButton').click(function() {
	//toggle entire iframe visibility
	$(this).animateCss('animated pulse');
	sendToContent('close-hackbar');
});

$("#toggleButton").click(function(){
	$(this).animateCss('animated pulse');
	if(open)
	{
		$(this).removeClass('fa-toggle-on');
		$(this).addClass('fa-toggle-off');
		open=false;
	}
	else
	{
		$(this).removeClass('fa-toggle-off');
		$(this).addClass('fa-toggle-on');
		open=true;
	}
	$("#panel").slideToggle(450);
});

$("#claw").mouseover(function(){
	$(this).animateCss('animated tada');
});

$("#panel").hide()

var data = {
    labels: [
        "Negative",
        "Positive",
        "Neutral"
    ],
    datasets: [
        {
            data: [300, 50, 100],
            backgroundColor: [
                "#FF6384",
                "#36A2EB",
                "#FFCE56"
            ],
            hoverBackgroundColor: [
                "#FF6384",
                "#36A2EB",
                "#FFCE56"
            ]
        }]
};

var myDoughnutChart = new Chart($('#dough1,'), {
    type: 'doughnut',
    data: data,
    options: {}
});

var myDoughnutChart = new Chart($('#dough2,'), {
    type: 'doughnut',
    data: data,
    options: {}
});

//listen for messages from background
chrome.extension.onMessage.addListener(function(request, sender, sendResponse){
	console.log('Received message from background');
	console.log(request);
});


