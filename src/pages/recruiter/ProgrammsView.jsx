import React, { useState, useEffect, useMemo } from "react";
import {
  getProgrammsList,
  getSavedProgramms,
  saveProgrammById,
  unsaveProgrammById,
  
} from "../../api";

import PostEditor from "../../components/PostEditor";
import ProgrammsList from "../../components/recruiter/management/programms/List";
import SavedProgramms from "../../components/recruiter/management/programms/Saved";
import ListOfSharedProgramms from "../../components/recruiter/management/programms/Shared";
import FilterSearch from "../../components/FilterSearch";

import "./ProgrammsView.css";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../../i18n";

export default function ProgrammsManagement() {
  const navigate = useNavigate();

  const [programms, setProgramms] = useState([]);
  const [filteredProgramms, setFilteredProgramms] = useState([]);
  const [savedProgramsMap, setSavedProgramsMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activePage, setActivePage] = useState("myProgramms");

  // Load programms only once on mount
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
    } catch (err) {
      setError(err.message || "Failed to load programms");
    } finally {
      setLoading(false);
    }
  };

  const loadSavedPrograms = async () => {
    try {
      const res = await getSavedProgramms();
      const savedMap = {};
      (res.data || []).forEach((p) => {
        savedMap[p._id] = true;
      });
      console.log(savedMap);
      setSavedProgramsMap(savedMap);
    } catch (err) {
      console.error("Failed to load saved programs", err);
      setError("Failed to load saved programms");
    }
  };

  const toggleSaveProgramm = async (programmId, isCurrentlySaved) => {
    // Cập nhật local state ngay lập tức
    setSavedProgramsMap(prev => {
      const updated = { ...prev };
      if (isCurrentlySaved) delete updated[programmId];
      else updated[programmId] = true;
      return updated;
    });
  
    // Sau đó gọi API để lưu vào server
    try {
      if (isCurrentlySaved) {
        await unsaveProgrammById(programmId);
      } else {
        await saveProgrammById(programmId);
      }
      // Gọi lại API saved list để đồng bộ
      await new Promise(r => setTimeout(r, 300));
      await loadSavedPrograms();
    } catch (error) {
      console.error("Failed to toggle save programm", error);
      setError(`Failed to update programm status. Please try again.`);
    }
  };
  
  const handleSelectProgramm = (programm) => {
    navigate(`/programm/${programm._id}`, { state: { programm } });
  };


  const handleFilterChange = (filters) => {
    let result = [...programms];
  
    result = result.filter((p) => {
      const matchType =
        !filters.type_category || p.type_category === filters.type_category;
  
      const matchLand = !filters.land || p.land === filters.land;
  
      const matchDeadline =
        !filters.deadline || new Date(p.deadline) <= new Date(filters.deadline);
  
      const matchAge =
        !filters.ages || (p.ages && p.ages.toString().includes(filters.ages));
  
      const matchDegree =
        !filters.degrees || p.degrees === filters.degrees;
  
      // ✅ chỉ khi tất cả điều kiện đều đúng
      return matchType && matchLand && matchDeadline && matchAge && matchDegree;
    });
  
    setFilteredProgramms(result);
  };

  const savedProgramsList = programms.filter((p) => savedProgramsMap[p._id]);
  const displayedProgramms = useMemo(() => filteredProgramms, [filteredProgramms]);
  const { t } = useI18n();

  return (
    <div className="programms-container">
      <div className="programms-tabs">
        <div
          className={`tab-item ${activePage === "myProgramms" ? "active" : ""}`}
          onClick={() => setActivePage("myProgramms")}
        >
          {t('recruiter.programms.tabs.all')}
        </div>

        <div
          className={`tab-item ${activePage === "savedProgramms" ? "active" : ""}`}
          onClick={() => setActivePage("savedProgramms")}
        >
          {t('recruiter.programms.tabs.saved')}
        </div>

        <div
          className={`tab-item ${activePage === "sharedProgramms" ? "active" : ""}`}
          onClick={() => setActivePage("sharedProgramms")}
        >
          {t('recruiter.programms.tabs.shared')}
        </div>
      </div>

      {loading && <p className="loading">{t('recruiter.programms.loading_programms')}</p>}
      {error && <p className="error">{t('recruiter.programms.error_prefix')} {error}</p>}

      {activePage === "myProgramms" && !loading && !error && (
        <>
          <div className="programm-toolbar">
            <FilterSearch
              programms={programms}
              onFilterChange={handleFilterChange}
              onSelectProgramm={handleSelectProgramm}
            />
          </div>
          <ProgrammsList
            programms={displayedProgramms}
            savedPrograms={savedProgramsMap}
            toggleSaveProgramm={toggleSaveProgramm}
          />
          {/* 📝 Post Editor xuất hiện bên dưới danh sách chương trình */}
          

        </>
      )}

      {activePage === "savedProgramms" && (
        <SavedProgramms savedProgramsList={savedProgramsList} />
      )}

      {activePage === "sharedProgramms" && <ListOfSharedProgramms />}
    </div>
  );
}
