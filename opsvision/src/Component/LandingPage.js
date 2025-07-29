import React, { useEffect, useState } from "react";
 
import { useNavigate } from "react-router-dom";
 
import "./LandingPage.css";
 
import Picture11 from "./Picture11.png";
 
import { FaTasks } from "react-icons/fa";
 
import homeIcon from "./home.png";
 
import logoutIcon from "./logout.png";
 
import PowerBiEmbed from "../PowerBiEmbed";
 
const LandingPage = () => {
 
  const navigate = useNavigate();
 
  const [userName, setUserName] = useState("");
 
  const [userRole, setUserRole] = useState("");
 
  const [isProjectOwner, setIsProjectOwner] = useState(false);
 
  const [isLoading, setIsLoading] = useState(true);
 
  const [selectedModule, setSelectedModule] = useState(() => localStorage.getItem("selectedModule") || "");
 
  const [selectedReport, setSelectedReport] = useState(() => localStorage.getItem("selectedReport") || "");
 
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
 
  const [selectedPowerBiTab, setSelectedPowerBiTab] = useState("SERVICE MANAGEMENT");
 
  useEffect(() => {
 
    const name = localStorage.getItem("name") || "John Doe";
 
    const role = localStorage.getItem("role") || "";
 
    const isOwner = localStorage.getItem("isProjectOwner") === "true";
 
    setUserName(name);
 
    setUserRole(role);
 
    setIsProjectOwner(isOwner);
 
    setIsLoading(false);
 
  }, []);
 
  useEffect(() => {
 
    if (!isLoading && !userRole) {
 
      navigate("/login");
 
    }
 
  }, [isLoading, userRole, navigate]);
 
  const handleLogout = () => {
 
    localStorage.clear();
 
    navigate("/login");
 
    window.location.reload();
 
  };
 
  const showPrimeManagement =
 
    userRole === "VerticalLead" ||
 
    userRole === "ProjectOwner" ||
 
    (userRole === "Manager" && isProjectOwner);
 
  const getAvailableReports = () => {
 
    if (userRole === "Manager" || userRole === "Admin") return ["Galderma"];
 
    if (userRole === "VerticalLead") return ["Galderma", "Cockpit", "MIS"];
 
    return [];
 
  };
 
  useEffect(() => {
 
    if (selectedModule) localStorage.setItem("selectedModule", selectedModule);
 
    else localStorage.removeItem("selectedModule");
 
  }, [selectedModule]);
 
  useEffect(() => {
 
    if (selectedReport) localStorage.setItem("selectedReport", selectedReport);
 
    else localStorage.removeItem("selectedReport");
 
  }, [selectedReport]);
 
  if (isLoading) {
 
    return <div className="loading">Loading...</div>;
 
  }
 
  return (
<div className="landing-page">
<div className={`sidebar ${isSidebarCollapsed ? "collapsed" : ""}`}>
<div className="sidebar-header">
 
          {!isSidebarCollapsed && <h2 className="sidebar-title">Modules</h2>}
<button
 
            className="collapse-toggle"
 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
>
 
            {isSidebarCollapsed ? "➤" : "◀"}
</button>
</div>
 
        <ul className="nav-menu">
<li
 
            className={`nav-item ${selectedModule === "primeAllocation" ? "active" : ""}`}
 
            onClick={() => {
 
              setSelectedModule("primeAllocation");
 
              setSelectedReport("");
 
            }}
 
            title="Prime"
>
<FaTasks />
 
            {!isSidebarCollapsed && <span>Prime</span>}
</li>
 
          {(userRole === "Admin" || userRole === "Manager" || userRole === "VerticalLead") && (
<li
 
              className={`nav-item ${selectedModule === "powerBI" ? "active" : ""}`}
 
              onClick={() => {
 
                setSelectedModule("powerBI");
 
                setSelectedReport("");
 
              }}
 
              title="Power BI"
>
<FaTasks />
 
              {!isSidebarCollapsed && <span>Power BI</span>}
</li>
 
          )}
</ul>
 
        <div className="sidebar-bottom-icons">
<div
 
            className="detail-home-icon-container"
 
            title="Go to Homepage"
 
            onClick={() => {
 
              setSelectedModule("");
 
              setSelectedReport("");
 
              localStorage.removeItem("selectedModule");
 
              localStorage.removeItem("selectedReport");
 
              navigate("/landing");
 
            }}
>
<img src={homeIcon} alt="Home" className="button-icon-btn" />
</div>
<button onClick={handleLogout} title="Logout" className="detail-logout-btn">
<img src={logoutIcon} alt="Logout" className="button-icon-btn" />
</button>
</div>
</div>
 
      <div className="main-content">
 
        {selectedModule === "powerBI" ? (
 
          selectedReport ? (
<div className="powerbi-container">
<PowerBiEmbed reportName={selectedReport} />
</div>
 
          ) : (
<div className="powerbi-selection">
<h2 className="section-title">Select Power BI Report</h2>
 
 
              <div className="powerbi-tabs">
<button
 
                  className={`tab-button ${selectedPowerBiTab === "SERVICE MANAGEMENT" ? "active" : ""}`}
 
                  onClick={() => setSelectedPowerBiTab("SERVICE MANAGEMENT")}
>
 
                  SERVICE MANAGEMENT
</button>
<button
 
                  className={`tab-button ${selectedPowerBiTab === "MIS" ? "active" : ""}`}
 
                  onClick={() => setSelectedPowerBiTab("MIS")}
>
 
                  MIS
</button>
</div>
 
              <div className="report-card-container">
 
                {selectedPowerBiTab === "SERVICE MANAGEMENT" &&
 
                  getAvailableReports().includes("Galderma") && (
<div className="report-card" onClick={() => setSelectedReport("Galderma")}>
<FaTasks className="report-icon" />
<h3>Galderma</h3>
 
</div>
 
                  )}
 
                {selectedPowerBiTab === "MIS" &&
 
                  getAvailableReports().includes("MIS") && (
<div className="report-card" onClick={() => setSelectedReport("MIS")}>
<FaTasks className="report-icon" />
<h3>MIS</h3>
<p>Access MIS dashboard and analytics</p>
</div>
 
                  )}
</div>
</div>
 
          )
 
        ) : (
<>
<h1 className="welcome-title">
<span style={{ color: "#ff7900" }}>Hello</span>, {userName}{" "}
<span style={{ color: "#ff7900" }}>!</span>
</h1>
<p className="welcome-subtext">Select a module from the sidebar to begin.</p>
 
            {selectedModule === "primeAllocation" && (
<div className="prime-options">
<h2>Prime Options</h2>
 
                {userRole === "VerticalLead" && (
<button onClick={() => navigate("/project-table")}>FTE Allocation</button>
 
                )}
 
                {userRole === "Manager" && isProjectOwner && (
<>
<button onClick={() => navigate("/project-table")}>FTE Allocation</button>
<button onClick={() => navigate("/dashboard")}>MyClocking</button>
<button onClick={() => navigate("/manager")}>My Team Clocking</button>
</>
 
                )}
 
                {userRole === "ProjectOwner" && isProjectOwner && (
<>
<button onClick={() => navigate("/project-table")}>FTE Allocation</button>
<button onClick={() => navigate("/dashboard")}>MyClocking</button>
<button onClick={() => navigate("/manager")}>My Team Clocking</button>
</>
 
                )}
 
                {userRole === "Manager" && !isProjectOwner && (
<>
<button onClick={() => navigate("/dashboard")}>MyClocking</button>
<button onClick={() => navigate("/manager")}>My Team Clocking</button>
</>
 
                )}
 
                {userRole === "ProjectOwner" && !isProjectOwner && (
<>
<button onClick={() => navigate("/project-table")}>FTE Allocation</button>
<button onClick={() => navigate("/dashboard")}>MyClocking</button>
<button onClick={() => navigate("/manager")}>My Team Clocking</button>
</>
 
                )}
 
                {!showPrimeManagement && userRole === "Employee" && (
<button onClick={() => navigate("/manager")}>My Clocking</button>
 
                )}
</div>
 
            )}
 
            <div className="images">
<img src={Picture11} alt="Visual" className="landing-image" />
</div>
</>
 
        )}
</div>
</div>
 
  );
 
};
 
export default LandingPage;
 
 
 
 