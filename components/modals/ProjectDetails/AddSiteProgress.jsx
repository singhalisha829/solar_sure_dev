import { useState, useEffect } from "react";
import FormModal from "../../shared/FormModal";
import Input from "../../formPage/Input";
import { toast } from "sonner";
import { handleFileUpload } from "@/utils/documentUploadHandler";
import { LuCheck, LuX } from "react-icons/lu";
import File from "../../File";
import Task from "../../Task";
import { requestHandler } from "@/services/ApiHandler";
import { addSiteProgress, editSiteProgress } from "@/services/api";
import { useModal } from "@/contexts/modal";
import { SelectForObjects } from "../../formPage/MultiSelectDropdown/MultiSelectDropdown";
import { useSalesPerson } from "@/contexts/salesperson";

const AddSiteProgress = ({
  modalId,
  projectId,
  onSuccessfullSubmit,
  itemDetails,
}) => {
  const { closeModal } = useModal();
  const { salesPersons } = useSalesPerson();
  const [item, setItem] = useState({
    project: projectId,
    site_engineer: "",
    site_engineer_name: "",
    date: "",
    file: [],
    task: [],
  });
  const [fileName, setFileName] = useState("");
  const [file, setFile] = useState(null);
  const [taskDetails, setTaskDetails] = useState({
    task: "",
    descriptions: "",
  });

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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFile(file);
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
      url: "",
    };

    const data = await handleFileUpload(file);
    if (data.type === "success") {
      fileData.url = data.data;
      setFile(null);
      setFileName("");
      setItem({ ...item, file: [...item.file, fileData] });
    } else {
      toast.error(data.error);
    }
  };

  const handleFileDelete = (index) => {
    const fileList = item.file;
    fileList.splice(index, 1);
    setItem({ ...item, file: fileList });
  };

  const handleTaskDetails = async (event) => {
    event.preventDefault(); // Prevent default button behavior
    if (taskDetails.task === "") {
      toast.error("Field Task is empty ");
      return;
    }
    if (taskDetails.descriptions === "") {
      toast.error("Field Description is empty ");
      return;
    }
    let taskData = {
      task: taskDetails.task,
      descriptions: taskDetails.descriptions,
    };
    let taskList = item.task;
    setTaskDetails({ task: "", descriptions: "" });
    setItem({ ...item, task: [...taskList, taskData] });
  };

  const handleTaskDelete = (index) => {
    const taskList = item.task;
    taskList.splice(index, 1);
    setItem({ ...item, file: taskList });
  };

  const clearTaskDetails = (event) => {
    event.preventDefault(); // Prevent default button behavior
    setTaskDetails({ task: "", descriptions: "" });
  };

  const clearFileDetails = (event) => {
    event.preventDefault(); // Prevent default button behavior
    setFile(null);
    setFileName("");
  };

  const onSubmit = async () => {
    if (item.date === "") {
      toast.error("Field Date is empty");
      return;
    }
    if (fileName !== "" && file) {
      toast.error("Please save the Document before proceeding.");
      return;
    }
    if (item.task.length === 0) {
      toast.error("Kindly include at least one task.");
      return;
    }
    if (modalId.split("-")[0] === "add") {
      await requestHandler(
        async () => await addSiteProgress(item),
        null,
        async (data) => {
          toast.success("Site Progress Added Successfully...");
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
          toast.success("Site Progress Saved Successfully...");
          closeModal(modalId);
          onSuccessfullSubmit();
        },
        toast.error
      );
    }
  };

  //   console.log("lop",modalId,item)

  const onClose = () => {
    if (modalId.split("-")[0] === "add") {
      setItem({
        project: projectId,
        date: "",
        file: [],
        task: [],
      });
    }
  };
  return (
    <FormModal
      id={modalId}
      onSubmit={onSubmit}
      ctaText={modalId.split("-")[0] === "add" ? "Create Task" : "Save Task"}
      heading={modalId.split("-")[0] === "add" ? `Add New Task` : `Edit Task`}
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

          <SelectForObjects
            margin={"0px"}
            mandatory
            height={"36px"}
            setselected={(name, id) => {
              setItem((prev) => ({
                ...prev,
                site_engineer: Number(id),
                site_engineer_name: name,
              }));
            }}
            className={"col-span-4"}
            selected={item.site_engineer_name}
            options={salesPersons}
            optionName={"name"}
            optionID={"id"}
            placeholder="Select.."
            dropdownLabel={"Site Engineer"}
          />
        </div>

        {/* <div className="border-1 rounded-sm p-2"> */}
        <div className="grid grid-cols-9 gap-x-2.5 items-center">
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
          <span className="flex gap-2 col-span-1">
            <button
              onClick={clearFileDetails}
              className="flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-white flex-shrink-0"
            >
              <LuX title="Clear" size={10} />
            </button>
            <button
              onClick={handleFileDetails}
              className="flex items-center justify-center w-4 h-4 rounded-full bg-green-500 text-white flex-shrink-0"
            >
              <LuCheck title="Save" size={10} />
            </button>
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {item.file?.length > 0
            ? item.file.map((fileElement, index) => {
                return (
                  <File
                    key={index}
                    id={index}
                    name={fileElement.file_name}
                    file={fileElement.url}
                    onRemoveFile={() => handleFileDelete(index)}
                  />
                );
              })
            : null}{" "}
        </div>

        <div className="grid grid-cols-9 gap-x-2.5 items-center">
          <SelectForObjects
            mandatory={true}
            margin={"0px"}
            height={"36px"}
            setselected={(value) =>
              setTaskDetails({ ...taskDetails, task: value })
            }
            className={"col-span-4"}
            selected={taskDetails.task}
            options={taskList}
            optionName={"name"}
            placeholder="Select Task"
            dropdownLabel={"Task"}
          />
          <Input
            type="textarea"
            label="Description"
            outerClass="col-span-4"
            mandatory={true}
            value={taskDetails.descriptions}
            onChange={(e) =>
              setTaskDetails({ ...taskDetails, descriptions: e.target.value })
            }
          />
          <span className="flex gap-2 col-span-1">
            <button
              onClick={clearTaskDetails}
              className="flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-white flex-shrink-0"
            >
              <LuX title="Clear" size={10} />
            </button>
            <button
              onClick={handleTaskDetails}
              className="flex items-center justify-center w-4 h-4 rounded-full bg-green-500 text-white flex-shrink-0"
            >
              <LuCheck title="Save" size={10} />
            </button>
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {item.task?.length > 0
            ? item.task.map((task, index) => (
                <Task task={task} key={index} onRemoveTask={handleTaskDelete} />
              ))
            : null}
        </div>
      </div>
    </FormModal>
  );
};

export default AddSiteProgress;
