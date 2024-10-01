// ** React Imports
import { useState, Fragment, useEffect } from "react";

// ** MUI Imports
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";

// ** Icon Imports
import Icon from "../icon";
import * as yup from "yup";
import PerfectScrollbarComponent from "react-perfect-scrollbar";

import moment from "moment";
import { useRouter } from "next/router";
import {
  getActiveIMV,
  getCurrentEntity,
  setCurrentEntity,
  showErrors,
} from "@/helpers/entitiyHelpers";
import { updateEntity } from "@/store/plv2/entity";
import { useDispatch } from "react-redux";
import { fetchIMVersions } from "@/store/plv2/imVersion";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormHelperText,
  Grid,
  TextField,
} from "@mui/material";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";
import { cloneIMV, deleteCloneIMV } from "@/store/plv2/imVersionClone";
import { ToastContainer, toast } from "react-toastify";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

const IMScenariosDropDown = (props) => {
  // ** Props
  const { settings, scenarios } = props;
  console.log(scenarios);
  const [initialScenarios, setInitialScenarios] = useState(scenarios);
  // console.log(initialScenarios, "inintal");
  const [show, setShow] = useState(false);
  const [deleteScenarioId, setDeleteScenarioId] = useState(null);
  const [deleteScenarioSource, setDeleteScenarioSource] = useState(null);
  const [deleteShow, setDeleteShow] = useState(false);
  const [deleteScenarioName, setDeleteScenarioName] = useState(null);
  const router = useRouter();

  const { query } = router;
  const dispatch = useDispatch();
  const entity = getCurrentEntity();
  const activeIMV = getActiveIMV();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ** States
  const [anchorEl, setAnchorEl] = useState(null);

  const handleDropdownOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleDropdownClose = (event) => {
    setAnchorEl(null);
  };
    const handleSwitchScenario = (event) => {
      setAnchorEl(null);
      entity.active_im_version = event.currentTarget.id;
      setCurrentEntity(entity);
      dispatch(updateEntity(entity));
      // router.replace(`/entities/${event.currentTarget.id}/dashboard/`);
      router.replace(router.pathname.replace("[slug]", event.currentTarget.id));
    };

  const defaultValues = {
    name: "",
  };

  const schema = yup.object().shape({
    name: yup
      .string()
      .min(3, (obj) => showErrors("name", obj.value.length, obj.min))
      .required(),
  });

    const handleSearchScenario = () => {
      // console.log(router)
      // console.log(query)
      entity.active_im_version = query.slug;
      setCurrentEntity(entity);
      dispatch(updateEntity(entity));
      // router.replace(`/entities/${entity.active_im_version}/dashboard/`);

      const entityRouteRegex = /^\/entities\/[a-zA-Z0-9-]+\/(.*)$/;
      const matches = router.pathname.match(entityRouteRegex);
      if (matches && matches.length > 1) {
        const subRoute = matches[1];
        router.replace(`/entities/${entity.active_im_version}/${subRoute}`);
      } else {
        // console.log("Invalid pathname format:", router.pathname);
        // Handle error or fallback behavior
      }

      dispatch(fetchIMVersions())
        .then((fetchResponse) => {
          // console.log("Fetch Response:", fetchResponse);
          setInitialScenarios(fetchResponse.payload);
        })
        .catch((fetchError) => {
          console.error("Fetch Error:", fetchError);
        });
    };

    useEffect(() => {
      handleSearchScenario();
    }, [query.slug]);

    const {
      control,
      handleSubmit,
      formState: { errors },
      reset,
    } = useForm({
      defaultValues: defaultValues,
      mode: "onChange",
      resolver: yupResolver(schema),
    });
    const onSubmit = (data) => {
      setIsSubmitting(true);
      dispatch(cloneIMV(data))
        .then((cloneResponse) => {
          // console.log("Clone Response:", cloneResponse);
          entity.active_im_version = cloneResponse?.payload?.new_imv_id;
          setCurrentEntity(entity);
          // router.replace(`/entities/${entity.active_im_version}/dashboard/`);
          router.replace(
            router.pathname.replace("[slug]", entity.active_im_version)
          );
          dispatch(updateEntity(entity));
          // console.log(entity)
          dispatch(fetchIMVersions())
            .then((fetchResponse) => {
              // Log fetchIMVersions response
              // console.log("Fetch Response:", fetchResponse);
              setInitialScenarios(fetchResponse.payload);
              setIsSubmitting(false);
            })
            .catch((fetchError) => {
              console.error("Fetch Error:", fetchError);
            });
        })
        .catch((cloneError) => {
          console.error("Clone Error:", cloneError);
        });
      setShow(false);
      reset();
      const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      sleep(3000);
    };

    const handleConfirmDelete = () => {
      if (deleteScenarioId && deleteScenarioSource) {
        dispatch(deleteCloneIMV({ deleteScenarioSource, deleteScenarioId }))
          .then((cloneResponse) => {
            // toast.success(`Scenario deleted`);
            // console.log("Clone Response:", cloneResponse);
            // entity.active_im_version = cloneResponse?.payload?.new_imv_id;
            // setCurrentEntity(entity);
            // dispatch(updateEntity(entity));
            dispatch(fetchIMVersions())
              .then((fetchResponse) => {
                // console.log("Fetch Response:", fetchResponse);
                setInitialScenarios(fetchResponse.payload);
                // window.location.reload();
              })
              .catch((fetchError) => {
                console.error("Fetch Error:", fetchError);
              });
          })
          .catch((deletecloneError) => {
            console.error("Delete Clone Error:", deletecloneError);
          });
        setDeleteShow(false);
      } else {
        // alert("Default can't be deleted")
        setDeleteShow(false);
        return;
      }
    };

  return (
    initialScenarios && (
      <Fragment>
        <Typography sx={{ cursor: "text", fontWeight: 600 }}>
          {entity?.name}
          {activeIMV &&
            `, ${
              activeIMV?.name.charAt(0).toUpperCase() + activeIMV?.name.slice(1)
            }`}
        </Typography>

        <IconButton
          color="inherit"
          aria-haspopup="true"
          onClick={handleDropdownOpen}
          aria-controls="customized-menu"
        >
          <Icon icon="mdi:chart-box-multiple-outline" />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleDropdownClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          <MenuItem
            disableRipple
            disableTouchRipple
            sx={{
              cursor: "default",
              userSelect: "auto",
              backgroundColor: "transparent !important",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
              }}
            >
              <Typography sx={{ cursor: "text", fontWeight: 600 }}>
                Scenarios
              </Typography>
            </Box>
          </MenuItem>
          <PerfectScrollbarComponent
            options={{ wheelPropagation: false, suppressScrollX: true }}
          >
            {initialScenarios
              .filter((scenario) => !scenario.is_deleted)
              .map((scenario, index) => (
                <MenuItem
                  key={index}
                  style={{
                    backgroundColor:
                      scenario.source && query.slug !== scenario.id
                        ? "transparent"
                        : "#f0f0f0",
                  }}
                >
                  <Box
                    onClick={handleSwitchScenario}
                    id={scenario.id}
                    sx={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {/* <RenderAvatar scenario={scenario} /> */}
                    <Box
                      sx={{
                        flex: "1 1",
                        display: "flex",
                        overflow: "hidden",
                        flexDirection: "column",
                      }}
                    >
                      <Typography>{scenario.name}</Typography>
                      <Typography>
                        created on{" "}
                        {moment(scenario.date).format("DD, MMM-YYYY")}
                      </Typography>
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{ color: "text.disabled" }}
                    ></Typography>
                  </Box>
                  {scenario.source && query.slug !== scenario.id && (
                    <Icon
                      onClick={() => {
                        setDeleteScenarioId(scenario.id);
                        setDeleteScenarioSource(scenario.source);
                        setDeleteScenarioName(scenario.name);
                        setDeleteShow(true);
                      }}
                      icon="mdi:delete"
                    />
                  )}
                </MenuItem>
              ))}
          </PerfectScrollbarComponent>

          <MenuItem
            disableRipple
            disableTouchRipple
            sx={{
              py: 3.5,
              borderBottom: 0,
              cursor: "default",
              userSelect: "auto",
              backgroundColor: "transparent !important",
              borderTop: (theme) => `1px solid ${theme.palette.divider}`,
            }}
          >
            <Button
              fullWidth
              variant="contained"
              onClick={() => setShow(true)}
              // onClick={handleDropdownClose}
            >
              New Scenario
            </Button>
          </MenuItem>

          <Dialog
            fullWidth
            open={show}
            maxWidth="sm"
            // scroll='body'
            onClose={(event, reason) => {
              if (reason !== "backdropClick") {
                setShow(false);
              }
            }}
          >
            <form onSubmit={handleSubmit(onSubmit)}>
              <DialogContent
                sx={{
                  pb: 8,
                  px: { xs: 8, sm: 15 },
                  pt: { xs: 8, sm: 12.5 },
                  position: "relative",
                }}
              >
                <IconButton
                  size="small"
                  onClick={() => setShow(false)}
                  sx={{ position: "absolute", right: "1rem", top: "1rem" }}
                >
                  <Icon icon="mdi:close" />
                </IconButton>
                <Box sx={{ mb: 8, textAlign: "center" }}>
                  <Typography variant="h5" sx={{ mb: 3 }}>
                    Creating New Scenario
                  </Typography>
                </Box>

                <Grid container spacing={5}>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <Controller
                        name="name"
                        control={control}
                        rules={{ required: true }}
                        render={({ field: { value, onChange } }) => (
                          <TextField
                            value={value}
                            label="Scenario Name"
                            onChange={onChange}
                            placeholder=""
                            error={Boolean(errors.name)}
                            aria-describedby="validation-schema-name"
                          />
                        )}
                      />
                      {errors.name && (
                        <FormHelperText
                          sx={{ color: "error.main" }}
                          id="validation-schema-name"
                        >
                          {errors.name.message}
                        </FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={12}>
                    <FormControl fullWidth>
                      <Box
                        sx={{ display: "flex", flexWrap: "wrap" }}
                        className="demo-space-x"
                      ></Box>
                    </FormControl>
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions
                sx={{ pb: { xs: 8, sm: 12.5 }, justifyContent: "center" }}
              >
                <Button variant="contained" type="submit" sx={{ mr: 1 }}>
                  Create
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => setShow(false)}
                >
                  Cancel
                </Button>
              </DialogActions>
            </form>
          </Dialog>

          <Dialog
            open={deleteShow}
            onClose={(event, reason) => {
              if (reason !== "backdropClick") {
                setDeleteShow(false);
              }
            }}
          >
            <DialogTitle>Confirmation</DialogTitle>

            <DialogContent>
              <DialogContentText>
                Are you sure you want to delete {deleteScenarioName} scenario?
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDeleteShow(false)}>Cancel</Button>
              <Button onClick={handleConfirmDelete} color="error">
                Delete
              </Button>
            </DialogActions>
          </Dialog>
        </Menu>
        {isSubmitting && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "rgba(255, 255, 255, 0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            Creating scenario...
          </div>
        )}
        <ToastContainer />
      </Fragment>
    )
  );
};

export default IMScenariosDropDown;
