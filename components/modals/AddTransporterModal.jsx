import { useState, useEffect } from "react";
import FormModal from "../shared/FormModal";
import Input from "../formPage/Input";
import { SelectForObjects } from "../formPage/MultiSelectDropdown/MultiSelectDropdown";
import { useStateCity } from "@/contexts/state_city";
import { requestHandler } from "@/services/ApiHandler";
import { createTransporter, editTransporter } from "@/services/api";
import { toast } from "sonner";
import { useModal } from "@/contexts/modal";
import {
  checkSpecificKeys,
  checkPincodeValue,
  checkContactValue,
} from "@/utils/formValidationHandler";

const defaultForm = {
  transporter_name: "",
  gstn: "",
  pincode: "",
  state: "",
  state_name: "",
  city: "",
  address: "",
  poc_contact_person: "",
  poc_contact_email: "",
  poc_contact_no: "",
};

const AddTransporterModal = ({ modalId, itemDetails, onSuccess }) => {
  const isEdit = modalId?.split("-")[0] === "edit";
  const { closeModal } = useModal();
  const { states, city, getCityHandler } = useStateCity();
  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    if (isEdit && itemDetails) {
      setForm({
        transporter_name: itemDetails.transporter_name ?? "",
        gstn: itemDetails.gstn ?? "",
        pincode: itemDetails.pincode ?? "",
        state: itemDetails.state_id ?? "",
        state_name: itemDetails.state_name ?? "",
        city: itemDetails.city ?? "",
        address: itemDetails.address ?? "",
        poc_contact_person: itemDetails.transporter_poc_contact_person_name ?? "",
        poc_contact_email: itemDetails.transporter_poc_contact_person_email ?? "",
        poc_contact_no: itemDetails.transporter_poc_contact_person_phone ?? "",
      });
      if (itemDetails.state_id) {
        getCityHandler(itemDetails.state_id);
      }
    }
  }, [itemDetails]);

  const valueHandler = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const pincodeHandler = (e) => {
    if (checkPincodeValue(e) != null) {
      setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }
  };

  const contactHandler = (e) => {
    const val = checkContactValue(e);
    if (val != null) {
      setForm((prev) => ({ ...prev, [e.target.name]: val }));
    }
  };

  const clearForm = () => setForm(defaultForm);

  const onSubmit = async () => {
    const keysToCheck = {
      transporter_name: "Transporter Name",
      gstn: "GST",
      pincode: "Pincode",
      state: "State",
      city: "City",
      address: "Address",
      poc_contact_person: "POC Contact Person",
      poc_contact_email: "POC Email",
      poc_contact_no: "POC Contact No",
    };

    const validationResult = checkSpecificKeys(form, keysToCheck);
    if (!validationResult.isValid) {
      toast.error(validationResult.message);
      return;
    }

    if (isEdit) {
      const payload = {
        transporter: {
          transporter_name: form.transporter_name,
          gstn: form.gstn,
          pincode: Number(form.pincode),
          state: form.state_name,
          city: Number(form.city),
          address: form.address,
        },
        transporter_poc: {
          contact_email: form.poc_contact_email,
          contact_no: Number(form.poc_contact_no),
          contact_person: form.poc_contact_person,
          is_primary: true,
        },
      };
      await requestHandler(
        async () => await editTransporter(itemDetails.id, payload),
        null,
        () => {
          toast.success("Transporter updated successfully!");
          closeModal(modalId);
          onSuccess?.();
        },
        toast.error
      );
    } else {
      const payload = {
        transporter: {
          transporter_name: form.transporter_name,
          gstn: form.gstn,
          pincode: Number(form.pincode),
          state: form.state_name,
          city: Number(form.city),
          address: form.address,
          tds_deduction: "1",
          status: "1",
        },
        transporter_poc: {
          contact_email: form.poc_contact_email,
          contact_no: Number(form.poc_contact_no),
          contact_person: form.poc_contact_person,
          is_primary: true,
        },
      };
      await requestHandler(
        async () => await createTransporter(payload),
        null,
        () => {
          toast.success("Transporter added successfully!");
          closeModal(modalId);
          clearForm();
          onSuccess?.();
        },
        toast.error
      );
    }
  };

  return (
    <FormModal
      id={modalId}
      heading={isEdit ? "Edit Transporter" : "Add Transporter"}
      ctaText={isEdit ? "Save" : "Add Transporter"}
      onSubmit={onSubmit}
      onClose={() => {
        if (!isEdit) clearForm();
      }}
    >
      <div className="grid grid-cols-2 gap-x-2.5 gap-y-5 overflow-y-auto">
        <Input
          mandatory
          type="text"
          name="transporter_name"
          value={form.transporter_name}
          onChange={valueHandler}
          label="Transporter Name"
        />
        <Input
          mandatory
          type="text"
          name="gstn"
          value={form.gstn}
          onChange={valueHandler}
          label="GST"
        />
        <Input
          mandatory
          type="textarea"
          name="address"
          outerClass="col-span-2"
          value={form.address}
          onChange={valueHandler}
          label="Address"
        />
        <Input
          mandatory
          type="number"
          name="pincode"
          value={form.pincode}
          onChange={pincodeHandler}
          label="Pincode"
        />
        <SelectForObjects
          mandatory
          margin="0px"
          height="36px"
          optionID="id"
          options={states}
          optionName="name"
          selected={form.state_name}
          placeholder="Select State"
          dropdownLabel="State"
          setselected={async (value, id) => {
            setForm((prev) => ({ ...prev, state: id, state_name: value, city: "" }));
            await getCityHandler(id);
          }}
        />
        <SelectForObjects
          mandatory
          margin="0px"
          height="36px"
          optionID="id"
          options={city}
          optionName="name"
          selected={city.find((c) => c.id === form.city)?.name || ""}
          placeholder="Select City"
          dropdownLabel="City"
          setselected={(value, id) => {
            setForm((prev) => ({ ...prev, city: id }));
          }}
        />
        <Input
          mandatory
          type="text"
          name="poc_contact_person"
          value={form.poc_contact_person}
          onChange={valueHandler}
          label="POC Contact Person"
        />
        <Input
          mandatory
          type="email"
          name="poc_contact_email"
          value={form.poc_contact_email}
          onChange={valueHandler}
          label="POC Email"
        />
        <Input
          mandatory
          type="number"
          name="poc_contact_no"
          value={form.poc_contact_no}
          onChange={contactHandler}
          label="POC Contact No"
        />
      </div>
    </FormModal>
  );
};

export default AddTransporterModal;
