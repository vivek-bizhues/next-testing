import React, { useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import moment from "moment";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { updateEntity } from "../../store/plv2/entity";
import { fetchBusinessDomains } from "../../store/plv2/businessDomain";

// Validation schema
const schema = yup.object().shape({
  name: yup.string().min(3).required(),
  domain: yup.string().required(),
  start_date: yup.date().required(),
  end_date: yup.date().required(),
});

const EditEntityForm = ({ isOpen, onClose, entity }) => {
  const dispatch = useDispatch();
  const businessDomains = useSelector((state) => state.businessDomain.data);

  // Load business domains
  useEffect(() => {
    dispatch(fetchBusinessDomains());
  }, [dispatch]);

  // Use react-hook-form for managing form state
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  // Update form values when entity changes
  useEffect(() => {
    if (entity) {
      reset({
        name: entity.name || "",
        domain: entity.domain || "",
        start_date: entity.start_date ? new Date(entity.start_date) : new Date(),
        end_date: entity.end_date ? new Date(entity.end_date) : new Date(),
      });
    }
  }, [entity, reset]);

  // Handle form submission
  const onSubmit = async (data) => {
    data.start_date = moment(new Date(data.start_date).toDateString()).format(
      "YYYY-MM-01"
    );
    data.end_date = moment(new Date(data.end_date).toDateString()).format(
      "YYYY-MM-01"
    );

    const updatedEntity = {
      ...entity,
      ...data,
    };

    await dispatch(updateEntity(updatedEntity));
    onClose(); // Close the modal after updating
    reset();
  };

  return (
    <Modal show={isOpen} onHide={onClose} size="l" centered>
      <Modal.Header closeButton>
        <Modal.Title>Edit Entity</Modal.Title>
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

export default EditEntityForm;
