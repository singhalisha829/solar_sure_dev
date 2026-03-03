import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";

import { useProject } from "@/contexts/project";
import { useModal } from "@/contexts/modal";

import Loading from "@/components/shared/Loading";
import Button from "@/components/shared/Button";
import ProcurementTable from "../ProcurementTable";
import { LocalStorageService } from "@/services/LocalStorageHandler";
import { getPackingList, getInvoices } from "@/services/api";
import Table from "@/components/SortableTable";
import { requestHandler } from "@/services/ApiHandler";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { axiosInstance } from "@/services/ApiHandler";
import { formatPrice } from "@/utils/numberHandler";

const PackingListItems = dynamic(
  () => import("@/components/modals/PackingListItems")
);

const InvoiceItemList = dynamic(
  () => import("@/components/modals/InvoiceItemList")
);
const ProjectInstallationFreight = dynamic(
  () =>
    import(
      "@/components/project-components/ProjectDetails/ProjectInstallationFreight"
    )
);

const ViewPackingListItemDetails = dynamic(
  () => import("@/components/modals/ProjectDetails/ViewPackingListItemDetails")
);

const ProjectProcurement = ({
  selectedCatagory,
  accessInfo,
  installationItems,
}) => {
  const router = useRouter();
  const { projectId } = router.query;
  const packingListSectionRef = useRef(null);
  const { openModal } = useModal();
  const { getProjectDetailsHandler, isLoading, projectDetails } = useProject();
  const sections = projectDetails?.bom_heads;
  const [packingList, setPackingList] = useState([]);
  const [invoiceList, setInvoiceList] = useState([]);
  const [totalInvoiceAmount, setTotalInvoiceAmount] = useState({
    with_tax: 0,
    without_tax: 0,
  });
  const [selectedPackingListRow, setSelectedPackingListRow] = useState(null);
  const [selectedInvoiceListRow, setSelectedInvoiceListRow] = useState(null);
  const [showPackingListButton, setShowPackingListButton] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [activeTab, setActiveTab] = useState("Packing List");

  const tabs = ["Packing List", "Invoice List"];

  const procurementCategory =
    selectedCatagory === "Other Structure"
      ? "Other_structure"
      : selectedCatagory;

  const allowedActions =
    "download-" +
    (accessInfo?.edit_packing_list ? "edit-" : "") +
    (accessInfo?.upload_invoice ? "upload" : "");

  const tableHeader = [
    {
      name: "Packing List No.",
      sortable: true,
      key: "packing_list_no",
      width: "20%",
    },
    {
      name: "Date",
      sortable: true,
      key: "date",
      type: "date",
      width: "20%",
    },
    {
      name: "Status",
      sortable: true,
      key: "status",
      width: "20%",
    },
    {
      name: "Created By",
      sortable: true,
      key: "created_by_name",
      width: "10rem",
    },
    {
      name: "Created At",
      sortable: true,
      key: "created_at",
      type: "created_at",
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
      type: "actions-column-packing-list",
      actionType: allowedActions,
      width: "5rem",
      onClickDownload: (row) => {
        downloadDocument(row);
      },
      onClickEdit: (row) => {
        LocalStorageService.set("edit-packing-list-items", row);
        router.push("/packing-list/edit-packing-list/");
      },
      onClickUploadInvoice: (row) => {
        LocalStorageService.set("upload-packing-list-invoice", row);
        router.push("/invoices/upload-invoice/");
      },
    },
  ];

  const tableHeaderForInvoices = [
    {
      name: "Invoice No.",
      sortable: true,
      key: "invoice_no",
      type: "document",
      document_key: "invoice_doc",
      width: "10rem",
    },
    {
      name: "Date",
      type: "date",
      sortable: true,
      key: "invoice_date",
      width: "6rem",
    },
    {
      name: "Invoice Amount (Without Tax)(₹)",
      sortable: true,
      key: "invoice_amount_without_gst",
      displayType: "price",
      width: "11rem",
    },
    {
      name: "Invoice Amount (With Tax)(₹)",
      sortable: true,
      key: "invoice_amount_with_gst",
      displayType: "price",
      width: "11rem",
    },
    {
      name: "Status",
      sortable: true,
      key: "status",
      width: "8rem",
    },
    {
      name: "Remark",
      sortable: true,
      key: "remark",
    },
  ];

  useEffect(() => {
    if (sections) {
      Object.keys(sections).map((sectionName) => {
        if (
          !sections[sectionName].every((section) => section.bbu_amount == 0)
        ) {
          getPackingListLength();
          getInvoiceListLength();
        }
      });
    }
  }, [sections]);

  const getPackingListLength = async () => {
    await requestHandler(
      async () => await getPackingList({ project: projectId }),
      null,
      async (data) => {
        if (data.data.output.length > 0) {
          setPackingList(data.data.output);
        } else {
          setShowPackingListButton(true);
        }
      },
      toast.error
    );
  };

  const getInvoiceListLength = async () => {
    await requestHandler(
      async () => await getInvoices({ project: projectId }),
      null,
      async (data) => {
        if (data.data.output.length > 0) {
          let with_tax = 0,
            without_tax = 0;
          data.data.output.map((invoice) => {
            with_tax += Number(invoice.invoice_amount_with_gst || 0);
            without_tax += Number(invoice.invoice_amount_without_gst || 0);
          });
          setInvoiceList(data.data.output);
          setTotalInvoiceAmount({
            with_tax: with_tax,
            without_tax: without_tax,
          });
        }
      },
      toast.error
    );
  };

  const redirectToCreatePackingList = () => {
    LocalStorageService.set("packing-list-items", {
      bom_heads: projectDetails?.bom_heads,
      project_id: projectId,
      project_details:
        projectDetails?.name !== ""
          ? projectDetails?.name
          : projectDetails?.company_name,
    });
    router.push(`/packing-list/create-packing-list/${projectId}`);
  };

  const downloadDocument = async (row) => {
    try {
      const response = await axiosInstance.get(
        `/api/project/packing_list_doc/?packing_list_id=${row.id}`,
        { responseType: "blob" }
      );

      if (response.status === 200) {
        // Create URL for blob object
        const url = URL.createObjectURL(response.data);

        // Create a temporary anchor element
        const link = document.createElement("a");
        link.href = url;
        link.download = `${row.packing_list_no}(${row.project_company_name}).pdf`; // Specify the document name

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

  return (
    <div className="flex flex-col gap-5 grow overflow-scroll">
      {/* displaying packing list */}
      {accessInfo.view_packing_list &&
        packingList.length > 0 &&
        accessInfo?.view_invoice_list &&
        invoiceList.length > 0 && (
          <span className="flex relative">
            {tabs.map((tab, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.preventDefault();
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
          </span>
        )}

      {accessInfo.view_packing_list && (
        <>
          <div className="flex flex-col gap-2.5 ">
            {activeTab === "Packing List" && (
              <>
                <div className="flex justify-between items-center">
                  <h4 className="text-zinc-800 text-xl font-bold tracking-tight">
                    Packing List
                  </h4>

                  <div className="flex gap-4">
                    {accessInfo?.create_packing_list && (
                      <Button
                        className={"px-2"}
                        onClick={redirectToCreatePackingList}
                      >
                        Create Packing List
                      </Button>
                    )}
                  </div>
                </div>
                <div className="overflow-scroll max-h-[40vh]">
                  <Table
                    columns={tableHeader}
                    rows={packingList}
                    showSerialNumber={true}
                    onRowClick={(row) => {
                      setSelectedPackingListRow(row);
                      openModal("packing-list-items");
                    }}
                  />
                </div>
              </>
            )}
            {/* displaying invoice list */}
            {activeTab === "Invoice List" && (
              <>
                <div className="flex flex-col gap-2.5">
                  <div className="flex justify-between items-center">
                    <h4 className="text-zinc-800 text-xl font-bold tracking-tight">
                      Invoice List{" "}
                      <span className="text-base">
                        (Total Invoice Amount- With Tax: ₹
                        {formatPrice(totalInvoiceAmount.with_tax)}, Without Tax:
                        ₹{formatPrice(totalInvoiceAmount.without_tax)})
                      </span>
                    </h4>
                  </div>
                  <div className="overflow-scroll max-h-[40vh]">
                    <Table
                      columns={tableHeaderForInvoices}
                      rows={invoiceList}
                      showSerialNumber={true}
                      onRowClick={(row) => {
                        setSelectedInvoiceListRow(row);
                        openModal("display-invoice-items");
                      }}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="w-[90%] mx-auto border-b-1"></div>
        </>
      )}

      <div className="flex justify-between items-center">
        <h4 className="text-zinc-800 text-xl font-bold tracking-tight">
          {selectedCatagory}
        </h4>
        <div className="flex gap-2.5">
          {showPackingListButton && (
            <Button className={"px-2"} onClick={redirectToCreatePackingList}>
              Create Packing List
            </Button>
          )}
          {/* <Button
            className={"px-2"}
            onClick={() => openModal("book-item-quantity")}
          >
            Book Item Quantity
          </Button>
          <BookItemQuantity
            modalId={"book-item-quantity"}
            itemDetails={projectDetails?.bom_heads}
            projectId={projectId}
          /> */}
        </div>
      </div>

      {!["Installation", "Freight", "Other"].includes(selectedCatagory) ? (
        <>
          {isLoading ? (
            <Loading />
          ) : (
            <>
              {sections &&
              sections[procurementCategory] &&
              sections[procurementCategory].every(
                (section) => section.bbu_amount == 0
              ) ? (
                <div>
                  <p>
                    No planning has been conducted for the{" "}
                    <strong>{selectedCatagory}</strong> aspect of the project.
                  </p>
                </div>
              ) : (
                sections?.[procurementCategory]?.map((section) => {
                  if (section.bbu_amount != 0) {
                    return (
                      <ProcurementSection
                        getProjectDetailsHandler={getProjectDetailsHandler}
                        key={section.id}
                        section={section}
                        onClickRow={(row) => {
                          openModal("show-packing-list-item-details");
                          setSelectedRow(row);
                        }}
                      />
                    );
                  }
                })
              )}
            </>
          )}
        </>
      ) : (
        <ProjectInstallationFreight
          activeSubTab={selectedCatagory}
          totalItems={installationItems}
        />
      )}

      {selectedPackingListRow && (
        <PackingListItems details={selectedPackingListRow} />
      )}
      {selectedInvoiceListRow && (
        <InvoiceItemList details={selectedInvoiceListRow} />
      )}
      <ViewPackingListItemDetails
        selectedItem={selectedRow}
        projectId={projectId}
      />
    </div>
  );
};

function ProcurementSection({ section, onClickRow }) {
  const { bom_items } = section;

  const sortedBomItems = bom_items.sort((a, b) => {
    const quantityA = parseInt(
      a.bom_items_quantity_left_after_booking.quantity
    );
    const quantityB = parseInt(
      b.bom_items_quantity_left_after_booking.quantity
    );

    if (quantityA === 0 && quantityB !== 0) return 1;
    if (quantityA !== 0 && quantityB === 0) return -1;
    return 0;
  });

  const tableHeader = [
    { name: "Item Code", width: "7rem", key: "product_code" },
    { name: "Item", width: "8rem", key: "item_name" },
    { name: "Make", width: "8rem", key: "make_name" },
    { name: "Quantity", width: "7rem", key: "quantity_new" },
    {
      name: "Packing List Quantity",
      width: "8rem",
      key: "bom_items_booked_quantity_new",
    },
    {
      name: "Left Quantity",
      width: "w-[5%]",
      key: "bom_items_quantity_left_after_booking",
      type: "quantity_object",
    },

    { name: "Inventory", width: "w-[5%]", key: "inventory_new" },
    {
      name: "Packing List Quantity",
      width: "8rem",
      key: "booked_inventory",
    },
    {
      name: "Left Quantity",
      width: "w-[10%]",
      key: "left_inventory_after_booking",
    },
  ];

  const parentTableHeader = [
    {
      name: "",
      colSpan: 1,
    },
    {
      name: "",
      colSpan: 1,
    },
    {
      name: "",
      colSpan: 1,
    },
    {
      name: "BOM Items",
      colSpan: 3,
    },
    {
      name: "Inventory",
      colSpan: 3,
    },
  ];

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex justify-between items-center">
        <p className="text-zinc-800 text-lg font-bold tracking-tight">
          {section.name}
        </p>
      </div>
      <div className="overflow-scroll">
        <ProcurementTable
          rows={sortedBomItems}
          parentTableHeader={parentTableHeader}
          columns={tableHeader}
          onRowClick={(row) => {
            onClickRow(row);
          }}
        />
      </div>
    </div>
  );
}

export default ProjectProcurement;
