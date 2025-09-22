import { useState } from "react";
import './FilterSearch.css';

export default function FilterSearch({ courses, onSelectCourse, onFilterChange }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [filters, setFilters] = useState({
    tag: "",
    fee: "",
    country: "",
    deadline: ""
  });

  // Lấy unique values
  const uniqueTags = [...new Set(courses.flatMap(c => c.tags))];
  const uniqueCountries = [...new Set(courses.map(c => c.country))];

  // --- Search ---
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim() === "") {
      setSuggestions([]);
      return;
    }

    const lowerValue = value.toLowerCase();
    const matched = courses.filter(
      (c) =>
        c.tags.some((tag) => tag.toLowerCase().includes(lowerValue)) ||
        c.title.toLowerCase().includes(lowerValue)
    );

    setSuggestions(matched.slice(0, 5));
  };

  const handleSelect = (course) => {
    setSearchTerm("");
    setSuggestions([]);
    onSelectCourse(course);
  };

  // --- Filter ---
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleUpdate = () => {
    onFilterChange(filters);
  };

  return (
    <div className="filter-and-search">
      <div className="filter">
        <div className="filter-first">

          {/* Chuyên ngành */}
          <div className="filter-item">
            <label>Chuyên ngành:</label>
            <select
              name="tag"
              className="selector"
              value={filters.tag}
              onChange={handleFilterChange}
            >
              <option value="">Tất cả</option>
              {uniqueTags.map((tag) => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>

          {/* Học phí */}
          <div className="filter-item">
            <label>Học phí:</label>
            <select
              name="fee"
              className="selector"
              value={filters.fee}
              onChange={handleFilterChange}
            >
              <option value="">Tất cả</option>
              <option value="0-1000">0 - 1000 USD</option>
              <option value="1000-2000">1000 - 2000 USD</option>
              <option value="2000+">2000+ USD</option>
            </select>
          </div>

          {/* Quốc gia */}
          <div className="filter-item">
            <label>Quốc gia:</label>
            <select
              name="country"
              className="selector"
              value={filters.country}
              onChange={handleFilterChange}
            >
              <option value="">Tất cả</option>
              {uniqueCountries.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Deadline */}
          <div className="filter-item">
            <label>Deadline:</label>
            <input
              type="date"
              name="deadline"
              className="selector"
              value={filters.deadline}
              onChange={handleFilterChange}
            />
          </div>
        </div>

        <div>
          <button className="update-btn" onClick={handleUpdate}>
            Cập nhật
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="search-wrapper">
        <input
          type="search"
          placeholder="Tìm kiếm theo tags hoặc tên khóa học..."
          className="search-field"
          value={searchTerm}
          onChange={handleSearchChange}
        />

        {suggestions.length > 0 && (
          <div className="suggestions-list">
            {suggestions.map((c) => (
              <div
                key={c.id}
                onClick={() => handleSelect(c)}
                className="suggestion-item"
              >
                <img src={c.logo} alt={c.title} style={{borderRadius:10, marginTop: 10}}/>
                <span style={{}}> {c.title} </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
