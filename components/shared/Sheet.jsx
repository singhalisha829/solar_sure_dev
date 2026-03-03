import { cn } from "@/utils/utils";
import React, { createContext, useContext, useState } from "react";
import Button from "./Button";
import { MdMenu } from "react-icons/md";
import { LuX } from "react-icons/lu";

const SheetContext = createContext();

const useSheet = () => {
  const context = useContext(SheetContext);
  if (!context) {
    throw new Error("useSheet must be used within a Sheet");
  }
  return context;
};

const Sheet = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <SheetContext.Provider value={{ setIsOpen, isOpen }}>
      {children}
    </SheetContext.Provider>
  );
};

const SheetTrigger = ({ children }) => {
  const { isOpen, setIsOpen } = useSheet();
  return (
    <button
      className={"flex items-center justify-center bg-orange-500/10 text-primary rounded-md md:hidden p-2 print:hidden"}
      onClick={() => setIsOpen((prev) => !prev)}
    >
      <MdMenu />
    </button>
  );
};
const SheetContent = ({ children }) => {
  const { isOpen, setIsOpen } = useSheet();
  return (
    <>
      <div
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "bg-zinc-900/10 z-[500000000] inset-0",
          isOpen ? "fixed" : "hidden"
        )}
      ></div>
      <div
        className={cn(
          "fixed top-0 bottom-0 transition-all ease-in-out z-[60000000000]",
          isOpen ? "left-0" : "-left-80"
        )}
      >
        <button className="absolute right-3 top-3 text-primary p-2" onClick={()=>setIsOpen(false)}>
          <LuX size={20}/>
        </button>
        {children}
      </div>
    </>
  );
};

export { Sheet, SheetTrigger, SheetContent, useSheet };
