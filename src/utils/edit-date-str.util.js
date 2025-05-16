import moment from "moment";

function editDateStr({ dateStr }) {
  return moment(dateStr).fromNow();
}

export default editDateStr;
