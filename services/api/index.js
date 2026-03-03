const { axiosInstance } = require("../ApiHandler");
import { LocalStorageService } from "../LocalStorageHandler";

// export const getDashBoardInfo = async (filters) => {
//   const companyAccessibility =
//     LocalStorageService.get("user_accessibility")?.accessibility[0]
//       ?.company_access ?? {};

//   let url = `/api/project/inroof-dashboard-v1/`;
//   if (Object.keys(filters).length > 0) {
//     const queryString = Object.entries(filters)
//       .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
//       .join("&");
//     url = `${url}?${queryString}`;
//     if (!companyAccessibility?.both_company) {
//       url += `&company_type=${companyAccessibility?.only_ornate ? "ornate" : "sg"}`;
//     }
//   } else {
//     if (!companyAccessibility?.both_company) {
//       url += `?company_type=${companyAccessibility?.only_ornate ? "ornate" : "sg"}`;
//     }
//   }
//   const response = await axiosInstance.get(url);
//   return response;
// };

export const getDashBoardInfo = async (filters) => {
  const companyAccessibility =
    LocalStorageService.get("user_accessibility")?.accessibility[0]
      ?.company_access ?? {};

  let url = `/api/project/inroof-dashboard-v1/`;
  const queryParams = [];

  const formatDate = (date) =>
    new Date(date).toISOString().split("T")[0];

  if (filters && Object.keys(filters).length > 0) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value === null || value === "") return;

      // ✅ Project Start Date Range
      if (key === "project_start_date" && filters.project_end_date) {
        queryParams.push(
          `project_start_date=${formatDate(value)}`,
          `project_start_last_date=${formatDate(filters.project_end_date)}`
        );
        return;
      }

      if (key === "project_end_date") return;

      // ✅ Project Closing Date Range
      if (
        key === "project_closing_start_date" &&
        filters.project_closing_end_date
      ) {
        queryParams.push(
          `project_cloasing_start_date=${formatDate(value)}`,
          `project_cloasing_end_date=${formatDate(
            filters.project_closing_end_date
          )}`
        );
        return;
      }

      if (key === "project_closing_end_date") return;

      // Default filters
      queryParams.push(`${key}=${encodeURIComponent(value)}`);
    });

    if (!companyAccessibility?.both_company) {
      queryParams.push(
        `company_type=${companyAccessibility?.only_ornate ? "ornate" : "sg"}`
      );
    }

    if (queryParams.length > 0) {
      url += `?${queryParams.join("&")}`;
    }
  } else {
    if (!companyAccessibility?.both_company) {
      url += `?company_type=${companyAccessibility?.only_ornate ? "ornate" : "sg"}`;
    }
  }

  const response = await axiosInstance.get(url);
  return response;
};




export const getUserAccessibility = async (id) => {
  const response = await axiosInstance.get(
    "/api/project/role-accessibility/?role=" + id
  );
  return response;
};

export const createCompany = async (company) => {
  const response = await axiosInstance.post("/api/project/company/", company);
  return response;
};
export const getCompanies = async (queryParams = {}) => {
  let url = "/api/project/company/";
  if (Object.keys(queryParams).length > 0) {
    const queryString = Object.entries(queryParams)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join("&");
    url += `?${queryString}`;
  }
  const response = await axiosInstance.get(url);
  return response;
};
export const editCompany = async (id, company) => {
  const response = await axiosInstance.put(
    "/api/project/company/?id=" + id,
    company
  );
  return response;
};

export const createProject = async (project) => {
  const response = await axiosInstance.post("/api/project/project/", project);
  return response;
};

export const editProject = async (id, project) => {
  const response = await axiosInstance.put(
    "/api/project/project/?id=" + id,
    project
  );
  return response;
};

export const getProjects = async (queryParams = {}) => {
  const companyAccessibility =
    LocalStorageService.get("user_accessibility")?.accessibility[0]
      ?.company_access ?? {};

  let response, url;
  if (Object.keys(queryParams).length > 0) {
    // If queryParams is provided, construct the query string
    const queryString = Object.entries(queryParams)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join("&");
    url = `api/project/project-v1/?${queryString}`;
    if (!companyAccessibility?.both_company) {
      url += `&company_type=${companyAccessibility?.only_ornate ? "ornate" : "sg"}`;
    }
  } else {
    // If no queryParams, just make a regular request
    url = "/api/project/project-v1/";
    if (!companyAccessibility?.both_company) {
      url += `?company_type=${companyAccessibility?.only_ornate ? "ornate" : "sg"}`;
    }
  }
  response = await axiosInstance.get(url);
  return response;
};
export const getProject = async (id) => {
  const response = await axiosInstance.get(`api/project/project-v1/?id=${id}`);
  return response;
};

export const getProjectRegistrationProductList = async () => {
  const response = await axiosInstance.get(
    `api/project/project-registration-product-list/`
  );
  return response;
};

export const getRegisteredProjectDetail = async (id) => {
  let response = await axiosInstance.get(
    `api/project/project-registration-v1/?id=${id}`
  );
  return response;
};

