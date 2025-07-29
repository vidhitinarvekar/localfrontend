import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ProjectTable.css";
import logo from "./images.png";
import logoutIcon from './logout.png';
import Loader from "./Loader";
import homeIcon from "./home.png";


const ProjectTable = () => {
  const navigate = useNavigate();

  const [groupedProjects, setGroupedProjects] = useState({});
  const [ownerNames, setOwnerNames] = useState({});
  const [addingTaskPrimeCode, setAddingTaskPrimeCode] = useState(null);
  const [newTaskName, setNewTaskName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingOwnerProjectId, setEditingOwnerProjectId] = useState(null);
const [managerList, setManagerList] = useState([]);
const [selectedManagerId, setSelectedManagerId] = useState(null);
const [allAvailableTasks, setAllAvailableTasks] = useState([]);
const [selectedTaskId, setSelectedTaskId] = useState(null);
const [searchQuery, setSearchQuery] = useState("");


const role = localStorage.getItem("role");

  const itemsPerPage = 5;
  useEffect(() => {
  fetchData();
}, [navigate]);

// Restore state on mount
useEffect(() => {
  const savedState = sessionStorage.getItem('projectTableState');
  if (savedState) {
    const { currentPage: savedPage, searchQuery: savedSearch } = JSON.parse(savedState);
    if (savedPage) setCurrentPage(savedPage);
    if (savedSearch) setSearchQuery(savedSearch);
  }
}, []);

// Save state on change
useEffect(() => {
  sessionStorage.setItem('projectTableState', JSON.stringify({
    currentPage,
    searchQuery,
  }));
}, [currentPage, searchQuery]);



  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const staffId = localStorage.getItem("staffId");
  //       const token = localStorage.getItem("token");

  //       if (!staffId || !token) {
  //         alert("Please login to continue");
  //         navigate("/login");
  //         return;
  //       }

  //       const response = await fetch(`https://localhost:7049/api/ProjectFte/by-owner/${staffId}`, {
  //         headers: {
  //           'accept': '*/*',
  //           'Authorization': `Bearer ${token}`,
  //         },
  //       });

  //       if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  //       const data = await response.json();

  //       const grouped = {};
  //       data.forEach(item => {
  //         if (!grouped[item.primeCode]) grouped[item.primeCode] = [];
  //         const task = item.taskName ? [{
  //           taskId: item.taskId,
  //           taskName: item.taskName,
  //           allocatedFte: item.allocatedFte,
  //           allocatedHours: item.allocatedHours,
  //           ownerName: item.ownerName,
  //           readonly: true
  //         }] : [];

  //         grouped[item.primeCode].push({
  //           projectId: item.projectId,
  //           projectName: item.projectName,
  //           expiryDate: item.expiryDate,
  //           ownerName: item.ownerName,
  //           tasks: task,
  //         });
  //       });

  //       const owners = {};
  //       Object.values(grouped).flat().forEach(p => {
  //         owners[p.projectId] = p.ownerName || "";
  //       });

  //       setGroupedProjects(grouped);
  //       setOwnerNames(owners);
  //     } catch (err) {
  //       setError(err.message);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchData();
  // }, [navigate]);
  useEffect(() => {
  const fetchData = async () => {
    try {
      const staffId = localStorage.getItem("staffId");
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");

      if (!staffId || !token) {
        alert("Please login to continue");
        navigate("/login");
        return;
      }

      let data = [];

      if (role === "VerticalLead") {
        const response = await fetch(`https://opsvisionbe.integrator-orange.com/api/ProjectFte/all`, {
          headers: {
            'accept': '*/*',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        data = await response.json();
      } else {
        const response = await fetch(`https://opsvisionbe.integrator-orange.com/api/ProjectFte/by-owner/${staffId}`, {
          headers: {
            'accept': '*/*',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        data = await response.json();
      }

      // Grouping logic
      const grouped = {};
      data.forEach(item => {
        if (!grouped[item.primeCode]) grouped[item.primeCode] = [];

        const task = item.taskName ? [{
          taskId: item.taskId,
          taskName: item.taskName,
          allocatedFte: item.allocatedFte,
          allocatedHours: item.allocatedHours,
          ownerName: item.ownerName,
          projectTaskId:item.projectTaskId,
          readonly: true
        }] : [];

        grouped[item.primeCode].push({
          projectId: item.projectId,
          projectName: item.projectName,
          expiryDate: item.expiryDate,
          primeCodeWithTaskName: item.primeCodeWithTaskName,
          ownerName: item.ownerName,
          tasks: task,
        });
      });

      const owners = {};
      Object.values(grouped).flat().forEach(p => {
        owners[p.projectId] = p.ownerName || "";
      });

      setGroupedProjects(grouped);
      setOwnerNames(owners);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [navigate]);

const filteredProjects = Object.entries(groupedProjects).filter(([primeCode, projects]) => {
  if (!searchQuery) return true; // Show all if no search query

  const lowerCaseQuery = searchQuery.toLowerCase();

  // Check if primeCode matches
  if (primeCode.toLowerCase().includes(lowerCaseQuery)) return true;

  // Check projects for taskName or ownerName
  return projects.some(project => {
    const ownerMatch = project.ownerName.toLowerCase().includes(lowerCaseQuery);
    const taskNameMatch = project.tasks.some(task => task.taskName.toLowerCase().includes(lowerCaseQuery));
    const taskMatch = project.tasks.some(task => task.taskName.toLowerCase().includes(lowerCaseQuery));
    return ownerMatch || taskNameMatch || taskMatch;
  });
});


const fetchData = async () => {
  try {
    const staffId = localStorage.getItem("staffId");
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!staffId || !token) {
      alert("Please login to continue");
      navigate("/login");
      return;
    }

    let data = [];

    if (role === "VerticalLead") {
      const response = await fetch(`https://opsvisionbe.integrator-orange.com/api/ProjectFte/all`, {
        headers: {
          'accept': '*/*',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      data = await response.json();
    } else {
      const response = await fetch(`https://opsvisionbe.integrator-orange.com/api/ProjectFte/by-owner/${staffId}`, {
        headers: {
          'accept': '*/*',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      data = await response.json();
    }

    const grouped = {};
    data.forEach(item => {
      if (!grouped[item.primeCode]) grouped[item.primeCode] = [];

      const task = item.taskName ? [{
        taskId: item.taskId,
        taskName: item.taskName,
        allocatedFte: item.allocatedFte,
        allocatedHours: item.allocatedHours,
        ownerName: item.ownerName,
        projectTaskId:item.projectTaskId,
        readonly: true
      }] : [];

      grouped[item.primeCode].push({
        projectId: item.projectId,
        projectName: item.projectName,
        expiryDate: item.expiryDate,
        ownerName: item.ownerName,
        tasks: task,
      });
    });

    const owners = {};
    Object.values(grouped).flat().forEach(p => {
      owners[p.projectId] = p.ownerName || "";
    });

    setGroupedProjects(grouped);
    setOwnerNames(owners);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};



  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    sessionStorage.removeItem("projectPage");
    sessionStorage.removeItem("projectSearch");
    navigate("/login");
    window.location.reload();
  };
  // const navigateToProjectDetails = (projectTaskId, task) => {
  //   navigate(`/project-details/${projectTaskId}`, {
  //     state: {
  //       fromPage: 1,
  //       taskName: task.taskName,
  //       primeCode: task.primeCode,
  //       totalHours: task.totalHours,
  //     },
  //   });
  // };
  const navigateToProjectDetails = (primeCode, task) => {
  navigate(`/project-details/${task.projectTaskId}`, {
    state: {
      fromPage: 1,
      taskName: task.taskName,
      primeCode: primeCode, 
      
      totalHours: task.allocatedHours,
    },
  });
};

  const handleOpenAddTask = async (primeCode) => {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch("https://opsvisionbe.integrator-orange.com/api/ProjectFte/alltask", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error("Failed to fetch task list");

    const data = await res.json();
    setAllAvailableTasks(data);
    setAddingTaskPrimeCode(primeCode);
  } catch (err) {
    alert("Error loading task list: " + err.message);
  }
};


 const handleAddTask = async (primeCode) => {
  if (!selectedTaskId) return alert("Please select a task");

  const selectedTask = allAvailableTasks.find(t => t.taskId === selectedTaskId);
  if (!selectedTask) return alert("Invalid task selected");

  try {
    const token = localStorage.getItem("token");
    const res = await fetch("https://opsvisionbe.integrator-orange.com/api/ProjectFte/assign-task", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        primeCode: primeCode,
        taskName: selectedTask.taskName
      }),
    });

    if (!res.ok) throw new Error("Failed to assign task");

    alert("Task assigned successfully");
    setAddingTaskPrimeCode(null);
    setSelectedTaskId(null);

    // await reloadProjectByPrimeCode(primeCode);
    await fetchData();

  } catch (err) {
    alert("Error assigning task: " + err.message);
  }
};

  const handleFteEditToggle = (primeCode, taskId) => {
    const updated = { ...groupedProjects };
    updated[primeCode] = updated[primeCode].map(project => ({
      ...project,
      tasks: (project.tasks || []).map(task => {
        if (task.taskId === taskId) {
          return { ...task, readonly: !task.readonly };
        }
        return task;
      })
    }));
    setGroupedProjects(updated);
    
  };

  const handleFteChange = (primeCode, taskId, newValue) => {
    const updated = { ...groupedProjects };
    updated[primeCode] = updated[primeCode].map(project => ({
      ...project,
      tasks: (project.tasks || []).map(task => {
        if (task.taskId === taskId) {
          return { ...task, allocatedFte: parseFloat(newValue) || 0 };
        }
        return task;
      })
    }));
    setGroupedProjects(updated);
  };
  const reloadProjects = async () => {
  setLoading(true);
  try {
    const staffId = localStorage.getItem("staffId");
    const token = localStorage.getItem("token");

    const response = await fetch(`https://opsvisionbe.integrator-orange.com/api/ProjectFte/by-owner/${staffId}`, {
      headers: {
        'accept': '*/*',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();

    const grouped = {};
    data.forEach(item => {
      if (!grouped[item.primeCode]) grouped[item.primeCode] = [];
      const task = item.taskName ? [{
        taskId: item.taskId,
        taskName: item.taskName,
        allocatedFte: item.allocatedFte,
        allocatedHours: item.allocatedHours,
        ownerName: item.ownerName,
        readonly: true
      }] : [];

      grouped[item.primeCode].push({
        projectId: item.projectId,
        projectName: item.projectName,
        expiryDate: item.expiryDate,
        primeCodeWithTaskName: item.primeCodeWithTaskName,
        ownerName: item.ownerName,
        tasks: task,
      });
    });

    setGroupedProjects(grouped);
  } catch (err) {
    alert("Failed to reload project data: " + err.message);
  } finally {
    setLoading(false);
  }
};
const fetchManagerList = async () => {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch("https://opsvisionbe.integrator-orange.com/api/ProjectManagement/search-managers", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("Failed to fetch managers");
    const data = await res.json();
    setManagerList(data);
  } catch (err) {
    alert("Error loading manager list: " + err.message);
  }
};

const handleOwnerUpdate = async (projectId, newStaffId, primeCode) => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch("https://opsvisionbe.integrator-orange.com/api/ProjectManagement/update-projectowner-staff", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        projectId,
        newStaffId,
      }),
    });

    if (!res.ok) throw new Error("Failed to update project owner");

    alert("Owner updated successfully");
    await fetchData();
    setEditingOwnerProjectId(null);
    setSelectedManagerId(null);
    await reloadProjectByPrimeCode(primeCode);
    await fetchData();
  } catch (err) {
    alert("Error updating owner: " + err.message);
  }
};


  // const handleFteSave = async (primeCode, task) => {
  //   // const project = groupedProjects[primeCode]?.find(p => p.tasks?.find(t => t.taskId === task.taskId));
  //   if (!project) return;
  //    const projectIndex = groupedProjects[primeCode]?.findIndex(p =>
  //   p.tasks?.some(t => t.taskId === task.taskId)
  // );

  // if (projectIndex === -1) return;

  // const project = groupedProjects[primeCode][projectIndex];

  //   const payload = {
  //     projectId: project.projectId,
  //     primeCode: primeCode,
  //     tasks: [
  //       {
  //         taskName: task.taskName,
  //         allocatedFte: task.allocatedFte,
  //       },
  //     ],
  //   };

  //   const isNew = !task.allocatedFte || task.allocatedFte === 0;
  //   const endpoint = isNew ? 'https://localhost:7049/api/ProjectFte/allocate' : 'https://localhost:7049/api/ProjectFte/update';
  //   const method = isNew ? 'POST' : 'PUT';
  //   const token = localStorage.getItem("token");

  //   try {
  //     const res = await fetch(endpoint, {
  // method,
  //       headers: {
  //         'Content-Type': 'application/json',
  //         Authorization: `Bearer ${token}`,
  //       },
  //       body: JSON.stringify(payload),
  //     });

  //     if (!res.ok) throw new Error("API call failed");

     
  //     handleFteEditToggle(primeCode, task.taskId);
  //   const updated = { ...groupedProjects };
  //   updated[primeCode][projectIndex].tasks = updated[primeCode][projectIndex].tasks.map(t =>
  //     t.taskId === task.taskId
  //       ? { ...t, allocatedFte: task.allocatedFte, readonly: true }
  //       : t
  //   );

  //   setGroupedProjects(updated);

  //   alert(`${isNew ? "Allocated" : "Updated"} successfully`);
  // }  catch (err) {
  //     alert("Error: " + err.message);
  //   }
  // };
const handleFteSave = async (primeCode, task) => {
  const token = localStorage.getItem("token");
  const projectList = groupedProjects[primeCode];

  if (!projectList) return;

  let targetProject = null;
  let projectIndex = -1;

  // Find the project containing this task
  for (let i = 0; i < projectList.length; i++) {
    const p = projectList[i];
    if (p.tasks.some(t => t.taskId === task.taskId)) {
      targetProject = p;
      projectIndex = i;
      break;
    }
  }

  if (!targetProject) return;

  const payload = {
    projectId: targetProject.projectId,
    primeCode,
    tasks: [
      {
        taskName: task.taskName,
        allocatedFte: task.allocatedFte,
      },
    ],
  };

  const isNew = task.allocatedFte === 0;
  const endpoint = isNew
    ? "https://opsvisionbe.integrator-orange.com/api/ProjectFte/allocate"
    : "https://opsvisionbe.integrator-orange.com/api/ProjectFte/update";
  const method = isNew ? "POST" : "PUT";

  try {
    const res = await fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("API call failed");

    // ✅ Update local state immediately
    const updatedProjects = { ...groupedProjects };
    updatedProjects[primeCode][projectIndex].tasks = updatedProjects[primeCode][projectIndex].tasks.map(t =>
      t.taskId === task.taskId
        ? { ...t, allocatedFte: task.allocatedFte, readonly: true }
        : t
    );

    // setGroupedProjects(updatedProjects);

    // alert(`${isNew ? "Allocated" : "Updated"} successfully`);
    await fetchData();
    await reloadProjectByPrimeCode(primeCode);
alert(`${isNew ? "Allocated" : "Updated"} successfully`);
await fetchData();


  } catch (err) {
    alert("Error: " + err.message);
  }
};
const reloadProjectByPrimeCode = async (primeCode) => {
  const staffId = localStorage.getItem("staffId");
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`https://opsvisionbe.integrator-orange.com/api/ProjectFte/by-owner/${staffId}`, {
      headers: {
        'accept': '*/*',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("Failed to fetch project data");

    const data = await res.json();

    const filtered = data.filter(item => item.primeCode === primeCode);
    const grouped = [];

    filtered.forEach(item => {
      const task = item.taskName ? {
        taskId: item.taskId,
        taskName: item.taskName,
        allocatedFte: item.allocatedFte,
        allocatedHours: item.allocatedHours,
        ownerName: item.ownerName,
        readonly: true
      } : null;

      const existingIndex = grouped.findIndex(p => p.projectId === item.projectId);

      if (existingIndex !== -1 && task) {
        grouped[existingIndex].tasks.push(task);
      } else {
        grouped.push({
          projectId: item.projectId,
          projectName: item.projectName,
          expiryDate: item.expiryDate,
          primeCodeWithTaskName: item.primeCodeWithTaskName,
          ownerName: item.ownerName,
          tasks: task ? [task] : [],
        });
      }
    });

    // ✅ Replace only the relevant project data
    setGroupedProjects(prev => ({
      ...prev,
      [primeCode]: grouped,
    }));
  } catch (err) {
    console.error("Reload error:", err);
    alert("Failed to reload updated data.");
  }
};

// const handleFteSave = async (primeCode, task) => {
//   const token = localStorage.getItem("token");

//   const projectList = groupedProjects[primeCode];
//   if (!projectList) return;

//   let updatedProjectList = [...projectList];

//   let targetProjectIndex = -1;
//   let targetTaskIndex = -1;

//   for (let i = 0; i < projectList.length; i++) {
//     const taskIndex = projectList[i].tasks.findIndex(t => t.taskId === task.taskId);
//     if (taskIndex !== -1) {
//       targetProjectIndex = i;
//       targetTaskIndex = taskIndex;
//       break;
//     }
//   }

//   if (targetProjectIndex === -1 || targetTaskIndex === -1) return;

//   const project = projectList[targetProjectIndex];
//   const isNew = task.allocatedFte === 0;

//   const payload = {
//     projectId: project.projectId,
//     primeCode,
//     tasks: [
//       {
//         taskName: task.taskName,
//         allocatedFte: task.allocatedFte,
//       },
//     ],
//   };

//   const endpoint = isNew
//     ? "https://localhost:7049/api/ProjectFte/allocate"
//     : "https://localhost:7049/api/ProjectFte/update";
//   const method = isNew ? "POST" : "PUT";

//   try {
//     const res = await fetch(endpoint, {
//       method,
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify(payload),
//     });

//     if (!res.ok) throw new Error("API call failed");

//     // ✅ Update only that one task in state — no full refresh
//     const updatedTask = {
//       ...task,
//       readonly: true, // disable editing after save
//     };

//     updatedProjectList[targetProjectIndex] = {
//       ...project,
//       tasks: [...project.tasks],
//     };
//     updatedProjectList[targetProjectIndex].tasks[targetTaskIndex] = updatedTask;

//     setGroupedProjects(prev => ({
//       ...prev,
//       [primeCode]: updatedProjectList,
//     }));

//     alert(`${isNew ? "Allocated" : "Updated"} successfully`);
//   } catch (err) {
//     alert("Error: " + err.message);
//   }
// };



// Calculate total pages based on filtered data
const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);


// Calculate the current page's codes
const pageCodes = filteredProjects
  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  .map(([primeCode]) => primeCode);


// Function to render pagination controls
const renderPagination = () => {
  const pages = [];
  const totalNumbers = 5; // Number of page buttons to show
  const half = Math.floor(totalNumbers / 2);
  let start = Math.max(1, currentPage - half);
  let end = start + totalNumbers - 1;

  if (end > totalPages) {
    end = totalPages;
    start = Math.max(1, end - totalNumbers + 1);
  }

  // Show first page and ellipsis if needed
  if (start > 1) {
    pages.push(
      <button key={1} onClick={() => setCurrentPage(1)} className="pagination-button">
        1
      </button>
    );
    if (start > 2) {
      pages.push(<span key="start-ellipsis" style={{ color: '#666', padding: '0 8px' }}>...</span>);
    }
  }

  // Generate page number buttons
  for (let i = start; i <= end; i++) {
    pages.push(
      <button
        key={i}
        disabled={i === currentPage}
        onClick={() => setCurrentPage(i)}
        className="pagination-button"
      >
        {i}
      </button>
    );
  }

  // Show last page and ellipsis if needed
  if (end < totalPages) {
    if (end < totalPages - 1) {
      pages.push(<span key="end-ellipsis" style={{ color: '#666', padding: '0 8px' }}>...</span>);
    }
    pages.push(
      <button key={totalPages} onClick={() => setCurrentPage(totalPages)} className="pagination-button">
        {totalPages}
      </button>
    );
  }

  // Return pagination controls
  return (
    <div className="pagination-container" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '20px' }}>
      {/* Previous Button */}
      <button
        disabled={currentPage === 1}
        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
        className="pagination-button"
      >
        &lt;
      </button>

      {/* Page Number Buttons and Ellipses */}
      {pages}

      {/* Next Button */}
      <button
        disabled={currentPage === totalPages}
        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
        className="pagination-button"
      >
        &gt;
      </button>
    </div>
  );
};

  if (loading) return <Loader />;
  if (error) return <div style={{ padding: "20px", color: "red" }}>Error: {error}</div>;

  return (

  <div className="containero">
      {/* Header */}
      <div className="custom-dashboard-header">
        <div className="custom-left-section">
          <img src={logo} alt="Logo" className="custom-logo" />
          <h1 className="custom-dashboard-title">Prime Management</h1>
        </div>
        <div className="custom-right-section">
          <input
  type="text"
  className="custom-searchs-bar"
  placeholder="Search projects..."
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
/>

          <div
    className="detailtable-home-icon-container"
    title="Go to Homepage"
    onClick={() => {
      localStorage.setItem("selectedModule", "primeAllocation");
      navigate("/landing");
    }}
  >
    <img src={homeIcon} alt="Home" className="detailtable-icon-btn" />
  </div>
          <button onClick={handleLogout} className="custom-logout-btn" title="Logout">
            <img src={logoutIcon} alt="Logout" className="custom-icon-btn" />
          </button>
        </div>
      </div>

       <div className="container">

      {/* Prime Code Sections */}
      {pageCodes.map((primeCode) => {
        const projects = groupedProjects[primeCode];
        const allTasks = projects.flatMap(p => p.tasks || []).filter(t => t.taskName);
        const hasTasks = allTasks.length > 0;

        return (
          
          <div key={primeCode} className="prime-code-section">
            {/* Prime Code Header */}
            <div className="prime-code-header">
              <h3 className="prime-code-title">Prime Code: {primeCode}</h3>
              <button
                className="add-task-btn"
                 onClick={() => handleOpenAddTask(primeCode)}
              >
                + Add Task
              </button>
            </div>

            {/* Task Grid */}
            {hasTasks && (
              <div className="task-grid-header">
                <div>Prime</div>
                <div>Owner</div>
                <div>Allocated FTE</div>
                <div>Hours</div>
                <div>Actions</div>
              </div>
            )}

            {hasTasks ? (
              allTasks.map((task) => {
                const isNew = !task.allocatedFte || task.allocatedFte === 0;
                return (
                  <div key={task.taskId} className="task-grid-row"
                  style={{ cursor: 'pointer' }}
                // onClick={() => navigateToProjectDetails(task.projectTaskId,task)}
                onClick={() => navigateToProjectDetails(task.projectTaskId, task)}>
                    {/* Task Name */}
                    <div className="task-name">
                      {primeCode}-{task.taskName}
                    </div>

                    {/* Owner Section */}
                    {/* <div className="owner-section">
                      {editingOwnerProjectId === task.taskId ? (
                        <div className="owner-edit-controls">
                          <select
                            value={selectedManagerId || ""}
                            onChange={(e) => setSelectedManagerId(Number(e.target.value))}
                            className="manager-select"
                          >
                            <option value="">Select</option>
                            {managerList.map((mgr) => (
                              <option key={mgr.staffId} value={mgr.staffId}>
                                {mgr.fullName}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleOwnerUpdate(
                              projects.find(p => p.tasks.some(t => t.taskId === task.taskId))?.projectId, 
                              selectedManagerId, 
                              primeCode
                            )}
                            className="action-btn save"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingOwnerProjectId(null);
                              setSelectedManagerId(null);
                            }}
                            className="action-btn cancel"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="owner-name">{task.ownerName}</span>
                          <button
                            onClick={() => {
                              setEditingOwnerProjectId(task.taskId);
                              fetchManagerList();
                            }}
                            className="edit-owner-btn"
                            title="Edit Owner"
                          >
                            ✎
                          </button>
                        </>
                      )}
                    </div> */}
                    <div className="owner-section">
  {editingOwnerProjectId === task.projectTaskId ? (
    <div className="owner-edit-controls">
      <select
        value={selectedManagerId || ""}
        onChange={(e) => setSelectedManagerId(Number(e.target.value))}
        className="manager-select"
      >
        <option value="">Select</option>
        {managerList.map((mgr) => (
          <option key={mgr.staffId} value={mgr.staffId}>
            {mgr.fullName}
          </option>
        ))}
      </select>
      <button
        onClick={() => handleOwnerUpdate(
          projects.find(p =>
            p.tasks.some(t => t.projectTaskId === task.projectTaskId)
          )?.projectId,
          selectedManagerId,
          primeCode
        )}
        className="action-btn save"
      >
        Save
      </button>
      <button
        onClick={() => {
          setEditingOwnerProjectId(null);
          setSelectedManagerId(null);
        }}
        className="action-btn cancel"
      >
        Cancel
      </button>
    </div>
  ) : (
    <>
      <span className="owner-name">{task.ownerName}</span>
      <button
        onClick={() => {
          setEditingOwnerProjectId(task.projectTaskId);
          fetchManagerList();
        }}
        className="edit-owner-btn"
        title="Edit Owner"
      >
        ✎
      </button>
    </>
  )}
</div>


                    {/* FTE Input */}
                    <div>
                      <input
                        type="number"
                        value={task.allocatedFte}
                        readOnly={task.readonly}
                        onChange={(e) => handleFteChange(primeCode, task.taskId, e.target.value)}
                        className="fte-input"
                        step="0.1"
                        min="0"
                        max="1"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>

                    {/* Hours Display */}
                    <div className="hours-display">
                      {task.allocatedHours}
                    </div>

                    {/* Action Button */}
                    <div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (task.readonly) {
                            handleFteEditToggle(primeCode, task.taskId);
                          } else {
                            handleFteSave(primeCode, task);
                          }
                        }}
                        className={`action-btn ${task.readonly ? (isNew ? 'allocate' : 'update') : 'save'}`}
                      >
                        {task.readonly ? (isNew ? "Allocate" : "Update") : "Save"}
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="no-tasks">
                <p>No tasks available.</p>
              </div>
            )}

     
           {addingTaskPrimeCode === primeCode && (
  <div className="add-task-form">
    <select
      className="add-task-input"
      value={selectedTaskId || ""}
      onChange={(e) => setSelectedTaskId(Number(e.target.value))}
    >
      <option value="">Select a Task</option>
      {allAvailableTasks.map(task => (
        <option key={task.taskId} value={task.taskId}>
          {task.taskName}
        </option>
      ))}
    </select>

                <button
                  className="form-btn save"
                  onClick={() => handleAddTask(primeCode)}
                >
                  Save Task
                </button>
                <button
                  className="form-btn cancel"
                  onClick={() => { 
                    setAddingTaskPrimeCode(null); 
                    setNewTaskName(""); 
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        );
      })}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination-container">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            className="pagination-button"
          >
            ‹
          </button>
          
          {(() => {
            const pages = [];
            const totalNumbers = 5;
            const half = Math.floor(totalNumbers / 2);
            let start = Math.max(1, currentPage - half);
            let end = start + totalNumbers - 1;
            
            if (end > totalPages) {
              end = totalPages;
              start = Math.max(1, end - totalNumbers + 1);
            }
            
            if (start > 1) {
              pages.push(
                <button key={1} onClick={() => setCurrentPage(1)} className="pagination-button">
                  1
                </button>
              );
              if (start > 2) {
                pages.push(<span key="start-ellipsis" style={{ color: '#666', padding: '0 8px' }}>...</span>);
              }
            }
            
            for (let i = start; i <= end; i++) {
              pages.push(
                <button
                  key={i}
                  disabled={i === currentPage}
                  onClick={() => setCurrentPage(i)}
                  className="pagination-button"
                >
                  {i}
                </button>
              );
            }
            
            if (end < totalPages) {
              if (end < totalPages - 1) {
                pages.push(<span key="end-ellipsis" style={{ color: '#666', padding: '0 8px' }}>...</span>);
              }
              pages.push(
                <button key={totalPages} onClick={() => setCurrentPage(totalPages)} className="pagination-button">
                  {totalPages}
                </button>
              );
            }
            
            return pages;
          })()}
          
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            className="pagination-button"
          >
            ›
          </button>
        </div>
      )}
    </div>
    </div>
  );
};

export default ProjectTable;
