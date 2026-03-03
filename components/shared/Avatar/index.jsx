import Image from "next/image";
import style from "./avatar.module.css";

//Assets

function Avatar({
  imgUrl,
  firstName,
  lastName,
  background,
  color,
  fontWeight,
}) {
  let shortName = firstName ? firstName[0].toUpperCase() : "";
  shortName += lastName ? lastName[0].toUpperCase() : "";
  return (
    <div
      className={style.avatarBorder}
      style={{
        background: background,
        color: color,
        borderColor: color,
        fontWeight: fontWeight,
      }}
    >
      {" "}
      {imgUrl == null ? (
        shortName
      ) : (
        <Image src={imgUrl} alt="" layout="fill" objectFit="contain" />
      )}
    </div>
  );
}

export default Avatar;
