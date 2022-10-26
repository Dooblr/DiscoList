import {Button} from 'react-bootstrap'
import { useEffect, useState } from 'react'
import useAsyncEffect from 'use-async-effect'
import {toastDarkStyle} from '../../Utils'
import {toast} from 'react-hot-toast'

function SpotifyLogoutBox(props) {

  const [spotifyUsername, setSpotifyUsername] = useState('')

  function logoutHandler(option) {
      props.getSpotifyTokenFromWindow()
      window.localStorage.removeItem("token")
      if (option === 'token-expired') {
        toast('Spotify token expired. Please log in again.', {
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
        window.location.reload()
      }, 2000)
  }

  useEffect(()=>{
    /* Wait 2 seconds after load and if username has not been set yet 
      this means that the token has expired; force logout and reload page.*/
    // setTimeout(() => {
    if (typeof spotifyUsername === undefined) {
      logoutHandler('token-expired')
    }
    // }, 2000);
  },[spotifyUsername])

  useAsyncEffect(async () => {
    const userName = await props.getUserID("full") // catching this was not working for checking token validity
    // .catch(error => {
    //   logoutHandler('token-expired')
    // })
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