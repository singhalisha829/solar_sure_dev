import { useState, useRef, useEffect } from "react";
import {
  LuArrowDownUp,
  LuMoveDown,
  LuMoveUp,
  LuPaperclip,
  LuTrash2,
} from "react-icons/lu";
import { SelectForObjects } from "../formPage/MultiSelectDropdown/MultiSelectDropdown";
import { useManufacturers } from "@/contexts/manufacturers";
import { useRouter } from "next/router";
import Input from "../formPage/Input";
import { addCommasToNumber, formatPrice } from "@/utils/numberHandler";
import { handleFileUpload } from "@/utils/documentUploadHandler";
import { BiMenuAltRight } from "react-icons/bi";
import { toast } from "sonner";
import Button from "../shared/Button";
import { FaPen } from "react-icons/fa";
import { dateFormat } from "@/utils/formatter";

const ProjectItemTable = ({
  columns,
  rows,
  onRowClick,
  onEditSuccess,
  isEditMode,
  valueHandler,
  onDeleteRow,
  canDelete,
  errorRowIdName = "id",
  showMenu,
  onMenuOptionClicked,
  ...restProps
}) => {
  const { className } = restProps;
  const menuRef = useRef(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "" });
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };
  const sortedRows = [...rows].sort((a, b) => {
    if (sortConfig.direction === "ascending") {
      return a[sortConfig.key] > b[sortConfig.key] ? 1 : -1;
    }
    if (sortConfig.direction === "descending") {
      return a[sortConfig.key] < b[sortConfig.key] ? 1 : -1;
    }
    return 0;
  });

  const toggleMenuDropdown = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className={` w-full  ${className ? className : ""}`}>
      <table className="w-full border-collapse grow">
        <thead className="sticky top-0 z-30">
          <tr className=" bg-primary-light-10 text-primary text-left">
            {restProps.showContigencyBubble && (
              <th className="px-4 py-3 bg-white w-[2rem]"></th>
            )}
            <th
              className={`px-4 py-3 text-xs w-[4rem] max-w-[4rem] min-w-[4rem] font-semibold uppercase sticky left-0 bg-inherit z-10 `}
            >
              Sr.No.
            </th>
            {columns.map((column, index) => {
              return (
                <th
                  key={index}
                  className={`px-4 py-3  text-xs font-semibold uppercase relative 
                      ${index === 0 && !restProps.disableStickyRows ? "sticky left-[4rem] bg-inherit z-10" : ""}`}
                  style={{
                    width: column.width,
                    minWidth: column.width,
                  }}
                  onClick={() => column.sortable && requestSort(column.key)}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="flex items-center gap-1.5">
                      {column.name}
                      {column.sortable &&
                        (sortConfig.key === null ||
                          (sortConfig.key !== column.key && <LuArrowDownUp />))}
                    </span>
                    {column.sortable && (
                      <span className="ml-1">
                        {sortConfig.key === column.key &&
                          (sortConfig.direction === "ascending" ? (
                            <LuMoveUp />
                          ) : (
                            <LuMoveDown />
                          ))}
                      </span>
                    )}
                  </div>
                </th>
              );
            })}
            {((isEditMode && canDelete) ||
              restProps.addEngineeringQuanitity) && (
                <th
                  className={`px-4 py-3 text-xs font-semibold uppercase w-[5rem]`}
                >
                  Actions
                </th>
              )}
            {showMenu && !isEditMode && (
              <div ref={menuRef}>
                <BiMenuAltRight
                  className="absolute top-[0.6rem] text-zinc-500 right-2 text-xl cursor-pointer"
                  onClick={toggleMenuDropdown}
                />

                {isMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10"
                    style={{ zIndex: 10 }}
                  >
                    <ul className="py-1">
                      <li
                        className="px-4 py-2 text-xs text-gray-700 cursor-pointer hover:bg-gray-100"
                        onClick={() => onMenuOptionClicked(0)}
                      >
                        Drop Section
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.length !== 0 ? (
            sortedRows.map((row, index) => (
              <Row
                onEditSuccess={onEditSuccess}
                isEditMode={isEditMode}
                index={index}
                columns={columns}
                onRowClick={onRowClick}
                row={row}
                key={index}
                valueHandler={valueHandler}
                onDeleteRow={onDeleteRow}
                canDelete={canDelete}
                errorRows={restProps.errorRows}
                errorRowIdName={errorRowIdName}
                highlightContigencyRows={restProps.highlightContigencyRows}
                showContigencyBubble={restProps.showContigencyBubble}
                projectCapacity={restProps.projectCapacity}
                selectedPlanningCategory={restProps.selectedPlanningCategory}
                addEngineeringQuanitity={restProps.addEngineeringQuanitity}
                onClickEdit={restProps.onClickEdit}
                disableStickyRows={restProps.disableStickyRows}
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
  isEditMode,
  valueHandler,
  columns,
  onDeleteRow,
  canDelete,
  errorRows,
  errorRowIdName,
  highlightContigencyRows,
  showContigencyBubble,
  projectCapacity,
  addEngineeringQuanitity,
  onClickEdit,
  disableStickyRows,
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
      className={`relative ${highlightContigencyRows && row.is_contingency ? "bg-yellow-100" : index % 2 != 0 ? "bg-primary-light-5" : "bg-white"}`}
    >
      {showContigencyBubble && (
        <td className="px-4 py-3 bg-white">
          <div className="rounded-full cursor-pointer flex items-center justify-center font-bold h-[1.4rem] w-[1.4rem] bg-red-500 text-white text-xs">
            Q
          </div>
        </td>
      )}
      <td
        className={`px-4 py-3 text-xs w-[4rem] max-w-[4rem] min-w-[4rem] font-semibold uppercase z-20 sticky left-0 bg-inherit ${highlightContigencyRows && row.is_contingency ? "bg-yellow-100" : index % 2 != 0 ? "bg-primary-light-5" : "bg-white"}`}
      >
        <div className="flex items-center text-zinc-600 text-xs font-semibold capitalize">
          {`${index + 1}.`}
        </div>
      </td>
      {columns.map((column, columnIndex) => {
        let display_text = null;

        // code when edit mode is off
        if (!isEditMode) {
          if (column.key === "item_name") {
            display_text = (
              <>
                {row[column.key]}
                {row?.drawing && row.drawing.length > 0 && (
                  <a href={row.drawing[0].file} target="_blank" download>
                    <LuPaperclip size={12} className="text-primary" />
                  </a>
                )}
              </>
            );
          } else if (column.type === "date") {
            display_text = dateFormat(row[column.key]);
          } else if (
            (column.key === "quantity" ||
              column.key === "bom_items_quantity_left_after_booking") &&
            ["Engineering", "Planning"].includes(tab)
          ) {
            display_text = `${row[column.key]?.quantity ?? "0"} ${row[column.key]?.unit ?? row.uom}`;
          } else if (column.key === "bbu_total_price") {
            display_text = addCommasToNumber(
              Number(row.quantity?.quantity || 0) *
              Number(row.bbu_unit_price || 0)
            );
          } else if (column.key === "bbu_per_watt") {
            let totalAmount =
              Number(row.quantity?.quantity || 0) *
              Number(row.bbu_unit_price || 0);
            display_text = addCommasToNumber(
              totalAmount / (projectCapacity * 1000)
            );
          } else if (column.type === "po_avg_unit_price") {
            display_text = (
              <span
                className="hover:underline underline-offset-4 cursor-pointer"
                onClick={() => column.onClick(row)}
              >
                {formatPrice(row[column.key])}
              </span>
            );
          } else if (column.displayType === "price") {
            display_text = addCommasToNumber(row[column.key]);
          } else if (column.type === "file") {
            display_text = row[column.key] !== "" && (
              <span
                className="hover:underline underline-offset-4 cursor-pointer"
                onClick={() => window.open(row[column.key], "_blank")}
              >
                View
              </span>
            );
          } else {
            display_text = row[column.key];
          }
          return (
            <td
              key={columnIndex}
              className={`px-4 py-3 min-w-[100px] ${columnIndex === 0 && !disableStickyRows ? "sticky left-[4rem] bg-inherit z-20" : ""}`}
              style={{
                width: column.width,
                minWidth: column.width,
              }}
            >
              <div
                className={`flex items-center gap-2.5 text-zinc-600 text-xs font-semibold capitalize flex-shrink-0 `}
              >
                {display_text}
              </div>
            </td>
          );
        }
        // code for edit mode
        else {
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
          } else if (column.type === "file") {
            editable_content = (
              <div className="flex gap-2 items-center">
                <Input
                  type="file"
                  onChange={(e) => uploadDocument(e, index, [column.key])}
                />
                {row[column.key] !== "" && (
                  <Button
                    className="hover:underline px-2 underline-offset-4 cursor-pointer text-primary"
                    onClick={() => window.open(row[column.key], "_blank")}
                  >
                    View
                  </Button>
                )}
              </div>
            );
          } else if (
            column.key === "make_name" &&
            tab === "Engineering" &&
            column.type !== "create-bom-header"
          ) {
            editable_content = (
              <div className="max-w-60">
                <SelectForObjects
                  name={"make"}
                  height={"36px"}
                  disabled={row.bbu_unit_price !== null}
                  setselected={(value) => valueHandler("make", value, index)}
                  selected={
                    manufacturers.find((make) => make.id == row.make)?.name
                  }
                  options={manufacturers}
                  optionName={"name"}
                />
              </div>
            );
          } else if (
            column.key === "make_name" &&
            tab === "Engineering" &&
            column.type === "create-bom-header"
          ) {
            editable_content = (
              <div className="max-w-60">
                <SelectForObjects
                  name={"make"}
                  height={"36px"}
                  setselected={(value) => valueHandler("make", value, index)}
                  selected={
                    manufacturers.find((make) => make.id == row.make)?.name
                  }
                  options={manufacturers}
                  optionName={"name"}
                />
              </div>
            );
          } else if (column.type === "contingency_type") {
            editable_content = (
              <div className="flex items-center gap-2.5 text-zinc-600 text-xs font-semibold capitalize">
                {row[column.type]?.replaceAll("_", " ")}
              </div>
            );
          } else if (column.type === "create-bom-header") {
            editable_content = (
              <>
                <Input
                  type="number"
                  name={column.key}
                  onChange={(e) =>
                    valueHandler("quantity", e.target.value, index)
                  }
                  outerClass="mr-2"
                  value={row[column.key]}
                />
                {row.uom}
              </>
            );
          } else if (column.key === "replacement_quantity") {
            editable_content = (
              <>
                <Input
                  type="number"
                  name={column.key}
                  onChange={(e) => {
                    if (e.target.value >= 0 && e.target.value <= row.quantity) {
                      valueHandler(column.key, e.target.value, index);
                    } else {
                      valueHandler(column.key, "", index);
                    }
                  }}
                  outerClass="mr-2"
                  value={row[column.key]}
                />
                {row.uom}
              </>
            );
          } else if (column.key === "replacement_total_amount") {
            editable_content = (
              <>
                <Input
                  type="number"
                  name={column.key}
                  disabled={
                    row.replacement_quantity &&
                    row.replacement_quantity == row.quantity
                  }
                  onChange={(e) => {
                    if (
                      (!row.isOthers && e.target.value >= 0 &&
                        e.target.value <=
                        Number(row.unit_price) * Number(row.quantity)
                      ) || (row.isOthers && e.target.value >= 0 && e.target.value <= row.amount)) {
                      valueHandler(column.key, e.target.value, index);
                    } else {
                      valueHandler(column.key, "", index);
                    }
                  }}
                  outerClass="mr-2"
                  value={row[column.key]}
                />
                {row.uom}
              </>
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
            !column.key2 &&
            !["upload_invoice_quantity", "number"].includes(column.type)
          ) {
            editable_content = `${row[column.key]?.quantity ?? "0"} ${row[column.key]?.unit ?? row.uom ?? row.unit_symbol}`;
          } else if (column.key === "bbu_total_price") {
            editable_content = addCommasToNumber(
              Number(row.quantity?.quantity || 0) *
              Number(row.bbu_unit_price || 0)
            );
          } else if (column.key === "bbu_per_watt") {
            let totalAmount =
              Number(row.quantity?.quantity || 0) *
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
                    value >= 0 &&
                    value <=
                    Number(
                      row.quantity_left_after_purchase_order?.quantity || 0
                    )
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
          } else if (column.type === "remarks" && tab === "Engineering") {
            editable_content = (
              <Input
                type={"text"}
                disabled={row.bbu_unit_price !== null}
                name={column.key}
                onChange={(e) =>
                  valueHandler([column.key], e.target.value, index)
                }
                value={row[column.key]}
              />
            );
          } else if (column.type === "tax-dropdown") {
            editable_content = (
              <SelectForObjects
                width="8rem"
                margin={"0px"}
                height={"36px"}
                setselected={(value) =>
                  valueHandler([column.key], value, index)
                }
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
          } else if (column.type === "po_avg_unit_price") {
            editable_content = (
              <span
                className="hover:underline underline-offset-4 cursor-pointer"
                onClick={() => column.onClick(row)}
              >
                {formatPrice(row[column.key])}
              </span>
            );
          } else if (column.displayType === "price") {
            editable_content = addCommasToNumber(row[column.key]);
          } else {
            editable_content = `${row[column.key] ?? ""} ${row[column.key2] ?? ""}`;
          }
          return (
            <td
              key={columnIndex}
              className={`px-4 py-3 min-w-[100px] 
              ${columnIndex === 0 && !disableStickyRows ? "sticky z-20 left-[4rem] bg-inherit" : ""}
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
        }
      })}
      {isEditMode && canDelete && (
        <td
          className={`w-[2%] px-4 right-0 sticky z-20 text-center 
            ${index % 2 != 0 ? "bg-primary-light-5" : "bg-white"}
           ${errorRows?.some((errorRow) => errorRow?.[errorRowIdName] == row[errorRowIdName]) ? " bg-red-100" : ""}`}
        >
          <button
            onClick={(e) => {
              e.preventDefault();
              onDeleteRow(index);
            }}
          >
            <LuTrash2
              title="Delete"
              size={12}
              className="text-stone-300 hover:text-red-500"
            />
          </button>
        </td>
      )}

      {addEngineeringQuanitity && (
        <td
          className={`w-[7rem] px-4 py-2 flex gap-5 items-center
           ${highlightContigencyRows && row.is_contingency ? "bg-yellow-100" : index % 2 != 0 ? "bg-primary-light-5" : "bg-white"}
          ${errorRows?.some((errorRow) => errorRow?.[errorRowIdName] == row[errorRowIdName]) ? " bg-red-100" : ""}`}
        >
          <FaPen
            title="Edit"
            className="text-stone-300 text-[13px] cursor-pointer hover:text-zinc-600"
            onClick={(e) => {
              e.preventDefault();
              onClickEdit(row);
            }}
          />
          {row?.quantity?.quantity ==
            row?.bom_items_quantity_left_after_booking?.quantity &&
            canDelete && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onDeleteRow(row);
                }}
              >
                <LuTrash2
                  title="Delete"
                  className="text-stone-300 text-[13px]  hover:text-red-500"
                />
              </button>
            )}
        </td>
      )}
    </tr>
  );
}

export default ProjectItemTable;
