import React, { useState } from "react";
import FormModal from "../../shared/FormModal";
import Input from "../../formPage/Input";
import Button from "../../shared/Button";
import { FaPlusCircle } from "react-icons/fa";
import { LuX } from "react-icons/lu";
import { useModal } from "@/contexts/modal";
import { editBomItem } from "@/services/api";
import { requestHandler } from "@/services/ApiHandler";
import { toast } from "sonner";
import { useProject } from "@/contexts/project";

const SPModal = ({ items, id }) => {
  const { getProjectDetailsHandler } = useProject();
  const [sp, setSp] = useState("");
  const { openModal, closeModal } = useModal();

  const estimatedPrices = items.map((item) => item.estimated_cost_price);

  function calculateSellingPrices(estimatedPrices, sp) {
    // Convert estimated prices to numbers
    const estimatedPricesNumbers = estimatedPrices.map((price) =>
      Number(price) ? parseFloat(price) : 0
    );

    // Validate if all estimated prices are valid numbers
    if (estimatedPricesNumbers.some(isNaN)) {
      return "Invalid estimated prices";
    }

    // Calculate total estimated cost
    const totalEstimatedCost = estimatedPricesNumbers.reduce(
      (sum, price) => sum + price,
      0
    );

    // Set the desired selling price for the whole section
    const sellingPriceForSection = sp; // Replace with your desired selling price

    // Calculate ratios based on total estimated cost
    const ratios = estimatedPricesNumbers.map(
      (price) => price / totalEstimatedCost
    );

    // Calculate selling prices for each item based on ratios
    const sellingPrices = ratios.map((ratio) => {
      const price = ratio * sellingPriceForSection;
      return parseFloat(price.toFixed(2)); // Limit to 2 decimal places
    });
    const finalitems = [...items];

    for (let index = 0; index < items.length; index++) {
      const item = { ...finalitems[index] };
      finalitems[index] = { ...item, selling_price: sellingPrices[index] };
    }

    return finalitems;
  }
  const update = async () => {
    const finalItems = calculateSellingPrices(estimatedPrices, sp);
    for (let index = 0; index < finalItems.length; index++) {
      await requestHandler(
        async () =>
          await editBomItem({
            ...finalItems[index],
            estimated_cost_price: finalItems[index].estimated_cost_price
              ? Number(finalItems[index].estimated_cost_price)
              : null,
            cost_price: finalItems[index].cost_price
              ? Number(finalItems[index].cost_price)
              : null,
          }),
        null,
        (data) => {
          toast.success(`${finalItems[index].item_name} Updated Successfully`);
        },
        toast.error
      );
    }
  };

  const onSubmit = async () => {
    await update();
    closeModal(id);
    await getProjectDetailsHandler();
  };

  return (
    <FormModal
      id={id}
      ctaText={"Set Selling Price"}
      onSubmit={onSubmit}
      heading={"Set Selling Price"}
    >
      <Input
        onChange={(e) => setSp(e.target.value)}
        name="sp"
        value={sp}
        type={"number"}
        label={"Enter Selling Price"}
      />
    </FormModal>
  );
};

export default SPModal;
