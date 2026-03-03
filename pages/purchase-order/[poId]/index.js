import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { MdArrowForwardIos } from "react-icons/md";
import {
  getPurchaseOrderDetails,
  getPurchaseOrderItemList,
  editPurchaseOrder,
  getPurchaserList,
  fetchPOExtraCharges,
  getPurchaseOrderItemListForOthers,
} from "@/services/api";
import { toast } from "sonner";
import { requestHandler } from "@/services/ApiHandler";
import Table from "@/components/SortableTable";
import Button from "@/components/shared/Button";
import { useModal } from "@/contexts/modal";
import { FaPlusCircle, FaPen } from "react-icons/fa";
import { dateFormat } from "@/utils/formatter";
import { formatPrice } from "@/utils/numberHandler";
import dynamic from "next/dynamic";

const EditPurchaseOrderDetails = dynamic(
  () => import("@/components/modals/EditPurchaseOrder")
);
const WarningModal = dynamic(() => import("@/components/modals/WarningModal"));
const AddPurchaseOrderItem = dynamic(
  () => import("@/components/modals/PurchaseOrder/AddPurchaseOrderItems")
);
const AddExtraCharge = dynamic(
  () => import("@/components/modals/PurchaseOrder/AddExtraCharge")
);

const EditPurchaseOrder = () => {
  const router = useRouter();
  const { poId, project } = router.query;
  const { openModal, closeModal } = useModal();
  const [purchaseOrderDetails, setPurchaseOrderDetails] = useState(null);
  const [unpackedItems, setUnpackedItems] = useState([]);
  const [showEntireOtherTerms, setShowEntireOtherTerms] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [purchasers, setPurchasers] = useState([]);
  const [extraChargesList, setExtraChargesList] = useState([]);
  const [isOthersPo, setIsOthersPo] = useState(null);

  const otherTermsRef = useRef(null);

  const tableHeader = [
    {
      name: "Item Code",
      key: "product_code",
      width: "150px",
    },
    {
      name: "Quantity",
      key: "quantity",
      displayType: "price",
      width: "100px",
    },
    {
      name: (
        <>
          Ex Works <br />
          Unit Price(₹)
        </>
      ),
      key: "ex_works_unit_price",
      displayType: "price",
      width: "130px",
    },
    {
      name: "Charges",
      key: "charges",
      width: "130px",
    },
    {
      name: "Charges Cost(₹)",
      key: "charges_cost",
      displayType: "price",
      width: "130px",
    },
    {
      name: "Unit Price(₹)",
      key: "unit_price",
      displayType: "price",
      width: "130px",
    },
    {
      name: "Taxable Amount(₹)",
      key: "taxable_amount",
      displayType: "price",
      width: "150px",
    },
    {
      name: "Tax(%)",
      key: "tax_rate",
      displayType: "price",
      width: "80px",
    },
    {
      name: "Tax Amount(₹)",
      key: "tax_amount",
      displayType: "price",
      width: "150px",
    },
    {
      name: "Total Amount(₹)",
      key: "total_amount",
      displayType: "price",
      width: "150px",
    },
    {
      name: "ETD",
      key: "etd",
      type: "date",
      width: "100px",
    },
    {
      name: "Description",
      key: "description",
      width: "250px",
    },
    {
      name: "Action",
      type: "actions-column",
      actionType: "delete",
      onClickDelete: (row) => {
        setSelectedRow(row);
        openModal("delete-purchase-order-item");
      },
    },
  ];

  const extraChargeTableHeader = [
    {
      name: "Extra Charges",
      key: "charges__name",
      type: "dropdown",
      width: "100px",
    },
    {
      name: "Charges Amount",
      key: "amount",
      displayType: "price",
      width: "150px",
    },
    {
      name: "Tax(%)",
      key: "tax_rate",
      displayType: "price",
      width: "80px",
    },
    {
      name: "Tax Amount(₹)",
      key: "tax_amount",
      displayType: "price",
      width: "120px",
    },
    {
      name: "Total Amount(₹)",
      key: "total_amount",
      displayType: "price",
      width: "150px",
    },
    {
      name: "Description",
      key: "description",
      type: "text",
    },
    {
      name: "Action",
      type: "actions-column",
      actionType: "delete",
      onClickDelete: (row) => {
        setSelectedRow(row);
        openModal("delete-purchase-order-item");
      },
    },
  ];

  const tableHeaderForOthers = [
    {
      name: "Name",
      key: "product_code",
      width: "130px",
    },
    {
      name: "Description",
      key: "description",
      width: "180px",
    },
    {
      name: "Taxable Amount(₹)",
      key: "taxable_amount",
      displayType: "price",
      width: "100px",
    },
    {
      name: "Tax(%)",
      key: "tax_rate",
      width: "120px",
    },
    {
      name: "Tax Amount(₹)",
      key: "tax_amount",
      displayType: "price",
      width: "100px",
    },
    {
      name: "Total Amount(₹)",
      key: "total_amount",
      displayType: "price",
      width: "100px",
    },
    {
      name: "ETD",
      key: "etd",
      type: "date",
      width: "100px",
    },
    {
      name: "Action",
      type: "actions-column",
      actionType: "delete",
      onClickDelete: (row) => {
        setSelectedRow(row);
        openModal("delete-purchase-order-item");
      },
    },
  ];

  useEffect(() => {
    fetchPurchaseOrderItems(poId);
    fetchPurchasers();
    fetchChargesList();
  }, []);

  useEffect(() => {
    // Check if the content exceeds two lines (adjust as per your design)
    const element = otherTermsRef.current;
    if (element) {
      const isOverflowingText = element.scrollHeight > element.clientHeight;
      setIsOverflowing(isOverflowingText);
    }
  }, [purchaseOrderDetails]);

  const fetchChargesList = async () => {
    await requestHandler(
      async () => await fetchPOExtraCharges(),
      null,
      async (data) => {
        setExtraChargesList(data.data.output);
      },
      toast.error
    );
  };

  const fetchPurchasers = async () => {
    await requestHandler(
      async () => await getPurchaserList(),
      null,
      (data) => {
        setPurchasers(data.data.output);
      },
      toast.error
    );
  };

  const fetchPurchaseOrderItems = async (id) => {
    await requestHandler(
      async () => await getPurchaseOrderDetails({ id: id }),
      null,
      (data) => {
        if (data.data.output[0].product_list.length > 0) {
          if (
            ["Installation", "Freight", "Other"].includes(
              data.data.output[0].product_list[0].section
            )
          ) {
            setIsOthersPo(true);
            getUnBookedOtherPoItems(project);
          } else {
            setIsOthersPo(false);
            getUnBookedPurchaseOrderItems(project);
          }
        } else {
          setIsOthersPo(null);
        }
        setPurchaseOrderDetails(data.data.output[0]);
      },
      toast.error
    );
  };

  const getUnBookedPurchaseOrderItems = async (id) => {
    return new Promise((resolve, reject) => {
      requestHandler(
        async () => await getPurchaseOrderItemList(id),
        null,
        (data) => {
          const filteredData = data.data.output
            .map((bom) => ({
              ...bom,
              product_list: bom.product_list.filter(
                (product) =>
                  product.quantity_left_after_purchase_order.quantity !== 0
              ),
            }))
            .filter((bom) => bom.product_list.length > 0);

          // Add section to each product
          filteredData.forEach((bom) => {
            bom.product_list.forEach((product) => {
              product.section = bom.bom_head;
            });
          });
          setUnpackedItems(filteredData);

          // Resolve the promise after state update is done
          resolve();
        },
        (error) => {
          // Reject the promise if there's an error
          toast.error(error);
          reject(error);
        }
      );
    });
  };

  const getUnBookedOtherPoItems = async (id) => {
    return new Promise((resolve, reject) => {
      requestHandler(
        async () => await getPurchaseOrderItemListForOthers(id),
        null,
        (data) => {
          const filteredData = data.data.output
            .map((bom) => ({
              ...bom,
              product_list: bom.product_list.filter(
                (product) => product.left_po_amount !== 0
              ),
            }))
            .filter((bom) => bom.product_list.length > 0);

          // Add section to each product
          filteredData.map((bom) => {
            bom.product_list.map((product) => {
              product.section = bom.bom_head;
            });
          });
          setUnpackedItems(filteredData);

          // Resolve the promise after state update is done
          resolve();
        },
        (error) => {
          // Reject the promise if there's an error
          toast.error(error);
          reject(error);
        }
      );
    });
  };

  const deleteItem = () => {
    if (selectedRow?.charges__name) {
      handleDeleteCharges(selectedRow);
    } else {
      deletePOItem();
    }
  };

  const deletePOItem = async () => {
    let productList = [{ ...selectedRow }];
    productList[0].transaction_type = "delete";

    const apiData = {
      project: project,
      total_po_amount:
        Number(purchaseOrderDetails?.total_po_amount || 0) -
        Number(selectedRow?.total_amount || 0),
      total_po_taxable_amount:
        Number(purchaseOrderDetails?.total_po_taxable_amount || 0) -
        Number(selectedRow?.taxable_amount || 0),
      total_po_tax_amount:
        Number(purchaseOrderDetails?.total_po_tax_amount || 0) -
        Number(selectedRow?.tax_amount || 0),
      product_list: productList,
    };

    await requestHandler(
      async () => await editPurchaseOrder(poId, apiData),
      null,
      (data) => {
        toast.success("Item Deleted Successfully!");
        fetchPurchaseOrderItems(poId);
        closeModal("delete-purchase-order-item");
      },
      toast.error
    );
  };

  const handleExtraCharge = async (extraCharge) => {
    const apiData = {
      total_po_taxable_amount:
        Number(purchaseOrderDetails.total_po_taxable_amount || 0) +
        Number(extraCharge.amount || 0),
      total_po_tax_amount:
        Number(purchaseOrderDetails.total_po_tax_amount || 0) +
        Number(extraCharge.tax_amount || 0),
      total_po_amount:
        Number(purchaseOrderDetails.total_po_amount || 0) +
        Number(extraCharge.total_amount || 0),
      extra_charges: [extraCharge],
    };

    await requestHandler(
      async () => await editPurchaseOrder(poId, apiData),
      null,
      (data) => {
        toast.success("Extra Charges Saved Successfully!");
        fetchPurchaseOrderItems(poId);
        closeModal("add-purchase-order-extra-charge");
      },
      toast.error
    );
  };

  const handleDeleteCharges = async (row) => {
    const apiData = {
      total_po_taxable_amount:
        Number(purchaseOrderDetails.total_po_taxable_amount || 0) -
        Number(row.amount || 0),
      total_po_tax_amount:
        Number(purchaseOrderDetails.total_po_tax_amount || 0) -
        Number(row.tax_amount || 0),
      total_po_amount:
        Number(purchaseOrderDetails.total_po_amount || 0) -
        Number(row.total_amount || 0),
      extra_charges: [{ ...row, transaction_type: "delete" }],
    };

    await requestHandler(
      async () => await editPurchaseOrder(poId, apiData),
      null,
      (data) => {
        toast.success("Extra Charges Saved Successfully!");
        fetchPurchaseOrderItems(poId);
        closeModal("delete-purchase-order-item");
      },
      toast.error
    );
  };

  const handlePublishPurchaseOrder = async () => {
    await requestHandler(
      async () => await editPurchaseOrder(poId, { "is_draft": false }),
      // async () => {
      //   await new Promise((resolve) => setTimeout(resolve, 3000))
      //   return { data: { status: { code: 200 } } };
      // },
      null,
      (data) => {
        toast.success("Purchase order published!");
        fetchPurchaseOrderItems(poId);
        // router.reload();
        // router.replace(router.asPath);
      },
      toast.error
    );
  }

  const fetchInstallationBudgetItems = async () => {
    await getUnBookedOtherPoItems(project);
    openModal("add-purchase-order-item");
  };

  const fetchUnbookedPoItems = async () => {
    await getUnBookedPurchaseOrderItems(project);
    openModal("add-purchase-order-item");
  };

  return (
    <>
      <div className="flex justify-between items-center gap-4">
        <h2 className=" flex text-xl font-bold tracking-tight">
          <span
            className="text-orange-500 hover:underline underline-offset-4 cursor-pointer"
            onClick={() => router.back()}
          >
            Back
          </span>{" "}
          <MdArrowForwardIos className="mt-1 text-orange-500" />
          Edit Purchase Order
        </h2>
      </div>
      <div className=" bg-white rounded  overflow-scroll p-5">
        <div className="relative flex flex-col gap-4 p-5 border border-zinc-100  overflow-scroll rounded-md grow h-full">
          {purchaseOrderDetails?.status === "Draft" &&
            <Button
              onClick={handlePublishPurchaseOrder}
              className={"absolute top-2 right-[84px] px-4"}
            >
              <FaPen />
              Publish
            </Button>
          }
          <Button
            onClick={() => openModal("edit-purchase-order-details")}
            className={"absolute top-2 right-2 px-4"}
          >
            <FaPen />
            Edit
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <span>
              <strong>Purchase Order No: </strong>
              {purchaseOrderDetails?.purchase_order_number}
            </span>
            <span>
              <strong>Date: </strong>
              {dateFormat(purchaseOrderDetails?.purchase_order_date)}
            </span>
            <div>
              <strong>Revision No.: </strong>
              {purchaseOrderDetails?.revision_number}
            </div>
            <div>
              <strong>Vendor: </strong>
              {purchaseOrderDetails?.vendor_name}
            </div>
            <div>
              <strong>Purchaser: </strong>
              {purchaseOrderDetails?.purchaser_name}
            </div>
            <div>
              <strong>Purchaser Details: </strong>
              {purchaseOrderDetails?.purchaser_address},{" "}
              {purchaseOrderDetails?.purchaser_city_name},{" "}
              {purchaseOrderDetails?.purchaser_state_name},{" "}
              {purchaseOrderDetails?.purchaser_pincode}. GST -{" "}
              {purchaseOrderDetails?.purchaser_gst}
            </div>
            <div>
              <strong>Status: </strong>
              {purchaseOrderDetails?.status}
            </div>
            <div>
              <strong>Total Taxable Amount: </strong>₹
              {formatPrice(purchaseOrderDetails?.total_po_taxable_amount)}
            </div>
            <div>
              <strong>Total Tax Amount: </strong>₹
              {formatPrice(purchaseOrderDetails?.total_po_tax_amount)}
            </div>
            <div>
              <strong>Total Amount: </strong>₹
              {formatPrice(purchaseOrderDetails?.total_po_amount)}
            </div>
            <div>
              <strong>Shipping Address: </strong>
              {purchaseOrderDetails?.shipper_address},{" "}
              {purchaseOrderDetails?.shipper_city_name},{" "}
              {purchaseOrderDetails?.shipper_state_name},{" "}
              {purchaseOrderDetails?.shipper_pincode}. GST -{" "}
              {purchaseOrderDetails?.shipper_gst}{" "}
            </div>
            <div>
              <strong>Shipping Address POC: </strong>
              Name: {purchaseOrderDetails?.shipper_contact_person_name}
              <br /> Email: {purchaseOrderDetails?.shipper_email}
              <br />
              Contact: {purchaseOrderDetails?.shipper_mobile_no}
            </div>

            <div>
              <strong>Payment Terms: </strong>
              {purchaseOrderDetails?.payment_terms}
            </div>
            <div>
              <strong>Delivery Terms: </strong>
              {purchaseOrderDetails?.delivery_terms}
            </div>
            <div>
              <strong>Other Terms: </strong>
              <div
                ref={otherTermsRef}
                className={` ${showEntireOtherTerms ? "" : "other-terms"}`}
              >
                {purchaseOrderDetails?.other_terms}
              </div>
              {isOverflowing && (
                <button
                  onClick={() => setShowEntireOtherTerms(!showEntireOtherTerms)}
                  className="text-primary underline underline-offset-4 text-sm"
                >
                  {showEntireOtherTerms ? "View less" : "View more"}
                </button>
              )}
            </div>
            <div className="col-span-2">
              <strong>Remark: </strong>
              {purchaseOrderDetails?.remark}
            </div>
          </div>
          {purchaseOrderDetails?.extra_charges?.length > 0 ? (
            <div className="flex flex-col gap-2">
              <div className="flex justify-between">
                <strong>Extra Charges</strong>
                <Button
                  onClick={() => openModal("add-purchase-order-extra-charge")}
                  variant={"inverted"}
                  customText={"#F47920"}
                  className="bg-orange-400/10 self-end text-orange-500 px-2 hover:bg-orange-600/10 "
                >
                  <FaPlusCircle />
                  Add Extra Charge
                </Button>
              </div>
              <div className="overflow-x-auto mt-2">
                <Table
                  columns={extraChargeTableHeader}
                  rows={purchaseOrderDetails?.extra_charges ?? []}
                  showSerialNumber={true}
                />
              </div>
            </div>
          ) : (
            <Button
              onClick={() => openModal("add-purchase-order-extra-charge")}
              variant={"inverted"}
              customText={"#F47920"}
              className="bg-orange-400/10 w-[10rem] text-orange-500 px-2 hover:bg-orange-600/10 "
            >
              <FaPlusCircle />
              Add Extra Charges
            </Button>
          )}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between">
              <strong>Purchase Order Items</strong>
              {isOthersPo == null ? (
                <div className="flex gap-2">
                  <Button
                    onClick={fetchInstallationBudgetItems}
                    variant={"inverted"}
                    customText={"#F47920"}
                    className="bg-orange-400/10 self-end text-orange-500 px-2 hover:bg-orange-600/10 "
                  >
                    <FaPlusCircle />
                    Add Installation Budget
                  </Button>
                  <Button
                    onClick={fetchUnbookedPoItems}
                    variant={"inverted"}
                    customText={"#F47920"}
                    className="bg-orange-400/10 self-end text-orange-500 px-2 hover:bg-orange-600/10 "
                  >
                    <FaPlusCircle />
                    Add Item
                  </Button>
                </div>
              ) : (
                unpackedItems.length > 0 && (
                  <Button
                    onClick={() => openModal("add-purchase-order-item")}
                    variant={"inverted"}
                    customText={"#F47920"}
                    className="bg-orange-400/10 self-end text-orange-500 px-2 hover:bg-orange-600/10 "
                  >
                    <FaPlusCircle />
                    Add Item
                  </Button>
                )
              )}
            </div>
            {purchaseOrderDetails && (
              <div className="overflow-x-auto mt-2">
                <Table
                  columns={isOthersPo ? tableHeaderForOthers : tableHeader}
                  rows={purchaseOrderDetails?.product_list}
                  showSerialNumber={true}
                />
              </div>
            )}
          </div>
          <Button
            onClick={() => router.back()}
            className={"w-[7rem] self-end px-4"}
          >
            Back
          </Button>
        </div>
      </div>

      <EditPurchaseOrderDetails
        details={purchaseOrderDetails}
        purchasers={purchasers}
        onSuccessfullSubmit={() => {
          fetchPurchaseOrderItems(poId);
          closeModal("edit-purchase-order-details");
        }}
      />

      <AddPurchaseOrderItem
        modalId="add-purchase-order-item"
        itemList={unpackedItems}
        zIndex="z-[60]"
        projectId={project}
        poId={poId}
        purchaseOrderDetails={purchaseOrderDetails}
        onSuccessfullSubmit={() => {
          fetchPurchaseOrderItems(poId);
          closeModal("add-purchase-order-item");
        }}
        poAmount={{
          total_po_amount: purchaseOrderDetails?.total_po_amount,
          total_po_tax_amount: purchaseOrderDetails?.total_po_tax_amount,
          total_po_taxable_amount:
            purchaseOrderDetails?.total_po_taxable_amount,
        }}
      />

      <WarningModal
        modalId={"delete-purchase-order-item"}
        modalContent={
          selectedRow?.charges__name ? (
            <>
              Are you sure that you want to delete{" "}
              <strong>{selectedRow?.charges__name}</strong> Extra Charge?
            </>
          ) : (
            <>
              Are you sure that you want to delete{" "}
              <strong>{selectedRow?.product_code}</strong>?
            </>
          )
        }
        onSubmit={deleteItem}
      />

      <AddExtraCharge
        extraChargesList={extraChargesList.filter(
          (charge) =>
            !purchaseOrderDetails?.extra_charges?.some(
              (selectedCharge) => selectedCharge.charges == charge.id
            )
        )}
        onSubmit={handleExtraCharge}
      />
    </>
  );
};

export default EditPurchaseOrder;
