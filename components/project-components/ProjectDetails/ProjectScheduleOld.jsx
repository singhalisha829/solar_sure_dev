import { useModal } from "@/contexts/modal";
import { useProject } from "@/contexts/project";
import { requestHandler } from "@/services/ApiHandler";
import { createScheduleHeader, createSubHeader } from "@/services/api";
import { cn } from "@/utils/utils";
import { useRouter } from "next/router";
import { useState } from "react";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { BiUpload } from "react-icons/bi";
import { FaPlusCircle } from "react-icons/fa";
import { toast } from "sonner";
import GanttChart from "./GanttChart";
import Input from "@/components/formPage/Input";
import AddTaskModal from "@/components/modals/AddTaskModal";
import UploadSchedule from "@/components/modals/UploadSchedule";
import Button from "@/components/shared/Button";
import FormModal from "@/components/shared/FormModal";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../../shared/HoverCard";
import Loading from "@/components/shared/Loading";
import CreateSubHeader from "../../modals/ProjectDetails/CreateSubHeader";
import { LocalStorageService } from "@/services/LocalStorageHandler";

const getRandomColor = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const ProjectScheduleNew = () => {
  const router = useRouter();
  const { projectId } = router.query;
  const {
    getProjectDetailsHandler,
    isLoading,
    projectDetails,
    refetchProjectDetails,
  } = useProject();
  const { openModal, closeModal } = useModal();
  const [header, setHeader] = useState({
    name: "",
    color: getRandomColor(),
  });
  const [formErrors, setFormErrors] = useState({});
  const [selectedTask, setSelectedTask] = useState(null);

  const headers = projectDetails?.project_new_schedule_header;

  const accessibilityInfo =
    LocalStorageService.get("user_accessibility").accessibility[0].projects
      .schedule_tab ?? {};

  const addHeader = async (e) => {
    handleHeaderName();

    if (Object.keys(formErrors).length > 0) {
      toast.error(formErrors.header);
    } else {
      await requestHandler(
        async () =>
          await createScheduleHeader({
            name: header.name,
            project: projectId,
            header_color: header.color,
          }),
        null,
        async (data) => {
          toast.success("Header Added Successfully...");
          closeModal("schedule-header");
          onHeaderFormClose();
          await getProjectDetailsHandler();
        },
        toast.error
      );
    }
  };

  // check for duplicate header name. Header Name must be unique
  const handleHeaderName = () => {
    const headerWithSameName = headers.filter(
      (headerItem) => headerItem.name.toLowerCase() == header.name.toLowerCase()
    );
    if (headerWithSameName.length > 0) {
      setFormErrors({
        ...formErrors,
        ["header"]: "Header Name must be unique.Please try again!",
      });
    } else {
      setFormErrors({});
    }
  };

  const onHeaderFormClose = () => {
    setHeader({
      name: "",
      color: getRandomColor(),
    });
    setFormErrors({});
  };

  const convertData = (apiData) => {
    const result = [];

    apiData.forEach((item) => {
      item.project_schedule_sub_header.forEach((subHeader) => {
        const headerColor = subHeader?.header_color || "#3b82f6";
        // Add the project (sub-header) itself
        result.push({
          id: subHeader.id,
          header_color: subHeader.header_color,
          name: subHeader.name,
          header: `${item.id}|${item.header_name}`,
          weightage: subHeader.weightage,
          type: "project",
          start: new Date(subHeader.min_planned_start_date),
          end: new Date(subHeader.max_planned_end_date),
        });

        // Add each task within the sub-header
        subHeader.project_task_list.forEach((task, index) => {
          result.push({
            id: task.id, // Unique ID for the task; assuming you'll manage IDs to prevent duplicates
            start: new Date(task.planned_start_date),
            end: new Date(task.planned_end_date),
            name: task.task_name, // This seems to be a static value; adjust as needed
            type: "task",
            project: subHeader.id,
            header: `${subHeader.id}|${subHeader.name}`,
            task_name: task.task_name,
            assigned_to: task.assigned_to ? task.assigned_to_name : null,
            weightage: task.weightage,
            dependencies: [
              index > 0 && subHeader.project_task_list[index - 1].id,
            ],
            styles: {
              backgroundColor: headerColor,
              backgroundSelectedColor: headerColor,
              progressColor: headerColor,
              progressSelectedColor: headerColor,
            },
          });
        });
      });
    });
    return result;
  };
  const ff = headers && convertData(headers);

  if (isLoading) return <Loading />;

  return (
    <>
      <div className="flex justify-end items-center">
        {/* <div className="w-[220px]">
          <Input
            type={"date"}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div> */}
        {accessibilityInfo?.add_view && (
          <div className="flex items-center gap-2.5">
            {/* header trigger and modal */}
            <Button
              onClick={() => openModal("upload-schedule")}
              className={"flex gap-2 items-center justify-center max-w-[120px]"}
              size="small"
            >
              <BiUpload />
              Upload Schedule
            </Button>
            <UploadSchedule
              onSuccessfullSubmit={refetchProjectDetails}
              id={"upload-schedule"}
            />
            <Button
              onClick={() => openModal("schedule-header")}
              className={"flex gap-2 items-center justify-center max-w-[120px]"}
              size="small"
            >
              <FaPlusCircle />
              Create Header
            </Button>
            <Button
              onClick={() => openModal("schedule-sub-header")}
              className={"flex gap-2 items-center justify-center max-w-[120px]"}
              size="small"
            >
              <FaPlusCircle />
              Create Sub Header
            </Button>
            <CreateSubHeader headers={headers} />
            <FormModal
              id="schedule-header"
              heading={"Create Header"}
              ctaText={"Create Header"}
              onSubmit={addHeader}
              onClose={onHeaderFormClose}
            >
              <Input
                onChange={(e) =>
                  setHeader((prev) => ({ ...prev, name: e.target.value }))
                }
                name="sectionName"
                onBlur={handleHeaderName}
                value={header.name}
                type={"text"}
                label={"Enter Name"}
                error={formErrors.header}
              />
              <div className="flex items-center gap-4">
                <label
                  className="flex gap-[2px] text-xs capitalize text-zinc-800 font-bold tracking-tight"
                  htmlFor="color"
                >
                  Choose Header Color:-
                </label>
                <input
                  className="rounded-full w-10"
                  type="color"
                  name="color"
                  value={header.color}
                  onChange={(e) =>
                    setHeader((prev) => ({ ...prev, color: e.target.value }))
                  }
                  id="color"
                />
              </div>
            </FormModal>

            {/* task trigger and modal */}
            <Button
              disabled={headers?.length === 0}
              onClick={() => openModal("add-task")}
              className={"flex gap-2 items-center justify-center max-w-[120px]"}
              size="small"
            >
              <FaPlusCircle />
              Add Task
            </Button>
            <AddTaskModal
              setSelectedTask={setSelectedTask}
              type={selectedTask ? "edit" : null}
              selectedTask={selectedTask}
              projectId={projectId}
              headers={headers}
              getTasksHandler={getProjectDetailsHandler}
            />
          </div>
        )}
      </div>
      <div className="grid grid-cols-[200px_1fr] gap-2 grow">
        <div className="flex flex-col border-r border-slate-100 pt-[50px] mt-[50px]">
          {headers?.map((header) => {
            let header_length = 0;
            header.project_schedule_sub_header.map((sub_header) => {
              header_length +=
                (sub_header.project_task_list.length || 0) * 50 + 50;
            });
            return (
              <div
                className="grid grid-cols-[40px_1fr] relative "
                style={{
                  // maxHeight: `${ff?.length * 50}px`,
                  height: `${header_length}px`,
                }}
                key={header.id}
              >
                <div
                  className="bg-orange-500/10 grid place-items-center overflow-hidden "
                  style={{
                    maxHeight: `${ff?.length * 50}px`,
                  }}
                >
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <p
                        style={{
                          color: header.header_color
                            ? header.header_color
                            : "#3b82f6",
                          maxHeight: `${ff?.length * 50}px`,
                        }}
                        className="text-primary overflow-hidden  text-sm font-bold tracking-tight flex items-center line-clamp-1 schedule_header truncate rotate-180 py-5"
                      >
                        {header.name}
                      </p>
                    </HoverCardTrigger>
                    <HoverCardContent className="translate-x-10">
                      <p>{header.name}</p>
                    </HoverCardContent>
                  </HoverCard>
                </div>

                <div className="flex flex-col ">
                  {header?.project_schedule_sub_header?.map(
                    (sub_header, sub_header_index) => {
                      return (
                        <div
                          className={` pl-2  pt-[50px]`}
                          key={sub_header_index}
                        >
                          {sub_header?.project_task_list?.map((t) => {
                            return (
                              <p
                                key={t.id}
                                className={cn(
                                  "text-xs h-[50px] flex items-center  font-semibold tracking-tight  truncate text-wrap"
                                )}
                                style={{
                                  color: sub_header.header_color
                                    ? sub_header.header_color
                                    : "#3b82f6",
                                }}
                              >
                                {t.task_name}
                              </p>
                            );
                          })}
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {ff && ff.length > 0 && (
          <GanttChart setSelectedTask={setSelectedTask} formattedTasks={ff} />
        )}
      </div>
    </>
  );
};

export default ProjectScheduleNew;
