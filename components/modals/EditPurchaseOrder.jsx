import React, { useState, useEffect } from "react";
import FormModal from "../shared/FormModal";
import Input from "../formPage/Input";
import { useVendors } from "@/contexts/vendors";
import { SelectForObjects } from "../formPage/MultiSelectDropdown/MultiSelectDropdown";
import { editPurchaseOrder, getCompanyConfiguration } from "@/services/api";
import { requestHandler } from "@/services/ApiHandler";
import { toast } from "sonner";
import { useStateCity } from "@/contexts/state_city";
import { LocalStorageService } from "@/services/LocalStorageHandler";
import {
  checkPincodeValue,
  checkContactValue,
} from "@/utils/formValidationHandler";

const EditPurchaseOrderDetails = ({
  details,
  purchasers,
  onSuccessfullSubmit,
}) => {
  const { states, city, getCityHandler } = useStateCity();
  const { vendors } = useVendors();
  const [purchaseOrderDetails, setPurchaseOrderDetails] = useState({});
  const [editedData, setEditedData] = useState({});
  const [invalidItemsList, setInvalidItemsList] = useState([]);
  const [companyConfig, setCompanyConfig] = useState(null);

  useEffect(() => {
    requestHandler(
      async () => await getCompanyConfiguration(),
      null,
      (data) => setCompanyConfig(data.data.output),
      () => {}
    );
  }, []);

  useEffect(() => {
    if (details && details !== null) {
      let poDetails = details;
      if (poDetails.billingAddress != "") {
        poDetails = {
          ...details,
          billing_address_details: `${details.billing_address_name}.
                   GST-${details?.billing_address_gst_no}`,
        };
      }

      setPurchaseOrderDetails(poDetails);
    }
  }, [details]);

  const warehouseLabel = companyConfig?.company_name
    ? `${companyConfig.company_name} Warehouse`
    : "Warehouse";

  const shippingAddressList = [
    { name: "Project Site" },
    { name: warehouseLabel },
    { name: "Other" },
  ];

  const validateData = async () => {
    if (purchaseOrderDetails.vendor_name == "") {
      toast.error("Field Dispatch From is empty!");
      return;
    }

    if (
      purchaseOrderDetails.vendor_name !== companyConfig?.company_name &&
      purchaseOrderDetails.po_number == ""
    ) {
      toast.error("Field PO Number is empty!");
      return;
    }
    if (
      details.vendor != purchaseOrderDetails?.vendor &&
      purchaseOrderDetails?.vendor_name === companyConfig?.company_name
    ) {
      // check all items inventory
      let invalid_items = [];
      details.packing_list_items.map((item) => {
        if (item.quantity > item.inventory_left_quantity.quantity) {
          invalid_items.push(item);
        }
      });

      if (invalid_items.length > 0) {
        setInvalidItemsList(invalid_items);
      } else {
        await onSubmit(editedData);
      }
    } else {
      await onSubmit(editedData);
    }
  };

  const onSubmit = async () => {
    await requestHandler(
      async () => await editPurchaseOrder(purchaseOrderDetails.id, editedData),
      null,
      async (data) => {
        toast.success("Packing List Details Saved Successfully!");
        onSuccessfullSubmit();
      },
      toast.error
    );
  };

  const valueHandler = (e) => {
    setPurchaseOrderDetails((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setEditedData((prev) => ({
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
    let shipperData;
    if (name === "Project Site") {
      const projectDetails = LocalStorageService.get("purchase-order-project");
      shipperData = {
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
      };
    } else if (name === "Other") {
      shipperData = {
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
      };
    } else if (name === warehouseLabel) {
      shipperData = {
        shipper_type: name,
        shipper_name: companyConfig?.company_name ?? "",
        shipper_address: companyConfig?.company_warehouse_address ?? "",
        shipper_city: companyConfig?.city_id ? String(companyConfig.city_id) : "",
        shipper_city_name: companyConfig?.city_name ?? "",
        shipper_state: companyConfig?.state_id ? String(companyConfig.state_id) : "",
        shipper_state_name: companyConfig?.state_name ?? "",
        shipper_pincode: companyConfig?.company_pincode ?? "",
        shipper_gst: companyConfig?.company_gstin ?? "",
        shipper_contact_person_name: "",
        shipper_email: "",
        shipper_mobile_no: "",
      };
    }
    setPurchaseOrderDetails({
      ...purchaseOrderDetails,
      ...shipperData,
    });
    setEditedData({
      ...editedData,
      ...shipperData,
    });
  };

  const handleOnClose = () => {
    setInvalidItemsList([]);
    setPurchaseOrderDetails(details);
    setEditedData({});
  };

  return (
    <FormModal
      id={"edit-purchase-order-details"}
      heading={"Edit Purchase Order"}
      ctaText={"Save"}
      onSubmit={validateData}
      onClose={handleOnClose}
      z_index="z-[2000]"
    >
      {invalidItemsList.length > 0 && (
        <p className="text-red-500 text-sm">
          Please check the inventory for items -{" "}
          <strong>
            {invalidItemsList
              .map(
                (item) =>
                  `${item.project_bom_item_code}(${item.project_bom_item_name})`
              )
              .join(", ")}
            .
          </strong>
        </p>
      )}
      <div className="grid grid-cols-2 gap-4 overflow-scroll">
        <SelectForObjects
          margin={"0px"}
          mandatory
          height={"36px"}
          setselected={(name, id) => {
            setPurchaseOrderDetails({
              ...purchaseOrderDetails,
              vendor: id,
              vendor_name: name,
            });
            setEditedData({
              ...editedData,
              vendor: id,
            });
            //   handleTableHeader(name);
          }}
          selected={purchaseOrderDetails.vendor_name}
          options={vendors}
          optionName={"name"}
          optionID={"id"}
          placeholder="Select.."
          dropdownLabel="Vendor"
        />
        <span></span>
        <SelectForObjects
          margin={"0px"}
          mandatory
          height={"36px"}
          setselected={(name, id) => {
            setPurchaseOrderDetails((prev) => ({
              ...prev,
              purchaser: Number(id),
              purchaser_name: name,
            }));
            setEditedData({
              ...editedData,
              purchaser: Number(id),
            });
          }}
          selected={purchaseOrderDetails.purchaser_name}
          options={purchasers}
          optionName={"name"}
          optionID={"id"}
          placeholder="Select.."
          dropdownLabel={"Purchaser"}
        />
        <SelectForObjects
          margin={"0px"}
          mandatory
          height={"36px"}
          className={"w-[20rem]"}
          setselected={handleShipperType}
          selected={purchaseOrderDetails.shipper_type}
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
          value={purchaseOrderDetails.shipper_address}
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
          selected={purchaseOrderDetails.shipper_state_name}
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
          selected={purchaseOrderDetails.shipper_city_name}
          options={city}
          optionName={"name"}
          optionID={"id"}
          placeholder="Select City"
          dropdownLabel={"Select City"}
        />
        <Input
          type={"text"}
          onChange={valueHandler}
          value={purchaseOrderDetails.shipper_gst}
          name={"shipper_gst"}
          label={"gst"}
        />

        <Input
          mandatory={true}
          type={"number"}
          onChange={pincodeHandler}
          value={purchaseOrderDetails.shipper_pincode}
          name={"shipper_pincode"}
          label={"pincode"}
        />
        <Input
          mandatory={true}
          type={"text"}
          onChange={valueHandler}
          value={purchaseOrderDetails.shipper_contact_person_name}
          name={"shipper_contact_person_name"}
          label={"Contact Person Name"}
        />
        <Input
          type={"number"}
          mandatory={true}
          onChange={contactHandler}
          value={purchaseOrderDetails.shipper_mobile_no}
          name={"shipper_mobile_no"}
          label={"Contact Person Mobile"}
        />

        <Input
          type={"email"}
          onChange={valueHandler}
          value={purchaseOrderDetails.shipper_email}
          name={"shipper_email"}
          label={"Contact Person Email"}
        />
        <Input
          type="textarea"
          outerClass="col-span-2"
          value={purchaseOrderDetails.payment_terms}
          mandatory={true}
          name="payment_terms"
          onChange={valueHandler}
          label="Payment Terms"
        />
        <Input
          type="textarea"
          outerClass="col-span-2"
          mandatory={true}
          value={purchaseOrderDetails.delivery_terms}
          name="delivery_terms"
          onChange={valueHandler}
          label="Delivery Terms"
        />
        <Input
          type="textarea"
          outerClass="col-span-2"
          value={purchaseOrderDetails.other_terms}
          mandatory={true}
          name="other_terms"
          onChange={valueHandler}
          textareaRows={"10"}
          label="Other Terms"
        />
        <Input
          type="textarea"
          outerClass={"col-span-2"}
          value={purchaseOrderDetails.remark}
          onChange={valueHandler}
          name="remark"
          label={"Remark"}
        />
      </div>
    </FormModal>
  );
};

export default EditPurchaseOrderDetails;
