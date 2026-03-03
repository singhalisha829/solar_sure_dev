import { ornateLogo, profilePicture } from "@/utils/images";
import { Badge } from "./shared/Badge";
import Image from "next/image";
import { useState } from "react";
import {
  LuArrowDownUp,
  LuMoveDown,
  LuMoveUp,
  LuDownload,
  LuTrash2,
} from "react-icons/lu";
import { FaPen, FaRedoAlt, FaEye } from "react-icons/fa";
import { MdUploadFile } from "react-icons/md";
import {
  dateFormat,
  dateFormatFromMMDDYYY,
  convertUnixTimestamp,
} from "@/utils/formatter";
import { formatPrice } from "@/utils/numberHandler";
import Button from "./shared/Button";
import { cn } from "@/utils/utils";
import { LocalStorageService } from "@/services/LocalStorageHandler";

const Table = ({
  columns,
  rows,
  onRowClick,
  hightlightClosedProjects,
  onSelectCheckbox,
  onColumnSort,
  sortConfig,
  ...restProps
}) => {
  const { className } = restProps;
  const userInfo = LocalStorageService.get("user");

  const [selectedCheckbox, setSelectedCheckbox] = useState(null);

  const invoicesAccessibilityInfo =
    LocalStorageService.get("user_accessibility").accessibility[0].packing_list
      .pages.ornate_invoices;

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key) {
      if (sortConfig.direction === "ascending") {
        direction = "descending";
      } else if (sortConfig.direction === "descending") {
        direction = "none";
      } else {
        direction = "ascending";
      }
    }

    onColumnSort(key, direction);
  };

  return (
    <table className={`w-full border-collapse ${className}`}>
      <thead className="sticky top-0 z-[1]">
        <tr className=" bg-primary-light-10 text-primary text-left">
          {restProps.showCheckbox && (
            <th
              className={`px-4 py-3 text-xs w-[4rem] max-w-[4rem] min-w-[4rem] font-semibold uppercase sticky left-0 bg-inherit `}
            ></th>
          )}
          <th
            className={`px-4 py-3 text-xs w-[4rem] max-w-[4rem] min-w-[4rem] font-semibold uppercase sticky left-0 bg-inherit `}
          >
            Sr.No.
          </th>
          {columns.map((column, index) => {
            const isLastColumn = index === columns.length - 1;
            return (
              <th
                key={index}
                className={`px-4 py-3 text-xs  font-semibold uppercase ${index === 0 ? "sticky left-[4rem] bg-inherit" : ""} ${column.sortable ? "cursor-pointer" : ""}`}
                style={{
                  width: isLastColumn && !column.width ? "100%" : column.width,
                  minWidth:
                    isLastColumn && !column.width ? "100%" : column.width,
                }}
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
        {rows.map((row, index) => (
          <tr
            key={index}
            onClick={() => (onRowClick ? onRowClick(row) : {})}
            className={`${onRowClick ? "cursor-pointer" : ""} 
            ${(hightlightClosedProjects && row.status == "Closed") || (restProps.highlightPoItems && row?.quantity_left_after_purchase_order?.quantity == 0) ? "bg-zinc-200" : index % 2 != 0 ? "bg-primary-light-5" : "bg-white"}`}
          >
            {restProps.showCheckbox && (
              <td
                className={`px-4 py-3 text-xs w-[4rem] max-w-[4rem] min-w-[4rem] font-semibold uppercase sticky left-0 bg-inherit `}
              >
                {row.status === "Pending" && (
                  <input
                    type="checkbox"
                    checked={row.id === selectedCheckbox}
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent onRowClick from being triggered
                    }}
                    onChange={(e) => {
                      if (row.id === selectedCheckbox) {
                        setSelectedCheckbox(null);
                        onSelectCheckbox(null);
                      } else {
                        setSelectedCheckbox(row.id);
                        onSelectCheckbox(row.id);
                      }
                    }}
                  />
                )}
              </td>
            )}
            <td
              className={`px-4 py-3 text-xs w-[4rem] max-w-[4rem] min-w-[4rem] font-semibold uppercase sticky left-0 bg-inherit 
                `}
            >
              <div className="flex items-center text-zinc-600 text-xs font-semibold capitalize">
                {restProps.prevPageRows
                  ? `${restProps.prevPageRows + (index + 1)}.`
                  : `${index + 1}.`}
              </div>
            </td>
            {columns.map((column, innerIndex) => {
              let display_content = null;
              if (column.key === "status") {
                let variant = row[column.key]?.includes("-")
                  ? row[column.key].replaceAll("-", "").toLowerCase()
                  : row[column.key]?.includes(" ")
                    ? row[column.key].replaceAll(" ", "_").toLowerCase()
                    : row[column.key]?.toLowerCase();
                display_content = (
                  <Badge variant={variant} title={row[column.key]}>
                    {row[column.key] !== ""
                      ? row[column.key] === "Transportation Details Added"
                        ? "Transportation..."
                        : row[column.key]
                      : "-"}
                  </Badge>
                );
              } else if (column.type === "invoice_type_added") {
                display_content = (
                  <div className="flex items-center gap-2.5 text-zinc-600 text-xs font-semibold capitalize">
                    {row[column.type].join(", ")}
                  </div>
                );
              } else if (
                column.key === "project_head" ||
                column.key === "Vendor"
              ) {
                display_content = (
                  <div className="flex items-center gap-2.5 text-zinc-600 text-xs font-semibold capitalize">
                    <Image
                      src={profilePicture}
                      alt="project image"
                      width={20}
                      height={20}
                    />
                    {row[column.key] !== "" ? row[column.key] : "-"}
                  </div>
                );
              } else if (column.key === "Make") {
                display_content = (
                  <div className="flex items-center gap-2.5 text-zinc-600 text-xs font-semibold capitalize">
                    <div className="border-stone-200 border rounded-full w-[20px] h-[20px] overflow-hidden">
                      <Image
                        src={ornateLogo}
                        alt="project image"
                        width={20}
                        height={20}
                      />
                    </div>
                    {row[column.key] !== "" ? row[column.key] : "-"}
                  </div>
                );
              } else if (column.type === "clickable-data") {
                display_content = (
                  <div
                    className="flex items-center cursor-pointer gap-2.5 text-zinc-600 underline underline-offset-4 text-xs font-semibold capitalize"
                    onClick={(e) => {
                      e.stopPropagation(e);
                      column.onClickCell(row);
                    }}
                  >
                    {row[column.key]}
                  </div>
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
                    {row[column.key] !== "" ? dateFormat(row[column.key]) : "-"}
                  </div>
                );
              } else if (column.type === "created_at") {
                display_content = (
                  <div className="flex items-center gap-2.5 text-zinc-600 text-xs font-semibold capitalize">
                    {row[column.key] !== ""
                      ? dateFormat(row[column.key].split("T")[0])
                      : "-"}
                  </div>
                );
              } else if (column.type === "ddmmyyyy") {
                display_content = (
                  <div className="flex items-center gap-2.5 text-zinc-600 text-xs font-semibold capitalize">
                    {row[column.key] !== ""
                      ? dateFormatFromMMDDYYY(row[column.key])
                      : "-"}
                  </div>
                );
              } else if (column.type === "unix_timestamp") {
                display_content = (
                  <div className="flex items-center gap-2.5 text-zinc-600 text-xs font-semibold capitalize">
                    {row[column.key] !== ""
                      ? convertUnixTimestamp(row[column.key])
                      : "-"}
                  </div>
                );
              } else if (column.type === "contingency_type") {
                display_content = (
                  <div className="flex items-center gap-2.5 text-zinc-600 text-xs font-semibold capitalize">
                    {row[column.type]?.replaceAll("_", " ")}
                  </div>
                );
              } else if (column.type === "gst-amount") {
                display_content = (
                  <div className="flex flex-col justify-center gap-2.5 text-zinc-600 text-xs font-semibold capitalize">
                    <span>With GST: {formatPrice(row[column.key]) ?? "-"}</span>
                    <span>
                      Without GST: {formatPrice(row[column.key2]) ?? "-"}
                    </span>
                  </div>
                );
              } else if (column.key === "additional_po") {
                display_content = (
                  <div className="flex flex-col justify-center gap-2.5 text-zinc-600 text-xs font-semibold capitalize">
                    {row[column.key] ? "Yes" : "No"}
                  </div>
                );
              } else if (column.type === "project_registration_status") {
                display_content = (
                  <div className="flex items-center gap-2.5 text-zinc-600 text-xs font-semibold capitalize">
                    <Badge
                      variant={row[column.key]
                        .replaceAll(/[.()]/g, "")
                        .replaceAll(" ", "_")
                        .toLowerCase()}
                    >
                      {row[column.key] !== "" ? row[column.key] : "-"}
                    </Badge>
                  </div>
                );
              } else if (column.type === "company_type") {
                display_content = (
                  <div className="flex items-center gap-2.5 text-zinc-600 text-xs font-semibold capitalize">
                    <Badge variant={row[column.key] ? "ornate" : "sg"}>
                      {row[column.key] ? "Ornate" : "SG Ornate"}
                    </Badge>
                  </div>
                );
              } else if (column.type === "project_consumed_amount") {
                display_content = (
                  <div
                    className={`flex items-center gap-2.5 text-zinc-600 text-xs font-semibold capitalize ${row[column.key] != 0 ? "hover:underline underline-offset-4" : ""}`}
                    onClick={(e) => {
                      if (row[column.key] != 0) {
                        e.stopPropagation();
                        column.onClick(row);
                      }
                    }}
                  >
                    {formatPrice(row[column.key])}
                  </div>
                );
              } else if (column.type === "document") {
                display_content = (
                  <div
                    className={`flex ${row[column.document_key] !== "" ? "underline underline-offset-4 cursor-pointer" : ""} items-center gap-2.5 text-zinc-600 text-xs font-semibold capitalize`}
                    onClick={
                      row[column.document_key] !== ""
                        ? (e) => {
                          e.stopPropagation();
                          window.open(row[column.document_key], "_blank");
                        }
                        : () => { }
                    }
                  >
                    {row[column.key] !== "" ? row[column.key] : "-"}
                  </div>
                );
              } else if (column.type === "file") {
                display_content =
                  row[column.key] != "" ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        window.open(row[column.key], "_blank");
                      }}
                    >
                      <LuDownload
                        title="Download"
                        size={16}
                        className="text-stone-300 hover:text-zinc-600"
                      />
                    </button>
                  ) : (
                    "-"
                  );
              } else if (
                column.type === "contingency-actions-column" &&
                (row.status === "Pending" || row.status === "Incomplete")
              ) {
                display_content = (
                  <span className="flex gap-4 justify-center">
                    {column.actionType.split("-").includes("edit") && (
                      <FaPen
                        title="Edit"
                        className="text-stone-300 text-[13px] cursor-pointer hover:text-zinc-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          column.onClickEdit(row);
                        }}
                      />
                    )}
                    {column.actionType.split("-").includes("delete") && (
                      <LuTrash2
                        title="Delete"
                        size={14}
                        onClick={(e) => {
                          e.stopPropagation();
                          column.onClickDelete(row);
                        }}
                        className="text-stone-300 cursor-pointer hover:text-red-500"
                      />
                    )}
                    {column.actionType.split("-").includes("download") && (
                      <LuDownload
                        title="Download"
                        size={16}
                        onClick={(e) => {
                          e.stopPropagation();
                          column.onClickDownload(row);
                        }}
                        className="text-stone-300 cursor-pointer hover:text-zinc-600"
                      />
                    )}
                  </span>
                );
              } else if (column.type === "actions-column") {
                const canEditByActionType = column?.actionType
                  ?.split("-")
                  .includes("edit");
                const isAdminEditing = userInfo.role === "admin";
                const isNonAdminAllowedToEdit =
                  userInfo.role !== "admin" &&
                  (["Generate", "PO Created", "Draft", "PO Partially Approved"].includes(row.status));

                const canShowEditIcon =
                  (!restProps.editPurchaseOrder && canEditByActionType) ||
                  (restProps.editPurchaseOrder &&
                    canEditByActionType &&
                    (isAdminEditing || isNonAdminAllowedToEdit));

                display_content = (
                  <span className="flex gap-4 justify-center">
                    {column?.actionType?.split("-").includes("view") && (
                      <FaEye
                        title="View"
                        className="text-stone-300 text-[18px] cursor-pointer hover:text-zinc-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          column.onClickView(row);
                        }}
                      />
                    )}
                    {column.actionType.split("-").includes("download") && (
                      <LuDownload
                        title="Download"
                        size={16}
                        onClick={(e) => {
                          e.stopPropagation();
                          column.onClickDownload(row);
                        }}
                        className="text-stone-300 cursor-pointer hover:text-zinc-600"
                      />
                    )}
                    {canShowEditIcon && (
                      <FaPen
                        title="Edit"
                        className="text-stone-300 text-[13px] cursor-pointer hover:text-zinc-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          column.onClickEdit(row);
                        }}
                      />
                    )}
                    {column?.actionType?.split("-").includes("upload") && (
                      <MdUploadFile
                        title="Upload Invoice"
                        className="text-stone-300 text-[18px] cursor-pointer hover:text-zinc-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          column.onClickUploadInvoice(row);
                        }}
                      />
                    )}

                    {((column?.actionType?.split("-").includes("delete") &&
                      !restProps.conditionallyDelete) ||
                      (column?.actionType?.split("-").includes("delete") &&
                        restProps.conditionallyDelete &&
                        row?.[restProps.conditionallyDeleteKey]?.length ===
                        0)) && (
                        <LuTrash2
                          title="Delete"
                          size={14}
                          onClick={(e) => {
                            e.stopPropagation();
                            column.onClickDelete(row);
                          }}
                          className="text-stone-300 cursor-pointer hover:text-red-500"
                        />
                      )}
                    {column?.actionType?.split("-").includes("revision") && (
                      <FaRedoAlt
                        title="Revise"
                        size={14}
                        onClick={(e) => {
                          e.stopPropagation();
                          column.onClickRevsion(row);
                        }}
                        className="text-stone-300 cursor-pointer hover:text-stone-600"
                      />
                    )}
                  </span>
                );
              } else if (column.type === "actions-column-packing-list") {
                display_content = (
                  <span className="flex gap-4 justify-center">
                    {column.actionType.split("-").includes("download") && (
                      <LuDownload
                        title="Download"
                        size={16}
                        onClick={(e) => {
                          e.stopPropagation();
                          column.onClickDownload(row);
                        }}
                        className="text-stone-300 cursor-pointer hover:text-zinc-600"
                      />
                    )}
                    {column?.actionType?.split("-").includes("edit") &&
                      (userInfo.role === "admin" ||
                        (userInfo.role !== "admin" &&
                          row.status === "Created")) && (
                        <FaPen
                          title="Edit"
                          className="text-stone-300 text-[13px] cursor-pointer hover:text-zinc-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            column.onClickEdit(row);
                          }}
                        />
                      )}
                    {column?.actionType?.split("-").includes("upload") &&
                      ["Invoice Added", "Transportation Details Added"].includes(
                        row.status
                      ) ? (
                      <FaEye
                        title="View Invoice"
                        className="text-stone-300 text-[18px] cursor-pointer hover:text-zinc-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          column.onClickUploadInvoice(row);
                        }}
                      />
                    ) : (
                      <MdUploadFile
                        title="Upload Invoice"
                        className="text-stone-300 text-[18px] cursor-pointer hover:text-zinc-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          column.onClickUploadInvoice(row);
                        }}
                      />
                    )}
                  </span>
                );
              } // For Revision No. column of MDL table in project details ->Engineering section
              else if (
                column.type === "custom-view" &&
                column.key === "revision_no"
              ) {
                display_content = (
                  <span
                    className={`text-xs ${row[column.key] !== "R0"
                      ? "underline underline-offset-4 cursor-pointer"
                      : ""
                      }`}
                    onClick={() => {
                      if (row[column.key] !== "R0") {
                        restProps.handleOpenHistoryModal(row);
                      }
                    }}
                  >
                    {row[column.key]}
                  </span>
                );
              } else if (column.displayType === "price") {
                display_content = (
                  <div className="flex items-center text-zinc-600 text-xs font-semibold capitalize">
                    {formatPrice(row[column.key])}
                  </div>
                );
              } else if (column.type === "packing_list_quantity") {
                display_content = (
                  <div className="flex items-center text-zinc-600 text-xs font-semibold capitalize">
                    {`${row?.quantity ?? ""} / ${row?.bom_quantity?.quantity} ${row?.unit_symbol}`}
                  </div>
                );
              } else if (
                column.type === "delete-ledger-items" &&
                Number(row.left_inventory_after_booking?.quantity || 0) >=
                Number(row?.quantity?.quantity || 0)
              ) {
                display_content = (
                  <LuTrash2
                    title="Delete"
                    size={14}
                    onClick={(e) => {
                      e.stopPropagation();
                      column.onClickDelete(row);
                    }}
                    className="text-stone-300 cursor-pointer hover:text-red-500"
                  />
                );
              } else if (column.type === "transportation_details") {
                display_content = (
                  <div className="flex items-center text-zinc-600 text-xs font-semibold capitalize">
                    {row.status === "Pending" ? (
                      <Button
                        className={`w-[5rem]`}
                        title={
                          !invoicesAccessibilityInfo?.add_dispatch
                            ? "You do not have the required permissions to add transporter details."
                            : ""
                        }
                        disabled={!invoicesAccessibilityInfo?.add_dispatch}
                        onClick={(e) => {
                          e.stopPropagation();
                          column.onAddDetails(row);
                        }}
                      >
                        Add
                      </Button>
                    ) : (
                      <div
                        title={
                          !invoicesAccessibilityInfo?.view_dispatch_details
                            ? "You do not have the required permissions to view transporter details."
                            : ""
                        }
                        className={
                          invoicesAccessibilityInfo?.view_dispatch_details
                            ? `hover:underline underline-offset-4`
                            : `cursor-not-allowed text-gray-400`
                        }
                        onClick={
                          invoicesAccessibilityInfo?.view_dispatch_details
                            ? (e) => {
                              e.stopPropagation();
                              column.onViewDetails(row);
                            }
                            : undefined
                        }
                      >
                        View Details
                      </div>
                    )}
                  </div>
                );
              } else if (column.type === "bbu_total_price") {
                display_content = (
                  <div className="flex items-center text-zinc-600 text-xs font-semibold capitalize">
                    {formatPrice(
                      Number(row.quantity || 0) * Number(row.unit_price || 0)
                    )}
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
                    `w-[10%] px-4 py-3`,
                    innerIndex === 0 ? "sticky left-[4rem] bg-inherit" : ""
                  )}
                >
                  {display_content}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Table;
