const Button = ({
  children,
  className,
  size,
  variant,
  customText,
  onClick,
  disabled,
  title,
  onMouseEnter,
  onMouseLeave,
  type,
}) => {
  let width;
  let background;
  switch (size) {
    case "extrasmall":
      width = "w-extrasmall";
      break;
    case "small":
      width = "w-small";
      break;
    case "medium":
      width = "w-medium";
      break;
    case "semimedium":
      width = "w-semimedium";
      break;
    case "large":
      width = "w-large";
      break;
    default:
      width = "fit-content";
  }

  switch (variant) {
    case "primary":
      background = `${disabled ? "bg-zinc-800/10 hover:bg-zinc-800/10 cursor-not-allowed" : "bg-slate-300"}`;
      break;
    case "transparent":
      background = `${disabled ? "bg-zinc-800/10 hover:bg-zinc-800/10 cursor-not-allowed" : "white"}`;
      break;
    case "inverted":
      background = `${
        disabled
          ? "bg-zinc-800/10 hover:bg-zinc-800/10 cursor-not-allowed"
          : "bg-[#fef0e8] transition-colors duration-500 hover:bg-[#fDd9c4]"
      }`;
      break;
    case "gray":
      background = `${
        disabled
          ? "bg-zinc-800/10 hover:bg-zinc-800/10 cursor-not-allowed"
          : "bg-zinc-100 transition-colors duration-500 hover:bg-zinc-300"
      }`;
      break;
    default:
      background = `${
        disabled
          ? "bg-zinc-800/10 hover:bg-zinc-800/10 cursor-not-allowed"
          : "bg-primary transition-colors duration-500 hover:bg-[#D65F0A]"
      }`;
  }

  return (
    <button
      className={`flex gap-2.5 items-center justify-center text-xs font-bold tracking-tight py-2 ${
        className ? className : ""
      } ${width} ${background} ${
        customText ? customText : "text-white"
      } rounded-md py-1`}
      onClick={onClick}
      disabled={disabled}
      title={title}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      type={type ? type : "button"}
    >
      {children}
    </button>
  );
};

export default Button;
