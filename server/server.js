const express = require('express');
var cors = require('cors');
var cookieParser = require('cookie-parser');
const axios = require('axios');

// Number of releases to query from a list of discogs label releases. Defaults to 50.
let discogsQueryMax = 25

// Enable Environment variables
require('dotenv').config()

// DISCOGS AUTH
const discogsToken = process.env.DISCOGSTOKEN
const consumerKey = process.env.DISCOGSCONSUMERKEY
const consumerSecret = process.env.DISCOGSCONSUMERSECRET
// Combine them for headers
const keySecretHeaders = { 'Authorization': 'Discogs', "key" : consumerKey, "secret" : consumerSecret }

// SERVER
const app = express()

app.use(express.static(__dirname + '/build'))
    .use(cors())
    .use(cookieParser());

// Homepage endpoint
app.get('/', (req, res) => {
    res.sendFile(__dirname + 'build' + 'index.html');
});

// Start server
app.listen(5000, () => {
    console.log("Server started on port 5000");
});

// App ================================================

// Client searches for record label, is returned array [{Artist:"",Title:"",Release:""}]
app.get('/search', async function (req, res) {
        
    // Set global max query length to param in response
    discogsQueryMax = req.query.max

    // User Input -> Discogs Label ID
    const labelID = await getDiscogsLabelID(req.query.search)
    
    // Discogs Label ID -> [{Artist:"",Title:"",Release:""}]
    const discogsReleases = await getDiscogsLabelReleases(labelID)

    // Respond with results
    res.json(discogsReleases)
});

// User input -> Discogs Label ID
async function getDiscogsLabelID(searchInput) {
    
    // Search w/ query label
    const queryResults = await axios("https://api.discogs.com/database/search?q=" + searchInput + "&type=label" + "&token=" + discogsToken);

    // Return Labl ID of first result
    return queryResults.data.results[0].id;
};

// Discogs Label ID -> [{Artist/Title}]
async function getDiscogsLabelReleases(discogsLabelID) {

    // 3. Get label releases from label ID
    const discogsLabelReleasesResults = await axios("https://api.discogs.com/labels/" + discogsLabelID + "/releases", {headers: keySecretHeaders}); //  

    // 3a. Drill down into release data payload
    const discogsReleases = discogsLabelReleasesResults.data.releases;
    
    // Create an empty array for individual tracks
    let tracksArray = [];

    // For each release in the label releases, create a new object with Artist/Title and add to trackObjArray
    for (const [index, release] of discogsReleases.entries()) {

        // Limit the number of times this loop is run
        if (index == discogsQueryMax) { break; }

        // Get the ID of current release
        const releaseId = release.id
        
        // Get the release containing tracklist
        const discogsRelease = await axios("https://api.discogs.com/releases/" + releaseId, {headers: keySecretHeaders});

        // Throttling
        if (discogsRelease.headers['x-discogs-ratelimit-remaining'] < '5') {
            await new Promise(r => setTimeout(r, 1000));
        }

        // Disregard entry if label is not included in release
        let passed = false
        discogsRelease.data.labels.forEach((label) => {
            if (label.id == discogsLabelID) { passed = true }
        })
        if (!passed) { continue }

        // Set the artist
        const releaseArtists = discogsRelease.data.artists

        // Skip entry if there is no artist
        // if (releaseArtists.length === 0) { continue; }

        // Set the tracklist
        const trackList = discogsRelease.data.tracklist

        // Create object(s) for each track in release and add them to trackObjArray
        for (const [index, track] of trackList.entries()) {

            // Concatenate the artist(s) from arrays to a string,
            // If it's a compilation album, use the artist from the tracklist, or else use the release artist
            let artistString = concatenateArtists(releaseArtists)
            if (artistString == 'Various') {
                artistString = concatenateArtists(track.artists)
            }

            // Create a new track object
            let newTrack = { artist: artistString, trackTitle: track.title, releaseTitle: discogsRelease.data.title }

            // Add object to global tracksArray
            tracksArray.splice(0, 0, newTrack)
        }
    };
    
    // Remove any duplicates from the array
    tracksArray = tracksArray.filter((value, index, self) =>
        index === self.findIndex((t) => (
            t.artist === value.artist && t.trackTitle === value.trackTitle && t.releaseTitle === value.releaseTitle
        ))
    )
    
    return tracksArray;
};

// ['Artist'] -> 'Artist, Artist, Artist'
function concatenateArtists(artistsArray) {
    let artistString = ''
    artistsArray.forEach((artist, index) => {
        if (index > 0) {
            artistString = artistString + ', ' + artist.name
        } else {
            artistString = artist.name
        }
    })
    return artistString
}
