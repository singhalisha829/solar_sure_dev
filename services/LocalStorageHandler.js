export const isBrowser = typeof window !== "undefined";
// LocalStorageService.js
export class LocalStorageService {
  // Get a value from local storage by key
  static get(key) {
    if (!isBrowser) return;
    const value = localStorage.getItem(key);
    if (value) {
      try {
        return JSON.parse(value);
      } catch (err) {
        return null;
      }
    }
    return null;
  }

  // Set a value in local storage by key
  static set(key, value) {
    if (!isBrowser) return;
    localStorage.setItem(key, JSON.stringify(value));
  }

  // Remove a value from local storage by key
  static remove(key) {
    if (!isBrowser) return;
    localStorage.removeItem(key);
  }

  // Clear all items from local storage
  static clear() {
    if (!isBrowser) return;
    localStorage.clear();
  }
}
// const LocalStorageService = (function () {
//   var _service;
//   function _getService() {
//     if (!_service) {
//       _service = this;
//       return _service;
//     }
//     return _service;
//   }

//   function _setAccessToken(accessToken) {
//     localStorage.setItem("access_token", accessToken);
//   }

//   function _setRefreshToken(refreshToken) {
//     localStorage.setItem("refresh_token", refreshToken);
//   }

//   function _getAccessToken() {
//     return localStorage.getItem("access_token");
//   }

//   function _getRefreshToken() {
//     return localStorage.getItem("refresh_token");
//   }

//   function _setUser(user) {
//     localStorage.setItem("user", JSON.stringify(user));
//   }

//   function _getUser() {
//     try {
//       const user = localStorage.getItem("user");
//       if (user) {
//         return JSON.parse(user);
//       }
//     } catch (error) {
//       return null;
//     }
//     return null;
//   }

//   function _setFormUUID(uuid) {
//     localStorage.setItem("uuid", uuid);
//   }

//   function _getFormUUID() {
//     return localStorage.getItem("uuid");
//   }

//   function _setFeedbackFormUUID(uuid) {
//     localStorage.setItem("feedback-uuid", uuid);
//   }

//   function _getFeedbackFormUUID() {
//     return localStorage.getItem("feedback-uuid");
//   }

//   function _setEmployeeFormUUID(uuid) {
//     localStorage.setItem("employeeForm", uuid);
//   }

//   function _getEmployeeFormUUID() {
//     return localStorage.getItem("employeeForm");
//   }

//   function _setPageWiseFilterState(page, filters) {
//     return localStorage.setItem(page + "_filters", JSON.stringify(filters));
//   }

//   function _getPageWiseFilterState(page) {
//     return JSON.parse(localStorage.getItem(page + "_filters"));
//   }

//   function _clearToken() {
//     localStorage.removeItem("access_token");
//     localStorage.removeItem("refresh_token");
//     localStorage.removeItem("employees_filters");
//     localStorage.removeItem("leave_filters");
//   }

//   function _clearLeavePageFilters() {
//     localStorage.removeItem("leave_filters");
//   }

//   return {
//     getService: _getService,
//     setAccessToken: _setAccessToken,
//     getAccessToken: _getAccessToken,
//     setRefreshToken: _setRefreshToken,
//     getRefreshToken: _getRefreshToken,
//     setUser: _setUser,
//     getUser: _getUser,
//     getFormUUID: _getFormUUID,
//     setFormUUID: _setFormUUID,
//     getFeedbackFormUUID: _getFeedbackFormUUID,
//     setFeedbackFormUUID: _setFeedbackFormUUID,
//     setEmployeeFormUUID: _setEmployeeFormUUID,
//     getEmployeeFormUUID: _getEmployeeFormUUID,
//     getPageWiseFilterState: _getPageWiseFilterState,
//     setPageWiseFilterState: _setPageWiseFilterState,
//     clearToken: _clearToken,
//     clearLeavePageFilters: _clearLeavePageFilters,
//   };
// })();

// export default LocalStorageService;
