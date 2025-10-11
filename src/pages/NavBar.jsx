import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import './NavBar.css';
import { useI18n } from "../i18n";

import { FaSearch, FaSignInAlt, FaSignOutAlt, FaRegBookmark, FaUserPlus, FaUser, FaBars, FaTimes } from "react-icons/fa";
import { AiFillHome } from "react-icons/ai";
import { HiOutlineBriefcase } from "react-icons/hi";
import { BiBarChart } from "react-icons/bi";
import { FaUsers } from "react-icons/fa";

function LoggedInIcons({ user, onLogout, t }) {
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [activeIcon, setActiveIcon] = useState(null);

  const handleClick = (iconName) => {
    setActiveIcon(activeIcon === iconName ? null : iconName);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    alert("Search result executed.");
    setSearchText("");
    setShowSearch(false);
  };

  return (
    <div className="nav-loggedIn">
      <div className="search-container">
        {!showSearch ? (
          <FaSearch onClick={() => setShowSearch(true)} className="search-icon" title="Search" />
        ) : (
          <form onSubmit={handleSearchSubmit} className="search-form">
            <input
              type="text"
              placeholder={t('nav.search_placeholder')}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="search-input"
              autoFocus
              onBlur={() => setTimeout(() => {
                if (!document.querySelector(".search-results:hover")) {
                  setShowSearch(false);
                }
              }, 200)}
            />
            <button type="submit" style={{ display: "none" }}>Find</button>
          </form>
        )}
      </div>

      {/* Các icon hiển thị desktop */}
      {user.role === 'admin' && (
        <>
          <Link to="/home">
            <AiFillHome
              className={`profile-icon ${activeIcon === "home" ? "active" : ""}`}
              onClick={() => handleClick("home")}
              title={t('nav.home')}
            />
          </Link>
          <Link to="/admin/profile">
            <FaUser
              className={`profile-icon ${activeIcon === "user" ? "active" : ""}`}
              onClick={() => handleClick("user")}
              title={t('nav.profile')}
            />
          </Link>
          <Link to="/admin/overview">
            <BiBarChart
              className={`profile-icon ${activeIcon === "overview" ? "active" : ""}`}
              onClick={() => handleClick("overview")}
              title={t('nav.overview')}
            />
          </Link>
          <Link to="/admin/programms-management">
            <HiOutlineBriefcase
              className={`profile-icon ${activeIcon === "programms" ? "active" : ""}`}
              onClick={() => handleClick("programms")}
              title={t('nav.programms')}
            />
          </Link>
          <Link to="/admin/candidates-management">
            <FaUsers
              className={`profile-icon ${activeIcon === "candidates" ? "active" : ""}`}
              onClick={() => handleClick("candidates")}
              title={t('nav.candidates')}
            />
          </Link>
        </>
      )}

      {user.role === 'recruiter' && (
        <>
          <Link to="/home">
            <AiFillHome
              className={`profile-icon ${activeIcon === "home" ? "active" : ""}`}
              onClick={() => handleClick("home")}
              title={t('nav.home')}
            />
          </Link>
          <Link to="/recruiter/profile">
            <FaUser
              className={`profile-icon ${activeIcon === "user" ? "active" : ""}`}
              onClick={() => handleClick("user")}
              title={t('nav.profile')}
            />
          </Link>
          <Link to="/recruiter/programmsview">
            <HiOutlineBriefcase
              className={`profile-icon ${activeIcon === "programms" ? "active" : ""}`}
              onClick={() => handleClick("programms")}
              title={t('nav.programms')}
            />
          </Link>
          <Link to="/recruiter/candidates-submittion">
            <FaUsers
              className={`profile-icon ${activeIcon === "submittions" ? "active" : ""}`}
              onClick={() => handleClick("submittions")}
              title={t('nav.candidates')}
            />
          </Link>
        </>
      )}

      {user.role === 'candidate' && (
        <>
          <Link to="/candidate/profile">
            <HiOutlineBriefcase
              className={`profile-icon ${activeIcon === "profile" ? "active" : ""}`}
              onClick={() => handleClick("profile")}
              title={t('nav.profile')}
            />
          </Link>
          <Link to="/candidate/jobs-view">
            <FaRegBookmark
              className={`profile-icon ${activeIcon === "saved" ? "active" : ""}`}
              onClick={() => handleClick("saved")}
              title="Saved Jobs"
            />
          </Link>
        </>
      )}

      <FaSignOutAlt onClick={onLogout} className="profile-icon" title={t('nav.logout')} />
    </div>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t, lang, changeLang } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);

  const homePath =
    user?.role === 'admin' ? '/admin/overview' :
    user?.role === 'recruiter' ? '/recruiter/jobsview' :
    user?.role === 'candidate' ? '/candidate/home' : '/home';

  const goHome = () => navigate(homePath);
  const handleLogOut = () => logout();

  return (
    <header className="navbar">
      <div className="navbar-left">
        <div className="logo-btn" onClick={goHome} title={t('nav.home')}>
          <span className="logo">AloWorks</span>
        </div>
      </div>

      <div className="navbar-right">

        {/* Menu icon mobile */}
        <div className="menu-toggle" onClick={() => setMenuOpen(true)}>
          <FaBars />
        </div>

        {/* Language toggle desktop */}
        <div className="translator-btn" onClick={() => changeLang(lang === 'vi' ? 'en' : 'vi')} title={t('nav.language')}>
          <img
            src={lang === 'vi' ? 'https://flagcdn.com/h40/us.png' : 'https://flagcdn.com/h40/vn.png'}
            alt={lang}
          />
        </div>

        {/* Desktop nav items */}
        {!user ? (
          <nav className="nav-items">
            <Link to="/home" className="nav-btn"> <AiFillHome title={t('nav.home')} /> </Link>
            <Link to="/login" className="nav-btn"> <FaSignInAlt title={t('nav.login')} /> </Link>
            <Link to="/signup" className="nav-btn"> <FaUserPlus title={t('nav.signup')} /> </Link>
          </nav>
        ) : (
          <LoggedInIcons user={user} onLogout={handleLogOut} t={t} />
        )}
      </div>

      {/* Sidebar mobile */}
      <div className={`sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="close-btn" onClick={() => setMenuOpen(false)}>
          <FaTimes />
        </div>

        <Link to="/home" onClick={() => setMenuOpen(false)}>
          <AiFillHome /> {t('nav.home')}
        </Link>

        {!user && (
          <>
            <Link to="/login" onClick={() => setMenuOpen(false)}>
              <FaSignInAlt /> {t('nav.login')}
            </Link>
            <Link to="/signup" onClick={() => setMenuOpen(false)}>
              <FaUserPlus /> {t('nav.signup')}
            </Link>
          </>
        )}

        {user && (
          <>
            {user.role === 'admin' && (
              <>
                <Link to="/admin/profile" onClick={() => setMenuOpen(false)}><FaUser /> {t('nav.profile')}</Link>
                <Link to="/admin/overview" onClick={() => setMenuOpen(false)}><BiBarChart /> {t('nav.overview')}</Link>
                <Link to="/admin/programms-management" onClick={() => setMenuOpen(false)}><HiOutlineBriefcase /> {t('nav.programms')}</Link>
                <Link to="/admin/candidates-management" onClick={() => setMenuOpen(false)}><FaUsers /> {t('nav.candidates')}</Link>
              </>
            )}
            {user.role === 'recruiter' && (
              <>
                <Link to="/recruiter/profile" onClick={() => setMenuOpen(false)}><FaUser /> {t('nav.profile')}</Link>
                <Link to="/recruiter/programmsview" onClick={() => setMenuOpen(false)}><HiOutlineBriefcase /> {t('nav.programms')}</Link>
                <Link to="/recruiter/candidates-submittion" onClick={() => setMenuOpen(false)}><FaUsers /> {t('nav.candidates')}</Link>
              </>
            )}
            {user.role === 'candidate' && (
              <>
                <Link to="/candidate/profile" onClick={() => setMenuOpen(false)}><HiOutlineBriefcase /> {t('nav.profile')}</Link>
                <Link to="/candidate/jobs-view" onClick={() => setMenuOpen(false)}><FaRegBookmark /> Saved Jobs</Link>
              </>
            )}

            <Link to="#" onClick={() => { handleLogOut(); setMenuOpen(false); }}>
              <FaSignOutAlt /> {t('nav.logout')}
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
