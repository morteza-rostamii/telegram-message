import editDateStr from "#@/utils/edit-date-str.util.js";

function commentEditor({ comment }) {
  return {
    ...comment,
    createdAt: editDateStr({ dateStr: comment.createdAt }),
  };
}

export default commentEditor;
