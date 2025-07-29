import axios from 'axios';

// Define allowed endpoints by role
const allowedEndpointsByRole = {
  VerticalLead: [
    '/api/ProjectManagement/user-projects',
    '/api/ProjectManagement/store-committed-hours',
    '/api/ProjectManagement/update-committed-hours'
  ],
  ProjectOwner: [
    '/api/ProjectManagement/user-projects',
    '/api/ProjectManagement/store-committed-hours',
    '/api/ProjectManagement/update-committed-hours',
    '/api/ProjectManagement/get-committed-hours',
    '/api/ProjectFteManagement/self-assigned-projects'
  ],
Manager: [
    '/api/ProjectManagement/user-projects',
    '/api/ProjectManagement/store-committed-hours',
    '/api/ProjectManagement/update-committed-hours',
    '/api/ProjectManagement/get-committed-hours',
    '/api/ProjectFteManagement/self-assigned-projects',
    '/api/ProjectFteManagement/my-assigned-projects/exclude-self',
    '/api/ProjectFteManagement/commit-hours',
    '/api/ProjectFteManagement/project/',
 
    
  ],
  Employee: [
    '/api/ProjectManagement/user-projects',
    '/api/ProjectManagement/store-committed-hours',
    '/api/ProjectManagement/update-committed-hours',
    '/api/ProjectManagement/get-committed-hours',
    '/api/ProjectFteManagement/self-assigned-projects',
    '/api/ProjectFteManagement/my-assigned-projects/exclude-self',
    '/api/ProjectFteManagement/commit-hours',

  ]
};

const secureAxios = axios.create({
  baseURL: 'https://opsvisionbe.integrator-orange.com', // Ensure the base URL is correct
});

// Add request interceptor to check for role-based access and authorization token
secureAxios.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!role || !token) {
    return Promise.reject(new Error('No token or role found in localStorage.'));
  }

  const relativeUrl = config.url.replace(config.baseURL, "");
  const allowedEndpoints = allowedEndpointsByRole[role] || [];

  const isAllowed = allowedEndpoints.some(endpoint => relativeUrl.startsWith(endpoint));

  if (!isAllowed) {
    return Promise.reject(new Error(`Unauthorized access to ${relativeUrl} for role: ${role}`));
  }

  // If the token exists, set it in the Authorization header
  config.headers.Authorization = `Bearer ${token}`;

  return config;
}, error => Promise.reject(error));

export default secureAxios;
