import React, { Component } from 'react';
import './Manager.css';
import logo from './images.png';
import axios from "axios";
import secureAxios from './utils/secureAxios';
import withNavigation from './withNavigation'; // Import the withNavigation HOC
import homeIcon from "./home.png";
import Loader from './Loader';
import TinyLoader from './TinyLoader';
import logoutIcon from './logout.png';



class Manager extends Component {
    constructor(props) {
        super(props);
        this.state = {
            projects: [],
            committedHours: {},
            userProfile: {
                name: 'John Doe',
                email: localStorage.getItem('email') || ''
            },
            editingIndex: null,

            tinyLoaderIndex: null,
            isLoading: true
        };
        this.state = {
            ...this.state,
            searchQuery: "",
            isProjectOwner: false
        };

        this.role = localStorage.getItem("role"); // Store role once
    }

    async componentDidMount() {
        const isProjectOwner = localStorage.getItem("isProjectOwner") === "true";
        this.setState({ isProjectOwner });

        await this.fetchProjects();
    }

    fetchProjects = async (skipLoader = false) => {
        try {
            if (!skipLoader) {
                this.setState({ isLoading: true });
            }


            const tokenFromLocalStorage = localStorage.getItem("token");  // or whatever your key is

            const response = await secureAxios.get("/api/ProjectFteManagement/my-assigned-projects/exclude-self");
            const projectsData = response.data;

            const staffId = localStorage.getItem('staffId');
            if (!staffId) {
                alert("Staff ID not found. Please log in again.");
                return;
            }

            const projectsWithHours = await Promise.all(
                projectsData.map(async proj => {
                    let lastCommittedHours = 0;
                    let totalCommittedHours = 0;
                    let managerTeamTotal = 0;



                    try {
                        const committedRes = await secureAxios.get("/api/ProjectManagement/get-committed-hours", {
                            params: {
                                projectTaskId: proj.projectTaskId,
                                staffId: staffId
                            },
                            headers: { Authorization: `Bearer ${tokenFromLocalStorage}` }
                        });
                        lastCommittedHours = committedRes.data?.committedHours || 0;
                    } catch (err) {
                        console.warn(`Failed to fetch last committed hours for project ${proj.projectId}:`, err);
                    }

                    try {
                        const { data } = await secureAxios.get(`https://opsvisionbe.integrator-orange.com/api/ProjectFteManagement/project/${proj.projectTaskId}/committed-hours`, {

                            params: {

                                managerStaffId: staffId   // <-- Pass it here!

                            }

                        });

                        totalCommittedHours = data?.totalCommittedHours || 0;
                        managerTeamTotal = data?.managerTeamTotal || 0;

                    } catch (err) {
                        console.warn(`Failed to fetch total committed hours for project ${proj.projectId}:`, err);
                    }


                    return {
                        projectId: proj.projectId || "N/A",
                        primeCode: proj.primeCode || "N/A",
                        taskName: proj.taskName || "N/A",
                        allocatedHours: proj.allocatedHours ?? 0,
                        assignedBy: proj.assignedByName || "Unknown",
                        committedHours: totalCommittedHours, // use this as readonly committed hours
                        inputHours: totalCommittedHours,     // default same as above
                        remainingHrs: proj.allocatedHours - lastCommittedHours,
                        managerTeamTotal: managerTeamTotal,
                        lastCommittedHours: lastCommittedHours,
                        projectTaskId:proj.projectTaskId,
                        remarks: proj.remarks || "" 
                    };
                })
            );


            this.setState({ projects: projectsWithHours }, async () => {
                const staffId = localStorage.getItem('staffId');
                const committedHoursMap = {};

                for (const proj of projectsWithHours) {
                    const hours = await this.fetchCommittedHours(staffId, proj.projectId);
                    committedHoursMap[proj.projectId] = hours;
                }

                this.setState({ committedHours: committedHoursMap });
            });


        } catch (error) {
            console.error("Error fetching project data:", error);
            alert(error.message || "Unauthorized or failed to fetch project data.");
        }
        finally {
            if (!skipLoader) {
                this.setState({ isLoading: false }); // only stop loader if it was started
            }
        }

    };





