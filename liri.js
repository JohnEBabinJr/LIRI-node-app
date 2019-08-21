require("dotenv").config();
let dataKeys = require("./keys.js");
let fs = require('fs'); //file system
let twitter = require('twitter');
let Spotify = require('node-spotify-api');
let request = require('request');
var inquirer = require('inquirer');

let space = "\n";
let header = "========================================================";

function writeToLog(data) {
    fs.appendFile("log.txt", '\r\n\r\n', function (err) {
        if (err) {
            return console.log(err);
        }
    });

    fs.appendFile("log.txt", (data), function (err) {
        if (err) {
            return console.log(err);
        }
        console.log(space + "log.txt was updated!");
    });
}

function getMeSpotify(songName) {
    let spotify = new Spotify(dataKeys.spotify);

    if (!songName) {
        songName = "Long December";
    }
    spotify.search({ type: 'track', query: songName }, function (err, data) {
        if (err) {
            console.log('Error occurred: ' + err);
            return;
        } else {
            output =
                "========================================================" +
                space + "Song Name: " + "'" + songName.toUpperCase() + "'" +
                space + "Album Name: " + data.tracks.items[0].album.name +
                space + "Artist Name: " + data.tracks.items[0].album.artists[0].name +
                space + "URL: " + data.tracks.items[0].album.external_urls.spotify;
            console.log(output);
            writeToLog(output);
        }
    });

}

let getTweets = function () {
    let client = new twitter(dataKeys.twitter);
    let params = { screen_name: 'ednas', count: 10 };

    client.get('statuses/user_timeline', params, function (err, tweets, res) {
        let data = [];

        data.push(space + header);
        if (err) {
            console.log('Error occured: ' + err);
            return;
        } else {
            for (let i = 0; i < tweets.length; i++) {
                data.push(
                    space + 'Created at: ' + tweets[i].created_at +
                    space + 'Tweet: ' + tweets[i].text + "\n"
                );
            }
            let newData = data.join('');
            console.log(newData);
            writeToLog(newData);
        }
    });
};

let getMeMovie = function (movieName) {

    if (!movieName) {
        movieName = "Mr Nobody";
    }
    //Get your OMDb API key creds here http://www.omdbapi.com/apikey.aspx
    // t = movietitle, y = year, plot is short, then the API key
    let urlHit = "http://www.omdbapi.com/?t=" + movieName + "&y=&plot=short&apikey=33981212";

    request(urlHit, function (err, res, body) {
        if (err) {
            console.log('Error occurred: ' + err);
            return;
        } else {
            let jsonData = JSON.parse(body);
            output = space + header +
                space + 'Title: ' + jsonData.Title +
                space + 'Year: ' + jsonData.Year +
                space + 'Rated: ' + jsonData.Rated +
                space + 'IMDB Rating: ' + jsonData.imdbRating +
                space + 'Country: ' + jsonData.Country +
                space + 'Language: ' + jsonData.Language +
                space + 'Plot: ' + jsonData.Plot +
                space + 'Actors: ' + jsonData.Actors +
                space + 'Tomato Rating: ' + jsonData.Ratings[1].Value +
                space + 'IMDb Rating: ' + jsonData.imdbRating + "\n";

            console.log(output);
            writeToLog(output);
        }
    });
};

let questions = [{
    type: 'list',
    name: 'programs',
    message: 'What would you like to do?',
    choices: ['Spotify', 'Movie', 'Get Latest Tweets',]
},
{
    type: 'input',
    name: 'movieChoice',
    message: 'What\'s the name of the movie you would like?',
    when: function (answers) {
        return answers.programs == 'Movie';
    }
},
{
    type: 'input',
    name: 'songChoice',
    message: 'What\'s the name of the song you would like?',
    when: function (answers) {
        return answers.programs == 'Spotify';
    }
},
];

inquirer
    .prompt(questions)
    .then(answers => {
        switch (answers.programs) {
            case 'Get Latest Tweets':
                getTweets();
                break;
            case 'Spotify':
                getMeSpotify(answers.songChoice);
                break;
            case 'Movie':
                getMeMovie(answers.movieChoice);
                break;
            default:
                console.log('LIRI doesn\'t know that');
        }
    });