export const getProjectRegistrationList = async (queryParams = {}) => {
  const companyAccessibility =
    LocalStorageService.get("user_accessibility")?.accessibility[0]
      ?.company_access ?? {};

  let response, url;

  if (Object.keys(queryParams).length > 0) {
    // If queryParams is provided, construct the query string
    const queryString = Object.entries(queryParams)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join("&");
    url = `api/project/project-registration-list-v1/?${queryString}`;
    if (!companyAccessibility?.both_company) {
      url += `&company_type=${companyAccessibility?.only_ornate ? "ornate" : "sg"}`;
    }
  } else {
    // If no queryParams, just make a regular request
    url = `api/project/project-registration-list-v1/`;
    if (!companyAccessibility?.both_company) {
      url += `?company_type=${companyAccessibility?.only_ornate ? "ornate" : "sg"}`;
    }
  }

  response = await axiosInstance.get(url);
  return response;
};

export const getProjectSites = async (companyId = undefined) => {
  let response;
  if (companyId) {
    response = await axiosInstance.get(
      "/api/project/project-site/?company=" + companyId
    );
  } else {
    response = await axiosInstance.get("/api/project/project-site/");
  }
  return response;
};

export const createSite = async (site) => {
  const response = await axiosInstance.post("/api/project/project-site/", site);
  return response;
};

export const editProjectSite = async (id, data) => {
  const response = await axiosInstance.put(
    "/api/project/project-site/?id=" + id,
    data
  );
  return response;
};

export const getMasterDrawingList = async () => {
  const response = await axiosInstance.get("/api/project/project-mdl/");
  return response;
};

export const updateMasterDrawingList = async (id, data) => {
  const response = await axiosInstance.post(
    "/api/project/add-project-mdl/?id=" + id,
    data
  );
  return response;
};

export const reviseMasterDrawing = async (id, head, document, data) => {
  const response = await axiosInstance.post(
    `/api/project/revision-project-mdl/?id=${id}&head=${head}&document_name=${document}`,
    data
  );
  return response;
};

export const getMasterDrawingRevisionHistory = async (id, head, document) => {
  const response = await axiosInstance.get(
    `/api/project/revision-project-mdl/?id=${id}&head=${head}&document_name=${document}`
  );
  return response;
};

export const assignManufacturer = async (data) => {
  const response = await axiosInstance.post("/api/project/manufacturer/", data);
  return response;
};
export const getManufacturers = async (queryParams = {}) => {
  let url = "/api/project/manufacturer/";
  if (Object.keys(queryParams).length > 0) {
    const queryString = Object.entries(queryParams)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join("&");
    url += `?${queryString}`;
  }
  const response = await axiosInstance.get(url);
  return response;
};
export const createManufacturer = async (data) => {
  const response = await axiosInstance.post("/api/project/manufacturer/", data);
  return response;
};
export const editManufacturer = async (id, data) => {
  const response = await axiosInstance.put(
    "/api/project/manufacturer/?id=" + id,
    data
  );
  return response;
};

export const getVendors = async (queryParams = {}) => {
  let url = "/api/project/vendor/";
  if (Object.keys(queryParams).length > 0) {
    const queryString = Object.entries(queryParams)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join("&");
    url += `?${queryString}`;
  }
  const response = await axiosInstance.get(url);
  return response;
};
export const createVendor = async (data) => {
  const response = await axiosInstance.post("/api/project/vendor/", data);
  return response;
};
export const editVendor = async (id, data) => {
  const response = await axiosInstance.put(
    "/api/project/vendor/?id=" + id,
    data
  );
  return response;
};
export const getCompanySource = async () => {
  const response = await axiosInstance.get("/api/project/company-source/");
  return response;
};
export const createBomSection = async (data) => {
  const response = await axiosInstance.post("/api/project/bom-section/", data);
  return response;
};
export const getBomSections = async () => {
  const response = await axiosInstance.get("/api/project/bom-section/");
  return response;
};
export const getBomItems = async () => {
  const response = await axiosInstance.get("/api/project/bom-items/");
  return response;
};
export const createBomItems = async (data) => {
  const response = await axiosInstance.post("/api/project/bom-items/", data);
  return response;
};

export const createPanelBomItems = async (data) => {
  const response = await axiosInstance.post(
    "/api/project/bom-item-panel/",
    data
  );
  return response;
};

export const editPanelBomItems = async (id, data) => {
  const response = await axiosInstance.put(
    "/api/project/bom-item-panel/?id=" + id,
    data
  );
  return response;
};

export const deletePanelBomItems = async (id) => {
  const response = await axiosInstance.delete(
    "/api/project/bom-item-panel/?id=" + id
  );
  return response;
};

export const editBomItem = async (id, data) => {
  const response = await axiosInstance.put(
    `/api/project/bom-items/?id=${id}`,
    data
  );
  return response;
};
export const getRoles = async () => {
  const response = await axiosInstance.get(
    "api/RoleMaster/"
  );
  return response;
};
export const getSalesPersons = async (role = "") => {
  const response = await axiosInstance.get(
    "/api/project/salesperson/?role=" + role
  );
  return response;
};
export const getStates = async () => {
  const response = await axiosInstance.get("/api/State/");
  return response;
};
export const getCity = async (stateId) => {
  const response = await axiosInstance.get(
    `/api/mobile/city/?state=${stateId}`
  );
  return response;
};

export const getDocuments = async () => {
  const response = await axiosInstance.get("/api/project/project-document/");
  return response;
};
export const getScheduleHeader = async () => {
  const response = await axiosInstance.get(
    "/api/project/project-schedule-header/"
  );
  return response;
};

export const createScheduleHeader = async (data) => {
  const response = await axiosInstance.post(
    "/api/project/project-schedule-header/",
    data
  );
  return response;
};

