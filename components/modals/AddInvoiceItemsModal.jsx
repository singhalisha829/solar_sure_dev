import { useState, useEffect } from "react";
import FormModal from "../shared/FormModal";
import ProjectItemTable from "../project-components/ProjectItemTable";
import { toast } from "sonner";

const AddInvoiceItem = ({ modalId, itemList, onSubmit }) => {
  const [unpackedItems, setUnpackedItems] = useState([...itemList]);
  const [errorRows, setErrorRows] = useState([]);

  const tableHeader = [
    {
      name: "Item Code",
      key: "project_bom_item_code",
      width: "130px",
    },
    {
      name: "Item Name",
      key: "project_bom_item_name",
      width: "180px",
    },
    {
      name: "BOM Quantity",
      key: "booked_quantity",
      key2: "unit_symbol",
      type: "upload_invoice_quantity",
      width: "120px",
    },
    {
      name: "Left Quantity",
      key: "left_quantity",
      key2: "unit_symbol",
      width: "120px",
    },
    {
      name: "Quantity",
      key: "quantity",
      type: "number",
      width: "100px",
    },
    {
      name: "Unit Price",
      key: "unit_price",
      type: "number",
      width: "100px",
    },
    {
      name: "Taxable Amount",
      key: "taxable_amount",
      width: "140px",
    },
    {
      name: "Tax Rate(%)",
      key: "tax_rate",
      type: "number",
      width: "130px",
    },
    {
      name: "Tax Amount",
      key: "tax_amount",
      width: "110px",
    },
    {
      name: "Total Amount",
      key: "total_amount",
      width: "130px",
    },
    {
      name: "Remark",
      key: "remark",
      width: "200px",
    },
  ];

  const tableValueHandler = (key, value, index) => {
    const updatedItemList = [...unpackedItems];

    // Update the selected item in both lists
    let selectedItem = {};
    let taxable_amount = 0,
      tax_amount = 0,
      total_amount = 0;
    if (
      key[0] === "quantity" &&
      Number(value) > unpackedItems[index].left_quantity
    ) {
      selectedItem = { ...updatedItemList[index], [key]: 0 };
    } else {
      selectedItem = { ...updatedItemList[index], [key]: value };
      // Calculate the amounts
      taxable_amount =
        Number(selectedItem.quantity || 0) *
          Number(selectedItem.unit_price || 0) || 0;
      tax_amount =
        (taxable_amount * Number(selectedItem.tax_rate || 0)) / 100 || 0;
      total_amount = taxable_amount + tax_amount;

      // Update the selected item with the calculated amounts
      selectedItem.taxable_amount = taxable_amount.toFixed(2);
      selectedItem.tax_amount = tax_amount.toFixed(2);
      selectedItem.total_amount = total_amount.toFixed(2);

      // Update the item in the item list
      updatedItemList[index] = selectedItem;
    }
    // Update the state
    setUnpackedItems([...updatedItemList]);
  };

  const handleFormValidation = () => {
    // validate all fields in table
    let invalid_items = [],
      valid_items = [];
    unpackedItems.map((product, index) => {
      if (
        (product.unit_price ?? "") === "" &&
        (product.tax_rate ?? "") === ""
      ) {
        return;
      } else if (
        !product.unit_price ||
        !product.tax_rate ||
        !product.quantity
      ) {
        invalid_items.push(product);
      } else {
        valid_items.push(product);
      }
    });

    if (invalid_items.length > 0) {
      setErrorRows(invalid_items);
      toast.error("Please provide complete details for the highlighted items!");
      return;
    }

    if (valid_items.length === 0) {
      toast.error("Please enter details for at least one Item!");
      return;
    }
    setErrorRows([]);
    onSubmit(unpackedItems);
  };

  return (
    <FormModal
      id={modalId}
      onSubmit={handleFormValidation}
      width="w-[70%]"
      ctaText={"Add Item"}
      heading={"Add Invoice Item"}
    >
      <div className="overflow-scroll">
        <ProjectItemTable
          columns={tableHeader}
          rows={unpackedItems}
          isEditMode={true}
          valueHandler={tableValueHandler}
          errorRows={errorRows}
          errorRowIdName={"id"}
          showSerialNumber={true}
        />
      </div>
    </FormModal>
  );
};

export default AddInvoiceItem;
