import { Spinner } from "react-bootstrap";

function LoadingSpinner(props) {
    
    // default to blue spinner
    let type = 'primary'

    switch (props.color) {
        case 'green' : type = 'success'; break;
        case 'blue' : type = 'primary'; break;
        case 'yellow' : type = 'caution'; break;
        case 'red' : type = 'danger'; break;
        default: type = 'success'; break;
    }

    return(
        <div>
            <p className="text-centered color-white">{props.text}</p>
            <Spinner animation="border" variant={type} className="centered"/>
        </div>
    )
}

export default LoadingSpinner