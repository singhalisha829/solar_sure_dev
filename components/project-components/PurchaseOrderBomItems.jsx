import { useState, useEffect } from "react";
import { SelectForObjects } from "../formPage/MultiSelectDropdown/MultiSelectDropdown";
import { useVendors } from "@/contexts/vendors";
import Button from "../shared/Button";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { useModal } from "@/contexts/modal";
import { formatPrice } from "@/utils/numberHandler";
import { FaPlusCircle } from "react-icons/fa";
import Loading from "../Loading";
import PurchaseOrderTable from "./PurchaseOrderTable";
import ProjectItemTable from "./ProjectItemTable";
import { useRouter } from "next/router";

const AddVendor = dynamic(() => import("@/components/modals/AddVendor"));

const PurchaseOrderBomItems = ({
  onNextClick,
  bomItemDetails,
  poItemList,
  purchasers,
  section,
}) => {
  const { vendors } = useVendors();
  const { openModal } = useModal();
  const router = useRouter();
  const [formDetails, setFormDetails] = useState(bomItemDetails);
  const [itemList, setItemList] = useState(poItemList);
  const [errorRows, setErrorRows] = useState([]);

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
      canBeZero: true,
      key: "tax",
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

  useEffect(() => {
    if (poItemList.length > 0) {
      setItemList(poItemList);
    }
  }, [poItemList]);

  const valueHandler = (key, value, index, bomHead) => {
    const selectedBomHeadIndex = itemList.findIndex(
      (item) => item.bom_head === bomHead
    );
    if (selectedBomHeadIndex != -1) {
      const updatedItemList = itemList[selectedBomHeadIndex].product_list;
      const updatedFormDetails = {
        ...formDetails,
        product_list: [...formDetails.product_list],
      };

      // Update the selected item in both lists
      const selectedItem = { ...updatedItemList[index], [key]: value };

      // Calculate the amounts
      let taxable_amount = 0;
      if (["Installation", "Freight", "Other"].includes(section)) {
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

      let total_taxable_amount = 0,
        total_tax_amount = 0,
        total_amount = 0;
      updatedFormDetails.product_list.map((item) => {
        total_taxable_amount += Number(item.taxable_amount);
        total_tax_amount += Number(item.tax_amount);
        total_amount += Number(item.total_amount);
      });

      const newList = itemList;
      newList[selectedBomHeadIndex].product_list = updatedItemList;

      // Update the state
      setFormDetails({
        ...updatedFormDetails,
        total_po_taxable_amount: total_taxable_amount,
        total_po_tax_amount: total_tax_amount,
        total_po_amount: total_amount,
      });
      setItemList(newList);
    }
  };

  const handleNextClick = (willAddExtraCharge = false, is_draft = false) => {
    let list = [];
    let formData = formDetails;

    if (formDetails.vendor == "") {
      toast.error("Field Vendor is empty!");
      return;
    }
    if (formDetails.purchaser == "") {
      toast.error("Field Purchaser is empty!");
      return;
    }
    if (formDetails.product_list.length == 0) {
      toast.error("Please add at least one Item!");
      return;
    }
    // remove items from list which doesnt have any user entered data-> required_quantity, unit_price and tax
    // and throw error for items with some missing data
    if (["Installation", "Freight", "Other"].includes(section)) {
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
    onNextClick(formData, itemList, willAddExtraCharge, is_draft);
  };

  return (
    <>
      <div className="grid grid-cols-3 gap-4">
        <SelectForObjects
          margin={"0px"}
          mandatory
          height={"36px"}
          setselected={(name, id) => {
            const selected = vendors.find((vendor) => vendor.id == id);
            setFormDetails((prev) => ({
              ...prev,
              vendor: Number(id),
              vendor_name: name,
              vendor_gst: selected.gst,
              vendor_address: `${selected.address}, ${selected.city_name}, ${selected.state_name}, ${selected.pincode}`,
            }));
          }}
          selected={formDetails.vendor_name}
          options={vendors}
          optionName={"name"}
          optionID={"id"}
          placeholder="Select.."
          dropdownLabel={"Vendor"}
          canAdd={true}
          toAddName={"Vendor"}
          onAddClick={() => {
            router.push("/masters/vendors/create-new-vendor");
          }}
        />

        <div className="text-sm self-start">
          <label className="text-xs mb-2 text-zinc-800 font-bold tracking-tight">
            Vendor Address:
          </label>{" "}
          <div>
            {formDetails?.vendor_address}{" "}
            {formDetails?.vendor_gst !== "" && (
              <>
                <br /> <span>GST: {formDetails?.vendor_gst}</span>
              </>
            )}
          </div>
        </div>

        <SelectForObjects
          margin={"0px"}
          mandatory
          height={"36px"}
          setselected={(name, id) => {
            setFormDetails((prev) => ({
              ...prev,
              purchaser: Number(id),
              purchaser_name: name,
            }));
          }}
          selected={formDetails.purchaser_name}
          options={purchasers}
          optionName={"name"}
          optionID={"id"}
          placeholder="Select.."
          dropdownLabel={"Purchaser"}
        />
      </div>

      <div className="overflow-scroll">
        {itemList.length > 0 ? (
          itemList.map((category) => {
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
                  {["Installation", "Freight", "Other"].includes(section) ? (
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
          })
        ) : (
          <Loading />
        )}
      </div>
      <div className="grid grid-cols-2 gap-6 my-2 w-1/2 text-xs text-zinc-800">
        <label className=" gap-[2px] font-bold">Total Taxable Amount:</label>
        {formatPrice(formDetails?.total_po_taxable_amount || 0)}
        <label className=" gap-[2px] font-bold">Total Tax Amount:</label>
        {formatPrice(formDetails?.total_po_tax_amount || 0)}
        <label className=" gap-[2px] font-bold">Total PO Amount:</label>
        {formatPrice(formDetails?.total_po_amount || 0)}
      </div>

      <div className=" w-full flex justify-between gap-4">
        <Button
          onClick={() => handleNextClick(true)}
          variant={"inverted"}
          customText={"#F47920"}
          className="bg-orange-400/10 text-primary px-2 hover:bg-orange-600/10 "
        >
          <FaPlusCircle />
          Add Extra Charges
        </Button>
        <div className="flex gap-4">
          <Button
            className=" h-[2rem] w-small"
            onClick={() =>
              setFormDetails({
                vendor_id: "",
                vendor_name: "",
                product_list: [],
              })
            }
            customText={"#9E9E9E"}
            variant={"gray"}
          >
            Clear
          </Button>
          <Button
            className=" h-[2rem] w-small"
            onClick={() => handleNextClick(false, true)}
          >
            Save as draft
          </Button>
          <Button
            className=" h-[2rem] w-small"
            onClick={() => handleNextClick()}
          >
            Next
          </Button>
        </div>
      </div>
      <AddVendor modalId={"add-vendor"} />
    </>
  );
};
export default PurchaseOrderBomItems;
