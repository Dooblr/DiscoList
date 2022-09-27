import React, { useEffect, useState, createContext } from 'react'
import {Form, Button, ListGroup, Spinner, Row, Col} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import axios from 'axios'

export const ThemeContext = createContext(null)

function App() {

  // Express server address
  const hosturl = "http://localhost:5000"
  
  // State ============================================================ //

  // UI State
  const [labelSearchInput, setLabelSearchInput] = useState('');
  const [queryMax, setQueryMax] = useState(20);
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState("dark");

  // Auth State
  const [spotifyToken, setSpotifyToken] = useState('');

  // Tracklist state
  const [tracklist, setTracklist] = useState(null);

  // Spotify Auth ==================================================== //

  // Get spotify keys from .env
  const spotify_client_id = process.env.REACT_APP_SPOTIFYCLIENTID
  // Spotify auth
  const redirect_uri = 'http://localhost:3000';
  const auth_endpoint = 'https://accounts.spotify.com/authorize';
  const response_type = 'token';

  // UI Handlers ====================================================== //

  // Sets input state on every keystroke
  function searchInputHandler(event) {
    setLabelSearchInput(event.target.value);
  };

  function setQueryMaxHandler(event) {
    setQueryMax(event.target.value)
  }

  // Fetches a list of artists and titles and sets tracklist state to the response
  function searchButtonHandler() {
    
    // Clear track list
    setTracklist(null)

    // Set loading status
    setIsLoading(true)

    fetch(hosturl + '/search?search=' + labelSearchInput + "&max=" + queryMax)
      .then(res => res.json())
      .then(data => {
        setTracklist(data)
        setIsLoading(false)
      });
  };

  async function createPlaylistHandler(){
    
    // Get user ID
    const userID = await getUserID()

    // Create an empty playlist
    const createPlaylistResponse = await axios.post(`https://api.spotify.com/v1/users/${userID}/playlists`,
      {
        "name": "My new playlist",
        "description": "my new playlist",
        "public": false
      }, 
      {
        headers:{
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": "Bearer " + spotifyToken
        }
    })
    // // // Get the playlist ID from the response
    const playlistID = createPlaylistResponse.data.id

    // Get a list of spotify URI's from the tracklist state
    const spotifyURIs = await getSpotifyURIs(tracklist)
    // console.log(playlistID)
    
    addSpotifyTracksToPlaylist(playlistID, spotifyURIs)
  }

  // takes a Spotify playlist ID and an array of spotify URIs -> adds them to a spotify playlist
  async function addSpotifyTracksToPlaylist(spotifyPlaylistID, spotifyUriArray){
    console.log(spotifyUriArray.toString())
    const addTracksResponse = await axios.post(`https://api.spotify.com/v1/playlists/${spotifyPlaylistID}/tracks?uris=${spotifyUriArray.toString()}`, {},
    {
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": "Bearer " + spotifyToken
      }
    })
  }

  // Gets user ID for creating an empty playlist
  async function getUserID(){
    const userID = await axios("https://api.spotify.com/v1/me", {
      headers:{
        "Accept": "application/json", 
        "Content-Type": "application/json",
        "Authorization": "Bearer " + spotifyToken
      }
    })
    return userID.data.id
  }

  // [{Artist:"",Track:"",Release:""}] -> [spotifyURI]
  async function getSpotifyURIs(tracklist){

    // Create empty array for spotify uris
    let spotifyURIs = []

    // Run Spotify searches for each item in the track list and add them 
    for (const [index, release] of tracklist.entries()) {
      
      // remove commas from artist name so it does not 
      // let artistNoCommas = release.artist.replaceAll(',', '');

      const spotifyData = await axios(`https://api.spotify.com/v1/search?q=${release.trackTitle}%20${release.artist}&type=track&limit=50`, {  //%20${release.releaseTitle}
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": "Bearer " + spotifyToken
        }
      })

      const items = spotifyData.data.tracks.items
      console.log(items)
      if (items.length > 0) {
        let uri = items[0].uri
        if (uri) { spotifyURIs.push(uri) }
      }
    }
    return spotifyURIs
  }

  // Clear spotify token from window. TODO: Log out from spotify as well?
  function logout() {
    getSpotifyTokenFromWindow("")
    window.localStorage.removeItem("token")
    alert('You have been logged out of Spotify')
  }

  // Toggle HTML dark/light theme ID
  function toggleTheme(){
    setTheme((curr)=> (curr === "light" ? "dark" : "light") )
  }

  // Sets spotify auth token state from url (window.location)
  function getSpotifyTokenFromWindow(){
    const hash = window.location.hash
    let token = window.localStorage.getItem("token")
    if (!token && hash) {
        token = hash.substring(1)
          .split("&")
          .find(elem => elem.startsWith("access_token"))
          .split("=")[1]
        window.location.hash = ""
        window.localStorage.setItem("token", token)
    }
    setSpotifyToken(token)
  }

  // ComponentDidMount Sets spotify token from window
  useEffect(() => {
    getSpotifyTokenFromWindow()
  }, [])

  // JSX ================================================= //

  return (

    // ThemeContext bridges React's theme state to HTML's ID which is then read by CSS
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className="app padding" id={theme}>

        <div className="flex-row">

          <div>
            <h1 className="site-title">DiscoList</h1>
            
            {/* Dark mode switch */}
            <Form.Check 
              type="switch"
              id="darkmode-switch"
              label="Dark Mode"
              className="dark-mode-switch"
              size='lg'
              onChange={toggleTheme}
              checked={theme === "dark"}
            />
          </div>

          {/* Spotify Login status and logout button */}
          {spotifyToken && 
            <div className="text-center spotify-login-container">
                <div className="centered flex-row">
                  <h6>Logged into Spotify 👌</h6>
                  <div className="spacer"/>
                  <Button variant="danger" size="sm" onClick={logout} className="spotify-logout-button">Logout</Button>
                </div>
            </div>
          }
        </div>

          
        <br/>

        <h3 className="title-text">Type in a Record Label. </h3>
        <h5 className="subtitle-text">We'll turn it into a playlist. </h5>

        <br/>

        <div className="centered inputs">
          {/* Text input */}
          {spotifyToken &&
            <div>
              <Form.Control 
                  size="lg" 
                  type="text" 
                  placeholder="Enter a Record Label (e.g. Motown)"
                  onChange={searchInputHandler}
                  value={labelSearchInput}
                  className="text-input text-center" 
                />
              <br/>
              <Row>
                <Col className="col-3">
                  <Form.Label>Max Results:</Form.Label>
                </Col>
                <Col className="col-9">
                  <Form.Control 
                    size="md" 
                    type="number" 
                    placeholder="Max Results"
                    onChange={setQueryMaxHandler}
                    value={queryMax}
                    className="text-center"
                    id="max-query-input"
                  />
                </Col>
              </Row>
            </div>
          }
        </div>
        

        <br/>

        {/* Search and Create playlist button row */}
        {(spotifyToken && !isLoading) &&
          <div>
            {/* Search button conditionally renders to enabled/disabled based on Spotify auth status */}
            <div className="flex-row flex-row-centered">
              <Button variant="primary" size="lg" onClick={searchButtonHandler} className="big-button">Search</Button>
              
              {tracklist && 
                <div>
                  <Button variant="success" size="lg" onClick={createPlaylistHandler} className="big-button" id="create-playlist-button">Create Playlist</Button>
                </div>
              }
            </div>
          </div>
        }
        
        {/* Spotify login button */}
        {!spotifyToken && 
          <div className="text-center">
              <Button variant="success" 
                size="lg"
                href={`${auth_endpoint}?client_id=${spotify_client_id}&redirect_uri=${redirect_uri}&response_type=${response_type}&scope=playlist-modify-private%20playlist-modify-public&response_type=token&show_dialogue=true`}>
                  Login to Spotify
              </Button>
          </div>
        }
        <br/>

        {/* Tracklist display */}
        { (tracklist && spotifyToken) && 
          <ListGroup className="tracklist">
              {tracklist.map((track) => {
                  return <ListGroup.Item key={track} className="tracklist-item">
                      <Form.Text muted>Artist: </Form.Text> {track.artist} 
                      <br/>
                      <Form.Text muted>Track: </Form.Text> {track.trackTitle}
                      <br/>
                      <Form.Text muted>Release: </Form.Text> {track.releaseTitle}
                    </ListGroup.Item>
              })}
          </ListGroup>
        }
          
        {/* Loading spinner */}
        { isLoading && <div>
            <p className="text-centered color-white">Loading....</p>
            <Spinner animation="border" variant="success" className="centered"/>
          </div>
        }

      </div>
    </ThemeContext.Provider>
  )
}

export default App