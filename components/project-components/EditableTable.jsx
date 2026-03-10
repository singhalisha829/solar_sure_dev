import { useEffect, useState } from "react";
import {
  LuArrowDownUp,
  LuCheck,
  LuMoveDown,
  LuMoveUp,
  LuX,
  LuTrash2,
  LuDownload,
} from "react-icons/lu";
import { FaEye, FaPen } from "react-icons/fa";
import { useModal } from "@/contexts/modal";
import { SelectForObjects } from "../formPage/MultiSelectDropdown/MultiSelectDropdown";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { dateFormat } from "@/utils/formatter";
import { handleFileUpload } from "@/utils/documentUploadHandler";
import { formatPrice, addCommasToNumber } from "@/utils/numberHandler";
import { cn } from "@/utils/utils";
import { Badge } from "../shared/Badge";

const EditVendorModal = dynamic(() => import("../modals/AddVendor"));
const EditSiteProgressModal = dynamic(
  () => import("../modals/ProjectDetails/AddSiteProgress")
);
const DeleteWarningModal = dynamic(() => import("../modals/WarningModal"));
const EditProjectHeadItemModalModal = dynamic(
  () => import("../modals/AddProjectHeadItemModal")
);
const EditManufacturerModal = dynamic(
  () => import("../modals/AddEditManufaturer")
);
const EditCompanyModal = dynamic(() => import("../modals/AddEditCompanyModal"));
const EditProductModal = dynamic(() => import("../modals/AddEditProduct"));
const EditSiteModal = dynamic(() => import("../modals/AddEditSiteModal"));
const StockInProductModal = dynamic(
  () => import("../modals/StockInProductModal")
);
const EditInstalltionItem = dynamic(
  () => import("../modals/ProjectDetails/AddEditInstallationItems")
);
const EditSiteVisitProjectExpense = dynamic(
  () => import("../modals/AddSiteVisitProjectExpense")
);

const defaultSortState = {
  key: null,
  direction: "",
}

