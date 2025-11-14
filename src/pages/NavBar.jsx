import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../i18n";
import "./NavBar.css";

import {
  FaSearch,
  FaSignInAlt,
  FaSignOutAlt,
  FaRegBookmark,
  FaUserPlus,
  FaUser,
  FaBars,
  FaTimes,
  FaUsers,
} from "react-icons/fa";
import { AiFillHome } from "react-icons/ai";
import { HiOutlineBriefcase } from "react-icons/hi";
import { BiBarChart } from "react-icons/bi";

import { getProgrammsList } from "../api"; // API để load danh sách programms

function LoggedInIcons({ user, onLogout, t }) {
  const [activeIcon, setActiveIcon] = useState(null);

  const handleClick = (iconName) => {
    setActiveIcon(activeIcon === iconName ? null : iconName);
  };

  return (
    <div className="nav-loggedIn">
      {user.role === "admin" && (
        <>
          <Link to="/home">
            <AiFillHome
              className={`profile-icon ${
                activeIcon === "home" ? "active" : ""
              }`}
              onClick={() => handleClick("home")}
              title={t("nav.home")}
            />
          </Link>
          <Link to="/admin/profile">
            <FaUser
              className={`profile-icon ${
                activeIcon === "user" ? "active" : ""
              }`}
              onClick={() => handleClick("user")}
              title={t("nav.profile")}
            />
          </Link>
          <Link to="/admin/overview">
            <BiBarChart
              className={`profile-icon ${
                activeIcon === "overview" ? "active" : ""
              }`}
              onClick={() => handleClick("overview")}
              title={t("nav.overview")}
            />
          </Link>
          <Link to="/admin/programms-management">
            <HiOutlineBriefcase
              className={`profile-icon ${
                activeIcon === "programms" ? "active" : ""
              }`}
              onClick={() => handleClick("programms")}
              title={t("nav.programms")}
            />
          </Link>
          <Link to="/admin/candidates-management">
            <FaUsers
              className={`profile-icon ${
                activeIcon === "candidates" ? "active" : ""
              }`}
              onClick={() => handleClick("candidates")}
              title={t("nav.candidates")}
            />
          </Link>
        </>
      )}

      {user.role === "recruiter" && (
        <>
          <Link to="/home">
            <AiFillHome
              className={`profile-icon ${
                activeIcon === "home" ? "active" : ""
              }`}
              onClick={() => handleClick("home")}
              title={t("nav.home")}
            />
          </Link>
          <Link to="/recruiter/profile">
            <FaUser
              className={`profile-icon ${
                activeIcon === "user" ? "active" : ""
              }`}
              onClick={() => handleClick("user")}
              title={t("nav.profile")}
            />
          </Link>
          <Link to="/recruiter/programmsview">
            <HiOutlineBriefcase
              className={`profile-icon ${
                activeIcon === "programms" ? "active" : ""
              }`}
              onClick={() => handleClick("programms")}
              title={t("nav.programms")}
            />
          </Link>
          <Link to="/recruiter/candidates-submittion">
            <FaUsers
              className={`profile-icon ${
                activeIcon === "submittions" ? "active" : ""
              }`}
              onClick={() => handleClick("submittions")}
              title={t("nav.candidates")}
            />
          </Link>
        </>
      )}

      {user.role === "candidate" && (
        <>
          <Link to="/candidate/profile">
            <HiOutlineBriefcase
              className={`profile-icon ${
                activeIcon === "profile" ? "active" : ""
              }`}
              onClick={() => handleClick("profile")}
              title={t("nav.profile")}
            />
          </Link>
          <Link to="/candidate/jobs-view">
            <FaRegBookmark
              className={`profile-icon ${
                activeIcon === "saved" ? "active" : ""
              }`}
              onClick={() => handleClick("saved")}
              title="Saved Jobs"
            />
          </Link>
        </>
      )}

      <FaSignOutAlt
        onClick={onLogout}
        className="profile-icon"
        title={t("nav.logout")}
      />
    </div>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t, lang, changeLang } = useI18n();

  const [menuOpen, setMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState("");

  const [programms, setProgramms] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    getProgrammsList()
      .then((data) => setProgramms(data.data || [])) // <- data.data nếu API trả về object. Dung de tim chuong trinh
      .catch(console.error);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("sidebar-open", menuOpen);
  }, [menuOpen]);

  const homePath =
    user?.role === "admin"
      ? "/admin/overview"
      : user?.role === "recruiter"
      ? "/recruiter/jobsview"
      : user?.role === "candidate"
      ? "/candidate/home"
      : "/home";

  const goHome = () => navigate(homePath);
  const handleLogOut = () => logout();

  // === Search ===
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchText(value); // dùng searchText cho cả input và filter
    if (!value.trim()) return setSuggestions([]);
    const lowerValue = value.toLowerCase();
    const matched = programms.filter(
      (p) =>
        p.title?.toLowerCase().includes(lowerValue) ||
        p.company?.toLowerCase().includes(lowerValue) ||
        p.land?.toLowerCase().includes(lowerValue)
    );
    setSuggestions(matched.slice(0, 5));
  };

  const handleSelect = (program) => {
    navigate(`/programm/${program._id}`);
    setSearchText("");
    setSuggestions([]);
    setShowSearch(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    alert(`Tìm kiếm: ${searchText}`);
    setSearchText("");
    setShowSearch(false);
  };
  const handleTranslate = (langTarget) => {
    changeLang(langTarget); // Dịch UI i18n
  };
  return (
    <header className="navbar">
      <div className="navbar-left">
        <div className="logo-btn" onClick={goHome} title={t("nav.home")}>
          <span className="logo">AloWork</span>
        </div>
        {/* <!-- 🌐 Google Translate Button --> */}
                {/* <!-- 🌐 Google Translate Button --> */}
       
      </div>

      <div className="navbar-right">
        <div className="home-translator-btn">
          <button
            className="home-translate-button"
            onClick={() => handleTranslate(lang === "vi" ? "en" : "vi")}
          >
            {lang === "en" ? "ENG" : "VIE"}
          </button>
        </div>
       
        {/* Search */}
        <div className="search-container">
          {!showSearch ? (
            <FaSearch
              onClick={() => setShowSearch(true)}
              className="search-icon"
              title={t("nav.search_title")}
            />
          ) : (
            <form onSubmit={handleSearchSubmit} className="search-form">
              <input
                type="text"
                placeholder={t("nav.search_placeholder")}
                value={searchText}
                onChange={handleSearchChange}
                className="search-input"
                autoFocus
                onBlur={() =>
                  setTimeout(() => {
                    setShowSearch(false); // Ẩn input + suggestions
                    setSuggestions([]); // Xóa suggestion khi ẩn
                  }, 150)
                }
              />
              <button type="submit" style={{ display: "none" }}>
                {t("nav.search_button")}
              </button>
            </form>
          )}

          {showSearch && suggestions.length > 0 && (
            <div className="suggestions-list">
              {suggestions.map((p) => (
                <div
                  key={p._id}
                  className="suggestion-item"
                  onClick={() => handleSelect(p)}
                >
                  <img
                    src={p.logoL || p.logo}
                    alt={p.title}
                    style={{ width: 40, height: 40, borderRadius: 8 }}
                  />
                  <span>{p.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Menu icon mobile */}
        <div className="menu-toggle" onClick={() => setMenuOpen(true)}>
          <FaBars />
        </div>

        {/* Language toggle
        <div className="translator-btn" onClick={() => changeLang(lang === 'vi' ? 'en' : 'vi')} title={t('nav.language')}>
          <img src={lang === 'vi' ? 'https://flagcdn.com/h40/us.png' : 'https://flagcdn.com/h40/vn.png'} alt={lang} />
        </div> */}

        {/* Desktop nav items */}
        {!user ? (
          <nav className="nav-items">
            <Link to="/home" className="nav-btn">
              {" "}
              <AiFillHome title={t("nav.home")} />{" "}
            </Link>
            <Link to="/login" className="nav-btn">
              {" "}
              <FaSignInAlt title={t("nav.login")} />{" "}
            </Link>
            <Link to="/signup" className="nav-btn">
              {" "}
              <FaUserPlus title={t("nav.signup")} />{" "}
            </Link>
          </nav>
        ) : (
          <LoggedInIcons user={user} onLogout={handleLogOut} t={t} />
        )}
      </div>

      {/* Sidebar mobile */}
      <div className={`sidebar ${menuOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="close-btn" onClick={() => setMenuOpen(false)}>
            <FaTimes />
          </div>
          {/* <div className="sidebar-lang">
          <button
            className="lang-switch"
            onClick={() => changeLang(lang === 'vi' ? 'en' : 'vi')}
            title={t('nav.language')}
          >
            <img
              src={lang === 'vi' ? 'https://flagcdn.com/h40/us.png' : 'https://flagcdn.com/h40/vn.png'}
              alt={lang}
              className="lang-flag"
            />
            <span>{lang === 'vi' ? 'EN' : 'VI'}</span>
          </button>
        </div> */}
        </div>

        <nav className="sidebar-links">
          <Link to="/home" onClick={() => setMenuOpen(false)}>
            <AiFillHome /> {t("nav.home")}
          </Link>

          {!user && (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)}>
                <FaSignInAlt /> {t("nav.login")}
              </Link>
              <Link to="/signup" onClick={() => setMenuOpen(false)}>
                <FaUserPlus /> {t("nav.signup")}
              </Link>
            </>
          )}

          {user && (
            <>
              {user.role === "admin" && (
                <>
                  <Link to="/admin/profile" onClick={() => setMenuOpen(false)}>
                    <FaUser /> {t("nav.profile")}
                  </Link>
                  <Link to="/admin/overview" onClick={() => setMenuOpen(false)}>
                    <BiBarChart /> {t("nav.overview")}
                  </Link>
                  <Link
                    to="/admin/programms-management"
                    onClick={() => setMenuOpen(false)}
                  >
                    <HiOutlineBriefcase /> {t("nav.programms")}
                  </Link>
                  <Link
                    to="/admin/candidates-management"
                    onClick={() => setMenuOpen(false)}
                  >
                    <FaUsers /> {t("nav.candidates")}
                  </Link>
                </>
              )}

              {user.role === "recruiter" && (
                <>
                  <Link
                    to="/recruiter/profile"
                    onClick={() => setMenuOpen(false)}
                  >
                    <FaUser /> {t("nav.profile")}
                  </Link>
                  <Link
                    to="/recruiter/programmsview"
                    onClick={() => setMenuOpen(false)}
                  >
                    <HiOutlineBriefcase /> {t("nav.programms")}
                  </Link>
                  <Link
                    to="/recruiter/candidates-submittion"
                    onClick={() => setMenuOpen(false)}
                  >
                    <FaUsers /> {t("nav.candidates")}
                  </Link>
                </>
              )}

              {user.role === "candidate" && (
                <>
                  <Link
                    to="/candidate/profile"
                    onClick={() => setMenuOpen(false)}
                  >
                    <HiOutlineBriefcase /> {t("nav.profile")}
                  </Link>
                  <Link
                    to="/candidate/jobs-view"
                    onClick={() => setMenuOpen(false)}
                  >
                    <FaRegBookmark /> Saved Jobs
                  </Link>
                </>
              )}

              <Link
                to="#"
                onClick={() => {
                  handleLogOut();
                  setMenuOpen(false);
                }}
              >
                <FaSignOutAlt /> {t("nav.logout")}
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
