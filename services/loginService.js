import Router from "next/router";
import { axiosInstance } from "./ApiHandler";
import { LocalStorageService } from "./LocalStorageHandler";
import { toast } from "sonner";
import { getUserAccessibility } from "./api";
// import {URL, MAIN } from "./constants";

// const localStorage = LocalStorageService.getService();

export const onLogin = async (credentials, setUnauthorisedUser) => {
  try {
    const { data } = await axiosInstance.post("/api-token-auth/", credentials);
    if (data.status.code == 200) {
      LocalStorageService.set("user", data.data.output);
      LocalStorageService.set("access_token", data.data.output.token);
      toast.success("Login Sucessfull");
      // fetch user accessibility details
      getUserAccessibility(data.data.output.role_id).then((response) => {
        const userAccessibilty = response.data.data.output[0];
        LocalStorageService.set("user_accessibility", userAccessibilty);
        if (userAccessibilty.accessibility[0]?.dashboard?.page_view) {
          Router.push("/");
        } else {
          Router.push("/welcome-page");
        }
      });
    } else if (data.status.code == 401) {
      toast.error(data.message || "Invalid Credentials");
      setUnauthorisedUser(true);
    } else {
      toast.error("Invalid Credentials");
    }
  } catch (error) {
    toast.error(
      error.response.data.status.description || "Something Went Wrong"
    );
  }
};