export const getTasks = async () => {
  const response = await axiosInstance.get("/api/project/project-task/");
  return response;
};

export const createTask = async (data) => {
  const response = await axiosInstance.post("/api/project/project-task/", data);
  return response;
};
export const updateTask = async (data) => {
  const response = await axiosInstance.put(
    `/api/project/project-task/?id=${data.id}`,
    data
  );
  return response;
};
export const getUnits = async (queryParams = {}) => {
  let response;
  if (Object.keys(queryParams).length > 0) {
    // If queryParams is provided, construct the query string
    const queryString = Object.entries(queryParams)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join("&");
    response = await axiosInstance.get(`/api/project/unit/?${queryString}`);
  } else {
    // If no queryParams, just make a regular request
    response = await axiosInstance.get("/api/project/unit/");
  }
  return response;
};
export const getProducts = async (queryParams = {}) => {
  let response;
  if (Object.keys(queryParams).length > 0) {
    response = await axiosInstance.post(
      `/api/project/product-get/`,
      queryParams
    );
  } else {
    // If no queryParams, just make a regular request
    response = await axiosInstance.post("/api/project/product-get/");
  }
  return response;
};

export const getUniqueProducts = async () => {
  const response = await axiosInstance.get("/api/project/product-unique/");
  return response;
};

export const createProduct = async (data) => {
  const response = await axiosInstance.post("/api/project/product/", data);
  return response;
};

export const editProduct = async (id, data) => {
  const response = await axiosInstance.put(
    "/api/project/product/?id=" + id,
    data
  );
  return response;
};

//project details
export const getProjectDetails = async (projectId) => {
  const response = await axiosInstance.get(
    `/api/project/project-detail/?id=${projectId}`
  );
  return response;
};

export const createSubHeader = async (subHeader) => {
  const response = await axiosInstance.post(
    `api/project/project-schedule-sub-head-header/`,
    subHeader
  );
  return response;
};

export const generateProject = async (data) => {
  const response = await axiosInstance.post(
    "/api/project/project-registration-v1/",
    data
  );
  return response;
};

export const editRegisteredProject = async (data, id) => {
  const response = await axiosInstance.put(
    "/api/project/project-registration-v1/?id=" + id,
    data
  );
  return response;
};

export const approveProject = async (id, data) => {
  const response = await axiosInstance.post(
    "/api/project/project-registration-approval-v1/?id=" + id,
    data
  );
  return response;
};

export const bookItemQuantity = async (data) => {
  const response = await axiosInstance.post(
    "/api/project/items-booking/",
    data
  );
  return response;
};

export const uploadBomItems = async (projectId, bomHead, data) => {
  const response = await axiosInstance.post(
    `/api/project/bom-items-templates-upload/?project_id=${projectId}&bom_head=${bomHead}`,
    data
  );
  return response;
};

export const getProductType = async () => {
  const response = await axiosInstance.get(`/api/ProductTypes/`);
  return response;
};

export const getBOMTemplates = async (queryParams = {}) => {
  let response;
  if (Object.keys(queryParams).length > 0) {
    // If queryParams is provided, construct the query string
    const queryString = Object.entries(queryParams)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join("&");

    response = await axiosInstance.get(
      `/api/project/item-create-template/?${queryString}`
    );
  } else {
    // If no queryParams, just make a regular request
    response = await axiosInstance.get(`/api/project/item-create-template/`);
  }

  return response;
};

export const createBOMTemplates = async (data) => {
  const response = await axiosInstance.post(
    `/api/project/item-create-template/`,
    data
  );
  return response;
};

export const editBOMTemplates = async (id, data) => {
  const response = await axiosInstance.put(
    `/api/project/item-create-template/?id=` + id,
    data
  );
  return response;
};

export const getBanks = async (id) => {
  const response = await axiosInstance.get(`/api/seller_bank/`);
  return response;
};

export const saveEngineeringSectionBomDetails = async (data) => {
  const response = await axiosInstance.post(
    `/api/project/bom-item-bulk-upload/`,
    data
  );
  return response;
};

export const savePlanningSectionBomDetails = async (data) => {
  const response = await axiosInstance.post(
    `/api/project/bom-item-bulk-planing/`,
    data
  );
  return response;
};

export const approvePlanning = async (id, data) => {
  const response = await axiosInstance.put(
    `/api/project/bbu-approval/?id=${id}`,
    data
  );
  return response;
};

export const exportBbuDoc = async (id) => {
  const response = await axiosInstance.get(
    `/api/project/bbu-doc/?project_id=${id}`
  );
  return response;
};

export const deleteSections = async (id) => {
  const response = await axiosInstance.delete(
    `/api/project/bom-section/?id=${id}`
  );
  return response;
};

// purchase order api starts here
export const getPurchaseOrders = async (queryParams = {}) => {
  let response;
  if (Object.keys(queryParams).length > 0) {
    const queryString = Object.entries(queryParams)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join("&");

    response = await axiosInstance.get(
      `/api/project/vendor-purchase-order-list/?${queryString}`
    );
  } else {
    // If no queryParams, just make a regular request
    response = await axiosInstance.get(
      "/api/project/vendor-purchase-order-list/"
    );
  }
  return response;
};

