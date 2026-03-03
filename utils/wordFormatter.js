function convertToTitleCase(input) {
  if (!input) return "";

  return input
    .split("_") // Split the string by underscores
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize each word
    .join(" "); // Join the words with a space
}

export { convertToTitleCase };
