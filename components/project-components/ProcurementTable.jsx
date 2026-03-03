import { Badge } from "../shared/Badge";
import { dateFormat } from "@/utils/formatter";
import { formatPrice } from "@/utils/numberHandler";
import Input from "../formPage/Input";
import { useRouter } from "next/router";
import { cn } from "@/utils/utils";

const ProcurementTable = ({
  columns,
  rows,
  onRowClick,
  parentTableHeader,
  onChangeHandler,
  ...restProps
}) => {
  const { className } = restProps;
  const router = useRouter();
  const { tab } = router.query;

  return (
    <table className={`w-full border-collapse grow ${className}`}>
      <thead className="sticky top-0 z-[1]">
        <tr className=" bg-primary-light-10  border-b-2 border-b-white text-primary">
          <th
            className={`px-4 py-3 w-[4rem] border-r-2 border-r-white sticky left-0 bg-inherit `}
          ></th>
          {parentTableHeader.map((column, index) => {
            return (
              <th
                key={index}
                className={`px-4 py-3 border-r-2 border-r-white text-xs text-center font-semibold uppercase ${index === 0 ? "sticky left-[4.1rem] bg-inherit" : ""} `}
                colSpan={column.colSpan}
              >
                {column.name}
              </th>
            );
          })}
        </tr>

        <tr className=" bg-primary-light-10 text-primary text-left">
          <th
            className={`px-4 py-3 w-[4rem] border-r-2 font-semibold text-xs uppercase border-r-white sticky left-0 bg-inherit `}
          >
            Sr.No.
          </th>
          {columns.map((column, index) => {
            return (
              <th
                key={index}
                className={`px-4 py-3 border-r-2 border-r-white text-xs font-semibold uppercase ${index === 0 ? "sticky left-[4.1rem] bg-inherit" : ""} `}
                style={{
                  width: column.width,
                  minWidth: column.width,
                }}
              >
                <div className="flex items-center gap-1.5">
                  <span className="flex items-center gap-1.5">
                    {column.name}
                  </span>
                </div>
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 && (
          <tr className="relative">
            <td colSpan={columns.length} className="text-center p-4">
              {restProps.emptyTableMessage ?? "No matching records found"}
            </td>
          </tr>
        )}
        {rows.map((row, index) => {
          return (
            <tr
              key={index}
              onClick={() => (onRowClick ? onRowClick(row) : {})}
              className={`${onRowClick ? "cursor-pointer" : ""} `}
            >
              <td
                className={cn(
                  `px-4 py-3 text-xs w-[4rem] max-w-[4rem] min-w-[4rem] font-semibold uppercase sticky left-0 bg-inherit`,
                  tab === "Packing List" &&
                    row?.bom_items_quantity_left_after_booking?.quantity == 0
                    ? "bg-zinc-200"
                    : index % 2 != 0
                      ? "bg-primary-light-5"
                      : "bg-white"
                )}
              >
                <div className="flex items-center text-zinc-600 text-xs font-semibold capitalize">
                  {`${index + 1}.`}
                </div>
              </td>
              {columns.map((column, innerIndex) => {
                let display_content = null;
                if (column.key === "status") {
                  display_content = (
                    <Badge
                      variant={row[column.key]
                        .replaceAll("-", "")
                        .toLowerCase()}
                    >
                      {row[column.key] !== "" ? row[column.key] : "-"}
                    </Badge>
                  );
                } else if (column.type === "quantity_object") {
                  display_content = (
                    <div className="flex items-center gap-2.5 text-zinc-600 text-xs font-semibold capitalize">
                      {row[column.key]?.quantity ?? 0}{" "}
                      {row[column.key]?.unit ?? ""}
                    </div>
                  );
                } else if (column.type === "date") {
                  display_content = (
                    <div className="flex items-center gap-2.5 text-zinc-600 text-xs font-semibold capitalize">
                      {row[column.key] !== ""
                        ? dateFormat(row[column.key])
                        : "-"}
                    </div>
                  );
                } else if (column.displayType === "price") {
                  display_content = (
                    <div className="flex items-center text-zinc-600 text-xs font-semibold capitalize">
                      {formatPrice(row[column.key])}
                    </div>
                  );
                } else if (column.type === "packing_list_quantity_field") {
                  display_content = (
                    <div className="flex items-center gap-2.5 text-zinc-600 text-xs font-semibold capitalize">
                      <Input
                        type={"number"}
                        value={row[column.key]}
                        className="disabled:cursor-not-allowed"
                        disabled={
                          restProps.selectedVendor ===
                          "Ornate Agencies Private Limited"
                            ? row.left_inventory_after_booking.split(" ")[0] <=
                              0
                            : false
                        }
                        onChange={(e) => {
                          let value = e.target.value;
                          if (
                            value < 0 ||
                            value >
                              Number(
                                row?.bom_items_quantity_left_after_booking
                                  ?.quantity || 0
                              ) ||
                            (restProps.selectedVendor ===
                              "Ornate Agencies Private Limited" &&
                              value >
                                Number(
                                  row.left_inventory_after_booking.split(" ")[0]
                                ))
                          ) {
                            onChangeHandler(index, column.key, "");
                          } else {
                            onChangeHandler(index, column.key, e.target.value);
                          }
                        }}
                      />
                    </div>
                  );
                } else if (["number", "text"].includes(column.type)) {
                  display_content = (
                    <div className="flex items-center gap-2.5 text-zinc-600 text-xs font-semibold capitalize">
                      <Input
                        type={column.type}
                        value={row[column.key]}
                        onChange={(e) => {
                          let value = e.target.value;
                          if (column.type === "number" && value < 0) {
                            onChangeHandler(index, column.key, "");
                          } else {
                            onChangeHandler(index, column.key, e.target.value);
                          }
                        }}
                      />
                    </div>
                  );
                } else {
                  display_content = (
                    <div className="flex items-center text-zinc-600 text-xs font-semibold capitalize">
                      {`${row[column.key] ?? "-"} ${row[column.key2] ?? ""}`}
                    </div>
                  );
                }
                return (
                  <td
                    key={innerIndex}
                    className={cn(
                      `w-[10%] px-4 border-r-2 border-r-primary-light-10 py-3`,
                      innerIndex === 0 ? "sticky left-[4.1rem] bg-inherit" : "",
                      tab === "Packing List" &&
                        row?.bom_items_quantity_left_after_booking?.quantity ==
                          0
                        ? "bg-zinc-200"
                        : index % 2 != 0
                          ? "bg-primary-light-5"
                          : "bg-white"
                    )}
                    style={{
                      width: column.width,
                      minWidth: column.width,
                    }}
                  >
                    {display_content}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default ProcurementTable;
