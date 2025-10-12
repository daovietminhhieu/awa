import { useState } from "react";
import "./FilterSearch.css";
import { useI18n } from "../i18n";

export default function FilterSearch({ programms = [], onSelectProgramm, onFilterChange }) {
  const [suggestions, setSuggestions] = useState([]);
  const [filters, setFilters] = useState({ type_category: "", land: "", deadline: "", age: "", degrees: "" });
  const { t } = useI18n();

  const getUniqueValues = (arr, keyPath) => {
    const keys = keyPath.split(".");
    const values = arr.map((item) => keys.reduce((obj, k) => obj?.[k], item)).filter(Boolean);
    return [...new Set(values)];
  };

  const uniqueLands = getUniqueValues(programms, "land");
  const uniqueDegrees = getUniqueValues(programms, "degrees");

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (!value.trim()) return setSuggestions([]);
    const lowerValue = value.toLowerCase();
    const matched = programms.filter(
      (p) => p.title?.toLowerCase().includes(lowerValue) || p.company?.toLowerCase().includes(lowerValue) || p.land?.toLowerCase().includes(lowerValue)
    );
    setSuggestions(matched.slice(0, 5));
  };

  const handleSelect = (p) => { setSearchTerm(""); setSuggestions([]); onSelectProgramm?.(p); };
  const handleFilterChange = (e) => { const { name, value } = e.target; setFilters((prev) => ({ ...prev, [name]: value })); };
  const handleUpdate = () => { onFilterChange?.(filters); setFilters({ type_category: "", land: "", deadline: "", age: "", degrees: "" }); };

  return (
    <div className="filter-and-search">
      <div className="filter">
        <div className="filter-first">
          <div className="filter-item">
            <label>{t('filter.type_label')}</label>
            <select name="type_category" value={filters.type_category} onChange={handleFilterChange}>
              <option value="">{t('filter.all')}</option>
              <option value="job">{t('admin.programms.edit.new.type_job')}</option>
              <option value="studium">{t('admin.programms.edit.new.type_studium')}</option>
            </select>
          </div>
          <div className="filter-item">
            <label>{t('filter.country_label')}</label>
            <select name="land" value={filters.land} onChange={handleFilterChange}>
              <option value="">{t('filter.all')}</option>
              {uniqueLands.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div className="filter-item">
            <label>{t('filter.deadline_label')}</label>
            <input type="date" name="deadline" value={filters.deadline} onChange={handleFilterChange} />
          </div>
          <div className="filter-item">
            <label>{t('filter.degree_label')}</label>
            <select name="degrees" value={filters.degrees} onChange={handleFilterChange}>
              <option value="">{t('filter.all')}</option>
              {uniqueDegrees.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>
        <div className="filter-second">
          <button className="update-btn" onClick={handleUpdate}>{t('filter.apply_filters')}</button>
        </div>
      </div>

      {/**<div className="search-wrapper">
        <input type="search" placeholder={t('filter.search_placeholder')} className="search-field" value={searchTerm} onChange={handleSearchChange} />
        {suggestions.length > 0 && (
          <div className="suggestions-list">
            {suggestions.map((p) => (
              <div key={p._id} onClick={() => handleSelect(p)} className="suggestion-item">
                <img src={p.logoL || p.logo} alt={p.title} style={{ width: 40, height: 40, borderRadius: 8 }} />
                <span>{p.title}</span>
              </div>
            ))}
          </div>
        )}
      </div> */}
    </div>
  );
}
