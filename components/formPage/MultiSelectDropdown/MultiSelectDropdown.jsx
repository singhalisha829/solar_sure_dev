import React, { useState, useRef, useEffect } from "react";
import { IoMdArrowDropdown, IoMdArrowDropup } from "react-icons/io";
import style from "./MultiSelectDropdown.module.css";
//Assets
import { RiCheckboxCircleFill } from "react-icons/ri";
import { MdOutlineClose } from "react-icons/md";
import { cn } from "@/utils/utils";

export function SimpleSelect({
  options,
  selected,
  setselected,
  activeOptionIndex,
  required,
  bgColor,
  color,
  padding,
  dropdownLabel,
  mandatory,
  margin,
  placeholder,
  fontsize,
  disableBorderLeft,
  disabled,
  minWidth,
  height,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [localOptions, setLocalOptions] = useState();
  // const [selectedOption, setSelectedOption] = useState('')
  const [selectedOption, setSelectedOption] = useState(selected);
  const clickRef = useRef();
  const toggling = () => {
    // if (!isOpen) {
    //   setIsOpen(!isOpen)
    // }
    setIsOpen((isOpen) => !isOpen);
  };

  const filterOptions = (e) => {
    //resetting the options on every render
    // setSelectedOption(null);
    //filtering the options
    let filteredOptions = options.filter((option) =>
      option.toLowerCase().includes(e.target.value.toLowerCase())
    );
    if (filteredOptions.length > 0) {
      setLocalOptions(filteredOptions);
      // setSelectedOption(filterOptions[0])
      setSelectedOption(filteredOptions[0]);
    } else {
      setLocalOptions([]);
    }
  };

  const onOptionClicked = (value, i) => {
    setSelectedOption(value);
    activeOptionIndex(i);
    setselected(value);
    setIsOpen(false);
  };
  const closeDropdown = (e) => {
    setIsOpen(false);
  };
  // Track events outside scope
  const clickOutside = (e) => {
    if (clickRef.current.contains(e.target)) {
      return;
    }
    // outside click
    setIsOpen(false);
  };
  useEffect(() => {
    //resetting the options on every render
    setLocalOptions(options);
    if (isOpen) {
      document.addEventListener("mousedown", clickOutside);
    }
    setSelectedOption(selected);
    return () => {
      document.removeEventListener("mousedown", clickOutside);
    };
  }, [isOpen, selected, options]);
  return (
    // <div
    //   className={`
    //     ${
    //       disabled
    //         ? `${style.dropdown} ${style.dropdownDisabled} `
    //         : `${style.dropdown} `
    //     }`}
    //   style={{
    //     margin: margin,
    //     fontSize: fontsize,
    //     backgroundColor: bgColor,
    //     minWidth: minWidth,
    //     height: height,
    //   }}
    //   ref={clickRef}
    //   unselectable='true'
    // >
    <div className="flex flex-col">
      {dropdownLabel ? (
        <label
          className="m-2 flex gap-[2px] text-xs capitalize"
          htmlFor={dropdownLabel}
        >
          {dropdownLabel}
          {mandatory && <span className="text-red-600">*</span>}
        </label>
      ) : null}
      <div
        className={`${
          disableBorderLeft
            ? style.tailwindCustomWithoutBorder
            : style.tailwindCustom
        } ${style.dropdown} ${disabled ? style.dropdownDisabled : ""}`}
        style={{
          margin: margin,
          fontSize: fontsize ?? "0.875rem",
          backgroundColor: bgColor,
          minWidth: minWidth,
          height: height,
        }}
        ref={clickRef}
        unselectable="true"
      >
        <div
          onClick={disabled ? () => {} : toggling}
          style={{ padding: padding ?? "0.35rem 1rem", color: color }}
          className={style.innerDiv}
        >
          <input
            onChange={(e) => {
              filterOptions(e);
              setSelectedOption(e.target.value);
            }}
            placeholder={placeholder ?? "Select"}
            value={selectedOption}
            required={required}
            disabled={disabled}
          />
          <div className={style.selectedOptionList}>
            <span
              onClick={(e) => {
                e.stopPropagation(); // Prevent the dropdown from toggling
                setSelectedOption(""); // Clear the selected option
                setselected(""); // Clear the selected value
              }}
            >
              <MdOutlineClose />
            </span>
            {isOpen ? (
              <IoMdArrowDropup color={color} />
            ) : (
              <IoMdArrowDropdown color={color} />
            )}
          </div>
        </div>
        {isOpen && (
          <ul
            onMouseLeave={() => closeDropdown()}
            className={`h-30 overflow-y-scroll ${style.ul}`}
          >
            {localOptions !== undefined && localOptions.length > 0 ? (
              localOptions.map((option, i) => (
                <li onClick={() => onOptionClicked(option, i)} key={i}>
                  {option}
                </li>
              ))
            ) : (
              <li>No Options</li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}

/* Multiple Select Dropdown */
export function MultiSelect({
  options,
  optionName,
  selected,
  setselected,
  required,
  bgColor,
  color,
  padding,
  margin,
  dropdownLabel,
  placeholder,
  fontsize,
  disabled,
  minWidth,
  mandatory,
  className,
  // Custom Fields added for Ornate
  height,
  form,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [localOptions, setLocalOptions] = useState();
  const [selectedOption, setSelectedOption] = useState(selected);
  const [searchString, setSearchString] = useState("");
  let selectedOptionsLength = selected.length;
  const clickRef = useRef();
  const toggling = () => setIsOpen(!isOpen);
  const filterOptions = (e) => {
    let filteredOptions = options.filter((option) =>
      option[optionName].toLowerCase().includes(e.target.value.toLowerCase())
    );
    if (filteredOptions.length > 0) {
      setLocalOptions(filteredOptions);
    } else {
      setLocalOptions([]);
    }
  };

  const handleSelect = async (e, option) => {
    e.stopPropagation();

    const found = selectedOption.find(
      (s) => s[optionName] === option[optionName]
    );
    if (found) {
      const newSelected = selectedOption.filter(
        (s) => s[optionName] !== option[optionName]
      );
      setSelectedOption(newSelected);
      setselected(newSelected);

      return;
    }
    const existSelection = [...selected, option];
    setSelectedOption(existSelection);
    setselected(existSelection);
  };

  const closeDropdown = (e) => {
    setIsOpen(false);
  };
  // Track events outside scope
  const clickOutside = (e) => {
    if (clickRef.current.contains(e.target)) {
      return;
    }
    // outside click
    setIsOpen(false);
  };
  useEffect(() => {
    //reset local options
    setLocalOptions(options);
    //cleaning last searched
    setSearchString("");
    if (isOpen) {
      document.addEventListener("mousedown", clickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", clickOutside);
    };
  }, [selectedOption, isOpen]);

  return (
    <div
      className={cn(`flex flex-col gap-[10px] w-full`, className)}
      ref={clickRef}
    >
      {dropdownLabel && (
        <label
          className="flex gap-[2px] text-xs capitalize  text-zinc-800 font-bold tracking-tight"
          htmlFor={dropdownLabel}
        >
          {dropdownLabel}
          {mandatory && <span className="text-red-600">*</span>}
        </label>
      )}
      <div
        className={`${
          disabled
            ? `${style.dropdown} ${style.dropdownDisabled} `
            : `${style.dropdown} `
        } ${
          form
            ? "transition-[border] hover:border-l-[10px] hover:border-primary"
            : ""
        } `}
        style={{
          margin: margin,
          fontSize: fontsize,
          backgroundColor: bgColor,
          minWidth: minWidth,
          height: height,
        }}
      >
        <div
          onClick={() => (!disabled ? toggling() : {})}
          style={{ padding: padding, color: color }}
          className={`${style.innerDiv} ${style.multipleSelectInnerDiv} `}
        >
          {isOpen ? (
            <input
              onChange={(e) => {
                filterOptions(e);
                setSearchString(e.target.value);
                /* setSelectedOption(e.target.value); */
              }}
              placeholder={placeholder}
              value={searchString}
              required={required}
              autoFocus
              disabled={disabled}
            />
          ) : (
            <div className={style.selectedOptionList}>
              {selected.length == 0 ? (
                <p className="text-lightgrey">{placeholder}</p>
              ) : (
                <p title={selected.map((item) => item[optionName])}>
                  {selected[selectedOptionsLength - 1][optionName]}{" "}
                  {selectedOptionsLength > 1 && `+ ${selected.length - 1}`}
                </p>
              )}
            </div>
          )}
          <div className={style.selectedOptionList}>
            <span
              onClick={(e) => {
                e.stopPropagation();
                setselected([]);
                setSelectedOption([]);
              }}
            >
              <MdOutlineClose />
            </span>

            {isOpen ? (
              <IoMdArrowDropup color={color} />
            ) : (
              <IoMdArrowDropdown color={color} />
            )}
          </div>
        </div>{" "}
        {isOpen && (
          <ul
            onMouseLeave={() => closeDropdown()}
            style={{
              listStyle: "none",
              padding: "0",
            }}
            className={style.ul}
          >
            {localOptions !== undefined && localOptions.length > 0 ? (
              localOptions.map((option, index) => {
                const isSelected = selectedOption.find(
                  (s) => s[optionName] === option[optionName]
                );
                return (
                  <li onClick={(e) => handleSelect(e, option)} key={index}>
                    <div className={style.multiselectOption}>
                      {isSelected ? (
                        <p className={style.selectedText}>
                          <RiCheckboxCircleFill color="var(--blue)" />
                        </p>
                      ) : (
                        <p className={style.selectedText}>
                          <RiCheckboxCircleFill />
                        </p>
                      )}
                      <p className="m-0 ">{option[optionName]}</p>
                    </div>
                  </li>
                );
              })
            ) : (
              <li style={{ cursor: "no-drop" }}>
                <div className={style.multiselectOption}>
                  <p className="m-0 dark:text-white">No options available</p>
                </div>
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}

export function SelectForObjects({
  options,
  optionName,
  optionID,
  selected,
  setselected,
  required,
  bgColor,
  color,
  padding,
  margin,
  mandatory,
  disableBorderLeft,
  dropdownLabel,
  placeholder,
  fontsize,
  disabled,
  height,
  minWidth,
  width,
  optionOtherKeys,
  optionNameSeperator,
  canAdd = false,
  toAddName,
  onAddClick = () => {},
  className,
  error,
  dropdownType,
  productDescriptionKey,
}) {
  const [isOpen, setIsOpen] = useState(false);
  // const [localOptions, setLocalOptions] = useState()
  const [localOptions, setLocalOptions] = useState(options);
  const [selectedOption, setSelectedOption] = useState("");
  const inputRef = useRef();
  const selectForObjClickRef = useRef();

  const toggling = () => {
    if (!disabled) {
      if (isOpen) {
        inputRef.current.blur();
      } else {
        inputRef.current.focus();
      }

      setIsOpen(!isOpen);
    }
  };

  const filterOptions = (e) => {
    let filteredOptions = options.filter((option) =>
      option[optionName].toLowerCase().includes(e.target.value.toLowerCase())
    );
    if (filteredOptions.length > 0) {
      setLocalOptions(filteredOptions);
    } else {
      setLocalOptions([]);
      setSelectedOption(null);
    }
  };
  const onOptionClicked = (value, i) => {
    setSelectedOption(value[optionName]);
    // activeOptionIndex(value[optionID]);
    setselected(value[optionName], value[optionID]);
    setIsOpen(false);
  };
  // useEffect(() => {
  //   setLocalOptions(options)

  //   setSelectedOption(selected)
  // }, [isOpen, selected, options])

  useEffect(() => {
    setLocalOptions(options);
    setSelectedOption(selected);

    if (isOpen) {
      document.addEventListener("mousedown", clickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", clickOutside);
    };
  }, [isOpen, options, selected]);

  // Track events outside scope
  const clickOutside = (e) => {
    if (selectForObjClickRef.current.contains(e.target)) {
      return;
    }
    // outside click
    setIsOpen(false);
  };
  return (
    <div
      className={cn(`flex flex-col gap-[10px] w-full`, className)}
      ref={selectForObjClickRef}
    >
      {dropdownLabel && (
        <label
          className="flex gap-[2px] text-xs capitalize  text-zinc-800 font-bold tracking-tight"
          htmlFor={dropdownLabel}
        >
          {dropdownLabel}
          {mandatory && <span className="text-red-600">*</span>}
        </label>
      )}
      <div
        className={`${
          disableBorderLeft
            ? style.tailwindCustomWithoutBorder
            : style.tailwindCustom
        } ${style.dropdown} ${disabled ? style.dropdownDisabled : ""}`}
        style={{
          margin: margin,
          fontSize: fontsize ?? "0.875rem",
          borderColor: error ? "red" : "",
          boxShadow: error ? "0 2px 6px -3px #DC2626" : "",
          backgroundColor: bgColor,
          minWidth: minWidth,
          height: height,
          width: width,
        }}
        unselectable="true"
      >
        <div
          onClick={toggling}
          style={{ padding: padding ?? "0.35rem 1rem", color: color }}
          className={style.innerDiv}
        >
          <input
            onChange={(e) => {
              filterOptions(e);
              setSelectedOption(e.target.value);
            }}
            placeholder={placeholder ?? "Select.."}
            value={selectedOption || ""}
            required={required}
            disabled={disabled}
            ref={inputRef}
          />
          <div className={style.selectedOptionList}>
            <span
              onClick={(e) => {
                e.stopPropagation(); // Prevent the dropdown from toggling
                setSelectedOption(""); // Clear the selected option
                setselected("", ""); // Clear the selected value
              }}
            >
              <MdOutlineClose className="bg-white" />
            </span>

            {isOpen ? (
              <IoMdArrowDropup color={color} />
            ) : (
              <IoMdArrowDropdown color={color} />
            )}
          </div>
        </div>
        {/* display this text when required field is empty */}
        {error && error !== "" && (
          <p className="text-xs text-start pl-1 text-red-500 mt-1">{error}</p>
        )}
        {isOpen && (
          <ul className={`${style.ul} w-full p-10`}>
            {localOptions !== undefined && localOptions.length > 0 ? (
              localOptions.map((option, i) => (
                <li
                  className="p-10"
                  onClick={() => onOptionClicked(option, i)}
                  key={i}
                >
                  {dropdownType === "product_list"
                    ? `${option[optionName]}(${option[productDescriptionKey]})`
                    : option[optionName]}
                  {optionOtherKeys &&
                    optionOtherKeys.map(
                      (key) =>
                        (option[key] !== "" ? optionNameSeperator : "") +
                        option[key]
                    )}
                </li>
              ))
            ) : (
              <li>No Options</li>
            )}
            {canAdd && (
              <li
                onClick={() => {
                  setIsOpen(false);
                  onAddClick();
                }}
                className={`${style.add_text}`}
              >
                + Add {toAddName && toAddName}
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
