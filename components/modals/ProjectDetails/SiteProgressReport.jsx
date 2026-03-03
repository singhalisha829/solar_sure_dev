import FormModal from "../../shared/FormModal";
import { dateFormat } from "@/utils/formatter";
import Image from "next/image";
import { BiSolidMoviePlay } from "react-icons/bi";
import { FaFilePdf, FaFileExcel, FaFileCsv } from "react-icons/fa6";
import { GrDocumentTxt, GrDocument } from "react-icons/gr";

const SiteProgressReport = ({ modalId, details, heading }) => {
  const imageExtensions = [".png", ".jpeg", ".jpg", ".gif", ".heic", ".heif"];
  const videoExtensions = [
    ".mp4",
    ".mov",
    ".avi",
    ".mkv",
    ".wmv",
    ".flv",
    ".hevc",
  ];

  const documentList =
    details?.file?.length > 0
      ? details.file
      : details?.file_attachments?.length > 0
        ? details.file_attachments
        : [];

  return (
    <FormModal id={modalId} heading={heading}>
      <span>
        <strong>Date: </strong>
        {dateFormat(details?.date)}
      </span>
      <div className="flex gap-1">
        <strong>Documents: </strong>
        <div className="flex flex-wrap gap-3">
          {documentList.length > 0
            ? documentList.map((fileElement, index) => {
                const splitUrl = fileElement.url.split(".");
                const extension = splitUrl[splitUrl.length - 1].toUpperCase();
                return (
                  <span
                    key={index}
                    className="cursor-pointer"
                    onClick={() => window.open(fileElement.url, "_blank")}
                  >
                    {imageExtensions.some((ext) =>
                      fileElement.url.endsWith(ext)
                    ) && (
                      <>
                        <Image
                          src={fileElement.url}
                          width={50}
                          height={50}
                          alt="image"
                          //   loader={imageLoader}
                        />
                        <p className="text-sm">{fileElement.file_name}</p>
                      </>
                    )}

                    {videoExtensions.some((ext) =>
                      fileElement.url.endsWith(ext)
                    ) && (
                      <>
                        <div className="relative border-1 w-[4rem] h-[4rem] flex justify-center items-center">
                          <BiSolidMoviePlay
                            size={60}
                            className="z-[-1] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-primary-light-10 text-4xl"
                          />
                          <p className="no-underline">{extension}</p>
                        </div>
                        <p className="text-sm">{fileElement.file_name}</p>
                      </>
                    )}
                    {!videoExtensions.some((ext) =>
                      fileElement.url.endsWith(ext)
                    ) &&
                      !imageExtensions.some((ext) =>
                        fileElement.url.endsWith(ext)
                      ) && (
                        <>
                          <div className="relative border-1 w-[4rem] h-[4rem] flex justify-center items-center">
                            {extension === "PDF" && (
                              <FaFilePdf
                                size={50}
                                className="z-[-1] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-primary-light-10 text-4xl"
                              />
                            )}
                            {(extension === "XLSX" || extension === "XLS") && (
                              <FaFileExcel
                                size={50}
                                className="z-[-1] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-primary-light-10 text-4xl"
                              />
                            )}
                            {extension === "CSV" && (
                              <FaFileCsv
                                size={50}
                                className="z-[-1] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-primary-light-10 text-4xl"
                              />
                            )}
                            {extension === "TXT" && (
                              <GrDocumentTxt
                                size={50}
                                className="z-[-1] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-primary-light-10 text-4xl"
                              />
                            )}
                            {!["PDF", "XLSX", "XLS", "CSV", "TXT"].includes(
                              extension
                            ) && (
                              <GrDocument
                                size={50}
                                className="z-[-1] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-primary-light-10 text-4xl"
                              />
                            )}
                            <p className="no-underline font-semibold ">
                              {extension}
                            </p>
                          </div>
                          <p className="text-sm">{fileElement.file_name}</p>
                        </>
                      )}
                  </span>
                );
              })
            : "--"}
        </div>
      </div>

      {/* display task list for site progress report */}
      {details?.task?.length > 0 && (
        <div>
          <table className="w-full overflow-scroll">
            <thead className="border-b-1">
              <tr>
                <th className="text-start w-[30%] pb-1">Task</th>
                <th className="text-start w-[70%] pb-1">Description</th>
              </tr>
            </thead>
            <tbody>
              {details.task.map((task, index) => {
                return (
                  <tr className={`border-b-1`} key={index}>
                    <td className="py-1">{task.task}</td>
                    <td>{task.descriptions}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* display single task and discription for installer remark */}
      <span>
        <strong>Task: </strong>
        {details?.task_name}
      </span>
      <span>
        <strong>Remark: </strong>
        {details?.descriptions}
      </span>
    </FormModal>
  );
};

export default SiteProgressReport;