export const getPurchaseOrderDetails = async (queryParams) => {
  let response;
  if (Object.keys(queryParams).length > 0) {
    const queryString = Object.entries(queryParams)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join("&");

    response = await axiosInstance.get(
      `/api/project/vendor-purchase-order/?${queryString}`
    );
  } else {
    // If no queryParams, just make a regular request
    response = await axiosInstance.get("/api/project/vendor-purchase-order/");
  }
  return response;
};

export const addPurchaseOrder = async (data) => {
  const response = await axiosInstance.post(
    `/api/project/vendor-purchase-order/`,
    data
  );
  return response;
};

export const getPurchaseOrderItemList = async (id) => {
  let response = await axiosInstance.get(
    `api/project/bom-items/?project=${id}`
  );
  return response;
};

export const getPurchaseOrderItemListForOthers = async (id) => {
  let response = await axiosInstance.get(
    `api/project/other-section-budget-list/?project=${id}`
  );
  return response;
};

export const editPurchaseOrder = async (id, data) => {
  const response = await axiosInstance.put(
    `/api/project/vendor-purchase-order/?id=${id}`,
    data
  );
  return response;
};

export const getPurchaserList = async () => {
  let response = await axiosInstance.get(`api/project/purchaser/`);
  return response;
};

export const fetchPOExtraCharges = async () => {
  const response = await axiosInstance.get(`api/project/extra-charges/`);
  return response;
};

export const addPOExtraCharges = async (data) => {
  const response = await axiosInstance.post(`api/project/extra-charges/`, data);
  return response;
};

//  purchase order apis ends here...

export const getAddressList = async () => {
  const response = await axiosInstance.get(`/api/project/master-address/`);
  return response;
};

export const addAddress = async (data) => {
  const response = await axiosInstance.post(
    `/api/project/master-address/`,
    data
  );
  return response;
};

export const getSellerAddress = async () => {
  const response = await axiosInstance.get(`/api/mobile/seller/`);
  return response;
};

// site visit apis starts here...
export const getSiteVisitList = async (queryParams = {}) => {
  const companyAccessibility =
    LocalStorageService.get("user_accessibility")?.accessibility[0]
      ?.company_access ?? {};

  let url = `/api/project/site-visit-v1/`;
  if (Object.keys(queryParams).length > 0) {
    const queryString = Object.entries(queryParams)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join("&");
    url += `?${queryString}`;
    if (!companyAccessibility?.both_company) {
      url += `&company_type=${companyAccessibility?.only_ornate ? "ornate" : "sg"}`;
    }
  } else {
    if (!companyAccessibility?.both_company) {
      url += `?company_type=${companyAccessibility?.only_ornate ? "ornate" : "sg"}`;
    }
  }

  const response = await axiosInstance.get(url);
  return response;
};

export const addSiteVisits = async (formData) => {
  const response = await axiosInstance.post(
    `/api/project/site-visit/`,
    formData
  );
  return response;
};

export const getEmployeeList = async () => {
  const response = await axiosInstance.post(`/api/hrm/employee-list/`, {
    is_active: 1,
  });
  return response;
};

export const deleteSiteImage = async (id, data) => {
  const response = await axiosInstance.put(
    `/api/project/site-visit-image/?id=${id}`,
    data
  );
  return response;
};

export const addSiteImage = async (data) => {
  const response = await axiosInstance.post(
    `/api/project/site-visit-image/`,
    data
  );
  return response;
};

export const editSiteExpense = async (id, data) => {
  const response = await axiosInstance.put(
    `/api/project/site-visit-expense/?id=${id}`,
    data
  );
  return response;
};

export const addSiteExpense = async (data) => {
  const response = await axiosInstance.post(
    `/api/project/site-visit-expense/`,
    data
  );
  return response;
};

export const deleteSiteExpense = async (id, data) => {
  const response = await axiosInstance.put(
    `/api/project/site-visit-expense/?id=${id}`,
    data
  );
  return response;
};

export const editSiteVisit = async (id, data) => {
  const response = await axiosInstance.put(
    `/api/project/site-visit/?id=${id}`,
    data
  );
  return response;
};
export const editPackingListDetails = async (id, data) => {
  const response = await axiosInstance.put(
    `/api/project/packing-list/?id=${id}`,
    data
  );
  return response;
};
// packing list api ends here..

// ---------

// inroof leads api start here..
export const getLeadList = async (queryParams) => {
  const response = await axiosInstance.post(`/api/project/leads/`, queryParams);
  return response;
};

export const getLeadActivities = async (id) => {
  const response = await axiosInstance.get(`/api/LeadActivity/?lead=${id}`);
  return response;
};

export const addLeadActivity = async (data) => {
  const response = await axiosInstance.post(`/api/LeadActivity/`, data);
  return response;
};

export const getRegions = async (id) => {
  const response = await axiosInstance.get(`/api/region/`);
  return response;
};

export const getLeadSource = async (id) => {
  const response = await axiosInstance.get(`/api/LeadSource/`);
  return response;
};
// inroof leads api ends here..

// ---------

// packing list api start here..
export const getPackingList = async (queryParams = {}) => {
  const companyAccessibility =
    LocalStorageService.get("user_accessibility")?.accessibility[0]
      ?.company_access ?? {};

  let response, url;

  if (Object.keys(queryParams).length > 0) {
    // If queryParams is provided, construct the query string
    const queryString = Object.entries(queryParams)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join("&");
    url = `/api/project/packing-list-v1/?${queryString}`;
    if (!companyAccessibility?.both_company) {
      url += `&company_type=${companyAccessibility?.only_ornate ? "ornate" : "sg"}`;
    }
  } else {
    // If no queryParams, just make a regular request
    url = `/api/project/packing-list-v1/`;
    if (!companyAccessibility?.both_company) {
      url += `?company_type=${companyAccessibility?.only_ornate ? "ornate" : "sg"}`;
    }
  }
  response = await axiosInstance.get(url);
  return response;
};

