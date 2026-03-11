import { useState, useEffect } from "react";
import Table from "@/components/SortableTable";
import Button from "@/components/shared/Button";
import { FaPlusCircle } from "react-icons/fa";
import { useModal } from "@/contexts/modal";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { formatPrice } from "@/utils/numberHandler";
import {
  deletePaymentDetails,
  deleteProjectPaymentInvoice,
  getPaymentDetails,
  getPaymentInvoiceDetails,
  fetchPaymentTermsDetails,
} from "@/services/api";
import { requestHandler } from "@/services/ApiHandler";
import { toast } from "sonner";
import { LocalStorageService } from "@/services/LocalStorageHandler";

const AddEditPayment = dynamic(
  () => import("@/components/modals/AddPaymentModal")
);
const AddEditInvoice = dynamic(
  () => import("@/components/modals/AddPaymentInvoiceModal")
);
const AddSgEditInvoice = dynamic(
  () => import("@/components/modals/ProjectDetails/AddSgPaymentInvoiceModal")
);
const AddPaymentTerms = dynamic(
  () => import("@/components/modals/ProjectDetails/AddPaymentTerms")
);
const EditPaymentTerms = dynamic(
  () => import("@/components/modals/ProjectDetails/EditPaymentTerms")
);
const WarningModal = dynamic(() => import("@/components/modals/WarningModal"));

