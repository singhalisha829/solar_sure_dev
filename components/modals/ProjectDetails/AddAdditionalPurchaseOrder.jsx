import { useState, useEffect } from "react";
import FormModal from "../../shared/FormModal";
import Input from "../../formPage/Input";
import { toast } from "sonner";
import { handleFileUpload } from "@/utils/documentUploadHandler";
import { requestHandler } from "@/services/ApiHandler";
import {
  addProjectAdditionalPO,
  editProjectAdditionalPO,
} from "@/services/api";
import { useModal } from "@/contexts/modal";
import { dateFormatInYYYYMMDD } from "@/utils/formatter";
import { FaEye } from "react-icons/fa";
import { checkSpecificKeys } from "@/utils/formValidationHandler";
import Loading from "@/components/Loading";

const AddPurchaseOrder = ({
  modalId,
  projectId,
  onSuccessfullSubmit,
  poDetails,
}) => {
  const { closeModal } = useModal();
  const today = dateFormatInYYYYMMDD(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [item, setItem] = useState({
    project: projectId,
    purchase_order_number: "",
    purchase_order_doc: "",
    purchase_order_amount_without_gst: "",
    purchase_order_amount_with_gst: "",
    date: today,
    additional_days: 0,
    remark: "",
  });

  useEffect(() => {
    if (poDetails) {
      setItem(poDetails);
    }
  }, [poDetails]);

  const valueHandler = (e) => {
    setItem((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setEditedData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const fileHandler = async (e) => {
    setIsLoading(true);
    const response = await handleFileUpload(e.target.files[0]);
    if (response.type === "success") {
      setItem({ ...item, purchase_order_doc: response.data });
    } else {
      toast.error(response.error || "Oops! Something went wrong");
    }
    setIsLoading(false);
  };

  const onSubmit = async () => {
    const keysToCheck = {
      purchase_order_doc: "PO Doc",
      purchase_order_amount_without_gst: "PO Amount(Without GST)",
      purchase_order_amount_with_gst: "PO Amount(With GST)",
    };
    const validationResult = checkSpecificKeys(item, keysToCheck);
    if (validationResult.isValid === false) {
      toast.error(validationResult.message);
      return;
    }

    if (poDetails) {
      await requestHandler(
        async () => await editProjectAdditionalPO(item.id, editedData),
        null,
        async (data) => {
          toast.success("Additional PO Edited Successfully...");
          closeModal(modalId);
          onSuccessfullSubmit();
          onClose();
        },
        toast.error
      );
    } else {
      await requestHandler(
        async () => await addProjectAdditionalPO(item),
        null,
        async (data) => {
          toast.success("Additional PO Added Successfully...");
          closeModal(modalId);
          onClose();
          onSuccessfullSubmit();
        },
        toast.error
      );
    }
  };

  const onClose = () => {
    setItem({
      project: projectId,
      purchase_order_number: "",
      purchase_order_doc: "",
      purchase_order_amount_without_gst: "",
      purchase_order_amount_with_gst: "",
      date: today,
      additional_days: 0,
      remark: "",
    });
  };

  return (
    <FormModal
      id={modalId}
      onSubmit={onSubmit}
      ctaText={poDetails ? "Save" : "Add"}
      heading={`${poDetails ? "Edit" : "Add"} Additional PO`}
      onClose={onClose}
      className={"overflow-visible"}
    >
      <div className="grid grid-cols-2 gap-4">
        <Input
          type="text"
          label="PO Number"
          value={item.purchase_order_number}
          name={"purchase_order_number"}
          onChange={valueHandler}
        />
        <span className="w-full flex gap-2 items-end">
          <Input
            type="file"
            mandatory={true}
            onChange={fileHandler}
            name={"purchase_order_doc"}
            label={"PO Doc"}
          />
          {isLoading && <Loading />}
          {item.purchase_order_doc && item.purchase_order_doc !== "" && (
            <FaEye
              size={15}
              className="cursor-pointer mb-3"
              onClick={() => window.open(item.purchase_order_doc, "__blank")}
            />
          )}
        </span>

        <Input
          type="number"
          label="PO Amount(Without GST)"
          mandatory={true}
          value={item.purchase_order_amount_without_gst}
          name={"purchase_order_amount_without_gst"}
          onChange={valueHandler}
        />
        <Input
          type="number"
          label="PO Amount(With GST)"
          mandatory={true}
          value={item.purchase_order_amount_with_gst}
          name={"purchase_order_amount_with_gst"}
          onChange={valueHandler}
        />
        <Input
          type="date"
          label="Date"
          mandatory={true}
          value={item.date}
          name={"date"}
          onChange={valueHandler}
        />
        <Input
          type="number"
          label="Additional Days"
          mandatory={true}
          value={item.additional_days}
          name={"additional_days"}
          onChange={valueHandler}
        />
        <Input
          type="textarea"
          label="Remarks"
          outerClass="col-span-2"
          value={item.remark}
          name={"remark"}
          onChange={valueHandler}
        />
      </div>
    </FormModal>
  );
};

export default AddPurchaseOrder;
