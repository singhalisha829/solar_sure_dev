import { cn } from "@/utils/utils";
import { FaEye } from "react-icons/fa";

const Input = ({
  name,
  type,
  label,
  value,
  onChange,
  min,
  max,
  minDate,
  onBlur,
  readOnly,
  placeholder,
  radio,
  radioOptions,
  disabled,
  disableBorderLeft,
  radioOptionValue,
  onRadioOptionChange,
  mandatory,
  onClick,
  width,
  fileTypes,
  textareaRows,
  fileUrl,
  ...restProps
}) => {
  return (
    <div
      className={`relative flex flex-col gap-2.5 ${width ? `w-[${width}]` : "w-full"} ${restProps.outerClass ? restProps.outerClass : ""}`}
    >
      {label && (
        <label
          className="flex gap-[2px] text-xs capitalize text-zinc-800 font-bold tracking-tight"
          htmlFor={label}
        >
          {label}
          {mandatory && <span className="text-red-600">*</span>}
        </label>
      )}
      {["text", "number", "date", "email", "checkbox"].includes(type) && (
        <>
          {" "}
          <input
            // className='p-2 text-lg rounded-md border-1'
            className={cn(
              `rounded-md border-1 p-2 text-sm transition-[border] focus-visible:border-primary focus-visible:outline-primary w-full`,
              disableBorderLeft ? "" : "focus-visible:border-l-[10px]",
              restProps.className,
              restProps.error ? "border-red-500 shadow-md shadow-red-200 " : ""
            )}
            type={type}
            id={label}
            value={value || ""}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            min={type == "date" ? minDate : min}
            max={max}
            onClick={onClick}
            disabled={disabled}
            readOnly={readOnly}
            checked={restProps.checked}
            name={name ? name : ""}
          />
          {/* display this text when required field is empty */}
          {restProps.error && restProps.error !== "" && (
            <p className="text-xs pl-1 text-red-500 mt-1">{restProps.error}</p>
          )}
        </>
      )}
      {type === "textarea" && (
        <>
          <textarea
            className={`rounded-md border-1 p-2 text-sm transition-[border] focus-visible:border-l-[10px] focus-visible:border-primary focus-visible:outline-primary
          ${restProps.error ? "border-red-500 shadow-md shadow-red-200 " : ""} 
          `}
            id={label}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            min={min}
            max={max}
            disabled={disabled}
            readOnly={readOnly}
            value={value}
            rows={textareaRows}
            name={name ? name : ""}
          />
          {/* display this text when required field is empty */}
          {restProps.error && restProps.error !== "" && (
            <p className="text-xs pl-1 text-red-500 mt-1">{restProps.error}</p>
          )}
        </>
      )}

      {type === "file" && (
        <>
          <div className="flex gap-2 items-center"><input
            // className='p-2 text-lg rounded-md border-1'
            className={`rounded-md border-1 p-2 text-sm transition-[border] focus-visible:border-primary focus-visible:outline-primary w-full ${disableBorderLeft ? "" : "focus-visible:border-l-[10px]"
              } ${restProps.className ? restProps.className : ""} ${restProps.error ? "border-red-500 shadow-md shadow-red-200 " : ""
              }  
        `}
            type={type}
            id={label}
            onChange={onChange}
            onClick={onClick}
            accept={fileTypes}
            disabled={disabled}
            name={name ? name : ""}
          />
            {fileUrl && (
              <FaEye
                size={20}
                className="cursor-pointer mb-3"
                onClick={() => window.open(fileUrl, "__blank")}
              />)}
          </div>
          {/* display this text when required field is empty */}
          {restProps.error && restProps.error !== "" ? (
            <p className="text-xxsmall pl-1 text-red mt-1">{restProps.error}</p>
          ) : null}
        </>
      )}
      {radio && (
        <>
          <div className=" flex">
            {radioOptions.map((radioOption) => {
              return (
                <div key={radioOption.option} className="mr-6">
                  {" "}
                  <label className="gap-[2px] mr-2 text-xs capitalize text-zinc-800 font-bold tracking-tight">
                    {radioOption.option}
                  </label>
                  <input
                    onChange={onRadioOptionChange}
                    type="radio"
                    name="connection"
                    value={radioOption.value}
                    checked={radioOptionValue == radioOption.value}
                  />{" "}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default Input;
