function slugify(text) {
  return text
    .toString()
    .toLowerCase() // Convert to lowercase
    .trim() // Remove surrounding whitespace
    .replace(/[\s\W-]+/g, "-") // Replace spaces and non-word characters with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading and trailing hyphens
}

export default slugify;
