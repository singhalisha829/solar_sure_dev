import React from "react";

const ProjectCatagorySidebar = ({
  selectedCatagory,
  onClick,
  selectedTab,
  hasContingencyItems,
  showMDL,
}) => {
  const catagories = [
    "Electrical",
    "Mechanical",
    "Inroof",
    "Other Structure",
    "Panel",
    "Inverter",
    "Installation",
    "Freight",
    "Other",
  ];
  return (
    <aside className="flex flex-col gap-[14px] min-w-40">
      {selectedTab === "Engineering" && showMDL && (
        <>
          <button
            className="flex px-2.5 text-zinc-800 text-sm font-bold tracking-tight disabled:border-l-2 border-secondary"
            disabled={selectedCatagory === "MDL"}
            onClick={() => onClick("MDL")}
          >
            MDL
          </button>
          <hr />
        </>
      )}

      {catagories.map((catagory, index) => (
        <button
          className="flex px-2.5 text-zinc-800 text-sm font-bold tracking-tight disabled:border-l-2 border-secondary"
          disabled={selectedCatagory === catagory}
          onClick={() => onClick(catagory)}
          key={index}
        >
          {catagory}
        </button>
      ))}

      {hasContingencyItems && (
        <>
          <hr />
          <button
            className="flex px-2.5 text-zinc-800 text-sm font-bold tracking-tight disabled:border-l-2 border-orange-400"
            disabled={selectedCatagory === "Contingency"}
            onClick={() => onClick("Contingency")}
          >
            Contingency
          </button>
        </>
      )}
    </aside>
  );
};

export default ProjectCatagorySidebar;
