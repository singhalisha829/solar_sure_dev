import { useManufacturers } from "@/contexts/manufacturers";
import { useState } from "react";
import Input from "@/components/formPage/Input";
import FormModal from "@/components/shared/FormModal";
import { toast } from "sonner";
import { checkSpecificKeys } from "@/utils/formValidationHandler";
import { dateFormat } from "@/utils/formatter";

const EditContingencyItem = ({ onEditItem, itemDetails, onClose }) => {
  const { manufacturers } = useManufacturers();
  const [otherItem, setOtherItem] = useState(itemDetails);

  const [item, setItem] = useState({
    ...itemDetails,
    old_unit_price: itemDetails?.unit_price,
    old_quantity: itemDetails?.quantity,
  });

  const valueHandler = (e) => {
    setItem((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = async () => {
    let keysToCheck = {};

    if (item.contingency_type === "new item") {
      keysToCheck = {
        ...keysToCheck,
        unit_price: "Unit Price",
      };
    } else if (item.contingency_type === "price") {
      keysToCheck = { ...keysToCheck, unit_price: "Unit Price" };
    } else if (item.contingency_type === "quantity_and_price") {
      keysToCheck = {
        ...keysToCheck,
        quantity: "Quantity",
        unit_price: "Unit Price",
      };
    }

    keysToCheck = { ...keysToCheck, remarks: "Remark" };

    const validationResult = checkSpecificKeys(item, keysToCheck);
    if (validationResult.isValid === false) {
      toast.error(validationResult.message);
      return;
    }

    let total_amount = item.quantity * item.unit_price || 0;
    let contingency_amount = 0;
    if (["new item"].includes(item.contingency_type)) {
      contingency_amount = total_amount;
    } else if (item.contingency_type == "price") {
      contingency_amount =
        item.quantity *
        (Number(item.unit_price || 0) - Number(item?.old_unit_price || 0));
    } else {
      contingency_amount =
        Number(total_amount) -
        Number(item?.old_quantity * item?.old_unit_price);
    }

    onEditItem(item.id, {
      remarks: item?.remarks,
      unit_price: item.unit_price,
      total_amount: total_amount,
      contingency_amount: contingency_amount,
      isOthers: false,
    });
  };

  const onSubmitOthers = async () => {
    let keysToCheck = {
      amount: "Amount",
      description: "Description",
    };

    const validationResult = checkSpecificKeys(otherItem, keysToCheck);
    if (validationResult.isValid === false) {
      toast.error(validationResult.message);
      return;
    }

    onEditItem(item.id, {
      remarks: otherItem?.description,
      unit_price: otherItem.amount,
      total_amount: otherItem.amount,
      contingency_amount: otherItem.amount,
      isOthers: true,
    });
  };

  return (
    <FormModal
      id={"edit-contingency-item"}
      onSubmit={() => {
        if (["Installation", "Freight", "Other"].includes(item?.category)) {
          onSubmitOthers();
        } else {
          onSubmit();
        }
      }}
      onClose={onClose}
      ctaText={"Save"}
      heading={"Edit Contingency Item"}
      className={"overflow-visible"}
    >
      <div
        className={`grid grid-cols-2 gap-x-2.5 gap-y-5 ${item.contingency_type == "" ? "" : "overflow-y-auto"}`}
      >
        <div>
          <strong>Category: </strong>
          {item?.category}
        </div>

        {!["Installation", "Freight", "Other"].includes(item?.category) ? (
          <>
            <div className="capitalize">
              <strong>Contingency Type: </strong>
              {item?.contingency_type.split("_").join(" ")}
            </div>

            <div>
              <strong>Date: </strong>
              {dateFormat(item?.date)}
            </div>

            <div>
              <strong>Section: </strong>
              {item?.section_name}
            </div>

            {/* add item form */}
            {item?.contingency_type === "new item" && (
              <>
                <div>
                  <strong>Product: </strong>
                  {item?.item_name} ({item?.product_code})
                </div>

                <div>
                  <strong>Make: </strong>
                  {manufacturers.find((m) => m.id === item?.make)?.name}
                </div>

                <div>
                  <strong>Quantity: </strong>
                  {item?.quantity}
                </div>

                <div>
                  <strong>Unit of Measurement: </strong>
                  {item?.unit_symbol == "" ? "-" : item.unit_symbol}
                </div>

                <Input
                  type="number"
                  onChange={valueHandler}
                  mandatory={true}
                  value={item.unit_price}
                  name={"unit_price"}
                  label={"Unit Price"}
                />

                <div
                  className={`relative flex flex-col gap-2.5 w-full justify-center`}
                >
                  <label
                    className="flex gap-[2px] text-xs capitalize text-zinc-800 font-bold tracking-tight"
                    htmlFor={"Total Amount"}
                  >
                    Total Amount
                  </label>
                  <span className="text-sm">
                    {item.quantity * item.unit_price || 0}
                  </span>
                </div>
                <div
                  className={`relative flex flex-col gap-2.5 w-full justify-center`}
                >
                  <label
                    className="flex gap-[2px] text-xs capitalize text-zinc-800 font-bold tracking-tight"
                    htmlFor={"Total Amount"}
                  >
                    Contingency Amount
                  </label>
                  <span className="text-sm">
                    {item.quantity * item.unit_price || 0}
                  </span>
                </div>
              </>
            )}

            {/* change unit price form */}
            {item.contingency_type === "price" && (
              <>
                <div>
                  <strong>Product: </strong>
                  {item?.item_name} ({item?.product_code})
                </div>
                <Input
                  type="number"
                  onChange={valueHandler}
                  mandatory={true}
                  value={item.unit_price}
                  name={"unit_price"}
                  label={`Unit Price (Old Unit Price: ${item?.old_unit_price ?? ""})`}
                />
                <div
                  className={`relative flex flex-col gap-2.5 w-full justify-center`}
                >
                  <label
                    className="flex gap-[2px] text-xs capitalize text-zinc-800 font-bold tracking-tight"
                    htmlFor={"Left Quantity"}
                  >
                    Remaining Quantity
                  </label>
                  <span className="text-sm">{item.quantity || 0}</span>
                </div>
                <div
                  className={`relative flex flex-col gap-2.5 w-full justify-center`}
                >
                  <label
                    className="flex gap-[2px] text-xs capitalize text-zinc-800 font-bold tracking-tight"
                    htmlFor={"Total Amount"}
                  >
                    Total Amount
                  </label>
                  <span className="text-sm">
                    {item.quantity * item.unit_price || 0}
                  </span>
                </div>
                <div
                  className={`relative flex flex-col gap-2.5 w-full justify-center`}
                >
                  <label
                    className="flex gap-[2px] text-xs capitalize text-zinc-800 font-bold tracking-tight"
                    htmlFor={"Total Amount"}
                  >
                    Contingency Amount
                  </label>
                  <span className="text-sm">
                    {item.quantity *
                      (Number(item.unit_price || 0) -
                        Number(item?.old_unit_price || 0))}
                  </span>
                </div>
              </>
            )}

            {/* change quantity/unit price form */}
            {item.contingency_type === "quantity_and_price" && (
              <>
                <div>
                  <strong>Product: </strong>
                  {item?.item_name} ({item?.product_code})
                </div>
                <div>
                  <strong>Quantity: </strong>
                  {item?.quantity}
                </div>

                <Input
                  type="number"
                  onChange={valueHandler}
                  mandatory={true}
                  value={item.unit_price}
                  name={"unit_price"}
                  label={`Unit Price (Old Unit Price: ${item?.old_unit_price ?? ""})`}
                />
                <div
                  className={`relative flex flex-col gap-2.5 w-full justify-center`}
                >
                  <label
                    className="flex gap-[2px] text-xs capitalize text-zinc-800 font-bold tracking-tight"
                    htmlFor={"Total Amount"}
                  >
                    Total Amount
                  </label>
                  <span className="text-sm">
                    {item.quantity * item.unit_price || 0}
                  </span>
                </div>
                <div
                  className={`relative flex flex-col gap-2.5 w-full justify-center`}
                >
                  <label
                    className="flex gap-[2px] text-xs capitalize text-zinc-800 font-bold tracking-tight"
                    htmlFor={"Total Amount"}
                  >
                    Contingency Amount
                  </label>
                  <span className="text-sm">
                    {Number(item.quantity * item.unit_price) -
                      Number(item?.old_quantity * item?.old_unit_price)}
                  </span>
                </div>
              </>
            )}

            {item.contingency_type !== "" && (
              <Input
                type="textarea"
                onChange={valueHandler}
                mandatory={true}
                value={item.remarks}
                name={"remarks"}
                label={"Remark"}
                outerClass="col-span-2"
              />
            )}
          </>
        ) : (
          // other contigency item form
          <>
            <div>
              <strong>Name: </strong>
              {otherItem?.name}
            </div>

            <Input
              type={"number"}
              mandatory={true}
              value={otherItem.amount}
              onChange={(e) =>
                setOtherItem({ ...otherItem, amount: e.target.value })
              }
              placeholder={"0.0"}
              label={"Amount"}
            />
            <Input
              type={"textarea"}
              mandatory={true}
              value={otherItem.description}
              outerClass="col-span-2 "
              onChange={(e) =>
                setOtherItem({ ...otherItem, description: e.target.value })
              }
              placeholder={"Description"}
              label={"Description"}
            />
          </>
        )}
      </div>
    </FormModal>
  );
};

export default EditContingencyItem;
