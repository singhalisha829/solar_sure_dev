import { useEffect, useState } from "react";
import Input from "../formPage/Input";
import EditableTable from "./EditableTable";
import { SelectForObjects } from "../formPage/MultiSelectDropdown/MultiSelectDropdown";
import { convertToWords, formatPrice } from "@/utils/numberHandler";

const CostEstimation = ({
  charges,
  sectionDetails,
  onChangeCharge,
  totalProjectCapacity,
  poValueWithoutGst,
}) => {
  const [differentCharges, setDifferentCharges] = useState({
    ...charges,
    total_amount_perwp: "",
  });
  const profitMarginUnits = [
    { name: "per WP wise", value: "per_wp" },
    { name: "percentage wise", value: "percentage" },
    { name: "total amount wise", value: "total_amount" },
  ];
  const freightChargesUnits = [
    { name: "per WP wise", value: "per_wp" },
    { name: "total amount wise", value: "total_amount" },
  ];

  useEffect(() => {
    let newList = [...sectionDetails],
      sum = 0;
    //calculate total cost sum of all products in all sections
    newList.map((element) => (sum += Number(element.cost)));
    // setDifferentCharges({ ...differentCharges, total_amount_perwp: sum });
    handleCharges(
      { ...differentCharges, total_amount_perwp: sum },
      differentCharges.profit_margin_unit,
      differentCharges.freight_charges_unit
    );
  }, []);

  const tableHeaderList = (sectionName) => {
    if (["Solar Inverter", "Solar Panels"].includes(sectionName)) {
      return [
        { name: "MANUFACTURER", key: "Product_name", minWidth: "160px" },
        {
          name: "MODEL",
          key: "model_name",
          keyValue: "model",
          minWidth: "100px",
        },
        {
          name: "WATTAGE (WP)",
          key: "wattage",
          displayType: "amount",
          minWidth: "120px",
        },
        {
          name: "QUANTITY",
          key: "quantity",
          displayType: "amount",
          minWidth: "80px",
        },
        {
          name: (
            <span>
              DC PROJECT
              <br /> CAPACITY (WP)
            </span>
          ),
          displayType: "amount",
          key: "project_capacity",
          minWidth: "120px",
        },
        {
          name: (
            <span>
              CONSIDERED
              <br /> PRICE
            </span>
          ),
          key: "considered_price",
          key2: "considered_price_unit",
          displayType: "price",
          minWidth: "90px",
        },
        {
          name: "AMOUNT (₹)",
          key: "amount",
          displayType: "price",
          minWidth: "100px",
        },
        {
          name: "TRANSPORTATION (₹)",
          displayType: "price",
          key: "transportation",
          minWidth: "150px",
        },
        {
          name: (
            <span>
              TOTAL
              <br /> AMOUNT (₹)
            </span>
          ),
          key: "total_amount",
          displayType: "price",
          minWidth: "120px",
        },
      ];
    } else if (["BOS-Structure", "BOS-Electrical"].includes(sectionName)) {
      return [
        { name: "PRODUCT", key: "Product", minWidth: "160px" },
        {
          name: (
            <span>
              PRODUCT
              <br /> SPECIFICATION
            </span>
          ),
          key: "product_specification",
          minWidth: "100px",
        },
        {
          name: (
            <span>
              UNIT OF
              <br /> MEASUREMENT
            </span>
          ),
          key: "unit_name",
          keyValue: "unit",
          minWidth: "100px",
        },
        { name: "QUANTITY", key: "quantity", minWidth: "80px" },
        {
          name: (
            <span>
              PROJECT
              <br /> CAPACITY (WP)
            </span>
          ),
          type: "fixed-value",
          displayValue: totalProjectCapacity,
          minWidth: "120px",
        },
        {
          name: (
            <span>
              CONSIDERED
              <br /> PRICE
            </span>
          ),
          key: "considered_price",
          displayType: "price",
          key2: "considered_price_unit",
          minWidth: "90px",
        },
        {
          name: "AMOUNT (₹)",
          key: "amount",
          displayType: "price",
          minWidth: "100px",
        },
        {
          name: "TRANSPORTATION (₹)",
          key: "transportation",
          displayType: "price",
          minWidth: "150px",
        },
        {
          name: (
            <span>
              TOTAL
              <br /> AMOUNT (₹)
            </span>
          ),
          key: "total_amount",
          displayType: "price",
          minWidth: "120px",
        },
      ];
    } else {
      return [
        {
          name: "WORK DESCRIPTION",
          key: "Product_name",
          keyValue: "Product",
          minWidth: "160px",
        },
        {
          name: "SCOPE OF WORK",
          key: "scope_of_work",
          minWidth: "100px",
        },
        {
          name: (
            <span>
              PROJECT
              <br /> DAYS
            </span>
          ),
          key: "project_days",
          displayType: "amount",
          minWidth: "80px",
        },
        {
          name: (
            <span>
              MANPOWER
              <br /> EXPECTED
            </span>
          ),
          key: "manpower_expected",
          displayType: "amount",
          minWidth: "80px",
        },
        {
          name: (
            <span>
              PROJECT
              <br /> CAPACITY (WP)
            </span>
          ),
          type: "fixed-value",
          displayValue: totalProjectCapacity,
          minWidth: "120px",
        },
        {
          name: (
            <span>
              CONSIDERED
              <br /> PRICE
            </span>
          ),
          key: "considered_price",
          key2: "considered_price_unit",
          displayType: "price",
          minWidth: "90px",
        },
        {
          name: "AMOUNT (₹)",
          key: "amount",
          displayType: "price",
          minWidth: "100px",
        },
        {
          name: "TRANSPORTATION (₹)",
          key: "transportation",
          displayType: "price",
          minWidth: "150px",
        },
        {
          name: (
            <span>
              TOTAL
              <br /> AMOUNT (₹)
            </span>
          ),
          key: "total_amount",
          displayType: "price",
          minWidth: "120px",
        },
      ];
    }
  };

  function positiveValueHandler(e, key, unit, freightUnit) {
    const inputValue = e.target.value;
    const regex = /^(?:\d+|\d*\.\d+)$/;
    if (regex.test(inputValue) || inputValue === "") {
      handleCharges(
        { ...differentCharges, [key]: e.target.value },
        unit,
        freightUnit
      );
    }
  }
  const handleCharges = (charges, profitMarginUnit = "", freightUnit = "") => {
    let net_total =
      Number(charges.total_amount_perwp) + Number(charges.other_charges);
    let profit_margin = 0,
      total_freight_charges = 0;

    //calculate freight charges
    if (freightUnit === "per_wp") {
      total_freight_charges = charges.freight_charges * totalProjectCapacity;
      net_total = net_total + total_freight_charges;
    } else if (freightUnit === "total_amount") {
      total_freight_charges = Number(charges.freight_charges);
      net_total = net_total + total_freight_charges;
    }

    //calculate profit margin
    // if (profitMarginUnit === "per_wp") {
    //   profit_margin = charges.profit_margin * totalProjectCapacity;
    //   total = total + profit_margin;
    // } else if (profitMarginUnit === "percentage") {
    //   profit_margin = (total * charges.profit_margin) / 100;
    //   total = total + profit_margin;
    // } else if (profitMarginUnit === "total_amount") {
    //   profit_margin = Number(charges.profit_margin);
    //   total = total + profit_margin;
    // }
    profit_margin = Number(poValueWithoutGst || 0) - Number(net_total || 0);

    setDifferentCharges({
      ...charges,
      total_amount: poValueWithoutGst,
      net_amount: net_total,
      total_profit_margin: profit_margin,
      profit_margin_unit: "total_amount",
      total_freight_charges: total_freight_charges,
      freight_charges_unit: freightUnit,
    });

    onChangeCharge({
      ...charges,
      total_amount: poValueWithoutGst,
      net_amount: net_total,
      total_profit_margin: profit_margin,
      profit_margin_unit: profitMarginUnit,
      freight_charges_unit: freightUnit,
    });
  };

  return (
    <>
      <h1 className="font-bold">Cost Estimation</h1>
      <div className="rounded border-1 border-primary-light-5 text-xs">
        {sectionDetails?.length > 0 &&
          sectionDetails.map((section, sectionIndex) => {
            if (section.product_details.length > 0) {
              return (
                <div className="flex" key={sectionIndex}>
                  <div className="w-[20%] ml-4 mt-[3.5rem] h-full flex flex-col justify-center">
                    <span className="font-bold">{section.section}</span>
                  </div>
                  <div className="w-[80%] overflow-auto mb-3">
                    <EditableTable
                      isEditMode={false}
                      rows={section.product_details}
                      isManufacturerDropdown={[
                        "Solar Inverter",
                        "Solar Panels",
                      ].includes(section.section)}
                      tableHeader={section.section}
                      columns={tableHeaderList(section.section)}
                    />
                  </div>
                </div>
              );
            }
          })}
        <span className="w-full h-[3rem] font-bold mb-2 pl-4 pr-8 bg-primary-light-10 flex items-center justify-between text-primary">
          Total (PER WP)
          <span>
            ₹{" "}
            {formatPrice(
              differentCharges.total_amount_perwp / totalProjectCapacity
            )}{" "}
            / WP
          </span>
        </span>

        <span className="w-full h-[3rem] font-bold pl-4 pr-8 bg-primary-light-10 flex items-center justify-between text-primary">
          Total
          <span>₹ {formatPrice(differentCharges.total_amount_perwp)}</span>
        </span>

        <span className="w-full h-[3rem] font-bold pl-4 pr-8 bg-primary-light-5 flex items-center justify-between">
          Freight Charges
          <span className="flex gap-2  font-normal items-center">
            ₹{" "}
            <Input
              type="number"
              className="w-[7rem] self-end"
              value={differentCharges.freight_charges}
              disabled={
                differentCharges.freight_charges_unit === "" ? true : false
              }
              onChange={(e) =>
                positiveValueHandler(
                  e,
                  "freight_charges",
                  differentCharges.profit_margin_unit,
                  differentCharges.freight_charges_unit
                )
              }
            />
            <SelectForObjects
              margin={"0px"}
              height={"35px"}
              className="w-[8rem]"
              setselected={(name, id) => {
                handleCharges(
                  differentCharges,
                  differentCharges.profit_margin_unit,
                  id
                );
              }}
              selected={
                freightChargesUnits.find(
                  (unit) => unit.value == differentCharges.freight_charges_unit
                )?.name
              }
              options={freightChargesUnits}
              optionName={"name"}
              optionID={"value"}
              placeholder="Select.."
            />
          </span>
        </span>

        <div className="bg-primary-light-5 pb-2 pl-4 pr-8">
          <span className="w-full h-[3rem] font-bold   flex items-center justify-between">
            Other Charges
            <span className="flex gap-2 items-center w-[7rem]">
              ₹{" "}
              <Input
                type="number"
                className="self-end"
                value={differentCharges.other_charges}
                onChange={(e) =>
                  positiveValueHandler(
                    e,
                    "other_charges",
                    differentCharges.profit_margin_unit,
                    differentCharges.freight_charges_unit
                  )
                }
              />
            </span>
          </span>
          <Input
            type="textarea"
            value={differentCharges.remark || ""}
            onChange={(e) => {
              setDifferentCharges({
                ...differentCharges,
                remark: e.target.value,
              });
              onChangeCharge({
                ...charges,
                remark: e.target.value,
              });
            }}
            label={"Remark"}
          />
        </div>

        <span className="w-full h-[3rem] font-bold pl-4 pr-8 bg-primary-light-10 flex items-center justify-between text-primary">
          Net Amount
          <span>₹ {formatPrice(differentCharges.net_amount)}</span>
        </span>

        <span className="w-full h-[3rem] font-bold pl-4 pr-8 bg-primary-light-5 flex items-center justify-between">
          Porfit Margin
          <span className="flex gap-2 items-center font-normal">
            ₹ {formatPrice(charges.total_profit_margin)}
            {/* <Input
              type="number"
              disabled={
                differentCharges.profit_margin_unit === "" ? true : false
              }
              className="self-end w-[7rem]"
              value={differentCharges.profit_margin}
              onChange={(e) =>
                positiveValueHandler(
                  e,
                  "profit_margin",
                  differentCharges.profit_margin_unit,
                  differentCharges.freight_charges_unit
                )
              }
            />{" "}
            <SelectForObjects
              margin={"0px"}
              height={"35px"}
              className="w-[8rem]"
              setselected={(name, id) => {
                handleCharges(
                  differentCharges,
                  id,
                  differentCharges.freight_charges_unit
                );
              }}
              selected={
                profitMarginUnits.find(
                  (unit) => unit.value == differentCharges.profit_margin_unit
                )?.name
              }
              options={profitMarginUnits}
              optionName={"name"}
              optionID={"value"}
              placeholder="Select.."
            /> */}
          </span>
        </span>

        <span className="w-full h-[3rem] font-bold pl-4 pr-8 bg-primary-light-10 flex items-center justify-between text-primary">
          Total Amount
          <span className=" text-end">
            ₹ {formatPrice(poValueWithoutGst)}
            <br />
            {convertToWords(poValueWithoutGst)}
          </span>
        </span>
      </div>
    </>
  );
};

export default CostEstimation;