const ProjectPayment = ({ projectBudget }) => {
  const router = useRouter();
  const { projectId } = router.query;
  const { openModal, closeModal } = useModal();
  const [activeTab, setActiveTab] = useState("Payment");
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [paymentInvoiceDetails, setPaymentInvoiceDetails] = useState(null);
  const [paymentAmountDetails, setPaymentAmountDetails] = useState(null);
  const [selectedPaymentRow, setSelectedPaymentRow] = useState(null);
  const [selectedInvoiceRow, setSelectedInvoiceRow] = useState(null);
  const [ornateInvoices, setOrnateInvoices] = useState([]);
  const [paymentTerms, setPaymentTerms] = useState([]);
  const [selectedPaymentTermRow, setSelectedPaymentTermRow] = useState(null);
  const [selectedRowForDelete, setSelectedRowForDelete] = useState(null);

  const tabs = ["Payment", "Invoice", "Payment Terms"];

  // const pendingAmount =
  //   Number(paymentAmountDetails?.total_invoice_amount || 0) -
  //   Number(paymentAmountDetails?.total_paid_amount || 0);

  // const profitMargin =
  //   Number(paymentAmountDetails?.sg_ornate_invoice_total_amount || 0) -
  //   Number(paymentAmountDetails?.total_invoice_amount || 0);

  const balanceAmount =
    Number(projectBudget?.budget_with_gst || 0) -
    Number(paymentAmountDetails?.total_paid_amount || 0);

  const accessibilityInfo =
    LocalStorageService.get("user_accessibility").accessibility[0].projects
      .payment_tab ?? {};

  const allowedActions =
    (accessibilityInfo?.delete_view ? "delete-" : "") +
    (accessibilityInfo?.edit_view ? "edit" : "");

  useEffect(() => {
    fetchProjectPaymentDetails();
    fetchProjectPaymentInvoiceDetails();
    fetchPaymentTerms();
  }, []);

  const fetchPaymentTerms = async () => {
    await requestHandler(
      async () => await fetchPaymentTermsDetails(projectId),
      null,
      async (data) => {
        setPaymentTerms(data.data.output);
      },
      toast.error
    );
  };

  const fetchProjectPaymentDetails = async () => {
    await requestHandler(
      async () => await getPaymentDetails(projectId),
      null,
      async (data) => {
        setPaymentDetails(data.data.output);
        setPaymentAmountDetails(data.total_amount);
      },
      toast.error
    );
  };

  const fetchProjectPaymentInvoiceDetails = async () => {
    await requestHandler(
      async () => await getPaymentInvoiceDetails(projectId),
      null,
      async (data) => {
        if (data.data.output && data.data.output.length > 0) {
          const filteredOrnateInvoices = data.data.output;

          setOrnateInvoices(filteredOrnateInvoices);
        }
        setPaymentInvoiceDetails(data.data.output);
        setPaymentAmountDetails(data.total_amount);
      },
      toast.error
    );
  };

  const paymentTableHeader = [
    {
      name: "Payment For",
      key: "payment_for",
      width: "170px",
    },
    {
      name: "Date",
      key: "payment_date",
      type: "date",
      width: "150px",
    },
    {
      name: "Payment Mode",
      key: "payment_mode",
      width: "150px",
    },
    {
      name: "Payment Ref",
      key: "reference_id",
      width: "150px",
    },
    {
      name: "Payable Amount(₹)",
      key: "payable_amount",
      displayType: "price",
      width: "150px",
    },
    { name: "Remark", key: "remark", width: "200px" },

    // Conditionally add the "Actions" column
    ...(accessibilityInfo?.edit_view || accessibilityInfo?.delete_view
      ? [
        {
          name: "Actions",
          type: "actions-column",
          actionType: allowedActions,
          onClickEdit: (row) => {
            setSelectedPaymentRow(row);
            openModal(`edit-${activeTab.toLowerCase()}`);
          },
          onClickDelete: (row) => handleDeletePayment(row.id, "Payment"),
        },
      ]
      : []),
  ];

  const invoiceTableHeader = [
    {
      name: "Packing List",
      key: "packing_list_no",
      width: "150px",
    },
    {
      name: "Invoice Date",
      key: "invoice_date",
      type: "date",
      width: "110px",
    },
    {
      name: "Invoice No",
      key: "invoice_no",
      type: "document",
      document_key: "invoice_doc",
      width: "170px",
    },
    {
      name: "Invoice Amount (With GST)(₹)",
      key: "invoice_amount_with_gst",
      displayType: "price",
      width: "220px",
    },
    { name: "Remark", key: "remark", width: "250px" },
    // Conditionally add the "Actions" column
    ...(accessibilityInfo?.edit_view || accessibilityInfo?.delete_view
      ? [
        {
          name: "Actions",
          type: "actions-column",
          actionType: allowedActions,
          onClickEdit: (row) => {
            setSelectedInvoiceRow(row);
            openModal(`edit-invoice`);
          },
          onClickDelete: (row) => handleDeletePayment(row.id, "Invoice"),
        },
      ]
      : []),
  ];

  const paymentTermsTableHeader = [
    {
      name: "Terms",
      key: "terms",
      width: "50%",
    },
    {
      name: "Percentage",
      key: "percentage",
      displayType: "price",
      width: "10%",
    },
    {
      name: "Amount",
      key: "amount",
      displayType: "price",
      width: "10%",
    },
    {
      name: "Status",
      key: "status",
      width: "10%",
    },
    {
      name: "Date",
      key: "date",
      type: "date",
    },
    // Conditionally add the "Actions" column
    ...(accessibilityInfo?.edit_view
      ? [
        {
          name: "Actions",
          type: "actions-column",
          actionType: "edit",
          onClickEdit: (row) => {
            setSelectedPaymentTermRow(row);
            openModal("edit-payment-terms");
          },
        },
      ]
      : []),
  ];

  const handleDeletePayment = (id, paymentType) => {
    let selectedRow = {};
    if (paymentType == "Payment") {
      selectedRow = paymentDetails.filter((payment) => payment.id == id)[0];
    } else {
      selectedRow = paymentInvoiceDetails.filter(
        (invoice) => invoice.id == id
      )[0];
    }
    setSelectedRowForDelete(selectedRow);
    openModal("delete-payment-details");
  };

  const deletePayment = async (id) => {
    await requestHandler(
      async () => await deletePaymentDetails(id),
      null,
      async (data) => {
        toast.success("Payment Deleted Successfully!");
        onSuccessfullSubmit();
        closeModal("delete-payment-details");
      },
      toast.error
    );
  };

  const deleteInvoicePayment = async (id) => {
    await requestHandler(
      async () => await deleteProjectPaymentInvoice(id),
      null,
      async (data) => {
        toast.success("Payment Deleted Successfully!");
        onSuccessfullInvoiceSubmit();
        closeModal("delete-payment-details");
      },
      toast.error
    );
  };

  return (
    <div className="flex flex-col gap-2 overflow-auto min-h-full">
      <div className="grid grid-cols-2 gap-4">
        <span>
          <strong>PO Value(Without GST): </strong>
          {projectBudget
            ? projectBudget?.po_total_without_gst &&
              projectBudget?.po_total_without_gst != 0
              ? `₹ ${formatPrice(projectBudget?.budget_without_gst ?? 0)} + ₹ ${formatPrice(projectBudget?.po_total_without_gst ?? 0)} = ₹ ${formatPrice(Number(projectBudget?.budget_without_gst || 0) + Number(projectBudget?.po_total_without_gst || 0))}`
              : `₹ ${formatPrice(projectBudget?.budget_without_gst)}`
            : "-"}
        </span>

        <span>
          <strong>PO Value(With GST): </strong>
          {projectBudget
            ? projectBudget?.po_total_with_gst &&
              projectBudget?.po_total_with_gst != 0
              ? `₹ ${formatPrice(projectBudget?.budget_with_gst ?? 0)} + ₹ ${formatPrice(projectBudget?.po_total_with_gst ?? 0)} = ₹ ${formatPrice(Number(projectBudget?.budget_with_gst || 0) + Number(projectBudget?.po_total_with_gst || 0))}`
              : `₹ ${formatPrice(projectBudget?.budget_with_gst ?? 0)}`
            : "-"}
        </span>

        <span>
          <strong>Total Ornate Invoice Amount: </strong>₹
          {paymentAmountDetails?.total_invoice_amount
            ? formatPrice(paymentAmountDetails?.total_invoice_amount)
            : "-"}
        </span>
        <span>
          <strong>Total SG Invoice Amount: </strong>₹
          {paymentAmountDetails?.sg_ornate_invoice_total_amount
            ? formatPrice(paymentAmountDetails?.sg_ornate_invoice_total_amount)
            : "-"}
        </span>

        <span>
          <strong>Total Paid Amount: </strong>
          <span className="text-green-500">
            ₹
            {paymentAmountDetails?.total_paid_amount
              ? formatPrice(paymentAmountDetails?.total_paid_amount)
              : "-"}
          </span>
        </span>
        <span>
          <strong>Balance Amount: </strong>
          <span>₹{formatPrice(balanceAmount)}</span>
        </span>
        {/* <span>
          <strong>
            {pendingAmount < 0 ? "Excess Amount: " : "Pending Amount: "}
          </strong>
          <span
            className={`${pendingAmount <= 0 ? "text-green-500" : "text-red-500"}`}
          >
            ₹{formatPrice(pendingAmount)}
          </span>
        </span> */}

        {/* <span>
          <strong>Profit Margin: </strong>
          <span
            className={`${profitMargin >= 0 ? "text-green-500" : "text-red-500"}`}
          >
            ₹{formatPrice(profitMargin)}
          </span>
        </span> */}
      </div>

      <span className="flex relative">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => {
              setActiveTab(tab);
            }}
            className={`mr-4 flex px-4 py-1  ${activeTab === tab
              ? "border-b-2 border-b-primary text-primary  "
              : "border-transparent"
              } focus:outline-none`}
          >
            {tab}
          </button>
        ))}

        {accessibilityInfo?.add_view && (
          <Button
            className={"absolute px-2 h-fit right-2"}
            onClick={() =>
              openModal(`add-${activeTab.toLowerCase().split(" ").join("-")}`)
            }
          >
            <FaPlusCircle />
            Add {activeTab}
          </Button>
        )}
      </span>

      {activeTab === "Payment" && (
        <>
          {paymentDetails && (
            <div className="overflow-x-auto">
              <Table rows={paymentDetails} columns={paymentTableHeader} />
            </div>
          )}
          <AddEditPayment
            modalId="add-payment"
            projectId={projectId}
            onSuccessfullSubmit={fetchProjectPaymentDetails}
          />
        </>
      )}

      {activeTab === "Invoice" && (
        <>
          {paymentInvoiceDetails && (
            <div className="overflow-x-auto">
              <Table rows={ornateInvoices} columns={invoiceTableHeader} />
            </div>
          )}
          <AddEditInvoice
            modalId="add-invoice"
            projectId={projectId}
            onSuccessfullInvoiceSubmit={fetchProjectPaymentInvoiceDetails}
          />
        </>
      )}

      {activeTab === "Payment Terms" && (
        <>
          {paymentInvoiceDetails && (
            <div className="overflow-x-auto">
              <Table rows={paymentTerms} columns={paymentTermsTableHeader} />
            </div>
          )}
          <AddPaymentTerms
            modalId="add-payment-terms"
            totalPoValue={projectBudget.budget_with_gst}
            projectId={projectId}
            onSuccessfullSubmit={fetchPaymentTerms}
          />
        </>
      )}

      {selectedPaymentRow && (
        <AddEditPayment
          modalId="edit-payment"
          details={selectedPaymentRow}
          onSuccessfullSubmit={fetchProjectPaymentDetails}
        />
      )}
      {selectedInvoiceRow && (
        <AddEditInvoice
          modalId="edit-invoice"
          details={selectedInvoiceRow}
          onSuccessfullInvoiceSubmit={fetchProjectPaymentInvoiceDetails}
        />
      )}
      {selectedPaymentTermRow && (
        <EditPaymentTerms
          modalId="edit-payment-terms"
          totalPoValue={projectBudget.budget_with_gst}
          details={selectedPaymentTermRow}
          onSuccessfullSubmit={fetchPaymentTerms}
        />
      )}

      <WarningModal
        modalId={"delete-payment-details"}
        modalContent={
          <>
            Are you sure that you want to delete{" "}
            {selectedRowForDelete?.reference_id ? (
              <>
                Payment{" "}
                <strong>
                  (Payment Ref -{selectedRowForDelete?.reference_id})
                </strong>
              </>
            ) : (
              <>
                Invoice{" "}
                <strong>
                  (Invoice No -{selectedRowForDelete?.invoice_no})
                </strong>
              </>
            )}
            ?
          </>
        }
        onSubmit={() => {
          if (selectedRowForDelete?.reference_id) {
            deletePayment(selectedRowForDelete?.id);
          } else {
            deleteInvoicePayment(selectedRowForDelete?.id);
          }
        }}
      />
    </div>
  );
};

export default ProjectPayment;
