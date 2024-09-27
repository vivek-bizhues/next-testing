import React, { useContext, useEffect, useState } from "react";
import Header from "../layouts/Header";
import { useDispatch, useSelector } from "react-redux";
import { deleteEntity, fetchEntities } from "../store/plv2/entity";
import { fetchIMVersions } from "../store/plv2/imVersion";
import { getCurrentEntity, setCurrentEntity } from "../helpers/entitiyHelpers";
import {
  Card,
  Col,
  Row,
  Dropdown,
  Button,
  Modal,
  Badge,
} from "react-bootstrap";
import { useRouter } from "next/router"; // Import useRouter from Next.js
import AddEntity from "../components/entities/AddEntity";
import EditEntityForm from "../components/entities/EditEntity"; // Import the Edit Form
import { UserContext } from "../context/UserContext";

export default function Entities() {
  const dispatch = useDispatch();
  const store = useSelector((state) => state.entity);
  const [isLoading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [showAddEntity, setShowAddEntity] = useState(false);
  const currentEntity = getCurrentEntity();
  const { logout } = useContext(UserContext);
  const router = useRouter(); // Use Next.js router

  useEffect(() => {
    const profile = localStorage.getItem("userProfile");
    const token = localStorage.getItem("authToken");

    // Check if profile and token are available
    if (!profile || !token) {
      logout();
      return; // Exit if there's no profile or token
    }

    // Parse profile only if it exists
    const parsedProfile = JSON.parse(profile);
    if (!parsedProfile) {
      logout();
    }

    // Fetch entities if the user is authenticated
    const fetchData = async () => {
      setLoading(true);
      try {
        await dispatch(fetchEntities());
      } catch (error) {
        console.error("Failed to fetch entities:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dispatch, logout]);

  const handleEditClick = (entity) => {
    setCurrentEntity(entity); // Set the entity to be edited
    setIsEditOpen(true); // Open the edit modal
  };

  const handleCloseEditModal = () => {
    setIsEditOpen(false);
  };

  const handleLeaveProject = (item) => {
    if (item) {
      setDeleteDialogOpen(true);
      setCurrentEntity(item);
    }
  };

  const deleteProject = () => {
    dispatch(deleteEntity(currentEntity.id)); // Pass the entity ID for deletion
    setDeleteDialogOpen(false);
  };

  return (
    <React.Fragment>
      <div className="main main-app p-3 p-lg-4">
        <div className="d-md-flex align-items-center justify-content-between mb-4">
          <div>
            <h4 className="main-title mb-0">Entities</h4>
          </div>
          <div>
            <Button
              variant="primary"
              size="lg"
              onClick={() => setShowAddEntity(true)}
            >
              + CREATE
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center">Loading...</div>
        ) : (
          <Row className="g-4">
            {store?.data?.map((company) => (
              <Col key={company.id} sm={12} md={6} lg={4}>
                <Card className="h-100 shadow-sm border-light">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <Card.Title
                        className="mb-0"
                        style={{ cursor: "pointer" }}
                        onClick={(e) => {
                          setCurrentEntity(company);
                          dispatch(fetchIMVersions()).then(() => {
                            router.push(
                              `/entities/${company.active_im_version}/dashboard`
                            ); // Use Next.js router
                          });
                        }}
                      >
                        <strong>{company.name}</strong>
                      </Card.Title>

                      <Dropdown>
                        <Dropdown.Toggle
                          as="div" // Use a custom element instead of Button
                          variant="link"
                          className="p-0 border-0 shadow-none custom-dropdown-toggle" // Custom class to apply specific styles
                        >
                          ⋮
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          <Dropdown.Item
                            onClick={() => handleEditClick(company)}
                          >
                            Edit
                          </Dropdown.Item>
                          <Dropdown.Item
                            onClick={() => handleLeaveProject(company)}
                          >
                            Delete
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </div>
                    <Card.Text>
                      <div style={{ marginTop: "-20px" }}>
                        <Badge bg="secondary" pill>
                          {company.domain}
                        </Badge>
                      </div>
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        <Modal
          show={deleteDialogOpen}
          onHide={() => setDeleteDialogOpen(false)}
        >
          <Modal.Header closeButton>
            <Modal.Title>Confirm Delete</Modal.Title>
          </Modal.Header>
          <Modal.Body>Are you sure you want to delete this entity?</Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={deleteProject}>
              Delete
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Add Entity Modal */}
        <AddEntity
          show={showAddEntity}
          handleClose={() => setShowAddEntity(false)}
        />

        {/* Edit Entity Modal */}
        {currentEntity && (
          <EditEntityForm
            isOpen={isEditOpen}
            onClose={handleCloseEditModal}
            entity={currentEntity} // Pass the selected entity to the form
          />
        )}
      </div>
    </React.Fragment>
  );
}
