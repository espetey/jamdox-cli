const MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

module.exports.mongo = function () {
  const url = 'mongodb://localhost:27017/myproject';

  MongoClient.connect(url, function (err, db) {
    assert.equal(null, err);
    findDocuments(db, function (results) {
      console.log('heyasd bud');
      console.log(results);
      db.close();
    })
  });

  const insertDocuments = function (db, callback) {
    const collection = db.collection('documents');
    collection.insertMany([
      { a: 1 },
      { a: 2 },
      { a: 3 }
    ], function (err, result) {
      assert.equal(err, null);
      assert.equal(3, result.result.n);
      assert.equal(3, result.ops.length);
      callback(result);
    })
  }

  const findDocuments = function (db, callback) {
    const collection = db.collection('documents');
    collection.find({}).toArray(function (err, docs) {
      assert.equal(err, null);
      callback(docs);
    });
  }

  const findDocumentsWithQuery = function (db, callback) {
    const collection = db.collection('documents');
    collection.find({ 'a': 4 }).toArray(function (err, docs) {
      assert.equal(err, null);
      console.log(docs);
      callback(docs);
    });
  }

  const updateDocument = function (db, callback) {
    const collection = db.collection('documents');
    collection.updateOne({ a: 2 }, { $set: { b: '23234234' } }, function (err, result) {
      assert.equal(err, null);
      assert.equal(1, result.result.n);
      callback(result);
    })
  }

  const removeDocument = function (db, callback) {
    const collection = db.collection('documents');
    collection.deleteOne({ a: 3 }, function (err, result) {
      assert.equal(err, null);
      assert.equal(1, result.result.n);
      callback(result);
    })
  }

  const indexCollection = function (db, callback) {
    db.collection('documents').createIndex(
      { 'a': 1 },
      null,
      function (err, results) {
        callback();
      }
    );
  }
}

