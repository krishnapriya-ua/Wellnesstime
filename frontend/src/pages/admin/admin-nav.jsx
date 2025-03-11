import React, { useState } from "react";
import { Link,NavLink } from "react-router-dom";
import "../../assets/styles/adminav.css";
import logo from "../../assets/images/thick.png";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutAdmin } from "../../redux/slices/adminSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";
export function AdminNavbar() {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const navigate = useNavigate()
  const dispatch=useDispatch()

 
  const handleLogout = () => {
     dispatch(logoutAdmin())
      navigate('/admin/login')

  }

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  return (
    <div className="admin-container">
      {/* Vertical Sidebar */}
      <div className={`vertical-sidebar text-center ${isSidebarVisible ? "show" : ""}`}>
      <Link to='/admin/dashboard' style={{textDecoration:'none',color:'black'}}>
      <div className="last">
        <img src={logo} style={{ maxWidth: "60px" }} alt="" />
          <p className="text-center">WELLNESS TIME</p>
        </div>
      </Link>
        <ul className="nav-links">
          <li>
            <NavLink className={({ isActive }) => (isActive ? 'active-link' : '')} to='/admin/dashboard'>REPORTS</NavLink>
          </li>
          <li>
            <NavLink   className={({ isActive }) => (isActive ? 'active-link' : '')} to="/admin/users">USERS</NavLink>
          </li>
          <li>
            <NavLink   className={({ isActive }) => (isActive ? 'active-link' : '')} to="/admin/workout">WORKOUTS</NavLink>
          </li>
          <li>
            <NavLink   className={({ isActive }) => (isActive ? 'active-link' : '')} to="/admin/music">MUSICS</NavLink>
          </li>
          <li>
            <NavLink   className={({ isActive }) => (isActive ? 'active-link' : '')} to="/admin/trainer">TRAINERS</NavLink>
          </li>
          <li>
            <NavLink   className={({ isActive }) => (isActive ? 'active-link' : '')}  to="/admin/new-applicants">NEW APPLICANTS</NavLink>
          </li>
          <li>
            {/* Logout Button (Visible only in Sidebar for Small Screens) */}
            <button onClick={handleLogout} className="logout-button">LOGOUT</button>
          </li>
        </ul>
      </div>

      {/* Top Navbar */}
      <div className="top-navbar">
      <div className="logo-small-screen">
        <Link to='/admin/dashboard'>
          <img src={logo} alt="Logo" style={{ height: "66px" }} />
          </Link>
        </div>
        <ul className="nav-links">
          {/* Show Menu Button Only on Small Screens */}
          <button className="menu" onClick={toggleSidebar}>
            <FontAwesomeIcon icon={isSidebarVisible ? faTimes : faBars} size="lg" />
          </button>
          <button className="logoutbig" onClick={handleLogout}>LOGOUT</button>
        </ul>
      </div>
    </div>
  );
}
