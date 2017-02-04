#!/usr/bin/env node

const mongoDb = require('./config/mongo.js');
const archiveOrgService = require('./services/archiveOrgService.js');

/* test generic mongo stubs */
// mongoDb.mongo();


archiveOrgService.getAllArtists();
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
