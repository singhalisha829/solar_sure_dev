import { useState, useEffect } from "react";
import { useModal } from "@/contexts/modal";
import { axiosInstance } from "@/services/ApiHandler";
import Button from "@/components/shared/Button";
import Loading from "@/components/Loading";
import dynamic from "next/dynamic";
import { LocalStorageService } from "@/services/LocalStorageHandler";
import Table from "@/components/SortableTable";
import { getBOMTemplates } from "@/services/api";
import { requestHandler } from "@/services/ApiHandler";
import { toast } from "sonner";

const BOMDetails = dynamic(
  () => import("@/components/modals/BOMTemplateProductList")
);
const AddBomTemplate = dynamic(
  () => import("../../components/modals/AddEditBOMTemplate")
);

const BOMTemplates = () => {
  const { openModal } = useModal();
  const [isLoading, setIsLoading] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [bomTemplates, setBOMTemplates] = useState([]);

  useEffect(() => {
    getBOMTemplatesHandler();
  }, []);

  const getBOMTemplatesHandler = async () => {
    await requestHandler(
      async () => await getBOMTemplates(),
      setIsLoading,
      (data) => setBOMTemplates(data.data.output),
      toast.error
    );
  };

  const accessibilityInfo =
    LocalStorageService.get("user_accessibility").accessibility[0].master.pages
      .bom_templates ?? {};

  const allowedActions =
    "download-" + (accessibilityInfo?.edit_view ? "edit" : "");

  const tableHeader = [
    {
      name: "Name",
      sortable: true,
      width: "20%",
      key: "name",
    },
    { name: "Project Type", width: "20%", sortable: true, key: "project_type" },
    { name: "Created By", width: "20%", sortable: true, key: "created_by" },
    {
      name: "Created At",
      width: "20%",
      sortable: true,
      key: "created_at",
      type: "date",
    },
    {
      name: "Actions",
      type: "actions-column",
      actionType: allowedActions,
      onClickDownload: (row) => {
        downloadSample(row);
      },
      onClickEdit: (row) => {
        setSelectedRow(row);
        openModal("edit-bom-template");
      },
      width: "5rem",
      sortable: true,
    },
  ];

  const downloadSample = async (row) => {
    const response = await axiosInstance.get(
      `/api/project/bom-items-templates/?project_type=${row?.project_type}&bom_head=${row?.name}`,
      { responseType: "blob" }
    );

    if (response.status === 200) {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `${row?.project_type}_${row?.name}_template.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } else {
      toast.error("Something went wrong");
    }
  };

  const handleRowClick = (data) => {
    setSelectedRow(data);
    openModal("bom-template-details");
  };

  return (
    <>
      <div className="flex justify-between items-center gap-4">
        <h2 className="text-primary text-xl font-bold tracking-tight">
          BOM Templates
        </h2>

        {accessibilityInfo?.add_view && (
          <Button
            className="px-3"
            onClick={() => openModal("add-bom-template")}
          >
            Add BOM Template
          </Button>
        )}
      </div>
      {!isLoading && (
        <div className="min-h-[85vh] overflow-hidden bg-white p-5">
          <div className="overflow-auto h-full">
            <Table
              columns={tableHeader}
              rows={bomTemplates}
              {...(accessibilityInfo?.view_details && {
                onRowClick: (row) => {
                  handleRowClick(row);
                },
              })}
            />
          </div>
        </div>
      )}
      {isLoading && <Loading />}
      <BOMDetails modalId={"bom-template-details"} bomDetails={selectedRow} />
      <AddBomTemplate
        modalId={"add-bom-template"}
        onSuccessfullSubmit={getBOMTemplates}
      />
      <AddBomTemplate
        modalId={"edit-bom-template"}
        itemDetails={selectedRow}
        onSuccessfullSubmit={getBOMTemplates}
      />
    </>
  );
};

export default BOMTemplates;
