import FormModal from "../shared/FormModal";
import Table from "../SortableTable";
import { dateFormat } from "@/utils/formatter";

const LedgerItemDetails = ({ modalId, data }) => {
  const tableHeader = [
    {
      name: "Product Code",
      key: "product_code",
      width: "20%",
    },
    { name: "Name", key: "product_name", width: "20%" },
    {
      name: "Quantity",
      key: "quantity",
      width: "10%",
      type: "quantity_object",
    },
    {
      name: "Balance Quantity",
      key: "balance_quantity",
      width: "25%",
      type: "quantity_object",
    },
    {
      name: "Unit Price (₹)",
      key: "unit_price",
      width: "20%",
    },
  ];

  return (
    <FormModal id={modalId} heading={"Product Details"}>
      <div className="grid grid-cols-2 text-zinc-800">
        <div>
          <strong>Invoice Number: </strong>
          {data.document_id}
        </div>
        <div>
          <strong>Date: </strong>
          {dateFormat(data.stock_in_date)}
        </div>
      </div>
      <Table columns={tableHeader} rows={data.ledger_items} />
    </FormModal>
  );
};

export default LedgerItemDetails;
