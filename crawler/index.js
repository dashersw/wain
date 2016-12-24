var _ = require('lodash');
var async = require('async-q');
var htmlToText = require('html-to-text');
var FeedParser = require('feedparser');
var fs = require('fs');
var mkdirp = require('mkdirp');
var readability = require('node-readability');
var request = require('request');
var slug = require('slug');


var sources = require('./sources.json');

async.each(sources, processSource).then(success).catch(error).done();

function processSource(source) {
    console.log(`processing ${source.name}`);
    var sourceRoot = `./corpus/${source.name}`;
    mkdirp.sync(sourceRoot);

    return async.waterfall([starter(source.feeds), fetchArticleLinksFromSources, filterLinks, extractReadabilities]).then(extractedSources => {

        extractedSources.forEach(extractedSource => {
            var articleSlug = slug(extractedSource.title, { lower: true });
            var filename = `${sourceRoot}/${articleSlug}.txt`;
            var bodyText = htmlToText.fromString(extractedSource.content) || '';

            fs.writeFileSync(filename, bodyText);
        });
    });
}

function success(result) {
    console.log('done!');
}

function error(err) {
    console.log('Failed ~ Reason => ', err);
}

function fetchArticleLinksFromSources(sources) {
    return async.map(sources, fetchArticleLinksFromSource).then(result => _.flatten(result));
}

function fetchArticleLinksFromSource(source) {
    return new Promise(function(resolve, reject) {
        var req = request(source),
            feedparser = new FeedParser();

        req.on('error', reject);
        feedparser.on('error', reject);

        req.on('response', function(res) {
            var stream = this;

            if (res.statusCode != 200)
                reject('Bad Status Code');

            var feed = stream.pipe(feedparser);
        });

        var links = [];

        feedparser.on('readable', function() {
            var stream = this, item;

            while (item = stream.read()) {
                links.push(item.link);
            }
        });

        feedparser.on('end', function() {
            resolve(links);
        });
    });
}

function filterLinks(links) {
    return async.waterfall([starter(links), removeEndSlashes, filterHomepages]);
}

function removeEndSlashes(links) {
    return links.map(link => link.replace(/\/$/, ''));
}

function filterHomepages(links) {
    return links.filter(link => (link.match(/\//g) || []).length > 2);
}

function extractReadabilities(links) {
    return async.map(links, extractReadability);
}

function extractReadability(link) {
    return new Promise(function(resolve, reject) {
        readability(link, function(err, article, meta) {
            if (err) return reject(err);

            resolve(article);
        });
    });
}

function starter(...v) {
    return function() {
        return new Promise(function(resolve, reject) {
            resolve(...v);
        });
    }
}
