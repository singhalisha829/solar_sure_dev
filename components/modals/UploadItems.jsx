import { useModal } from "@/contexts/modal";
import { uploadFileIcon } from "@/utils/images";
import Image from "next/image";
import { useState } from "react";
import { FileUploader } from "react-drag-drop-files";
import { BiTrash, BiUpload } from "react-icons/bi";
import Modal from "../shared/Modal";
import { LuFile } from "react-icons/lu";
import { Progress } from "../shared/Progress";
import axios from "axios";
import { cn } from "@/utils/utils";
import { axiosInstance } from "@/services/ApiHandler";
import Button from "../shared/Button";
import { toast } from "sonner";
import { useProject } from "@/contexts/project";

const fileTypes = ["csv"];

const UploadItems = ({ id, name }) => {
  const { getProjectDetailsHandler, projectId } = useProject();
  const { openModal, closeModal } = useModal();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [file, setFile] = useState();
  const [uploadError, setUploadError] = useState(false);
  const handleChange = async (file) => {
    setFile(file);
    // get the selected file from the input
    // create a new FormData object and append the file to it
    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploadProgress(0);
      const { data } = await axiosInstance.post(
        `api/project/bom-items-upload/?project=${projectId}`,
        formData,
        {
          onUploadProgress: (progressEvent) => {
            const percentage = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentage);
          },
        }
      );
      if (data.status.code < 400) {
        toast.success("Items Uploaded Successfully...");
        setUploadError(false);
      } else {
        setUploadProgress(0);
        toast.error("Error Uploading Items...");
      }
      // Handle success, e.g., update UI or trigger other actions
    } catch (error) {
      setUploadError(true);
      // Handle error, e.g., display an error message
    }
  };
  return (
    <div className="">
      <Modal
        id={id}
        heading={"Upload"}
        onClose={async () => {
          setFile(null);
          setUploadProgress(0);
          await getProjectDetailsHandler();
        }}
      >
        <FileUploader handleChange={handleChange} name="file" types={fileTypes}>
          <div className=" w-full h-[170px] flex flex-col gap-3 justify-center items-center rounded border-2 border-stone-300 border-dashed border-spacing-3 cursor-pointer">
            <div className="bg-orange-500/10 rounded-md w-12 h-12 flex items-center justify-center">
              <Image alt="" src={uploadFileIcon} height={24} width={24} />
            </div>
            <div className="flex flex-col gap-1 text-center">
              <p className=" text-neutral-700 text-sm font-medium">
                <span className="text-primary">Click to Upload</span> or drag
                and drop
              </p>
              <p className="text-neutral-700 text-xs font-normal">
                (Max. File size: 25 MB)
              </p>
            </div>
          </div>
        </FileUploader>
        {file && (
          <div className="border-stone-300 border rounded-md bg-white p-4 flex gap-3">
            <div>
              <LuFile className="text-neutral-700" size={20} />
            </div>
            <div className="grow flex flex-col gap-1.5">
              {uploadError && (
                <p className="text-red-700 text-sm font-medium leading-tight">
                  Upload failed, please try again
                </p>
              )}

              <p
                className={cn(
                  "text-neutral-700 text-sm font-medium leading-tight",
                  uploadError && "text-red-700"
                )}
              >
                {file?.name}
              </p>
              {!uploadError && (
                <p className="text-stone-400 text-xs font-normal leading-tight">
                  {Math.round(file.size / 1024)} kb
                </p>
              )}
              {/* {uploadProgress === 100 && !uploadError && (
                <p className="text-primary text-sm font-semibold leading-tight">
                  Click to view
                </p>
              )} */}
              {uploadProgress !== 100 && !uploadError && (
                <div className="flex gap-1.5 items-center">
                  <Progress
                    className={cn("grow", uploadError && "bg-red-500")}
                    value={uploadProgress}
                  />
                  <span className="shrink-0 text-neutral-700 text-xs font-medium leading-tight">
                    {uploadProgress} %
                  </span>
                </div>
              )}
            </div>
            <button className="max-w-fit max-h-fit items-start p-1.5 self-start">
              <BiTrash className="text-neutral-700" size={20} />
            </button>
          </div>
        )}
        {uploadProgress === 100 && (
          <div className="flex items-center justify-end">
            <Button
              onClick={async () => {
                setFile(null);
                setUploadProgress(0);
                await getProjectDetailsHandler();
                closeModal(id);
              }}
              className={"flex gap-2 items-center justify-center"}
              size="small"
            >
              Done
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UploadItems;
