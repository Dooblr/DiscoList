import { useCallback, useContext } from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import { SortTypeContext } from '../../App';
import './InputForm.css';

function InputForm(props){

  const {sortType, setSortType} = useContext(SortTypeContext)

  const dropdownHandler = useCallback(event => {
    setSortType(event.target.value)
    console.log(sortType)
  })

  // Search text input handler
  const searchInputHandler = useCallback(event => {
    props.searchInputHandler(event.target.value);
  }, [props.setLabelSearchInput])

  // Query Max handler
  const setQueryMaxHandler = useCallback(event => {
    props.setQueryMaxHandler(event.target.value)
  }, [props.setQueryMax])

  return(
      <div id="input-container">
        {/* Search text input */}
        <Form.Control 
            size="lg" 
            type="text" 
            placeholder="Enter a Record Label (e.g. Motown)"
            onChange={searchInputHandler}
            value={props.labelSearchInput}
            className="text-input text-center" 
          />
        
        <br/>

        <Row>
          <Col className="col-3">
            <Form.Label className="form-label">Sort by:</Form.Label>
          </Col>
          <Col className="col-9">
            <Form.Select 
                size="md" 
                className="form-select form-input" 
                onChange={dropdownHandler}>
              <option value="release_date_descending">Release Date (newest first)</option>
              <option value="release_date_ascending">Release Date (oldest first)</option>
              <option value="artist">Artist</option>
            </Form.Select>
          </Col>
        </Row>

        <br/>

        {/* Parameter inputs */}
        <Row>
          <Col className="col-3">
            <Form.Label className='form-label'>
              Max Results:
            </Form.Label>
          </Col>
          
          <Col className="col-9">
            <Form.Control 
              size="md" 
              type="number" pattern="\d*"
              placeholder="Max Results"
              onChange={setQueryMaxHandler}
              value={props.queryMax}
              className="text-center form-input"
              id="max-query-input"
            />
          </Col>
        </Row>

      </div>
  )
}

export default InputForm