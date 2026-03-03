import { useState, useEffect } from "react";
import FormModal from "../../shared/FormModal";
import Input from "../../formPage/Input";
import { toast } from "sonner";
import { requestHandler } from "@/services/ApiHandler";
import { editPaymentTerms } from "@/services/api";
import { useModal } from "@/contexts/modal";
import { SelectForObjects } from "../../formPage/MultiSelectDropdown/MultiSelectDropdown";
import { checkSpecificKeys } from "@/utils/formValidationHandler";

const EditPaymentTerms = ({
  modalId,
  projectId,
  details,
  onSuccessfullSubmit,
  totalPoValue,
}) => {
  const { closeModal } = useModal();
  const [paymentTerms, setPaymentTerms] = useState({
    terms: "",
    amount: "",
    percentage: "",
    date: "",
    status: "Pending",
    project: projectId,
  });

  useEffect(() => {
    if (details) {
      setPaymentTerms(details);
    }
  }, [details]);

  const onSubmit = async () => {
    let keysToCheck = {
      terms: "Terms",
      percentage: "Percentage",
      amount: "Amount",
      status: "Status",
    };
    if (paymentTerms.status === "Paid") {
      keysToCheck = { ...keysToCheck, date: "Date" };
    }
    const validationResult = checkSpecificKeys(paymentTerms, keysToCheck);
    if (validationResult.isValid === false) {
      toast.error(validationResult.message);
      return;
    }

    if (paymentTerms.status !== "Paid") {
      delete paymentTerms.date;
    }

    await requestHandler(
      async () => await editPaymentTerms(details.id, paymentTerms),
      null,
      async (data) => {
        toast.success("Payment Terms Edited Successfully...");
        closeModal(modalId);
        onSuccessfullSubmit();
      },
      toast.error
    );
  };

  return (
    <FormModal
      id={modalId}
      onSubmit={onSubmit}
      ctaText={"Save"}
      heading={`Edit Payment Terms`}
      className={"overflow-visible"}
    >
      <div className="grid gap-y-5">
        {/* <div className="border-1 rounded-sm p-2"> */}
        <div className="grid grid-cols-2 gap-2 items-center">
          <Input
            type="textarea"
            outerClass="col-span-2"
            label="Terms"
            value={paymentTerms.terms}
            onChange={(e) =>
              setPaymentTerms({ ...paymentTerms, terms: e.target.value })
            }
          />
          <Input
            type="number"
            label="Percentage(%)"
            mandatory={true}
            value={paymentTerms.percentage}
            onChange={(e) => {
              let value = e.target.value;
              if (value <= 100) {
                let amount = totalPoValue * (value / 100);
                setPaymentTerms({
                  ...paymentTerms,
                  percentage: value,
                  amount: amount,
                });
              }
            }}
          />
          <Input
            type="number"
            label="Amount(₹)"
            mandatory={true}
            value={paymentTerms.amount}
            onChange={(e) => {
              let percentage = (e.target.value / totalPoValue) * 100;
              setPaymentTerms({
                ...paymentTerms,
                amount: e.target.value,
                percentage: percentage,
              });
            }}
          />
          <SelectForObjects
            margin={"0px"}
            height={"36px"}
            setselected={(name) =>
              setPaymentTerms({ ...paymentTerms, status: name })
            }
            selected={paymentTerms.status}
            mandatory={true}
            options={[{ name: "Pending" }, { name: "Paid" }]}
            optionName={"name"}
            placeholder="Select"
            dropdownLabel={"Status"}
          />
          {paymentTerms.status !== "Pending" && (
            <Input
              type="date"
              label="Date"
              mandatory={true}
              value={paymentTerms.date}
              onChange={(e) =>
                setPaymentTerms({ ...paymentTerms, date: e.target.value })
              }
            />
          )}
        </div>
      </div>
    </FormModal>
  );
};

export default EditPaymentTerms;
