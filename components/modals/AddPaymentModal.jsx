import { useState, useEffect } from "react";
import FormModal from "../shared/FormModal";
import Input from "../formPage/Input";
import { SelectForObjects } from "../formPage/MultiSelectDropdown/MultiSelectDropdown";
import {
  getBanks,
  addProjectPayment,
  editProjectPayment,
} from "@/services/api";
import { requestHandler } from "@/services/ApiHandler";
import { useModal } from "@/contexts/modal";
import { toast } from "sonner";
import { checkSpecificKeys } from "@/utils/formValidationHandler";

const AddPaymentModal = ({
  modalId,
  projectId,
  onSuccessfullSubmit,
  details,
}) => {
  const { closeModal } = useModal();
  const [bankList, setBankList] = useState([]);
  const [editData, setEditData] = useState({});
  const [paymentDetails, setPaymentDetails] = useState({
    project: projectId,
    payable_amount: "",
    payment_date: "",
    bank: "",
    payment_mode: "",
    reference_id: "",
    payment_for: "",
    remark: "",
  });

  const paymentFors = [
    { name: "Advance" },
    { name: "Post Installation" },
    { name: "Against Material Delivery" },
  ];

  const paymentModes = [
    { name: "NEFT" },
    { name: "RTGS" },
    { name: "Cheque" },
    { name: "UPI" },
    { name: "Cash" },
  ];

  useEffect(() => {
    getBankList();
  }, []);

  useEffect(() => {
    if (details) {
      setPaymentDetails(details);
    }
  }, [details]);

  const getBankList = async () => {
    await requestHandler(
      async () => await getBanks(),
      null,
      (data) => setBankList(data.data.output),
      toast.error
    );
  };

  const valueHandler = (e) => {
    const regex = /^\d*\.?\d+$/;
    if (e.target.name === "payable_amount" && !regex.test(e.target.value)) {
      setPaymentDetails((prev) => ({
        ...prev,
        [e.target.name]: "",
      }));
      setEditData((prev) => ({
        ...prev,
        [e.target.name]: "",
      }));
    } else {
      setPaymentDetails((prev) => ({
        ...prev,
        [e.target.name]: e.target.value,
      }));
      setEditData((prev) => ({
        ...prev,
        [e.target.name]: e.target.value,
      }));
    }
  };

  const onSubmit = async () => {
    let keysToCheck = {
      payment_for: "Payment For",
      reference_id: "Payment Ref",
      payment_date: "Payment Date",
      payment_mode: "Payment Mode",
    };

    if (paymentDetails.payment_mode !== "Cash") {
      keysToCheck = { ...keysToCheck, bank: "Bank" };
    }
    const validationResult = checkSpecificKeys(paymentDetails, keysToCheck);
    if (validationResult.isValid === false) {
      toast.error(validationResult.message);
      return;
    }

    if (modalId.split("-")[0] === "add") {
      await requestHandler(
        async () => await addProjectPayment(paymentDetails),
        null,
        async (data) => {
          closeModal(modalId);
          toast.success("Payment Added Successfully...");
          clearForm();
          onSuccessfullSubmit();
        },
        toast.error
      );
    } else {
      await requestHandler(
        async () => await editProjectPayment(paymentDetails.id, editData),
        null,
        async (data) => {
          closeModal(modalId);
          toast.success("Payment Edited Successfully...");
          setEditData({});
          onSuccessfullSubmit();
        },
        toast.error
      );
    }
  };

  const clearForm = () => {
    setPaymentDetails({
      project: projectId,
      payable_amount: "",
      payment_date: "",
      bank: "",
      payment_mode: "",
      reference_id: "",
      payment_for: "",
      remark: "",
    });
  };

  return (
    <FormModal
      id={modalId}
      onSubmit={onSubmit}
      ctaText={"Save"}
      heading={modalId.split("-")[0] === "add" ? "Add Payment" : "Edit Payment"}
      onClose={() => {
        if (modalId.split("-")[0] === "add") {
          clearForm();
        }
      }}
    >
      <div className="grid grid-cols-2 gap-x-2.5 gap-y-5 overflow-y-auto">
        <SelectForObjects
          margin={"0px"}
          height={"36px"}
          setselected={(value) => {
            setPaymentDetails({
              ...paymentDetails,
              payment_for: value,
            });
            setEditData({ ...editData, payment_for: value });
          }}
          mandatory={true}
          selected={paymentDetails.payment_for}
          options={paymentFors}
          optionName={"name"}
          placeholder="Select.."
          dropdownLabel={"Payment For"}
        />
        <Input
          type={"text"}
          mandatory={true}
          value={paymentDetails.reference_id}
          onChange={valueHandler}
          placeholder={"Payment Ref"}
          name="reference_id"
          label={"Payment Ref"}
        />
        <Input
          type={"date"}
          mandatory={true}
          value={paymentDetails.payment_date}
          onChange={valueHandler}
          name="payment_date"
          label={"Payment Date"}
        />
        <Input
          type={"number"}
          mandatory={true}
          value={paymentDetails.payable_amount}
          onChange={valueHandler}
          name="payable_amount"
          label={"Payable Amount"}
        />
        <SelectForObjects
          margin={"0px"}
          height={"36px"}
          setselected={(value) => {
            setPaymentDetails({
              ...paymentDetails,
              payment_mode: value,
            });
            setEditData({
              ...editData,
              payment_mode: value,
            });
          }}
          mandatory={true}
          selected={paymentDetails.payment_mode}
          options={paymentModes}
          optionName={"name"}
          placeholder="Select.."
          dropdownLabel={"Payment Modes"}
        />
        <SelectForObjects
          margin={"0px"}
          height={"36px"}
          setselected={(value, id) => {
            setPaymentDetails({
              ...paymentDetails,
              bank: id,
            });
            setEditData({
              ...editData,
              bank: id,
            });
          }}
          mandatory={paymentDetails?.payment_mode === "Cash" ? false : true}
          selected={
            bankList.find((bank) => bank.id == paymentDetails.bank)?.bank_name
          }
          options={bankList}
          optionName={"bank_name"}
          optionID={"id"}
          placeholder="Select.."
          dropdownLabel={"Bank"}
        />

        <Input
          type={"textarea"}
          value={paymentDetails.remark}
          onChange={valueHandler}
          outerClass="col-span-2"
          placeholder={"Enter Remark"}
          name="remark"
          label={"Remark"}
        />
      </div>
    </FormModal>
  );
};

export default AddPaymentModal;
