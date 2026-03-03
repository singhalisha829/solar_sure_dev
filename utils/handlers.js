function handleKeyDown(e, handler) {
  if (e.key === "Escape") {
    handler();
  }
}

/**
 * Creates a handler function for updating specific fields in a state object.
 * This function is specifically tailored for name fields, validating input with a predefined regex pattern.
 *
 * @param {Function} setState - The setter function for updating the state.
 * @returns {Function} A function that handles input change events.
 */
const createTextUpdateHandler = (setState) => {
  const namePattern = /^[A-Za-z\s]+$/;

  return (key, event) => {
    const inputValue = event.target.value;

    if (namePattern.test(inputValue) || inputValue === "") {
      setState((prevState) => ({
        ...prevState,
        [key]: inputValue,
      }));
    }
  };
};

/**
 * Creates a handler function for updating mobile number fields in a state object.
 * This function validates the mobile number input with a predefined regex pattern.
 *
 * @param {Function} setState - The setter function for updating the state.
 * @returns {Function} A function that handles input change events for mobile numbers.
 */
const createMobileNumberUpdateHandler = (setState) => {
  const mobileNumberPattern = /^[6-9]\d*$/;

  return (key, event) => {
    let value = event.target.value.replace(/[^\d]/g, ""); // Remove non-numeric characters

    if (mobileNumberPattern.test(value) || value === "") {
      if (value.length > 10) {
        value = value.substring(0, 10); // Limit the length to 10 digits
      }

      setState((prevState) => ({
        ...prevState,
        [key]: value,
      }));
    }
  };
};

/**
 * Creates a handler function for email validation in a state object.
 * This function matches the email pattern with a predefined regex pattern.
 *
 * @param {Function} setState - The setter function for updating the state.
 * @returns {Function} A function that handles input change events for email.
 */
const createEmailUpdateHandler = (setState) => {
  return (key, event) => {
    let value = event.target.value;

    setState((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };
};

/**
 * Creates a handler function for handling file in a state object.
 *
 * @param {Function} setState - The setter function for updating the state.
 * @returns {Function} A function that handles file change events.
 */
const createFileUpdateHandler = (setState) => {
  return (key, event) => {
    let value = event.target.files[0];

    setState((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };
};

/**
 * Creates a handler function for handling file in a state object.
 *
 * @param {Function} setState - The setter function for updating the state.
 * @returns {Function} A function that handles file change events.
 */
const createInputUpdateHandler = (setState) => {
  return (key, event) => {
    let value = event.target.value;

    setState((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };
};

/**
 * Creates a handler function for handling file in a state object.
 *
 * @param {Function} setState - The setter function for updating the state.
 * @returns {Function} A function that handles file change events.
 */
const createValueUpdateHandler = (setState) => {
  return (key, value) => {
    setState((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };
};

export {
  handleKeyDown,
  createTextUpdateHandler,
  createMobileNumberUpdateHandler,
  createEmailUpdateHandler,
  createFileUpdateHandler,
  createInputUpdateHandler,
  createValueUpdateHandler,
};