export const createPackingList = async (data) => {
  const response = await axiosInstance.post(`/api/project/packing-list/`, data);
  return response;
};

export const editPackingList = async (id, data) => {
  const response = await axiosInstance.put(
    `/api/project/packing-list/?id=${id}`,
    data
  );
  return response;
};

export const deletePackingListItem = async (id) => {
  const response = await axiosInstance.delete(
    `/api/project/packing-list-item/?id=${id}`
  );
  return response;
};

export const addPackingListItem = async (data) => {
  const response = await axiosInstance.post(
    `/api/project/packing-list-item/`,
    data
  );
  return response;
};

export const fetchUnbookedPackingListItems = async (
  projectId,
  packingListId
) => {
  const response = await axiosInstance.get(
    `api/project/packing-list-left-item/?project_id=${projectId}&packing_list_id=${packingListId}`
  );
  return response;
};
// packing list api ends here..

// ---------

// invoice api start here..
export const uploadPackingListInvoice = async (data) => {
  const response = await axiosInstance.post(`/api/project/invoices-v1/`, data);
  return response;
};

export const deletePackingListInvoice = async (id) => {
  const response = await axiosInstance.delete(
    `/api/project/invoices-v1/?id=${id}`
  );
  return response;
};

export const getInvoices = async (queryParams = {}) => {
  const companyAccessibility =
    LocalStorageService.get("user_accessibility")?.accessibility[0]
      ?.company_access ?? {};

  let response, url;

  if (Object.keys(queryParams).length > 0) {
    // If queryParams is provided, construct the query string
    const queryString = Object.entries(queryParams)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join("&");
    url = `/api/project/invoices-v1/?${queryString}`;
    if (!companyAccessibility?.both_company) {
      url += `&company_type=${companyAccessibility?.only_ornate ? "ornate" : "sg"}`;
    }
  } else {
    // If no queryParams, just make a regular request
    url = `/api/project/invoices-v1/`;
    if (!companyAccessibility?.both_company) {
      url += `?company_type=${companyAccessibility?.only_ornate ? "ornate" : "sg"}`;
    }
  }
  response = await axiosInstance.get(url);
  return response;
};

export const editPackingListInvoice = async (id, data) => {
  const response = await axiosInstance.put(
    `/api/project/invoices-v1/?id=${id}`,
    data
  );
  return response;
};

export const deleteInvoiceItems = async (id) => {
  const response = await axiosInstance.delete(
    `/api/project/invoice-item/?id=${id}`
  );
  return response;
};

export const addInvoiceItems = async (data) => {
  const response = await axiosInstance.post(`/api/project/invoice-item/`, data);
  return response;
};

export const fetchUnbookedInvoiceItems = async (invoiceId, packingListId) => {
  const response = await axiosInstance.get(
    `/api/project/invoice-left-item/?invoice_id=${invoiceId}&packing_list_id=${packingListId}`
  );
  return response;
};

// invoice api ends here..

//--------

// epc api starts here..
export const getEpcs = async (queryParams = {}) => {
  let url = "/api/project/epc/";
  if (Object.keys(queryParams).length > 0) {
    const queryString = Object.entries(queryParams)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join("&");
    url += `?${queryString}`;
  }
  const response = await axiosInstance.get(url);
  return response;
};

export const addEpc = async (data) => {
  const response = await axiosInstance.post(`/api/project/epc/`, data);
  return response;
};

export const editEpc = async (id, data) => {
  const response = await axiosInstance.put(`/api/project/epc/?id=${id}`, data);
  return response;
};

export const addProjectInstaller = async (data) => {
  const response = await axiosInstance.post(
    `/api/project/project-installer/`,
    data
  );
  return response;
};
// epc api ends here..

//--------

// payments api starts here..
export const getProjectPayments = async (queryParams = {}) => {
  let response;
  if (Object.keys(queryParams).length > 0) {
    // If queryParams is provided, construct the query string
    const queryString = Object.entries(queryParams)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join("&");

    response = await axiosInstance.get(
      `/api/project/project-payment-list/?${queryString}`
    );
  } else {
    // If no queryParams, just make a regular request
    response = await axiosInstance.get("/api/project/project-payment-list/");
  }
  return response;
};

export const getInvoicePayments = async (queryParams = {}) => {
  let response;
  if (Object.keys(queryParams).length > 0) {
    // If queryParams is provided, construct the query string
    const queryString = Object.entries(queryParams)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join("&");

    response = await axiosInstance.get(
      `/api/project/project-invoice-list/?${queryString}`
    );
  } else {
    // If no queryParams, just make a regular request
    response = await axiosInstance.get("/api/project/project-invoice-list/");
  }
  return response;
};
// payment api ends here..

//--------

// project details->payment tab api starts here..
export const getPaymentDetails = async (id) => {
  const response = await axiosInstance.get(
    `/api/project/project-payment/?project=${id}`
  );
  return response;
};

export const deletePaymentDetails = async (id) => {
  const response = await axiosInstance.delete(
    `/api/project/project-payment/?id=${id}`
  );
  return response;
};

