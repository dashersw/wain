var async = require('async');
var sources = require('./sources.json');
var request = require('request');
var htmlToText = require('html-to-text');

function fetchArticlesFromSource(source) {
    source.map(handleSource)
}
/** 
 * Each feed url handle by this function.
 * @param url Link of Article Feed
 * @returns {?}
 */
function handleArticleSource(url) {
    request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var text = htmlToText.fromString(body);
            console.log(text)
        } else {
             // I don't have an idea about handle error
        }
    })
}

async.each(sources, fetchArticlesFromSource);