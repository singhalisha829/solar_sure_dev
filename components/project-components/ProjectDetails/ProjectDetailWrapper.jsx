import { cn } from "@/utils/utils";
import React from "react";

const ProjectDetailWrapper = ({ children, className }) => {
  return (
    <div
      className={cn(
        "border border-zinc-100 rounded-md p-5 grow flex gap-5 h-full",
        className
      )}
    >
      {children}
    </div>
  );
};

export default ProjectDetailWrapper;