export const editProjectPayment = async (id, data) => {
  const response = await axiosInstance.put(
    `/api/project/project-payment/?id=${id}`,
    data
  );
  return response;
};

export const getPaymentInvoiceDetails = async (id) => {
  const response = await axiosInstance.get(
    `/api/project/project-client-invoice/?project=${id}`
  );
  return response;
};

export const addProjectPayment = async (data) => {
  const response = await axiosInstance.post(
    `/api/project/project-payment/`,
    data
  );
  return response;
};

export const addProjectPaymentInvoice = async (data) => {
  const response = await axiosInstance.post(
    `/api/project/project-client-invoice/`,
    data
  );
  return response;
};

export const editProjectPaymentInvoice = async (id, data) => {
  const response = await axiosInstance.put(
    `/api/project/project-client-invoice/?id=${id}`,
    data
  );
  return response;
};

export const deleteProjectPaymentInvoice = async (id) => {
  const response = await axiosInstance.delete(
    `/api/project/project-client-invoice/?id=${id}`
  );
  return response;
};
// project details->payment tab api ends here..

//--------

// reports api starts here..
export const getReports = async (queryParams = {}) => {
  const companyAccessibility =
    LocalStorageService.get("user_accessibility")?.accessibility[0]
      ?.company_access ?? {};

  let url, response;

  if (Object.keys(queryParams).length > 0) {
    // If queryParams is provided, construct the query string
    const queryString = Object.entries(queryParams)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join("&");
    url = `/api/project/ongoing-project-tracking-v1/?${queryString}`;
    if (!companyAccessibility?.both_company) {
      url += `&company_type=${companyAccessibility?.only_ornate ? "ornate" : "sg"}`;
    }
  } else {
    // If no queryParams, just make a regular request
    url = `/api/project/ongoing-project-tracking-v1/`;
    if (!companyAccessibility?.both_company) {
      url += `?company_type=${companyAccessibility?.only_ornate ? "ornate" : "sg"}`;
    }
  }
  response = await axiosInstance.get(url);
  return response;
};
// reports api ends here..

//--------

// inventory api starts here..
export const stockInProducts = async (data) => {
  const response = await axiosInstance.post(
    "/api/project/inventory-stock-in/",
    data
  );
  return response;
};

export const editLedger = async (id, data) => {
  const response = await axiosInstance.put(
    `/api/project/inventory-stock-in/?id=${id}`,
    data
  );
  return response;
};

export const deleteLedger = async (id) => {
  const response = await axiosInstance.delete(
    `/api/project/inventory-stock-in/?id=${id}`
  );
  return response;
};

export const getLedger = async (queryParams = {}) => {
  let response;
  if (Object.keys(queryParams).length > 0) {
    // If queryParams is provided, construct the query string
    const queryString = Object.entries(queryParams)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join("&");

    response = await axiosInstance.get(
      `/api/project/inventory-stock-in/?${queryString}`
    );
  } else {
    // If no queryParams, just make a regular request
    response = await axiosInstance.get("/api/project/inventory-stock-in/");
  }
  return response;
};

export const stockOutProductDetails = async (id, isInventory = undefined) => {
  let response;
  if (isInventory !== undefined) {
    response = await axiosInstance.get(
      `api/project/items-packing-list/?item=${id}&is_inventory=${isInventory}`
    );
  } else {
    response = await axiosInstance.get(
      `api/project/items-packing-list/?item=${id}`
    );
  }

  return response;
};

export const stockInProductDetails = async (id) => {
  const response = await axiosInstance.get(
    `api/project/items-stock-in/?item=${id}`
  );
  return response;
};
// inventory api ends here..

export const addProjectStaff = async (data) => {
  const response = await axiosInstance.post(
    "/api/project/project-site-staff/",
    data
  );
  return response;
};

//--------

// transporter details api starts here..
export const getInvoiceTransportationDetailsList = async (queryParams = {}) => {
  let response;
  if (Object.keys(queryParams).length > 0) {
    // If queryParams is provided, construct the query string
    const queryString = Object.entries(queryParams)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join("&");

    response = await axiosInstance.get(
      `api/project/invoice-transportation-details/?${queryString}`
    );
  } else {
    // If no queryParams, just make a regular request
    response = await axiosInstance.get(
      "api/project/invoice-transportation-details/"
    );
  }
  return response;
};

export const getDispatchDetailsList = async (queryParams = {}) => {
  let response;
  if (Object.keys(queryParams).length > 0) {
    // If queryParams is provided, construct the query string
    const queryString = Object.entries(queryParams)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join("&");

    response = await axiosInstance.get(
      `api/project/packing-list-details/?${queryString}`
    );
  } else {
    // If no queryParams, just make a regular request
    response = await axiosInstance.get("api/project/packing-list-details/");
  }
  return response;
};

export const addTransportationDetails = async (data) => {
  const response = await axiosInstance.post(
    `api/project/invoice-transportation-details/`,
    data
  );
  return response;
};

export const editTransportationDetails = async (id, data) => {
  const response = await axiosInstance.put(
    `api/project/invoice-transportation-details/?id=${id}`,
    data
  );
  return response;
};

export const deleteTransportationDetails = async (id) => {
  const response = await axiosInstance.delete(
    `api/project/invoice-transportation-details/?id=${id}`
  );
  return response;
};

export const getTransporterList = async () => {
  const response = await axiosInstance.get(`api/master_data/transporter-list/`);
  return response;
};

