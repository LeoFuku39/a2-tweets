class Tweet {
	private text:string;
	time:Date;

	constructor(tweet_text:string, tweet_time:string) {
        this.text = tweet_text;
		this.time = new Date(tweet_time);//, "ddd MMM D HH:mm:ss Z YYYY"
	}

	//returns either 'live_event', 'achievement', 'completed_event', or 'miscellaneous'
    get source():string {
        const t = this.text;
        if (t.startsWith('Just completed') || t.startsWith('Just posted')){
            return 'completed_event';
        }

        if (t.startsWith('Watch') || t.includes('Live')){
            return 'live_event';
        }

        if (t.startsWith('Achieved')){
            return 'achievement';
        }

        return 'miscellaneous';
    }

    //returns a boolean, whether the text includes any content written by the person tweeting.
    get written():boolean {
        return this.writtenText.length > 0;
    }

    get writtenText():string {
        const text = this.text
            .replace(/https?:\/\/\S+/g, '')     // tweet link
            .replace(/#runkeeper/gi, '')        // hashtag, any capitalization
            .trim();
        
            const separator = text.indexOf(' - ');
            if (separator === -1) {
                return "";
            }
            const writtenText = text.substring(separator + 3).trim();
            return writtenText;
    }

    get activityType():string {
        if (this.source != 'completed_event') {
            return "unknown";
        }
        //TODO: parse the activity type from the text of the tweet
        return "";
    }

    get distance():number {
        if(this.source != 'completed_event') {
            return 0;
        }
        //TODO: prase the distance from the text of the tweet
        return 0;
    }

    getHTMLTableRow(rowNumber:number):string {
        //TODO: return a table row which summarizes the tweet with a clickable link to the RunKeeper activity
        return "<tr></tr>";
    }
}