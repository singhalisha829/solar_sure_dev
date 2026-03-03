const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function dateFormat(dateStr) {
  if (!dateStr || dateStr === "") return "";
  const date = new Date(dateStr);
  const day = date.getDate().toString().padStart(2, "0");
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear().toString();
  return `${day} ${month} ${year}`;
}

function dateFormatFromMMDDYYY(dateStr) {
  // Split the input string by "-"
  const [day, month, year] = dateStr.split("-");

  // Convert month number to month name (subtract 1 since months array is 0-based)
  const monthName = monthNames[parseInt(month, 10) - 1];

  // Return the formatted string
  return `${day} ${monthName} ${year}`;
}

function convertUnixTimestamp(unixTimestamp) {
  // Convert Unix timestamp to milliseconds
  const date = new Date(unixTimestamp * 1000);

  // Extract day, month, and year
  const day = date.getDate();
  const monthName = monthNames[date.getMonth()];
  const year = date.getFullYear();

  // Return the formatted string
  return `${day} ${monthName} ${year}`;
}

function dateFormatInYYYYMMDD(date) {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Adding 1 to month since it's zero-based
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function apiDateFormat(date) {
  const formattedDate = new Date(date);
  return formattedDate.toISOString().split("T")[0];
}

function dateFormatWithoutYear(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const day = date.getDate().toString().padStart(2, "0");
  const month = monthNames[date.getMonth()];
  return `${day} ${month}`;
}

function capitalizeFirstLetter(string) {
  return string?.replace(/\b\w/g, (char) => char.toUpperCase());
}

function getStatusInTimeline(startDate, endDate) {
  const currentDate = new Date();
  const startDateTime = new Date(startDate).getTime();
  const endDateTime = new Date(endDate).getTime();
  const currentDateTime = currentDate.getTime();

  if (currentDateTime < startDateTime) {
    return "In Progress";
  } else if (
    currentDateTime >= startDateTime &&
    currentDateTime <= endDateTime
  ) {
    return "In Progress";
  } else {
    return "Completed";
  }
}
export {
  dateFormat,
  capitalizeFirstLetter,
  dateFormatWithoutYear,
  apiDateFormat,
  getStatusInTimeline,
  dateFormatInYYYYMMDD,
  dateFormatFromMMDDYYY,
  convertUnixTimestamp,
};
