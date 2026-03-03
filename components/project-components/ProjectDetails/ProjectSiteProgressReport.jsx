import { useState, useEffect } from "react";
import EditableTable from "../EditableTable";
import { getInstallerRemarks, getSiteProgressReport } from "@/services/api";
import { requestHandler } from "@/services/ApiHandler";
import { toast } from "sonner";
import Button from "../../shared/Button";
import { FaPlusCircle } from "react-icons/fa";
import { useModal } from "@/contexts/modal";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { LocalStorageService } from "@/services/LocalStorageHandler";

const AddSiteProgress = dynamic(
  () => import("../../modals/ProjectDetails/AddSiteProgress")
);
const SiteProgressReport = dynamic(
  () => import("../../modals/ProjectDetails/SiteProgressReport")
);
const AddInstallerRemark = dynamic(
  () => import("@/components/modals/ProjectDetails/AddInstallerRemark")
);

const ProjectSiteProgressReport = () => {
  const router = useRouter();
  const { projectId } = router.query;
  const { openModal } = useModal();
  const [progressReport, setProgressReport] = useState([]);
  const [installerRemark, setInstallerRemark] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [activeTab, setActiveTab] = useState("Site Progress Task");

  const accessibilityInfo =
    LocalStorageService.get("user_accessibility").accessibility[0].projects
      .site_progress_report_tab ?? {};

  const tabs = ["Site Progress Task", "Installer Remark"];

  const tableColumns = [
    {
      name: "Date",
      key: "date",
      type: "date",
      width: "100px",
    },
    {
      name: "Site Engineer",
      key: "site_engineer_name",
      width: "100px",
    },
    {
      name: "Document",
      key: "file",
      type: "file-list",
      width: "160px",
    },
    {
      name: "Task",
      type: "task-list",
      key: "task",
      width: "160px",
    },
  ];

  const tableColumnsForInstallerRemarks = [
    {
      name: "Date",
      key: "date",
      type: "date",
      width: "100px",
    },
    {
      name: "Installer",
      key: "installer_name",
      width: "100px",
    },
    {
      name: "Document",
      key: "file_attachments",
      type: "file-list",
      width: "160px",
    },
    {
      name: "Task",
      key: "task_name",
      width: "120px",
    },
    {
      name: "Remark",
      key: "descriptions",
      width: "160px",
    },
  ];

  useEffect(() => {
    fetchProgressReport();
    fetchInstallerRemarks();
  }, []);

  const fetchProgressReport = async () => {
    await requestHandler(
      async () => await getSiteProgressReport(projectId),
      null,
      (data) => {
        setProgressReport(data.data.output);
      },
      toast.error
    );
  };

  const fetchInstallerRemarks = async () => {
    await requestHandler(
      async () => await getInstallerRemarks(projectId),
      null,
      (data) => {
        setInstallerRemark(data.data.output);
      },
      toast.error
    );
  };

  return (
    <>
      <span className="flex relative h-[2.5rem]">
        {accessibilityInfo.installer_remark_page_view &&
          tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => {
                setActiveTab(tab);
              }}
              className={`mr-4 flex px-4 py-1  ${
                activeTab === tab
                  ? "border-b-2 border-b-primary text-primary  "
                  : "border-transparent"
              } focus:outline-none`}
            >
              {tab}
            </button>
          ))}

        {accessibilityInfo?.add_view && activeTab === "Site Progress Task" && (
          <Button
            className={"absolute px-2 h-fit right-2"}
            onClick={() =>
              openModal(`add-${activeTab.toLowerCase().split(" ").join("-")}`)
            }
          >
            <FaPlusCircle />
            Add Site Progress Task
          </Button>
        )}
        {accessibilityInfo?.installer_remark_add_view &&
          activeTab === "Installer Remark" && (
            <Button
              className={"absolute px-2 h-fit right-2"}
              onClick={() =>
                openModal(`add-${activeTab.toLowerCase().split(" ").join("-")}`)
              }
            >
              <FaPlusCircle />
              Add Installer Remark
            </Button>
          )}
      </span>

      {activeTab === "Site Progress Task" && (
        <div className="overflow-x-auto">
          <EditableTable
            onEditSuccess={fetchProgressReport}
            isModalOpenOnEdit={"edit-task"}
            isEditMode={accessibilityInfo?.edit_view}
            rows={progressReport}
            columns={tableColumns}
            projectId={projectId}
            onRowClick={(row) => {
              setSelectedRow(row);
              openModal("site-progress-report-" + row.id);
            }}
          />
          <AddSiteProgress
            modalId={"add-site-progress-task"}
            projectId={projectId}
            onSuccessfullSubmit={fetchProgressReport}
          />
        </div>
      )}

      {activeTab === "Installer Remark" && (
        <div className="overflow-x-auto">
          <EditableTable
            onEditSuccess={fetchProgressReport}
            isModalOpenOnEdit={"edit-task"}
            // isEditMode={accessibilityInfo?.edit_view}
            rows={installerRemark}
            columns={tableColumnsForInstallerRemarks}
            projectId={projectId}
            onRowClick={(row) => {
              setSelectedRow(row);
              openModal("site-progress-report-" + row.id);
            }}
          />
          <AddInstallerRemark
            modalId={"add-installer-remark"}
            projectId={projectId}
            onSuccessfullSubmit={fetchInstallerRemarks}
          />
        </div>
      )}
      <SiteProgressReport
        modalId={"site-progress-report-" + selectedRow?.id}
        details={selectedRow}
        heading={activeTab}
      />
    </>
  );
};

export default ProjectSiteProgressReport;
