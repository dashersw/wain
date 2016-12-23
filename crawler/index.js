var async = require('async');
var sources = require('./sources.json');

function fetchArticlesFromSource(source) {
    console.log(source);
}

async.each(sources, fetchArticlesFromSource);