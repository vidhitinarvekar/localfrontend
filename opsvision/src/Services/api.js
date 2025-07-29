import axios from "axios";
 
const API_BASE_URL = "https://opsvisionbe.integrator-orange.com/api";
const ownerId = localStorage.getItem("staffId");
 
// Global axios config with auth and headers
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    return {
      ...config,
      headers: {
        ...config.headers,
        Authorization: token ? `Bearer ${token}` : config.headers?.Authorization,
        "Content-Type": "application/json",
      },
    };
  },
  Promise.reject
);
 
 
// Fetch all projects
export const getProjects = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/ProjectFte/all`);
    return response.data;
  } catch (error) {
    console.error("Error fetching projects:", error?.response?.data || error.message);
    return [];
  }
};
 
// Allocate FTE to a project
export const allocateProjectFte = async ({ projectId, primeCode, allocatedFte }) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/ProjectFte/allocate`, {
      projectId,
      primeCode,
      allocatedFte,
    });
    return response.data;
  } catch (error) {
    console.error("Error allocating FTE:", error?.response?.data || error.message);
    throw error;
  }
};
 
export const getProjectsByOwnerId = async (staffId) => {
  const token = localStorage.getItem("token"); // Adjust key name if different
  const response = await fetch(`https://opsvisionbe.integrator-orange.com/api/ProjectFte/by-owner/${staffId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });
 
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Fetch failed: ${response.status} - ${errorText}`);
    throw new Error("Failed to fetch projects by owner");
  }
 
  return await response.json();
};
 
 
 
// Delete FTE allocation from a project
export const deleteProjectFte = async (primeCode, staffId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/ProjectFteEmployee/deleteold/${primeCode}/${staffId}`);
    console.log("Delete response:", response.data); // Logs response for debugging
    return response.data;
  } catch (error) {
    console.error("Error deleting FTE allocation:", error?.response?.data || error.message);
    throw error;
  }
};
 
 
// Update FTE for a project
export const updateProjectFte = async ({ projectId, primeCode, allocatedFte }) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/ProjectFte/update`, {
      projectId,
      primeCode,
      allocatedFte,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating FTE:", error?.response?.data || error.message);
    throw error;
  }
};
 
 
// Get FTE details for a project
export const getProjectFteDetails = async (projectId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/ProjectFteEmployee/${projectId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching FTE details:", error?.response?.data || error.message);
    return null;
  }
};
 
 
// Login
export const login = async (username, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/Auth/login`, {
      username,
      password
    });
    const data = response.data;
 
    if (data?.token && data?.role) {
      return data;
    } else {
      throw new Error("Invalid response from server.");
    }
  } catch (error) {
    console.error("Login failed:", error?.response?.data || error.message);
    throw new Error("Login failed. Check credentials.");
  }
};
 
 
// Get user projects
export const getUserProjectsByEmail = async (email) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/Project/user-projects-by-email/${encodeURIComponent(email)}`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Error fetching user projects:", error?.response?.data || error.message);
    return [];
  }
};
 
// Update committed hours
export const updateCommittedHours = async ({ projectId, committedHours }) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/Project/update-hours`, {
      projectId,
      committedHours,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating committed hours:", error?.response?.data || error.message);
    return null;
  }
};
 
 
// Assign employee to a project
// Allocate FTE to a project
export const assignEmployeeToProject= async (projectId, primeCode, staffId, allocatedHours) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/ProjectFteEmployee/allocate`, {
      projectId,      // Project ID
      primeCode,      // Prime code (e.g., "PRJ001")
      staffId,        // Staff ID (or employee ID)
      allocatedHours, // Number of hours allocated
    });
    return response.data;  // Return the response data from the API
  } catch (error) {
    console.error("Error allocating FTE:", error?.response?.data || error.message);
    throw error;  // Rethrow error to handle in the calling function
  }
};
 
 
// Update employee assignment
export const updateEmployeeAssignment = async (primeCode, employeeId, allocatedHours) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/EmployeeFteAssignment/${primeCode}/assign/${employeeId}`,
      { allocatedHours }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating employee assignment:", error?.response?.data || error.message);
    throw error;
  }
};
 
 
 