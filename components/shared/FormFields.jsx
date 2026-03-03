import Input from "../pageComponents/formPage/Input";
import { SelectForObjects } from "../pageComponents/formPage/MultiSelectDropdown/MultiSelectDropdown";

const FormFields = (props) => {
  if (props.type == "text" || props.type == "number" || props.type == "email") {
    return (
      <input
        className="border-1 text-[14px] text-[#2C3948] border-[#D9D9D9] w-[90%] rounded p-1"
        type={props.type}
        value={props.value}
        onChange={(e) => props.handleChange(e.target.value)}
      ></input>
      //   <Input
      //   placeholder={props.placeholder}
      //   type={props.type}
      //   value={props.value}
      //   onChange={(e)=>props.handleChange(e.target.value)}
      //   label={props.label}
      // />
    );
  } else if (props.type == "date") {
    return (
      <input
        className="border-1 text-[14px] text-[#2C3948] border-[#D9D9D9] w-[90%] rounded p-1"
        type={props.type}
        value={props.value}
        onChange={(e) => props.handleChange(e.target.value)}
      ></input>
      //   <Input
      //   placeholder={props.placeholder}
      //   type={props.type}
      //   value={props.value}
      //   onChange={(e)=>props.handleChange(e.target.value)}
      //   label={props.label}
      // />
    );
  } else if (props.type == "checkbox") {
    return (
      // <div className={`flex relative flex-col`}>
      // <label className='m-2 text-xs capitalize ' htmlFor={props.label}>
      //   {props.label}
      // </label>
      <input
        className="border-1 text-[14px] text-[#2C3948] border-[#D9D9D9] w-[10%] mt-[5px] rounded p-1"
        type={props.type}
        checked={props.value}
        onChange={(e) => {
          props.handleChange(e.target.checked);
        }}
      ></input>
      // </div>
    );
  } else if (props.type == "single_select_dropdown") {
    return (
      <div className="flex flex-col basis-1/3 w-[90%]">
        <select
          className="p-1 text-sm rounded-md border-1"
          onChange={(e) => {
            props.handleChange(e.target.value);
          }}
          disabled={props.disabled}
          value={props.value}
        >
          <option style={{ display: "none" }}>
            {props.placeholder ? props.placeholder : "Select.."}
          </option>
          {props.options.length > 0
            ? props.options.map((option, index) => {
                return (
                  <option key={index} value={option[props.optionId]}>
                    {option[props.optionName]}
                  </option>
                );
              })
            : null}
        </select>
        {/* <SelectForObjects
                    height='auto'
                    margin='0'
                    padding='0.5rem'
                    options={props.options}
                    optionName={props.optionName}
                    optionID={props.optionId}
                    setselected={(name, id) => {
                      props.handleChange(id);
                    }}
                    selected={props.value}
                    dropdownLabel={props.label}
                  /> */}
      </div>
    );
  }
};

export default FormFields;
