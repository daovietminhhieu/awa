import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "react-quill-new/dist/quill.snow.css";

import {
  getProgrammsList,
  getSavedProgramms,
  saveProgrammById,
  unsaveProgrammById,
  addNewProgramm,
  
} from "../../api";

import ProgrammsList from "../../components/admin/management/programms/List";
import ListOfSharedProgramms from "../../components/admin/management/programms/Shared";
import FilterSearch from "../../components/FilterSearch";
import AddProgramForm from "../../components/admin/management/programms/Form";
import { useI18n } from "../../i18n";

import "./ProgrammsManagement.css";
import TranslatableText from "../../TranslateableText";
import PostManagement from "../../components/admin/management/posts/PostManagement";
import Footer from "../../components/Footer";

/* =========================================================
   🟦 MAIN MANAGEMENT PAGE
   ========================================================= */
export default function ProgrammsManagement() {
  const navigate = useNavigate();
  const { t, lang} = useI18n();

  // -------------------- Programms --------------------
  const [programms, setProgramms] = useState([]);
  const [filteredProgramms, setFilteredProgramms] = useState([]);
  const [savedProgramsMap, setSavedProgramsMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activePage, setActivePage] = useState("my");
  const [showAddForm, setShowAddForm] = useState(false);

  // -------------------- Posts --------------------

  // -------------------- Load Data --------------------
  useEffect(() => {
    loadProgramms();
    loadSavedPrograms();
  }, []);

  const loadProgramms = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getProgrammsList();
      setProgramms(res.data || []);
      setFilteredProgramms(res.data || []);
    } catch {
      setError("Failed to load programms");
    } finally {
      setLoading(false);
    }
  };

  const loadSavedPrograms = async () => {
    try {
      const res = await getSavedProgramms();
      const map = {};
      (res.data || []).forEach((p) => (map[p._id] = true));
      setSavedProgramsMap(map);
    } catch {
      setError("Failed to load saved programms");
    }
  };


  // -------------------- Handlers --------------------
  const handleAddNewProgramm = async (newData) => {
    try {
      await addNewProgramm(newData);
      alert("✅ Added successfully");
      setShowAddForm(false);
      loadProgramms();
    } catch {
      alert("❌ Failed to add program");
    }
  };




    

  const toggleSaveProgramm = async (programmId, isSaved) => {
    setSavedProgramsMap((prev) => {
      const copy = { ...prev };
      if (isSaved) delete copy[programmId];
      else copy[programmId] = true;
      return copy;
    });
    try {
      isSaved
        ? await unsaveProgrammById(programmId)
        : await saveProgrammById(programmId);
      await loadSavedPrograms();
    } catch (e) {
      console.error(e);
    }
  };

  const handleFilterChange = (filters) => {
    const result = programms.filter((p) => {
      const matchType = !filters.type_category || p.type_category === filters.type_category;
      const matchLand = !filters.land || p.land === filters.land;
      const matchDeadline =
        !filters.deadline || (p.deadline && new Date(p.deadline) <= new Date(filters.deadline));
      const matchDegree = !filters.degrees || p.degrees === filters.degrees;
      const matchAge = !filters.age || (p.ages && p.ages.toString().includes(filters.age));
      return matchType && matchLand && matchDeadline && matchDegree && matchAge;
    });
    setFilteredProgramms(result);
  };

  const handleSelectProgramm = (programm) =>
    navigate(`/programm/${programm._id}`, { state: { programm } });

 

  const savedProgramsList = programms.filter((p) => savedProgramsMap[p._id]);
  const displayedProgramms = useMemo(() => filteredProgramms, [filteredProgramms]);

  const tabs = [
    { id: "my", label: "My Programms" },
    { id: "saved", label: "Saved Programms" },
    { id: "shared", label: "Shared Programms" },
    { id: "post", label: "Posts" },
  ];

  // -------------------- RENDER --------------------
  return (
    <div className="page-wrapper">
      <div className="container">
      {/* Tabs */}
      <div className="tabs">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`tab-item ${activePage === tab.id ? "active" : ""}`}
            onClick={() => setActivePage(tab.id)}
          >
            <TranslatableText text={tab.label} lang={lang} />
          </div>
        ))}
      </div>

      {/* ========================= MY PROGRAMS ========================= */}
      {activePage === "my" && (
        <div className="programs-section">
          <div className="programm-toolbar">
            <FilterSearch
              programms={programms}
              onFilterChange={handleFilterChange}
              onSelectProgramm={handleSelectProgramm}
            />
            <button className="add-btn" onClick={() => setShowAddForm(true)}>
              <TranslatableText text={t("admin.programms.toolbar.add_new")} lang={lang}/>
            </button>
          </div>

          {loading && <p>Loading...</p>}
          {error && <p className="error-text">{error}</p>}
          {!loading && displayedProgramms.length === 0 && <p>No programms found</p>}
          {!loading && displayedProgramms.length > 0 && (
            <ProgrammsList
              programms={displayedProgramms}
              savedPrograms={savedProgramsMap}
              toggleSaveProgramm={toggleSaveProgramm}
              lang={lang}
            />
          )}
          {showAddForm && (
            <AddProgramForm
              onSubmit={handleAddNewProgramm}
              onClose={() => setShowAddForm(false)}
              defaultValues={{
                title: "",
                company: "",
                logoL: "",
                type: "",
                degrees: "",
                duration: "",
                land: "",
                requirement: { education: "" },
                details: { overview: "" },
              }}
            />
          )}
        </div>
      )}

      {/* ========================= SAVED ========================= */}
      {activePage === "saved" && (
        <ProgrammsList
          programms={savedProgramsList}
          savedPrograms={savedProgramsMap}
          toggleSaveProgramm={toggleSaveProgramm}
          lang={lang}
        />
      )}

      {/* ========================= SHARED ========================= */}
      {activePage === "shared" && <ListOfSharedProgramms lang={lang}/>}

      {/* ========================= POST ========================= */}
      {activePage === "post" && <PostManagement/>}
    </div> <Footer/>
    </div>
  );
}

