// this function returns failed message at first empty field
function checkSpecificKeys(obj, keys) {
  // Check if required fields are not empty
  for (const key in keys) {
    if (obj[key] !== 0 && !obj[key]) {
      return {
        isValid: false,
        message: `Field ${keys[key]} is empty!`,
      };
    }
  }

  return { isValid: true, message: "All fields are valid" };
}

// this function returns the list of all empty fields if any
function checkAllSpecificKeys(obj, keys) {
  let fieldError = { isValid: true, fields: {} };
  // Check if required fields are not empty
  for (const key in keys) {
    if (!obj[key]) {
      let invalidFields = fieldError.fields;
      fieldError = {
        isValid: false,
        fields: { ...invalidFields, [key]: `Field ${keys[key]} is empty!` },
      };
    }
  }

  return fieldError;
}

function formatKeyName(key) {
  // Replace underscores with spaces and split by space
  let words = key.replace(/_/g, " ").split(" ");

  // Convert camelCase to spaces
  if (words.length === 1) {
    words = words[0]
      .replace(/([A-Z])/g, " $1")
      .trim()
      .split(" ");
  }

  // Capitalize the first letter of each word
  return words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Validates fields of an object.
 *
 * @param {Object} obj - The object to validate.
 * @param {string[]} [keys] - An optional array of keys to check. If not provided, all keys in obj will be checked.
 * @returns {Object} An object with `isValid` indicating whether the validation passed and a `message` providing details.
 */
function validateObjectFields(obj, keys) {
  const checkKeys = keys || Object.keys(obj);

  for (const key of checkKeys) {
    if (!obj[key]) {
      const formattedKey = formatKeyName(key);
      return {
        isValid: false,
        message: `${formattedKey} is empty`,
      };
    }
  }

  return { isValid: true, message: "All fields are valid" };
}

/**
 * Deletes specified keys from an object.
 *
 * @param {Object} obj - The object from which keys will be deleted.
 * @param {string[]} keysToDelete - An array of keys to delete from the object.
 */
function sanitiseData(obj, keysToDelete) {
  for (const key of keysToDelete) {
    if (obj.hasOwnProperty(key)) {
      delete obj[key];
    }
  }
}

function checkPincodeValue(e) {
  const inputValue = e.target.value;
  const regex = /^[1-9][0-9]{0,5}$/;
  if (regex.test(inputValue) || inputValue === "") {
    return inputValue;
  }
}

function checkContactValue(e) {
  let value = e.target.value.replace(/[^\d]/g, "");
  const regex = /^\d*$/; // Accepts any numeric value
  if (value === "" || regex.test(value)) {
    e.target.value = value;
    return value;
  }
}

function checkContactField(e, maxLength = 10) {
  let value = e.target.value.replace(/[^\d]/g, "");

  // length check
  if (value.length > maxLength) {
    value = value.slice(0, maxLength);
  }

  e.target.value = value;
  return value;
}


export {
  checkSpecificKeys,
  checkAllSpecificKeys,
  validateObjectFields,
  sanitiseData,
  checkPincodeValue,
  checkContactValue,
  checkContactField
};
