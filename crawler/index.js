var async = require('async');
var sources = require('./sources.json');
var request = require('request');
var FeedParser = require('feedparser')


var sourceList = [];
Object.keys(sources).map(function (s) {
    sources[s].map(function (l) {
        sourceList.push(l)
    })
})


var feeds = [];
function fetchArticlesFromSource(source, callback) {
    var req = request(source)
        , feedparser = new FeedParser({
            normalize: true
        });

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
            feeds.push(stream.pipe(feedparser))
            callback(null)
        }
    });

}

async.each(sourceList, fetchArticlesFromSource, function (err) {
    if (err) {
        console.log('Failed ~ Reason => ', err);
    } else {
        console.log('Success',feeds.length);
    }
});