    fetchCommittedHours = async (staffId, projectTaskId) => {
        try {
          const { data } = await axios.get(
            `https://opsvisionbe.integrator-orange.com/api/ProjectManagement/get-committed-hours`,
            {
              params: { projectTaskId, staffId }
            }
          );
          // Return the committedHours from the response, fallback 0 if undefined
          return data.committedHours || 0;
        } catch (error) {
          console.error("Error fetching committed hours:", error);
          return 0;
        }
      };
      


    handleHoursChange = (index, hours) => {
        if (hours < 0) return;

        this.setState(prevState => ({
            projects: prevState.projects.map((project, i) =>
                i === index ? { ...project, inputHours: hours } : project
            )
        }));
    };


    logout = () => {
        localStorage.removeItem('userToken');
        localStorage.removeItem('email');
        localStorage.removeItem('userData');
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('staffId');
        sessionStorage.removeItem("projectPage");
        sessionStorage.removeItem("projectSearch");
        window.location.reload();
        window.location.href = '/login';
    };

    nav = () => {
        this.props.navigate('/dashboard');
    };

    ftes = () => {
        this.props.navigate('/project-table');
    };

    updateCommittedHours = async (index) => {
        this.setState({ tinyLoaderIndex: index });
        const project = this.state.projects[index];
        if (!project) return;

        let committedHours = parseFloat(project.inputHours || 0);
        if (isNaN(committedHours) || committedHours < 0) {
            alert("Committed hours cannot be negative.");
            return;
        }

        const totalCommitted = project.lastCommittedHours + committedHours;
        if (totalCommitted > project.allocatedHours) {
            alert(`Total committed hours (${totalCommitted}) exceed allocated hours (${project.allocatedHours}).`);
            return;
        }

        const staffId = localStorage.getItem('staffId');
        if (!staffId) {
            alert("Staff ID not found. Please log in again.");
            return;
        }

        const isFirstEntry = project.committedHours === 0;

        const postRequestBody = {
            committedHoursDto: {
                projectTaskId: project.projectTaskId,
                staffId: Number(staffId),
                committedHours: committedHours
                
              }
        };

        const putRequestBody = {
            committedHoursDto: {
                projectTaskId: project.projectTaskId,
                staffId: Number(staffId),
                committedHours: committedHours
                
              }
        };

        try {
            const response = await secureAxios[isFirstEntry ? 'post' : 'put'](
                "/api/ProjectFteManagement/commit-hours",
                isFirstEntry ? postRequestBody : putRequestBody
            );

            if (response.status === 200) {
                await this.fetchProjects(true);
                alert("Committed hours saved successfully!");
            } else {
                alert("Failed to save committed hours.");
            }
        } catch (error) {
            alert("Error saving committed hours: " + (error.response ? JSON.stringify(error.response.data) : error.message));
        } finally {
            this.setState({ tinyLoaderIndex: null }); // hide loader after update
        }
    };

    handleAssign = (project) => {
        this.props.navigate('/delegate', {
            state: {
                primeCode: project.primeCode,
                allocatedHours: project.allocatedHours,
                projectId: project.projectId
            }
        });
    };

