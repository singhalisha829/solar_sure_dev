import { useState, useEffect } from "react";
import FormModal from "../../shared/FormModal";
import Input from "../../formPage/Input";
import { toast } from "sonner";
import { handleFileUpload } from "@/utils/documentUploadHandler";
import File from "../../File";
import { requestHandler } from "@/services/ApiHandler";
import { addInstallerRemark, editSiteProgress } from "@/services/api";
import { useModal } from "@/contexts/modal";
import { SelectForObjects } from "../../formPage/MultiSelectDropdown/MultiSelectDropdown";
import Button from "../../shared/Button";
import { dateFormatInYYYYMMDD } from "@/utils/formatter";
import Loading from "../../Loading";

const AddInstallerRemark = ({
  modalId,
  projectId,
  onSuccessfullSubmit,
  itemDetails,
}) => {
  const { closeModal } = useModal();
  const today = dateFormatInYYYYMMDD(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [item, setItem] = useState({
    date: today,
    attachments: [],
    task_name: "",
    descriptions: "",
  });
  const [fileName, setFileName] = useState("");
  const [file, setFile] = useState("");

  const taskList = [
    { name: "Electrical" },
    { name: "Mechanical" },
    { name: "Panel" },
    { name: "Inverter" },
    { name: "Installation" },
    { name: "Other" },
  ];

  useEffect(() => {
    if (itemDetails && itemDetails !== null) {
      setItem(itemDetails);
    }
  }, [itemDetails]);

  const handleFileChange = async (e) => {
    setIsLoading(true);
    const file = e.target.files[0];
    const data = await handleFileUpload(file);
    if (data.type === "success") {
      setFile(data.data);
    } else {
      toast.error(data.error);
    }
    setIsLoading(false);
  };

  const handleFileDetails = async (event) => {
    event.preventDefault(); // Prevent default button behavior
    if (fileName === "") {
      toast.error("Field Document Name is empty ");
      return;
    }
    if (!file) {
      toast.error("Field Document is empty ");
      return;
    }
    let fileData = {
      file_name: fileName,
      file_url: file,
    };
    setFile("");
    setFileName("");
    setItem({ ...item, attachments: [...item.attachments, fileData] });
  };

  const handleFileDelete = (index) => {
    const fileList = item.attachments;
    fileList.splice(index, 1);
    setItem({ ...item, attachments: fileList });
  };

  const onSubmit = async () => {
    if (item.date === "") {
      toast.error("Field Date is empty");
      return;
    }
    if (fileName !== "" && file == "") {
      toast.error("Please save the Document before proceeding.");
      return;
    }
    if (file !== "" && fileName === "") {
      toast.error("Please enter the Document Name before proceeding.");
      return;
    }
    if (item.task_name === "") {
      toast.error("Field Task is empty");
      return;
    }
    if (item.descriptions === "") {
      toast.error("Field Remark is empty");
      return;
    }
    if (modalId.split("-")[0] === "add") {
      let formData = {
        project: projectId,
        date: item.date,
        task_name: item.task_name,
        descriptions: item.descriptions,
      };
      if (item?.attachments?.length > 0 || fileName != "") {
        formData = {
          ...formData,
          attachments: [
            ...item.attachments,
            { file_name: fileName, file_url: file },
          ],
        };
      }
      await requestHandler(
        async () => await addInstallerRemark(formData),
        null,
        async (data) => {
          toast.success("Installer Remark Added Successfully...");
          closeModal(modalId);
          onClose();
          onSuccessfullSubmit();
        },
        toast.error
      );
    } else if (modalId.split("-")[0] === "edit") {
      await requestHandler(
        async () => await editSiteProgress(item.id, item),
        null,
        async (data) => {
          toast.success("Installer Remark Saved Successfully...");
          closeModal(modalId);
          onSuccessfullSubmit();
        },
        toast.error
      );
    }
  };

  const onClose = () => {
    if (modalId.split("-")[0] === "add") {
      setItem({
        date: today,
        attachments: [],
        task_name: "",
        descriptions: "",
      });
      setFile("");
      setFileName("");
    }
  };

  return (
    <FormModal
      id={modalId}
      onSubmit={onSubmit}
      ctaText={modalId.split("-")[0] === "add" ? "Add" : "Save"}
      heading={
        modalId.split("-")[0] === "add"
          ? `Add Installer Remark`
          : `Edit Installer Remark`
      }
      onClose={onClose}
      className={"overflow-visible"}
    >
      <div className="grid gap-y-5">
        <div className="grid grid-cols-9 gap-x-2.5">
          <Input
            type="date"
            label="Date"
            outerClass="col-span-4"
            mandatory={true}
            value={item.date}
            onChange={(e) => setItem({ ...item, date: e.target.value })}
          />
        </div>

        {/* <div className="border-1 rounded-sm p-2"> */}
        <div className="grid grid-cols-9 gap-x-2.5 items-end">
          <Input
            type="text"
            label="Document Name"
            outerClass="col-span-4"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
          />

          <Input
            type="file"
            outerClass="col-span-4"
            label="Document"
            onChange={handleFileChange}
          />

          {isLoading ? (
            <Loading />
          ) : (
            <Button onClick={handleFileDetails} className="px-2 col-span-1">
              Add More
            </Button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {item.attachments?.length > 0
            ? item.attachments.map((fileElement, index) => {
                return (
                  <File
                    key={index}
                    id={index}
                    name={fileElement.file_name}
                    file={fileElement.file_url}
                    onRemoveFile={() => handleFileDelete(index)}
                  />
                );
              })
            : null}{" "}
        </div>

        <div className="grid grid-cols-9 gap-2.5 items-center">
          <SelectForObjects
            mandatory={true}
            margin={"0px"}
            height={"36px"}
            setselected={(value) => setItem({ ...item, task_name: value })}
            className={"col-span-4"}
            selected={item.task_name}
            options={taskList}
            optionName={"name"}
            placeholder="Select Task"
            dropdownLabel={"Task"}
          />
          <Input
            type="textarea"
            label="Remark"
            outerClass="col-span-full"
            mandatory={true}
            value={item.descriptions}
            onChange={(e) => setItem({ ...item, descriptions: e.target.value })}
          />
        </div>
      </div>
    </FormModal>
  );
};

export default AddInstallerRemark;
