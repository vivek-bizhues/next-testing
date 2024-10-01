import React, { useState, useEffect, forwardRef } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { createOrUpdateCoAData } from "../../../store/plv2/coa";

const DatePickerCustomInput = forwardRef((props, ref) => (
  <Form.Control {...props} ref={ref} placeholder="Purchase Date" />
));
DatePickerCustomInput.displayName = "DatePickerCustomInput";

export default function CRUDCoA(props) {
  const dispatch = useDispatch();
  const [coa, setCoa] = useState(props.coa);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setCoa((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    dispatch(
      createOrUpdateCoAData({
        ...coa,
        search: props.search,
        page_size: props.pageSize,
      })
    );
    props.handleOnSave(e);
  };

  useEffect(() => {
    setCoa(props.coa);
  }, [props.coa]);

  return (
    <Modal show={props.show} onHide={props.handleOnClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{props.mode} Account</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row className="mb-3">
            <Col xs={12}>
              <Form.Group controlId="formGridCategory">
                <Form.Label>Category</Form.Label>
                <Form.Select
                  name="category"
                  value={coa?.category.toString()}
                  onChange={handleInputChange}
                >
                  {props.coaOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col xs={12}>
              <Form.Group controlId="formGridName">
                <Form.Label>Chart of Account Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Insurance or Tax"
                  name="name"
                  value={coa?.name || ""}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={props.handleOnCancel}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
