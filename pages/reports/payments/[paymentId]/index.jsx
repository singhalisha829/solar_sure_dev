import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Table from "@/components/SortableTable";
import { requestHandler } from "@/services/ApiHandler";
import { toast } from "sonner";
import {
  getProjectPayments,
  getInvoicePayments,
  deletePaymentDetails,
  deleteProjectPaymentInvoice,
} from "@/services/api";
import Search from "@/components/shared/SearchComponent";
import Button from "@/components/shared/Button";
import Loading from "@/components/Loading";
import { MdArrowForwardIos } from "react-icons/md";
import dynamic from "next/dynamic";
import { useModal } from "@/contexts/modal";

const AddEditPayment = dynamic(
  () => import("@/components/modals/AddPaymentModal")
);
const AddEditInvoice = dynamic(
  () => import("@/components/modals/AddPaymentInvoiceModal")
);

const ProjectPayments = () => {
  const router = useRouter();
  const { paymentId } = router.query;
  const { openModal } = useModal();
  const [activeTab, setActiveTab] = useState("Payment");
  const [projectPaymentList, setProjectPaymentList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [invoicePaymentList, setInvoicePaymentList] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedPaymentRow, setSelectedPaymentRow] = useState(null);
  const [selectedInvoiceRow, setSelectedInvoiceRow] = useState(null);

  const tabs = ["Payment", "Invoice"];

  const paymentTableHeader = [
    {
      name: "Project",
      key: "project_name",
      width: "170px",
    },
    {
      name: "Site",
      key: "site_name",
      width: "150px",
    },
    {
      name: "Company",
      key: "company_name",
      width: "190px",
    },
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
    {
      name: "Actions",
      type: "actions-column",
      actionType: "edit-delete",
      onClickEdit: (row) => {
        setSelectedPaymentRow(row);
        openModal(`edit-${activeTab.toLowerCase()}`);
      },
      onClickDelete: (row) => deletePayment(row.id),
    },
  ];

  const invoiceTableHeader = [
    {
      name: "Project",
      key: "project_name",
      width: "170px",
    },
    {
      name: "Site",
      key: "site_name",
      width: "150px",
    },
    {
      name: "Company",
      key: "company_name",
      width: "190px",
    },
    {
      name: "Packing List",
      key: "packing_list_no",
      width: "170px",
    },
    {
      name: "Invoice Date",
      key: "invoice_date",
      type: "date",
      width: "150px",
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
    { name: "Remark", key: "remark", width: "200px" },
    {
      name: "Actions",
      type: "actions-column",
      actionType: "edit-delete",
      onClickEdit: (row) => {
        setSelectedInvoiceRow(row);
        openModal(`edit-${activeTab.toLowerCase()}`);
      },
      onClickDelete: (row) => deleteInvoicePayment(row.id),
    },
  ];

  useEffect(() => {
    fetchPayments();
    fetchInvoicePayments();
  }, []);

  const fetchPayments = async (queryParams = {}) => {
    await requestHandler(
      async () =>
        await getProjectPayments({ ...queryParams, project: paymentId }),
      setIsLoading,
      (data) => {
        setProjectPaymentList(data.data.output);
      },
      toast.error
    );
  };

  const fetchInvoicePayments = async (queryParams = {}) => {
    await requestHandler(
      async () =>
        await getInvoicePayments({ ...queryParams, project: paymentId }),
      setIsLoading,
      (data) => {
        setInvoicePaymentList(data.data.output);
      },
      toast.error
    );
  };

  const deletePayment = async (id) => {
    await requestHandler(
      async () => await deletePaymentDetails(id),
      null,
      async (data) => {
        toast.success("Payment Deleted Successfully!");
        fetchPayments();
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
        fetchInvoicePayments();
      },
      toast.error
    );
  };

  const filterProjects = (pageFilters = {}) => {
    if (activeTab === "Payment") {
      fetchPayments(pageFilters);
    } else {
      fetchInvoicePayments(pageFilters);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      <div className="flex justify-between items-center gap-4">
        <h2 className=" flex text-xl font-bold tracking-tight">
          <span
            className="text-primary hover:underline underline-offset-4 cursor-pointer"
            onClick={() => router.back()}
          >
            Ongoing Projects
          </span>
          <MdArrowForwardIos className="mt-1 text-primary" />
          Payments
        </h2>

        <div className="flex gap-2 items-center">
          {search !== "" && (
            <Button
              onClick={() => {
                setSearch("");
                filterProjects();
              }}
              className={"px-2"}
            >
              Clear Filters
            </Button>
          )}
          <Search
            searchText={(data) => {
              setSearch(data);
              filterProjects({ search: data });
            }}
            searchPlaceholder="Search.."
            value={search}
          />
        </div>
      </div>
      <div className="min-h-[85vh] overflow-hidden bg-white p-5">
        <span className="flex relative mb-2">
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
        </span>

        {activeTab === "Payment" && (
          <div className="overflow-x-auto">
            <Table rows={projectPaymentList} columns={paymentTableHeader} />
          </div>
        )}

        {activeTab === "Invoice" && (
          <div className="overflow-x-auto">
            <Table rows={invoicePaymentList} columns={invoiceTableHeader} />
          </div>
        )}
      </div>
      {selectedPaymentRow && (
        <AddEditPayment
          modalId="edit-payment"
          details={selectedPaymentRow}
          onSuccessfullSubmit={fetchPayments}
        />
      )}
      {selectedInvoiceRow && (
        <AddEditInvoice
          modalId="edit-invoice"
          details={selectedInvoiceRow}
          onSuccessfullInvoiceSubmit={fetchInvoicePayments}
        />
      )}
    </>
  );
};

export default ProjectPayments;
