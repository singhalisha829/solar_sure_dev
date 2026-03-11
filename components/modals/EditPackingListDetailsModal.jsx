import React, { useState, useEffect } from "react";
import FormModal from "../shared/FormModal";
import Input from "../formPage/Input";
import { useVendors } from "@/contexts/vendors";
import { SelectForObjects } from "../formPage/MultiSelectDropdown/MultiSelectDropdown";
import { editPackingListDetails } from "@/services/api";
import { requestHandler } from "@/services/ApiHandler";
import { toast } from "sonner";

const EditPackingListDetails = ({ details, onSuccessfullSubmit }) => {
  const [packingListDetails, setPackingListDetails] = useState({
    vendor: "",
    vendor_name: "",
    remark: "",
    po_number: "",
  });
  const [editedData, setEditedData] = useState({});
  const [invalidItemsList, setInvalidItemsList] = useState([]);
  const { vendors } = useVendors();

  useEffect(() => {
    if (details && details !== null) {
      setPackingListDetails(details);
    }
  }, [details]);

  const validateData = async () => {
    if (packingListDetails.vendor_name == "") {
      toast.error("Field Dispatch From is empty!");
      return;
    }

    if (
      packingListDetails.vendor_name !== "Ornate Agencies Private Limited" &&
      packingListDetails.po_number == ""
    ) {
      toast.error("Field PO Number is empty!");
      return;
    }
    if (
      details.vendor != packingListDetails?.vendor &&
      packingListDetails?.vendor_name === "Ornate Agencies Private Limited"
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
      async () =>
        await editPackingListDetails(packingListDetails.id, editedData),
      null,
      async (data) => {
        toast.success("Packing List Details Saved Successfully!");
        onSuccessfullSubmit();
      },
      toast.error
    );
  };

  const valueHandler = (e) => {
    setPackingListDetails((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setEditedData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleOnClose = () => {
    setInvalidItemsList([]);
    setPackingListDetails(details);
    setEditedData({});
  };

  return (
    <FormModal
      id={"edit-packing-list-details"}
      heading={"Edit Packing List"}
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
      <div className="grid grid-cols-2 gap-4">
        <SelectForObjects
          margin={"0px"}
          mandatory
          height={"36px"}
          setselected={(name, id) => {
            setPackingListDetails({
              ...packingListDetails,
              vendor: id,
              vendor_name: name,
            });
            setEditedData({
              ...editedData,
              vendor: id,
            });
            //   handleTableHeader(name);
          }}
          selected={packingListDetails.vendor_name}
          options={vendors}
          optionName={"name"}
          optionID={"id"}
          placeholder="Select.."
          dropdownLabel="Dispatch From"
        />
        <Input
          type="text"
          outerClass={"w-[30rem]"}
          value={packingListDetails.po_number}
          mandatory={
            packingListDetails.vendor_name !== "SolarSure"
          }
          onChange={valueHandler}
          name="po_number"
          label={"PO Number"}
        />
        <Input
          type="textarea"
          outerClass={"col-span-2"}
          value={packingListDetails.remark}
          onChange={valueHandler}
          name="remark"
          label={"Remark"}
        />
      </div>
    </FormModal>
  );
};

export default EditPackingListDetails;
