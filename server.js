//mongo connection stuff
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var connecturl ='mongodb://'+process.env.USER+':'+process.env.PASS+'@'+process.env.HOST+':'+process.env.DB_PORT+'/'+process.env.DB;

var mongoose=require('mongoose');

var validUrl = require('valid-url');

//some global vars for constructing shorturls
var counter=1;
var path="https://absorbed-join.glitch.me/";


//connect using mongoose  ----schema includes counter for looking up number of last created shorturl and incrementing up
//you must call findLatest after updating database to ensure that global counter var matches database
mongoose.connect(connecturl);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {  
  
  var schema=mongoose.Schema({
    url:String,    
    shorturl: String,
    counter:Number
  });
 
     
  var urlEntry=mongoose.model("url", schema); 
  
  function findLatest(){
    urlEntry.findOne().sort('-counter').exec(function(err, ret) { 
      if (err){console.log(err)}
    if (ret){
      var incremented=ret.counter+1;      
      counter=incremented;      
      }
    });    
  }
 
var express = require('express');
var app = express();


app.use(express.static('public'));


app.get("/", function (request, response) {
  findLatest();    
  response.sendFile(__dirname + '/views/index.html');  
});

//get and redirect using the shorturl  
app.get("/:uri?", function(request, response){
  var urlToGet=request.params.uri;  
  var query=urlEntry.findOne({shorturl:path+urlToGet}, "url", function(err, res){
    if (err){
      console.log(err);      
    }
    if (res){       
      response.redirect(res.url);      
    }    
  });  
});

//add new url to the database
app.get("/new/*", function (request, response) { 
  var urlRequested=request.params[0]; 
  //use validUrl to check url format
  if (validUrl.isUri(urlRequested)){
      var addingUrl=new urlEntry({url:urlRequested, shorturl:path+counter, counter:counter}); 
      //save here
      addingUrl.save(function (err, addingUrl){
            if (err) return console.error(err);
            console.log("saving to database")
            //update counter here after database update so if you add another from the json results page it increments right
            findLatest(); 
      }); 
    response.json({url:addingUrl.url, shorturl:addingUrl.shorturl}); 
    } 
  else {      
      response.json({error:"This does not appear to be a valid uri format."})
    }
 });


// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
  
});