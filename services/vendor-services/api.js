const { vendorAxiosInstance } = require("./ApiHandler");

export const getStates = async () => {
    const response = await vendorAxiosInstance.get("/hrm/state/");
    return response;
};
export const getCity = async (stateId) => {
    const response = await vendorAxiosInstance.get(
        `/hrm/city/?state=${stateId}`
    );
    return response;
};
export const getVendors = async (params = {}) => {
    const response = await vendorAxiosInstance.get(
        `/project/vendor-registration/`, { params }
    );
    return response;
};

export const addVendor = async (data) => {
    const response = await vendorAxiosInstance.post(
        `/project/vendor-registration/`,
        data
    );
    return response;
};

export const editVendor = async (data) => {
    const response = await vendorAxiosInstance.put(
        `/project/vendor-registration/`,
        data
    );
    return response;
};

export const uploadDocument = async (data) => {
    const response = await vendorAxiosInstance.post(
        `/project/vendor/upload-document/`,
        data
    );
    return response;
};