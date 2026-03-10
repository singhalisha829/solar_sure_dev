import { useStateCity } from "@/contexts/state_city";
import { useState, useEffect } from "react";
import Input from "../formPage/Input";
import FormModal from "../shared/FormModal";
import { useVendors } from "@/contexts/vendors";
import {
  checkPincodeValue,
  checkContactValue,
  checkContactField,
  checkSpecificKeys,
} from "@/utils/formValidationHandler";
import { SelectForObjects } from "../formPage/MultiSelectDropdown/MultiSelectDropdown";
import { toast } from "sonner";

const AddVendor = ({
  modalId,
  itemDetails,
  createEpcHandler,
  editEpcHandler,
}) => {
  const isAddMode = modalId.split("-")[0] === "add";
  const isVendorForm = modalId.split("-")[1] === "vendor";
  const { createVendorHandler, editVendorHandler } = useVendors();
  const { states, city, getCityHandler } = useStateCity();
  const [editData, setEditData] = useState({});
  const [vendor, setVendor] = useState({
    name: "",
    contact_no: "",
    contact_person_name: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    gst: "",
    pan: "",
  });

  useEffect(() => {
    if (itemDetails && itemDetails !== null) {
      getCityHandler(itemDetails.state);
      setVendor(itemDetails);
    }
  }, [itemDetails]);

  const valueHandler = (e) => {
    setVendor((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setEditData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const pincodeHandler = (e) => {
    if (checkPincodeValue(e) != null) {
      valueHandler(e);
    }
  };

  const contactHandler = (e) => {
    const value = checkContactField(e, 10);
    if (value != null) {
      valueHandler(e);
    }
  };

  const onSubmit = async () => {
    const keysToCheck = {
      name: "Vendor Name",
      contact_no: "Contact No",
      contact_person_name: "Contact Person Name",
      email: "Email",
      pincode: "Pincode",
      state: "State",
      city: "City",
      pan: "Pan",
      address: "Address",
    };
    const validationResult = checkSpecificKeys(vendor, keysToCheck);
    if (validationResult.isValid === false) {
      toast.error(validationResult.message);
      return;
    }

    // calling api for creating/updating vendor
    if (isVendorForm) {
      if (isAddMode) {
        await createVendorHandler(vendor);
        clearForm();
      } else {
        await editVendorHandler(itemDetails.id, editData, modalId);
        setEditData({});
      }
    }
    // calling api for creating/updating epc
    else {
      if (isAddMode) {
        await createEpcHandler(vendor);
        clearForm();
      } else {
        await editEpcHandler(itemDetails.id, editData, modalId);
      }
    }
  };

  const clearForm = () => {
    setVendor({
      name: "",
      contact_no: "",
      contact_person_name: "",
      email: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      gst: "",
    });
  };

  return (
    <FormModal
      id={modalId}
      ctaText={isAddMode ? (isVendorForm ? "Add Vendor" : "Add Epc") : "Save"}
      heading={
        isAddMode
          ? isVendorForm
            ? "Add Vendor"
            : "Add Epc"
          : isVendorForm
            ? "Edit Vendor"
            : "Edit Epc"
      }
      onSubmit={onSubmit}
      onClose={() => {
        if (isAddMode) {
          clearForm();
        }
      }}
    >
      <div className="grid grid-cols-2 gap-x-2.5 gap-y-5 overflow-scroll p-2">
        <Input
          mandatory={true}
          type={"text"}
          onChange={valueHandler}
          value={vendor.name}
          name={"name"}
          label={isVendorForm ? "Vendor Name" : "Epc Name"}
        />
        <Input
          type={"number"}
          mandatory={true}
          onChange={contactHandler}
          value={vendor.contact_no}
          name={"contact_no"}
          label={"Contact No"}
        />
        <Input
          mandatory={true}
          type={"text"}
          onChange={valueHandler}
          value={vendor.contact_person_name}
          name={"contact_person_name"}
          label={"Contact Person Name"}
        />
        <Input
          mandatory={true}
          type={"email"}
          onChange={valueHandler}
          value={vendor.email}
          name={"email"}
          label={"email"}
        />
        <Input
          type={"text"}
          onChange={valueHandler}
          value={vendor.gst}
          name={"gst"}
          label={"gst"}
        />

        <Input
          mandatory={true}
          type={"number"}
          onChange={pincodeHandler}
          value={vendor.pincode}
          name={"pincode"}
          label={"pincode"}
        />
        <SelectForObjects
          mandatory={true}
          margin={"0px"}
          height={"36px"}
          setselected={(value) => {
            const c = states.find((state) => state.name === value);
            setVendor((prev) => ({ ...prev, state: Number(c.id) }));
            setEditData((prev) => ({ ...prev, state: Number(c.id) }));
            getCityHandler(c.id);
          }}
          selected={states.find((state) => state.id == vendor?.state)?.name}
          options={states}
          optionName={"name"}
          placeholder="Select State"
          dropdownLabel={"Select State"}
        />

        <SelectForObjects
          mandatory={true}
          margin={"0px"}
          height={"36px"}
          setselected={(value) => {
            const c = city.find((city) => city.name === value);
            setVendor((prev) => ({ ...prev, city: Number(c.id) }));
            setEditData((prev) => ({ ...prev, city: Number(c.id) }));
          }}
          selected={city.find((c) => c.id == vendor?.city)?.name}
          options={city}
          optionName={"name"}
          placeholder="Select City"
          dropdownLabel={"Select City"}
        />
        <Input
          type={"text"}
          mandatory={true}
          onChange={valueHandler}
          value={vendor.pan}
          name={"pan"}
          label={"PanS Number"}
        />
        <Input
          mandatory={true}
          outerClass="col-span-2"
          type={"textarea"}
          onChange={valueHandler}
          value={vendor.address}
          name={"address"}
          label={"address"}
        />
      </div>
    </FormModal>
  );
};

export default AddVendor;
