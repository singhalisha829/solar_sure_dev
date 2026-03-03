import ornateLogo from "@/public/ornateLogo.png";
import chevronDown from "@/public/chevronDown.png";
import dashboard from "@/public/dashboard.png";
import download from "@/public/download.png";
import employees from "@/public/employees.png";
import inbox from "@/public/inbox.png";
import logout from "@/public/logout.png";
import notifications from "@/public/notifications.png";
import profilePicture from "@/public/avatar.png";
import ornateWhite from "@/public/form/ornateWhite.png";
import chevronLeft from "@/public/form/chevronLeft.png";
import filter from "@/public/filter.png";
import search from "@/public/search.png";
import success from "@/public/success.png";
import handshake from "@/public/handshake.png";
import interview from "@/public/interview.png";
import jobs from "@/public/jobs.png";
import assets from "@/public/assets.png";
import createProject from "@/public/createProject.png";
import uploadFileIcon from "@/public/document-upload.svg";
import cross from "@/public/cross.svg";
import check from "@/public/check.svg";
import drawing from "@/public/drawing.png";
import document from "@/public/document.png";

const imageLoader = ({ src, width }) => {
  return `${src}?w=${width}&q=75`;
};

export {
  chevronDown,
  dashboard,
  download,
  employees,
  inbox,
  logout,
  notifications,
  ornateLogo,
  profilePicture,
  ornateWhite,
  chevronLeft,
  filter,
  search,
  success,
  handshake,
  interview,
  jobs,
  assets,
  imageLoader,
  createProject,
  uploadFileIcon,
  cross,
  check,
  drawing,
  document,
};