    render() {
        const { projects, editingIndex, isLoading } = this.state;

        if (isLoading) {
            return <Loader />;
        }




        return (
            <div className="dashboard-container">
                <div className="custom-dashboard-header">
                    {/* Left Side: Logo + Title */}
                    <div className="custom-left-section">
                        <img src={logo} alt="Orange Business Logo" className="custom-logo" />
                        <h1 className="custom-dashboard-title">
                            {this.role === "Employee" ? 'My Clocking' : 'My Team Clocking'}
                        </h1>
                    </div>

                    {/* Right Side: Search + Buttons */}
                    <div className="custom-right-section">
                        <div className="custom-search-container">
                            <input
                                type="text"
                                placeholder="Search by Assigned By or PrimeCode"
                                value={this.state.searchQuery}
                                onChange={(e) => this.setState({ searchQuery: e.target.value })}
                                className="custom-search-input"
                            />
                        </div>

                        {this.role === "Manager" && (
                            <button onClick={this.nav} title="Self Assigned" className="custom-nav-btn">
                                MyClocking
                            </button>
                        )}

                        {this.state.isProjectOwner && (
                            <button onClick={this.ftes} title="FTE Allocation" className="custom-fte-btn">
                                FTE Allocation
                            </button>
                        )}

                        <div
                            className="custom-home-icon-container"
                            title="Go to Homepage"
                            onClick={() => {
                                localStorage.setItem("selectedModule", "primeAllocation");
                                this.props.navigate("/landing");
                            }}
                        >
                            <img src={homeIcon} alt="Home" className="custom-icon-btn" />
                        </div>

                        <button onClick={this.logout} title="Logout" className="custom-logout-btn">
                            <img src={logoutIcon} alt="Logout" className="custom-icon-btn" />
                        </button>
                    </div>
                </div>



                {/* <h1 className="instr">Select a PrimeCode to Begin Assignment</h1> */}
                <div className="tables-section">
                    <div className="tables-wrapper">
                        <table className="tables tables-bordered tables-striped">
                            <thead className="theads-light">
                                <tr>
                                    <th>Assigned By</th>
                                    <th>PrimeCode</th>
                                    {/* <th>Task</th> */}
                                    <th>Allocated Hours</th>
                                    <th>Commit Hours</th>
                                    <th>Your committed</th>
                                    {this.role === "Manager" && <th>Total committed</th>}
                                    {/* <th>Remaining Hours</th> */}
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {projects.filter((project) => {
                                    const query = this.state.searchQuery.toLowerCase();
                                    return (
                                        project.assignedBy.toLowerCase().includes(query) ||
                                        project.primeCode.toLowerCase().includes(query)
                                    );
                                }).map((project, index) => (
                                    <tr key={index}>
                                        <td>{project.assignedBy}</td>
                                        <td>
                                            {this.role === "Manager" ? (
                                                <span
                                                    className="project-link"
                                                    onClick={() =>
                                                        this.props.navigate(`/delegate/${project.projectTaskId}`, {
                                                            state: {
                                                                primeCode: project.primeCode,
                                                                allocatedHours: project.allocatedHours,
                                                                projectId: project.projectId,
                                                                taskName: project.taskName,
                                                                remainingHrs: project.remainingHrs,
                                                            },
                                                        })
                                                    }
                                                    style={{ color: "#ff7900", textDecoration: "underline", cursor: "pointer" }}
                                                >
                                                    {project.primeCode}-{project.taskName}
                                                </span>
                                            ) : (
                                                <span>{project.primeCode}-{project.taskName}</span>
                                            )}
                                        </td>
                                        {/* <td>{project.remarks}</td> */}
                                        <td>{project.allocatedHours}</td>
                                        <td>
                                            {editingIndex === index ? (
                                                <input
                                                    type="number"
                                                    max={project.allocatedHours}
                                                    min="0"
                                                    value={project.inputHours}
                                                    onChange={(e) => this.handleHoursChange(index, e.target.value)}
                                                    onBlur={() => this.setState({ editingIndex: null })}
                                                    autoFocus
                                                />
                                            ) : (
                                                <div
                                                    className="editable-box"
                                                    onClick={() => this.setState({ editingIndex: index })}
                                                >
                                                    {0}
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ color: '#ff7900', fontWeight: '700' }}>{project.lastCommittedHours}</td>
                                        {this.role === "Manager" && (
                                            <td style={{ color: '#ff7900', fontWeight: '700' }}> {this.state.committedHours[project.projectId] || 0}</td>
                                        )}
                                        {/* <td>{project.remainingHrs}</td> */}

                                        <td>
                                            <button onClick={() => this.updateCommittedHours(index)}>
                                                {this.state.tinyLoaderIndex === index ? <TinyLoader /> : 'Update'}
                                            </button>

                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                   
                </div>
            </div>

        );
    }
}

export default withNavigation(Manager);
