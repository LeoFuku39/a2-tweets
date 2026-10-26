function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	const writtenTweets = runkeeper_tweets
		.map((tweet, index) => ({
			tweet: new Tweet(tweet.text, tweet.created_at),
			number: index + 1
		}))
		.filter(({ tweet }) => tweet.written);
	addEventHandlerForSearch(writtenTweets);
}

function addEventHandlerForSearch(writtenTweets) {
	const textFilter = document.getElementById('textFilter');
	const searchCount = document.getElementById('searchCount');
	const searchText = document.getElementById('searchText');
	const tweetTable = document.getElementById('tweetTable');

	function updateResults() {
		const query = textFilter.value;
		const matches = writtenTweets.filter(({ tweet }) =>
			tweet.writtenText.toLowerCase().includes(query.toLowerCase())
		);

		searchText.textContent = query;
		searchCount.textContent = matches.length;
		tweetTable.replaceChildren();

		for (const { tweet, number } of matches) {
			const row = document.createElement('tr');
			const numberCell = document.createElement('td');
			const activityCell = document.createElement('td');
			const textCell = document.createElement('td');

			numberCell.textContent = number;
			activityCell.textContent = tweet.activityType;
			textCell.textContent = tweet.writtenText;
			row.append(numberCell, activityCell, textCell);
			tweetTable.append(row);
		}
	}

	textFilter.addEventListener('input', updateResults);
	updateResults();
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});