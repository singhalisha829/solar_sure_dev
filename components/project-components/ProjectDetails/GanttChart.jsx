import { useModal } from "@/contexts/modal";
import { Gantt } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import { useState } from "react";
import { cn } from "@/utils/utils";
import { useProject } from "@/contexts/project";

const findTaskById = (headers, formattedTasks, taskId) => {
  // sub header details are stored in formattedTasks array
  const selectedTask = formattedTasks.find((task) => task.id === taskId);

  for (const header of headers) {
    const foundTask = header.task.find((task) => task.id === taskId);
    if (foundTask) {
      return {
        headerId: header.id,
        headerName: header.name,
        subHeaderId: selectedTask?.header.split("|")[0],
        subHeaderName: selectedTask?.header.split("|")[1],
        task: { ...foundTask, weightage: selectedTask?.weightage },
      };
    }
  }
  return null;
};

const GanttChart = ({ formattedTasks, setSelectedTask }) => {
  const { projectDetails } = useProject();

  const headers = projectDetails?.project_schedule_header;

  const [viewType, setViewType] = useState({
    name: "Day",
    width: 30,
  });
  const { openModal } = useModal();

  const handleDblClick = (task) => {
    const foundTask = findTaskById(headers, formattedTasks, task.id);
    setSelectedTask({ ...foundTask, header: foundTask.headerId });
    openModal("add-task");
  };

  const handleSelect = (task, isSelected) => {
    // console.log(task.name + " has " + (isSelected ? "selected" : "unselected"));
  };

  const viewTypes = [
    { name: "Day", width: 30 },
    { name: "Week", width: 100 },
    { name: "Month", width: 200 },
  ];

  return (
    <div className="flex flex-col gap-4 overflow-x-auto">
      <div className="flex items-center gap-4">
        {viewTypes.map((type) => (
          <button
            disabled={viewType.name === type.name}
            key={type.name}
            className={`px-2 py-1.5 border bg-neutral-500/10 text-neutral-800 border-neutral-800 disabled:border-orange-500 rounded disabled:bg-orange-500/10 disabled:text-primary ${viewType.name === type.name
                ? "bg-orange-500/10 border-orange-500 text-primary"
                : ""
              }`}
            onClick={() => setViewType(type)}
          >
            {type.name}
          </button>
        ))}
      </div>
      <div className="relative grow">
        {formattedTasks?.length !== 0 && (
          <Gantt
            TooltipContent={ToolTip}
            barFill={60}
            barCornerRadius={4}
            tasks={formattedTasks}
            viewMode={viewType.name}
            viewDate={Date.now()}
            onDoubleClick={handleDblClick}
            onSelect={handleSelect}
            listCellWidth={""}
            TaskListTable={TaskListTable}
            TaskListHeader={TaskListHeader}
            fontSize={12}
            columnWidth={viewType.width}
          />
        )}
      </div>
    </div>
  );
};

export default GanttChart;

function ToolTip({ task }) {
  return (
    <div className="p-4 rounded-md shadow-lg bg-white grid grid-cols-2 gap-1.5">
      <p className="text-primary font-medium text-sm">Task Name</p>
      <p>{task.name}</p>
      <p className="text-primary font-medium text-sm">Start Date</p>
      <p>
        {new Date(task.start).toLocaleDateString("en-US", {
          // weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>
      <p className="text-primary font-medium text-sm">End Date</p>
      <p>
        {new Date(task.end).toLocaleDateString("en-US", {
          // weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>
      <p className="text-primary font-medium text-sm">Header Name</p>
      <p>{task.header.split("|")[1]}</p>
      <p className="text-primary font-medium text-sm">Assigned To</p>
      <p>{task.assigned_to ? task.assigned_to : "Unassigned"}</p>
    </div>
  );
}

// { rowHeight: number; rowWidth: string; fontFamily: string; fontSize: string; locale: string; tasks: Task[]; selectedTaskId: string; setSelectedTask: (taskId: string) => void; }
function TaskListTable({
  rowHeight,
  rowWidth,
  fontFamily,
  fontSize,
  locale,
  tasks,
  selectedTaskId,
  setSelectedTask,
}) {
  return (
    <div className="border">
      {tasks.map((task, idx) => (
        <div
          className={cn(
            `grid place-items-center w-full border-b text-xs font-semibold`
          )}
          style={{ height: rowHeight }}
          key={task.id}
        >
          {task.name}
        </div>
      ))}
    </div>
  );
}
function TaskListHeader({ headerHeight, rowWidth, fontFamily, fontSize }) {
  return (
    <div
      className={`px-4 py-3  text-xs text-primary uppercase w-[150px] grid place-items-center border font-bold`}
      style={{ height: headerHeight }}
    >
      Task Name
    </div>
  );
}
