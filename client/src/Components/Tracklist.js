import { useContext } from 'react'
import { ListGroup, Form } from 'react-bootstrap'
import { SortTypeContext } from '../App'

function Tracklist(props) {

    const sortType = useContext(SortTypeContext)
    
    let sortedTracklist
    switch (sortType) {
        case "release_date_descending" : sortedTracklist = props.tracklist.sort( (a,b)=> a.year < b.year ? 1 : -1 ) ; break;
        case "release_date_ascending" : sortedTracklist = props.tracklist.sort( (a,b)=> a.year > b.year ? 1 : -1 ) ; break;
        case "artist" : sortedTracklist = props.tracklist.sort( (a,b)=> a.artist > b.artist ? 1 : -1 ) ;  break;
        default: sortedTracklist = props.tracklist.sort( (a,b)=> a.year < b.year ? 1 : -1 ) ; break;
    }

    return(
        <ListGroup className="tracklist">
            {sortedTracklist
                .map((track) => {
                    return <ListGroup.Item key={track} className="tracklist-item">
                        <Form.Text muted>Artist: </Form.Text> {track.artist} 
                        <br/>
                        <Form.Text muted>Track: </Form.Text> {track.trackTitle}
                        <br/>
                        <Form.Text muted>Release: </Form.Text> {track.releaseTitle}
                        <br/>
                        <Form.Text muted>Year: </Form.Text> {track.year}
                    </ListGroup.Item>
            })}
        </ListGroup>
    )
    
}

export default Tracklist