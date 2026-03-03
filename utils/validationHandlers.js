function checkSpecificKeys(obj, keys) {
  return keys.some((key) => obj[key] == null || obj[key] === "");
}

export { checkSpecificKeys };
