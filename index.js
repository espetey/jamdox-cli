#!/usr/bin/env node

const program = require('commander');
const co = require('co');
const prompt = require('co-prompt');
const mongoDb = require('./config/mongo.js');
const archiveOrgService = require('./services/archiveOrgService.js');



program
  .version('0.0.1')
  .usage('[options] <file ...>')
  .option('-s, --search <items>', 'Search by artist name or keyword', parseList)
  .action(function (query, queries) {
    console.log('so we got anything or waht');
    console.log(program.parseList);

    let searchQuery = query;

  })
  .parse(process.argv);

const handleError = function (error) {
  console.log('An error occurred: ' + error);
}

function parseList(val) {
  const queries = val.split(',');
  let searchQuery = '';
  if (queries) {
    queries.forEach(function (q) {
      searchQuery += '+' + q;
    });
  }
  archiveOrgService.searchCreator(4, searchQuery)
    .then(sets => {
      sets.map(set => {
        console.log(set['creator'] + ' - ' + set['title'] + ' - ' + set['date'])
      })
    })
    .catch(error => handleError(error))
  console.log(val.split(','));
  return val.split(',');
}


/* test generic mongo stubs */
// mongoDb.mongo();


// archiveOrgService.getAllArtists();
// archiveOrgService.getArtist();


// todo features

// watch list/favorites
// get list of top 100 artists or allow user to search
// user adds amount of artists to watch list
// notify when updated?
// view list of most recent updates?

// deep analysis
// dates, all shows by artist sorted by date location, maybe to get map of tour? polyline from google?
// songs and likelihood of them being played, ala fantasy jam band?
// how often are same songs played on date, location, year
// any song anomolies or old songs haven't played for awhile, etc.
