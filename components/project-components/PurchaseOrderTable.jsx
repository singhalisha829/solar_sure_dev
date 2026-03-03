import { SelectForObjects } from "../formPage/MultiSelectDropdown/MultiSelectDropdown";
import { useManufacturers } from "@/contexts/manufacturers";
import { useRouter } from "next/router";
import Input from "../formPage/Input";
import { addCommasToNumber } from "@/utils/numberHandler";
import { handleFileUpload } from "@/utils/documentUploadHandler";
import { toast } from "sonner";

const PurchaseOrderTable = ({
  columns,
  rows,
  onRowClick,
  onEditSuccess,
  isEditMode,
  valueHandler,
  errorRowIdName = "id",
  showMenu,
  onMenuOptionClicked,
  secondaryTableHeader,
  ...restProps
}) => {
  const { className } = restProps;

  return (
    <div className={` w-full  ${className ? className : ""}`}>
      <table className="w-full border-collapse grow">
        <thead className="sticky top-0 z-30">
          {/* primary header */}
          <tr className=" bg-primary-light-10 text-primary text-left">
            <th
              className={`px-4 py-3 border-b-2 border-r-2 border-white text-xs w-[4rem] max-w-[4rem] min-w-[4rem] font-semibold uppercase sticky left-0 bg-inherit z-10 `}
            >
              Sr.No.
            </th>
            {columns.map((column, index) => {
              return (
                <th
                  key={index}
                  className={`px-4 py-3 border-b-2 border-r-2 border-white ${column.colSpan > 1 ? "text-center" : "text-left"}  text-xs font-semibold uppercase relative 
                      ${index === 0 ? "sticky left-[4rem] bg-inherit z-10" : ""}`}
                  style={{
                    width: column.width,
                    minWidth: column.width,
                  }}
                  colSpan={column.colSpan}
                  onClick={() => column.sortable && requestSort(column.key)}
                >
                  {column.name}
                </th>
              );
            })}
          </tr>

          {/* secondary header */}
          <tr className=" bg-primary-light-10 text-primary text-left">
            <th
              className={`px-4 py-3 border-r-2 border-white text-xs w-[4rem] max-w-[4rem] min-w-[4rem] font-semibold uppercase sticky left-0 bg-inherit z-10 `}
            ></th>
            {secondaryTableHeader.map((column, index) => {
              return (
                <th
                  key={index}
                  className={`px-4 py-3 text-xs border-r-2 border-white font-semibold uppercase relative 
                      ${index === 0 ? "sticky left-[4rem] bg-inherit z-10" : ""}`}
                  style={{
                    width: column.width,
                    minWidth: column.width,
                  }}
                  onClick={() => column.sortable && requestSort(column.key)}
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
          {rows.length !== 0 ? (
            rows.map((row, index) => (
              <Row
                onEditSuccess={onEditSuccess}
                index={index}
                columns={secondaryTableHeader}
                onRowClick={onRowClick}
                row={row}
                key={index}
                valueHandler={valueHandler}
                errorRows={restProps.errorRows}
                errorRowIdName={errorRowIdName}
                projectCapacity={restProps.projectCapacity}
                onClickEdit={restProps.onClickEdit}
              />
            ))
          ) : (
            <tr className="relative">
              <td colSpan={columns.length} className="text-center p-4">
                No Items
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

function Row({
  row,
  onRowClick,
  index,
  valueHandler,
  columns,
  errorRows,
  errorRowIdName,
  projectCapacity,
}) {
  const router = useRouter();
  const { tab } = router.query;
  const { manufacturers } = useManufacturers();

  const taxList = [
    { name: "5" },
    { name: "12" },
    { name: "18" },
    { name: "28" },
  ];

  const uploadDocument = async (e, index, key) => {
    const response = await handleFileUpload(e.target.files[0]);
    if (response.type === "success") {
      valueHandler(key, response.data, index);
    } else {
      toast.error(response.error || "Oops! Something went wrong");
    }
  };

  return (
    <tr
      onClick={() => (onRowClick ? onRowClick(row) : {})}
      className={`relative ${index % 2 != 0 ? "bg-primary-light-5" : "bg-white"}`}
    >
      <td
        className={`px-4 py-3 border-b-2 border-r-2 border-primary-light-5 text-xs w-[4rem] max-w-[4rem] min-w-[4rem] font-semibold uppercase z-20 sticky left-0 bg-inherit ${index % 2 != 0 ? "bg-primary-light-5" : "bg-white"}`}
      >
        <div className="flex items-center text-zinc-600 text-xs font-semibold capitalize">
          {`${index + 1}.`}
        </div>
      </td>
      {columns.map((column, columnIndex) => {
        let editable_content = null;
        if (column.type === "dropdown") {
          editable_content = (
            <SelectForObjects
              height={"36px"}
              setselected={(name, value) =>
                valueHandler(column.key, value, index)
              }
              selected={row[column.dropdownValueKey]}
              options={column.options}
              optionName={column.optionName}
              optionID={column.optionId}
              canAdd={column.canAdd}
              toAddName={column.name}
              onAddClick={() => column.toAddClick()}
            />
          );
        } else if (column.type === "quantity_object") {
          editable_content = `${row[column.key]?.quantity ?? "0"} ${row[column.key]?.unit ?? row.unit_symbol ?? ""}`;
        } else if (
          (column.key === "quantity" || column.key === "quantity_new") &&
          tab === "Engineering" &&
          column.type !== "create-bom-header"
        ) {
          let quantity_value =
            column.key === "quantity_new"
              ? row[column.key].split(" ")[0]
              : row[column.key];
          let unit_value =
            column.key === "quantity_new"
              ? row[column.key].split(" ")[1]
              : row.uom;

          editable_content = (
            <>
              <Input
                type="number"
                name={column.key}
                disabled={row.bbu_unit_price !== null}
                onChange={(e) =>
                  valueHandler("quantity", e.target.value, index)
                }
                outerClass="mr-2"
                value={quantity_value}
              />
              {unit_value}
            </>
          );
        } else if (
          column.key === "quantity" &&
          tab !== "Engineering" &&
          !["upload_invoice_quantity", "number"].includes(column.type)
        ) {
          editable_content = `${row[column.key]?.quantity ?? "0"} ${row[column.key]?.unit ?? row.uom}`;
        } else if (column.key === "bbu_total_price") {
          editable_content = addCommasToNumber(
            Number(row.quantity.quantity || 0) * Number(row.bbu_unit_price || 0)
          );
        } else if (column.key === "bbu_per_watt") {
          let totalAmount =
            Number(row.quantity.quantity || 0) *
            Number(row.bbu_unit_price || 0);
          editable_content = addCommasToNumber(
            totalAmount / (projectCapacity * 1000)
          );
        }
        // create purchase order columns
        else if (column.key === "required_quantity") {
          editable_content = (
            <Input
              type={column.type}
              name={column.key}
              onChange={(e) => {
                const value = e.target.value;
                if (
                  value > 0 &&
                  value <=
                    Number(row.quantity_left_after_purchase_order.quantity || 0)
                ) {
                  valueHandler([column.key], e.target.value, index);
                } else {
                  valueHandler([column.key], "", index);
                }
              }}
              value={row[column.key]}
            />
          );
        } else if (column.key === "required_amount") {
          editable_content = (
            <Input
              type={column.type}
              name={column.key}
              onChange={(e) => {
                const value = e.target.value;
                if (value >= 0 && value <= Number(row.left_po_amount || 0)) {
                  valueHandler([column.key], e.target.value, index);
                } else {
                  valueHandler([column.key], "", index);
                }
              }}
              value={row[column.key]}
            />
          );
        } else if (column.type === "tax-dropdown") {
          editable_content = (
            <SelectForObjects
              width="8rem"
              margin={"0px"}
              height={"36px"}
              setselected={(value) => valueHandler([column.key], value, index)}
              selected={row[column.key]}
              options={taxList}
              optionName={"name"}
              placeholder="Select"
            />
          );
        }
        // generic cases
        else if (["text", "number", "date"].includes(column.type)) {
          editable_content = (
            <Input
              type={column.type}
              name={column.key}
              onChange={(e) => {
                if (
                  column.type === "number" &&
                  ((e.target.value == 0 && !column.canBeZero) ||
                    e.target.value < 0 ||
                    e.target.value > row[column.maxLimit])
                ) {
                  valueHandler([column.key], "", index);
                } else {
                  valueHandler([column.key], e.target.value, index);
                }
              }}
              value={row[column.key]}
            />
          );
        } else if (column.displayType === "price") {
          editable_content = addCommasToNumber(row[column.key]);
        } else {
          editable_content = `${row[column.key] ?? ""} ${row[column.key2] ?? ""}`;
        }
        return (
          <td
            key={columnIndex}
            className={`px-4 py-3 min-w-[100px] border-b-2 border-r-2 border-primary-light-5
              ${columnIndex === 0 ? "sticky z-20 left-[4rem] bg-inherit" : ""}
              ${errorRows?.some((errorRow) => errorRow?.[errorRowIdName] == row[errorRowIdName]) ? " bg-red-100" : ""}`}
            style={{
              width: column.width,
              minWidth: column.width,
            }}
          >
            <div className="flex items-center text-zinc-600 text-xs font-semibold capitalize flex-shrink-0">
              {editable_content}
            </div>
          </td>
        );
      })}
    </tr>
  );
}

export default PurchaseOrderTable;
