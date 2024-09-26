import React, { useEffect } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import moment from "moment";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useDispatch, useSelector } from "react-redux";
import { fetchBusinessDomains } from "../../store/plv2/businessDomain";
import { addEntity } from "../../store/plv2/entity";

const schema = yup.object().shape({
  name: yup.string().min(3).required(),
  domain: yup.string().required(),
  start_date: yup.date().required(),
  end_date: yup.date().required(),
});

const AddEntity = ({ show, handleClose }) => {
  const dispatch = useDispatch();
  const businessDomains = useSelector((state) => state.businessDomain.data);

  useEffect(() => {
    dispatch(fetchBusinessDomains());
  }, [dispatch]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      domain: "",
      start_date: new Date(),
      end_date: new Date(),
    },
  });

  const onSubmit = (data) => {
    data.start_date = moment(new Date(data.start_date).toDateString()).format(
      "YYYY-MM-01"
    );
    data.end_date = moment(new Date(data.end_date).toDateString()).format(
      "YYYY-MM-01"
    );

    dispatch(addEntity(data));
    handleClose();
    reset();
  };

  return (
    <Modal show={show} onHide={handleClose} size="l" centered>
      <Modal.Header closeButton>
        <Modal.Title>New Entity</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Form.Group className="mb-3">
            <Form.Label>Business Domain</Form.Label>
            <Controller
              name="domain"
              control={control}
              render={({ field }) => (
                <Form.Control
                  as="select"
                  {...field}
                  isInvalid={!!errors.domain}
                >
                  <option value="">Select Domain</option>
                  {businessDomains.map((domain) => (
                    <option key={domain.id} value={domain.id}>
                      {domain.name}
                    </option>
                  ))}
                </Form.Control>
              )}
            />
            <Form.Control.Feedback type="invalid">
              {errors.domain?.message}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Entity Name</Form.Label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Form.Control {...field} isInvalid={!!errors.name} />
              )}
            />
            <Form.Control.Feedback type="invalid">
              {errors.name?.message}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Start Date:</Form.Label>
            <Controller
              name="start_date"
              control={control}
              render={({ field }) => (
                <DatePicker
                  selected={field.value}
                  onChange={field.onChange}
                  dateFormat="MMM yyyy"
                  showMonthYearPicker
                />
              )}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>End Date:</Form.Label>
            <Controller
              name="end_date"
              control={control}
              render={({ field }) => (
                <DatePicker
                  selected={field.value}
                  onChange={field.onChange}
                  dateFormat="MMM yyyy"
                  showMonthYearPicker
                />
              )}
            />
          </Form.Group>

          <Button variant="primary" type="submit">
            Save
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddEntity;
