import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { deleteProjectFte } from "../Services/api";
import "./ProjectDetails.css";
import logo from "./images.png";
import backIcon from './backs.png';    
import homeIcon from './home.png';
import logoutIcon from './logout.png';
import back from "./backs.png";
import { useLocation } from 'react-router-dom';

export default function ProjectDetails() {
  // const { projectId } = useParams();
  const [projectId, setProjectId] = useState(null);

  
  const navigate = useNavigate();
  const searchResultsRef = useRef(null);
  const searchInputRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [allocatedFTEs, setAllocatedFTEs] = useState([]);
  const [selectedFte, setSelectedFte] = useState(null);
  const [fteHours, setFteHours] = useState({});
  const [newFTEs, setNewFTEs] = useState([]);
  // const [totalHours, setTotalHours] = useState(0);
  // const [totalHours, setTotalHours] = useState(0); // For total hours
  const[setTotalHours]=useState(0);
  // const[setPrimeCode]=useState(0);
  const [remainingHours, setRemainingHours] = useState(0);
  const [projectName, setProjectName] = useState("");
  // const [primeCode, setPrimeCode] = useState("");
  const [primeCode, setPrimeCode] = useState("N/A");
  const [editableFTEs, setEditableFTEs] = useState({});


  const [delegateFor, setDelegateFor] = useState(null);
  const [delegates, setDelegates] = useState({});
  const [delegatedHours, setDelegatedHours] = useState({});
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [committedHours, setCommittedHours] = useState({});
  const [remarksOptions, setRemarksOptions] = useState([]);
  
  const [fteRemarks, setFteRemarks] = useState({});
  const [managerHoursMap, setManagerHoursMap] = useState({});
  const initialAllocationIds = {}; 
  const [fteAllocationIds, setFteAllocationIds] = useState({});
  // const { projectTaskId } = useParams();
   const location = useLocation();
  const { projectTaskId, taskName, totalHours,primeCodeWithTaskName } = location.state || {};



  const fromPage = location.state?.fromPage || 1;
const fetchAssignedFTEs = async () => {
  const pathSegments = window.location.pathname.split('/');
  const projectTaskId = pathSegments[pathSegments.length - 1];

  console.log('Extracted projectTaskId:', projectTaskId);

  if (!projectTaskId) {
    console.warn('No projectTaskId found in URL');
    return;
  }

  try {
    console.log('Fetching FTEs for projectTaskId:', projectTaskId);
    // Initiate both API calls concurrently
    const [assignedFTEsResponse, allProjectsResponse] = await Promise.all([
      // axios.get(https://localhost:7049/api/ProjectFteEmployee/${projectId}`),
      axios.get('https://opsvisionbe.integrator-orange.com/api/ProjectFteEmployee/fte-by-owner', {
    params: {
      // projectTaskId: projectTaskId,
      projectTaskId: Number(projectTaskId),
    },
  }),
      axios.get("https://opsvisionbe.integrator-orange.com/api/ProjectFte/all")
    ]);

    const { assignedEmployees, remainingHours,projectId, projectName, primeCode ,primeCodeWithTaskName} = assignedFTEsResponse.data;
    setAllocatedFTEs(assignedEmployees || []);
    setRemainingHours(remainingHours || 0);
    setProjectName(projectName || "Unknown Project");
    setPrimeCode(primeCodeWithTaskName || "N/A");
    setProjectId(projectId); // Save projectId in state

    const updatedHours = {};
    (assignedEmployees || []).forEach((fte) => {
      updatedHours[fte.staffId] = fte.allocatedHours ?? 0;
    });
    setFteHours(updatedHours);

    const allocatedSum = (assignedEmployees || []).reduce(
      (sum, fte) => sum + (Number(fte.allocatedHours) || 0),
      0
    );
    setTotalHours((remainingHours || 0) + allocatedSum);

    const initialHours = {};
        const initialRemarks = {};
        const initialAllocationIds = {};
    (assignedEmployees || []).forEach((fte) => {
      console.log("FTE Allocated Hours:", fte.staffId, fte.allocatedHours);
      initialHours[fte.staffId] = fte.allocatedHours ?? 0;

      initialRemarks[fte.staffId] = fte.remarks || "";  //  Extract remarks from each FTE
       initialAllocationIds[fte.staffId] = fte.fteAllocationId; //  Store allocation ID

    });
    setFteHours(initialHours);
     setFteRemarks(initialRemarks);
     setFteAllocationIds(initialAllocationIds);
    setDelegates({});

    await fetchAllCommittedHours(assignedEmployees);

    // Now, let's fetch the total allocated hours for the specific project
    const projectData = allProjectsResponse.data.find(
      (project) => project.projectId === parseInt(projectId)
    );
    if (projectData) {
      setTotalHours(projectData.allocatedHours || 0); // Update total hours from the fetched data
    }

  } catch (error) {
    console.error("Error fetching project data:", error);
  }
};
useEffect(() => {
  async function load() {
    await fetchAssignedFTEs();
  }
  load();
}, []);

  const fetchCommittedHours = async (staffId, projectId) => {
    const pathSegments = window.location.pathname.split('/');
  const projectTaskId = pathSegments[pathSegments.length - 1];
  console.log("Fetching committed hours with:");
  console.log("→ projectTaskIdss:", projectTaskId);
    try {
      const response = await axios.get(`https://opsvisionbe.integrator-orange.com/api/ProjectFteManagement/projecttask/${projectTaskId}/committed-hours`, {
       params: {
          managerStaffId: staffId  // ✅ correct as query param
        }
      });
      return response.data.managerTeamTotal || 0;
    } catch (error) {
      console.error("Error fetching committed hours:", error);
      return 0;
    }
  };

  const fetchAllCommittedHours = async (assignedEmployees) => {
  const fetchPromises = assignedEmployees.map(({ staffId }) =>
    fetchCommittedHours(staffId, projectId).then((committedHour) => [staffId, committedHour])
  );

  const results = await Promise.all(fetchPromises);

  const hours = Object.fromEntries(results);
  setCommittedHours(hours);
};

const fetchManagerTeamTotalHours = async (staffId) => {
  const pathSegments = window.location.pathname.split('/');
  const projectTaskId = pathSegments[pathSegments.length - 1];

  try {
    const response = await axios.get(`https://opsvisionbe.integrator-orange.com/api/ProjectFteManagement/projecttask/${projectTaskId}/committed-hours`, {
      params: {
        managerStaffId: staffId,
      },
    });
    console.log('Manager team total hours:', response.data.managerTeamTotal);
    return response.data.managerTeamTotal || 0;
  } catch (error) {
    console.error('Error fetching manager team total:', error);
    return 0;
  }
};
useEffect(() => {
  const fetchAllManagerHours = async () => {
    const hoursObj = {};
    for (const fte of allocatedFTEs) {
      const hours = await fetchManagerTeamTotalHours(fte.staffId);
      hoursObj[fte.staffId] = hours;
    }
    setManagerHoursMap(hoursObj);
  };

  fetchAllManagerHours();
}, [allocatedFTEs]);

useEffect(() => {
  fetchAssignedFTEs();
}, [location.pathname]);


  useEffect(() => {
    const fetchEmployees = async () => {
      if (!searchQuery) {
        setSearchResults([]);
        setShowSearchResults(false);
        return;
      }
      try {
        const response = await axios.get(`https://opsvisionbe.integrator-orange.com/api/ProjectFteEmployee/searchs`, {
          params: { searchTerm: searchQuery },
        });
        setSearchResults(response.data);
        setShowSearchResults(true);
      } catch (error) {
        console.error("Error fetching employee search results:", error);
      }
    };

    fetchEmployees();
  }, [searchQuery]);
  useEffect(() => {
  const fetchRemarksOptions = async () => {
    try {
      const res = await axios.get("https://opsvisionbe.integrator-orange.com/api/ProjectManagement/fte/remarks");
      setRemarksOptions(res.data);
    } catch (error) {
      console.error("Error fetching remarks options:", error);
    }
  };

  fetchRemarksOptions();
}, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchResultsRef.current && !searchResultsRef.current.contains(event.target) &&
        searchInputRef.current && !searchInputRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectFTE = (fte) => {
    if (delegateFor) {
      setDelegates((prev) => ({
        ...prev,
        [delegateFor.staffId]: [...(prev[delegateFor.staffId] || []), fte],
      }));
      setDelegateFor(null);
    } else {
      const alreadyAssigned = allocatedFTEs.some((existingFte) => existingFte.staffId === fte.staffId);
      if (alreadyAssigned) {
        alert("This employee is already assigned.");
        return;
      }
setEditableFTEs((prev) => ({
      ...prev,
      [fte.staffId]: true,
    }));

      const newFteEntry = {
        staffId: fte.staffId,
        firstName: fte.firstName,
        lastName: fte.lastName,
        email: fte.email,
        allocatedHours: 0,
      };

      setNewFTEs((prev) => [newFteEntry, ...prev]);
      setAllocatedFTEs((prev) => [newFteEntry, ...prev]);
      setFteHours((prev) => ({ ...prev, [newFteEntry.staffId]: "" }));
    }

    setSelectedFte(null);
    setSearchQuery("");
    setShowSearchResults(false);
  };

 const calculateCurrentRemainingHours = (excludeStaffId = null) => {
  let totalMainAllocated = 0;

  for (const { staffId } of allocatedFTEs) {
    if (staffId === excludeStaffId) continue;

    const inputHours = parseFloat(fteHours[staffId]);
    if (!isNaN(inputHours)) {
      totalMainAllocated += inputHours;
    }
  }

  return Math.max(0, totalHours - totalMainAllocated);
};


  const isManager = localStorage.getItem("role") === "manager";

  const handleSaveFTE = async (staffId) => {
    try {
      console.log("🔹 Save FTE initiated for Staff ID:", staffId);

      const allocatedHours = Number(fteHours[staffId]);
      console.log("📊 Allocated Hours:", allocatedHours);

      const delegateeList = (delegates[staffId] || [])
        .filter((delegate) => Number(delegatedHours[staffId]?.[delegate.staffId]) > 0)
        .map((delegate) => ({
          staffId: delegate.staffId,
          staffName: `${delegate.firstName} ${delegate.lastName}`,
          allocatedHours: Number(delegatedHours[staffId]?.[delegate.staffId]),
        }));
      console.log("👥 Delegatees:", delegateeList);

      if (!isManager && (!allocatedHours || allocatedHours <= 0)) {
        alert("Allocated hours must be greater than 0.");
        console.warn("❌ Invalid allocated hours for non-manager.");
        return;
      }

      const remaining = calculateCurrentRemainingHours(staffId);

      console.log("🧮 Remaining Hours:", remaining);

      if (!isManager && allocatedHours > remaining) {
        alert("Not enough remaining hours.");
        console.warn("❌ Allocated hours exceed remaining.");
        return;
      }

      const payload = {
        projectId: Number(projectId),
        primeCode,
        staffId: isManager ? 0 : staffId,
        allocatedHours: isManager ? 0 : allocatedHours,
        delegatees: delegateeList,
         remarks: fteRemarks[staffId] || ""


      };

      console.log("📤 Sending payload to API:", payload);

      const response = await axios.post("https://opsvisionbe.integrator-orange.com/api/ProjectFteEmployee/allocate", payload);
      console.log("✅ Save response:", response);

      // Clean up after successful save
      setNewFTEs((prev) => prev.filter((fte) => fte.staffId !== staffId));
      fetchAssignedFTEs();


    } catch (error) {
      console.error("❌ Error saving FTE:", error);
      alert("Failed to save FTE. Please check your input and try again.");

      // Extract the backend error message if available

  const backendMessage =

    error.response?.data?.message || // your custom backend message
    error.message ||                 // fallback

    "Failed to save FTE. Please try again.";
 
  alert(backendMessage); // Display backend message to user
 
    }


  };

const handleUpdateFTE = async (staffId) => {
  const pathSegments = window.location.pathname.split('/');
  const projectTaskId = pathSegments[pathSegments.length - 1];

  if (!projectTaskId) {
    alert("Project Task ID not found in URL");
    return;
  }

  try {
    const allocatedHours = Number(fteHours[staffId]);

    const delegateeList = (delegates[staffId] || [])
      .filter((delegate) => Number(delegatedHours[staffId]?.[delegate.staffId]) > 0)
      .map((delegate) => ({
        staffId: delegate.staffId,
        staffName: `${delegate.firstName} ${delegate.lastName}`,
        allocatedHours: Number(delegatedHours[staffId]?.[delegate.staffId]),
      }));

    if (!isManager && (!allocatedHours || allocatedHours <= 0)) {
      alert("Allocated hours must be greater than 0");
      await fetchAssignedFTEs();
      const freshFte = allocatedFTEs.find(fte => fte.staffId === staffId);
      if (freshFte) {
        setFteHours((prev) => ({
          ...prev,
          [staffId]: freshFte.allocatedHours || 0,
        }));
      }
      return;
    }

    if (!isManager && allocatedHours > calculateCurrentRemainingHours(staffId)) {
      alert("Not enough remaining hours");
      await fetchAssignedFTEs();
      const freshFte = allocatedFTEs.find(fte => fte.staffId === staffId);
      if (freshFte) {
        setFteHours((prev) => ({
          ...prev,
          [staffId]: freshFte.allocatedHours || 0,
        }));
      }
      return;
    }

    const payload = {
      projectTaskId: Number(projectTaskId),
      projectId: Number(projectId),
      staffId: isManager ? 0 : staffId,
      allocatedHours: isManager ? 0 : allocatedHours,
      delegatees: delegateeList,
    };

    await axios.put("https://opsvisionbe.integrator-orange.com/api/ProjectFteEmployee/update", payload);
    await fetchAssignedFTEs();

  } catch (error) {
    console.error("Error updating FTE:", error);
    alert("Failed to update FTE.");
    await fetchAssignedFTEs();
    const freshFte = allocatedFTEs.find(fte => fte.staffId === staffId);
    if (freshFte) {
      setFteHours((prev) => ({
        ...prev,
        [staffId]: freshFte.allocatedHours || 0,
      }));
    }
  }
};

  const handleSaveAllFTEs = async () => {
    const pathSegments = window.location.pathname.split('/');
    const projectTaskId = pathSegments[pathSegments.length - 1];

    if (!projectTaskId) {
      alert("Project Task ID not found in URL");
      return;
    }
     
    try {
      let remainingPool = totalHours - allocatedFTEs.reduce((sum, fte) => {
        return newFTEs.find(n => n.staffId === fte.staffId)
          ? sum
          : sum + (Number(fteHours[fte.staffId]) || 0);
      }, 0);
  
      const payloadList = [];
  
      for (const fte of newFTEs) {
        const staffId = fte.staffId;
        const allocated = Number(fteHours[staffId]) || 0;
  
        if (!isManager && allocated <= 0) {
          alert(`Allocated hours must be greater than 0 for ${fte.firstName} ${fte.lastName}.`);
          return;
        }
  
        if (!isManager && allocated > remainingPool) {
          alert(`Not enough remaining hours for ${fte.firstName} ${fte.lastName}.`);
          return;
        }
  
        remainingPool -= allocated;
  
        const delegateeList = (delegates[staffId] || [])
          .filter((d) => Number(delegatedHours[staffId]?.[d.staffId]) > 0)
          .map((d) => ({
            staffId: d.staffId,
            staffName: `${d.firstName} ${d.lastName}`,
            allocatedHours: Number(delegatedHours[staffId][d.staffId]),
          }));
  
        payloadList.push({
          projectTaskId: Number(projectTaskId),
          // projectId: Number(projectId),
          // primeCode,
          staffId: isManager ? 0 : staffId,
          allocatedHours: isManager ? 0 : allocated,
          delegatees: delegateeList,
          // remarks: fteRemarks[staffId] || "",            
  
        });
      }
  
      const failedList = [];
  
      // Submit each payload individually
      for (const payload of payloadList) {
        try {
          await axios.post("https://opsvisionbe.integrator-orange.com/api/ProjectFteEmployee/allocate", payload);
        } catch (err) {
          console.error(`❌ Failed to save for staffId ${payload.staffId}`, err);
          failedList.push(payload.staffId);
        }
      }
  
      if (failedList.length > 0) {
        alert(`Some FTEs could not be saved. Failed staff IDs: ${failedList.join(", ")}`);
      }
  
      setNewFTEs([]);
      fetchAssignedFTEs(); // ✅ Only keep this
      // fetchProjects(); ❌ Removed to fix no-undef error
  
    } catch (error) {
      console.error("❌ Unexpected error during save:", error);
      alert("Unexpected error occurred during Save All.");
    }
  };
   const handleUpdateAllAssignedEmployees = async () => {
    try {
      const failedStaff = [];

      for (const fte of allocatedFTEs) {
        const staffId = fte.staffId;
        const allocatedHours = Number(fteHours[staffId]);

        const delegateeList = (delegates[staffId] || [])
          .filter((delegate) => Number(delegatedHours[staffId]?.[delegate.staffId]) > 0)
          .map((delegate) => ({
            staffId: delegate.staffId,
            staffName: `${delegate.firstName} ${delegate.lastName}`,
            allocatedHours: Number(delegatedHours[staffId][delegate.staffId]),
          }));

        if (!isManager && (!allocatedHours || allocatedHours <= 0)) {
          alert(`Allocated hours must be greater than 0 for ${fte.firstName} ${fte.lastName}.`);
          continue;
        }

        if (!isManager && allocatedHours > calculateCurrentRemainingHours(staffId)) {
          alert(`Not enough remaining hours for ${fte.firstName} ${fte.lastName}.`);
          continue;
        }

        const payload = {
          projectId: Number(projectId),
          primeCode,
          staffId: isManager ? 0 : staffId,
          allocatedHours: isManager ? 0 : allocatedHours,
            remarks: fteRemarks[staffId] || "",            
  fteAllocationId: fteAllocationIds[staffId], 
          delegatees: delegateeList,
        };

        try {
          await axios.put("https://opsvisionbe.integrator-orange.com/api/ProjectFteEmployee/update", payload);
        } catch (error) {
          console.error("Failed to update", error);
          failedStaff.push(`${fte.firstName} ${fte.lastName}`);
        }
      }

      await fetchAssignedFTEs();

      if (failedStaff.length > 0) {
        alert(`Some FTEs failed to update: ${failedStaff.join(", ")}`);
      } else {
        alert("All assigned employees updated successfully.");
      }
    } catch (error) {
      console.error("❌ Unexpected error during bulk update:", error);
      alert("Unexpected error occurred while updating assigned employees.");
    }
  };

  // const handleDeleteFTE = async (staffId) => {
  //   try {
  //     await deleteProjectFte(projectId, staffId);
    
  //     setAllocatedFTEs((prev) => prev.filter((fte) => fte.staffId !== staffId));
  //     fetchAssignedFTEs();
  //   } catch (error) {
  //     console.error("Error deleting FTE:", error);
  //   }
  // };

  const handleDeleteFTE = async (staffId) => {
  try {
    // Extract projectTaskId from URL
    const pathSegments = window.location.pathname.split('/');
    const projectTaskId = pathSegments[pathSegments.length - 1];

    if (!projectTaskId) {
      alert("Project Task ID not found in URL");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("User not authenticated");
      return;
    }

    // Call the API with auth header
    const response = await fetch(`https://opsvisionbe.integrator-orange.com/api/ProjectFteEmployee/delete/${projectTaskId}/${staffId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Update state after deletion
    setAllocatedFTEs((prev) => prev.filter((fte) => fte.staffId !== staffId));
    fetchAssignedFTEs();
  } catch (error) {
    console.error("Error deleting FTE:", error);
  }
};

  const handleDelegateClick = (fte) => {
    setDelegateFor(fte);
    setSearchQuery("");
    setShowSearchResults(false);
  };

 const handleDelegateHoursChange = (mainFteId, delegateFteId, hours) => {
  setDelegatedHours(prev => {
    const mainFteDelegates = prev[mainFteId] || {};
    return {
      ...prev,
      [mainFteId]: { 
        ...mainFteDelegates, 
        [delegateFteId]: hours 
      },
    };
  });

  setFteHours(prev => {
    const remainingHours = Number(prev[mainFteId]) - hours;
    return {
      ...prev,
      [mainFteId]: remainingHours > 0 ? remainingHours : 0,
    };
  });
};


  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    
 sessionStorage.removeItem("projectPage");
    sessionStorage.removeItem("projectSearch");
    navigate("/login");
    window.location.reload();
  };

  const totalCommittedHours = Object.values(managerHoursMap).reduce((sum, hours) => sum + hours, 0);
  console.log('Committed Hours:', committedHours);
  const assignedToEmployees = totalHours - calculateCurrentRemainingHours();
  const remainingCommittedHours = assignedToEmployees - totalCommittedHours;

  return (

    <div className="containers">


      <div className="detail--dashboard-header">
  {/* Left Side: Logo + Title */}
  <div className="detail-left-section">
    <img src={logo} alt="Orange Business Logo" className="detail-logo" />
    <div
      className="detail-back-icon-container"
      title="Back to Project Table"
      onClick={() => navigate(`/project-table?page=${fromPage}`)}
    >
      <img src={backIcon} alt="Back" className="detail-icon-btn" />
    </div>
    <h1 className="detail-dashboard-title">
      Allocate Hours
    </h1>
  </div>

  <div className="detail-right-section">
  
    <div
      className="detail-home-icon-container"
      title="Go to Homepage"
      onClick={() => {
        localStorage.setItem("selectedModule", "primeAllocation");
        navigate("/landing");
      }}
    >
      <img src={homeIcon} alt="Home" className="detail-icon-btn" />
    </div>

    <button onClick={handleLogout} title="Logout" className="detail-logout-btn">
      <img src={logoutIcon} alt="Logout" className="detail-icon-btn" />
    </button>
  </div>
</div>
      <div className="form-containers">
        <div className="header-section">
        <div className="project-info-row">
  <h2 className="project-code-left">{primeCode}</h2>

  <div className="hours-info-right">
    <h3 className="total">Total: {totalHours}</h3>
    <h3 className="rem">Remaining Allocations: {calculateCurrentRemainingHours()}</h3>
    <h3 className="comm">Total committed: {totalCommittedHours}</h3>
    <h3 className="rem" style={{ color: "#f7900" }}>
      Remaining Commits: {remainingCommittedHours}
    </h3>
  </div>
</div>

        </div>

        {/* Search Section */}
        <div className="search-section">
          <input
            ref={searchInputRef}

            type="text"
            className="search"
            placeholder={delegateFor ? `Delegate to employee for ${delegateFor?.firstName || ''}...` : "Search employee..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowSearchResults(true)}
          />
{showSearchResults && searchResults.length > 0 && (
  <div className="search-results" ref={searchResultsRef}>
    <ul>
      {searchResults.map((employee) => (
        <li key={employee.staffId}>
          <span>{employee.firstName} {employee.lastName} ({employee.email})</span>
          <button 
            onClick={() => handleSelectFTE(employee)} 
            className="cursor-pointer"
          >
            Select
          </button>
        </li>
        
      ))}
    </ul>
    
  </div>
)}
</div>
{/* <button onClick={handleUpdateAllAssignedEmployees} className="oranges-btn">
  Update All
</button> */}


        {/* FTE Table */}
        {/* <h3 className="table-heading">Allocated FTEs</h3> */}
        <div className="table-scroll-wrapper">
          <table className="borders">
            <thead>
              <tr>
                <th>FTE Name</th>
                {/* <th>Staff ID</th> */}
                <th>Allocated Hours</th>
                {/* <th>Task</th> */}
                <th>Committed Hours</th>
                <th>Remaining Hours</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {allocatedFTEs.map((fte) => (
                <React.Fragment key={fte.staffId}>
                  <tr>
                    <td>{fte.firstName} {fte.lastName}</td>
                  

<td>
  <input
    type="number"
    min="0"
    readOnly={!editableFTEs[fte.staffId]} // Only editable after "Update" clicked
    
    value={fteHours[fte.staffId] ?? 0}
    onChange={(e) => {
      const value = e.target.value;
      setFteHours((prev) => ({ ...prev, [fte.staffId]: value }));
    }}
  />
</td>


 
           

                   <td>{managerHoursMap[fte.staffId] || 0}</td>
                   <td>{(fteHours[fte.staffId] ?? 0)-(managerHoursMap[fte.staffId] || 0)}</td>


                    
                    <td className="table-actions">
                      {newFTEs.some((n) => n.staffId === fte.staffId) ? (
                         <button onClick={handleSaveAllFTEs} className="orange-btn" style={{ marginRight: '8px' }}>Save All</button>

                      ) : (
                        <>
                          {/* <button onClick={() => handleUpdateFTE(fte.staffId)} style={{ marginRight: '8px' }}>Update</button> */}
                          {editableFTEs[fte.staffId] ? (
  <button
    onClick={() => {
      handleUpdateFTE(fte.staffId); // save changes
      setEditableFTEs((prev) => ({ ...prev, [fte.staffId]: false })); // lock field
    }}
    style={{ marginRight: '8px' }}
  >
    Save
  </button>
) : (
  <button
    onClick={() =>
      setEditableFTEs((prev) => ({ ...prev, [fte.staffId]: true }))
    }
    style={{ marginRight: '8px' }}
  >
    Update
  </button>
)}

                          <button onClick={() => handleDeleteFTE(fte.staffId)}>Delete</button>
                        </>
                      )} 
                    </td>
                  </tr>
                  {/* Render delegates directly below the assigner */}
                  {delegates[fte.staffId] && delegates[fte.staffId].map((delegate) => (
                    <tr key={delegate.staffId}>
                      <td colSpan={4} className="delegate-row">
                        {`${fte.firstName} ${fte.lastName} - ${delegate.staffName}`}
                        <input
                          type="number"
                          min="0"
                          placeholder="Delegate hours"
                          value={delegatedHours[fte.staffId]?.[delegate.staffId] || ""}
                          onChange={(e) => handleDelegateHoursChange(fte.staffId, delegate.staffId, e.target.value)}
                        />
                        {delegatedHours[fte.staffId]?.[delegate.staffId] && (
                          <span className="delegated-hours">
                            (Delegated: {delegatedHours[fte.staffId][delegate.staffId]} hours)
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}