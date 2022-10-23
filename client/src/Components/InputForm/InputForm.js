import { useCallback, useContext } from 'react';
import {Form, Row, Col} from 'react-bootstrap'
import './InputForm.css'
import { SortTypeContext } from '../../App';

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
      <div>
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
            <Form.Label>Sort by:</Form.Label>
          </Col>
          <Col className="col-9">
            <Form.Select 
                size="md" 
                className="form-select" 
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
            <Form.Label>
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
              className="text-center"
              id="max-query-input"
            />
          </Col>
        </Row>

      </div>
  )
}

export default InputForm