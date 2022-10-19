import {Form, Row, Col} from 'react-bootstrap'

function InputForm(props){

    return(
        <div>
              <Form.Control 
                  size="lg" 
                  type="text" 
                  placeholder="Enter a Record Label (e.g. Motown)"
                  onChange={props.searchInputHandler}
                  value={props.labelSearchInput}
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
                    onChange={props.setQueryMaxHandler}
                    value={props.queryMax}
                    className="text-center"
                    id="max-query-input"
                  />
                </Col>
              </Row>

            </div>
    )
}

export default InputForm