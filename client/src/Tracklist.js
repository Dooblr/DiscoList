import { ListGroup, Form } from 'react-bootstrap'

function Tracklist(props) {
    return(
        <ListGroup className="tracklist">
            {props.tracklist.map((track) => {
                return <ListGroup.Item key={track} className="tracklist-item">
                    <Form.Text muted>Artist: </Form.Text> {track.artist} 
                    <br/>
                    <Form.Text muted>Track: </Form.Text> {track.trackTitle}
                    <br/>
                    <Form.Text muted>Release: </Form.Text> {track.releaseTitle}
                </ListGroup.Item>
            })}
        </ListGroup>
    )
    
}

export default Tracklist