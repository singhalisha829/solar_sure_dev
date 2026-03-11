import { useState } from "react";
import { LocalStorageService } from "@/services/LocalStorageHandler";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import {
  BsFillBoxSeamFill,
  BsFillGrid1X2Fill,
  BsFillPeopleFill,
  BsChevronUp,
  BsChevronDown,
  BsBuildingFill,
  BsBuildingsFill,
  BsBoxSeamFill,
  BsFillCalendarRangeFill,
  BsFileRuledFill,
  BsFillFileEarmarkRuledFill,
  BsBriefcaseFill,
} from "react-icons/bs";
import {
  FaTruck,
  FaFileInvoiceDollar,
  FaCogs,
  FaMoneyCheckAlt,
  FaFile,
  FaUserCog,
  FaTruckMoving,
} from "react-icons/fa";
import {
  MdLogout,
  MdAdminPanelSettings,
  MdStore,
  MdPlaylistAddCheckCircle,
  MdReceiptLong,
} from "react-icons/md";
import { GiArchiveRegister } from "react-icons/gi";
import { BiSolidFactory, BiSolidReport } from "react-icons/bi";
import { IoDocumentAttachSharp } from "react-icons/io5";

const routes = [
  {
    name: "Dashboard",
    path: "/",
    icon: <BsFillGrid1X2Fill />,
  },
  // {
  //   name: "Workplace",
  //   path: "/workplace",
  //   icon: <BsBriefcaseFill className="h-[18px] w-[18px]" />,
  // },
  {
    name: "Projects",
    path: "/projects",
    icon: <BsFillPeopleFill className="h-[18px] w-[18px]" />,
  },
  {
    name: "Inventory",
    path: "/inventory",
    icon: <BsFillBoxSeamFill className="h-[18px] w-[18px]" />,
  },
  {
    name: "Site Visit",
    path: "/site-visits",
    icon: <BsFillCalendarRangeFill className="h-[16px] w-[16px]" />,
  },
  {
    name: "Project Registration",
    path: "/project-registration",
    icon: <GiArchiveRegister className="h-[18px] w-[18px]" />,
  },
  // {
  //   name: "Leads",
  //   path: "/leads",
  //   icon: <BsBuildingsFill className="h-[18px] w-[18px]" />,
  // },
  {
    name: "Purchase Order",
    path: "/purchase-order",
    icon: <MdReceiptLong className="h-[18px] w-[18px]" />,
  },
  {
    name: "Contingency List",
    path: "/contingency-list",
    icon: <IoDocumentAttachSharp className="h-[18px] w-[18px]" />,
  },
  {
    name: "Packing List",
    path: "",
    icon: <BsFillFileEarmarkRuledFill className="h-[18px] w-[18px]" />,
    subMenu: [
      {
        name: "Packing List",
        path: "/packing-list",
        icon: <MdPlaylistAddCheckCircle className="h-[20px] w-[20px]" />,
      },
      {
        name: "Invoices",
        path: "/invoices",
        icon: <FaFileInvoiceDollar className="h-[16px] w-[16px]" />,
      },
      {
        name: "Dispatch Details",
        path: "/transportation-details",
        icon: <FaTruck className="h-[16px] w-[16px]" />,
      },
    ],
  },
  // {
  //   name: "Reports",
  //   path: "",
  //   icon: <BiSolidReport className="h-[18px] w-[18px]" />,
  //   subMenu: [
  //     {
  //       name: "Ongoing Projects",
  //       path: "/reports/ongoing-projects",
  //       icon: <BsBuildingFill className="h-[14px] w-[14px]" />,
  //     },
  //     {
  //       name: "Payment Tracking",
  //       path: "/reports/payment-tracking",
  //       icon: <FaMoneyCheckAlt className="h-[14px] w-[14px]" />,
  //     },
  //     {
  //       name: "Project Report",
  //       path: "/reports/project-report",
  //       icon: <BiSolidReport className="h-[14px] w-[14px]" />,
  //     },
  //   ],
  // },
  {
    name: "Master",
    path: "",
    icon: <MdAdminPanelSettings className="h-[20px] w-[20px]" />,
    subMenu: [
      {
        name: "Companies",
        path: "/masters/companies",
        icon: <BsBuildingFill className="h-[14px] w-[14px]" />,
      },
      // {
      //   name: "Project Sites",
      //   path: "/masters/project-sites",
      //   icon: <BsBuildingsFill className="h-[14px] w-[14px]" />,
      // },
      {
        name: "Products",
        path: "/masters/products",
        icon: <BsBoxSeamFill className="h-[14px] w-[14px]" />,
      },
      {
        name: "Manufacturers",
        path: "/masters/manufacturers",
        icon: <BiSolidFactory className="h-[16px] w-[16px]" />,
      },
      {
        name: "Vendors",
        path: "/masters/vendors",
        icon: <MdStore className="h-[16px] w-[16px]" />,
      },
      {
        name: "BOM Templates",
        path: "/masters/bom-template",
        icon: <BsFileRuledFill className="h-[14px] w-[14px]" />,
      },
      {
        name: "EPCs",
        path: "/masters/epc",
        icon: <FaCogs className="h-[16px] w-[16px]" />,
      },
      {
        name: "Project Completion",
        path: "/masters/project-completion",
        icon: <FaFile className="h-[16px] w-[16px]" />,
      },
      {
        name: "Transporters",
        path: "/masters/transporter-list",
        icon: <FaTruckMoving className="h-[16px] w-[16px]" />,
      },
      {
        name: "Users",
        path: "/masters/users",
        icon: <BsFillPeopleFill className="h-[14px] w-[14px]" />,
      },
      {
        name: "Role Accesibility",
        path: "/masters/role-accessibility",
        icon: <FaUserCog className="h-[16px] w-[16px]" />,
      },
    ],
    width: 14,
  },
];

