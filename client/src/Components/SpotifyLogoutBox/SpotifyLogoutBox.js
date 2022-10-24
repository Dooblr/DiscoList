import {Button} from 'react-bootstrap'
import { useState } from 'react'
import useAsyncEffect from 'use-async-effect'
import {toastDarkStyle} from '../../Utils'
import {toast} from 'react-hot-toast'

function SpotifyLogoutBox(props) {

  const [spotifyUsername, setSpotifyUsername] = useState('')

  function logoutHandler(option) {
      props.getSpotifyTokenFromWindow()
      window.localStorage.removeItem("token")
      if (option === 'token-expired') {
        toast.alert('Please login to Spotify', {
          icon:'⚠️',
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          }
        })
      } else {
        toast.success('Logging out of Spotify', toastDarkStyle)
      }
      setTimeout(() => {
        console.log("Delayed for 5 seconds.");
        window.location.reload()
      }, 2000)
  }

  useAsyncEffect(async () => {
      const userName = await props.getUserID("full").catch(error => {
        logoutHandler('token-expired')
      })
      setSpotifyUsername(userName.display_name)
    }, [props.spotifyToken])

  return(
      <div className="text-center spotify-login-container">
          <div>
              <h6 id="logged-in-text">Logged into Spotify as</h6>
              <h6>{spotifyUsername || "no username"}</h6>
          </div>
          <Button variant="danger" size="sm" onClick={logoutHandler} id="spotify-logout-button">Log out</Button>
      </div>
  )
}

export default SpotifyLogoutBox