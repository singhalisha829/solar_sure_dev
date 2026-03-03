import React, { useEffect, useState } from "react";
import { SelectForObjects } from "../formPage/MultiSelectDropdown/MultiSelectDropdown";
import Input from "../formPage/Input";
import { useModal } from "@/contexts/modal";
import FormModal from "../shared/FormModal";
import { Switch } from "../formPage/Switch";
import { useSalesPerson } from "@/contexts/salesperson";
import { requestHandler } from "@/services/ApiHandler";
import { createTask, updateTask } from "@/services/api";
import { toast } from "sonner";
import { checkSpecificKeys } from "@/utils/formValidationHandler";

const AddTaskModal = ({
  type,
  getTasksHandler,
  headers,
  selectedTask,
  setSelectedTask,
}) => {
  const { closeModal } = useModal();
  const { salesPersons } = useSalesPerson();

  const [subHeaders, setSubHeaders] = useState([]);
  const [taskList,setTaskList] = useState([]);
  const [formErrors,setFormErrors] = useState({})
  const [task, setTask] = useState(() =>
    selectedTask
      ? { ...selectedTask.task, header: selectedTask.header }
      : {
          header: "",
          sub_header: "",
          sub_header_name: "",
          header_name: "",
          task_name: "",
          planned_start_date: "",
          planned_end_date: "",
          actual_start_date: null,
          actual_end_date: null,
          assigned_to: "",
          is_milestone: false,
          weightage:0
        }
  );

  useEffect(() => {
    if (selectedTask) {
     setTask({
        ...selectedTask.task,
        header: selectedTask.header,
        header_name: selectedTask.headerName,
        sub_header: selectedTask.subHeaderId,
        sub_header_name: selectedTask.subHeaderName
      });
    }
  }, [selectedTask]);

  const valueHandler = (e) => {
    setTask((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleTaskName = () =>{
    let taskWithSameName = taskList.filter(taskItem=> taskItem.task_name.toLowerCase() == task.task_name.toLowerCase())
    if(type === 'edit'){
      taskWithSameName = taskWithSameName.filter(taskItem =>taskItem.task_name.toLowerCase() !== selectedTask.task.task_name.toLowerCase())
    }
    if(taskWithSameName.length > 0){
      setFormErrors({...formErrors,["task"]:"Task Name must be unique.Please try again!"})
      return({...formErrors,["task"]:"Task Name must be unique.Please try again!"})
    }else{
      setFormErrors({})
      return null;
    }
    
  }

  // console.log("task",type,selectedTask)
  const createTaskHandler = async () => {
    let keysToCheck={
      header:"Header",
      sub_header:"Sub Header",
      task_name:"Task Name",
      planned_start_date:"Planned Start Date",
      planned_end_date:"Planned End Date",
    }
    if(type === 'edit'){
      keysToCheck={...keysToCheck,
        actual_start_date:"Actual Start Date",
        actual_end_date:"Actual End Date"
      }
    }

    const validationResult = checkSpecificKeys(task, keysToCheck);
    if (validationResult.isValid === false) {
      toast.error(validationResult.message);
      return;
    }

    
    if (task.planned_start_date > task.planned_end_date) {
      return toast.error(
        "Planned Start Date must be less than Planned End Date"
      );
    }

    const error = handleTaskName();

    if(error && Object.keys(error).length > 0){
      toast.error(error.task)
    }else{
    await requestHandler(
      async () => {
        if (type === "edit") {
          return await updateTask(task);
        } else {
          return await createTask(task);
        }
      },
      null,
      async (data) => {
        toast.success(
          type === "edit"
            ? "Task Updated Successfully..."
            : "Task Added Successfully..."
        );
        await getTasksHandler();
        closeModal("add-task");
      },
      toast.error
    );
    }
  };

  return (
    <FormModal
      onClose={() => {
        if (type === "edit") {
          setSelectedTask(null);
        }
        setTask({
          header: "",
          header_name: "",
          task_name: "",
          planned_start_date: null,
          planned_end_date: null,
          actual_start_date: null,
          actual_end_date: null,
          assigned_to: null,
          is_milestone: false,
          weightage:0
        });
        setFormErrors({})
      }}
      id="add-task"
      heading={type === "edit" ? "Edit Task" : "Add Task"}
      ctaText={type === "edit" ? "Update Task" : "Create Task"}
      onSubmit={createTaskHandler}
    >
      <div className="grid grid-cols-2 gap-2.5">
        <SelectForObjects
          margin={"0px"}
          height={"36px"}
          setselected={(name, id) => {
            setTask((prev) => ({ ...prev, header: id, header_name: name }));
            const selectedHeader = headers.find((header) => header.id === id);
            setSubHeaders(selectedHeader.project_schedule_sub_header)
          }}
          selected={task.header_name}
          mandatory={true}
          options={headers}
          optionName={"name"}
          optionID={"id"}
          placeholder="Select Name"
          dropdownLabel={"Select Header"}
        />
        <SelectForObjects
          margin={"0px"}
          height={"36px"}
          setselected={(name, id) => {
            setTask((prev) => ({
              ...prev,
              sub_header: id,
              sub_header_name: name,
            }));
            const selectedOption = subHeaders.find((option) => option.id == id);
            setTaskList(selectedOption?.project_task_list)
          }}
          mandatory={true}
          selected={task.sub_header_name}
          options={subHeaders}
          optionName={"name"}
          optionID={"id"}
          placeholder="Select Name"
          dropdownLabel={"Select Sub Header"}
        />
      </div>
      <div className="grid grid-cols-2 gap-2.5">
      <Input
        type={"text"}
        onChange={valueHandler}
        value={task.task_name}
        mandatory={true}
        onBlur={()=>handleTaskName()}
        name={"task_name"}
        placeholder={"Task Name"}
        label={"Task Name"}
        error={formErrors.task}
      />
      <Input
        type={"number"}
        onChange={valueHandler}
        value={task.weightage}
        mandatory={true}
        name={"weightage"}
        label={"Weightage"}
      />
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <Input
          type={"date"}
          value={task.planned_start_date}
          onChange={valueHandler}
          mandatory={true}
          max={task.planned_end_date}
          name={"planned_start_date"}
          label={"Planned Start date"}
        />
        <Input
          type={"date"}
          value={task.planned_end_date}
          min={task.planned_start_date}
          onChange={valueHandler}
          mandatory={true}
          name={"planned_end_date"}
          label={"Planned End Date"}
        />
      </div>
      {type === "edit" && (
        <div className="grid grid-cols-2 gap-2.5">
          <Input
            type={"date"}
            value={task.actual_start_date??""}
            mandatory={true}
            onChange={valueHandler}
            max={task.actual_end_date}
            name={"actual_start_date"}
            label={"Actual Start Date"}
          />
          <Input
            type={"date"}
            value={task.actual_end_date??""}
            onChange={valueHandler}
            min={task.actual_start_date}
            mandatory={true}
            name={"actual_end_date"}
            label={"Actual End Date"}
          />
        </div>
      )}
      <div className="grid grid-cols-2 gap-2.5 items-end">
        <SelectForObjects
          margin={"0px"}
          height={"36px"}
          setselected={(value) => {
            const selected = salesPersons.find(
              (person) => person.name === value
            );
            setTask((prev) => ({ ...prev, assigned_to: selected?.id }));
          }}
          selected={
            salesPersons.find((person) => person.id === task.assigned_to)?.name
          }
          options={salesPersons}
          optionName={"name"}
          placeholder="Select User"
          dropdownLabel={"Assign To"}
        />
        <div className="flex items-center gap-5 h-[36px]">
          <label
            className="text-zinc-800 text-xs font-bold flex items-center "
            htmlFor="milestone"
          >
            Make this a Milestone
          </label>
          <Switch
            checked={task.is_milestone}
            onCheckedChange={(check) =>
              setTask((prev) => ({ ...prev, is_milestone: check }))
            }
            id="milestone"
          />
        </div>
      </div>
    </FormModal>
  );
};

export default AddTaskModal;
