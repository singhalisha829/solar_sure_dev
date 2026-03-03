import Image from "next/image";
import { search } from "@/utils/images";
import { useCallback, useState, useEffect } from "react";
import { MdSearch } from "react-icons/md";
import Input from "../formPage/Input";

function debounce(func, wait) {
  let timeout;

  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default function Search(props) {
  const [inputValue, setInputValue] = useState(props.value || "");

  useEffect(() => {
    // Update inputValue when props.value changes
    setInputValue(props.value || "");
  }, [props.value]);

  const debouncedSearch = useCallback(
    debounce((value) => {
      props.searchText(value);
    }, 500),
    [props.searchText] // Include props.searchText in the dependency array
  );

  const handleSearch = (event) => {
    const value = event.target.value;
    setInputValue(value);
    debouncedSearch(value);
  };

  return (
    <div className="relative ">
      <div className="absolute top-1/2 left-1.5 -translate-y-1/2 z-20">
        <MdSearch />
      </div>
      <Input
        disableBorderLeft={true}
        className="pl-6"
        type="text"
        placeholder={
          props.searchPlaceholder ? props.searchPlaceholder : "Search"
        }
        value={inputValue}
        onChange={handleSearch}
      />
    </div>
  );
}
