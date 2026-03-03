import { useState, useEffect } from "react";
import Loading from "@/components/shared/Loading";
import { useProject } from "@/contexts/project";

import PlanningSection from "./PlanningSection";
import Button from "@/components/shared/Button";
import { LuDownload } from "react-icons/lu";
import { useModal } from "@/contexts/modal";
import dynamic from "next/dynamic";
import { LocalStorageService } from "@/services/LocalStorageHandler";
import { toast } from "sonner";
import { useRouter } from "next/router";
import { axiosInstance } from "@/services/ApiHandler";

const PlanningApprovalModal = dynamic(
  () => import("@/components/modals/PlanningApprovalModal")
);
const ProjectInstallationFreight = dynamic(
  () =>
    import(
      "@/components/project-components/ProjectDetails/ProjectInstallationFreight"
    )
);
const ProjectContingency = dynamic(
  () =>
    import(
      "@/components/project-components/ProjectDetails/ProjectContingency/ProjectContingency"
    )
);
const ExportPlanningModal = dynamic(
  () => import("@/components/modals/ProjectDetails/ExportPlanningModal")
);

const ProjectPlanning = ({ selectedCatagory, userInfo, installationItems }) => {
  const {
    isLoading,
    projectDetails,
    getProjectDetailsHandler,
    fetchProjectContigency,
    contigencyBomList,
  } = useProject();
  const { openModal, closeModal } = useModal();
  const router = useRouter();
  const { projectId } = router.query;

  const [zeroBbuPriceItems, setZeroBbuPriceItems] = useState([]);

  const sections = projectDetails?.bom_heads;

  useEffect(() => {
    fetchProjectContigency();
  }, []);

  const accessibilityInfo =
    LocalStorageService.get("user_accessibility").accessibility[0].projects
      .planning_tab ?? {};

  const planningCategory =
    selectedCatagory === "Other Structure"
      ? "Other_structure"
      : selectedCatagory;

  const checkAllItemsBbuPrice = () => {
    let filteredItems = [];

    // Loop through each category in bom_heads
    Object.values(sections).forEach((sections) => {
      // Loop through each section in the category
      sections.forEach((section) => {
        // Filter the bom_items based on the condition
        const filteredBomItems = section.bom_items.filter(
          (item) => item.bbu_unit_price == 0 || item.bbu_unit_price === null
        );

        // Add the filtered items to the result array
        filteredItems = [...filteredItems, ...filteredBomItems];
      });
    });
    if (filteredItems.length > 0) {
      setZeroBbuPriceItems(filteredItems);
    } else {
      handleExportItemsPdf();
    }
  };

  const handleExportItemsPdf = async () => {
    try {
      const response = await fetch(
        `${process.env.SERVER}/api/project/bbu-doc/?project_id=${projectDetails?.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/pdf",
            Authorization: "token " + LocalStorageService.get("access_token"),
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch PDF");
      }

      const blob = await response.blob();

      // Create a URL for the PDF Blob
      const pdfUrl = URL.createObjectURL(blob);

      // Open PDF in a new tab
      window.open(pdfUrl, "_blank");
      getProjectDetailsHandler();
      setZeroBbuPriceItems([]);
      closeModal("export-planning-items");
    } catch (error) {
      toast.error("Error fetching PDF:", error);
    }
  };

  const handleExportItemsExcel = async () => {
    try {
      const response = await axiosInstance.get(
        `/api/project/bbu-sheet/?project_id=${projectId}`,
        { responseType: "blob" }
      );
      if (response.status === 200) {
        // Create a Blob object from the response data
        const blob = new Blob([response.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // MIME type for Excel
        });

        // Create a URL for the Blob object
        const url = URL.createObjectURL(blob);

        // Create a temporary anchor element
        const link = document.createElement("a");
        link.href = url;
        link.download = `PlanningItems.xlsx`; // Specify the Excel file name

        // Trigger the download by programmatically clicking the anchor element
        document.body.appendChild(link);
        link.click();

        // Clean up
        document.body.removeChild(link);
        URL.revokeObjectURL(url); // Release memory
        closeModal("export-planning-items");
      } else {
        toast.error("Something went wrong");
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="flex flex-col gap-5 grow overflow-x-auto">
      <div className="flex justify-between items-center">
        <h4 className="text-zinc-800 text-xl font-bold tracking-tight">
          {selectedCatagory}
        </h4>
        {selectedCatagory !== "Installation" && (
          <div className="flex gap-2 items-end">
            {accessibilityInfo?.bbu_excel_export && (
              <Button
                className={"px-4"}
                title={"Export Planning Items"}
                onClick={() => {
                  if (
                    projectDetails?.planning_section_approval === "Approved"
                  ) {
                    openModal("export-planning-items");
                  } else {
                    checkAllItemsBbuPrice();
                  }
                }}
              >
                <LuDownload size={14} />
                Export
              </Button>
            )}
            <Button
              className={"px-4 w-[10rem]"}
              disabled={
                projectDetails?.project_sections_approval_list?.filter(
                  (approval) => approval.status === "Pending"
                )?.length == 0 &&
                projectDetails?.project_sections_approval_list?.filter(
                  (approval) => approval.status !== "Pending"
                )?.length == 0
              }
              title={"Export Planning Items"}
              onClick={() => openModal("planning-approval-modal")}
            >
              {projectDetails?.planning_section_approval === "Approved"
                ? "Approval List"
                : "Approve"}
            </Button>
          </div>
        )}
      </div>

      {zeroBbuPriceItems.length > 0 && (
        <span className="text-red-500 text-sm">
          Error : BBU Unit Price is not set for the following items -{" "}
          <strong>
            {zeroBbuPriceItems
              .map((item) => {
                return `${item.product_code}(${item.item_name})`;
              })
              .join(", ")}
          </strong>
          .
        </span>
      )}

      {isLoading ? (
        <Loading />
      ) : (
        selectedCatagory !== "Installation" && (
          <>
            {sections &&
              sections[planningCategory] &&
              sections[planningCategory]?.map((section) => {
                const bomItems = section.bom_items;
                const sortedData =
                  bomItems.length > 0
                    ? bomItems.sort(
                      (a, b) => a.bbu_unit_price - b.bbu_unit_price
                    )
                    : bomItems;
                return (
                  <PlanningSection
                    tab="Planning"
                    key={section.id}
                    section={{ ...section, bom_items: sortedData }}
                    userInfo={userInfo}
                    selectedCatagory={planningCategory}
                  />
                );
              })}
          </>
        )
      )}

      {/* project installation details */}
      {["Installation", "Freight", "Other"].includes(selectedCatagory) && (
        <ProjectInstallationFreight
          activeSubTab={selectedCatagory}
          totalItems={installationItems}
          projectCapacity={projectDetails?.project_capacity}
          tab={"Planning"}
        />
      )}

      {selectedCatagory === "Contingency" && (
        <ProjectContingency
          contigencyBomList={contigencyBomList}
          contingencyItemList={projectDetails?.bom_item_contingency_list}
          installationFreightItems={installationItems.filter(
            (item) => item.is_contigency
          )}
          projectCapacity={projectDetails?.project_capacity}
          tab={"Planning"}
        />
      )}
      <PlanningApprovalModal
        onSuccessfullSubmit={getProjectDetailsHandler}
        approvalList={projectDetails?.project_sections_approval_list}
        defaultActiveTab={
          projectDetails?.planning_section_approval === "Approved" ||
            projectDetails?.project_sections_approval_list?.filter(
              (approval) => approval.status === "Pending"
            )?.length == 0
            ? "Approval History"
            : "Approval Form"
        }
      />

      <ExportPlanningModal
        projectId={projectId}
        onSubmit={(docFormat) => {
          if (docFormat === "pdf") {
            checkAllItemsBbuPrice();
          } else {
            handleExportItemsExcel();
          }
        }}
      />
    </div>
  );
};

export default ProjectPlanning;
