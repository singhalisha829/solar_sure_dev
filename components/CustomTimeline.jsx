import { getStatusInTimeline } from "@/utils/formatter";
import { profilePicture } from "@/utils/images";
import { cn } from "@/utils/utils";
import Image from "next/image";
import React from "react";

const CustomTimeline = ({ tasks }) => {
  return (
    <div className="flex flex-col">
      {tasks?.map((task, idx) => (
        <div className="flex items-center gap-5 w-full py-5 " key={idx}>
          <p className="shrink-0 text-slate-700 text-xs font-semibold leading-[10px] min-w-[100px]">
            {new Date(task.planned_start_date).toLocaleDateString("en-US", {
              // weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <div
            className={cn(
              "w-[20px] h-[20px]  rounded-full shrink-0 z-30 bg-gradient-to-b from-orange-500 to-orange-200",
              idx !== tasks.length - 1 ? "dot" : "",
              getStatusInTimeline(
                task?.planned_start_date,
                task?.planned_end_date
              ) === "In Progress" &&
              "bg-gradient-to-b from-zinc-400 to-gray-200"
            )}
          ></div>
          <div className="flex items-center gap-5 grow pr-5 shrink-0">
            <p className="text-slate-700 text-xs font-bold leading-[10px] w-60">
              {task.task_name}
              {task?.header_name && (
                <span className="text-primary">({task?.header_name})</span>
              )}
            </p>
            <div className=" custom-class border border-zinc-300 rounded-md h-11 flex justify-between items-center py-3 px-4 grow bg-white shadow shadow-zinc-300">
              <div className="flex items-center gap-4">
                <p className="text-neutral-500 text-xs font-normal capitalize leading-[14px]">
                  End Date:
                </p>
                <p className="text-black text-xs font-bold capitalize leading-[14px]">
                  {new Date(task.planned_end_date).toLocaleDateString("en-US", {
                    // weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-blue-500 py-[2px] pl-[2px] pr-2 ml-auto">
                <Image src={profilePicture} alt="" width={16} height={16} />
                <p className="text-white text-[10px] font-bold capitalize leading-3">
                  {task.assigned_to}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CustomTimeline;
