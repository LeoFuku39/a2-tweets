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



	const activity_vis_spec = {
	  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
	  "description": "Number of tweets by activity type.",
	  "data": {
		"values": byCount.map(([activityType, values]) => ({
		  activityType,
		  count: values.count
		}))
	  },
	  "mark": "bar",
	  "encoding": {
		"x": {
		  "field": "activityType",
		  "type": "nominal",
		  "sort": "-y",
		  "title": "Activity type"
		},
		"y": {
		  "field": "count",
		  "type": "quantitative",
		  "title": "Number of tweets"
		}
	  }
	};

	const chartValues = completed
		.filter(tweet => top3.includes(tweet.activityType) && tweet.distance > 0)
		.map(tweet => ({
			activityType: tweet.activityType,
			distance: tweet.distance,
			weekday: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][tweet.time.getUTCDay()]
		}));
	const weekdaySort = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
	const distance_vis_spec = {
	  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
	  "description": "Distance by day of the week for the three most-tweeted activities.",
	  "data": { "values": chartValues },
	  "mark": "point",
	  "encoding": {
	    "x": { "field": "weekday", "type": "ordinal", "sort": weekdaySort, "title": "Day of week" },
	    "y": { "field": "distance", "type": "quantitative", "title": "Distance (mi)" },
	    "color": { "field": "activityType", "type": "nominal", "title": "Activity" }
	  }
	};
	const distance_vis_mean_spec = {
	  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
	  "description": "Mean distance by day of the week for the three most-tweeted activities.",
	  "data": { "values": chartValues },
	  "mark": "point",
	  "encoding": {
	    "x": { "field": "weekday", "type": "ordinal", "sort": weekdaySort, "title": "Day of week" },
	    "y": { "aggregate": "mean", "field": "distance", "type": "quantitative", "title": "Mean distance (mi)" },
	    "color": { "field": "activityType", "type": "nominal", "title": "Activity" }
	  }
	};

	vegaEmbed('#activityVis', activity_vis_spec, {actions:false});
	vegaEmbed('#distanceVis', distance_vis_spec, {actions:false});
	vegaEmbed('#distanceVisAggregated', distance_vis_mean_spec, {actions:false});

	const rawDiv = document.getElementById('distanceVis');
	const aggDiv = document.getElementById('distanceVisAggregated');
	const button = document.getElementById('aggregate');
	rawDiv.style.display = 'block';
	aggDiv.style.display = 'none';
	button.innerText = 'Show means';
	button.addEventListener('click', function() {
		const showingRaw = rawDiv.style.display !== 'none';
		rawDiv.style.display = showingRaw ? 'none' : 'block';
		aggDiv.style.display = showingRaw ? 'block' : 'none';
		button.innerText = showingRaw ? 'Show all activities' : 'Show means';
	});
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});