export const getSunlightTransporters = async (queryParams = {}) => {
  let response;
  if (Object.keys(queryParams).length > 0) {
    // If queryParams is provided, construct the query string
    const queryString = Object.entries(queryParams)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join("&");

    response = await axiosInstance.get(
      `api/logistics/get-transporter/?${queryString}`
    );
  } else {
    // If no queryParams, just make a regular request
    response = await axiosInstance.get("api/logistics/get-transporter/");
  }
  return response;
};
// transporter details api ends here..

//--------

// contigency api starts here..
export const getBBUVersions = async (projectId) => {
  const response = await axiosInstance.get(
    `api/project/bbu-version-list/?project=${projectId}`
  );
  return response;
};

export const addContigencyItems = async (data) => {
  const response = await axiosInstance.post(
    `api/project/contingency-item-v2/`,
    data
  );
  return response;
};

export const editContigencyItems = async (id, data) => {
  const response = await axiosInstance.put(
    `api/project/contingency-item-v2/?bom_contingency=${id}`,
    data
  );
  return response;
};

export const editContigencyItem = async (id, data) => {
  const response = await axiosInstance.put(
    `api/project/contingency-item-edit/?id=${id}`,
    data
  );
  return response;
};

export const deleteContigencyItems = async (id) => {
  const response = await axiosInstance.delete(
    `api/project/contingency-item-v2/?id=` + id
  );
  return response;
};

export const getBOMContigency = async (queryParams = {}) => {
  let response;
  if (Object.keys(queryParams).length > 0) {
    // If queryParams is provided, construct the query string
    const queryString = Object.entries(queryParams)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join("&");

    response = await axiosInstance.get(
      `/api/project/bom-contingency/?${queryString}`
    );
  } else {
    // If no queryParams, just make a regular request
    response = await axiosInstance.get("/api/project/bom-contingency/");
  }
  return response;
};

export const addContingencyRemark = async (data) => {
  const response = await axiosInstance.post(
    "/api/project/bom-contingency/",
    data
  );
  return response;
};

export const deleteContingencyRemark = async (id) => {
  const response = await axiosInstance.delete(
    "/api/project/bom-contingency/?id=" + id
  );
  return response;
};

export const editContingencyRemark = async (id, data) => {
  const response = await axiosInstance.put(
    "/api/project/bom-contingency/?id=" + id,
    data
  );
  return response;
};

export const approveContingency = async (id, data) => {
  const response = await axiosInstance.post(
    "/api/project/contingency-item-approval-v1/?id=" + id,
    data
  );
  return response;
};
// contigency api ends here..

//--------

// payment tracking starts here..
export const fetchPaymentTracking = async (queryParams = {}) => {
  const companyAccessibility =
    LocalStorageService.get("user_accessibility")?.accessibility[0]
      ?.company_access ?? {};

  let url, response;

  if (Object.keys(queryParams).length > 0) {
    // If queryParams is provided, construct the query string
    const queryString = Object.entries(queryParams)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join("&");
    url = `/api/project/project-payment-tracking-v1/?${queryString}`;
    if (!companyAccessibility?.both_company) {
      url += `&company_type=${companyAccessibility?.only_ornate ? "ornate" : "sg"}`;
    }
  } else {
    // If no queryParams, just make a regular request
    url = `/api/project/project-payment-tracking-v1/`;
    if (!companyAccessibility?.both_company) {
      url += `?company_type=${companyAccessibility?.only_ornate ? "ornate" : "sg"}`;
    }
  }
  response = await axiosInstance.get(url);
  return response;
};
// payment tracking api ends here..

//--------

// project completion starts here..
export const fetchProjectCompletionDetails = async (id) => {
  const response = await axiosInstance.get(
    `api/project/project-completion-document/?project=${id}`
  );
  return response;
};

export const addProjectCompletionDocuments = async (data) => {
  const response = await axiosInstance.post(
    `api/project/project-completion-document/`,
    data
  );
  return response;
};

export const editProjectCompletionDocument = async (id, data) => {
  const response = await axiosInstance.put(
    `api/project/project-completion-document/?id=${id}`,
    data
  );
  return response;
};
// project completion api ends here..

//--------

// project installtion api starts here..
export const fetchProjectInstallationDetails = async (id) => {
  const response = await axiosInstance.get(
    `api/project/installation-budget/?project=${id}`
  );
  return response;
};

export const addProjectInstallationItems = async (data) => {
  const response = await axiosInstance.post(
    `api/project/installation-budget/`,
    data
  );
  return response;
};

export const editProjectInstallationItem = async (id, data) => {
  const response = await axiosInstance.put(
    `api/project/installation-budget/?id=${id}`,
    data
  );
  return response;
};

export const deleteProjectInstallationItem = async (id) => {
  const response = await axiosInstance.delete(
    `api/project/installation-budget/?id=${id}`
  );
  return response;
};
// project installation api ends here..

//--------

// payment terms api starts here..
export const fetchPaymentTermsDetails = async (id) => {
  const response = await axiosInstance.get(
    `api/project/payment-terms/?project=${id}`
  );
  return response;
};

export const addPaymentTerms = async (data) => {
  const response = await axiosInstance.post(`api/project/payment-terms/`, data);
  return response;
};

export const editPaymentTerms = async (id, data) => {
  const response = await axiosInstance.put(
    `api/project/payment-terms/?id=${id}`,
    data
  );
  return response;
};
// payment terms api ends here..