const Sidebar = ({ user, accessibility }) => {
  // const { setIsOpen } = useSheet();
  const router = useRouter();
  const currentUrl = router.asPath;
  const [subMenuState, setSubMenuState] = useState(
    routes.map((item) => !!item.subMenu && false)
  );

  const dropdownHandler = (index) => {
    setSubMenuState((prevSubMenus) => {
      const newSubMenuStates = [...prevSubMenus];
      newSubMenuStates[index] = !newSubMenuStates[index];
      return newSubMenuStates;
    });
  };

  const logout = () => {
    LocalStorageService.clear();
    router.push("/login");
  };

  return (
    <aside className="flex flex-col min-h-full gap-8 bg-charlestongreen py-8 text-white w-[180px] z-[5000]">
      {/* Logo */}
      <Link href={"/"} className="flex px-5 cursor-pointer justify-center">
        <Image
          src="https://solarsure.in/wp-content/uploads/2025/08/cropped-Landscape_Logo-scaled-1-203x33.png"
          width={203}
          height={33}
          alt="solar sure logo"
          className="custom-logo"
        />
      </Link>

      {/* Menu */}
      <nav>
        <ul className="flex flex-col gap-1 text-sm font-light">
          {routes.map((menuItem, index) => {
            // do not render menuitem if user doesnt have access to the page
            // Exception: Dashboard and Workplace are always visible
            if (
              menuItem.name !== "Dashboard" &&
              menuItem.name !== "Workplace" &&
              !accessibility?.accessibility[0][
                menuItem.name.toLowerCase().split(" ").join("_")
              ]?.page_view
            ) {
              return null;
            }

            return (
              <li key={menuItem.name}>
                <div
                  className="p-3 pl-0 hover:bg-gunmetal"
                  onClick={(e) =>
                    menuItem.subMenu ? dropdownHandler(index) : {}
                  }
                >
                  {menuItem.subMenu ? (
                    <span
                      className={`relative ml-4 flex cursor-pointer items-center gap-3`}
                    >
                      {menuItem.icon}
                      {menuItem.name}
                      {subMenuState[index] ? (
                        <BsChevronUp />
                      ) : (
                        <BsChevronDown />
                      )}
                    </span>
                  ) : (
                    <Link
                      className={`relative ml-4 flex cursor-pointer items-center gap-3 ${menuItem.path === currentUrl
                        ? "font-bold text-primary"
                        : ""
                        }`}
                      href={menuItem.path}
                    >
                      {menuItem.icon}
                      {menuItem.name}
                    </Link>
                  )}
                </div>

                {/* display list of submenus, if any */}
                {menuItem.subMenu && subMenuState[index] && (
                  <ul className="flex flex-col gap-1 text-sm font-light ml-6">
                    {menuItem.subMenu.map((subMenuItem, index) => {
                      if (
                        !(
                          accessibility?.accessibility[0][
                            menuItem.name.toLowerCase().split(" ").join("_")
                          ]?.pages &&
                          accessibility?.accessibility[0][
                            menuItem.name.toLowerCase().split(" ").join("_")
                          ]?.pages[
                            subMenuItem.name.toLowerCase().split(" ").join("_")
                          ]?.page_view
                        )
                      ) {
                        return null;
                      }

                      return (
                        <li key={subMenuItem.name}>
                          <div className="p-3 pl-0 hover:bg-gunmetal">
                            <Link
                              className={`relative ml-4 flex cursor-pointer items-center gap-3 ${subMenuItem.path === currentUrl
                                ? "font-bold text-primary"
                                : ""
                                }`}
                              href={subMenuItem.path}
                            >
                              {subMenuItem.icon}
                              {subMenuItem.name}
                            </Link>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="mx-auto mt-auto flex w-[80%] items-center justify-between rounded p-2  text-center">
        <span className="max-w-[120px] text-[14px]">{user?.name}</span>

        <MdLogout
          className="cursor-pointer text-primary"
          title="Logout"
          size={20}
          onClick={() => logout()}
        />
      </div>
    </aside>
  );
};

export default Sidebar;
