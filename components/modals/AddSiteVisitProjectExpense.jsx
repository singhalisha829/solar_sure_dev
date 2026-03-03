import { useState, useEffect } from "react";
import FormModal from "../shared/FormModal";
import Input from "../formPage/Input";
import { SelectForObjects } from "../formPage/MultiSelectDropdown/MultiSelectDropdown";
import { checkSpecificKeys } from "@/utils/formValidationHandler";
import { handleFileUpload } from "@/utils/documentUploadHandler";
import { toast } from "sonner";
import { useModal } from "@/contexts/modal";
import { FaEye } from "react-icons/fa";

const AddSiteVisit = ({ modalId, onSaveExpense, expenseData, filterOptions = [] }) => {
  const { closeModal } = useModal();
  const [expenseDetails, setExpenseDetails] = useState({
    amount: "",
    bill_document: "",
    type_of_expense: "",
    remark: "",
  });

  const expenseTypes = [
    { name: "Food", value: "food" },
    { name: "Hotel", value: "hotel" },
    { name: "Travel", value: "travel" },
    { name: "Material", value: "material" },
    { name: "Labour", value: "labour" },
    { name: "Other", value: "other" },
  ];

  useEffect(() => {
    if (expenseData) {
      setExpenseDetails({ ...expenseData });
    }
  }, [expenseData]);

  const valueHandler = (e) => {
    setExpenseDetails((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSiteImages = async (e) => {
    const response = await handleFileUpload(e.target.files[0]);
    if (response.type === "success") {
      setExpenseDetails({
        ...expenseDetails,
        bill_document: response.data,
      });
    } else {
      toast.error(response.error || "Oops! Something went wrong");
    }
  };

  const onSubmit = async () => {
    const keysToCheck = {
      type_of_expense: "Expense Type",
      amount: "Amount",
    };
    const validationResult = checkSpecificKeys(expenseDetails, keysToCheck);
    if (validationResult.isValid === false) {
      toast.error(validationResult.message);
      return;
    }

    if (modalId.split("-")[0] === "add") {
      clearForm();
    }
    closeModal(modalId);
    onSaveExpense(expenseDetails);
  };

  const clearForm = () => {
    setExpenseDetails({
      amount: "",
      bill_document: "",
      type_of_expense: "",
      remark: "",
    });
  };

  return (
    <FormModal
      id={modalId}
      width="w-[60%]"
      ctaText={modalId.split("-")[0] === "add" ? "Add Project Expense" : "Save"}
      heading={
        modalId.split("-")[0] === "add"
          ? "Add Project Expense"
          : "Edit Project Expense"
      }
      onSubmit={onSubmit}
      onClose={clearForm}
    >
      <div className="grid grid-cols-2 gap-x-2.5 gap-y-5 overflow-scroll p-2">
        <SelectForObjects
          margin={"0px"}
          mandatory
          height={"36px"}
          setselected={(name, value) => {
            setExpenseDetails((prev) => ({
              ...prev,
              type_of_expense: value,
            }));
          }}
          selected={
            expenseTypes.filter(
              (type) => type.value === expenseDetails.type_of_expense
            )[0]?.name
          }
          // options={expenseTypes}
          options={expenseTypes.filter(
            item => !filterOptions.includes(item.value)
          )}
          optionName={"name"}
          optionID={"value"}
          placeholder="Select.."
          dropdownLabel={"Expense Type"}
        />

        <div className="items-center gap-2.5 flex">
          {" "}
          <Input
            type={"file"}
            onChange={handleSiteImages}
            label={"Upload Document"}
            fileTypes={".jpg, .jpeg, .png"}
          />
          {expenseDetails?.bill_document.length !== 0 && (
            <FaEye
              className="cursor-pointer hover:text-primary"
              onClick={() =>
                window.open(expenseDetails?.bill_document, "_blank")
              }
            />
          )}
        </div>

        <Input
          mandatory={true}
          type={"number"}
          onChange={valueHandler}
          value={expenseDetails.amount}
          name={"amount"}
          label={"Amount"}
        />

        <Input
          type={"textarea"}
          outerClass="col-span-2"
          onChange={valueHandler}
          value={expenseDetails.remark}
          name={"remark"}
          label={"Remark"}
        />
      </div>
    </FormModal>
  );
};

export default AddSiteVisit;
