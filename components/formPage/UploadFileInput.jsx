import { useModal } from "@/contexts/modal";
import { uploadFileIcon } from "@/utils/images";
import Image from "next/image";
import { useState } from "react";
import { FileUploader } from "react-drag-drop-files";
import { BiTrash, BiUpload } from "react-icons/bi";
import Modal from "../shared/Modal";
import { LuFile, LuDownload } from "react-icons/lu";
import { cn } from "@/utils/utils";
import Button from "../shared/Button";
import { useRouter } from "next/router";
import Input from "./Input";
import { toast } from "sonner";
import { checkSpecificKeys } from "@/utils/formValidationHandler";
import Papa from "papaparse";

const UploadFile = ({
  id,
  placeholderText,
  onFileChange,
  showFileName,
  uploadSingleFile,
  fileList,
  fileNameKey,
  filePathKey,
  onRemoveFile,
  className,
  fileTypes,
  sampleFileData,
  isDisabled,
  ...restProps
}) => {
  const router = useRouter();

  const { openModal, closeModal } = useModal();

  const [uploadProgress, setUploadProgress] = useState(100);
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [uploadError, setUploadError] = useState(false);

  const handleFileChange = (file) => {
    if (restProps.showFileNameInputField) {
      const keysToCheck = { name: "Document Name" };

      const validationResult = checkSpecificKeys(
        { name: fileName },
        keysToCheck
      );

      if (validationResult.isValid === false) {
        toast.error(validationResult.message);
        return;
      }

      onFileChange(fileName, file);
      setFileName("");
    } else {
      onFileChange(file);
    }
    if (uploadSingleFile) {
      closeModal(id);
    }
  };

  const downloadSampleFile = () => {
    const csv = Papa.unparse(sampleFileData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "stock_in_sample.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <button
        onClick={() => openModal(id)}
        disabled={isDisabled}
        className={cn(
          `flex items-center w-full justify-between gap-7 border  px-2.5 py-2 rounded-md text-neutral-400 text-sm font-medium tracking-tight`,
          className,
          isDisabled ? "cursor-not-allowed" : "cursor-pointer",
          restProps.error
            ? "border-red-500 shadow-red-200 shadow-md"
            : "border-zinc-300 shadow"
        )}
      >
        {restProps.isFileLoaded ? (
          <p className="text-primary">File Loaded</p>
        ) : (
          placeholderText
        )}
        <BiUpload className="text-inherit" size={16} />
      </button>
      {restProps.error && restProps.error !== "" && (
        <p className="text-xs pl-1 text-red-500 mt-1">{restProps.error}</p>
      )}
      <Modal
        id={id}
        heading={"Upload"}
        onClose={async () => {
          setFile(null);
        }}
      >
        {sampleFileData && (
          <span
            className="flex gap-1 items-end cursor-pointer hover:underline underline-offset-4 hover:text-primary"
            onClick={downloadSampleFile}
          >
            Download Sample <LuDownload size={18} />
          </span>
        )}

        {restProps.showFileNameInputField && (
          <Input
            type="text"
            placeholder={"Enter Document Name"}
            label={"Document Name"}
            mandatory={true}
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
          />
        )}
        <FileUploader
          handleChange={handleFileChange}
          name="file"
          types={fileTypes}
        >
          <div className=" w-full h-[170px] flex flex-col gap-3 justify-center items-center rounded border-2 border-stone-300 border-dashed border-spacing-3 cursor-pointer">
            <div className="bg-orange-500/10 rounded-md w-12 h-12 flex items-center justify-center">
              <Image alt="" src={uploadFileIcon} height={24} width={24} />
            </div>
            <div className="flex flex-col gap-1 text-center">
              <p className=" text-neutral-700 text-sm font-medium">
                <span className="text-orange-500">Click to Upload</span> or drag
                and drop
              </p>
              <p className="text-neutral-700 text-xs font-normal">
                (Max. File size: 25 MB)
              </p>
            </div>
          </div>
        </FileUploader>

        <div className="overflow-y-auto flex flex-col gap-2.5">
          {fileList && fileList?.length > 0
            ? fileList.map((file, fileIndex) => (
                <div
                  key={fileIndex}
                  className="border-stone-300 border rounded-md bg-white p-4 flex gap-3"
                >
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
                      {file[fileNameKey]}
                    </p>
                    {/* {!uploadError && (
                <p className="text-stone-400 text-xs font-normal leading-tight">
                  {Math.round(file.size / 1024)} kb
                </p>
              )} */}
                    {uploadProgress === 100 && !uploadError && (
                      <p
                        className="text-orange-500 text-sm font-semibold leading-tight cursor-pointer"
                        onClick={() =>
                          window.open(file[filePathKey], "__blank")
                        }
                      >
                        Click to view
                      </p>
                    )}
                  </div>
                  <button className="max-w-fit max-h-fit items-start p-1.5 self-start">
                    <BiTrash
                      className="text-neutral-700"
                      size={20}
                      onClick={() => onRemoveFile(fileIndex)}
                    />
                  </button>
                </div>
              ))
            : null}
        </div>

        {((uploadSingleFile && file) ||
          (!uploadSingleFile && fileList?.length > 0)) && (
          <div className="flex items-center justify-end">
            <Button
              onClick={async () => {
                setFile(null);
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

export default UploadFile;
