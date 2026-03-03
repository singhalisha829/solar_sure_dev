import React from "react";
import { useEffect, useState } from "react";
import Button from "@/components/shared/Button";
import { useModal } from "@/contexts/modal";
import ManageApproval from "@/components/modals/ManageApprovalModal";
import { useRouter } from "next/router";
import { requestHandler } from "@/services/ApiHandler";
import { getRegisteredProjectDetail } from "@/services/api";
import { toast } from "sonner";
import { LocalStorageService } from "@/services/LocalStorageHandler";
import { convertToWords, formatPrice } from "@/utils/numberHandler";
import { dateFormat } from "@/utils/formatter";
import { MdArrowForwardIos } from "react-icons/md";
import { Badge } from "@/components/shared/Badge";

const PreviewProject = () => {
  const router = useRouter();
  const { openModal } = useModal();
  const [formDetails, setFormDetails] = useState();
  const [isApprovalButtonDisabled, setIsApprovalButtonDisabled] =
    useState(true);
  const [totalCostPerWP, setTotalCostPerWP] = useState(0);
  const [totalProjectCapacity, setTotalProjectCapacity] = useState(0);
  const [projectId, setProjectId] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  const accessibilityInfo =
    LocalStorageService.get("user_accessibility")?.accessibility[0]
      .project_registration ?? {};

  const companyAccessibility =
    LocalStorageService.get("user_accessibility")?.accessibility[0]
      ?.company_access?.both_company ?? false;

  const solarSectionColumnList = [
    { name: "MANUFACTURER", key: "Product_name", width: "10%" },
    { name: "MODEL", key: "model_name", width: "10%" },
    // { name: (<span>UPLOAD<br/> DATASHEET</span>),type:"file",key:"upload_datasheet", width: "100px" },
    { name: "WATTAGE (WP)", key: "wattage", width: "10%", type: "amount" },
    { name: "QUANTITY", key: "quantity", width: "5%" },
    {
      name: (
        <span>
          PROJECT
          <br /> CAPACITY (WP)
        </span>
      ),
      key: "project_capacity",
      width: "13%",
      type: "amount",
    },
    {
      name: (
        <span>
          CONSIDERED
          <br /> PRICE
        </span>
      ),
      key: "considered_price",
      key2: "considered_price_unit",
      type: "amount",
      width: "5%",
    },
    { name: "AMOUNT (₹)", key: "amount", type: "amount", width: "5%" },
    {
      name: (
        <span>
          TRANS
          <br />
          PORTATION (₹)
        </span>
      ),
      key: "transportation",
      type: "amount",
      width: "12%",
    },
    {
      name: (
        <span>
          TOTAL
          <br /> AMOUNT (₹)
        </span>
      ),
      key: "total_amount",
      type: "amount",
      width: "5%",
    },
    { name: "REMARKS", key: "remark", width: "25%" },
  ];

  const bosSectionColumnList = [
    { name: "PRODUCT", key: "Product", width: "10%" },
    {
      name: (
        <span>
          PRODUCT
          <br /> SPECIFICATION
        </span>
      ),
      key: "product_specification",
      width: "10%",
    },
    // { name: (<span>UPLOAD<br/> DATASHEET</span>),type:"file",key:"upload_datasheet", width: "140px" },
    {
      name: (
        <span>
          UNIT OF
          <br /> MEASUREMENT
        </span>
      ),
      key: "unit_name",
      width: "10%",
    },
    { name: "QUANTITY", key: "quantity", width: "5%" },
    {
      name: (
        <span>
          PROJECT
          <br /> CAPACITY (WP)
        </span>
      ),
      displayValue: totalProjectCapacity,
      width: "13%",
      type: "amount",
    },
    {
      name: (
        <span>
          CONSIDERED
          <br /> PRICE
        </span>
      ),
      key: "considered_price",
      key2: "considered_price_unit",
      type: "amount",
      width: "5%",
    },
    { name: "AMOUNT (₹)", key: "amount", width: "5%", type: "amount" },
    {
      name: (
        <span>
          TRANS
          <br />
          PORTATION (₹)
        </span>
      ),
      key: "transportation",
      displayType: "amount",
      width: "12%",
    },
    {
      name: (
        <span>
          TOTAL
          <br /> AMOUNT (₹)
        </span>
      ),
      key: "total_amount",
      type: "amount",
      width: "5%",
    },
    { name: "REMARKS", key: "remark", width: "25%" },
  ];

  const othersSectionColumnList = [
    {
      name: "WORK DESCRIPTION",
      key: "Product",
      width: "10%",
    },
    { name: "SCOPE OF WORK", key: "scope_of_work", width: "10%" },
    // { name: (<span>UPLOAD<br/> DATASHEET</span>),type:"file",key:"upload_datasheet", width: "140px" },
    {
      name: (
        <span>
          PROJECT
          <br /> DAYS
        </span>
      ),
      type: "number",
      key: "project_days",
      width: "10%",
    },
    {
      name: (
        <span>
          MANPOWER
          <br /> EXPECTED
        </span>
      ),
      type: "number",
      key: "manpower_expected",
      width: "5%",
    },
    {
      name: (
        <span>
          PROJECT
          <br /> CAPACITY (WP)
        </span>
      ),
      displayValue: totalProjectCapacity,
      type: "amount",
      width: "13%",
    },
    {
      name: (
        <span>
          CONSIDERED
          <br /> PRICE
        </span>
      ),
      key: "considered_price",
      key2: "considered_price_unit",
      type: "amount",
      width: "5%",
    },
    { name: "AMOUNT (₹)", key: "amount", type: "amount", width: "5%" },
    {
      name: (
        <span>
          TRANS
          <br />
          PORTATION (₹)
        </span>
      ),
      key: "transportation",
      type: "amount",
      width: "12%",
    },
    {
      name: (
        <span>
          TOTAL
          <br /> AMOUNT (₹)
        </span>
      ),
      key: "total_amount",
      type: "amount",
      width: "10%",
    },
    { name: "REMARKS", key: "remark", width: "25%" },
  ];

  useEffect(() => {
    if (router.query.id) {
      getProjectDetails(router.query.id);
      setProjectId(router.query.id);
    }
  }, [router.query]);

  const getProjectDetails = async (id) => {
    await requestHandler(
      async () => await getRegisteredProjectDetail(id),
      null,
      (data) => {
        const details = data.data.output[0];
        let total = 0,
          total_project_capacity = 0;

        // calculate total project capacity
        let are_solar_panels_added = false;
        details.product_section.map((section) => {
          total += Number(section.cost);
          if (section.section === "Solar Panels") {
            are_solar_panels_added = true;
            section.product_details.map(
              (product) =>
                (total_project_capacity += Number(product.project_capacity))
            );
          }
        });
        setTotalCostPerWP(total);

        if (!are_solar_panels_added) {
          total_project_capacity = Number(details.po_capacity_in_kw) * 1000;
        }
        setTotalProjectCapacity(total_project_capacity);

        if (details.layout !== "" && typeof details.layout === "string") {
          details.layout = JSON.parse(details.layout);
        }
        if (
          details.other_documents !== "" &&
          typeof details.other_documents === "string"
        ) {
          details.other_documents = JSON.parse(details.other_documents);
        }

        if (details.freight_charges_unit === "per_wp") {
          details.freight_charges =
            Number(details.freight_charges || 0) *
            Number(total_project_capacity || 0);
        }

        if (details.profit_margin_unit === "per_wp") {
          details.profit_margin =
            Number(details.profit_margin || 0) *
            Number(totalProjectCapacity || 0);
        } else if (details.profit_margin_unit === "percentage") {
          details.profit_margin =
            (Number(details.net_amount || 0) *
              Number(details.profit_margin || 0)) /
            100;
        }
        setFormDetails(details);

        const user = LocalStorageService.get("user");
        setUserInfo(user);
        if (
          user &&
          (user.role === details.approval_role ||
            user.name === details.approval_role)
        ) {
          setIsApprovalButtonDisabled(false);
        }
        //  setIsLoading(false)
      },
      toast.error
    );
  };
  return (
    <div className="print:h-fit bg-white rounded p-5 text-sm print:text-xs">
      <div className="mt-1 mb-4 flex justify-between cursor-pointer relative gap-2 border-0 text-xl">
        <h1 className="print:mx-auto flex">
          <span
            className="flex text-primary hover:underline underline-offset-4 print:hidden cursor-pointer"
            onClick={() => router.push("/project-registration")}
          >
            Project Registration
          </span>
          <MdArrowForwardIos className="mt-1 print:hidden text-primary" />
          Generate Project
        </h1>

        <div className="flex gap-2 items-center print:hidden">
          {((formDetails?.last_approver_status !== "Approved" &&
            accessibilityInfo?.edit_page) ||
            (formDetails?.last_approver_status === "Approved" &&
              userInfo?.role === "admin")) && (
              <Button
                className="px-3 w-[4rem]"
                onClick={() => router.push(`generate-project?id=${projectId}`)}
              >
                Edit
              </Button>
            )}

          {!formDetails?.is_project_created && (
            <Button
              className="px-3"
              onClick={() => openModal("manage-approval")}
              disabled={isApprovalButtonDisabled}
            >
              Manage Approval
            </Button>
          )}

          <Button className="px-3" onClick={() => window.print()}>
            Download
          </Button>
        </div>
      </div>

      <ManageApproval onSuccessfullSubmit={() => window.location.reload()} />

      <div className=" flex-col gap-2.5 print:gap-1 w-full">
        <div className="grid grid-cols-2 gap-3 print:gap-1 w-full mb-4">
          <span>
            <strong>Date:</strong> {dateFormat(formDetails?.date)}
          </span>
          <span>
            <strong>Registration No:</strong> {formDetails?.registration_no}
          </span>
          <span>
            <strong>Project Type:</strong> {formDetails?.type_of_project}
          </span>
          {companyAccessibility && (
            <span>
              <strong>Company Type:</strong>{" "}
              {formDetails?.is_ornate_project ? "Ornate" : "SG Ornate"}
            </span>
          )}
          <span>
            <strong>Customer:</strong> {formDetails?.company_name}
          </span>
          <span>
            <strong>GST No:</strong> {formDetails?.gst_no}
          </span>
          <span>
            <strong>Project Site:</strong> {formDetails?.project_site_name}
          </span>
          <span>
            <strong>Porject Site POC:</strong>{" "}
            {formDetails?.project_site_poc_name},{" "}
            {formDetails?.project_site_poc_phone}
          </span>
          <span>
            <strong>Billing Address:</strong> {formDetails?.billing_address},{" "}
            {formDetails?.billing_city}, {formDetails?.billing_pincode}
          </span>
          <span>
            <strong>Delivery Schedule:</strong>{" "}
            {dateFormat(formDetails?.delivery_schedule)}
          </span>
          <span className="print:hidden">
            <strong>PO Copy:</strong>{" "}
            {formDetails?.po_copy && (
              <span
                className="underline underline-offset-4 cursor-pointer"
                onClick={() => window.open(formDetails.po_copy, "__blank")}
              >
                View
              </span>
            )}
          </span>
          <span className="print:hidden">
            <strong>Final Offer Copy:</strong>{" "}
            {formDetails?.final_offer_copy && (
              <span
                className="underline underline-offset-4 cursor-pointer"
                onClick={() =>
                  window.open(formDetails.final_offer_copy, "__blank")
                }
              >
                View
              </span>
            )}
          </span>
          <span>
            <strong>PO Date:</strong> {dateFormat(formDetails?.po_date)}
          </span>
          <span>
            <strong>PO Value (Without GST):</strong> ₹{" "}
            {formatPrice(formDetails?.po_value_without_gst)}
          </span>
          <span>
            <strong>PO Value (With GST):</strong> ₹{" "}
            {formatPrice(formDetails?.po_value_with_gst)}
          </span>
          <span>
            <strong>PO Capacity:</strong>{" "}
            {formatPrice(formDetails?.po_capacity_in_kw)} KW
          </span>
          <span>
            <strong>Project Site Area:</strong>{" "}
            {formatPrice(formDetails?.project_site_area_in_sq_feet)} Sq. Ft
          </span>
          <span className="flex print:hidden">
            <strong>Layout:</strong>{" "}
            {formDetails?.layout.length > 0 &&
              typeof formDetails.layout !== "string" && (
                <span className="ml-2 flex flex-wrap gap-2.5">
                  {formDetails.layout.map((drawing, index) => {
                    return (
                      <span
                        key={index}
                        className="underline underline-offset-4 cursor-pointer"
                        onClick={() => window.open(drawing.drawing, "__blank")}
                      >
                        {drawing.name}
                      </span>
                    );
                  })}
                </span>
              )}
          </span>
          <span className="flex print:hidden">
            <strong>Other Documents:</strong>{" "}
            {formDetails?.other_documents?.length > 0 && (
              <span className="ml-2 flex flex-wrap gap-2.5">
                {formDetails.other_documents.map((drawing, index) => {
                  return (
                    <span
                      key={index}
                      className="underline underline-offset-4 cursor-pointer"
                      onClick={() => window.open(drawing.document, "__blank")}
                    >
                      {drawing.document_name}
                    </span>
                  );
                })}
              </span>
            )}
          </span>
          <span>
            <strong>Sales Lead:</strong> {formDetails?.sales_lead}
          </span>
          <span>
            <strong>Created By:</strong> {formDetails?.created_by}
          </span>
          <span>
            <strong>Project Approved By:</strong> {formDetails?.last_approver}
          </span>

          <span className="flex gap-2 items-end">
            <strong>Approval Status:</strong>{" "}
            <Badge
              variant={formDetails?.last_approver_status
                .replaceAll(/[.()]/g, "")
                .replaceAll(" ", "_")
                .toLowerCase()}
            >
              {formDetails?.last_approver_status}
            </Badge>
          </span>

          <span className="col-span-2">
            <strong>Remark:</strong> {formDetails?.remark}
          </span>
        </div>

        <div className="overflow-auto">
          <table className="border-1 text-xs print:text-[0.5rem] print:leading-3 font-semibold w-full">
            <tbody>
              {formDetails?.product_section.length > 0 &&
                formDetails.product_section.map((section, sectionIndex) => {
                  return (
                    <React.Fragment key={sectionIndex}>
                      {["Solar Inverter", "Solar Panels"].includes(
                        section.section
                      ) && (
                          <React.Fragment key={sectionIndex}>
                            <tr className=" border-b-1 font-bold bg-backgroundgrey">
                              <td
                                className="text-primary print:p-1  px-4 py-3 "
                                colSpan={solarSectionColumnList.length}
                              >
                                {section.section}
                              </td>
                            </tr>
                            <tr className=" border-b-1 font-bold bg-backgroundgrey">
                              {/* <td className="text-primary print:p-1  px-4 py-3 w-[10%] border-r-1">
                      </td> */}

                              {solarSectionColumnList.map(
                                (column, columnIndex) => (
                                  <td
                                    key={columnIndex}
                                    className={`print:p-1 px-4 py-3 border-r-1`}
                                    style={{ width: column.width }}
                                  >
                                    {column.name}
                                  </td>
                                )
                              )}
                            </tr>
                          </React.Fragment>
                        )}

                      {["BOS-Structure", "BOS-Electrical"].includes(
                        section.section
                      ) && (
                          <React.Fragment key={sectionIndex}>
                            <tr className=" border-b-1 font-bold bg-backgroundgrey">
                              <td
                                className="text-primary print:p-1  px-4 py-3 "
                                colSpan={bosSectionColumnList.length}
                              >
                                {section.section}
                              </td>
                            </tr>
                            <tr className=" border-b-1 font-bold bg-backgroundgrey">
                              {/* <td className="text-primary print:p-1 px-4 py-3 w-[10%] border-r-1">
                        {section.section}
                      </td> */}

                              {bosSectionColumnList.map((column, columnIndex) => (
                                <td
                                  key={columnIndex}
                                  className={`print:p-1 px-4 py-3 border-r-1`}
                                  style={{ width: column.width }}
                                >
                                  {column.name}
                                </td>
                              ))}
                            </tr>
                          </React.Fragment>
                        )}

                      {[
                        "Installation & Commissioning",
                        "Net Metering and Liasioning",
                        "Miscellaneous",
                      ].includes(section.section) && (
                          <React.Fragment key={sectionIndex}>
                            <tr className=" border-b-1 font-bold bg-backgroundgrey">
                              <td
                                className="text-primary print:p-1  px-4 py-3 "
                                colSpan={othersSectionColumnList.length}
                              >
                                {section.section}
                              </td>
                            </tr>
                            <tr className=" border-b-1 font-bold bg-backgroundgrey">
                              {/* <td className="text-primary print:p-1 px-4 py-3 w-[10%] border-r-1">
                        {section.section}
                      </td> */}

                              {othersSectionColumnList.map(
                                (column, columnIndex) => (
                                  <td
                                    key={columnIndex}
                                    className={`print:p-1 px-4 py-3 border-r-1`}
                                    style={{ width: column.width }}
                                  >
                                    {column.name}
                                  </td>
                                )
                              )}
                            </tr>
                          </React.Fragment>
                        )}

                      {section.product_details.length > 0 ? (
                        section.product_details.map((product, productIndex) => {
                          if (
                            ["Solar Inverter", "Solar Panels"].includes(
                              section.section
                            )
                          ) {
                            return (
                              <tr
                                key={sectionIndex + "-" + productIndex}
                                className=" border-b-1"
                              >
                                {/* <td className="text-primary px-4 py-3 w-[25%] border-r-1"></td> */}
                                {solarSectionColumnList.map(
                                  (column, columnIndex) => (
                                    <td
                                      key={columnIndex}
                                      className={`print:p-1 px-4 py-3 border-r-1`}
                                      style={{ width: column.width }}
                                    >
                                      {column?.type === "amount" ? (
                                        <>
                                          {column.displayValue
                                            ? formatPrice(column.displayValue)
                                            : formatPrice(
                                              product[column.key]
                                            )}{" "}
                                          {product[column.key2] ?? ""}{" "}
                                        </>
                                      ) : (
                                        <>
                                          {product[column.key]}{" "}
                                          {product[column.key2] ?? ""}
                                        </>
                                      )}
                                    </td>
                                  )
                                )}
                              </tr>
                            );
                          } else if (
                            ["BOS-Structure", "BOS-Electrical"].includes(
                              section.section
                            )
                          ) {
                            return (
                              <tr
                                key={sectionIndex + "-" + productIndex}
                                className=" border-b-1"
                              >
                                {/* <td className="text-primary px-4 py-3 w-[25%] border-r-1"></td> */}
                                {bosSectionColumnList.map(
                                  (column, columnIndex) => (
                                    <td
                                      key={columnIndex}
                                      className={`print:p-1 px-4 py-3 border-r-1`}
                                      style={{ width: column.width }}
                                    >
                                      {column?.type === "amount" ? (
                                        <>
                                          {column.displayValue
                                            ? formatPrice(column.displayValue)
                                            : formatPrice(
                                              product[column.key]
                                            )}{" "}
                                          {product[column.key2] ?? ""}
                                        </>
                                      ) : (
                                        <>
                                          {product[column.key]}{" "}
                                          {product[column.key2] ?? ""}
                                        </>
                                      )}
                                    </td>
                                  )
                                )}
                              </tr>
                            );
                          } else {
                            return (
                              <tr
                                key={sectionIndex + "-" + productIndex}
                                className=" border-b-1"
                              >
                                {/* <td className="text-primary px-4 py-3 w-[25%] border-r-1"></td> */}
                                {othersSectionColumnList.map(
                                  (column, columnIndex) => (
                                    <td
                                      key={columnIndex}
                                      className={`print:p-1 px-4 py-3 border-r-1`}
                                      style={{ width: column.width }}
                                    >
                                      {column?.type === "amount" ? (
                                        <>
                                          {column.displayValue
                                            ? formatPrice(column.displayValue)
                                            : formatPrice(
                                              product[column.key]
                                            )}{" "}
                                          {product[column.key2] ?? ""}
                                        </>
                                      ) : (
                                        <>
                                          {product[column.key]}{" "}
                                          {product[column.key2] ?? ""}
                                        </>
                                      )}
                                    </td>
                                  )
                                )}
                              </tr>
                            );
                          }
                        })
                      ) : (
                        <tr className="relative border-b-1">
                          <td colSpan={5} className="text-center print:p-2 p-4">
                            No Items
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
            </tbody>
          </table>
        </div>

        <table className=" border-1 mt-6 text-xs print:text-[0.5rem] print:leading-3 w-full">
          <thead>
            <tr className="border-b-1 bg-backgroundgrey">
              <th className="print:py-1 print:px-2 px-4 py-3 border-r-1 text-left">
                PROJECT HEADS
              </th>
              <th className="print:py-1 print:px-2 px-4 py-3 border-r-1 text-right">
                ESTIMATED COST (PER WP)
              </th>
            </tr>
          </thead>
          <tbody>
            {formDetails?.product_section.length > 0 &&
              formDetails.product_section.map((section, sectionIndex) => {
                return (
                  <tr key={sectionIndex} className="border-b-1">
                    <td className="print:py-1 print:px-2 px-4 py-3 w-[25%] border-r-1">
                      {section.section}
                    </td>
                    <td className="print:py-1 print:px-2 px-4 py-3 w-[25%] border-r-1 text-right">
                      ₹ {formatPrice(section.cost) ?? "0.00"}
                    </td>
                  </tr>
                );
              })}

            <tr className=" border-b-1 font-semibold bg-backgroundgrey">
              <td className="print:py-1 print:px-2 px-4 py-3 w-[25%] border-r-1">
                Total (PER WP)
              </td>
              <td className="print:py-1 print:px-2 px-4 py-3 w-[25%] border-r-1 text-right">
                ₹ {formatPrice(totalCostPerWP / totalProjectCapacity) ?? "0.00"}{" "}
                / WP
              </td>
            </tr>
            <tr className=" border-b-1 font-semibold bg-backgroundgrey">
              <td className="print:py-1 print:px-2 px-4 py-3 w-[25%] border-r-1">
                Total
              </td>
              <td className="print:py-1 print:px-2 px-4 py-3 w-[25%] border-r-1 text-right">
                ₹ {formatPrice(totalCostPerWP) ?? "0.00"}
              </td>
            </tr>
            <tr className=" border-b-1">
              <td className="print:py-1 print:px-2 px-4 py-3 w-[25%] border-r-1">
                Freight Charges
              </td>
              <td className="print:py-1 print:px-2 px-4 py-3 w-[25%] border-r-1 text-right">
                ₹{formatPrice(formDetails?.freight_charges)}
              </td>
            </tr>
            <tr className=" border-b-1">
              <td className="print:py-1 print:px-2 px-4 py-3 w-[25%] border-r-1">
                Other Charges
              </td>
              <td className="print:py-1 print:px-2 px-4 py-3 w-[25%] border-r-1 text-right">
                ₹ {formatPrice(formDetails?.other_charges) ?? "0.00"}
              </td>
            </tr>

            <tr className=" border-b-1 bg-backgroundgrey">
              <td className="print:py-1 print:px-2 px-4 py-3 w-[25%] border-r-1">
                Net Total
              </td>
              <td className="print:py-1 print:px-2 px-4 py-3 w-[25%] border-r-1 text-right">
                ₹ {formatPrice(formDetails?.net_amount) ?? "0.00"}
              </td>
            </tr>

            <tr className=" border-b-1">
              <td className="print:py-1 print:px-2 px-4 py-3 w-[25%] border-r-1">
                Profit Margin
              </td>
              <td className="print:py-1 print:px-2 px-4 py-3 w-[25%] border-r-1 text-right">
                ₹ {formatPrice(formDetails?.total_profit_margin)}
              </td>
            </tr>

            <tr className=" border-b-1 bg-backgroundgrey font-semibold">
              <td className="print:py-1 print:px-2 px-4 py-3 w-[25%] border-r-1">
                Total Amount
              </td>
              <td className="print:py-1 print:px-2 px-4 py-3 w-[25%] border-r-1 text-right">
                ₹ {formatPrice(formDetails?.total_amount)}
                <br />
                {convertToWords(formDetails?.total_amount ?? 0)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PreviewProject;
