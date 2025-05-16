import { BACKEND_URL } from "#@/config/config.js";
import editDateStr from "#@/utils/edit-date-str.util.js";

function postEditor({ post }) {
  return {
    ...post,
    imageUrl: BACKEND_URL + post.imageUrl,
    createdAt: editDateStr({ dateStr: post.createdAt }),
  };
}

export default postEditor;
