import { cn } from "@/utils/utils";
import React from "react";
import { LuLoader2 } from "react-icons/lu";

const Loading = ({ className, size }) => {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <LuLoader2
        className={`text-primary ${size ? size : `w-11 h-11`} animate-spin`}
      />
    </div>
  );
};

export default Loading;
