import { BACKEND_URL } from "#@/config/config.js";

function subredditEditor(subreddit) {
  return {
    ...subreddit,
    image: BACKEND_URL + subreddit.image,
  };
}

export default subredditEditor;