const EditableTable = ({
  columns,
  rows,
  items,
  onRowClick,
  onEditSuccess,
  isEditMode,
  onDeleteRow,
  tableHeader,
  showFooterRow,
  handleSelectCheckbox,
  handleSelectAllCheckbox,
  errorRows,
  ...restProps
}) => {
  const { className } = restProps;
  const { openModal, closeModal } = useModal();
  const [sortConfig, setSortConfig] = useState(defaultSortState);
  const [isEdit, setIsEdit] = useState(false);
  const [currentModalId, setCurrentModalId] = useState(null);
  const [selectAllCheckboxes, setSelectAllCheckboxes] = useState(
    rows.every((row) => row.status === "Booked")
  );
  const [checkboxes, setCheckboxes] = useState(
    rows.map((row) => row.status === "Booked")
  );

  const requestSort = (key) => {
    // let direction = "ascending";
    // if (sortConfig.key === key && sortConfig.direction === "ascending") {
    //   direction = "descending";
    // }
    // setSortConfig({ key, direction });

    if (sortConfig.key !== key) {
      setSortConfig({ key, direction: "ascending" });
      return;
    }

    if (sortConfig.direction === null) {
      setSortConfig({ key, direction: "ascending" });
    } else if (sortConfig.direction === "ascending") {
      setSortConfig({ key, direction: "descending" });
    } else if (sortConfig.direction === "descending") {
      setSortConfig(defaultSortState); // reset to unsorted
    }
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

  const [modalItemDetail, setModalItemDetails] = useState(null);
  const [modalItemIndex, setModalItemIndex] = useState(null);

  // Function to handle checkbox toggle in table header
  const handleSelectAllChange = (value) => {
    const newCheckboxes = Array(rows.length).fill(value);
    setCheckboxes(newCheckboxes);
    setSelectAllCheckboxes(value);
  };

  // Function to handle checkbox toggle in table body
  const handleCheckboxChange = (index) => {
    const newCheckboxes = [...checkboxes];
    newCheckboxes[index] = !newCheckboxes[index];
    setCheckboxes(newCheckboxes);
  };
  return (
    <>
      <table className={`w-full border-collapse text-xs ${className}`}>
        <thead className="sticky top-0 z-[1]">
          <tr className="  text-primary text-left bg-primary-light-10">
            {columns.map((column, index) => {
              if (column.type === "checkbox") {
                return (
                  <th
                    key={index}
                    className={`px-4 py-3 text-xs font-semibold uppercase ${column.sortable ? "cursor-pointer" : ""
                      } 
                  ${index === 0 ? "sticky left-0 bg-inherit" : ""}`}
                    style={{
                      minWidth: column.minWidth,
                      width: column.minWidth,
                    }}
                    onClick={() => column.sortable && requestSort(column.key)}
                  >
                    <input
                      type="checkbox"
                      checked={selectAllCheckboxes}
                      onChange={(e) => {
                        handleSelectAllChange(e.target.checked);
                        handleSelectAllCheckbox(e.target.checked);
                      }}
                    />
                  </th>
                );
              }
              return (
                <th
                  key={index}
                  className={`px-4 py-3 text-xs font-semibold uppercase ${column.sortable ? "cursor-pointer" : ""
                    } 
                  ${index === 0 ? "sticky left-0 bg-inherit" : ""}
                  ${index === 1 && columns[0].type === "checkbox" ? "sticky left-[3rem] bg-inherit" : ""}`}
                  style={{ minWidth: column.minWidth, width: column.minWidth }}
                  onClick={() => column.sortable && requestSort(column.key)}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="flex items-center gap-1.5">
                      {column.name}
                      {column.sortable && (
                        <span className="ml-1">
                          {sortConfig.key === column.key ? (
                            sortConfig.direction === "ascending" ? (
                              <LuMoveUp />
                            ) : sortConfig.direction === "descending" ? (
                              <LuMoveDown />
                            ) : (
                              <LuArrowDownUp />
                            )
                          ) : (
                            <LuArrowDownUp />
                          )}
                        </span>
                      )}
                    </span>
                  </div>
                </th>
              );
            })}
            {(isEditMode || restProps.showOnlyDeleteIcon) && (
              <th
                className={`px-4 py-3 text-xs font-semibold sticky right-0 bg-inherit uppercase text-primary`}
              >
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.length !== 0 ? (
            sortedRows.map((row, index) => (
              <Row
                isEdit={isEdit}
                setIsEdit={setIsEdit}
                onEditSuccess={onEditSuccess}
                isEditMode={isEditMode}
                index={index}
                onRowClick={onRowClick}
                row={row}
                items={items}
                key={index}
                showOnlyDeleteIcon={restProps.showOnlyDeleteIcon}
                onDeleteRow={onDeleteRow}
                columns={columns}
                tableHeader={tableHeader}
                isModalOpenOnEdit={restProps.isModalOpenOnEdit}
                showDeleteWarningModal={restProps.showDeleteWarningModal}
                checkbox={checkboxes[index]}
                onDownload={restProps.onDownload}
                errorRows={errorRows}
                errorRowIdName={restProps.errorRowIdName}
                highlightContigencyRows={restProps.highlightContigencyRows}
                handleSelectCheckbox={(...props) => {
                  handleCheckboxChange(index);
                  handleSelectCheckbox(...props);
                }}
                handleOpenModal={(
                  id,
                  data,
                  index,
                  isFetchRevisionList = false
                ) => {
                  setModalItemDetails(data);
                  setModalItemIndex(index);
                  openModal(id);
                  setCurrentModalId(id);
                  if (isFetchRevisionList) {
                    fetchRevisionList(data.document_name);
                  }
                }}
              />
            ))
          ) : (
            <tr className="relative">
              <td colSpan={columns.length} className="pl-[35vw] text-base p-4">
                {restProps.emptyTableMessage ?? "No matching records found."}
              </td>
            </tr>
          )}

          {/* Footer row */}
          {showFooterRow && rows.length > 1 && (
            <tr className="relative bg-primary-light-10">
              {columns.map((column, index) => {
                let sum = 0;
                if (column.showTotalAmount) {
                  rows.map(
                    (row) =>
                    (sum +=
                      row[column.key] !== "" ? Number(row[column.key]) : 0)
                  );
                }
                if (index === 0) {
                  return (
                    <td
                      key={index}
                      className="px-4 py-3 font-bold capitalize text-zinc-600 sticky left-0 bg-primary-light-10"
                    >
                      TOTAL
                    </td>
                  );
                } else {
                  return (
                    <td
                      key={index}
                      className="px-4 py-3 font-bold capitalize text-zinc-600"
                    >
                      {formatPrice(column.showTotalAmount && sum)}
                    </td>
                  );
                }
              })}
              {/* actions column */}
              <td
                className={`w-[2%] px-4 right-0 sticky bg-primary-light-10`}
              ></td>
            </tr>
          )}
        </tbody>
      </table>
      {currentModalId ===
        "edit-project-head-item-" + tableHeader + "-" + modalItemIndex && (
          <EditProjectHeadItemModalModal
            projectHeadName={tableHeader}
            modalId={currentModalId}
            totalProjectCapacity={restProps.totalProjectCapacity}
            calculatedProjectCapacity={restProps.calculatedProjectCapacity}
            enteredProjectCapacity={restProps.enteredProjectCapacity}
            itemDetails={modalItemDetail}
            existingItemIds={restProps.projectRegistrationExistingItemIds}
            onAddItem={(data) => {
              onEditSuccess(data, modalItemIndex);
              closeModal(
                "edit-project-head-item-" + tableHeader + "-" + modalItemIndex
              );
            }}
          />
        )}

      {currentModalId ===
        "delete-warning-modal-" + tableHeader + "-" + modalItemIndex && (
          <DeleteWarningModal
            modalId={currentModalId}
            modalContent={
              <>
                Are you sure you want to delete{" "}
                <strong>{modalItemDetail?.document_name}</strong>&apos; details?
                This action is irreversible.
              </>
            }
            onSubmit={() => onDeleteRow(modalItemIndex)}
          />
        )}

      {currentModalId === "edit-task-" + modalItemIndex && (
        <EditSiteProgressModal
          modalId={currentModalId}
          itemDetails={modalItemDetail}
          onSuccessfullSubmit={onEditSuccess}
          projectId={restProps.projectId}
        />
      )}

      {(currentModalId === "edit-vendor-" + modalItemIndex ||
        currentModalId === "edit-epc-" + modalItemIndex) && (
          <EditVendorModal
            modalId={currentModalId}
            itemDetails={modalItemDetail}
            editEpcHandler={onEditSuccess}
          />
        )}

      {currentModalId === "edit-manufacturer-" + modalItemIndex && (
        <EditManufacturerModal
          modalId={currentModalId}
          itemDetails={modalItemDetail}
          onSuccess={onEditSuccess}
        />
      )}

      {currentModalId === "edit-company-" + modalItemIndex && (
        <EditCompanyModal
          modalId={currentModalId}
          itemDetails={modalItemDetail}
          onSuccessfullSubmit={onEditSuccess}
        />
      )}

      {currentModalId === "edit-product-" + modalItemIndex && (
        <EditProductModal
          modalId={currentModalId}
          itemDetails={modalItemDetail}
        />
      )}

      {currentModalId === "edit-site-master-" + modalItemIndex && (
        <EditSiteModal
          modalId={currentModalId}
          siteDetails={modalItemDetail}
          getSitesHandler={onEditSuccess}
        />
      )}

      {currentModalId === "edit-stock-in-product-" + modalItemIndex && (
        <StockInProductModal
          modalId={currentModalId}
          itemDetails={modalItemDetail}
          onStockInItems={(data) => onEditSuccess(data, modalItemIndex)}
        />
      )}

      {currentModalId === "edit-installation-item-" + modalItemIndex && (
        <EditInstalltionItem
          modalId={currentModalId}
          itemDetails={modalItemDetail}
          isContingency={false}
          onSuccessfullSubmit={onEditSuccess}
          activeSubTab={tableHeader}
        />
      )}

      {currentModalId ===
        "edit-site-visit-project-expense-" + modalItemIndex && (
          <EditSiteVisitProjectExpense
            modalId={currentModalId}
            expenseData={modalItemDetail}
            onSaveExpense={(data) => onEditSuccess(data, modalItemIndex)}
          />
        )}
    </>
  );
};

function Row({
  isEdit,
  row,
  onRowClick,
  index,
  isEditMode,
  setIsEdit,
  onDeleteRow,
  columns,
  onEditSuccess,
  tableHeader,
  isModalOpenOnEdit,
  handleOpenModal,
  showDeleteWarningModal,
  handleSelectCheckbox,
  checkbox,
  showOnlyDeleteIcon,
  onDownload,
  errorRows,
  errorRowIdName,
  highlightContigencyRows,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [item, setItem] = useState(row);

  useEffect(() => {
    setItem(row);
  }, [row]);

  const handleFile = async (e, key) => {
    const response = await handleFileUpload(e.target.files[0]);
    if (response.type === "success") {
      setItem({ ...item, [key]: response.data });
    } else {
      toast.error(response.error || "Oops! Something went wrong");
    }
  };

  return (
    <tr
      onClick={() => (onRowClick ? onRowClick(row) : {})}
      className={`relative ${onRowClick ? "cursor-pointer" : ""}`}
    >
      {columns.map((column, columnIndex) => {
        let display_text = null;
        if (!isEditing || column.type === "disabled") {
          // For all 'date' type columns
          if (column.type === "date") {
            display_text = dateFormat(row[column.key]);
          } else if (column.type === "remark") {
            display_text = (
              <div
                className={`overflow-hidden text-ellipsis whitespace-nowrap`}
                title={row[column.key]}
              >
                {row[column.key]}
              </div>
            );
          }
          // For 'file' type columns
          else if (column.type === "file") {
            display_text = row[column.key] && row[column.key] !== "" && (
              <FaEye
                size={15}
                className="cursor-pointer"
                onClick={() => window.open(row[column.key], "__blank")}
              />
            );
          }
          // For a table column which displays same value for all rows
          else if (column.type === "fixed-value") {
            display_text = addCommasToNumber(column.displayValue);
          }
          // for manufactures column in Project heads section of Project registration form
          else if (column.key === "Product_name") {
            display_text = row["Product_name"] ?? row["Product"];
          }
          // For MDL table in project details -> Engineering section
          else if (
            row.category === "Void" &&
            [
              "submission_date",
              "reply_date",
              "document",
              "status",
              "revision_no",
            ].includes(column.key)
          ) {
            display_text = "-";
          }
          // For Document column of project details -> Site progress report section
          else if (column.type === "file-list") {
            display_text = row[column.key]?.length > 0 && (
              <span>
                1. {row[column.key][0]?.file_name}{" "}
                {row[column.key].length > 1
                  ? `(+${row[column.key].length - 1})`
                  : ""}
              </span>
            );
          }
          // For Task column of project details -> Site progress report section
          else if (column.type === "task-list") {
            display_text = row[column.key].length > 0 && (
              <span className="text-ellipsis overflow-hidden">
                1. <strong>{row[column.key][0]?.task}</strong>:{" "}
                {row[column.key][0]?.descriptions}{" "}
                {row[column.key].length > 1
                  ? `(+${row[column.key].length - 1})`
                  : ""}
              </span>
            );
          }
          // For checkbox column
          else if (column.type === "checkbox") {
            display_text = (
              <span className="text-ellipsis overflow-hidden">
                <input
                  type="checkbox"
                  disabled={!["Booked", "Created"].includes(item.status)}
                  checked={checkbox}
                  onChange={(e) =>
                    handleSelectCheckbox(e.target.checked, item.status, item)
                  }
                />
              </span>
            );
          } else if (column.type === "contingency_type") {
            display_text = (
              <div className="flex items-center gap-2.5 text-zinc-600 text-xs font-semibold capitalize">
                {row[column.type]?.replaceAll("_", " ")}
              </div>
            );
          } else if (column.key === "status") {
            let variant = row[column.key]?.includes("-")
              ? row[column.key].replaceAll("-", "").toLowerCase()
              : row[column.key]?.includes(" ")
                ? row[column.key].replaceAll(" ", "_").toLowerCase()
                : row[column.key]?.toLowerCase();
            display_text = (
              <Badge variant={variant} title={row[column.key]}>
                {row[column.key] !== "" ? row[column.key] : "-"}
              </Badge>
            );
          } else if (column.type === "complete_address") {
            display_text = (
              <div className="flex items-center text-zinc-600 text-xs font-semibold capitalize">
                {column.key.map((columnKey) => row[columnKey]).join(", ")}
              </div>
            );
          } else if (column.displayType === "price") {
            display_text = formatPrice(row[column.key]);
          } else if (column.displayType === "amount") {
            display_text = addCommasToNumber(row[column.key]);
          } else {
            display_text = `${row[column.key] ?? ""} ${row[column.key2] ?? ""}`;
          }
          return (
            <td
              className={cn(
                `px-4 py-3 font-semibold capitalize text-zinc-600 break-all`,
                column.style,
                highlightContigencyRows && row.is_contigency
                  ? "bg-yellow-100"
                  : index % 2 != 0
                    ? "bg-primary-light-5"
                    : "bg-white",
                columnIndex === 0 ? "sticky left-0" : "",
                columnIndex === 1 && columns[0].type === "checkbox"
                  ? "sticky left-[3rem] bg-inherit"
                  : "",
                errorRows?.some(
                  (errorRow) =>
                    errorRow?.[errorRowIdName].trim().toLowerCase() ==
                    row[errorRowIdName].trim().toLowerCase()
                )
                  ? " bg-red-100"
                  : ""
              )}
              style={{
                minWidth: column.minWidth,
                width: column.minWidth,
                maxWidth: column.minWidth,
              }}
              key={columnIndex}
              onClick={() => (column.onClick ? column.onClick(row) : {})}
            >
              {display_text}
            </td>
          );
        }
        // code for edit mode columns starts here..
        else {
          return (
            <td
              className={`px-2 py-3 font-semibold capitalize text-zinc-600 ${highlightContigencyRows && row.is_contigency ? "bg-yellow-100" : index % 2 != 0 ? "bg-primary-light-5" : "bg-white"}
              ${columnIndex === 0 ? "sticky left-0" : ""}
              ${columnIndex === 1 && columns[0].type === "checkbox" ? "sticky left-[3rem] bg-inherit" : ""}`}
              style={{ minWidth: column.minWidth, width: column.minWidth }}
              key={columnIndex}
            >
              {/* dropdown column */}
              {column.type === "dropdown" && (
                <SelectForObjects
                  margin={"0px"}
                  height={"36px"}
                  setselected={(name, value) => {
                    setItem((prev) => ({
                      ...prev,
                      [column.key]: value,
                    }));
                  }}
                  selected={
                    column.options.find(
                      (option) => option[column.optionId] == item[column.key]
                    )?.[column.optionName]
                  }
                  options={column.options}
                  optionName={column.optionName}
                  optionID={column.optionId}
                  placeholder="Select.."
                />
              )}

              {/* input type number, text, date column */}
              {["number", "text", "date"].includes(column.type) && (
                <div className="flex items-center gap-2 text-zinc-600 text-xs font-semibold">
                  <input
                    type={column.type}
                    onChange={(e) =>
                      setItem({ ...item, [column.key]: e.target.value })
                    }
                    value={item[column.key]}
                    className="w-full  border px-2.5 rounded-md py-1 h-[36px]"
                  />
                </div>
              )}

              {/* textarea column */}
              {column.type === "textarea" && (
                <div className="flex items-center gap-2 text-zinc-600 text-xs font-semibold">
                  <textarea
                    className={`rounded-md border-1 p-2 text-sm transition-[border] h-[36px] w-full `}
                    onChange={(e) =>
                      setItem({ ...item, [column.key]: e.target.value })
                    }
                    // placeholder={column.placeholder ?? "Enter.."}
                    value={item[column.key]}
                  ></textarea>
                </div>
              )}

              {/* file type column */}
              {column.type === "file" && (
                <div className="flex items-center gap-2 text-zinc-600 text-xs font-semibold">
                  <input
                    type={column.type}
                    onChange={(e) => handleFile(e, [column.key])}
                    className="w-[90%]  border px-2.5 rounded-md py-1 h-[36px]"
                  />
                  {item[column.key] && item[column.key] !== "" && (
                    <FaEye
                      size={15}
                      className="cursor-pointer"
                      onClick={() => window.open(item[column.key], "__blank")}
                    />
                  )}
                </div>
              )}

              {column.type === "fixed-value" && column.displayValue}
            </td>
          );
        }
      })}

      {isEditMode && (
        <td
          className={cn(
            `w-[2%] px-4 right-0 sticky`,
            highlightContigencyRows && row.is_contigency
              ? "bg-yellow-100"
              : index % 2 != 0
                ? "bg-primary-light-5"
                : "bg-white",
            errorRows?.some(
              (errorRow) =>
                errorRow?.[errorRowIdName].trim().toLowerCase() ==
                row[errorRowIdName].trim().toLowerCase()
            )
              ? " bg-red-100"
              : ""
          )}
        >
          <div className="flex gap-1.5 items-center justify-end  text-zinc-600 text-xs font-semibold capitalize">
            <button
              className={`${isEditing || isEdit ? "hidden" : "block"}`}
              onClick={(event) => {
                event.stopPropagation(); // Prevents the event from bubbling up to the table row
                event.preventDefault();
                if (isModalOpenOnEdit) {
                  handleOpenModal(isModalOpenOnEdit + "-" + index, item, index);
                } else {
                  setIsEditing(true);
                  setIsEdit(true);
                }
              }}
            >
              <FaPen
                title="Edit"
                className="text-stone-300 hover:text-zinc-600"
              />
            </button>

            {onDownload && (
              <button
                className={`${isEditing || isEdit ? "hidden" : "block"}`}
                onClick={() => onDownload(row)}
              >
                <LuDownload
                  title="Download"
                  size={16}
                  className="text-stone-300 hover:text-zinc-600"
                />
              </button>
            )}

            {onDeleteRow && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  if (showDeleteWarningModal) {
                    handleOpenModal(
                      "delete-warning-modal-" + tableHeader + "-" + index,
                      item,
                      index
                    );
                  } else {
                    onDeleteRow(index);
                  }
                }}
                className={` ${isEditing || isEdit ? "hidden" : "block"}`}
              >
                <LuTrash2
                  title="Delete"
                  size={12}
                  className="text-stone-300 hover:text-red-500"
                />
              </button>
            )}

            {isEditing && (
              <button
                onClick={() => {
                  setIsEditing(false);
                  setIsEdit(false);
                  setItem(row);
                }}
                className="flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-white flex-shrink-0"
              >
                <LuX title="Cancel" size={10} />
              </button>
            )}
            {isEditing && (
              <button
                onClick={() => {
                  setIsEditing(false);
                  setIsEdit(false);
                  onEditSuccess(item, index);
                }}
                className="flex items-center justify-center w-4 h-4 rounded-full bg-green-500 text-white flex-shrink-0"
              >
                <LuCheck title="Save" size={10} />
              </button>
            )}
          </div>
        </td>
      )}

      {showOnlyDeleteIcon && (
        <td
          className={`w-[2%] px-4 right-0 sticky  ${highlightContigencyRows && row.is_contigency
            ? "bg-yellow-100"
            : index % 2 != 0
              ? "bg-primary-light-5"
              : "bg-white"
            }`}
        >
          <div className="flex gap-1.5 items-center justify-end  text-zinc-600 text-xs font-semibold capitalize">
            {onDeleteRow && (
              <button
                onClick={() => {
                  if (showDeleteWarningModal) {
                    handleOpenModal(
                      "delete-warning-modal-" + tableHeader + "-" + index,
                      item,
                      index
                    );
                  } else {
                    onDeleteRow(index);
                  }
                }}
                className={` ${isEditing || isEdit ? "hidden" : "block"}`}
              >
                <LuTrash2
                  title="Delete"
                  size={12}
                  className="text-stone-300 hover:text-red-500"
                />
              </button>
            )}
          </div>
        </td>
      )}
    </tr>
  );
}

export default EditableTable;
