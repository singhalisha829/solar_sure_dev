import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { requestHandler } from "@/services/ApiHandler";
import { toast } from "sonner";
import { fetchProjectConsumedReport } from "@/services/api";
import Loading from "@/components/Loading";
import Table from "@/components/SortableTable";
import { MdArrowForwardIos } from "react-icons/md";
import { formatPrice } from "@/utils/numberHandler";
import Button from "@/components/shared/Button";
import { LuDownload } from "react-icons/lu";
import Papa from "papaparse";

const ProjectReport = () => {
  const router = useRouter();
  const { projectId, name } = router.query;
  const [transportationList, setTransporterList] = useState([]);
  const [otherList, setOtherList] = useState([]);
  const [stockDeliveredList, setStockDeliveredList] = useState([]);
  const [siteVisitList, setSiteVisitList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("BOM Item");
  const [totalAmount, setTotalAmount] = useState({
    transportation: 0,
    others: 0,
    stockDelivered: 0,
    siteVisit: 0,
  });

  const tabs = ["BOM Item", "Transportation", "Installation/Freight/Other", "Site Visit"];

  const tableHeader = [
    {
      name: "Category",
      key: "category",
      sortable: true,
      width: "130px",
    },
    {
      name: "Transaction Date",
      key: "transaction_date",
      type: "date",
      sortable: true,
      width: "170px",
    },
    // {
    //   name: "Transaction Type",
    //   key: "transaction_type",
    //   sortable: true,
    //   width: "170px",
    // },
    {
      name: "Amount(₹)",
      key: "amount",
      sortable: true,
      displayType: "price",
      width: "110px",
    },
    {
      name: "Description",
      key: "description",
      sortable: true,
      width: "200px",
    },
  ];

  const siteVisitTableHeader = [
    {
      name: "Employee Name",
      key: "employee_name",
      sortable: true,
      width: "160px",
    },
    {
      name: "Site Address",
      key: "site_address",
      sortable: true,
      width: "140px",
    },
    {
      name: "Start Date",
      key: "start_date",
      sortable: true,
      displayType: "date",
      width: "125px",
    },
    {
      name: "End Date",
      key: "end_date",
      displayType: "date",
      sortable: true,
      width: "120px",
    },
    {
      name: "Transaction Date",
      key: "transaction_date",
      sortable: true,
      displayType: "date",
      width: "170px",
    },
    // {
    //   name: "Transaction Type",
    //   key: "transaction_type",
    //   sortable: true,
    //   width: "170px",
    // },
    {
      name: "Type of Expense",
      key: "type_of_expense",
      sortable: true,
      width: "170px",
    },
    {
      name: "Amount(₹)",
      key: "amount",
      sortable: true,
      displayType: "price",
      width: "110px",
    },
    {
      name: "Total Amount(₹)",
      key: "amount_with_gst",
      sortable: true,
      width: "170px",
      displayType: "price",
    },
  ];

  const transportationTableHeader = [
    {
      name: "Transporter",
      key: "transporter_name",
      sortable: true,
      width: "190px",
    },
    {
      name: "Transaction Cost(₹)",
      key: "transportation_cost",
      sortable: true,
      width: "170px",
      displayType: "price",
    },
    {
      name: "Dispatch Date",
      key: "dispatch_date",
      type: "date",
      sortable: true,
      width: "150px",
    },
    {
      name: "Vehicle Size",
      key: "vehicle_size",
      sortable: true,
      width: "150px",
    },
    {
      name: "Vehicle/Docket No",
      key: "vehicle_or_docket_no",
      sortable: true,
      width: "170px",
    },
    {
      name: "Eway Bill No",
      key: "eway_bill_no",
      sortable: true,
      width: "150px",
    },
    {
      name: "Total Amount(₹)",
      key: "amount_with_gst",
      sortable: true,
      width: "155px",
      displayType: "price",
    },
    {
      name: "Remark",
      key: "remark",
      sortable: true,
      width: "250px",
    },
  ];

  const otherTableHeader = [
    {
      name: "Product",
      key: "product_name",
      sortable: true,
      width: "190px",
    },
    {
      name: "Section",
      key: "section",
      sortable: true,
      width: "130px",
    },
    {
      name: "Quantity",
      key: "quantity",
      sortable: true,
      width: "130px",
    },
    {
      name: "Unit Price(₹)",
      key: "unit_price",
      displayType: "price",
      sortable: true,
      width: "130px",
    },
    {
      name: "Taxable amount(₹)",
      key: "total_cost",
      sortable: true,
      width: "170px",
      displayType: "price",
    },
    {
      name: "Tax(%)",
      key: "tax_rate",
      sortable: true,
      width: "100px",
    },
    {
      name: "Total Amount(₹)",
      key: "amount_with_gst",
      sortable: true,
      width: "170px",
      displayType: "price",
    },
  ];

  const stockTableHeader = [
    {
      name: "Product",
      key: "product_name",
      sortable: true,
      width: "190px",
    },
    {
      name: "Make",
      key: "make_name",
      sortable: true,
      width: "180px",
    },
    {
      name: "Document Type",
      key: "document_type",
      sortable: true,
      width: "180px",
    },
    {
      name: "Document No",
      key: "document_no",
      sortable: true,
      width: "180px",
    },
    {
      name: "Quantity",
      key: "quantity",
      sortable: true,
      width: "130px",
    },
    {
      name: "Unit Price(₹)",
      key: "unit_price",
      displayType: "price",
      sortable: true,
      width: "130px",
    },
    {
      name: "Taxable Amount(₹)",
      key: "total_cost",
      sortable: true,
      width: "170px",
      displayType: "price",
    },
    {
      name: "Tax(%)",
      key: "tax_rate",
      sortable: true,
      width: "100px",
    },
    {
      name: "Total Amount(₹)",
      key: "amount_with_gst",
      sortable: true,
      width: "170px",
      displayType: "price",
    },
  ];

  useEffect(() => {
    getProjectReport();
  }, []);

  const getProjectReport = async () => {
    await requestHandler(
      async () => await fetchProjectConsumedReport(projectId),
      setIsLoading,
      (data) => {
        let transportation_lit = [],
          other_list = [],
          stocks_list = [],
          site_visit_list = [],
          total_site_visit_amount = 0,
          total_transportation_amount = 0,
          total_others_amount = 0,
          total_stock_delivered_amount = 0;
        data.data.output.map((element) => {
          let data = { ...element, ...element.details };
          delete data.details;
          if (element.category === "Transportation") {
            transportation_lit.push(data);
            total_transportation_amount +=
              data.transaction_type === "DEBIT"
                ? Number(data.amount || 0)
                : -Number(data.amount || 0);
          } else if (
            ["Installation", "Freight", "Other"].includes(element.category)
          ) {
            other_list.push(data);
            total_others_amount +=
              data.transaction_type === "DEBIT"
                ? Number(data.amount || 0)
                : -Number(data.amount || 0);
          }
          else if (element.category === "Site Visit") {
            site_visit_list.push(data);
            total_site_visit_amount +=
              data.transaction_type === "DEBIT"
                ? Number(data.amount || 0)
                : -Number(data.amount || 0);
          }
          else {
            stocks_list.push(data);
            total_stock_delivered_amount +=
              data.transaction_type === "DEBIT"
                ? Number(data.amount || 0)
                : -Number(data.amount || 0);
          }
        });
        setTransporterList(transportation_lit);
        setOtherList(other_list);
        setStockDeliveredList(stocks_list);
        setSiteVisitList(site_visit_list);
        setTotalAmount({
          transportation: total_transportation_amount,
          others: total_others_amount,
          stockDelivered: total_stock_delivered_amount,
          siteVisit: total_site_visit_amount,
        });
      },
      toast.error
    );
  };

  const handleConsumedReportExport = () => {
    const data =
      activeTab == "Transportation"
        ? transportationList
        : activeTab === "Installation/Freight/Other"
          ? otherList
          : stockDeliveredList;

    const formattedData = data.map((element) => {
      delete element.id;
      delete element.project;
      delete element.make;
      delete element.product_id;
      delete element.make_id;
      delete element.transporter_id;
      delete element.invoice_transportation_id;
      element.transaction_date = element.transaction_date.split("T")[0];
      return element;
    });
    const csv = Papa.unparse(formattedData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${name}_consumed_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="flex justify-between items-center gap-4">
        <h2 className="flex text-xl font-bold tracking-tight">
          <span
            className="flex text-orange-500 hover:underline underline-offset-4 cursor-pointer"
            onClick={() => router.back()}
          >
            Project Report
          </span>
          <MdArrowForwardIos className="mt-1 text-orange-500" />
          {name}&apos;s Consumed Report
        </h2>
        <div className="flex gap-4">
          <strong>
            Total Amount: ₹{" "}
            {formatPrice(
              Number(totalAmount.transportation || 0) +
              Number(totalAmount.others || 0) +
              Number(totalAmount.stockDelivered || 0) + Number(totalAmount.siteVisit || 0)
            )}
          </strong>
          <Button
            className={"px-4"}
            title={"Export Contingency Items"}
            onClick={handleConsumedReportExport}
          >
            <LuDownload size={14} />
            Export
          </Button>
        </div>
      </div>
      <div className="min-h-[85vh] overflow-hidden bg-white p-5">
        <div className="flex justify-between">
          <span className="flex relative mb-2">
            {tabs.map((tab, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.preventDefault();
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
          <strong>
            Total Amount without GST: ₹
            {activeTab == "Transportation"
              ? formatPrice(totalAmount.transportation)
              : activeTab === "Installation/Freight/Other"
                ? formatPrice(totalAmount.others)
                : activeTab === "Site Visit" ? formatPrice(totalAmount.siteVisit) : formatPrice(totalAmount.stockDelivered)}{" "}
          </strong>
        </div>
        <div className="overflow-x-auto h-full pb-10">
          {isLoading ? (
            <Loading />
          ) : (
            <Table
              columns={
                activeTab == "Transportation"
                  ? [...tableHeader, ...transportationTableHeader]
                  : activeTab === "Installation/Freight/Other"
                    ? [...tableHeader, ...otherTableHeader]
                    : activeTab === "Site Visit" ? siteVisitTableHeader : [...tableHeader, ...stockTableHeader]
              }
              rows={
                activeTab == "Transportation"
                  ? transportationList
                  : activeTab === "Installation/Freight/Other"
                    ? otherList
                    : activeTab === "Site Visit" ? siteVisitList : stockDeliveredList
                // : stockDeliveredList.filter(el => el.category === "BOM Item")
                // : stockDeliveredList.filter(el => el.category === "Site Visit")
              }
            />
          )}
        </div>
      </div>
    </>
  );
};

export default ProjectReport;
