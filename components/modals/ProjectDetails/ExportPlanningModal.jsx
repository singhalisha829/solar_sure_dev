import React, { useState, useEffect } from "react";
import FormModal from "../../shared/FormModal";
import Input from "../../formPage/Input";
import { toast } from "sonner";
import { getBBUVersions } from "@/services/api";
import { requestHandler } from "@/services/ApiHandler";
import Table from "@/components/SortableTable";
import { axiosInstance } from "@/services/ApiHandler";

const ExportPlanningModal = ({ onSubmit, projectId }) => {
  const [documentFormat, setDocumentFormat] = useState("");
  const [activeTab, setActiveTab] = useState("Current Version");
  const [bbuVersions, setBbuVersions] = useState([]);

  const tabs = ["Current Version", "Version History"];

  useEffect(() => {
    if (projectId) {
      fetchBbuVersion();
    }
  }, [projectId]);

  const fetchBbuVersion = async () => {
    await requestHandler(
      async () => await getBBUVersions(projectId),
      null,
      async (data) => {
        setBbuVersions(data.data.output);
      },
      toast.error
    );
  };

  const downloadDocument = async (row) => {
    try {
      const response = await axiosInstance.get(
        `/api/project/bbu-version-doc/?version=${row.id}`,
        { responseType: "blob" }
      );

      if (response.status === 200) {
        // Create URL for blob object
        const url = URL.createObjectURL(response.data);

        // Create a temporary anchor element
        const link = document.createElement("a");
        link.href = url;
        link.download = `${row.bbu_no}_versions.pdf`; // Specify the document name

        // Trigger the download by programmatically clicking the anchor element
        document.body.appendChild(link);
        link.click();

        // Clean up
        document.body.removeChild(link);
        URL.revokeObjectURL(url); // Release memory
      } else {
        toast.error("Something went wrong");
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const clearForm = () => {
    setDocumentFormat("");
  };

  const validateData = () => {
    if (documentFormat == "") {
      toast.error("Please select a Document Format!");
      return;
    }
    onSubmit(documentFormat);
  };

  const tableHeader = [
    {
      name: "BBU No.",
      sortable: true,
      key: "bbu_no",
      width: "8rem",
    },
    {
      name: "Date",
      sortable: true,
      key: "date",
      type: "date",
      width: "8rem",
    },
    {
      name: "Current BBU Amount(₹)",
      sortable: true,
      key: "current_bbu_amount",
      displayType: "price",
      width: "10rem",
    },
    {
      name: "Contingency Amount(₹)",
      sortable: true,
      key: "contigecny_amount",
      displayType: "price",
      width: "10rem",
    },
    {
      name: "Approved BBU Amount(₹)",
      sortable: true,
      key: "approved_bbu_amount",
      displayType: "price",
      width: "10rem",
    },
    {
      name: "Remark",
      sortable: true,
      key: "remark",
      width: "20rem",
    },
    {
      name: "Actions",
      type: "actions-column",
      actionType: "download-view",
      onClickDownload: downloadDocument,
      onClickView: (row) => {
        window.open(
          `/projects/contingencyDetails/${row.contingency}`,
          "_blank",
          "noopener,noreferrer"
        );
      },
    },
  ];

  return (
    <FormModal
      id={"export-planning-items"}
      heading={"Export Planning Items"}
      ctaText={"Download"}
      onSubmit={validateData}
      onClose={clearForm}
      z_index="z-[2000]"
      width="w-1/2"
    >
      <span className="flex relative">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={(e) => {
              e.preventDefault();
              setActiveTab(tab);
            }}
            className={`mr-4 flex px-4 py-1 text-sm  ${activeTab === tab
                ? "border-b-2 border-b-primary text-primary  "
                : "border-transparent"
              } focus:outline-none`}
          >
            {tab}
          </button>
        ))}
      </span>
      {activeTab == "Current Version" && (
        <div className="grid grid-cols-2 gap-4">
          <p className="col-span-2 text-sm">
            Please select the format you want to download your Planning data in.
          </p>
          <Input
            radio={true}
            radioOptions={[
              { option: "Download as PDF", value: "pdf" },
              { option: "Download as Excel", value: "excel" },
            ]}
            onRadioOptionChange={(e) => setDocumentFormat(e.target.value)}
            radioOptionValue={documentFormat}
          />
        </div>
      )}

      {activeTab == "Version History" && (
        <div className="overflow-x-auto mt-2">
          <Table rows={bbuVersions ?? []} columns={tableHeader} />
        </div>
      )}
    </FormModal>
  );
};

export default ExportPlanningModal;
