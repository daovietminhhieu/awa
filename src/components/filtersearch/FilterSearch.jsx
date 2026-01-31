import { useState, useMemo } from "react";
import { useI18n } from "../../i18n";

const DEFAULT_FILTERS = {
  land: "",
  industry: "",
  type_category: "",
  degrees: "",
  cost: "",
  deadline: "",
  salary: "",
};

export default function FilterSearch({
  programms = [],
  onFilterChange,
  onAddProgram,
}) {
  const { t } = useI18n();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const getUnique = (key) =>
    [...new Set(programms.map((p) => p?.[key]).filter(Boolean))];

  const options = useMemo(
    () => ({
      land: getUnique("land"),
      industry: getUnique("industry"),
      degrees: getUnique("degrees"),
      cost: getUnique("cost"),
      salary: getUnique("salary"),
      deadline: getUnique("deadline"),
    }),
    [programms]
  );

  const FILTER_CONFIG = [
    { name: "land", label: t("filter.country_label") },
    { name: "industry", label: "Ngành nghề" },
    {
      name: "type_category",
      label: t("filter.type_label"),
      options: [
        { value: "job", label: t("admin.programms.edit.new.type_job") },
        { value: "studium", label: t("admin.programms.edit.new.type_studium") },
      ],
    },
    // { name: "degrees", label: "Yêu cầu" },
    { name: "cost", label: "Chi phí" },
    { name: "deadline", label: t("filter.deadline_label") },
    { name: "salary", label: "Mức lương" },
  ];

  const handleChange = ({ target: { name, value } }) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    onFilterChange?.(filters);
    setFilters(DEFAULT_FILTERS);
  };

  return (
    <div className="filter-and-search">
      <div className="filter">
        <div className="filter-first">
          {FILTER_CONFIG.map(({ name, label, options: customOpts }) => (
            <FilterItem key={name} label={label}>
              <select name={name} value={filters[name]} onChange={handleChange}>
                <option value="">{t("filter.all")}</option>

                {(customOpts || options[name] || []).map((opt) =>
                  typeof opt === "string" ? (
                    <option key={opt} value={opt}>{opt}</option>
                  ) : (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  )
                )}
              </select>
            </FilterItem>
          ))}
        </div>

        <div className="filter-second">
          <button className="update-btn" onClick={applyFilters}>
            {t("filter.apply_filters")}
          </button>

          {onAddProgram && (
            <button className="add-btn" onClick={onAddProgram}>
              {t("admin.programms.toolbar.add_new")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterItem({ label, children }) {
  return (
    <div className="filter-item">
      <label>{label}</label>
      {children}
    </div>
  );
}
