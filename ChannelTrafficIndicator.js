
var maxWidth = 201;
var maxHeight = 20;
var theDot = '-webkit-radial-gradient(center, ellipse, rgba(255, 0, 0, 1) 40%,transparent 41%,transparent 100%)';


var timeInSeconds;
var twoHundredMinutesAgo;
var timeInMinutes;

var channelListLoaded = false;
var channelList;


var observer = new WebKitMutationObserver   (function(mutations) {
	if(!channelListLoaded)
	{
		loadChannelList();
	}
	
	checkTraffic();
});



observer.observe(document.getElementById("channel-list"), {childList: true,subtree : true});
window.setInterval(checkTraffic, 60000);




function loadChannelList(){

	channelList = [];
	
	$.getJSON(
		'https://slack.com/api/channels.list?token=xoxp-2151799067-2151799647-2212805923-0dbbdb',
		function(data){
			data.channels.forEach(function(channel){
				if(channel.is_member){
					channelList.push(channel.id);
				}
			});
			channelListLoaded = true;
		}
	)
}

function checkTraffic(){

	if(!channelListLoaded) {
		window.setTimeout(checkTraffic, 5000);
		return;
	}

	timeInSeconds = Math.round(new Date().getTime()/1000);
	twoHundredMinutesAgo = timeInSeconds - (60 * 200);
	timeInMinutes = (timeInSeconds - (timeInSeconds % 60)) / 60;

	console.log("Plotting traffic");

	channelList.forEach(function(channel){
		var channelNameElement = document.getElementsByClassName("channel_" + channel)[0];

		
		$.getJSON(
			"https://slack.com/api/channels.history?token=xoxp-2151799067-2151799647-2212805923-0dbbdb&channel=" + channel + "&oldest=" + twoHundredMinutesAgo,
			function(data){
				plotTraffic(channelNameElement, makeHistogram(data));
			}
		);
	});
	

}

function makeHistogram(data){

	var histogram = newFilledArray(200, 0);

	data.messages.forEach(function(message){
		var whenMessageWasPostedInSeconds = Math.floor(message.ts);
		var whenMessageWasPostedInMinutes = (whenMessageWasPostedInSeconds - (whenMessageWasPostedInSeconds % 60)) / 60;
		var numOfMinutesAgoMessageWasPosted = timeInMinutes - whenMessageWasPostedInMinutes;
		histogram[numOfMinutesAgoMessageWasPosted]++;
	})

	return histogram;
}

function plotTraffic(element, data){

	// Horrible, horrible css hack.  Avert your eyes!
	var theStyle = 'background: ';
	var xPos = maxWidth;

	var numberOfDots = data.sum();
	
	if(numberOfDots <= 0) return;

	theStyle += theDot;
	for(var i=1; i < numberOfDots-1; i++)
		theStyle += ',' + theDot;

	theStyle += '; background-position: ';
	
	data.forEach(function(messagesInAMinute){
		xPos--;
		yPos = maxHeight;
		if(messagesInAMinute == 0) return;

		while(yPos > 0 && messagesInAMinute-- > 0){
			theStyle += xPos + 'px ' + yPos-- + 'px, ';
		}

	});

	theStyle += '0px 0px; background-size:5px 5px; background-repeat: no-repeat; ';

	element.style.cssText = theStyle;
}

Array.prototype.sum = function() {
  return this.reduce(function(a,b){return a+b;});
}

function newFilledArray(len, val) {
    var rv = new Array(len);
    while (--len >= 0) {
        rv[len] = val;
    }
    return rv;
}