import React from "react";
import { useState } from "react";
import { LuX } from "react-icons/lu";

const Task = ({ id, task, onRemoveTask }) => {
  const [showDescription, setShowDescription] = useState(false)
  return (
    <div
      className="flex w-fit items-center gap-2.5 px-2.5 py-2 rounded-md bg-orange-500/10 text-primary border border-orange-500"
    >
      <p title={task.task} className={`cursor-pointer w-fit ${showDescription ? "max-w-[6rem]" : ""}`} onClick={() => setShowDescription(!showDescription)}>{task.task}</p>
      {showDescription && <><div className="h-full border-r-1 border-primary w-[1px]"></div>
        <p>{task.descriptions}</p></>}
      <LuX className="col-span-1 cursor-pointer" onClick={() => onRemoveTask(id)} />
    </div>
  );
};

export default Task;
