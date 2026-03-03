import { useState } from "react";
import { useStateCity } from "@/contexts/state_city";
import Input from "../formPage/Input";
import FormModal from "../shared/FormModal";
import {
  checkPincodeValue,
  checkSpecificKeys,
} from "@/utils/formValidationHandler";
import { SelectForObjects } from "../formPage/MultiSelectDropdown/MultiSelectDropdown";
import { toast } from "sonner";
import { addAddress } from "@/services/api";
import { requestHandler } from "@/services/ApiHandler";
import { useModal } from "@/contexts/modal";

const AddAddress = ({ modalId, onSuccessfullSubmit }) => {
  const { closeModal } = useModal();
  const { states, city, getCityHandler } = useStateCity();
  const [address, setAddress] = useState({
    address: "",
    city: "",
    state: "",
    pincode: "",
    gst: "",
  });

  const valueHandler = (e) => {
    setAddress((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const pincodeHandler = (e) => {
    if (checkPincodeValue(e) != null) {
      setAddress((prev) => ({
        ...prev,
        pincode: e.target.value,
      }));
    }
  };

  const onSubmit = async () => {
    const keysToCheck = {
      address: "Address",
      state: "State",
      city: "City",
      pincode: "Pincode",
    };
    const validationResult = checkSpecificKeys(address, keysToCheck);
    if (validationResult.isValid === false) {
      toast.error(validationResult.message);
      return;
    }

    await requestHandler(
      async () => await addAddress(address),
      null,
      async (data) => {
        closeModal("add-address");
        clearForm();
        toast.success("New Address Added Successfully!");
        onSuccessfullSubmit();
      },
      toast.error
    );
  };

  const clearForm = () => {
    setAddress({
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
      ctaText={"Create Address"}
      heading={"Add Address"}
      onSubmit={onSubmit}
      onClose={clearForm}
    >
      <div className="grid grid-cols-2 gap-x-2.5 gap-y-5 p-2">
        <Input
          mandatory={true}
          outerClass="col-span-2"
          type={"textarea"}
          onChange={valueHandler}
          value={address.address}
          name={"address"}
          label={"address"}
        />
        <SelectForObjects
          mandatory={true}
          margin={"0px"}
          height={"36px"}
          setselected={(value) => {
            const c = states.find((state) => state.name === value);
            setAddress((prev) => ({ ...prev, state: Number(c.id) }));
            getCityHandler(c.id);
          }}
          selected={states.find((state) => state.id == address?.state)?.name}
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
            setAddress((prev) => ({ ...prev, city: Number(c.id) }));
          }}
          selected={city.find((c) => c.id == address?.city)?.name}
          options={city}
          optionName={"name"}
          placeholder="Select City"
          dropdownLabel={"Select City"}
        />
        <Input
          type={"text"}
          onChange={valueHandler}
          value={address.gst}
          name={"gst"}
          label={"gst"}
        />

        <Input
          mandatory={true}
          type={"number"}
          onChange={pincodeHandler}
          value={address.pincode}
          name={"pincode"}
          label={"pincode"}
        />
      </div>
    </FormModal>
  );
};

export default AddAddress;
