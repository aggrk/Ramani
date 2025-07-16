import xss from "xss";

export function sanitizeObjects(obj) {
  for (let key in obj) {
    if (typeof obj[key] === "string") {
      obj[key] = xss(obj[key]);
    } else if (typeof obj[key] === "object" && obj[key] !== null) {
      sanitizeObjects(obj[key]);
    }
  }
}
