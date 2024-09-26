/**
 * Retrieves the current entity from localStorage.
 * @returns {object} The current entity.
 */
export function getCurrentEntity() {
  const entity = window?.localStorage.getItem("entity");

  // Check if the retrieved entity is null or undefined
  if (entity == null) {
    // If no entity is stored, return an empty object
    return JSON.parse("{}");
  }

  // Parse the stored JSON string into an entity object
  return JSON.parse(entity.toString());
}

/**
 * Sets the current entity in localStorage.
 * @param {object} entity - The entity to be set.
 */
export function setCurrentEntity(entity) {
  window.localStorage.setItem("entity", JSON.stringify(entity));
}

/**
 * Retrieves the Integrated Model Versions (IMVs) for the current entity from localStorage.
 * @returns {Array} An array of IMVs for the current entity.
 */
export function getCurrentEntityIMVs() {
  // Check if the code is running in a browser environment
  if (typeof window !== "undefined") {
    // Retrieve IMVs from localStorage
    const imvs = window.localStorage.getItem("imvs");

    // Check if the retrieved value is null or undefined
    if (imvs == null) {
      // If no IMVs are stored, return an empty array
      return JSON.parse("[]");
    }

    // Parse the stored JSON string into an array
    return JSON.parse(imvs.toString());
  }
  // If not in a browser environment, return null or handle accordingly
  return null; // Adjust this based on your application's requirements
}

export function getActiveIMV() {
  // Assuming getCurrentEntity and getCurrentEntityIMVs return valid objects
  const entity = getCurrentEntity();
  const entityIMVs = getCurrentEntityIMVs();

  if (!entity || !Array.isArray(entityIMVs)) {
    // Handle the case where either entity is undefined or entityIMVs is not an array
    console.error("Unable to retrieve entity or entity IMVs.");
    return null; // or throw an error, depending on your use case
  }

  // Find the active IMV based on the entity's active_im_version
  const activeIMV = entityIMVs.find(
    (imv) => imv.id === entity.active_im_version
  );

  return activeIMV || null; // Return null if no active IMV is found
}

/**
 * Gets the CSS class based on a numeric value.
 * @param {number} val - The numeric value.
 * @param {string} cssClass - The base CSS class.
 * @returns {string} The computed CSS class.
 */
export const getValueCssClass = (val, cssClass) => {
  return val < 0 ? " text-red " + cssClass : cssClass;
};

/**
 * Displays error messages based on field validation.
 * @param {string} field - The field name.
 * @param {number} valueLen - The length of the field value.
 * @param {number} min - The minimum required length.
 * @returns {string} The error message or an empty string if no error.
 */
export const showErrors = (field, valueLen, min) => {
  if (valueLen === 0) {
    return `${field} field is required`;
  } else if (valueLen > 0 && valueLen < min) {
    return `${field} must be at least ${min} characters`;
  } else {
    return "";
  }
};
