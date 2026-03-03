import { useState, useEffect } from "react";
import ProjectItemTable from "./ProjectItemTable";
import Button from "../shared/Button";
import { formatPrice } from "@/utils/numberHandler";
import { requestHandler } from "@/services/ApiHandler";
import { fetchPOExtraCharges } from "@/services/api/index";
import { toast } from "sonner";
import { FaPlusCircle } from "react-icons/fa";
import dynamic from "next/dynamic";
import { useModal } from "@/contexts/modal";

const AddExtraCharges = dynamic(
  () => import("@/components/modals/AddExtraCharges")
);

const PurchaseOrderCostEstimation = ({
  poItemCharges,
  onBackClick,
  extraPoCharges,
  handleOnNextClick,
}) => {
  const { openModal } = useModal();
  const [poCharges, setPoCharges] = useState(poItemCharges);
  const [errorRows, setErrorRows] = useState([]);
  const [extraChargesAmount, setExtraChargesAmount] = useState({
    total_po_taxable_amount: 0,
    total_po_tax_amount: 0,
    total_po_amount: 0,
  });
  const [extraCharges, setExtraCharges] = useState(
    extraPoCharges.length == 0
      ? [
          {
            charges: "",
            amount: "",
            tax_rate: "",
            tax_amount: "",
            total_amount: "",
            description: "",
            charges_name: "",
          },
        ]
      : extraPoCharges
  );
  const [extraChargesList, setExtraChargesList] = useState([]);

  useEffect(() => {
    fetchChargesList();
  }, []);

  const fetchChargesList = async () => {
    await requestHandler(
      async () => await fetchPOExtraCharges(),
      null,
      async (data) => {
        setExtraChargesList(data.data.output);
      },
      toast.error
    );
  };

  const tableHeader = [
    {
      name: "Extra Charges",
      key: "charges",
      type: "dropdown",
      width: "100px",
      dropdownValueKey: "charges_name",
      options: extraChargesList.filter(
        (charge) =>
          !extraCharges.some(
            (selectedCharge) => selectedCharge.charges == charge.id
          )
      ),
      optionId: "id",
      optionName: "name",
      canAdd: true,
      toAddClick: () => {
        openModal("add-extra-charges");
      },
    },
    {
      name: "Charges Amount",
      type: "number",
      key: "amount",
      width: "150px",
    },
    {
      name: "Tax(%)",
      key: "tax_rate",
      type: "number",
      width: "80px",
    },
    {
      name: "Tax Amount(₹)",
      key: "tax_amount",
      width: "120px",
    },
    {
      name: "Total Amount(₹)",
      key: "total_amount",
      width: "150px",
    },
    {
      name: "Description",
      key: "description",
      type: "text",
    },
  ];

  const valueHandler = (key, value, index) => {
    let list = extraCharges;

    if (key === "charges") {
      list[index]["charges_name"] = extraChargesList.filter(
        (charge) => charge.id == value
      )[0]?.name;
    }
    list[index][key] = value;

    list[index]["tax_amount"] =
      (list[index]["amount"] * Number(list[index]["tax_rate"] || 0)) / 100 || 0;
    list[index]["total_amount"] =
      Number(list[index]["amount"] || 0) +
      Number(list[index]["tax_amount"] || 0);
    setExtraCharges([...list]);

    //calculate total extra charges
    let extra_charge_taxable_amount = 0,
      extra_charge_tax_amount = 0,
      extra_charge_amount = 0;
    list.map((charge) => {
      extra_charge_taxable_amount += Number(charge.amount || 0);
      extra_charge_tax_amount += Number(charge.tax_amount || 0);
      extra_charge_amount += Number(charge.total_amount || 0);
    });

    // calculate total po amount
    let total_taxable_amount = poItemCharges.total_po_taxable_amount,
      total_tax_amount = poItemCharges.total_po_tax_amount,
      total_amount = poItemCharges.total_po_amount;
    list.map((charge) => {
      total_taxable_amount += Number(charge.amount || 0);
      total_tax_amount += Number(charge.tax_amount || 0);
      total_amount += Number(charge.total_amount || 0);
    });

    setPoCharges({
      total_po_taxable_amount: total_taxable_amount,
      total_po_tax_amount: total_tax_amount,
      total_po_amount: total_amount,
    });
    setExtraChargesAmount({
      total_po_taxable_amount: extra_charge_taxable_amount,
      total_po_tax_amount: extra_charge_tax_amount,
      total_po_amount: extra_charge_amount,
    });
  };

  const onAddNewRow = () => {
    setExtraCharges([
      ...extraCharges,
      {
        charges: "",
        amount: "",
        tax_rate: "",
        tax_amount: "",
        total_amount: "",
        description: "",
        charges_name: "",
      },
    ]);
  };

  const onNextClick = () => {
    let list = [];
    extraCharges.map((charge, index) => {
      if (
        (charge.charges ?? "") === "" &&
        (charge.amount ?? "") === "" &&
        (charge.tax_rate ?? "") === ""
      ) {
        extraCharges.splice(index, 1);
      } else if (!charge.charges || !charge.amount || !charge.tax_rate) {
        list.push(charge);
      }
    });

    if (list.length > 0) {
      setErrorRows(list);
      toast.error("Please provide complete details for the highlighted items!");
      return;
    }
    setErrorRows([]);
    handleOnNextClick(extraCharges, poCharges);
  };

  return (
    <div className="relative h-full">
      <div className="flex justify-between">
        <h2 className="font-semibold">Extra Charges</h2>
        <Button
          onClick={onAddNewRow}
          variant={"inverted"}
          customText={"#F47920"}
          className="bg-orange-400/10 text-orange-500 px-2 hover:bg-orange-600/10 "
        >
          <FaPlusCircle />
          Add Extra Charge
        </Button>
      </div>
      <div className="overflow-auto mt-2">
        <ProjectItemTable
          columns={tableHeader}
          rows={extraCharges}
          isEditMode={true}
          valueHandler={valueHandler}
          errorRows={errorRows}
          errorRowIdName={"charges"}
          disableStickyRows={true}
        />
      </div>

      <div className="w-[90%] border-1 mx-auto my-6"></div>

      <div className="flex">
        <div className="grid grid-cols-2 gap-6 my-2 w-1/2 text-xs text-zinc-800">
          <strong className="col-span-2 text-base text-primary">
            Extra Charges
          </strong>
          <label className=" gap-[2px] font-bold">Total Taxable Amount:</label>
          {formatPrice(extraChargesAmount?.total_po_taxable_amount || 0)}
          <label className=" gap-[2px] font-bold">Total Tax Amount:</label>
          {formatPrice(extraChargesAmount?.total_po_tax_amount || 0)}
          <label className=" gap-[2px] font-bold">Total PO Amount:</label>
          {formatPrice(extraChargesAmount?.total_po_amount || 0)}
        </div>
        <div className="grid grid-cols-2 gap-6 my-2 w-1/2 text-xs text-zinc-800">
          <strong className="col-span-2 text-base text-primary">
            Project Item Charges
          </strong>
          <label className=" gap-[2px] font-bold">Total Taxable Amount:</label>
          {formatPrice(poItemCharges?.total_po_taxable_amount || 0)}
          <label className=" gap-[2px] font-bold">Total Tax Amount:</label>
          {formatPrice(poItemCharges?.total_po_tax_amount || 0)}
          <label className=" gap-[2px] font-bold">Total PO Amount:</label>
          {formatPrice(poItemCharges?.total_po_amount || 0)}
        </div>
      </div>
      <div className="w-[90%] border-1 mx-auto my-6"></div>

      <div className="grid grid-cols-2 gap-6 mb-2 mt-4 w-1/2 text-xs text-zinc-800">
        <strong className="col-span-2 text-base text-primary">
          Total Charges
        </strong>
        <label className=" gap-[2px] font-bold">Total Taxable Amount:</label>
        {formatPrice(poCharges?.total_po_taxable_amount || 0)}
        <label className=" gap-[2px] font-bold">Total Tax Amount:</label>
        {formatPrice(poCharges?.total_po_tax_amount || 0)}
        <label className=" gap-[2px] font-bold">Total PO Amount:</label>
        {formatPrice(poCharges?.total_po_amount || 0)}
      </div>

      <div className="absolute bottom-0 w-full flex justify-end gap-4">
        <Button
          className=" h-[2rem] w-small"
          onClick={onBackClick}
          customText={"#9E9E9E"}
          variant={"gray"}
        >
          Back
        </Button>
        <Button className=" h-[2rem] w-small" onClick={() => onNextClick()}>
          Next
        </Button>
      </div>
      <AddExtraCharges
        modalId={"add-extra-charges"}
        onSuccessfullSubmit={fetchChargesList}
      />
    </div>
  );
};
export default PurchaseOrderCostEstimation;
