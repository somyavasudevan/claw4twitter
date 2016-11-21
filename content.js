
//alert(document.getElementById("tweet-box-home-timeline").innerHTML);



console.log("in content");

window.addEventListener("load", initialize);


function initialize(){
var nameValue = $('#tweet-box-home-timeline > div')[0].innerHTML;
console.log(nameValue);

$(".TweetBoxToolbar-tweetButton").append('<button id = "button1" class="btn primary-btn tweet-action  tweet-btn js-tweet-btn" onclick = "click()" type="button" > S </button>');
document.getElementById("button1").addEventListener("click",handleClick);

}

function handleClick(){
	//alert("yo");
	console.log("yo");
	
}