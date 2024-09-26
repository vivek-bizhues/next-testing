import { useState, forwardRef } from "react";
import React from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Select from "@mui/material/Select";
import Dialog from "@mui/material/Dialog";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import Fade from "@mui/material/Fade";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";
import Icon from "../../../components/icon";
import { useDispatch, useSelector } from "react-redux";
import { FormHelperText } from "@mui/material";
import { addDashboardCharts } from "../../../store/plv2/dashboardChart";

const Transition = forwardRef(function Transition(props, ref) {
  return <Fade ref={ref} {...props} />;
});

const AddDashboardChart = () => {
  const dispatch = useDispatch();

  const [show, setShow] = useState(false);
  const modelStructure = useSelector((state) => state.imTemplate.data);

  const [selectedFormulas, setSelectedFormulas] = useState([]);

  // Function to handle checkbox change
  const handleCheckboxChange = (sectionName, groupName, formulaName) => {
    const path = `${sectionName}.${groupName}.${formulaName}`;

    const existingFormula = selectedFormulas.find(
      (item) => item.formula === path
    );

    if (!existingFormula) {
      setSelectedFormulas([
        ...selectedFormulas,
        { formula: path, color: "#000000" },
      ]);
    } else {
      const updatedFormulas = selectedFormulas.filter(
        (item) => item.formula !== path
      );
      setSelectedFormulas(updatedFormulas);
    }
  };

  const handleColorChange = (event, path) => {
    const updatedFormulas = selectedFormulas.map((item) =>
      item.formula === path ? { ...item, color: event.target.value } : item
    );
    setSelectedFormulas(updatedFormulas);
  };

  const defaultValues = {
    title: "",
    chart_type: "",
    data_series: [],
  };

  const showErrors = (field, valueLen, min) => {
    if (valueLen === 0) {
      return `${field} field is required`;
    } else if (valueLen > 0 && valueLen < min) {
      return `${field} must be at least ${min} characters`;
    } else {
      return "";
    }
  };

  const schema = yup.object().shape({
    title: yup
      .string()
      .min(3, (obj) => showErrors("name", obj.value.length, obj.min))
      .required(),
    chart_type: yup.string().required(),
  });

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
    data.data_series = selectedFormulas;
    console.log(data, "datta");
    dispatch(addDashboardCharts(data));
    setShow(false);
    reset();
    setSelectedFormulas([]);
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    sleep(3000);
  };

  return (
    <>
      <Button
        sx={{ mb: 2, height: 30 }}
        onClick={() => setShow(true)}
        startIcon={<Icon icon="mdi:plus" />}
        variant="contained"
      >
        Add
      </Button>
      <Dialog
        fullWidth
        open={show}
        maxWidth="sm"
        onClose={(event, reason) => {
          if (reason !== "backdropClick") {
            setShow(false);
          }
        }}
        TransitionComponent={Transition}
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
                New Chart
              </Typography>
            </Box>

            <Grid container spacing={5}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <Controller
                    name="title"
                    control={control}
                    rules={{ required: true }}
                    render={({ field: { value, onChange } }) => (
                      <TextField
                        value={value}
                        label="Title"
                        onChange={onChange}
                        placeholder=""
                        error={Boolean(errors.title)}
                        aria-describedby="validation-schema-name"
                      />
                    )}
                  />
                  {errors.title && (
                    <FormHelperText
                      sx={{ color: "error.main" }}
                      id="validation-schema-name"
                    >
                      {errors.title.message}
                    </FormHelperText>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={12}>
                <FormControl fullWidth>
                  <InputLabel
                    id="validation-domain"
                    error={Boolean(errors.chart_type)}
                    htmlFor="validation-domain"
                  >
                    Chart Type
                  </InputLabel>
                  <Controller
                    name="chart_type"
                    control={control}
                    rules={{ required: true }}
                    render={({ field: { value, onChange } }) => (
                      <Select
                        value={value}
                        label="Chart Type"
                        onChange={onChange}
                        error={Boolean(errors.chart_type)}
                        labelId="validation-domain"
                        aria-describedby="validation-domain"
                      >
                        <MenuItem value="LINE">Line</MenuItem>
                        <MenuItem value="COLUMN">Bar</MenuItem>
                      </Select>
                    )}
                  />
                  {errors.chart_type && (
                    <FormHelperText
                      sx={{ color: "error.main" }}
                      id="validation-domain"
                    >
                      This field is required
                    </FormHelperText>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={12}>
                {Object.entries(modelStructure).map(
                  ([sectionName, section]) => (
                    <React.Fragment key={sectionName}>
                      <Typography variant="h6">
                        {section.__attrs.name}
                      </Typography>
                      {Object.entries(section).map(
                        ([groupName, group]) =>
                          groupName !== "__attrs" && (
                            <React.Fragment key={groupName}>
                              <Typography variant="subtitle1">
                                {group.__attrs.name}
                              </Typography>
                              {Object.entries(group).map(
                                ([formulaName, formula]) =>
                                  formulaName !== "__attrs" && (
                                    <div
                                      key={formula.id}
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                      }}
                                    >
                                      <FormControlLabel
                                        control={
                                          <Checkbox
                                            checked={selectedFormulas.some(
                                              (item) =>
                                                item.formula ===
                                                `${sectionName}.${groupName}.${formulaName}`
                                            )}
                                            onChange={() =>
                                              handleCheckboxChange(
                                                sectionName,
                                                groupName,
                                                formulaName
                                              )
                                            }
                                            color="primary"
                                          />
                                        }
                                        label={formula.name}
                                      />
                                      {selectedFormulas.some(
                                        (item) =>
                                          item.formula ===
                                          `${sectionName}.${groupName}.${formulaName}`
                                      ) && (
                                        <input
                                          type="color"
                                          value={
                                            selectedFormulas.find(
                                              (item) =>
                                                item.formula ===
                                                `${sectionName}.${groupName}.${formulaName}`
                                            )?.color || "#000000"
                                          }
                                          onChange={(e) =>
                                            handleColorChange(
                                              e,
                                              `${sectionName}.${groupName}.${formulaName}`
                                            )
                                          }
                                          style={{ marginLeft: "1rem" }}
                                        />
                                      )}
                                    </div>
                                  )
                              )}
                            </React.Fragment>
                          )
                      )}
                    </React.Fragment>
                  )
                )}
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
    </>
  );
};

export default AddDashboardChart;
