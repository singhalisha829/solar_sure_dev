import { FaAngleLeft, FaAngleRight } from "react-icons/fa";

const CustomPagination = ({
  currentPage,
  rowsPerPage,
  totalRows,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalRows / rowsPerPage);

  const generatePageNumbers = () => {
    const pagesArray = [];
    const maxVisiblePages = 5;
    const halfVisiblePages = Math.floor(maxVisiblePages / 2);

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pagesArray.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - halfVisiblePages);
      const endPage = Math.min(currentPage + halfVisiblePages, totalPages);

      if (startPage > 1) {
        pagesArray.push(1);
        if (startPage > 2) {
          pagesArray.push("...");
        }
      }

      for (let i = startPage; i <= endPage; i++) {
        pagesArray.push(i);
      }

      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pagesArray.push("...");
        }
        pagesArray.push(totalPages);
      }
    }

    return pagesArray;
  };

  const prevPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="flex gap-4 items-center">
      <div className="flex border-1 rounded-md h-8 w-fit">
        <button
          className="border-r-1 w-7 flex items-center justify-center"
          onClick={prevPage}
          title="Previous"
          disabled={currentPage === 1}
        >
          <FaAngleLeft />
        </button>
        <div className="flex">
          {generatePageNumbers().map((page) => (
            <div
              key={page}
              className={`flex cursor-pointer items-center justify-center px-1 min-w-7 border-r-1 ${currentPage === page ? "bg-primary text-white" : ""}`}
              onClick={() => onPageChange(page)}
            >
              {page}
            </div>
          ))}
        </div>
        <button
          className="w-7 flex items-center justify-center"
          title="Next"
          onClick={nextPage}
          disabled={currentPage === totalPages}
        >
          <FaAngleRight />
        </button>
      </div>
      <span>
        Page {currentPage} of {totalPages}
      </span>
    </div>
  );
};

export default CustomPagination;
