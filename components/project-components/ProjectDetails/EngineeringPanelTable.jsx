import { useState, useRef, useEffect } from "react";
import {
  LuArrowDownUp,
  LuMoveDown,
  LuMoveUp,
  LuPaperclip,
  LuTrash2,
} from "react-icons/lu";
import { useRouter } from "next/router";
import { addCommasToNumber } from "@/utils/numberHandler";
import { BiMenuAltRight } from "react-icons/bi";
import { FaPen } from "react-icons/fa";

const EngineeringPanelTabel = ({
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
  handleOpenModal,
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
        <thead className="sticky top-0 z-[1]">
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
                  {showMenu && !isEditMode && index === columns.length - 1 && (
                    <div ref={menuRef}>
                      <BiMenuAltRight
                        className="absolute top-[0.6rem] text-zinc-500 right-2 text-xl cursor-pointer"
                        onClick={toggleMenuDropdown}
                      />
                    </div>
                  )}
                </th>
              );
            })}
            {isEditMode && (
              <th
                className={`px-4 py-3  text-xs font-semibold uppercase w-[5rem]`}
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
                onEditSuccess={onEditSuccess}
                isEditMode={isEditMode}
                index={index}
                columns={columns}
                onRowClick={onRowClick}
                row={row}
                key={index}
                errorRows={restProps.errorRows}
                errorRowIdName={errorRowIdName}
                highlightContigencyRows={restProps.highlightContigencyRows}
                showContigencyBubble={restProps.showContigencyBubble}
                projectCapacity={restProps.projectCapacity}
                handleOpenModal={handleOpenModal}
                onDeleteRow={onDeleteRow}
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
  columns,
  errorRows,
  errorRowIdName,
  highlightContigencyRows,
  showContigencyBubble,
  projectCapacity,
  handleOpenModal,
  onDeleteRow,
}) {
  const router = useRouter();
  const { tab } = router.query;

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
        className={`px-4 py-3 text-xs w-[4rem] max-w-[4rem] min-w-[4rem] font-semibold uppercase sticky left-0 bg-inherit ${highlightContigencyRows && row.is_contingency ? "bg-yellow-100" : index % 2 != 0 ? "bg-primary-light-5" : "bg-white"}`}
      >
        <div className="flex items-center text-zinc-600 text-xs font-semibold capitalize">
          {`${index + 1}.`}
        </div>
      </td>
      {columns.map((column, columnIndex) => {
        let display_text = null;

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
        } else if (
          (column.key === "quantity" ||
            column.key === "bom_items_quantity_left_after_booking") &&
          ["Engineering", "Planning"].includes(tab)
        ) {
          display_text = `${row[column.key]?.quantity ?? "0"} ${row[column.key]?.unit ?? row.uom}`;
        } else if (column.key === "bbu_total_price") {
          display_text = addCommasToNumber(
            Number(row.quantity.quantity || 0) * Number(row.bbu_unit_price || 0)
          );
        } else if (column.key === "bbu_per_watt") {
          let totalAmount =
            Number(row.quantity.quantity || 0) *
            Number(row.bbu_unit_price || 0);
          display_text = addCommasToNumber(
            totalAmount / (projectCapacity * 1000)
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
            className={`px-4 py-3 min-w-[100px] ${columnIndex === 0 ? "sticky left-[4rem] bg-inherit" : ""}`}
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
      })}
      {isEditMode && (
        <td
          className={`w-[2%] px-4 right-0 sticky text-center 
            ${highlightContigencyRows && row.is_contingency ? "bg-yellow-100" : index % 2 != 0 ? "bg-primary-light-5" : "bg-white"}
           ${errorRows?.some((errorRow) => errorRow?.[errorRowIdName] == row[errorRowIdName]) ? " bg-red-100" : ""}`}
        >
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={(event) => {
                event.stopPropagation(); // Prevents the event from bubbling up to the table row
                handleOpenModal(row);
              }}
            >
              <FaPen
                title="Edit"
                className="text-stone-300 hover:text-zinc-600"
              />
            </button>

            <LuTrash2
              title="Delete"
              size={14}
              onClick={(e) => {
                e.stopPropagation();
                onDeleteRow(row);
              }}
              className="text-stone-300 cursor-pointer hover:text-red-500"
            />
          </div>
        </td>
      )}
    </tr>
  );
}

export default EngineeringPanelTabel;
