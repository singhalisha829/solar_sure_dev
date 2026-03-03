import { drawing } from "@/utils/images";
import Image from "next/image";
import React from "react";
import { LuX } from "react-icons/lu";

const File = ({ id, name, file, onRemoveFile, onHover }) => {
  return (
    <a
      href={file}
      target="_blank"
      title={onHover}
      className="flex h-[2.5rem] items-center gap-2.5 px-2.5 py-2 rounded-md bg-orange-500/10 text-primary border w-fit border-orange-500"
    >
      <Image src={drawing} alt="drawing" width={18} height={18} />
      <p>{name}</p>
      <LuX
        onClick={(e) => {
          e.preventDefault();
          onRemoveFile(id);
        }}
      />
    </a>
  );
};

export default File;
