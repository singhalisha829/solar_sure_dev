import { useState } from "react";
import Input from "../formPage/Input";
import { SelectForObjects } from "../formPage/MultiSelectDropdown/MultiSelectDropdown";
import Button from "../shared/Button";
import { useStateCity } from "@/contexts/state_city";
import { LocalStorageService } from "@/services/LocalStorageHandler";
import {
  checkPincodeValue,
  checkContactValue,
} from "@/utils/formValidationHandler";
import { checkSpecificKeys } from "@/utils/formValidationHandler";
import { toast } from "sonner";
import Loading from "../Loading";

const PurchaseOrderDetails = ({
  bomItemDetails,
  companyConfig,
  onSubmitHandler,
  onBackClick,
  isLoading,
}) => {
  const { states, city, getCityHandler } = useStateCity();
  const [formDetails, setFormDetails] = useState(bomItemDetails);

  const warehouseLabel = companyConfig?.company_name
    ? `${companyConfig.company_name} Warehouse`
    : "Warehouse";

  const shippingAddressList = [
    { name: "Project Site" },
    { name: warehouseLabel },
    { name: "Other" },
  ];

  const valueHandler = (e) => {
    setFormDetails((prev) => ({
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
    if (checkContactValue(e) != null) {
      valueHandler(e);
    }
  };

  const handleShipperType = (name) => {
    if (name === "Project Site") {
      const projectDetails = LocalStorageService.get("purchase-order-project");
      setFormDetails({
        ...formDetails,
        shipper_type: name,
        shipper_name: projectDetails.site_details.name,
        shipper_address: projectDetails.site_details.address,
        shipper_city: projectDetails.site_details.city,
        shipper_city_name: projectDetails.site_details.city_name,
        shipper_state: projectDetails.site_details.state,
        shipper_state_name: projectDetails.site_details.state_name,
        shipper_pincode: projectDetails.site_details.pincode,
        shipper_gst: projectDetails.site_details.gst,
        shipper_contact_person_name: projectDetails.site_details.poc_name,
        shipper_email: projectDetails.site_details.poc_email,
        shipper_mobile_no: projectDetails.site_details.poc_contact,
      });
    } else if (name === "Other") {
      setFormDetails({
        ...formDetails,
        shipper_type: name,
        shipper_name: "",
        shipper_address: "",
        shipper_city: "",
        shipper_city_name: "",
        shipper_state: "",
        shipper_state_name: "",
        shipper_pincode: "",
        shipper_gst: "",
        shipper_contact_person_name: "",
        shipper_email: "",
        shipper_mobile_no: "",
      });
    } else if (name === warehouseLabel) {
      setFormDetails({
        ...formDetails,
        shipper_type: name,
        shipper_name: companyConfig?.company_name ?? "",
        shipper_address: companyConfig?.company_warehouse_address ?? "",
        shipper_city: companyConfig?.city_id ? String(companyConfig.city_id) : "",
        shipper_city_name: companyConfig?.city_name ?? "",
        shipper_state: companyConfig?.state_id ? String(companyConfig.state_id) : "",
        shipper_state_name: companyConfig?.state_name ?? "",
        shipper_pincode: companyConfig?.company_pincode ?? '',
        shipper_gst: companyConfig?.company_gstin ?? "",
        shipper_contact_person_name: companyConfig?.company_point_of_contact ?? '',
        shipper_email: companyConfig?.company_point_of_contact_email ?? '',
        shipper_mobile_no: companyConfig?.company_point_of_contact_phone ?? "",
      });
    }
  };

  const validateFields = (is_draft = false) => {

    if (is_draft) {
      onSubmitHandler(formDetails, true);
      return;
    }

    const keysToCheck = {
      shipper_address: "Address",
      shipper_state: "State",
      shipper_city: "City",
      shipper_pincode: "Pincode",
      shipper_contact_person_name: "Contact Person Name",
      shipper_mobile_no: "Contact Person Mobile",
      payment_terms: "Payment Terms",
      delivery_terms: "Delivery Terms",
      other_terms: "Other Terms",
    };

    const validationResult = checkSpecificKeys(formDetails, keysToCheck);

    if (validationResult.isValid === false) {
      toast.error(validationResult.message);
      return;
    }

    onSubmitHandler(formDetails);
  };

  return (
    <div className="relative h-full">
      <div className="grid grid-cols-2 gap-4">
        <SelectForObjects
          margin={"0px"}
          mandatory
          height={"36px"}
          className={"w-[20rem]"}
          setselected={handleShipperType}
          selected={formDetails.shipper_type}
          options={shippingAddressList}
          optionName={"name"}
          placeholder="Select.."
          dropdownLabel={"Shipping Address"}
        />
        <Input
          mandatory={true}
          outerClass="col-span-2"
          type={"textarea"}
          onChange={valueHandler}
          value={formDetails.shipper_address}
          name={"shipper_address"}
          label={"address"}
        />
        <SelectForObjects
          mandatory={true}
          margin={"0px"}
          height={"36px"}
          setselected={(value, id) => {
            setFormDetails((prev) => ({
              ...prev,
              shipper_state: Number(id),
              shipper_state_name: value,
              shipper_city: "",
              shipper_city_name: "",
            }));
            getCityHandler(id);
          }}
          selected={formDetails.shipper_state_name}
          options={states}
          optionName={"name"}
          optionID={"id"}
          placeholder="Select State"
          dropdownLabel={"Select State"}
        />
        <SelectForObjects
          mandatory={true}
          margin={"0px"}
          height={"36px"}
          setselected={(value, id) => {
            setFormDetails((prev) => ({
              ...prev,
              shipper_city: Number(id),
              shipper_city_name: value,
            }));
          }}
          selected={formDetails.shipper_city_name}
          options={city}
          optionName={"name"}
          optionID={"id"}
          placeholder="Select City"
          dropdownLabel={"Select City"}
        />
        <Input
          type={"text"}
          onChange={valueHandler}
          value={formDetails.shipper_gst}
          name={"shipper_gst"}
          label={"gst"}
        />

        <Input
          mandatory={true}
          type={"number"}
          onChange={pincodeHandler}
          value={formDetails.shipper_pincode}
          name={"shipper_pincode"}
          label={"pincode"}
        />
        <Input
          mandatory={true}
          type={"text"}
          onChange={valueHandler}
          value={formDetails.shipper_contact_person_name}
          name={"shipper_contact_person_name"}
          label={"Contact Person Name"}
        />
        <Input
          type={"number"}
          mandatory={true}
          onChange={contactHandler}
          value={formDetails.shipper_mobile_no}
          name={"shipper_mobile_no"}
          label={"Contact Person Mobile"}
        />

        <Input
          type={"email"}
          onChange={valueHandler}
          value={formDetails.shipper_email}
          name={"shipper_email"}
          label={"Contact Person Email"}
        />
        <Input
          type="textarea"
          outerClass="col-span-2"
          value={formDetails.payment_terms}
          mandatory={true}
          onChange={valueHandler}
          name="payment_terms"
          label="Payment Terms"
        />
        <Input
          type="textarea"
          outerClass="col-span-2"
          mandatory={true}
          value={formDetails.delivery_terms}
          onChange={valueHandler}
          name="delivery_terms"
          label="Delivery Terms"
        />
        <Input
          type="textarea"
          outerClass="col-span-2"
          value={formDetails.other_terms}
          mandatory={true}
          onChange={valueHandler}
          name="other_terms"
          textareaRows={"10"}
          label="Other Terms"
        />
        <Input
          type="textarea"
          outerClass="col-span-2"
          value={formDetails.remark}
          onChange={valueHandler}
          name="remark"
          label="Remarks"
        />
      </div>

      <div className=" w-full flex justify-end gap-4 mt-6 pb-4">
        <Button
          className=" h-[2rem] w-small"
          onClick={onBackClick}
          customText={"#9E9E9E"}
          variant={"gray"}
        >
          Back
        </Button>
        {isLoading ? (
          <Loading />
        ) : (
          <>
            <Button className=" h-[2rem] w-small" onClick={() => validateFields(true)}>
              Save as draft
            </Button>
            <Button className=" h-[2rem] w-small" onClick={validateFields}>
              Submit
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default PurchaseOrderDetails;
