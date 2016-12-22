var open = false; //keep track if panel is open
var currSenti = 'loading';
var classMapping = {
	'positive': 'fa-smile-o',
	'negative': 'fa-frown-o',
	'neutral': 'fa-meh-o',
	'loading': 'fa-spinner fa-pulse fa-fw'
}
//extend jquery for animation
$.fn.extend({
    animateCss: function (animationName) {
        var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
        this.addClass('animated ' + animationName).one(animationEnd, function() {
            $(this).removeClass('animated ' + animationName);
        });
    }
});

var sendToContent = function(msg){
	window.parent.postMessage({type:'iframe', data:msg}, '*');
};

var updateDough = function(charts){
    //update doughnut charts with first two entities of response
    var c1 = charts[0];
    $('#e1').text(c1.entity);
    dough1Data.datasets[0].data = [c1.neg, c1.pos, c1.neutral];
    $('#city1')[0].innerHTML = c1.cities;
    doughnutChart1.update();

    var c2 = charts[1];
    $('#e2').text(c2.entity);
    dough2Data.datasets[0].data = [c2.neg, c2.pos, c2.neutral];
    $('#city2')[0].innerHTML = c2.cities;
    doughnutChart2.update();
};

var updateSentiment = function(newSenti){
	console.log(newSenti)
	$('#sentiment').removeClass(classMapping[currSenti]).addClass(classMapping[newSenti]);
	currSenti = newSenti
}

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
        //close the panel
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

var doughLabels = ["Negative", "Positive", "Neutral"];
var doughBGColor = ["#FF6384", "#36A2EB", "#FFCE56"];
var doughHoverBGColor = ["#FF6384", "#36A2EB", "#FFCE56"];
var dough1Data = {
    labels: doughLabels,
    datasets: [
        {
            data: [300, 50, 100],
            backgroundColor: doughBGColor,
            hoverBackgroundColor: doughHoverBGColor
        }]
};

var dough2Data = {
    labels: doughLabels,
    datasets: [
        {
            data: [300, 50, 100],
            backgroundColor: doughBGColor,
            hoverBackgroundColor: doughHoverBGColor
        }]
};

var doughnutChart1 = new Chart($('#dough1,'), {
    type: 'doughnut',
    data: dough1Data,
    options: {}
});

var doughnutChart2 = new Chart($('#dough2,'), {
    type: 'doughnut',
    data: dough2Data,
    options: {}
});

//listen for messages from background
chrome.extension.onMessage.addListener(function(request, sender, sendResponse){
	console.log('Received msg from BG');
	console.log(request);
    if(request.type == 'hashtag-result')
    {
        taggle.removeAll();
        taggle.add(request.tags.split(','));
        updateSentiment(request.sentiment);
        console.log('Added tags');
    }
    else if(request.type=='sentiment-result')
    {
        updateDough(request.charts);
    }
    else if(request.type=='cities-result')
    {
        //TODO:update
        console.log(request);
    }
    else if (request.type == 'user-typing')
    {
        updateSentiment('loading');
    }
});


