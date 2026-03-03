import { useState, useEffect } from "react";
import Input from "../formPage/Input";
import FormModal from "../shared/FormModal";
import { checkSpecificKeys } from "@/utils/formValidationHandler";
import { SelectForObjects } from "../formPage/MultiSelectDropdown/MultiSelectDropdown";
import { toast } from "sonner";
import {
  addTransportationDetails,
  editTransportationDetails,
} from "@/services/api";
import { requestHandler } from "@/services/ApiHandler";
import { useModal } from "@/contexts/modal";
import { FaEye } from "react-icons/fa";
import { handleFileUpload } from "@/utils/documentUploadHandler";
import { useRouter } from "next/router";

const AddTransporter = ({
  modalId,
  invoiceDetails,
  transporterList,
  onSuccessfullSubmit,
}) => {
  const router = useRouter();
  const { closeModal } = useModal();
  const [transportationDetails, setTransportationDetails] = useState({
    invoice: "",
    transporter: "",
    vehicle_or_docket_no: "",
    vehicle_size: "",
    eway_bill_doc: "",
    eway_bill_no: "",
    lr_doc: "",
    lr_no: "",
    dispatch_date: "",
    remark: "",
    transportation_cost: "",
  });
  const [editData, setEditData] = useState({});

  const vehicleSize = [
    { value: "tata_ace_7_ft", name: "TATA ACE- 7 FT" },
    { value: "tata_bolero_10_ft", name: "TATA BOLERO- 10 FT" },
    { value: "14_ft", name: "14 FT" },
    { value: "17_ft", name: "17 FT" },
    { value: "19_ft", name: "19 FT" },
    { value: "20_ft", name: "20 FT" },
    { value: "22_ft", name: "22 FT" },
    { value: "24_ft", name: "24 FT" },
    { value: "28_ft", name: "28 FT" },
    { value: "32_ft_sxl", name: "32 FT SXL" },
    { value: "32_ft_mxl", name: "32 MXL" },
    { value: "40_ft_trailer)", name: "40 FT (TRAILER)" },
    { value: "40_ft_containers", name: "40 FT CONTAINERS" },
  ];

  useEffect(() => {
    if (invoiceDetails) {
      if (modalId.split("-")[0] === "add") {
        setTransportationDetails({
          ...transportationDetails,
          invoice: invoiceDetails?.id,
        });
      } else {
        setTransportationDetails({
          ...invoiceDetails,
          invoice: invoiceDetails?.invoice_id,
        });
      }
    }
  }, [invoiceDetails]);

  const valueHandler = (e) => {
    setTransportationDetails((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setEditData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFile = async (e, key) => {
    const response = await handleFileUpload(e.target.files[0]);
    if (response.type === "success") {
      setTransportationDetails({
        ...transportationDetails,
        [key]: response.data,
      });
      setEditData({
        ...editData,
        [key]: response.data,
      });
    } else {
      toast.error(response.error || "Oops! Something went wrong");
    }
  };

  const onSubmit = async () => {
    const keysToCheck = {
      transporter: "Transporter",
      transportation_cost: "Transportation Cost",
      vehicle_or_docket_no: "Vehicle/Docket No",
      dispatch_date: "Dispatch Date",
    };
    const validationResult = checkSpecificKeys(
      transportationDetails,
      keysToCheck
    );
    if (validationResult.isValid === false) {
      toast.error(validationResult.message);
      return;
    }
    if (modalId.split("-")[0] === "add") {
      await requestHandler(
        async () => await addTransportationDetails(transportationDetails),
        null,
        async (data) => {
          closeModal(modalId);
          clearForm();
          toast.success("Transportation Details Added Successfully!");
          onSuccessfullSubmit();
        },
        toast.error
      );
    } else {
      await requestHandler(
        async () =>
          await editTransportationDetails(
            transportationDetails?.transportation_id,
            editData
          ),
        null,
        async (data) => {
          closeModal(modalId);
          clearForm();
          toast.success("Transportation Details Saved Successfully!");
          onSuccessfullSubmit();
        },
        toast.error
      );
    }
  };

  const clearForm = () => {
    if (modalId.split("-")[0] === "add") {
      setTransportationDetails({
        invoice: invoiceDetails?.id,
        transporter: "",
        vehicle_or_docket_no: "",
        vehicle_size: "",
        eway_bill_doc: "",
        eway_bill_no: "",
        lr_doc: "",
        lr_no: "",
        dispatch_date: "",
        remark: "",
        transportation_cost: "",
      });
    }
    setEditData({});
  };

  return (
    <FormModal
      id={modalId}
      ctaText={modalId.split("-")[0] === "add" ? "Add" : "Save"}
      heading={`${modalId.split("-")[0] === "add" ? "Add" : "Edit"} Transportation Details`}
      onSubmit={onSubmit}
      onClose={() => {
        clearForm();
      }}
    >
      <div className="grid grid-cols-2 gap-x-2.5 gap-y-5 p-2 overflow-auto">
        <SelectForObjects
          mandatory={true}
          margin={"0px"}
          height={"36px"}
          setselected={(value) => {
            const c = transporterList.find(
              (transporter) => transporter.transporter_name === value
            );
            setTransportationDetails((prev) => ({
              ...prev,
              transporter: Number(c.id),
            }));
            setEditData((prev) => ({
              ...prev,
              transporter: Number(c.id),
            }));
          }}
          selected={
            transporterList.find(
              (transporter) =>
                transporter.id == transportationDetails?.transporter
            )?.transporter_name
          }
          options={transporterList}
          optionName={"transporter_name"}
          placeholder="Select"
          dropdownLabel={"Transporter/Courier"}
        />
        <Input
          mandatory={true}
          type={"number"}
          onChange={valueHandler}
          value={transportationDetails.transportation_cost}
          name={"transportation_cost"}
          label={"Transportation Cost (with GST)"}
        />
        <Input
          mandatory={true}
          type={"text"}
          onChange={valueHandler}
          value={transportationDetails.vehicle_or_docket_no}
          name={"vehicle_or_docket_no"}
          label={"Vehicle/Docket No."}
        />

        <SelectForObjects
          margin={"0px"}
          height={"36px"}
          setselected={(value) => {
            const c = vehicleSize.find((size) => size.name === value);
            setTransportationDetails((prev) => ({
              ...prev,
              vehicle_size: c.value,
            }));
            setEditData((prev) => ({
              ...prev,
              vehicle_size: c.value,
            }));
          }}
          selected={
            vehicleSize.find(
              (c) => c.value == transportationDetails?.vehicle_size
            )?.name
          }
          options={vehicleSize}
          optionName={"name"}
          placeholder="Select"
          dropdownLabel={"Vehicle Size"}
        />

        <Input
          type={"text"}
          onChange={valueHandler}
          value={transportationDetails.lr_no}
          name={"lr_no"}
          label={"LR No."}
        />
        <span className="flex gap-2 items-center">
          <Input
            type="file"
            onChange={(e) => handleFile(e, "lr_doc")}
            label={"Upload LR File"}
          />
          {transportationDetails.lr_doc &&
            transportationDetails.lr_doc !== "" && (
              <FaEye
                size={15}
                className="cursor-pointer"
                onClick={() =>
                  window.open(transportationDetails.lr_doc, "__blank")
                }
              />
            )}
        </span>
        <Input
          type={"text"}
          onChange={valueHandler}
          value={transportationDetails.eway_bill_no}
          name={"eway_bill_no"}
          label={"Eway Bill No."}
        />
        <span className="flex gap-2 items-center">
          <Input
            type="file"
            onChange={(e) => handleFile(e, "eway_bill_doc")}
            label={"Upload Eway Bill"}
          />
          {transportationDetails.eway_bill_doc &&
            transportationDetails.eway_bill_doc !== "" && (
              <FaEye
                size={15}
                className="cursor-pointer"
                onClick={() =>
                  window.open(transportationDetails.eway_bill_doc, "__blank")
                }
              />
            )}
        </span>
        <Input
          mandatory={true}
          type={"date"}
          onChange={valueHandler}
          value={transportationDetails.dispatch_date}
          name={"dispatch_date"}
          label={"Dispatch Date"}
        />

        <Input
          type={"textarea"}
          onChange={valueHandler}
          value={transportationDetails.remark}
          outerClass="col-span-2"
          name={"remark"}
          label={"Remark"}
        />
      </div>
    </FormModal>
  );
};

export default AddTransporter;
