import { profilePicture } from "@/utils/images";
import Image from "next/image";
import React from "react";
import { MdSearch } from "react-icons/md";
import Input from "./formPage/Input";

const Header = () => {
  return (
    <header className="flex justify-end items-center gap-4">
      <Image
        src={profilePicture}
        alt="profile-pic"
        height={30}
        width={30}
        className="cursor-pointer"
      />
    </header>
  );
};

export default Header;
