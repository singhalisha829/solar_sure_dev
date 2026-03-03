import { useState } from "react";
import {
  LuArrowDownUp,
  LuMoveDown,
  LuMoveUp,
  LuDownload,
} from "react-icons/lu";
import { dateFormat, dateFormatFromMMDDYYY } from "@/utils/formatter";
import { formatPrice } from "@/utils/numberHandler";
import { cn } from "@/utils/utils";

const ExpandableTable = ({
  columns,
  rows,
  onRowClick,
  selectedRowId,
  childrenColumns,
  childrenRows,
  hideEmptyChildRows,
  ...restProps
}) => {
  const { className } = restProps;
  const [sortConfig, setSortConfig] = useState({
    key: "id",
    direction: "descending",
  });
  const [showChildrenRowId, setShowChildrenRowId] = useState(null);

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

  const handleRowClick = (row) => {
    if (row.id == showChildrenRowId) {
      setShowChildrenRowId(null);
    } else {
      onRowClick(row);
      setShowChildrenRowId(row.id);
    }
  };

  return (
    <table className={`w-full border-collapse ${className}`}>
      <thead className="sticky top-0 z-[1]">
        <tr className=" bg-primary-light-10 text-primary text-left">
          <th
            className={`px-4 py-3 text-xs w-[4rem] max-w-[4rem] min-w-[4rem] font-semibold uppercase sticky left-0 bg-inherit `}
          >
            Sr.No.
          </th>
          {columns.map((column, index) => {
            const isLastColumn = index === columns.length - 1;
            return (
              <th
                key={`header-${index}`}
                className={`px-4 py-3 text-xs font-semibold uppercase ${index === 0 ? "sticky left-[4rem] bg-inherit" : ""} `}
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
        </tr>
      </thead>
      <tbody>
        {sortedRows.length === 0 && (
          <tr className="relative">
            <td colSpan={columns.length} className="text-center p-4">
              {restProps.emptyTableMessage ?? "No matching records found"}
            </td>
          </tr>
        )}
        {sortedRows.map((row, index) => (
          <>
            <tr
              key={`rows-${index}`}
              onClick={() => handleRowClick(row)}
              className={`${onRowClick ? "cursor-pointer" : ""} ${selectedRowId == row.id ? "bg-slate-300" : index % 2 != 0 ? "bg-primary-light-5" : "bg-white"}`}
            >
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
                if (column.type === "quantity_object") {
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
                } else if (column.type === "ddmmyyyy") {
                  display_content = (
                    <div className="flex items-center gap-2.5 text-zinc-600 text-xs font-semibold capitalize">
                      {row[column.key] !== ""
                        ? dateFormatFromMMDDYYY(row[column.key])
                        : "-"}
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
                          : () => {}
                      }
                    >
                      {row[column.key] !== "" ? row[column.key] : "-"}
                    </div>
                  );
                } else if (column.type === "file") {
                  display_content = (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(row[column.key], "_blank");
                      }}
                    >
                      <LuDownload
                        title="Download"
                        size={16}
                        className="text-stone-300 hover:text-zinc-600"
                      />
                    </button>
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
                } else {
                  display_content = (
                    <div className="flex items-center text-zinc-600 text-xs font-semibold capitalize">
                      {`${row[column.key] ?? "-"} ${row[column.key2] ?? ""}`}
                    </div>
                  );
                }
                return (
                  <td
                    key={`cells-${innerIndex}`}
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

            {(!hideEmptyChildRows ||
              (hideEmptyChildRows && childrenRows.length > 0)) &&
              showChildrenRowId == row.id && (
                <tr
                  className={`${index % 2 != 0 ? "bg-primary-light-5" : "bg-white"}`}
                >
                  <td colSpan={columns.length + 1}>
                    <table className={`w-full border-1 border-zinc-600 `}>
                      <thead>
                        <tr className="text-left">
                          <th
                            className={`px-4 border-b-1 py-3 text-xs ${index % 2 != 0 ? "bg-primary-light-5" : "bg-white"} font-semibold uppercase sticky left-0 bg-inherit w-[4rem] `}
                          ></th>
                          {childrenColumns.map((childColumn, childIndex) => {
                            return (
                              <th
                                key={`child-header-${childIndex}`}
                                className={`px-4 py-3 text-xs font-bold border-b-1 uppercase ${childIndex === 0 ? `sticky left-[4rem] ${index % 2 != 0 ? "bg-primary-light-5" : "bg-white"}` : ""} `}
                                style={{
                                  width: childColumn.width,
                                  minWidth: childColumn.width,
                                }}
                              >
                                {childColumn.name}
                              </th>
                            );
                          })}
                        </tr>
                      </thead>
                      <tbody>
                        {childrenRows.map((childRow, childIndex) => (
                          <tr key={`child-rows-${childIndex}`}>
                            <td
                              className={`px-4 py-3 text-xs font-semibold uppercase sticky left-0 ${index % 2 != 0 ? "bg-primary-light-5" : "bg-white"} w-[4rem] `}
                            >
                              {childIndex + 1}.
                            </td>
                            {childrenColumns.map(
                              (childColumn, innerChildIndex) => {
                                let display_content = null;
                                if (childColumn.type === "quantity_object") {
                                  display_content = (
                                    <div className="flex items-center gap-2.5 text-zinc-600 text-xs font-semibold capitalize">
                                      {childRow[childColumn.key]?.quantity ?? 0}{" "}
                                      {childRow[childColumn.key]?.unit ?? ""}
                                    </div>
                                  );
                                } else if (
                                  childColumn.type === "packing_list_quantity"
                                ) {
                                  display_content = (
                                    <div className="flex items-center text-zinc-600 text-xs font-semibold capitalize">
                                      {`${childRow?.quantity ?? ""} / ${childRow?.bom_quantity?.quantity} ${childRow?.unit_symbol}`}
                                    </div>
                                  );
                                } else if (
                                  childColumn.displayType === "price"
                                ) {
                                  display_content = (
                                    <div className="flex items-center text-zinc-600 text-xs font-semibold capitalize">
                                      {formatPrice(childRow[childColumn.key])}
                                    </div>
                                  );
                                } else if (childColumn.type === "date") {
                                  display_content = (
                                    <div className="flex items-center gap-2.5 text-zinc-600 text-xs font-semibold capitalize">
                                      {childRow[childColumn.key] !== ""
                                        ? dateFormat(childRow[childColumn.key])
                                        : "-"}
                                    </div>
                                  );
                                } else {
                                  display_content = (
                                    <div className="flex items-center gap-2.5 text-zinc-600 text-xs font-semibold capitalize">
                                      {`${childRow[childColumn.key]} ${childRow[childColumn.key2] ?? ""}`}
                                    </div>
                                  );
                                }
                                return (
                                  <td
                                    key={`child-cell-${innerChildIndex}`}
                                    className={`px-4 py-3 text-xs font-semibold uppercase 
                                    ${innerChildIndex === 0 ? `sticky left-[4rem] ${index % 2 != 0 ? "bg-primary-light-5" : "bg-white"}` : ""} `}
                                  >
                                    {display_content}
                                  </td>
                                );
                              }
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </td>
                </tr>
              )}
          </>
        ))}
      </tbody>
    </table>
  );
};

export default ExpandableTable;
