function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}
	
	tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});

	function setText(name, value) {
		document.querySelectorAll('#' + name + ', .' + name).forEach(el => el.innerText = value);
	}

	const completed = tweet_array.filter(t =>
		t.source === 'completed_event' &&
		t.activityType !== 'other' &&
		t.activityType !== 'unknown'
	);

	const stats = {};
	completed.forEach(t => {
		const type = t.activityType;
		if (!stats[type]) stats[type] = { count: 0, total: 0 };
		stats[type].count++;
		stats[type].total += t.distance;
	});


	const byCount = Object.entries(stats).sort((a, b) => b[1].count - a[1].count);
	setText('numberActivities', byCount.length);
	setText('firstMost', byCount[0][0]);
	setText('secondMost', byCount[1][0]);
	setText('thirdMost', byCount[2][0]);


	const top3 = byCount.slice(0, 3).map(([type]) => type);
	const byAvg = top3
		.map(type => [type, stats[type].total / stats[type].count])
		.sort((a, b) => b[1] - a[1]);
	const longestType = byAvg[0][0];
	setText('longestActivityType', longestType);
	setText('shortestActivityType', byAvg[byAvg.length - 1][0]);


	const avg = list => list.length ? list.reduce((sum, t) => sum + t.distance, 0) / list.length : 0;
	const ofLongest = completed.filter(t => t.activityType === longestType);
	const weekend = ofLongest.filter(t => t.time.getDay() === 0 || t.time.getDay() === 6);
	const weekday = ofLongest.filter(t => t.time.getDay() >= 1 && t.time.getDay() <= 5);
	setText('weekdayOrWeekendLonger', avg(weekend) > avg(weekday) ? 'weekends' : 'weekdays');
	//TODO: create a new array or manipulate tweet_array to create a graph of the number of tweets containing each type of activity.

	activity_vis_spec = {
	  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
	  "description": "A graph of the number of Tweets containing each type of activity.",
	  "data": {
	    "values": tweet_array
	  }
	  //TODO: Add mark and encoding
	};
	vegaEmbed('#activityVis', activity_vis_spec, {actions:false});

	//TODO: create the visualizations which group the three most-tweeted activities by the day of the week.
	//Use those visualizations to answer the questions about which activities tended to be longest and when.
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});