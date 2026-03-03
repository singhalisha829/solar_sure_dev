function convertToWords(number) {
  const roundedNumber = Math.round(number);

  const oneToTwenty = [
    "Zero",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];

  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  function convertBelowThousand(num) {
    if (num === 0) {
      return "";
    } else if (num < 20) {
      return oneToTwenty[num] + " ";
    } else if (num < 100) {
      return tens[Math.floor(num / 10)] + " " + convertBelowThousand(num % 10);
    } else {
      return (
        oneToTwenty[Math.floor(num / 100)] +
        " Hundred " +
        convertBelowThousand(num % 100)
      );
    }
  }

  function convert(num) {
    if (num === 0) {
      return "Zero";
    }

    let result = "";
    if (num >= 1e7) {
      result += convertBelowThousand(Math.floor(num / 1e7)) + "Crore ";
      num %= 1e7;
    }

    if (num >= 1e5) {
      result += convertBelowThousand(Math.floor(num / 1e5)) + "Lakh ";
      num %= 1e5;
    }

    if (num >= 1e3) {
      result += convertBelowThousand(Math.floor(num / 1e3)) + "Thousand ";
      num %= 1e3;
    }

    result += convertBelowThousand(num);

    const splitResult = result.split(" ");
    if (splitResult.includes("Hundred")) {
      const tempValue = result.split("Hundred");
      result = tempValue[0] + "Hundred and " + tempValue[1];
    } else if (splitResult.includes("Thousand")) {
      const tempValue = result.split("Thousand");
      result = tempValue[0] + "Thousand and " + tempValue[1];
    }

    if (result.trim() !== "Zero") {
      result += "Only";
    }

    return result.trim();
  }

  return convert(roundedNumber);
}

function addCommasToNumber(number) {
  if (number === "" || !number) {
    return 0;
  }
  // Use toLocaleString to add commas
  const numberWithCommas = Number(number)?.toLocaleString("en-IN") ?? "";

  return numberWithCommas;
}

function formatPrice(value) {
  if (value === "" || value === null || value === undefined) {
    return "";
  }
  // Round the value to 2 decimal places
  const roundedValue = Number(value).toFixed(2);

  // Split the rounded value into integer and decimal parts
  const [integerPart, decimalPart] = roundedValue.split(".");

  // Format the integer part with commas in Indian numbering system
  const formattedIntegerPart = Number(integerPart).toLocaleString("en-IN");

  // Combine the formatted integer part with the decimal part
  if (decimalPart == 0) {
    return `${formattedIntegerPart}`;
  } else {
    return `${formattedIntegerPart}.${decimalPart}`;
  }
}

function extractParts(value) {
  if (typeof value !== "string") {
    value = String(value); // Convert to string if it's not
  }

  const match = value.match(/([\d.]+)\s*(\w+)?/);
  return match ? { number: match[1], unit: match[2] || null } : null;
}

export { convertToWords, addCommasToNumber, formatPrice, extractParts };
