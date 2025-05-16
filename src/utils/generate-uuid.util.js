import uuid4 from "uuid4";

function generateUUID(size = 6) {
  return uuid4().slice(0, size);
}

export default generateUUID;
