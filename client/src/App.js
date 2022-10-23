// Dependencies
import React, { useEffect, useState, createContext } from 'react'
import { Form, Button } from 'react-bootstrap'
import axios from 'axios'
import {Toaster, toast} from 'react-hot-toast'
import useAsyncEffect from 'use-async-effect'

import {toastDarkStyle} from './Utils'

// CSS
import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'

// Components
import Tracklist from './Components/Tracklist'
import LoadingSpinner from './Components/LoadingSpinner'
import InputForm from './Components/InputForm/InputForm'
import SpotifyLogoutBox from './Components/SpotifyLogoutBox/SpotifyLogoutBox'

// Theme context for dark mode
export const ThemeContext = createContext(null)
export const SortTypeContext = createContext('release_date_descending')

// TODO: More cleanup
// Get on HTTPS

function App() {

  let devState = "prod" // "prod" / "dev" / "mobile"
  let hosturl = ""
  let spotify_redirect_uri = ""

  if (devState === "prod") {
    // Express server address
    hosturl = "https://disco-list.herokuapp.com/"
    spotify_redirect_uri = 'https://disco-list.herokuapp.com/';
  } else if (devState === "dev") {
    // Express server address 
    hosturl = "http://localhost:5000/"
    spotify_redirect_uri = 'http://localhost:3000';
  } else if (devState === "mobile") {
    // Local IP address
    hosturl = "PUBLIC SERVER IP" 
    spotify_redirect_uri = "PUBLIC CLIENT IP"
  }

  // State ============================================================ //

  // UI State
  const [labelSearchInput, setLabelSearchInput] = useState('')
  const [queryMax, setQueryMax] = useState(10)
  const [isLoading, setIsLoading] = useState(false)
  const [spotifyIsCreating, setSpotifyIsCreating] = useState(false)

  // Context state
  const [sortType, setSortType] = useState('release_date_descending')
  const [theme, setTheme] = useState("dark")

  // Auth State
  const [spotifyToken, setSpotifyToken] = useState('')

  // Tracklist state
  const [tracklist, setTracklist] = useState(null)

  // Spotify Auth ==================================================== //

  // Get spotify keys from .env
  const spotify_client_id = process.env.REACT_APP_SPOTIFYCLIENTID
  
  // Spotify auth
  const spotify_auth_endpoint = 'https://accounts.spotify.com/authorize/'
  const spotify_response_type = 'token'

  // Handlers ====================================================== //

  // Fetches a list of artists and titles and sets tracklist state to the response
  function searchButtonHandler() {
    
    // Clear track list
    setTracklist(null)

    // Set loading UI state
    setIsLoading(true)

    fetch(hosturl + 'search?search=' + labelSearchInput + "&max=" + queryMax)
      .then(res => res.json())
      .then(data => {
        setTracklist(data)
        setIsLoading(false)
      })
      .catch(error => {
        toast.error("No label found with that name",
        {style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        })
        
        // Return UI from loading state
        setIsLoading(false)
      });
  };

  async function createPlaylistHandler(){
    
    // Set UI state to loading
    setSpotifyIsCreating(true)

    // Get user ID
    const userID = await getUserID()

    // Create an empty playlist
    const createPlaylistResponse = await axios.post(`https://api.spotify.com/v1/users/${userID}/playlists`,
      {
        "name": `${labelSearchInput}`,
        "description": `Discolist made this playlist based on ${labelSearchInput}`,
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
    const spotifyURIs = await getSpotifyURIs(tracklist).catch(() => {
      // Show error toast
      toast.error("None of the listed tracks were found on Spotify 😢", toastDarkStyle)
    })
    
    // Run Spotify create playlist API
    await addSpotifyTracksToPlaylist(playlistID, spotifyURIs)

      // Confirm playlist create toast
      toast.success("Successfully created Spotify Playlist 🎉", toastDarkStyle)

    // Disable loading state
    setSpotifyIsCreating(false)
  }

  // takes a Spotify playlist ID and an array of spotify URIs -> adds them to a spotify playlist
  async function addSpotifyTracksToPlaylist(spotifyPlaylistID, spotifyUriArray){
    const addTracksResponse = await axios.post(`https://api.spotify.com/v1/playlists/${spotifyPlaylistID}/tracks?uris=${spotifyUriArray.toString()}`, {},
    {
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": "Bearer " + spotifyToken
      }
    })
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

  // Toggle HTML dark/light theme ID
  function toggleTheme(){
    setTheme((curr)=> (curr === "light" ? "dark" : "light") )
  }

  // Sets spotify auth token state from url (window.location)
  async function getSpotifyTokenFromWindow(){
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
    return token
  }

  // Gets user ID for creating an empty playlist
  async function getUserID(id){
    let userID = await axios("https://api.spotify.com/v1/me", {
      headers:{
        "Accept": "application/json", 
        "Content-Type": "application/json",
        "Authorization": "Bearer " + spotifyToken
      }
    })
    if (!id) {
      return userID.data.id
    } else if (id === 'full') {
      return userID.data
    }
  }

  // "ComponentDidMount" - sets spotify token from window on initial render
  useAsyncEffect(async () => {
    const token = await getSpotifyTokenFromWindow()
    setSpotifyToken(token)
  }, [spotifyToken])
  
  // JSX ================================================= //

  return (

    // ThemeContext bridges React's theme state to HTML's ID which is then read by CSS
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      
      {/* React Hot Toast shell */}
      <div><Toaster
        toastOptions={{
          // Define default options
          className: '',
          duration: 5000
        }}
      /></div>

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

          {/* Spotify login status + logout button */}
          {spotifyToken && 
            <SpotifyLogoutBox
              // spotifyUsername={spotifyUsername}
              spotifyToken={spotifyToken}
              getUserID={getUserID}
              getSpotifyTokenFromWindow={getSpotifyTokenFromWindow}
            />
          }
        </div>
          
        <br/>

        {/* Heading */}
        <h3 className="title-text">Type in a Record Label.</h3>
        <h5 className="subtitle-text">We'll turn it into a playlist.</h5>

        <br/>

        {/* Spotify login button */}
        {!spotifyToken && 
          <div className="text-center">
              <h4>To begin, click to log into your Spotify account:</h4>
              <br/>
              <Button variant="success" 
                size="lg"
                href={`${spotify_auth_endpoint}?client_id=${spotify_client_id}&redirect_uri=${spotify_redirect_uri}&response_type=${spotify_response_type}&scope=playlist-modify-private%20playlist-modify-public&response_type=token&show_dialogue=true`}>
                  Login to Spotify
              </Button>
          </div>
        }

        {/* User inputs */}
        <div className="centered inputs">
          {spotifyToken &&
          <SortTypeContext.Provider value={{sortType, setSortType}}>
            <InputForm 
               labelSearchInput={labelSearchInput}
               queryMax={queryMax} 
               searchInputHandler={setLabelSearchInput}
               setQueryMaxHandler={setQueryMax}
             />
          </SortTypeContext.Provider>
          }
        </div>

        <br/>

        {/* Search and Create playlist button row */}
        {(spotifyToken && !isLoading && !spotifyIsCreating) &&
          <div>
            {/* Search button conditionally renders to enabled/disabled based on Spotify auth status */}
            <div className="flex-row flex-row-centered">
                <Button variant="primary" size="lg" onClick={searchButtonHandler} className="big-button">Search</Button>

                {tracklist && <Button variant="success" size="lg" onClick={createPlaylistHandler} className="big-button" id="create-playlist-button">Create Playlist</Button>}
            </div>
          </div>
        }
  
        {/* Discogs search loading spinner */}
        { (isLoading) &&
          <LoadingSpinner text='Loading...' color='blue'/>
        }

        {/* Spotify Playlist Create status indicator */}
        { (spotifyIsCreating) &&
          <LoadingSpinner text='Creating Spotify Playlist...' color='green'/>
        }

        <br/>

        {/* Tracklist display */}
        { (tracklist && spotifyToken) &&
        <SortTypeContext.Provider value={sortType}>
          <Tracklist tracklist={tracklist}/>
        </SortTypeContext.Provider>
        }

      </div>
      
    </ThemeContext.Provider>


    
  )
}

export default App