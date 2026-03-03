import Router from "next/router";
import { vendorAxiosInstance } from "./ApiHandler";
import { LocalStorageService } from "../LocalStorageHandler";
import { toast } from "sonner";


export const onSendOtp = async (credentials) => {
  try {
    const { data } = await vendorAxiosInstance.post(
      "project/vendor/otp/generate/",
      credentials
    );

    if (data.status.code === 200) {
      return {
        success: true,
        message: data.status.description,
        data: data.data,
      };
    }

    return {
      success: false,
      message: data.message || "Invalid credentials",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error?.response?.data?.status?.description ||
        "Something went wrong",
    };
  }
};

export const onVerifyOtp = async (credentials) => {
  try {
    const { data } = await vendorAxiosInstance.post(
      "project/vendor/otp/verify/",
      credentials
    );
    if (data.status.code === 200) {
      LocalStorageService.set("vendor_token", data.data.output.token);
      LocalStorageService.set("vendor_contact", data.data.output.contact_no);
      toast.success("Phone Number Verified!");
      Router.push("/vendor-registration/");
    }

    return {
      success: false,
      message: data.message || "Invalid credentials",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error?.response?.data?.status?.description ||
        "Something went wrong",
    };
  }
};