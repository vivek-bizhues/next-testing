/**
 * Retrieves the current entity from localStorage.
 * @returns {object} The current entity.
 */
export function getCurrentEntity() {
  if (typeof window !== "undefined") { // Ensure we're in a client-side environment
    const entity = window.localStorage.getItem("entity");

    // Check if the retrieved entity is null or undefined
    return entity ? JSON.parse(entity) : {}; // Return an empty object if no entity is stored
  }
  return {}; // Return an empty object for server-side
}

/**
 * Sets the current entity in localStorage.
 * @param {object} entity - The entity to be set.
 */
export function setCurrentEntity(entity) {
  if (typeof window !== "undefined") { // Ensure we're in a client-side environment
    window.localStorage.setItem("entity", JSON.stringify(entity));
  }
}

/**
 * Retrieves the Integrated Model Versions (IMVs) for the current entity from localStorage.
 * @returns {Array} An array of IMVs for the current entity.
 */
export function getCurrentEntityIMVs() {
  if (typeof window !== "undefined") { // Ensure we're in a client-side environment
    const imvs = window.localStorage.getItem("imvs");
    return imvs ? JSON.parse(imvs) : []; // Return an empty array if no IMVs are stored
  }
  return []; // Return an empty array for server-side
}

/**
 * Finds the active Integrated Model Version (IMV).
 * @returns {object|null} The active IMV or null if not found.
 */
export function getActiveIMV() {
  const entity = getCurrentEntity();
  const entityIMVs = getCurrentEntityIMVs();

  if (!entity || !Array.isArray(entityIMVs)) {
    console.error("Unable to retrieve entity or entity IMVs.");
    return null; // Return null if retrieval fails
  }

  // Find the active IMV based on the entity's active_im_version
  return entityIMVs.find((imv) => imv.id === entity.active_im_version) || null; // Return null if no active IMV is found
}

/**
 * Gets the CSS class based on a numeric value.
 * @param {number} val - The numeric value.
 * @param {string} cssClass - The base CSS class.
 * @returns {string} The computed CSS class.
 */
export const getValueCssClass = (val, cssClass) => {
  return val < 0 ? `text-red ${cssClass}` : cssClass; // Use template literals for cleaner string concatenation
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
    return `${field} field is required`; // Use template literals for cleaner string formatting
  } else if (valueLen > 0 && valueLen < min) {
    return `${field} must be at least ${min} characters`;
  } else {
    return ""; // Return an empty string if no error
  }
};
