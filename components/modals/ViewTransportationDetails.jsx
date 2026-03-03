import FormModal from "../shared/FormModal";
import { dateFormat } from "@/utils/formatter";
import { formatPrice } from "@/utils/numberHandler";
import { FaEye } from "react-icons/fa";

const TransportationDetails = ({ modalId, data }) => {
  const vehicleSize = [
    { value: "tata_ace_7_ft", name: "TATA ACE- 7 FT" },
    { value: "tata_bolero_10_ft", name: "TATA BOLERO- 10 FT" },
    { value: "14_ft", name: "14 FT" },
    { value: "17_ft", name: "17 FT" },
    { value: "19_ft", name: "19 FT" },
    { value: "20_ft", name: "20 FT" },
    { value: "22_ft", name: "22 FT" },
    { value: "24_ft", name: "24 FT" },
    { value: "28_ft", name: "28 FT" },
    { value: "32_ft_sxl", name: "32 FT SXL" },
    { value: "32_ft_mxl", name: "32 MXL" },
    { value: "40_ft_trailer)", name: "40 FT (TRAILER)" },
    { value: "40_ft_containers", name: "40 FT CONTAINERS" },
  ];

  return (
    <FormModal id={modalId} heading={"Transportation Details"}>
      <div className="grid grid-cols-2 gap-4 text-zinc-800">
        <div>
          <strong>Invoice Number: </strong>
          {data?.invoice_no}
        </div>
        <div>
          <strong>Dispatch Date: </strong>
          {dateFormat(data?.dispatch_date)}
        </div>
        <div>
          <strong>Transporter/Courier: </strong>
          {data?.transporter_name}
        </div>
        <div>
          <strong>Transportation Cost: </strong>₹{" "}
          {formatPrice(data?.transportation_cost)}
        </div>
        <div>
          <strong>Vehicle/Docket No.: </strong>
          {data?.vehicle_or_docket_no}
        </div>
        <div>
          <strong>Vehicle Size: </strong>
          {vehicleSize.filter((size) => size.value === data?.vehicle_size)[0]
            ?.name ?? "-"}
        </div>
        <div className="flex gap-2">
          <strong>LR No.: </strong>
          {data?.lr_no}{" "}
          {data.lr_doc !== "" && (
            <FaEye
              className="cursor-pointer mt-1"
              onClick={() => window.open(data?.lr_doc, "_blank")}
            />
          )}
        </div>
        <div className="flex gap-2">
          <strong>Eway Bill: </strong>
          {data?.eway_bill_no}
          {data.eway_bill_doc !== "" && (
            <FaEye
              className="cursor-pointer mt-1"
              onClick={() => window.open(data?.eway_bill_doc, "_blank")}
            />
          )}
        </div>
        <div className="col-span-2">
          <strong>Remark: </strong>
          {data?.remark}
        </div>
      </div>
    </FormModal>
  );
};

export default TransportationDetails;
