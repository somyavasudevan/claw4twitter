
//alert(document.getElementById("tweet-box-home-timeline").innerHTML);

console.log("in content1");

window.addEventListener("load", initialize);


function initialize(){
var nameValue = $('#tweet-box-home-timeline > div')[0].innerHTML;
console.log(nameValue);

$(".TweetBoxToolbar-tweetButton").append('<button id = "triggerButton" class="btn primary-btn tweet-action tweet-btn js-tweet-btn" type="button" > B-) </button>');
}