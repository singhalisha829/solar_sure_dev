import { useState } from "react";
import FormModal from "../../shared/FormModal";
import Input from "../../formPage/Input";
import { toast } from "sonner";
import { requestHandler } from "@/services/ApiHandler";
import { addPaymentTerms } from "@/services/api";
import { useModal } from "@/contexts/modal";
import Table from "../../SortableTable";
import { SelectForObjects } from "../../formPage/MultiSelectDropdown/MultiSelectDropdown";
import { checkSpecificKeys } from "@/utils/formValidationHandler";
import Button from "../../shared/Button";

const AddPaymentTerms = ({
  modalId,
  projectId,
  totalPoValue,
  onSuccessfullSubmit,
}) => {
  const { closeModal } = useModal();
  const [paymentTermsList, setPaymentTermsList] = useState([]);
  const [paymentTerms, setPaymentTerms] = useState({
    terms: "",
    amount: "",
    percentage: "",
    date: "",
    status: "Pending",
    project: projectId,
  });

  const tableHeader = [
    {
      name: "Terms",
      key: "terms",
      width: "50%",
    },
    {
      name: "Percentage",
      key: "percentage",
      width: "10%",
      displayType: "price",
    },
    {
      name: "Amount",
      key: "amount",
      width: "10%",
      displayType: "price",
    },
    {
      name: "Status",
      key: "status",
      width: "10%",
    },
    {
      name: "Date",
      key: "date",
      type: "date",
      width: "20%",
    },
    {
      name: "Actions",
      type: "actions-column",
      actionType: "delete",
      width: "5rem",
      onClickDelete: (row) => {
        removePaymentTerms(row);
      },
    },
  ];

  const onAddMore = (event) => {
    event.preventDefault(); // Prevent default button behavior
    validateForm();
  };

  const validateForm = (isFinalSubmit) => {
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
    if (isFinalSubmit) {
      onSubmit();
    } else {
      handlePaymentTerms();
    }
  };

  const handlePaymentTerms = async () => {
    setPaymentTermsList((prevList) => [...(prevList ?? []), paymentTerms]);
    setPaymentTerms({
      terms: "",
      amount: "",
      percentage: "",
      date: "",
      status: "Pending",
      project: projectId,
    });
  };

  const removePaymentTerms = (row) => {
    const index = paymentTermsList.findIndex(
      (term) => term.terms === row.terms
    );
    if (index !== -1) {
      let list = [...paymentTermsList];
      list.splice(index, 1);
      setPaymentTermsList(list);
    }
  };

  const onSubmit = async () => {
    let formData =
      paymentTerms.terms != ""
        ? [...paymentTermsList, paymentTerms]
        : paymentTermsList;

    formData.map((item) => {
      if (item.status !== "Paid") {
        delete item.date;
      }
    });

    await requestHandler(
      async () => await addPaymentTerms(formData),
      null,
      async (data) => {
        toast.success("Payment Terms Added Successfully...");
        closeModal(modalId);
        onClose();
        onSuccessfullSubmit();
      },
      toast.error
    );
  };

  const onClose = () => {
    setPaymentTermsList([]);
    setPaymentTerms({
      terms: "",
      amount: "",
      percentage: "",
      date: "",
      status: "Pending",
      project: projectId,
    });
  };

  return (
    <FormModal
      id={modalId}
      onSubmit={() => validateForm(true)}
      width="w-[70%]"
      ctaText={"Create Payment Terms"}
      heading={`Add Payment Terms`}
      onClose={onClose}
      className={"overflow-visible"}
    >
      <div className="flex flex-col gap-4 relative">
        {/* <div className="border-1 rounded-sm p-2"> */}
        <Input
          type="textarea"
          outerClass="col-span-3"
          label="Terms"
          value={paymentTerms.terms}
          onChange={(e) =>
            setPaymentTerms({ ...paymentTerms, terms: e.target.value })
          }
        />
        <div className="flex gap-2 items-end">
          <Input
            type="number"
            width={"20%"}
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
            width={"20%"}
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
            className={"w-[20%]"}
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
              width={"20%"}
              label="Date"
              mandatory={true}
              value={paymentTerms.date}
              onChange={(e) =>
                setPaymentTerms({ ...paymentTerms, date: e.target.value })
              }
            />
          )}
          <Button onClick={onAddMore} className="px-2 col-span-1">
            Add More
          </Button>
        </div>
        <div className="border-b-1"></div>
        {paymentTermsList.length > 0 && (
          <Table rows={paymentTermsList} columns={tableHeader} />
        )}

        <div className="w-2/3 grid grid-cols-2 gap-2"></div>
      </div>
    </FormModal>
  );
};

export default AddPaymentTerms;
