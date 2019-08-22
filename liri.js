require("dotenv").config();
let dataKeys = require("./keys.js");
let fs = require('fs');
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

function doWhatItSays() {
    // Reads the random text file and passes it to the spotify function
    fs.readFile("random.txt", "utf8", function (error, data) {
        getMeSpotify(data);
    });
}

function getMeConcerts(bandName) {
    if (!bandName) {
        bandName = "Foo Fighters";
    }

    let queryconcertsUrl = "https://rest.bandsintown.com/artists/" + bandName + "/events?app_id=codingbootcamp";
    request(queryconcertsUrl, function (error, response, body) {

        if (!error && response.statusCode === 200) {

            var JS = JSON.parse(body);
            for (i = 0; i < JS.length; i++) {
                var dateTime = JS[i].datetime;
                var month = dateTime.substring(5, 7);
                var year = dateTime.substring(0, 4);
                var day = dateTime.substring(8, 10);
                var dateForm = month + "/" + day + "/" + year

                var output =
                    header +
                    space + "Name: " + JS[i].venue.name +
                    space + "City: " + JS[i].venue.city +
                    space + "Country: " + JS[i].venue.country +
                    space + "Date: " + dateForm + space;

                console.log(output);
                writeToLog(output);
            }
        }
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
                header +
                space + "Song Name: " + "'" + songName.toUpperCase() + "'" +
                space + "Album Name: " + data.tracks.items[0].album.name +
                space + "Artist Name: " + data.tracks.items[0].album.artists[0].name +
                space + "URL: " + data.tracks.items[0].album.external_urls.spotify;
            console.log(output);
            writeToLog(output);
        }
    });

}

let getMeMovie = function (movieName) {

    if (!movieName) {
        movieName = "Mr Nobody";
    }
    let urlHit = "http://www.omdbapi.com/?t=" + movieName + "&y=&plot=short&apikey=33981212";

    request(urlHit, function (err, res, body) {
        if (err) {
            console.log('Error occurred: ' + err);
            return;
        } else {
            let jsonData = JSON.parse(body);
            output =
                header +
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
    choices: ['Concert', 'Movie', 'Spotify', 'Do What It Says']
},
{
    type: 'input',
    name: 'bandChoice',
    message: 'What is the name of the band you are looking for?',
    when: function (answers) {
        return answers.programs == 'Concert';
    }
},
{
    type: 'input',
    name: 'movieChoice',
    message: 'What is the name of the movie you would like?',
    when: function (answers) {
        return answers.programs == 'Movie';
    }
},
{
    type: 'input',
    name: 'songChoice',
    message: 'What is the name of the song you would like?',
    when: function (answers) {
        return answers.programs == 'Spotify';
    }
},
];

inquirer
    .prompt(questions)
    .then(answers => {
        switch (answers.programs) {
            case 'Concert':
                getMeConcerts(answers.bandChoice);
                break;
            case 'Spotify':
                getMeSpotify(answers.songChoice);
                break;
            case 'Movie':
                getMeMovie(answers.movieChoice);
                break;
            case 'Do What It Says':
                doWhatItSays();
                break;
            default:
                console.log('LIRI does not know that');
        }
    });