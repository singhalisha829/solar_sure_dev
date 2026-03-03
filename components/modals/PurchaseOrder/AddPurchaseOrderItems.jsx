import { useState, useEffect } from "react";
import FormModal from "../../shared/FormModal";
import ProjectItemTable from "../../project-components/ProjectItemTable";
import { editPurchaseOrder } from "@/services/api";
import { requestHandler } from "@/services/ApiHandler";
import { toast } from "sonner";
import PurchaseOrderTable from "@/components/project-components/PurchaseOrderTable";

const AddPurchaseOrderItem = ({
  itemList,
  poAmount,
  onSuccessfullSubmit,
  projectId,
  poId,
  purchaseOrderDetails,
}) => {
  const [unpackedItems, setUnpackedItems] = useState(itemList);
  const [errorRows, setErrorRows] = useState([]);
  const [isOthersPo, setIsOthersPo] = useState(null);
  const [formDetails, setFormDetails] = useState({
    total_po_amount: poAmount.total_po_amount,
    total_po_taxable_amount: poAmount.total_po_taxable_amount,
    total_po_tax_amount: poAmount.total_po_tax_amount,
    product_list: [],
  });

  useEffect(() => {
    if (itemList.length > 0) {
      setUnpackedItems(itemList);
      if (["Installation", "Freight", "Other"].includes(itemList[0].bom_head)) {
        setIsOthersPo(true);
      } else {
        setIsOthersPo(false);
      }
    }
  }, [itemList]);

  const tableHeader = [
    {
      name: "Item Code",
      width: "130px",
      colSpan: 1,
    },
    {
      name: "Name",
      width: "180px",
      colSpan: 1,
    },
    {
      name: "Qty.",
      width: "80px",
      colSpan: 1,
    },
    {
      name: "PO Qty.",
      width: "80px",
      colSpan: 1,
    },
    {
      name: "Left Qty.",
      width: "80px",
      colSpan: 1,
    },
    {
      name: (
        <>
          BBU
          <br />
          Unit Price(₹)
        </>
      ),
      width: "120px",
      colSpan: 1,
    },
    {
      name: (
        <>
          Total BBU
          <br />
          Unit Price(₹)
        </>
      ),
      width: "120px",
      colSpan: 1,
    },
    {
      name: "Required Qty.",
      width: "120px",
      colSpan: 1,
    },
    {
      name: "Unit Price(₹)",
      colSpan: 4,
    },
    {
      name: "Taxable Amount(₹)",
      width: "100px",
      colSpan: 1,
    },
    {
      name: "Tax(%)",
      width: "120px",
      colSpan: 1,
    },
    {
      name: "Tax Amount(₹)",
      width: "100px",
      colSpan: 1,
    },
    {
      name: "Total Amount(₹)",
      width: "100px",
      colSpan: 1,
    },
    {
      name: "ETD",
      width: "100px",
      colSpan: 1,
    },
    {
      name: "Description",
      width: "250px",
      colSpan: 1,
    },
  ];

  const secondaryTableHeader = [
    {
      name: "",
      key: "product_code",
      width: "130px",
    },
    {
      name: "",
      key: "item__name",
      width: "180px",
    },
    {
      name: "",
      key: "quantity",
      type: "quantity_object",
      width: "80px",
    },
    {
      name: "",
      key: "booked_po_quantity",
      type: "quantity_object",
      width: "80px",
    },
    {
      name: "",
      key: "quantity_left_after_purchase_order",
      type: "quantity_object",
      width: "80px",
    },
    {
      name: "",
      key: "bbu_unit_price",
      displayType: "price",
      width: "120px",
    },
    {
      name: "",
      key: "bbu_total_price",
      displayType: "price",
      width: "120px",
    },
    {
      name: "",
      key: "required_quantity",
      type: "number",
      width: "120px",
    },
    {
      name: "Ex Works",
      type: "number",
      key: "ex_works_unit_price",
      maxLimit: "bbu_unit_price",
      width: "120px",
    },
    {
      name: "Charges",
      type: "text",
      key: "charges",
      width: "120px",
    },
    {
      name: "Charges Amount",
      type: "number",
      key: "charges_cost",
      canBeZero: true,
      maxLimit: "bbu_unit_price",
      width: "120px",
    },
    {
      name: "Total",
      key: "unit_price",
      width: "120px",
    },
    {
      name: "",
      key: "taxable_amount",
      displayType: "price",
      width: "100px",
    },
    {
      name: "",
      type: "number",
      key: "tax",
      canBeZero: true,
      width: "120px",
    },
    {
      name: "",
      key: "tax_amount",
      displayType: "price",
      width: "100px",
    },
    {
      name: "",
      key: "total_amount",
      displayType: "price",
      width: "100px",
    },
    {
      name: "",
      key: "etd",
      type: "date",
      width: "100px",
    },
    {
      name: "",
      key: "description",
      type: "text",
      width: "250px",
    },
  ];

  const tableHeaderForOthers = [
    {
      name: "Name",
      key: "name",
      width: "130px",
    },
    {
      name: "Description",
      key: "description",
      width: "180px",
    },
    {
      name: "PO Amt.",
      key: "amount",
      displayType: "price",
      width: "80px",
    },
    {
      name: "Used PO Amt.",
      key: "used_po_amount",
      displayType: "price",
      width: "80px",
    },
    {
      name: "Left PO Amt.",
      key: "left_po_amount",
      displayType: "price",
      width: "80px",
    },
    {
      name: "Required Amt.",
      key: "required_amount",
      type: "number",
      width: "120px",
    },
    {
      name: "Taxable Amount(₹)",
      key: "taxable_amount",
      displayType: "price",
      width: "100px",
    },
    {
      name: "Tax(%)",
      type: "number",
      key: "tax",
      canBeZero: true,
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
      name: "Description",
      key: "description",
      type: "text",
      width: "250px",
    },
  ];

  const valueHandler = (key, value, index, bomHead) => {
    const selectedBomHeadIndex = unpackedItems.findIndex(
      (item) => item.bom_head === bomHead
    );
    if (selectedBomHeadIndex != -1) {
      const updatedItemList = unpackedItems[selectedBomHeadIndex].product_list;
      const updatedFormDetails = {
        ...formDetails,
        product_list: [...formDetails.product_list],
      };

      // Update the selected item in both lists
      const selectedItem = { ...updatedItemList[index], [key]: value };

      // Calculate the amounts
      let taxable_amount = 0;
      if (isOthersPo) {
        taxable_amount = Number(selectedItem.required_amount || 0);
      } else {
        if (key[0] === "charges_cost") {
          selectedItem.unit_price =
            Number(selectedItem["ex_works_unit_price"] || 0) + Number(value);
        }
        if (key[0] === "ex_works_unit_price") {
          selectedItem.unit_price =
            Number(selectedItem["charges_cost"] || 0) + Number(value);
        }
        if (selectedItem.unit_price > selectedItem.bbu_unit_price) {
          setErrorRows([...errorRows, selectedItem]);
        } else {
          const itemIndex = errorRows.findIndex(
            (item) => item.id === selectedItem.id
          );
          if (itemIndex != -1) {
            let list = errorRows;
            list.splice(itemIndex, 1);
            setErrorRows([...list]);
          }
        }
        taxable_amount =
          Number(selectedItem.required_quantity || 0) *
            Number(selectedItem.unit_price || 0) || 0;
      }

      const tax_amount =
        (taxable_amount * Number(selectedItem.tax || 0)) / 100 || 0;
      const total_item_amount = taxable_amount + tax_amount;

      // Update the selected item with the calculated amounts
      selectedItem.taxable_amount = taxable_amount;
      selectedItem.tax_amount = tax_amount;
      selectedItem.total_amount = total_item_amount;

      // Update the item in the item list
      updatedItemList[index] = selectedItem;

      // Update or add the item in the form details
      const itemIndex = updatedFormDetails.product_list.findIndex(
        (item) => item.id === updatedItemList[index].id
      );

      if (itemIndex === -1) {
        updatedFormDetails.product_list.push(selectedItem);
      } else {
        updatedFormDetails.product_list[itemIndex] = selectedItem;
      }

      let total_taxable_amount = formDetails?.total_po_taxable_amount || 0,
        total_tax_amount = formDetails?.total_po_tax_amount || 0,
        total_amount = formDetails?.total_po_amount || 0;
      updatedFormDetails.product_list.map((item) => {
        total_taxable_amount += Number(item.taxable_amount);
        total_tax_amount += Number(item.tax_amount);
        total_amount += Number(item.total_amount);
      });

      const newList = unpackedItems;
      newList[selectedBomHeadIndex].product_list = updatedItemList;

      // Update the state
      setFormDetails({
        ...updatedFormDetails,
        total_po_taxable_amount: total_taxable_amount,
        total_po_tax_amount: total_tax_amount,
        total_po_amount: total_amount,
      });
      setUnpackedItems(newList);
    }
  };

  const validateFields = () => {
    let list = [];
    let formData = formDetails;

    if (formDetails.product_list.length == 0) {
      toast.error("Please add at least one Item!");
      return;
    }

    // remove items from list which doesnt have any user entered data-> required_quantity, unit_price and tax
    // and throw error for items with some missing data
    if (isOthersPo) {
      formDetails.product_list.map((product, index) => {
        if (
          (product.required_amount ?? "") === "" &&
          (product.tax ?? "") === "" &&
          (product.etd ?? "") === ""
        ) {
          formData.product_list.splice(index, 1);
        } else if (
          !product.required_amount ||
          !product.tax ||
          !product.description ||
          !product.etd
        ) {
          list.push(product);
        }
      });
    } else {
      formDetails.product_list.map((product, index) => {
        if (
          (product.required_quantity ?? "") === "" &&
          (product.tax ?? "") === "" &&
          (product.etd ?? "") === "" &&
          (product.ex_works_unit_price ?? "") === ""
        ) {
          formData.product_list.splice(index, 1);
        } else if (
          !product.required_quantity ||
          !product.ex_works_unit_price ||
          !product.tax ||
          !product.description ||
          !product.etd
        ) {
          list.push(product);
        }
      });
    }
    if (list.length > 0) {
      setErrorRows(list);
      toast.error("Please provide complete details for the highlighted items!");
      return;
    }
    setErrorRows([]);
    handleAddNewItems();
  };

  const handleAddNewItems = async () => {
    let productList = [],
      products_total_amount = 0,
      products_total_taxable_amount = 0,
      products_total_tax_amount = 0;
    formDetails.product_list.map((product) => {
      products_total_taxable_amount += Number(product.taxable_amount || 0);
      products_total_tax_amount += Number(product.tax_amount || 0);
      products_total_amount += Number(product.total_amount || 0);

      let productData = {
        unit: product.unit_id,
        taxable_amount: product.taxable_amount,
        tax_rate: product.tax,
        tax_amount: product.tax_amount,
        total_amount: product.total_amount,
        description: product.description,
        section: product.section,
        etd: product.etd,
        transaction_type: "add",
        section: product.section,
      };
      if (isOthersPo) {
        productData.project_installation_budget = product.id;
        productData.quantity = 1;
        productData.unit_price = product.required_amount;
      } else {
        productData.project_bom_item = product.id;
        productData.quantity = product.required_quantity;
        productData.unit_price = product.unit_price;
        productData.ex_works_unit_price = product.ex_works_unit_price;
        productData.charges = product.charges;
        productData.charges_cost =
          product.charges_cost != "" ? product.charges_cost : 0;
      }
      productList.push(productData);
    });
    const apiData = {
      project: projectId,
      total_po_amount:
        Number(purchaseOrderDetails?.total_po_amount || 0) +
        Number(products_total_amount),
      total_po_taxable_amount:
        Number(purchaseOrderDetails?.total_po_taxable_amount || 0) +
        Number(products_total_taxable_amount),
      total_po_tax_amount:
        Number(purchaseOrderDetails?.total_po_tax_amount || 0) +
        Number(products_total_tax_amount),
      product_list: productList,
    };

    await requestHandler(
      async () => await editPurchaseOrder(poId, apiData),
      null,
      (data) => {
        toast.success("Purchase Order Saved Successfully!");
        onSuccessfullSubmit();
        onClose();
      },
      toast.error
    );
  };

  const onClose = () => {
    setFormDetails({
      total_po_amount: poAmount.total_po_amount,
      total_po_taxable_amount: poAmount.total_po_taxable_amount,
      total_po_tax_amount: poAmount.total_po_tax_amount,
      product_list: [],
    });
  };

  return (
    <FormModal
      id={"add-purchase-order-item"}
      onSubmit={validateFields}
      width="w-[70%]"
      ctaText={"Add Item"}
      heading={"Add Purchase Order Item"}
      onClose={onClose}
    >
      <div className="overflow-scroll">
        {unpackedItems.length > 0 &&
          unpackedItems.map((category) => {
            if (category.product_list.length > 0) {
              return (
                <div key={category.bom_head} className="mb-4">
                  <div className="flex justify-between items-center relative mb-2">
                    <div className="sticky top-0 left-0 z-10 bg-white">
                      <p className="text-zinc-800 text-xl font-bold tracking-tight">
                        {category.bom_head}
                      </p>
                    </div>
                  </div>
                  {isOthersPo ? (
                    <ProjectItemTable
                      columns={tableHeaderForOthers}
                      rows={category.product_list}
                      valueHandler={(key, value, index) =>
                        valueHandler(key, value, index, category.bom_head)
                      }
                      isEditMode={true}
                      errorRows={errorRows}
                      errorRowIdName={"id"}
                    />
                  ) : (
                    <PurchaseOrderTable
                      columns={tableHeader}
                      secondaryTableHeader={secondaryTableHeader}
                      rows={category.product_list}
                      valueHandler={(key, value, index) =>
                        valueHandler(key, value, index, category.bom_head)
                      }
                      errorRows={errorRows}
                      errorRowIdName={"item_id"}
                    />
                  )}
                </div>
              );
            }
          })}
      </div>
    </FormModal>
  );
};

export default AddPurchaseOrderItem;
