import React, {useState} from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import './Navbar.css'


import { FaSearch, FaSignInAlt, FaSignOutAlt } from "react-icons/fa";
import { AiFillHome } from "react-icons/ai";
import { FaUserPlus, FaUser } from "react-icons/fa";
import { FaBell } from "react-icons/fa";
import { HiOutlineBriefcase } from "react-icons/hi";
import { BiBarChart } from "react-icons/bi";
import { FaUsers } from "react-icons/fa";


function LoggedInIcons({ user, onLogout }) {
  
  const [showSearch, setShowSearch] = useState(false)
  const [searchText, setSearchText] = useState("")
  const [activeIcon, setActiveIcon] = useState(null);

  const handleClick = (iconName) => {
    // nếu click lại vào icon đang active thì bỏ chọn
    setActiveIcon(activeIcon === iconName ? null : iconName);
  };
  
  const handleSearchSubmit = (e) => {
    e.preventDefault()
      alert("Search result executed.");
      setSearchText("");
      setShowSearch(false);
    
  }


  return (
    <div className="nav-loggedIn">

      <div className="search-container">
              {!showSearch ? (
                  <FaSearch onClick={() => setShowSearch(true)} className="search-icon" title="Search"/>
              ) : (
                <form onSubmit={handleSearchSubmit} className="search-form">
                  <input
                    type="text"
                    placeholder="Search jobs..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{borderRadius: 2, height: 30, width: 200, padding: '0 8px' }}
                    autoFocus
                    onBlur={() => setTimeout(() => {
                      if (!document.querySelector(".search-results:hover")) {
                         setShowSearch(false);
                      }
                    }, 200)}
                  />
                  <button type="submit" style={{display:"none"}}>Find</button>               
                </form>
              )}
            </div>
 
      {user.role === 'admin' && (
        <>

        <FaBell className={`profile-icon ${activeIcon === "noti" ? "active" : ""}`} onClick={() => handleClick("noti")} title="Notifications" />
        <Link to="/home" > 
          <AiFillHome 
            className={`profile-icon ${activeIcon === "home" ? "active" : ""}`} onClick={() => handleClick("home")} title="Home"
            /> 
        </Link>
        <Link to="/admin/profile">
          <FaUser className={`profile-icon ${activeIcon === "user" ? "active" : ""}`} onClick={()=>handleClick("user")} title="Profile" />
        </Link>

        <Link to="/admin/overview">
          <BiBarChart className={`profile-icon ${activeIcon === "overview" ? "active" : ""}`} onClick={()=>handleClick("overview")} title="System Overview" />
        </Link>

        <Link to="/admin/job-management">
          <HiOutlineBriefcase className={`profile-icon ${activeIcon === "jobs" ? "active" : ""}`} onClick={()=>handleClick("jobs")} title="Manage Jobs" />
        </Link>

        <Link to="/admin/candidates-management">
          <FaUsers className={`profile-icon ${activeIcon === "candidates" ? "active" : ""}`} onClick={()=>handleClick("candidates")} title="All Candidates" /> 
        </Link>

          {/* Thêm nếu có: quản lý user, logs, etc. */}
        </>
      )}

      {user.role === 'recruiter' && (
        <>
          <FaBell className={`profile-icon ${activeIcon === "noti" ? "active" : ""}`} onClick={() => handleClick("noti")} title="Notifications" />
          <Link to="/home" > 
            <AiFillHome 
              className={`profile-icon ${activeIcon === "home" ? "active" : ""}`} onClick={() => handleClick("home")} title="Home"
            /> 
          </Link>
          <Link to="/recruiter/profile">
            <FaUser className={`profile-icon ${activeIcon === "user" ? "active" : ""}`} onClick={()=>handleClick("user")} title="Profile" />
          </Link>
          <Link to="/recruiter/jobsview">
            <HiOutlineBriefcase className={`profile-icon ${activeIcon === "jobs" ? "active" : ""}`} onClick={()=>handleClick("jobs")} title="My Posted Jobs" />
          </Link>
          <Link to="/recruiter/candidates-submittion">
            <FaUsers className={`profile-icon ${activeIcon === "submittions" ? "active" : ""}`} onClick={()=>handleClick("submittions")} title="Applicants" />
          </Link>
        </>
      )}

      {user.role === 'candidate' && (
        <>
          <FaBell className={`profile-icon ${activeIcon === "noti" ? "active" : ""}`} onClick={() => handleClick("noti")} title="Notifications" />
          <Link to="/candidate/profile">
            <HiOutlineBriefcase className={`profile-icon ${activeIcon === "profile" ? "active" : ""}`} onClick={()=>handleClick("profile")} title="My Profile" />
          </Link>
          <Link to="/candidate/job-view">
            <FaRegBookmark className={`profile-icon ${activeIcon === "saved" ? "active" : ""}`} onClick={()=>handleClick("saved")} title="Saved Jobs" />
          </Link>

        </>
      )}
        <FaSignOutAlt onClick={onLogout} className="profile-icon" title="Logout" />
    </div>
  );
}


export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const homePath =
    user?.role === 'admin'
      ? '/admin/overview'
        : user?.role === 'recruiter'
      ? '/recruiter/jobsview'
        : user?.role === 'candidate'
      ? '/candidate/home'
        : '/home'; // fallback nếu không có role

  const goHome = () => navigate(homePath);


  const handleLogOut = () => {
    logout();
  }

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button className="logo-btn" onClick={goHome} title="Home">
          <span className="logo">Anigroups</span>
        </button>
      </div>

      <div className="navbar-right">
        {!user ? (
          <nav className="nav-items">
            <Link to="/home" className="nav-btn"> <AiFillHome /> </Link>
            <Link to="/login" className="nav-btn"> <FaSignInAlt /> </Link>
            <Link to="/signup" className="nav-btn"> <FaUserPlus /> </Link>
          </nav>
        ) : (
          <LoggedInIcons user={user} onLogout={handleLogOut}/>
        )}
      </div>
    </header>
  )
}
