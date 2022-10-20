import '../../App.css'
import {Button} from 'react-bootstrap'
import { useState, useCallback } from 'react'
import useAsyncEffect from 'use-async-effect'

function SpotifyLogoutBox(props) {

    const [spotifyUsername, setSpotifyUsername] = useState('')

    const logoutHandler = useCallback(event => {
        props.getSpotifyTokenFromWindow()
        window.localStorage.removeItem("token")
        alert('You have been logged out of Spotify')
        window.location.reload()
    })

    useAsyncEffect(async () => {

        // props.getSpotifyTokenFromWindow()
        if (props.spotifyToken) {
          let userName = await props.getUserID("full")
          setSpotifyUsername(userName.display_name)
        }
      }, [props.spotifyToken])

    return(
        <div className="text-center spotify-login-container">
            <div>
                <h6 id="logged-in-text">Logged into Spotify as</h6>
                {typeof spotifyUsername == 'string' &&
                <h6>{spotifyUsername}</h6>
                }
            </div>
            {/* <div className="spacer"/> */}
            <Button variant="danger" size="sm" onClick={logoutHandler} id="spotify-logout-button">Log out</Button>
        </div>
    )
}

export default SpotifyLogoutBox