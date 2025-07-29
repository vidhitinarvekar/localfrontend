import React, { useEffect, useState, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import axios from "axios";
import "./Delegate.css";
import logo from "./images.png";
import { useNavigate } from "react-router-dom";
import homeIcon from "./home.png";
import back from "./backs.png";
import logoutIcon from './logout.png';
import backIcon from './backs.png'; 

export default function Delegate() {
   const navigate = useNavigate();
  const { projectId } = useParams();
  const location = useLocation();
  const { allocatedHours, primeCode, taskName } = location.state || {};
 
  const searchResultsRef = useRef(null);
  const searchInputRef = useRef(null);
 
  const [assignedEmployees, setAssignedEmployees] = useState([]);
  const [remainingHours, setRemainingHours] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [fteHours, setFteHours] = useState({});
  const [newEmployees, setNewEmployees] = useState([]);
  const [projectName, setProjectName] = useState("");
  const [committedHoursMap, setCommittedHoursMap] = useState({});
  const pathSegments = window.location.pathname.split('/');
  const projectTaskId = pathSegments[pathSegments.length - 1];
  console.log('Extracted projectTaskId:', projectTaskId);

  const staffId = localStorage.getItem("staffId");
  
 
  useEffect(() => {
    if (projectTaskId) {
      fetchProjectFTEs(projectTaskId);
    }
  }, [projectTaskId]);
 
  useEffect(() => {
    if (projectTaskId) {
      fetchRemainingHrs(projectTaskId);
    }
  }, [projectTaskId]);
 
 
  useEffect(() => {
    const fetchEmployees = async () => {
      if (!searchQuery) {
        setSearchResults([]);
        return;
      }
      try {
        const response = await axios.get(`https://opsvisionbe.integrator-orange.com/api/ProjectFteEmployee/search`, {
          params: { searchTerm: searchQuery },
        });
        setSearchResults(response.data);
      } catch (error) {
        console.error("Error fetching employee search results:", error);
      }
    };
    fetchEmployees();
  }, [searchQuery]);
 
 
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        searchResultsRef.current &&
        !searchResultsRef.current.contains(event.target) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target)
      ) {
        setSearchResults([]);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
 
  const fetchRemainingHrs = async (projectTaskId) => {
    try {
      const response = await axios.get(
        `https://opsvisionbe.integrator-orange.com/api/ProjectManagement/user-projects/task/${projectTaskId}`,
        {
          headers: {
            projecttaskid: projectTaskId,
          },
        }
      );
  
      if (response.data && response.data.remainingHrs !== undefined) {
        setRemainingHours(response.data.remainingHrs);
      } else {
        console.warn("No remainingHrs found in response.");
      }
    } catch (error) {
      console.error("Error fetching remaining hours from API:", error);
    }
  };
  
  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.removeItem("hasRefreshed");
    sessionStorage.removeItem("projectPage");
    sessionStorage.removeItem("projectSearch");
    navigate("/login");
    window.location.reload();
  };
 
  const fetchProjectFTEs = async (projectTaskId) => {
    
    try {
      const response = await axios.get('https://opsvisionbe.integrator-orange.com/api/ProjectFteEmployee/manager-assignments', {
        headers: {
          projectTaskId: projectTaskId  // this would send it as ?projectTaskId=... in URL
        }
      });
      
      const employees = response.data;
  
      setAssignedEmployees(employees || []);
  
      // const initialFte = {};
      const initialFte = {};
employees.forEach(emp => {
  initialFte[emp.staffId] = parseFloat(emp.allocatedHours) || 0;
});
setFteHours(initialFte);

      const committedMap = {};
      let totalAllocated = 0;
  
      await Promise.all(
        employees.map(async (emp) => {
          const hours = parseFloat(emp.allocatedHours) || 0;
          initialFte[emp.staffId] = hours;
          totalAllocated += hours;
  
          // const committed = await fetchCommittedHours(projectTaskId, emp.staffId); // ✅ pass projectTaskId
          // committedMap[emp.staffId] = committed;
          const committedData = await fetchCommittedHours(projectTaskId, emp.staffId);
const committedHours = committedData?.committedHours || 0;
committedMap[emp.staffId] = committedHours;

        })
      );
  
      setFteHours(initialFte);
      setCommittedHoursMap(committedMap);
      setNewEmployees([]);
  
      const remaining = parseFloat(allocatedHours) - totalAllocated;
      setRemainingHours(remaining >= 0 ? remaining : 0);
      
      return employees;
    } catch (err) {
      console.error("Error fetching FTEs:", err);
      return [];
    }
  };
  
 
  // const totalCommittedHours = Object.values(committedHours).reduce((sum, hours) => sum + hours, 0);
  const totalCommittedHours = Object.values(committedHoursMap).reduce(
    (sum, hours) => sum + parseFloat(hours || 0),
    0
  );

  const fetchCommittedHours = async (projectTaskId, staffId) => {
    try {
      const response = await axios.get(`https://opsvisionbe.integrator-orange.com/api/ProjectManagement/get-committed-hours`, {
        params: { projectTaskId, staffId }
      });
  
      // Return the entire data object as is, or provide a fallback structure
      return response.data || {
        projectTaskId,
        projectId: null,
        staffId,
        committedHours: 0,
        remainingHrs: 0
      };
    } catch (error) {
      console.error("Error fetching committed hours:", error);
      return {
        projectTaskId,
        projectId: null,
        staffId,
        committedHours: 0,
        remainingHrs: 0
      };
    }
  };
  
 
 
  const handleSelectEmployee = (employee) => {
    const alreadyAssigned = assignedEmployees.some(emp => emp.staffId === employee.staffId);
 
  const alreadySelected = newEmployees.some(emp => emp.staffId === employee.staffId);
 
  if (alreadyAssigned || alreadySelected) {
 
    alert("This employee is already assigned or selected.");
 
    return;
  }
  setNewEmployees((prev) => [...prev, employee]);
 
  setSearchQuery("");
  setSearchResults([]);
};
const handleSaveAllNewEmployees = async () => {

    try {
      // const pathSegments = window.location.pathname.split('/');
      // const projectTaskId = pathSegments[pathSegments.length - 1];
    
      // console.log('Extracted projectTaskId:', projectTaskId);
    
      let totalToAssign = 0;
 
      const payloadList = [];
 
      for (const emp of newEmployees) {
        const allocated = parseFloat(fteHours[emp.staffId]);
 
        if (!allocated || allocated <= 0) {
          alert(`Please enter valid allocated hours for ${emp.firstName} ${emp.lastName}.`);
          return;
        }
 
        totalToAssign += allocated;
 
       const payload = {
        projectTaskId: parseInt(projectTaskId), 
        //projectId: parseInt(projectId),
 
 
  delegatees: [
    {
      staffId: emp.staffId,
      staffName: emp.staffName || "Unknown",
      allocatedHours: allocated
    }
  ]
};
        payloadList.push(payload);
      }
 
      if (totalToAssign > remainingHours) {
        alert(`Only ${remainingHours} hours are remaining. Cannot assign ${totalToAssign}.`);
        return;
      }
       const failedStaff=[];
      for (const payload of payloadList) {
       try{ await axios.post(`https://opsvisionbe.integrator-orange.com/api/ProjectFteEmployee/allocate`, payload);
      }catch (err) {
          console.error(`❌ Failed to save for staffId ${payload.staffId}:`, err);
          failedStaff.push(payload.staffId);
        }
      }
  
      if (failedStaff.length > 0) {
        alert(`Some employees could not be saved. Failed Staff IDs: ${failedStaff.join(", ")}`);
      }
  
      setNewEmployees([]);
      fetchProjectFTEs(projectTaskId);
  
    } catch (error) {
      console.error("❌ Unexpected error while saving new employees:", error);
      alert("Unexpected error occurred during allocation.");
    }
  };
 
 
 
 const handleUpdateHours = async (staffIdToUpdate) => {
    try {
      const newAllocated = parseFloat(fteHours[staffIdToUpdate]);
  
      if (isNaN(newAllocated) || newAllocated <= 0) {
        alert("Allocated hours must be a valid number greater than 0.");
        const freshList = await fetchProjectFTEs(projectTaskId);
  
        const freshEmp = freshList.find(emp => emp.staffId === staffIdToUpdate);
        if (freshEmp) {
          setFteHours(prev => ({
            ...prev,
            [staffIdToUpdate]: freshEmp.allocatedHours || 0,
          }));
        }
        return;
      }
  
      const currentEmp = assignedEmployees.find(emp => emp.staffId === staffIdToUpdate);
      const prevAllocated = parseFloat(currentEmp?.allocatedHours || 0);
      const delta = newAllocated - prevAllocated;
  
      if (delta > remainingHours) {
        alert(`You only have ${remainingHours} hours remaining. Cannot assign additional ${delta} hours.`);
  
        const freshList = await fetchProjectFTEs(projectTaskId);
        const freshEmp = freshList.find(emp => emp.staffId === staffIdToUpdate);
        if (freshEmp) {
          setFteHours(prev => ({
            ...prev,
            [staffIdToUpdate]: freshEmp.allocatedHours || 0,
          }));
        }
        return;
      }
  
      const loggedInStaffId = parseInt(localStorage.getItem("staffId"));
  
      const payload = {
        projectTaskId: parseInt(projectTaskId), // NEW field
        //projectId: parseInt(projectId),
        //staffId: loggedInStaffId,
        delegatees: [
          {
            staffId: staffIdToUpdate,
      staffName: currentEmp?.staffName || "Unknown",
      allocatedHours: newAllocated,
          }
        ]
      };
  
      await axios.put("https://opsvisionbe.integrator-orange.com/api/ProjectFteEmployee/update", payload);
  
      const freshList = await fetchProjectFTEs(projectTaskId);
      const freshEmp = freshList.find(emp => emp.staffId === staffIdToUpdate);
      if (freshEmp) {
        setFteHours(prev => ({
          ...prev,
          [staffIdToUpdate]: freshEmp.allocatedHours || 0,
        }));
      }
  
    } catch (error) {
      console.error("Error updating hours:", error);
      alert("Failed to update hours.");
  
      const freshList = await fetchProjectFTEs(projectTaskId);
      const freshEmp = freshList.find(emp => emp.staffId === staffIdToUpdate);
      if (freshEmp) {
        setFteHours(prev => ({
          ...prev,
          [staffIdToUpdate]: freshEmp.allocatedHours || 0,
        }));
      }
    }
  };

 const handleUpdateAllAssignedEmployees = async () => {
  try {
    let totalToAssign = 0;
    const payloadList = [];
    const loggedInStaffId = parseInt(localStorage.getItem("staffId"));

    for (const emp of assignedEmployees) {
      const allocated = parseFloat(fteHours[emp.staffId]);

      if (!allocated || allocated <= 0) {
        alert(`Please enter valid allocated hours for ${emp.firstName} ${emp.lastName}.`);
        return;
      }

      const prevAllocated = parseFloat(emp.allocatedHours || 0);
      const delta = allocated - prevAllocated;

      if (delta > remainingHours) {
        alert(`Not enough remaining hours to assign additional ${delta} to ${emp.firstName} ${emp.lastName}.`);
        return;
      }

      totalToAssign += delta;

      payloadList.push({
        projectId: parseInt(projectId),
        primeCode,
        staffId: loggedInStaffId,
        delegatees: [
          {
            staffId: emp.staffId,
            staffName: emp?.staffName || `${emp.firstName} ${emp.lastName}`,
            allocatedHours: allocated
          }
        ]
      });
    }

    // Perform all updates
    for (const payload of payloadList) {
      await axios.put(`https://opsvisionbe.integrator-orange.com/api/ProjectFteEmployee/update`, payload);
      await fetchProjectFTEs(projectTaskId);
    }


    // fetchProjectFTEs(projectId);
  } catch (error) {
    console.error("Error updating all employees:", error);
    alert("Failed to update one or more employees.");
  }
};

 

 
 
 
  const handleDeleteFte = async (staffIdToDelete) => {
    const delegatedBy = parseInt(localStorage.getItem('staffId'));
    try {
      await axios.delete(`https://opsvisionbe.integrator-orange.com/api/ProjectFteEmployee/deletenew/${projectTaskId}/${staffIdToDelete}`, {
        data: {
          delegatedBy: delegatedBy
        }
      });
     
      fetchProjectFTEs(projectTaskId);
    } catch (error) {
      console.error("Error deleting FTE:", error);
    }
  };
  

 const remainingCommittedHours = parseFloat(allocatedHours) - totalCommittedHours;
  return (
    <div className="delegate-wrapper-delegate">
     <div className="detail-dashboard-header-delegate">
  {/* Left Side: Logo + Title */}
  <div className="detail-left-section-delegate">
    <img src={logo} alt="Orange Business Logo" className="detail-logo" />
    <div
      className="detail-back-icon-container-delegate"
      title="Back"
      onClick={() => navigate("/manager")}
    >
      <img src={backIcon} alt="Back" className="detail-icon-btn" />
    </div>
    <h1 className="detail-dashboard-title-delegate">
      Assign To Team
    </h1>
  </div>

  <div className="detail-right-section-delegate">
  
    <div
      className="detail-home-icon-container-delegate"
      title="Go to Homepage"
      onClick={() => {
        localStorage.setItem("selectedModule", "primeAllocation");
        navigate("/landing");
      }}
    >
      <img src={homeIcon} alt="Home" className="detail-icon-btn-delegate" />
    </div>

    <button onClick={handleLogout} title="Logout" className="detail-logout-btn">
      <img src={logoutIcon} alt="Logout" className="detail-icon-btn-delegate" />
    </button>
  </div>
</div>
 
     <div className="delegate-project-info-delegate">
  <p style={{ color: "#ff7900", fontWeight: "bold" }}>{primeCode}-{taskName}</p>
  <p>Total Hours: {allocatedHours}</p>
  <p style={{ color: "#ff7900" }}>Remaining Allocations: {remainingHours}</p>
  <p>Total Commits: {totalCommittedHours}</p>
  <p style={{ color: "#ff7900" }}>Remaining Commits: {remainingCommittedHours}</p>
</div>
 
      {/* Search Bar */}
      <div className="delegate-search-section-delegate">
        <input
          ref={searchInputRef}
          type="text"
          className="delegate-search-input-delegate"
          placeholder="Search employee..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setSearchResults(searchQuery ? searchResults : [])}
        />
        {searchResults.length > 0 && (
          <div className="delegate-search-results-delegate" ref={searchResultsRef}>
            <ul>
              {searchResults.map((employee) => (
                <li key={employee.staffId}>
                  <span>{employee.firstName} {employee.lastName} ({employee.email})</span>
                  <button onClick={() => handleSelectEmployee(employee)}>Select</button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
     <div className="action-buttons-delegate">
      {newEmployees.length > 0 && (
        <button className="save-all-button-delegate" onClick={handleSaveAllNewEmployees}>
          Save All
        </button>
      )}
      {assignedEmployees.length > 0 && (
        <button className="update-all-button-delegate" onClick={handleUpdateAllAssignedEmployees}>
          Update All
        </button>
      )}
    </div>

 
      {/* FTE Table */}
      <div className="delegate-table-container-delegate">
        <h2>Assigned Employees</h2>
        <table className="delegate-table-delegate">
          <thead>
            <tr>
              <th>Staff Name</th>
              <th>Allocated Hours</th>
              <th>Committed hours</th>
              <th>Actions</th>
            </tr>
          </thead>
         <tbody>
          {newEmployees.map((emp) => (
  <tr key={emp.staffId}>
    <td>{`${emp.firstName} ${emp.lastName}`}</td>
    <td>
      <input
        type="number"
        min="0"
        value={fteHours[emp.staffId] || ""}
        onChange={(e) =>
          setFteHours({ ...fteHours, [emp.staffId]: e.target.value })
        }
        placeholder="Enter hours"
      />
    </td>
    <td>{committedHoursMap[emp.staffId] || 0}</td>
    <td>Pending</td>
  </tr>
))}
 
            {assignedEmployees.map((emp) => (
              <tr key={emp.staffId}>
                <td>{`${emp.firstName} ${emp.lastName}`}</td>
 
                <td>
                  <input
                    type="number"
                     min="0"
                    value={fteHours[emp.staffId] || ""}
                    onChange={(e) =>
                      setFteHours({ ...fteHours, [emp.staffId]: e.target.value })
                    }
                  />
                </td>
                <td>{committedHoursMap[emp.staffId] || 0}</td>
 
                <td>
                <button onClick={() => handleUpdateHours(emp.staffId)}>Update</button>
 
                  <button onClick={() => handleDeleteFte(emp.staffId)}>Delete</button>
                </td>
              </tr>
            ))}
 
          </tbody>
        </table>
      </div>
    </div>
  );
}