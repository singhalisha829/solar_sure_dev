import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";

import { useProject } from "@/contexts/project";
import { useModal } from "@/contexts/modal";

import Loading from "@/components/shared/Loading";
import Button from "@/components/shared/Button";
import { LocalStorageService } from "@/services/LocalStorageHandler";
import {
  getPurchaseOrders,
  getPurchaseOrderDetails,
  getPurchaseOrderItemList,
} from "@/services/api";
import Table from "@/components/SortableTable";
import { requestHandler } from "@/services/ApiHandler";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import Search from "@/components/shared/SearchComponent";
import { formatPrice } from "@/utils/numberHandler";

const ProjectInstallationFreight = dynamic(
  () =>
    import(
      "@/components/project-components/ProjectDetails/ProjectInstallationFreight"
    )
);
const PurchaseOrderItems = dynamic(
  () => import("@/components/modals/PurchaseOrder/PurchaseOrderDetails")
);

const ProcurmentItemDetails = dynamic(
  () => import("@/components/modals/ProjectDetails/ViewProcurementItemDetails")
);

const ProjectPurchaseOrder = ({
  selectedCatagory,
  accessInfo,
  installationItems,
}) => {
  const router = useRouter();
  const { projectId } = router.query;
  const packingListSectionRef = useRef(null);
  const { openModal } = useModal();
  const { isLoading, projectDetails } = useProject();
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [poItemList, setPoItemList] = useState([]);
  const [search, setSearch] = useState("");
  const [totalPoAmount, setTotalPoAmount] = useState(0);
  const [nopaPortalDetails, setNopaPortalDetails] = useState({
    baseUrl: "",
    token: "",
  });

  const accessibilityInfo =
    LocalStorageService.get("user_accessibility")?.accessibility[0]
      .purchase_order ?? {};

  const tableHeader = [
    {
      name: "Project",
      key: "project_name",
      sortable: true,
      width: "150px",
    },
    {
      name: "PO Number",
      key: "purchase_order_number",
      sortable: true,
      width: "150px",
    },
    {
      name: "Date",
      sortable: true,
      key: "purchase_order_date",
      type: "date",
      width: "100px",
    },
    {
      name: "Revision No",
      sortable: true,
      key: "revision_number",
      width: "130px",
    },
    {
      name: "Site",
      sortable: true,
      key: "site_name",
      width: "150px",
    },
    {
      name: "PO Amount(₹)",
      sortable: true,
      displayType: "price",
      key: "total_po_amount",
      width: "150px",
    },
    {
      name: "Vendor",
      sortable: true,
      key: "vendor_name",
      width: "250px",
    },
    {
      name: "Status",
      sortable: true,
      key: "status",
      width: "10rem",
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
      type: "created_at",
      key: "created_at",
      width: "10rem",
    },
    {
      name: "Actions",
      type: "actions-column",
      actionType: accessibilityInfo?.edit_view ? "edit-download" : "download",
      onClickEdit: (row) => {
        router.push({
          pathname: `/purchase-order/${row.id}`,
          query: { project: projectId },
        });
      },
      onClickDownload: (row) => {
        handlePODownload(row.purchase_order_number);
      },
    },
  ];

  useEffect(() => {
    getPurchaseOrderList();
    getPurchaseOrderItems();
  }, []);

  const getPurchaseOrderList = async (searchText = "") => {
    let queryParams = { project: projectId };
    if (searchText != "") {
      queryParams.search = searchText;
    }
    await requestHandler(
      async () => await getPurchaseOrders(queryParams),
      null,
      (data) => {
        let sum = 0;
        data.data.output.map((po) => {
          sum += Number(po.total_po_amount || 0);
        });
        setPurchaseOrders(data.data.output);
        setNopaPortalDetails({
          baseUrl: data.download_base_url,
          token: data.NOPA_PORTAL_TOKEN,
        });
        setTotalPoAmount(sum);
      },
      toast.error
    );
  };

  const getPurchaseOrderItems = async () => {
    await requestHandler(
      async () => await getPurchaseOrderItemList(projectId),
      null,
      (data) => {
        const convertedData = data.data.output.reduce(
          (acc, { bom_head, product_list }) => {
            acc[bom_head] = product_list;
            return acc;
          },
          {}
        );

        setPoItemList(convertedData);
      },
      toast.error
    );
  };

  const handlePODownload = async (poNumber) => {
    try {
      const response = await fetch(
        `${nopaPortalDetails?.baseUrl}api/po/fetch-po-pdf/?po_no=${poNumber}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/pdf",
            Authorization: "Bearer " + nopaPortalDetails?.token,
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
    } catch (error) {
      toast.error("Error fetching PDF:", error);
    }
  };

  const redirectToCreatePurchaseOrder = () => {
    LocalStorageService.set("purchase-order-project", {
      id: projectId,
      project_name: projectDetails?.name,
      section: selectedCatagory,
      site_details: {
        name: projectDetails?.project_site_name,
        address: projectDetails?.project_site_address_1,
        city_name: projectDetails?.project_site_city_name,
        city: projectDetails?.project_site_city_id,
        state_name: projectDetails?.project_site_state_name,
        state: projectDetails?.project_site_state_id,
        gst: projectDetails?.project_site_gst,
        pincode: projectDetails?.project_site__pincode,

        poc_name: projectDetails?.primary_poc_client_name,
        poc_email: projectDetails?.primary_poc_email,
        poc_contact: projectDetails?.primary_poc_phone,
      },
    });
    router.push(`/purchase-order/create-order/`);
  };

  const fetchPurchaseOrderItems = async (id) => {
    await requestHandler(
      async () => await getPurchaseOrderDetails({ id: id }),
      null,
      (data) => {
        setSelectedRow(data.data.output[0]);
        openModal("view-purchase-order-items");
      },
      toast.error
    );
  };

  return (
    <div className="flex flex-col gap-5 grow overflow-scroll">
      {/* displaying packing list */}
      {purchaseOrders.length > 0 && (
        <>
          <div ref={packingListSectionRef} className="flex flex-col gap-2.5">
            <div className="flex justify-between items-center">
              <h4 className="text-zinc-800 text-xl font-bold tracking-tight">
                Purchase Order{" "}
                <span className="text-base">
                  (Total PO Amount: ₹{formatPrice(totalPoAmount)})
                </span>
              </h4>

              <div className="flex gap-4">
                {search !== "" && (
                  <Button
                    onClick={() => {
                      setSearch("");
                      getPurchaseOrderList();
                    }}
                    className={"px-2"}
                  >
                    Clear Filters
                  </Button>
                )}
                <Search
                  searchText={(data) => {
                    setSearch(data);
                    getPurchaseOrderList(data);
                  }}
                  searchPlaceholder="Search.."
                  value={search}
                />
                {accessInfo?.add_view && (
                  <Button
                    className={"px-2"}
                    onClick={redirectToCreatePurchaseOrder}
                  >
                    Create Purchase Order
                  </Button>
                )}
              </div>
            </div>
            <div className="overflow-scroll max-h-[40vh]">
              <Table
                columns={tableHeader}
                rows={purchaseOrders}
                editPurchaseOrder={true}
                onRowClick={(row) => {
                  fetchPurchaseOrderItems(row.id);
                }}
              />
            </div>
          </div>
          <div className="w-[90%] mx-auto border-b-1"></div>
        </>
      )}

      <div className="flex justify-between items-center">
        <h4 className="text-zinc-800 text-xl font-bold tracking-tight">
          {selectedCatagory}
        </h4>
        <div className="flex gap-2.5">
          {purchaseOrders.length == 0 && accessInfo?.add_view && (
            <Button className={"px-2"} onClick={redirectToCreatePurchaseOrder}>
              Create Purchase Order
            </Button>
          )}
        </div>
      </div>

      {!["Installation", "Freight", "Other"].includes(selectedCatagory) ? (
        <>
          {isLoading ? (
            <Loading />
          ) : (
            <>
              {poItemList && poItemList[selectedCatagory]?.length > 0 && (
                <ProcurementSection
                  key={selectedCatagory}
                  items={poItemList[selectedCatagory]}
                  onClickRow={(row) => {
                    openModal("show-procurment-item-details");
                    setSelectedRow(row);
                  }}
                />
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

      {selectedRow && <PurchaseOrderItems data={selectedRow} />}

      <ProcurmentItemDetails selectedItem={selectedRow} projectId={projectId} />
    </div>
  );
};

function ProcurementSection({ items, key, onClickRow }) {
  const sortedBomItems = items?.sort((a, b) => {
    const quantityA = parseInt(a.quantity_left_after_purchase_order.quantity);
    const quantityB = parseInt(b.quantity_left_after_purchase_order.quantity);

    if (quantityA === 0 && quantityB !== 0) return 1;
    if (quantityA !== 0 && quantityB === 0) return -1;
    return 0;
  });

  const tableHeader = [
    {
      name: "Item Code",
      key: "product_code",
      width: "130px",
    },
    {
      name: "Name",
      key: "item__name",
      width: "180px",
    },
    {
      name: "Make",
      key: "make__name",
      width: "180px",
    },
    {
      name: "Qty.",
      key: "quantity",
      type: "quantity_object",
      width: "80px",
    },
    {
      name: "PO Qty.",
      key: "booked_po_quantity",
      type: "quantity_object",
      width: "80px",
    },
    {
      name: "Left Qty.",
      key: "quantity_left_after_purchase_order",
      type: "quantity_object",
      width: "80px",
    },
    {
      name: (
        <>
          BBU
          <br />
          Unit Price(₹)
        </>
      ),
      key: "bbu_unit_price",
      displayType: "price",
      width: "120px",
    },
    {
      name: (
        <>
          Total BBU
          <br />
          Unit Price(₹)
        </>
      ),
      key: "bbu_total_price",
      displayType: "price",
      width: "120px",
    },
    {
      name: "Remarks",
      key: "remarks",
      width: "250px",
    },
  ];

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex justify-between items-center">
        <p className="text-zinc-800 text-lg font-bold tracking-tight">{key}</p>
      </div>
      <div className="overflow-scroll">
        <Table
          columns={tableHeader}
          rows={sortedBomItems}
          highlightPoItems={true}
          onRowClick={(row) => onClickRow(row)}
        />
      </div>
    </div>
  );
}

export default ProjectPurchaseOrder;
