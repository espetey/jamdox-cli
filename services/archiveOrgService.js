'use strict'

const R = require('ramda');
const request = require('request');
const xmlParse = require('xml2js').parseString;

module.exports.getAllArtists = function getAllArtists() {
    getCreators(15, function (c) {
        const creators = R.pipe(
            R.map(function (creator) { return creator['creator'] }),
            R.uniq,
            R.values
        )(c)
        console.log(creators)
    })
}

module.exports.getArtist = function getArtist(artist) {
    const creator = artist

    // testId for testing routes
    const testId = 'gd87-04-03.sennme80.clark-miller.24898.sbeok.shnf'

    getMetaForIdentifier(testId, function (metadata) {
        const m = metadata['metadata']
        console.log('returned metadata')
        // console.log(m)
        console.log('identifier: ' + m['identifier'][0])
        console.log('title: ' + m['title'][0])
        console.log('creator: ' + m['creator'][0])
        console.log('year: ' + m['year'][0])
        console.log('date: ' + m['date'][0])
        console.log('venue: ' + m['venue'][0])
        console.log('coverage: ' + m['coverage'][0])
        console.log('collection: ' + m['collection'][0])
        console.log('has_mp3: ' + m['has_mp3'][0])
    })

    // get files and isolate mp3s
    getFilesForIdentifier(testId, function (files) {
        const mp3s = selectMp3sFromFiles(files)
        // console.log(mp3s)
    })
}

/*
 * Helper methods
 */
// get specific number of creators
// todo add paging
function getCreators(count, callback) {
    // sort by most popular, better idea for a large origin index list
    // const reqPath = 'https://archive.org/advancedsearch.php?q=mediatype:etree&fl[]=creator&sort[]=downloads+desc&rows=' + count + '&output=json'

    /*
     * The rationale for "oai_updatedate" date merging is to allow something 
     * like the Open Archives Initiative protocol get time-sortable lists of 
     * updated or added items.
     * addededate -- should be time the item was initially added to archive
     * indexdate -- should be last time item had a change that updated our search engine
     * publicdate -- should be, for *most* items, the time after its first derive 
     * is done (ie: has "public formats" for a /details/ page)
     * reviewdate -- updated to be the most recent time of all reviews (updated on 
     * new reviews and review changes)
     * updatedate -- mostly the time of the last /editxml/ page submit for an item
     * */
    // sort by most recently added, or since starting/ending oai_update, which we can
    // use to update based on last-time-updated in our local database
    const reqPath = 'https://archive.org/advancedsearch.php?q=mediatype:etree&oai_updatedate:[2017-02-01%20TO%20null]&sort[]=oai_updatedate+desc&rows=' + count + '&output=json'

    request(reqPath, function (err, response, body) {
        const resJson = JSON.parse(response.body)
        const rawCreators = resJson.response.docs
        console.log(rawCreators);
        callback(rawCreators)
    })
}

// get total number of identifiers before future queries
// for  paging or throttling purposes (e.g. grateful dead has 11k+)
function getIdentifierCountForCreator(creator, callback) {
    const reqPath = 'https://archive.org/advancedsearch.php?q=creator:' + creator + '&fl%5b%5D=numCount&output=json';
    request(reqPath, function (err, response, body) {
        const resJson = JSON.parse(response.body);
        const numFound = resJson.response.numFound;
        callback(numFound);
    });
}

// get an amount of identifiers for creator
// useful for general metadata searches
function getIdentifiersForCreator(creator, count, callback) {
    // TODO need to page this, &page=' + page + ', or insert count for big list
    const reqPath = 'https://archive.org/advancedsearch.php?q=creator:' + creator + '&fl%5b%5D=identifier&rows=' + count + '&output=json';
    request(reqPath, function (err, response, body) {
        const resJson = JSON.parse(response.body);
        const rawIdentifiers = resJson.response.docs;
        const identifiers = [];
        rawIdentifiers.forEach(function (r) {
            identifiers.push(r.identifier);
        });
        callback(identifiers);
    });
}

// get an amount of identifiers for creator where mp3s exist
// useful for generating a playable list or list of mp3 links
function getIdentifiersWithMp3ForCreator(creator, count, callback) {
    // TODO need to page this, &page=' + page + ', or insert count for big list
    const reqPath = 'https://archive.org/advancedsearch.php?q=creator:' + creator + '&has_mp3%281%29&fl%5b%5D=identifier&rows=' + 100 + '&output=json';
    request(reqPath, function (err, response, body) {
        const resJson = JSON.parse(response.body);
        const rawIdentifiers = resJson.response.docs;
        const identifiers = [];
        rawIdentifiers.forEach(function (r) {
            identifiers.push(r.identifier);
        });
        callback(identifiers);
    });
}

function getMetaForIdentifier(identifier, callback) {
    const reqPath = 'https://archive.org/download/' + identifier + '/' + identifier + '_meta.xml';
    request(reqPath, function (err, response, body) {
        const xml = response.body;
        xmlParse(xml, function (err, result) {
            callback(result);
        });
    });
}

function getFilesForIdentifier(identifier, callback) {
    const reqPath = 'https://archive.org/download/' + identifier + '/' + identifier + '_files.xml';
    request(reqPath, function (err, response, body) {
        const xml = response.body;
        xmlParse(xml, function (err, result) {
            callback(result);
        });
    });
}

function selectMp3sFromFiles(files) {
    return R.pipe(
        R.filter(function (file) { return file['format'][0] === 'VBR MP3' }),
        R.uniq,
        R.values
    )(files['files']['file'])
}

// not a useful route... consider removing
function getDataForIdentifier(identifier, callback) {
    const reqPath = 'https://archive.org/advancedsearch.php?q=identifier:' + identifier + '&output=json';
    request(reqPath, function (err, response, body) {
        const resJson = JSON.parse(response.body)
        callback(resJson)
    });
}