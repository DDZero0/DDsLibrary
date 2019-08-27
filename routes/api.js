/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DATABASE;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      MongoClient.connect(MONGODB_CONNECTION_STRING,{useUnifiedTopology: true,useNewUrlParser: true}, (err,data)=>{
        let db = data.db("Library");
        db.collection('Library').find().toArray((err,doc)=>{
          if (err) throw err;
          res.json(doc);
        })
      })
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
    })
    
    .post(function (req, res){
      var title = req.body.title;
      let book = {
      "title":title,
      "comments":[],
      "commentcount":0
    }
      MongoClient.connect(MONGODB_CONNECTION_STRING,{useUnifiedTopology: true,useNewUrlParser: true}, (err,data)=>{
        let db = data.db('Library');
        db.collection('Library').insertOne(book,{returnNewDocument:true},(err,doc)=>{
          if (err) throw err;
          res.json(doc.ops);
        })
      })
      //response will contain new book object including atleast _id and title
    })
    
    .delete(function(req, res){
    
    MongoClient.connect(MONGODB_CONNECTION_STRING,{useUnifiedTopology: true,useNewUrlParser: true},(err,data)=>{
      if (err) throw err;
      let db = data.db('Library');
      db.collection('Library').deleteMany({},(err,doc)=>{
        if(err) throw err;
        res.send('complete delete successful');
      })
    })
      //if successful response will be 'complete delete successful'
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      let bookid = req.params.id;
    if(bookid == null || bookid == '' || bookid == undefined){
          res.send('Book not Found!');
          return;
        }
    MongoClient.connect(MONGODB_CONNECTION_STRING,{useUnifiedTopology: true,useNewUrlParser: true},(err,data)=>{
      if (err) throw err;
      let db = data.db('Library');
      db.collection('Library').findOne({_id:ObjectId(bookid)},(err,doc)=>{
        if (err) throw err;
        res.json(doc);
      })
    })
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    })
    
    .post(function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;
      if(comment == ''){
        return;
      }
    MongoClient.connect(MONGODB_CONNECTION_STRING,{useUnifiedTopology: true,useNewUrlParser: true},(err,data)=>{
      if (err) throw err;
      let db = data.db('Library');
      db.collection('Library').findOneAndUpdate({_id:ObjectId(bookid)},{$push:{comments:comment}},{upsert:true, returnNewDocument:true},(err,doc)=>{
        if (err) throw err;
        
      db.collection('Library').findOneAndUpdate({_id:ObjectId(bookid)},{$inc:{commentcount:1}},{upsert:true, returnNewDocument:true},(err,doc)=>{
        if (err) throw err;
      res.json(doc.value);
      })
    })
      //json res format same as .get
    })
  })
    
    .delete(function(req, res){
      let id = req.params.id;
      MongoClient.connect(MONGODB_CONNECTION_STRING,{useUnifiedTopology: true,useNewUrlParser: true},(err,data)=>{
      if (err) throw err;
      let db = data.db('Library');
      db.collection('Library').deleteOne({_id:ObjectId(id)},(err,doc)=>{
        if(err) throw err;
        res.send('delete successful');
      })
    })
      //if successful response will be 'delete successful'
    });
  
};
