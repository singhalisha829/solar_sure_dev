import { useEffect, useState } from "react";
import Input from "../formPage/Input";
import FormModal from "../shared/FormModal";
import { getCompanySource } from "@/services/api/";
import { SelectForObjects } from "../formPage/MultiSelectDropdown/MultiSelectDropdown";
import { requestHandler } from "@/services/ApiHandler";
import { toast } from "sonner";
import { useSalesPerson } from "@/contexts/salesperson";
import { useStateCity } from "@/contexts/state_city";
import {
  checkSpecificKeys,
  checkPincodeValue,
  checkContactValue,
} from "@/utils/formValidationHandler";
import { FaEye } from "react-icons/fa";
import { handleFileUpload } from "@/utils/documentUploadHandler";
import { createCompany, editCompany } from "@/services/api";
import { useModal } from "@/contexts/modal";

const CreateCompanyModal = ({ modalId, itemDetails, onSuccessfullSubmit }) => {
  const { closeModal } = useModal();
  const { salesPersons } = useSalesPerson();
  const [company, setCompany] = useState({
    name: "",
    email: "",
    phone: "",
    website: "",
    gstin_or_pan: "GST",
    gstin: "",
    gstin_doc: "",
    pan: "",
    pan_doc: "",
    lead_source: "",
    salesperson: "",
    address: "",
    pincode: "",
    state: "",
    city: "",
    primary_poc_client_name: "",
    primary_poc_email: "",
    primary_poc_phone: "",
    primary_poc_designation: "",
  });
  const [updatedData, setUpdatedData] = useState({});
  const { states, city, getCityHandler } = useStateCity();
  const [sources, setSources] = useState([]);

  useEffect(() => {
    if (itemDetails && itemDetails !== null) {
      let companyDetails = itemDetails;
      getCityHandler(itemDetails.state_id);

      // display GST/PAN value in form depending on which value is saved, only one out of GST/PAN value is saved
      if (itemDetails.gstin !== "") {
        companyDetails.gstin_or_pan = "GST";
      }
      if (itemDetails.pan !== "") {
        companyDetails.gstin_or_pan = "PAN";
      }
      setCompany(companyDetails);
    }
  }, [itemDetails]);

  const getSourceHandler = async () => {
    await requestHandler(
      async () => await getCompanySource(),
      null,
      (data) => setSources(data.data.output),
      toast.error
    );
  };

  useEffect(() => {
    getSourceHandler();
  }, []);

  const valueHandler = (e) => {
    setCompany((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setUpdatedData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  function pincodeHandler(e) {
    if (checkPincodeValue(e) != null) {
      setCompany((prev) => ({
        ...prev,
        [e.target.name]: e.target.value,
      }));
      setUpdatedData((prev) => ({
        ...prev,
        [e.target.name]: e.target.value,
      }));
    }
  }

  function phoneNumberHandler(e) {
    if (checkContactValue(e) != null) {
      setCompany((prev) => ({
        ...prev,
        [e.target.name]: checkContactValue(e),
      }));
      setUpdatedData((prev) => ({
        ...prev,
        [e.target.name]: checkContactValue(e),
      }));
    }
  }

  const onSubmit = async () => {
    let keysToCheck = {
      name: "Name",
      email: "Email",
      phone: "Phone",
      gstin_or_pan: "GST/PAN",
      [company.gstin_or_pan === "GST" ? "gstin" : "pan"]: company.gstin_or_pan,
      lead_source: "Lead Souce",
      salesperson: "Salesperson",
      address: "Address",
      state: "State",
      pincode: "Pincode",
      city: "City",
      primary_poc_client_name: "POC Client Name",
      primary_poc_phone: "POC Phone",
    };

    const validationResult = checkSpecificKeys(company, keysToCheck);
    if (validationResult.isValid === false) {
      toast.error(validationResult.message);
      return;
    }
    if (modalId.split("-")[0] === "add") {
      createCompanyHandler(company);
    } else {
      editCompanyHandler(itemDetails.id, updatedData, modalId);
    }
  };

  const createCompanyHandler = async (companyData) => {
    await requestHandler(
      async () => await createCompany(companyData),
      null,
      async (data) => {
        closeModal("add-company");
        toast.success("Company Added Successfully!");
        clearForm();
        await onSuccessfullSubmit(companyData, data.data.output.last_id);
      },
      toast.error
    );
  };

  const editCompanyHandler = async (id, data, modalId) => {
    await requestHandler(
      async () => await editCompany(id, data),
      null,
      async (data) => {
        closeModal(modalId);
        toast.success("Company Saved Successfully!");
        await onSuccessfullSubmit();
      },
      toast.error
    );
  };

  const handleFile = async (e, key) => {
    const response = await handleFileUpload(e.target.files[0]);
    if (response.type === "success") {
      setCompany((prev) => ({
        ...prev,
        [key]: response.data,
      }));
      setUpdatedData((prev) => ({
        ...prev,
        [key]: response.data,
      }));
    } else {
      toast.error(response.error || "Oops! Something went wrong");
    }
  };

  const clearForm = () => {
    setCompany({
      name: "",
      email: "",
      phone: "",
      website: "",
      gstin_or_pan: "GST",
      gstin: "",
      gstin_doc: "",
      pan: "",
      pan_doc: "",
      lead_source: "",
      salesperson: "",
      address: "",
      pincode: "",
      state: "",
      city: "",
      primary_poc_client_name: "",
      primary_poc_email: "",
      primary_poc_phone: "",
      primary_poc_designation: "",
    });
  };

  return (
    <FormModal
      onClose={() => {
        if (modalId === "add-company") {
          clearForm();
        }
      }}
      id={modalId}
      z_index="z-[110]"
      overlay_z_index="z-[100]"
      heading={modalId.split("-")[0] === "add" ? "Add Company" : "Edit Company"}
      onSubmit={onSubmit}
      ctaText={modalId.split("-")[0] === "add" ? "Add Company" : "Save"}
    >
      <div className="grid grid-cols-2 gap-x-2.5 gap-y-5 overflow-y-auto">
        <Input
          mandatory={true}
          type={"text"}
          onChange={valueHandler}
          value={company.name}
          name={"name"}
          label={"Name"}
        />
        <Input
          mandatory={true}
          type={"email"}
          onChange={valueHandler}
          value={company.email}
          name={"email"}
          label={"Email"}
        />
        <Input
          mandatory={true}
          type={"number"}
          onChange={phoneNumberHandler}
          value={company.phone}
          name={"phone"}
          label={"Phone"}
        />
        <Input
          type={"text"}
          onChange={valueHandler}
          value={company.website}
          name={"website"}
          label={"Website"}
        />
        <SelectForObjects
          mandatory={true}
          margin={"0px"}
          height={"36px"}
          selected={company.gstin_or_pan}
          setselected={(value) => {
            setCompany((prev) => ({
              ...prev,
              gstin_or_pan: value,
              gstin: "",
              gstin_doc: "",
              pan: "",
              pan_doc: "",
            }));
            setUpdatedData((prev) => ({
              ...prev,
              gstin_or_pan: value,
              gstin: "",
              gstin_doc: "",
              pan: "",
              pan_doc: "",
            }));
          }}
          options={[{ name: "GST" }, { name: "PAN" }]}
          optionName={"name"}
          placeholder="Select.."
          dropdownLabel={"GST/PAN"}
        />
        <Input
          mandatory={true}
          disabled={!company.gstin_or_pan || company.gstin_or_pan === ""}
          onChange={(e) => {
            setCompany((prev) => ({
              ...prev,
              [e.target.name]: e.target.value,
            }));
            setUpdatedData((prev) => ({
              ...prev,
              [e.target.name]: e.target.value,
            }));
          }}
          name={company.gstin_or_pan === "GST" ? "gstin" : "pan"}
          value={company[company.gstin_or_pan === "GST" ? "gstin" : "pan"]}
          type={"text"}
          label={
            company.gstin_or_pan && company.gstin_or_pan !== ""
              ? company.gstin_or_pan
              : "-"
          }
        />

        <span className="flex gap-2 items-center">
          <Input
            disabled={!company.gstin_or_pan || company.gstin_or_pan === ""}
            onChange={(e) =>
              handleFile(e, company.gstin_or_pan?.toLowerCase() + "_doc")
            }
            name={company.gstin_or_pan}
            value={company[company.gstin_or_pan?.toLowerCase() + "_doc"] ?? ""}
            type={"file"}
            label={
              company.gstin_or_pan && company.gstin_or_pan !== ""
                ? company.gstin_or_pan + " Doc"
                : "-"
            }
          />
          {company[company.gstin_or_pan?.toLowerCase() + "_doc"] &&
            company[company.gstin_or_pan?.toLowerCase() + "_doc"] !== "" && (
              <FaEye
                size={15}
                className="cursor-pointer"
                onClick={() => window.open(value, "__blank")}
              />
            )}
        </span>
        <SelectForObjects
          mandatory={true}
          margin={"0px"}
          height={"36px"}
          setselected={(value) => {
            const c = sources.find((person) => person.source === value);
            setCompany((prev) => ({ ...prev, lead_source: c?.id }));
            setUpdatedData((prev) => ({ ...prev, lead_source: c?.id }));
          }}
          selected={
            sources.find((person) => person.id === company?.lead_source)?.source
          }
          options={sources}
          optionName={"source"}
          placeholder="Select Lead Source"
          dropdownLabel={"Select Lead Source"}
        />
        <SelectForObjects
          mandatory={true}
          margin={"0px"}
          height={"36px"}
          setselected={(value) => {
            const c = salesPersons.find((person) => person.name === value);
            setCompany((prev) => ({ ...prev, salesperson: c?.id }));
            setUpdatedData((prev) => ({ ...prev, salesperson: c?.id }));
          }}
          selected={
            salesPersons.find((person) => person.id === company?.salesperson)
              ?.name
          }
          options={salesPersons}
          optionName={"name"}
          placeholder="Select Salesperson"
          dropdownLabel={"Select Salesperson"}
        />
        <Input
          mandatory={true}
          type={"text"}
          onChange={valueHandler}
          value={company.address}
          name={"address"}
          label={"Address"}
        />
        <Input
          mandatory={true}
          type={"number"}
          onChange={pincodeHandler}
          value={company.pincode}
          name={"pincode"}
          label={"Pincode"}
        />
        <SelectForObjects
          mandatory={true}
          margin={"0px"}
          height={"36px"}
          optionID={"id"}
          setselected={async (value, id) => {
            setCompany((prev) => ({
              ...prev,
              state: id,
              state_name: value,
            }));
            setUpdatedData((prev) => ({
              ...prev,
              state: id,
              state_name: value,
            }));
            await getCityHandler(id);
          }}
          selected={company?.state_name}
          options={states}
          optionName={"name"}
          placeholder="Select State"
          dropdownLabel={"Select State"}
        />

        <SelectForObjects
          mandatory={true}
          margin={"0px"}
          height={"36px"}
          setselected={async (value, id) => {
            setCompany((prev) => ({
              ...prev,
              city: id,
              city_name: value,
            }));
            setUpdatedData((prev) => ({
              ...prev,
              city: id,
              city_name: value,
            }));
          }}
          selected={company.city_name}
          options={city}
          optionName={"name"}
          optionID={"id"}
          placeholder="Select City"
          dropdownLabel={"Select City"}
        />
        <Input
          mandatory={true}
          type={"text"}
          onChange={valueHandler}
          value={company.primary_poc_client_name}
          name={"primary_poc_client_name"}
          label={"POC Client Name"}
        />
        <Input
          type={"email"}
          onChange={valueHandler}
          value={company.primary_poc_email}
          name={"primary_poc_email"}
          label={"POC Email"}
        />
        <Input
          mandatory={true}
          type={"number"}
          onChange={phoneNumberHandler}
          value={company.primary_poc_phone}
          name={"primary_poc_phone"}
          label={"POC Phone"}
        />
        <Input
          type={"text"}
          onChange={valueHandler}
          value={company.primary_poc_designation}
          name={"primary_poc_designation"}
          label={"POC Designation"}
        />
      </div>
    </FormModal>
  );
};

export default CreateCompanyModal;
