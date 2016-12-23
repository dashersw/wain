var async = require('async');
var sources = require('./sources.json');
var request = require('request');
var FeedParser = require('feedparser')



function fetchArticlesFromSource(source, callback) {
    var req = request(source)
        , feedparser = new FeedParser();

    req.on('error', function (error) {
        // handle any request errors
        callback(error)
    });

    req.on('response', function (res) {
        var stream = this;

        if (res.statusCode != 200) {
            // handle any response errors
            callback("Bad Status Code");
        }
        else {
            var feed = stream.pipe(feedparser);
            callback(null, feed)
        }
    });

    feedparser.on('error', function (error) {
        // always handle errors
        callback("Bad Feed");
    });

    feedparser.on('readable', function () {
        // This is where the action is!
        var stream = this
            , meta = this.meta // **NOTE** the "meta" is always available in the context of the feedparser instance
            , item;

        while (item = stream.read()) {
            console.log(item)
        }
    });

}

async.each(sources, fetchArticlesFromSource, function (err, result) {
    if (err) {
        console.log('Failed ~ Reason => ', err);
    } else {
        console.log('Success', result);
    }
});