//--------

// project completion doc api starts here..
export const fetchProjectCompletionDocuments = async () => {
  const response = await axiosInstance.get(
    `api/project/project-completion-document-list/`
  );
  return response;
};

export const addProjectCompletionDocs = async (data) => {
  const response = await axiosInstance.post(
    `api/project/project-completion-document-list/`,
    data
  );
  return response;
};

export const editProjectCompletionDocs = async (id, data) => {
  const response = await axiosInstance.put(
    `api/project/project-completion-document-list/?id=${id}`,
    data
  );
  return response;
};
// project completion doc api ends here..

//--------

// site progress report api starts here..
export const getSiteProgressReport = async (id) => {
  const response = await axiosInstance.get(
    "/api/project/progress-report/?project=" + id
  );
  return response;
};

export const addSiteProgress = async (data) => {
  const response = await axiosInstance.post(
    "/api/project/progress-report/",
    data
  );
  return response;
};

export const editSiteProgress = async (id, data) => {
  const response = await axiosInstance.put(
    "/api/project/progress-report/?id=" + id,
    data
  );
  return response;
};

export const getInstallerRemarks = async (id) => {
  const response = await axiosInstance.get(
    "/api/project/installer-remark/?project=" + id
  );
  return response;
};

export const addInstallerRemark = async (data) => {
  const response = await axiosInstance.post(
    "/api/project/installer-remark/",
    data
  );
  return response;
};

export const addProjectAdditionalPO = async (data) => {
  const response = await axiosInstance.post(
    "/api/project/additional-project-purchase-order/",
    data
  );
  return response;
};

export const getProjectAdditionalPO = async (id) => {
  const response = await axiosInstance.get(
    "/api/project/additional-project-purchase-order/?project=" + id
  );
  return response;
};

export const deleteProjectAdditionalPO = async (id) => {
  const response = await axiosInstance.delete(
    "/api/project/additional-project-purchase-order/?id=" + id
  );
  return response;
};

export const editProjectAdditionalPO = async (id, data) => {
  const response = await axiosInstance.put(
    "/api/project/additional-project-purchase-order/?id=" + id,
    data
  );
  return response;
};

export const getUnitPriceAvg = async (itemList = []) => {
  const response = await axiosInstance.post(
    "/api/project/average-po-product-unit-price/",
    itemList
  );
  return response;
};

export const getItemPoList = async (queryParams = {}) => {
  let response;
  if (Object.keys(queryParams).length > 0) {
    // If queryParams is provided, construct the query string
    const queryString = Object.entries(queryParams)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join("&");

    response = await axiosInstance.get(
      `/api/project/vendor-purchase-order-product-list/?${queryString}`
    );
  } else {
    // If no queryParams, just make a regular request
    response = await axiosInstance.get(
      "/api/project/vendor-purchase-order-product-list/"
    );
  }
  return response;
};

export const getRoleAccessibilityInfo = async () => {
  const response = await axiosInstance.get(
    "/api/project/inroof-role-tamplate/"
  );
  return response;
};

export const fetchProjectReports = async (queryParams = {}) => {
  let response;
  if (Object.keys(queryParams).length > 0) {
    // If queryParams is provided, construct the query string
    const queryString = Object.entries(queryParams)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join("&");

    response = await axiosInstance.get(
      `/api/project/project-report/?${queryString}`
    );
  } else {
    // If no queryParams, just make a regular request
    response = await axiosInstance.get("/api/project/project-report/");
  }
  return response;
};

export const fetchProjectFinancials = async (queryParams = {}) => {
  let response;
  if (Object.keys(queryParams).length > 0) {
    // If queryParams is provided, construct the query string
    const queryString = Object.entries(queryParams)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join("&");

    response = await axiosInstance.get(
      `/api/project/detailed-project-report/?${queryString}`
    );
  } else {
    // If no queryParams, just make a regular request
    response = await axiosInstance.get("/api/project/detailed-project-report/");
  }
  return response;
};
export const fetchProjectConsumedReport = async (id) => {
  const response = await axiosInstance.get(
    `api/project/project-item-consumed-report/?project=${id}`
  );
  return response;
};

export const changeProjectStatus = async (id, data) => {
  const response = await axiosInstance.post(
    `api/project/update-project-status/?project_id=${id}`,
    data
  );
  return response;
};

export const mergeProducts = async (data) => {
  const response = await axiosInstance.post(`api/project/product-merge/`, data);
  return response;
};

export const fetchZohoProjectTasks = async (portalId, projectId) => {
  const response = await axiosInstance.get(
    `zoho/projects/portal/${portalId}/project/${projectId}/tasks`
  );
  return response;
};

export const fetchZohoUserTasks = async (userEmail) => {
  const response = await axiosInstance.get(
    `zoho/projects/user/tasks?user_email=${userEmail}`
  );
  return response;
};
export const addVendor = async (data) => {
  const response = await axiosInstance.post(
    `api/project/in-house/vendor-registration/`,
    data
  );
  return response;
};

export const getVendorDetails = async (id) => {
  const response = await axiosInstance.get(
    `api/project/in-house/vendor-registration-details/?vendor_id=${id}`
  );
  return response;
};

export const editVendorDetails = async (id, data) => {
  const response = await axiosInstance.put(
    `api/project/in-house/vendor-registration-update/?vendor_id=${id}`,
    data
  );
  return response;
};
