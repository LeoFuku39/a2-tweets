function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});
	
	//This line modifies the DOM, searching for the tag with the numberTweets ID and updating the text.
	//It works correctly, your task is to update the text of the other tags in the HTML file!
	document.getElementById('numberTweets').innerText = tweet_array.length;	

	const times = tweet_array.map(tweet => tweet.time.gettime());
	const earliest = new Date(Math.min(...times));
	const latest = new Date(Math.max(...times));

	const timeOptions = {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	};

	document.getElementById('firstDate').innerText = earliest.toLocaleDateString('en-US', timeOptions);
	document.getElementById('lastDate').innerText = latest.toLocaleDateString('en-US', timeOptions);

	const total = tweet_array.length;
	const counts = type => tweet_array.filter(tweet => tweet.source === type).length;

	const categories = {
		completed_event: ['completedEvents', 'completedEventsPct'],
		live_event: ['liveEvents', 'liveEventsPct'],
		achievement: ['achievements', 'achievementsPct'],
		miscellaneous: ['miscellaneous', 'miscellaneousPct']
	};

	for(const [type, [countId, pctId]] of Object.entries(categories)) {
		const count = counts(type);
		document.getElementById(countId).innerText = count;
		document.getElementById(pctId).innerText = Math.format((count / total) * 100, {notation: 'fixed', precision: 2}) + '%';
	}
	

}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});