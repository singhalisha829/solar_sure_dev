import React, { useEffect, useState } from "react";
import FormModal from "../shared/FormModal";
import Input from "../formPage/Input";
import { useModal } from "@/contexts/modal";
import { SelectForObjects } from "../formPage/MultiSelectDropdown/MultiSelectDropdown";
import { createSite, editProjectSite } from "@/services/api";
import { requestHandler } from "@/services/ApiHandler";
import { toast } from "sonner";
import { useStateCity } from "@/contexts/state_city";
import { useCompany } from "@/contexts/companies";
import {
  checkSpecificKeys,
  checkPincodeValue,
  checkContactValue,
} from "@/utils/formValidationHandler";
import { FaEye } from "react-icons/fa";
import { handleFileUpload } from "@/utils/documentUploadHandler";

const SiteModal = ({
  modalId,
  getSitesHandler,
  setProject,
  project,
  siteDetails,
  companyList,
}) => {
  const { closeModal } = useModal();
  const { getCityHandler, states, city } = useStateCity();
  const { companies } = useCompany();
  const [editData, setEditData] = useState({});
  const [companyDetails, setCompanyDetails] = useState(project || {});

  const [site, setSite] = useState({
    name: "",
    company: project?.company,
    gst_or_pan: "GST",
    gst: "",
    gst_doc: "",
    pan: "",
    pan_doc: "",
    location: "",
    address: "",
    pincode: "",
    state: null,
    city: null,
    primary_poc_client_name: "",
    primary_poc_email: "",
    primary_poc_phone: "",
    primary_poc_designation: "",
  });

  const fieldsToDisplay = {
    company: project?.company,
    name: "",
    location: "",
    same_as_company_address: false,
    gst_or_pan: "",
    gst_or_pan_value: "",
    gst_or_pan_doc: "",
    address: "",
    pincode: "",
    state: null,
    city: null,
    primary_poc_client_name: "",
    primary_poc_email: "",
    primary_poc_phone: "",
    primary_poc_designation: "",
  };

  useEffect(() => {
    if (siteDetails) {
      let projectSiteDetails = siteDetails;
      if (siteDetails.gst !== "") {
        projectSiteDetails.gst_or_pan = "GST";
      }
      if (siteDetails.pan !== "") {
        projectSiteDetails.gst_or_pan = "PAN";
      }
      setSite(projectSiteDetails);
      if (siteDetails.state !== "" && siteDetails.state !== null) {
        getCityHandler(siteDetails.state);
      }
    } else {
      setSite({ ...site, company: project?.company });
    }
  }, [siteDetails]);

  // useEffect(() => {
  //   console.log("here2");
  //   if (project?.company && project?.company !== "") {
  //     setSite({ ...site, company: project.company });
  //   }
  // }, [project]);

  const addSiteHandler = async () => {
    const keysToCheck = {
      name: "Site Name",
      company: "Company",
      location: "Location (Google Maps URL)",
      gst_or_pan: "GST/PAN",
      [site.gst_or_pan?.toLowerCase()]: site.gst_or_pan,
      address: "Address",
      pincode: "Pincode",
      state: "State",
      city: "City",
      primary_poc_client_name: "Poc Client Name",
      primary_poc_phone: "Poc Phone",
    };

    const validationResult = checkSpecificKeys(site, keysToCheck);

    if (validationResult.isValid === false) {
      toast.error(validationResult.message);
      return;
    }

    if (modalId == "add-site") {
      await requestHandler(
        async () => await createSite(site),
        null,
        async (data) => {
          await getSitesHandler(site.company);
          setProject({ ...site, project_site: data.status.last_id });
          closeModal("add-site");
          clearForm();
          toast.success("Site Added Successfully...");
        },
        toast.error
      );
    } else if (Object.keys(editData).length > 0) {
      await requestHandler(
        async () => await editProjectSite(site.id, site),
        null,
        async (data) => {
          await getSitesHandler(site.company);
          closeModal(modalId);
          toast.success("Site Saved Successfully...");
        },
        toast.error
      );
    } else {
      closeModal(modalId);
    }
  };

  const handleFile = async (e, key) => {
    const response = await handleFileUpload(e.target.files[0]);
    if (response.type === "success") {
      setSite((prev) => ({
        ...prev,
        [key]: response.data,
      }));
      setEditData((prev) => ({
        ...prev,
        [key]: response.data,
      }));
      toast.success("File Uploaded Successfully");
    } else {
      toast.error(response.error || "Oops! Something went wrong");
    }
  };

  function pincodeHandler(e) {
    if (checkPincodeValue(e) != null) {
      setSite((prev) => ({
        ...prev,
        pincode: e.target.value,
      }));
      setEditData((prev) => ({
        ...prev,
        pincode: e.target.value,
      }));
    }
  }

  const contactHandler = (e) => {
    if (checkContactValue(e) != null) {
      setSite((prev) => ({
        ...prev,
        primary_poc_phone: e.target.value,
      }));
      setEditData((prev) => ({
        ...prev,
        primary_poc_phone: e.target.value,
      }));
    }
  };

  const handleSiteAddress = async (e) => {
    if (e.target.checked) {
      await getCityHandler(companyDetails?.state);
      if (companyDetails?.gstin !== "") {
        setSite({
          ...site,
          gst: companyDetails?.gstin,
          gst_or_pan: "GST",
          gst_doc: companyDetails?.gstin_doc,
          address: companyDetails?.address,
          pincode: companyDetails?.pincode,
          city: companyDetails?.city,
          state: companyDetails?.state,
        });
      } else if (companyDetails?.pan !== "") {
        setSite({
          ...site,
          gst_or_pan: "PAN",
          pan: companyDetails?.pan,
          pan_doc: companyDetails?.pan_doc,
          address: companyDetails?.address,
          pincode: companyDetails?.pincode,
          city: companyDetails?.city,
          state: companyDetails?.state,
        });
      } else {
        setSite({
          ...site,
          address: companyDetails?.address,
          pincode: companyDetails?.pincode,
          city: companyDetails?.city,
          state: companyDetails?.state,
        });
      }
    } else {
      setSite({
        ...site,
        gst: "",
        gst_or_pan: "GST",
        gst_doc: "",
        pan: "",
        pan_doc: "",
        address: "",
        pincode: "",
        city: "",
        state: "",
      });
    }
  };

  const handleCompanySelect = (value) => {
    const selectedCompany = (companyList ?? companies).find(
      (company) => company.name === value
    );
    setSite((prev) => ({
      ...prev,
      company: selectedCompany?.id,
    }));
    setEditData((prev) => ({
      ...prev,
      company: selectedCompany?.id,
    }));

    if (!project?.company) {
      setCompanyDetails(selectedCompany);
    }
  };

  const clearForm = () => {
    setSite({
      name: "",
      company: project?.company,
      gst_or_pan: "GST",
      gst: "",
      gst_doc: "",
      pan: "",
      pan_doc: "",
      location: "",
      address: "",
      pincode: "",
      state: null,
      city: null,
      primary_poc_client_name: "",
      primary_poc_email: "",
      primary_poc_phone: "",
      primary_poc_designation: "",
    });
  };

  return (
    <FormModal
      onClose={() => {
        if (modalId == "add-site") {
          clearForm();
        }
      }}
      id={modalId}
      z_index="z-[110]"
      overlay_z_index="z-[100]"
      onSubmit={addSiteHandler}
      ctaText={modalId == "add-site" ? "Create Site" : "Save"}
      heading={modalId == "add-site" ? "Add Site" : "Edit Site"}
    >
      <div className="grid grid-cols-2 gap-x-2.5 gap-y-5 overflow-y-auto">
        {Object.keys(fieldsToDisplay).map((key, index) => {
          // set the lable for all input fields
          let label = "";
          if (key === "location") {
            label = "Location (Google Maps URL)";
          } else {
            label = key.replaceAll("_", " ").toLowerCase();
          }
          label = label.replace("primary", "");

          if (key === "state") {
            return (
              <SelectForObjects
                mandatory={true}
                key={index}
                margin={"0px"}
                height={"36px"}
                setselected={async (value) => {
                  const c = states.find((state) => state.name === value);
                  setSite((prev) => ({ ...prev, state: c?.id }));
                  setEditData((prev) => ({ ...prev, state: c?.id }));
                  await getCityHandler(c.id);
                }}
                selected={
                  states.find((state) => state.id === site?.state)?.name
                }
                options={states}
                optionName={"name"}
                placeholder="Select State"
                dropdownLabel={"Select State"}
              />
            );
          }
          if (key === "city") {
            return (
              <SelectForObjects
                mandatory={true}
                key={index}
                margin={"0px"}
                height={"36px"}
                setselected={async (value) => {
                  const c = city.find((state) => state.name === value);
                  setSite((prev) => ({ ...prev, city: c.id }));
                }}
                selected={city.find((c) => c.id === site?.city)?.name}
                options={city}
                optionName={"name"}
                placeholder="Select City"
                dropdownLabel={"Select City"}
              />
            );
          }

          if (key === "company") {
            return (
              <SelectForObjects
                key={index}
                mandatory={true}
                disabled={project != undefined}
                margin={"0px"}
                height={"34px"}
                setselected={handleCompanySelect}
                selected={
                  (companyList ?? companies).find(
                    (company) => company?.id == site?.company
                  )?.name
                }
                options={companyList ?? companies}
                optionName={"name"}
                placeholder="Select Company"
                dropdownLabel={"Select Company"}
              />
            );
          }

          if (key === "same_as_company_address") {
            return (
              <Input
                key={index}
                type="checkbox"
                label="Same as Company Details"
                className="w-fit"
                checked={site[key]}
                onChange={handleSiteAddress}
              />
            );
          }

          if (key === "gst_or_pan") {
            return (
              <SelectForObjects
                mandatory={true}
                key={index}
                margin={"0px"}
                height={"36px"}
                selected={site.gst_or_pan}
                setselected={(value) => {
                  setSite({ ...site, gst_or_pan: value });
                  setSite((prev) => ({
                    ...prev,
                    gst: "",
                    gst_doc: "",
                    pan: "",
                    pan_doc: "",
                  }));
                  setEditData((prev) => ({
                    ...prev,
                    gst: "",
                    gst_doc: "",
                    pan: "",
                    pan_doc: "",
                  }));
                }}
                options={[{ name: "GST" }, { name: "PAN" }]}
                optionName={"name"}
                placeholder="Select.."
                dropdownLabel={"GST/PAN"}
              />
            );
          }

          if (key === "gst_or_pan_value") {
            let value = site[site.gst_or_pan?.toLowerCase()];
            return (
              <Input
                key={index}
                mandatory={true}
                disabled={!site.gst_or_pan || site.gst_or_pan === ""}
                onChange={(e) => {
                  setSite((prev) => ({
                    ...prev,
                    [e.target.name]: e.target.value,
                  }));
                  setEditData((prev) => ({
                    ...prev,
                    [e.target.name]: e.target.value,
                  }));
                }}
                name={site.gst_or_pan?.toLowerCase()}
                value={value}
                type={"text"}
                label={
                  site.gst_or_pan && site.gst_or_pan !== ""
                    ? site.gst_or_pan
                    : "-"
                }
              />
            );
          }

          if (key === "gst_or_pan_doc") {
            let value = site[site.gst_or_pan?.toLowerCase() + "_doc"] ?? "";
            return (
              <span key={index} className="flex gap-2 items-center">
                <Input
                  disabled={!site.gst_or_pan || site.gst_or_pan === ""}
                  onChange={(e) =>
                    handleFile(e, site.gst_or_pan?.toLowerCase() + "_doc")
                  }
                  name={site.gst_or_pan}
                  value={value}
                  type={"file"}
                  label={
                    site.gst_or_pan && site.gst_or_pan !== ""
                      ? site.gst_or_pan + " Doc"
                      : "-"
                  }
                />
                {value !== "" && (
                  <FaEye
                    size={15}
                    className="cursor-pointer"
                    onClick={() => window.open(value, "__blank")}
                  />
                )}
              </span>
            );
          }

          return (
            <Input
              key={index}
              mandatory={
                [
                  "name",
                  "location",
                  "address",
                  "pincode",
                  "primary_poc_client_name",
                  "primary_poc_phone",
                ].includes(key)
                  ? true
                  : false
              }
              onChange={(e) => {
                if (key === "pincode") {
                  pincodeHandler(e);
                } else if (key === "primary_poc_phone") {
                  contactHandler(e);
                } else {
                  setSite((prev) => ({
                    ...prev,
                    [e.target.name]: e.target.value,
                  }));
                  setEditData((prev) => ({
                    ...prev,
                    [e.target.name]: e.target.value,
                  }));
                }
              }}
              name={key}
              value={site[key]}
              type={["pincode"].includes(key) ? "number" : "text"}
              label={label}
            />
          );
        })}
      </div>
    </FormModal>
  );
};

export default SiteModal;
