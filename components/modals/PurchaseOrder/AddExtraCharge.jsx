import { useState } from "react";
import FormModal from "@/components/shared/FormModal";
import { SelectForObjects } from "@/components/formPage/MultiSelectDropdown/MultiSelectDropdown";
import Input from "@/components/formPage/Input";
import { checkSpecificKeys } from "@/utils/formValidationHandler";
import { toast } from "sonner";

const AddExtraCharge = ({ extraChargesList, onSubmit }) => {
  const [extraCharge, setExtraCharge] = useState({
    transaction_type: "add",
    charges: "",
    amount: "",
    tax_rate: "",
    tax_amount: "",
    total_amount: "",
    description: "",
    charges_name: "",
  });

  const valueHandler = (e) => {
    if (e.target.name === "amount") {
      let tax_amount =
        (Number(e.target.value) * Number(extraCharge.tax_rate || 0)) / 100;
      let total_amount = Number(e.target.value) + tax_amount;
      setExtraCharge((prev) => ({
        ...prev,
        [e.target.name]: e.target.value,
        tax_amount: tax_amount,
        total_amount: total_amount,
      }));
    } else if (e.target.name === "tax_rate") {
      let tax_amount =
        (Number(e.target.value) * Number(extraCharge.amount || 0)) / 100;
      let total_amount = Number(extraCharge.amount || 0) + tax_amount;
      setExtraCharge((prev) => ({
        ...prev,
        [e.target.name]: e.target.value,
        tax_amount: tax_amount,
        total_amount: total_amount,
      }));
    } else {
      setExtraCharge((prev) => ({
        ...prev,
        [e.target.name]: e.target.value,
      }));
    }
  };

  const validateFormFields = () => {
    const keysToCheck = {
      charges: "Extra Charges",
      amount: "Amount",
      tax_rate: "Tax(%)",
    };
    const validationResult = checkSpecificKeys(extraCharge, keysToCheck);
    if (validationResult.isValid === false) {
      toast.error(validationResult.message);
      return;
    }

    onSubmit(extraCharge);
  };

  return (
    <FormModal
      id={"add-purchase-order-extra-charge"}
      onSubmit={validateFormFields}
      ctaText={"Add"}
      heading={"Add Extra Charge"}
    >
      <div className="grid grid-cols-2 gap-4">
        <SelectForObjects
          mandatory={true}
          margin={"0px"}
          height={"36px"}
          setselected={(value, id) => {
            setExtraCharge((prev) => ({
              ...prev,
              charges: Number(id),
              charges_name: value,
            }));
          }}
          selected={extraCharge.charges_name}
          options={extraChargesList}
          optionName={"name"}
          optionID={"id"}
          placeholder="Select.."
          dropdownLabel={"Extra Charges"}
        />
        <Input
          type={"number"}
          onChange={valueHandler}
          mandatory={true}
          value={extraCharge.amount}
          name={"amount"}
          label={"Amount"}
        />
        <Input
          type={"number"}
          mandatory={true}
          onChange={valueHandler}
          value={extraCharge.tax_rate}
          name={"tax_rate"}
          label={"Tax(%)"}
        />

        <div className={`relative flex flex-col gap-2.5 `}>
          <label className="flex gap-[2px] text-xs capitalize text-zinc-800 font-bold tracking-tight">
            Tax Amount(₹)
          </label>
          {extraCharge.tax_amount}
        </div>

        <div className={`relative flex flex-col gap-2.5`}>
          <label className="flex gap-[2px] text-xs capitalize text-zinc-800 font-bold tracking-tight">
            Total Amount(₹)
          </label>
          {extraCharge.total_amount}
        </div>

        <Input
          type={"textarea"}
          onChange={valueHandler}
          value={extraCharge.description}
          outerClass={"col-span-2"}
          name={"description"}
          label={"Description"}
        />
      </div>
    </FormModal>
  );
};

export default AddExtraCharge;
