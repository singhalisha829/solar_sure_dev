import { useManufacturers } from "@/contexts/manufacturers";
import { useState, useEffect } from "react";
import Input from "../formPage/Input";
import { SelectForObjects } from "../formPage/MultiSelectDropdown/MultiSelectDropdown";
import FormModal from "../shared/FormModal";
import { checkSpecificKeys } from "@/utils/formValidationHandler";
import { toast } from "sonner";
import { useProduct } from "@/contexts/product";
import { getProducts } from "@/services/api";
import { requestHandler } from "@/services/ApiHandler";
import { FaEye } from "react-icons/fa";
import { handleFileUpload } from "@/utils/documentUploadHandler";

const AddItemModal = ({
  modalId,
  projectHeadName,
  onAddItem,
  totalProjectCapacity,
  itemDetails,
  sectionItemList,
  projectArea,
  enteredProjectCapacity,
  calculatedProjectCapacity,
  existingItemIds,
}) => {
  const { manufacturers } = useManufacturers();
  const { units } = useProduct();
  const [productList, setProductList] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showWarningMessage, setShowWarningMessage] = useState(false);
  const [ignoreWarning, setIgnoreWarning] = useState(false);
  const [productCode, setProductCode] = useState("");
  const [item, setItem] = useState({
    Product: "",
    Product_name: "",
    model: "",
    model_name: "",
    product_specification: "",
    remark: "",
    Specify: "",
    scope_of_work: "",
    upload_datasheet: "",
    wattage: "",
    unit: "",
    unit_name: "",
    project_days: "",
    manpower_expected: "",
    quantity: "",
    project_capacity: "",
    considered_price: "",
    considered_price_unit: "",
    amount: "",
    transportation: "",
    total_amount: "",
  });

  useEffect(() => {
    if (
      [
        "Installation & Commissioning",
        "Net Metering and Liasioning",
        "Miscellaneous",
      ].includes(projectHeadName)
    ) {
      getInstallationAmount();
    } else if (["BOS-Structure", "BOS-Electrical"].includes(projectHeadName)) {
      getBOSAmount();
    } else if (["Solar Inverter", "Solar Panels"].includes(projectHeadName)) {
      getSolarAmount();
    }
  }, [
    item.considered_price_unit,
    item.considered_price,
    item.manpower_expected,
    item.project_days,
    item.quantity,
  ]);

  useEffect(() => {
    if (itemDetails && itemDetails !== null) {
      setItem(itemDetails);
      if (["Solar Inverter", "Solar Panels"].includes(projectHeadName)) {
        const itemIds = existingItemIds.filter((id) => id != itemDetails.model);
        getProductList(itemDetails.Product, itemIds);
      }

      // if(siteDetails.state !== "" && siteDetails.state !== null){
      //   getCityHandler(siteDetails.state)
      // }
    }
  }, [itemDetails]);

  const getInstallationAmount = () => {
    let amount = 0;
    if (item.considered_price_unit === "per manday") {
      amount =
        (item.considered_price || 0) *
        (item.manpower_expected || 1) *
        (item.project_days || 0);
    } else if (item.considered_price_unit === "per WP") {
      amount = (item.considered_price || 0) * (totalProjectCapacity || 1);
    } else {
      amount = (item.considered_price || 0) * (projectArea || 1);
    }
    setItem({ ...item, amount: amount });
  };

  const getBOSAmount = () => {
    let amount = 0;
    if (item.considered_price_unit === "per WP") {
      amount = (item.considered_price || 0) * (totalProjectCapacity || 1);
    } else {
      amount = (item.considered_price || 0) * (item.quantity || 1);
    }
    setItem({ ...item, amount: amount });
  };

  const getSolarAmount = () => {
    let amount = 0;
    if (
      item.considered_price_unit === "per WP" &&
      projectHeadName === "Solar Panels"
    ) {
      amount =
        (item.considered_price || 0) *
        (item.quantity || 1) *
        (item.wattage || 1);
    } else if (
      item.considered_price_unit === "per WP" &&
      projectHeadName === "Solar Inverter"
    ) {
      amount = (item.considered_price || 0) * (totalProjectCapacity || 1);
    } else {
      amount = (item.considered_price || 0) * (item.quantity || 1);
    }
    setItem({ ...item, amount: amount });
  };

  const handleConsideredPriceUnit = (value) => {
    if (value === "") {
      setItem({
        ...item,
        considered_price_unit: "",
        considered_price: "",
        total_amount: "",
        amount: "",
      });
    } else {
      setItem((prev) => ({
        ...prev,
        considered_price_unit: value,
      }));
    }
  };

  const getProductList = async (id, itemIds) => {
    if (id) {
      await requestHandler(
        async () =>
          await getProducts({
            manufacturer: id,
            excluded_ids: itemIds,
          }),
        null,
        (data) => {
          const details = data.data.output;
          setProductList(details);
        },
        toast.error
      );
    }
  };

  const valueHandler = (e) => {
    setItem((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const productNameHandler = (e) => {
    if (
      sectionItemList?.length > 0 &&
      sectionItemList.includes(e.target.value.toLowerCase())
    ) {
      setErrorMessage(`${e.target.id} must be unique. Please try again!`);
    } else {
      setErrorMessage(null);
    }
    setItem((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFile = async (e) => {
    const response = await handleFileUpload(e.target.files[0]);
    if (response.type === "success") {
      setItem({ ...item, upload_datasheet: response.data });
    } else {
      toast.error(response.error || "Oops! Something went wrong");
    }
  };

  const onSubmit = () => {
    if (errorMessage) {
      toast.error(errorMessage);
      return;
    }

    let keysToCheck = {
      considered_price: "Considered Price",
      transportation: "Transportation Cost",
      considered_price_unit: "Considered Price Unit",
    };

    let formData = {
      Product: item.Product,
      remark: item.remark,
      upload_datasheet: item.upload_datasheet,
      considered_price: item.considered_price,
      considered_price_unit: item.considered_price_unit,
      transportation: item.transportation,
    };
    if (["Solar Inverter", "Solar Panels"].includes(projectHeadName)) {
      formData = {
        ...formData,
        Product_name: item.Product_name,
        model: item.model,
        model_name: item.model_name,
        Specify: item.Specify,
        wattage: item.wattage || 1,
        quantity: item.quantity,
        project_capacity:
          projectHeadName === "Solar Panels"
            ? (item.wattage || 1) * (item.quantity || 0)
            : totalProjectCapacity,
        amount: item.amount,
        total_amount:
          (Number(item.amount) || 0) + (Number(item.transportation) || 0),
      };

      keysToCheck = {
        Product: "Manufacturer",
        model: "Model",
        quantity: "Quantity",
        ...keysToCheck,
      };

      if (item.Product === "Others") {
        keysToCheck = { Specify: "Specify", ...keysToCheck };
      }
    } else if (["BOS-Structure", "BOS-Electrical"].includes(projectHeadName)) {
      formData = {
        ...formData,
        product_specification: item.product_specification,
        unit: item.unit,
        unit_name: item.unit_name,
        project_capacity: item.project_capacity,
        quantity: item.quantity,
        amount: item.amount,
        total_amount:
          (Number(item.amount) || 0) + (Number(item.transportation) || 0),
      };

      keysToCheck = {
        Product: "Product",
        unit: "Unit Of Measurement",
        quantity: "Quantity",
        ...keysToCheck,
      };
    } else {
      formData = {
        ...formData,
        scope_of_work: item.scope_of_work,
        project_days: item.project_days,
        project_capacity: item.project_capacity,
        manpower_expected: item.manpower_expected,
        amount: item.amount,
        total_amount:
          (Number(item.amount) || 0) + (Number(item.transportation) || 0),
      };

      keysToCheck = {
        Product: "Work Description",
        project_days: "Project Days",
        manpower_expected: "Manpower Expected",
        ...keysToCheck,
      };
    }

    const validationResult = checkSpecificKeys(formData, keysToCheck);
    if (validationResult.isValid === false) {
      toast.error(validationResult.message);
      return;
    }
    if (!ignoreWarning && projectHeadName === "Solar Panels") {
      if (
        modalId.split("-")[0] === "add" &&
        Number(calculatedProjectCapacity) +
          Number(formData.project_capacity) !==
          Number(enteredProjectCapacity)
      ) {
        setShowWarningMessage(true);
        return;
      } else if (
        modalId.split("-")[0] === "edit" &&
        Number(calculatedProjectCapacity) -
          Number(itemDetails.project_capacity) +
          Number(formData.project_capacity) !==
          Number(enteredProjectCapacity)
      ) {
        setShowWarningMessage(true);
        return;
      }
    }

    if (modalId.split("-")[0] === "add") {
      clearForm();
      onAddItem(
        formData,
        Number(calculatedProjectCapacity) + Number(formData.project_capacity)
      );
    } else if (modalId.split("-")[0] === "edit") {
      onAddItem(
        formData,
        Number(calculatedProjectCapacity) -
          Number(itemDetails.project_capacity) +
          Number(formData.project_capacity)
      );
    }
  };

  const clearForm = () => {
    setItem({
      Product: "",
      Product_name: "",
      model: "",
      model_name: "",
      product_specification: "",
      remark: "",
      Specify: "",
      scope_of_work: "",
      upload_datasheet: "",
      wattage: "",
      unit: "",
      unit_name: "",
      project_days: "",
      manpower_expected: "",
      quantity: "",
      project_capacity: "",
      considered_price: "",
      amount: "",
      transportation: "",
      total_amount: "",
      considered_price_unit: "",
    });
    setProductList([]);
    setProductCode("");
    setIgnoreWarning(false);
    setShowWarningMessage(false);
  };

  function positiveValueHandler(e) {
    const inputValue = e.target.value;
    const regex = /^(?:\d+|\d*\.\d+)$/;
    if (regex.test(inputValue) || inputValue === "") {
      setItem((prev) => ({
        ...prev,
        [e.target.name]: e.target.value,
      }));
    }
  }

  const handleProductCode = async () => {
    if (productCode.trim() != "") {
      await requestHandler(
        async () => await getProducts({ product_code: productCode }),
        null,
        (data) => {
          const details = data.data.output;
          if (details.length > 0) {
            setProductList(details);
            setItem({
              ...item,
              Product: details[0].manufacturer,
              Product_name: details[0].manufacturer_name,
              wattage: details[0].power_rating,
              upload_datasheet: details[0].data_sheet,
              model: details[0].id,
              model_name: details[0].name,
            });
          } else {
            toast.error(
              "No products found for the specified Product Code. Please try again."
            );
          }
        },
        toast.error
      );
    }
  };

  return (
    <FormModal
      id={modalId}
      onSubmit={onSubmit}
      ctaText={modalId.split("-")[0] === "add" ? "Create Item" : "Save Item"}
      heading={
        modalId.split("-")[0] === "add"
          ? `Add ${projectHeadName}`
          : `Edit ${projectHeadName}`
      }
      onClose={() => (modalId.split("-")[0] === "add" ? clearForm() : {})}
    >
      {projectHeadName === "Solar Panels" && (
        <div className="grid grid-cols-2 gap-x-2.5 text-zinc-800 text-sm font-bold">
          <p>Total Project Capacity: {enteredProjectCapacity} WP</p>
          <p>
            Calculated Project Capacity:{" "}
            {modalId.split("-")[0] === "add"
              ? Number(calculatedProjectCapacity) +
                (Number(item.wattage) || 1) * (Number(item.quantity) || 0)
              : Number(calculatedProjectCapacity) -
                Number(itemDetails.project_capacity) +
                (Number(item.wattage) || 1) * (Number(item.quantity) || 0)}{" "}
            WP
          </p>
        </div>
      )}
      <div className="grid grid-cols-2 gap-x-2.5 gap-y-5 overflow-y-auto">
        {["Solar Inverter", "Solar Panels"].includes(projectHeadName) && (
          <Input
            type="text"
            label="Product Code"
            outerClass="col-span-2"
            className="w-[49%]"
            value={productCode}
            onChange={(e) => setProductCode(e.target.value)}
            onBlur={handleProductCode}
          />
        )}
        {/* only show manufacturer and model dropdown in case of Solar Inverter, Solar panels */}
        {["Solar Inverter", "Solar Panels"].includes(projectHeadName) && (
          <>
            <SelectForObjects
              margin={"0px"}
              height={"36px"}
              setselected={(value) => {
                const selected = manufacturers.find((m) => m.name === value);
                setItem((prev) => ({
                  ...prev,
                  Product: selected?.id,
                  Product_name: selected?.name,
                }));
                getProductList(selected?.id, existingItemIds);
              }}
              mandatory={true}
              selected={item.Product_name}
              options={manufacturers}
              optionName={"name"}
              placeholder="Select Manufacturer"
              dropdownLabel={"Manufacturer"}
            />

            <SelectForObjects
              margin={"0px"}
              height={"36px"}
              setselected={(value) => {
                const selected = productList.find((m) => m.name === value);
                setItem((prev) => ({
                  ...prev,
                  model: selected?.id,
                  model_name: selected?.name,
                  wattage: selected?.power_rating,
                  upload_datasheet: selected?.data_sheet,
                }));
              }}
              mandatory={true}
              selected={item.model_name}
              options={productList}
              optionName={"name"}
              placeholder={
                item.Product && item.Product !== ""
                  ? "Select Model"
                  : "Please Select Manufacturer"
              }
              dropdownLabel={"Model"}
            />
          </>
        )}

        {/* only show Product and Product Specification dropdown in case of BOS-Structure, BOS - Electrical */}
        {["BOS-Structure", "BOS-Electrical"].includes(projectHeadName) && (
          <>
            <Input
              type="text"
              label="Product"
              name="Product"
              mandatory={true}
              disabled={itemDetails ? true : false}
              value={item.Product}
              onChange={productNameHandler}
              error={errorMessage}
            />
            <Input
              type="text"
              onChange={valueHandler}
              name={"product_specification"}
              value={item.product_specification || ""}
              label={"Product Specifictaion"}
            />
          </>
        )}

        {/* only show Work Description and Scope of Work dropdown in case of Installation & Commissioning, Net Metering and Liasioning and Miscellaneous */}
        {[
          "Installation & Commissioning",
          "Net Metering and Liasioning",
          "Miscellaneous",
        ].includes(projectHeadName) && (
          <>
            <Input
              type="text"
              label="Work Description"
              name="Product"
              value={item.Product}
              onChange={productNameHandler}
              error={errorMessage}
            />
            <Input
              type="text"
              onChange={valueHandler}
              name={"scope_of_work"}
              value={item.scope_of_work}
              label={"Scope of Work"}
            />
          </>
        )}

        <span className="w-full flex gap-2 items-end">
          <Input type="file" onChange={handleFile} label={"Upload Datasheet"} />
          {item.upload_datasheet && item.upload_datasheet !== "" && (
            <FaEye
              size={15}
              className="cursor-pointer mb-3"
              onClick={() => window.open(item.upload_datasheet, "__blank")}
            />
          )}
        </span>

        {/* only show wattage in case of Solar Inverter, Solar panels */}
        {["Solar Inverter", "Solar Panels"].includes(projectHeadName) && (
          <Input
            type="number"
            onChange={valueHandler}
            value={item.wattage || 1}
            name={"wattage"}
            disabled={true}
            label={"Wattage (WP)"}
          />
        )}

        {/* only show Unit of Measurement dropdown in case of BOS-Structure, BOS - Electrical */}
        {["BOS-Structure", "BOS-Electrical"].includes(projectHeadName) && (
          <SelectForObjects
            margin={"0px"}
            height={"36px"}
            setselected={(value) =>
              setItem((prev) => ({
                ...prev,
                unit: value,
                unit_name: value,
              }))
            }
            selected={item.unit_name}
            options={units}
            optionName={"name"}
            mandatory={true}
            placeholder="Select Unit"
            dropdownLabel={"Unit Of Measurement"}
          />
        )}

        {/* only show Project Days and Expected Manpower in case of Installation & Commissioning, Net Metering and Liasioning and Miscellaneous, 
        otherwise display quantity */}
        {[
          "Installation & Commissioning",
          "Net Metering and Liasioning",
          "Miscellaneous",
        ].includes(projectHeadName) ? (
          <>
            <Input
              type="number"
              onChange={positiveValueHandler}
              value={item.project_days}
              mandatory={true}
              name={"project_days"}
              label={"Project Days"}
            />
            <Input
              type="number"
              onChange={positiveValueHandler}
              value={item.manpower_expected}
              mandatory={true}
              name={"manpower_expected"}
              label={"Manpower Expected"}
            />
          </>
        ) : (
          <Input
            type="number"
            onChange={positiveValueHandler}
            value={item.quantity || ""}
            mandatory={true}
            name={"quantity"}
            label={"Quantity"}
          />
        )}

        <Input
          type="text"
          value={
            ["Solar Panels"].includes(projectHeadName)
              ? (item.wattage || 1) * (item.quantity || 0)
              : totalProjectCapacity
          }
          name={"project_capacity"}
          disabled={true}
          label={"Project Capacity (WP)"}
        />

        <div className="w-full gap-2.5 flex flex-col">
          <label className="flex gap-[2px] text-xs capitalize text-zinc-800 font-bold tracking-tight">
            Considered Price <span className="text-red-600">*</span>
          </label>
          <span className="grid w-full grid-cols-2 gap-1 items-end">
            <Input
              type="number"
              onChange={positiveValueHandler}
              disabled={
                item.considered_price_unit && item.considered_price_unit !== ""
                  ? false
                  : true
              }
              value={item.considered_price || ""}
              name={"considered_price"}
            />

            <SelectForObjects
              margin={"0px"}
              height={"35px"}
              setselected={handleConsideredPriceUnit}
              selected={item.considered_price_unit}
              options={
                [
                  "Installation & Commissioning",
                  "Net Metering and Liasioning",
                  "Miscellaneous",
                ].includes(projectHeadName)
                  ? [
                      { name: "per manday" },
                      { name: "per WP" },
                      { name: "per Sq. Ft." },
                    ]
                  : [{ name: "per Piece" }, { name: "per WP" }]
              }
              optionName={"name"}
              placeholder="Select.."
            />
          </span>
        </div>

        {/* Installation & Commissioning,Net Metering and Liasioning,Miscellaneous:1) amount(per Manday)= considered price * manpower expected * project days; 
        2) amount(per WP) = considered price * total project capacity; 3) amount(per Square feet) = considered price * project area in sq. ft. */}
        {/* BOS-Structure,BOS-Electrical: 1)amount(per piece)= considered price * quantity; 2) amount(per WP) = considered price * total project capacity */}
        {/* Solar Panels: 1)amount(per piece) = considered price * quantity; 2)amount(per WP) = considered price * (wattage(if per WP unit is selected)) */}

        <Input
          type="number"
          value={item.amount}
          name={"amount"}
          disabled={true}
          label={"Amount (₹)"}
        />

        <Input
          type="number"
          onChange={positiveValueHandler}
          value={item.transportation || ""}
          name={"transportation"}
          mandatory={true}
          label={"Transaportation Cost"}
        />

        <Input
          type="text"
          onChange={valueHandler}
          name={"total_amount"}
          value={
            (Number(item.amount) || 0) + (Number(item.transportation) || 0)
          }
          disabled={true}
          label={"Total Amount"}
        />

        <Input
          outerClass="col-span-2"
          type="textarea"
          onChange={valueHandler}
          value={item.remark || ""}
          name={"remark"}
          label={"Remark"}
        />
      </div>
      {showWarningMessage && (
        <span className="text-red-500 text-xs">
          <strong>Warning!</strong>{" "}
          <p>
            <input
              className="mr-1 mt-1"
              type={"checkbox"}
              checked={ignoreWarning}
              onChange={(e) => setIgnoreWarning(e.target.checked)}
            />
            Kindly note that the Entered Project Capacity deviates from the
            aggregate of Project Capacities of all solar panels within the
            project. Please select the checkbox to proceed further.
          </p>
        </span>
      )}
    </FormModal>
  );
};

export default AddItemModal;
