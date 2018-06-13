require('dotenv').config();
//{path: '~/.env'}
var fs = require("fs");
var inquirer = require('inquirer');
var request=require("request");
var Twitter = require('twitter');
var keys=require("./keys.js");
var Spotify = require('node-spotify-api');
var stuff=[];

var runobj={
    twit: function(){
        var tweets = new Twitter(keys.twitter);
        var params = {
            count: 20,
        }

        tweets.get('statuses/home_timeline', params, function(err, data, response) {
            if(!err){
                var tweeters=JSON.parse(response.body)
                for(var i=0;i<tweeters.length;i++){
                    console.log("On "+tweeters[i].created_at+" from "+tweeters[i].user.name+": "+tweeters[i].text)
                }
            } else {
                console.log(err);
            }
        })
    },

    spot: function(){
        var songTitle="";
        if (stuff.length==1){
            songTitle = "The Sign Ace of Base";
        }else {
            for(var i=1;i<stuff.length;i++){
                songTitle+=stuff[i]+"+";
            }
        }
        var spots = new Spotify(keys.spotify);
        spots.search({ type: 'track', query: songTitle }, function(err, data) {
            if (err) {
              return console.log('Error occurred: ' + err);
            }else{
                console.log("The song '"+data.tracks.items[0].name+"' from the album '"+data.tracks.items[0].album.name+"' by the artists: ");
          for(var i = 0; i<data.tracks.items[0].artists.length;i++){
            console.log(data.tracks.items[0].artists[i].name); 
          }
          console.log("A preview is available at: "+data.tracks.items[0].preview_url)
            }
          });


    },

    movie: function(){
        var movieName = "";
        if (stuff.length==1){
            movieName = "Mr. Nobody";
        }else {
            for(var i=1;i<stuff.length;i++){
                movieName+=stuff[i]+"+";
            }
        }
        var queryUrl = "https://www.omdbapi.com/?t=" + movieName + "&y=&plot=short&apikey=trilogy";
        request(queryUrl, function(error, response, body) {
            if (!error && response.statusCode === 200 && (JSON.parse(body)).Response!=="False") {
              console.log((JSON.parse(body)).Title+" was released on "+(JSON.parse(body)).Released);
              for(var i=0; i<JSON.parse(body).Ratings.length;i++){
                if (JSON.parse(body).Ratings[i].Source==="Internet Movie Database" ){
                    console.log("IMDB rates it as: "+(JSON.parse(body).Ratings[i].Value));
                }
                if(JSON.parse(body).Ratings[i].Source==="Rotten Tomatoes"){
                    console.log("Rotten Tomatoes rates it as: "+(JSON.parse(body).Ratings[i].Value));
                }
              }
              console.log("It was produced in: "+JSON.parse(body).Country+"\nNatively in the "+JSON.parse(body).Language+" language"+"\nPlot: "+JSON.parse(body).Plot+"\nWith the cast of: "+JSON.parse(body).Actors);
            }
            else{
              console.log("There was a problem with the request");
            }
          });
    },
    
    rand: function(){ 
        var context=this;
        fs.readFile("./random.txt", "utf8", function(error, data) {
            if(error){
                console.log(error);
            }else{
                stuff=data.split(",");
                context.selector(stuff);
            }
        })
    },

    help: function (){
        console.log("Use one of the following arguments: \nmy-tweets -lists last 20 tweets in timeline \nspotify-this-song searches for a song title\nmovie-this searches for a movie title\ndo-what-it-says runs commands in random.txt")
        
    },

    scraper: function(){
        for(var i=2; i<process.argv.length;i++){
            stuff.push(process.argv[i])
        }
        fs.appendFile("./log.txt", stuff+",", function(err) {

            if (err) {
              console.log(err);
            }
            else {
              //console.log("Log Updated");
            }
          
          });
          this.selector(stuff);
    },

    selector: function(more){
        switch (more[0]){
            case 'my-tweets':runobj.twit();
                break;
            case 'spotify-this-song':runobj.spot();
                break;
            case 'movie-this':runobj.movie();
                break;
            case 'do-what-it-says':runobj.rand();
                break;
            default: runobj.help();
                break;
        }
    }
}

runobj.scraper();








