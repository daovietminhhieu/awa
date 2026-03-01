import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  getReferralsListForUserById,
  getProgrammById,
  updateReferralStatus,
  requestASharedLink,
  getMyProfile,
} from "../../api";
import { useI18n } from "../../i18n";
import "./AffiliateDashboard.css";
import { countUpAnimation, slideUp, staggerChildren } from "../../utils/animations.js";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function AffiliateDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useI18n();

  const [referrals, setReferrals] = useState([]);
  const [programMap, setProgramMap] = useState({});
  const [stats, setStats] = useState({
    totalClicks: 0,
    totalLeads: 0,
    totalApproved: 0,
    totalEarnings: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNewLink, setShowNewLink] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState("");
  const [programs, setPrograms] = useState([]);
  const [copiedLink, setCopiedLink] = useState(null);

  // Animation refs
  const statsRef = useRef(null);
  const tableRef = useRef(null);
  const chartsRef = useRef(null);
  const statsAnimatedRef = useRef(false);
  const chartsAnimatedRef = useRef(false);

  // Chart data states
  const [chartData, setChartData] = useState({
    performanceByProgram: [],
    statusDistribution: [],
    clicksVsLeads: [],
    funnelData: [],
  });

  useEffect(() => {
    if (!user || (user.role !== "recruiter" && user.role !== "admin")) {
      navigate("/login");
      return;
    }
    loadData();
  }, [user, navigate]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load referrals for this user
      const refRes = await getReferralsListForUserById(user._id);
      const refData = refRes.data || [];
      setReferrals(refData);

      // Load programs for each referral
      const progIds = [...new Set(refData.map((r) => r.progId))];
      const progMap = {};
      for (const id of progIds) {
        try {
          const pRes = await getProgrammById(id);
          progMap[id] = pRes.data;
        } catch (e) {
          console.error("Failed to load program", id, e);
        }
      }
      setProgramMap(progMap);

      // Calculate stats
      const totalClicks = refData.reduce((s, r) => s + (r.clickCount || 0), 0);
      const totalLeads = refData.filter((r) => r.candidateId).length;
      const totalApproved = refData.filter((r) => r.status === "approved").length;
      const totalEarnings = refData.reduce((s, r) => s + (r.bonus || 0), 0);
      setStats({ totalClicks, totalLeads, totalApproved, totalEarnings });

      // Generate chart data
      // 1. Performance by Program
      const perfByProg = progIds.map((progId) => {
        const progReferrals = refData.filter((r) => r.progId === progId);
        return {
          name: progMap[progId]?.name?.substring(0, 15) || "Program",
          clicks: progReferrals.reduce((s, r) => s + (r.clickCount || 0), 0),
          leads: progReferrals.filter((r) => r.candidateId).length,
          approved: progReferrals.filter((r) => r.status === "approved").length,
          earnings: progReferrals.reduce((s, r) => s + (r.bonus || 0), 0),
        };
      });

      // 2. Status Distribution
      const statusDist = [
        { name: "Pending", value: refData.filter((r) => r.status === "pending").length },
        { name: "Approved", value: refData.filter((r) => r.status === "approved").length },
        { name: "Rejected", value: refData.filter((r) => r.status === "rejected").length },
        { name: "No Lead", value: refData.filter((r) => !r.candidateId).length },
      ].filter((d) => d.value > 0);

      // 3. Clicks vs Leads comparison
      const clicksVsLeadsData = [
        {
          name: "Total",
          clicks: totalClicks,
          leads: totalLeads,
          approved: totalApproved,
        },
      ];

      // 4. Funnel data (Clicks → Leads → Approved)
      const funnelData = [
        { name: "Clicks", value: totalClicks },
        { name: "Leads", value: totalLeads },
        { name: "Approved", value: totalApproved },
      ];

      setChartData({
        performanceByProgram: perfByProg,
        statusDistribution: statusDist,
        clicksVsLeads: clicksVsLeadsData,
        funnelData: funnelData,
      });
    } catch (err) {
      console.error("Failed to load data:", err);
      setError(err.message || "Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  // Animate charts when loaded
  useEffect(() => {
    if (!loading && chartsRef.current && !chartsAnimatedRef.current) {
      chartsAnimatedRef.current = true;
      const chartCards = chartsRef.current.querySelectorAll(".chart-card");
      
      chartCards.forEach((card, idx) => {
        slideUp(card, { delay: idx * 0.1, duration: 0.6 });
      });
    }
  }, [loading, chartData]);

  // Animate stats when loaded
  useEffect(() => {
    if (!loading && statsRef.current && !statsAnimatedRef.current) {
      statsAnimatedRef.current = true;
      const statCards = statsRef.current.querySelectorAll(".stat-card");
      
      statCards.forEach((card, idx) => {
        slideUp(card, { delay: idx * 0.1, duration: 0.6 });
        
        // Animate numbers
        const numberEl = card.querySelector(".stat-number");
        if (numberEl) {
          const key = card.getAttribute("data-key");
          const value = stats[key] || 0;
          countUpAnimation(numberEl, value, {
            duration: 1.5,
            delay: idx * 0.1 + 0.2,
            prefix: key === "totalEarnings" ? "$" : "",
            suffix: key === "totalEarnings" ? " USD" : "",
          });
        }
      });
    }
  }, [loading, stats]);

  // Animate table rows
  useEffect(() => {
    if (!loading && tableRef.current) {
      staggerChildren(tableRef.current, {
        selector: "tbody tr",
        each: 0.05,
        duration: 0.4,
        delay: 0.2,
      });
    }
  }, [loading, referrals]);

  const handleCopyLink = (link) => {
    const fullLink = `${window.location.origin}${link}`;
    navigator.clipboard.writeText(fullLink);
    setCopiedLink(link);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const handleCreateNewLink = async (e) => {
    e.preventDefault();
    if (!selectedProgram) {
      alert(t("affiliate.dashboard.select_program") || "Vui lòng chọn chương trình");
      return;
    }

    try {
      const res = await requestASharedLink(selectedProgram, user._id);
      if (res.success) {
        alert(t("affiliate.dashboard.link_created") || "Link được tạo thành công!");
        setShowNewLink(false);
        setSelectedProgram("");
        loadData();
      } else {
        alert(res.message || "Tạo link thất bại");
      }
    } catch (err) {
      alert(err.message || "Lỗi khi tạo link");
    }
  };

  if (loading) return <div className="affiliate-loading">{t("affiliate.dashboard.loading") || "Đang tải..."}</div>;

  return (
    <div className="affiliate-dashboard">
      <div className="dashboard-header">
        <h1>{t("affiliate.dashboard.title") || "Bảng Điều Khiển Cộng Tác Viên"}</h1>
        <p>{t("affiliate.dashboard.welcome", { name: user?.name || "Người dùng" }) || `Xin chào, ${user?.name}`}</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Stats Cards */}
      <div className="stats-grid" ref={statsRef}>
        <div className="stat-card" data-key="totalClicks">
          <div className="stat-label">{t("affiliate.dashboard.total_clicks") || "Tổng Lượt Click"}</div>
          <div className="stat-number">{stats.totalClicks}</div>
        </div>
        <div className="stat-card" data-key="totalLeads">
          <div className="stat-label">{t("affiliate.dashboard.total_leads") || "Tổng Lead"}</div>
          <div className="stat-number">{stats.totalLeads}</div>
        </div>
        <div className="stat-card" data-key="totalApproved">
          <div className="stat-label">{t("affiliate.dashboard.total_approved") || "Phê Duyệt"}</div>
          <div className="stat-number">{stats.totalApproved}</div>
        </div>
        <div className="stat-card" data-key="totalEarnings">
          <div className="stat-label">{t("affiliate.dashboard.total_earnings") || "Tổng Thu Nhập"}</div>
          <div className="stat-number">{stats.totalEarnings.toLocaleString()} đ</div>
        </div>
      </div>

      {/* Charts Section */}
      {!loading && (
        <div className="charts-section" ref={chartsRef}>
          <h2 className="section-title">📊 {t("affiliate.dashboard.analytics") || "Phân Tích Dữ Liệu"}</h2>
          
          <div className="charts-grid">
            {/* Chart 1: Clicks vs Leads vs Approved */}
            {chartData.clicksVsLeads.length > 0 && (
              <div className="chart-card">
                <h3>{t("affiliate.dashboard.conversion_funnel") || "Chuyển Đổi"}</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.clicksVsLeads}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="clicks" fill="#667eea" name="Clicks" />
                    <Bar dataKey="leads" fill="#764ba2" name="Leads" />
                    <Bar dataKey="approved" fill="#00d084" name="Approved" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Chart 2: Performance by Program */}
            {chartData.performanceByProgram.length > 0 && (
              <div className="chart-card">
                <h3>{t("affiliate.dashboard.program_performance") || "Hiệu Suất Chương Trình"}</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.performanceByProgram}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="clicks" fill="#667eea" name="Clicks" />
                    <Bar dataKey="leads" fill="#764ba2" name="Leads" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Chart 3: Status Distribution */}
            {chartData.statusDistribution.length > 0 && (
              <div className="chart-card">
                <h3>{t("affiliate.dashboard.status_distribution") || "Phân Bố Trạng Thái"}</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData.statusDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#667eea" />
                      <Cell fill="#764ba2" />
                      <Cell fill="#f093fb" />
                      <Cell fill="#4facfe" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Chart 4: Funnel (Clicks to Approved) */}
            {chartData.funnelData.length > 0 && (
              <div className="chart-card">
                <h3>{t("affiliate.dashboard.conversion_rate") || "Tỷ Lệ Chuyển Đổi"}</h3>
                <div className="funnel-chart">
                  {chartData.funnelData.map((item, idx) => {
                    const width = 100 - (idx * 30);
                    const conversion = idx === 0 ? "100%" : `${((item.value / chartData.funnelData[0].value) * 100).toFixed(1)}%`;
                    return (
                      <div key={idx} className="funnel-item">
                        <div
                          className="funnel-bar"
                          style={{
                            width: `${width}%`,
                            backgroundColor:
                              idx === 0
                                ? "#667eea"
                                : idx === 1
                                ? "#764ba2"
                                : "#00d084",
                          }}
                        >
                          <span className="funnel-label">
                            {item.name}: {item.value} ({conversion})
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* New Link Button */}
      <div className="dashboard-actions">
        <button
          className="btn btn-primary"
          onClick={() => setShowNewLink(!showNewLink)}
        >
          {t("affiliate.dashboard.create_link") || "+ Tạo Link Mới"}
        </button>
      </div>

      {/* New Link Form */}
      {showNewLink && (
        <div className="new-link-form">
          <h3>{t("affiliate.dashboard.create_referral_link") || "Tạo Link Giới Thiệu"}</h3>
          <p>{t("affiliate.dashboard.create_form_desc") || "Chọn chương trình để tạo link giới thiệu"}</p>
          <form onSubmit={handleCreateNewLink}>
            <label>{t("affiliate.dashboard.select_program") || "Chọn Chương Trình"}</label>
            <input
              type="text"
              placeholder={t("affiliate.dashboard.program_search") || "Tìm kiếm chương trình..."}
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-success">
              {t("affiliate.dashboard.create") || "Tạo"}
            </button>
            <button
              type="button"
              className="btn btn-cancel"
              onClick={() => setShowNewLink(false)}
            >
              {t("affiliate.dashboard.cancel") || "Hủy"}
            </button>
          </form>
        </div>
      )}

      {/* Referral Links Table */}
      <div className="referral-links-section">
        <h2>{t("affiliate.dashboard.my_links") || "Link Giới Thiệu Của Tôi"}</h2>

        {referrals.length === 0 ? (
          <p className="no-data">
            {t("affiliate.dashboard.no_links") || "Bạn chưa có link nào. Tạo link đầu tiên ngay!"}
          </p>
        ) : (
          <div className="links-table-container">
            <table className="links-table" ref={tableRef}>
              <thead>
                <tr>
                  <th>{t("affiliate.dashboard.program") || "Chương Trình"}</th>
                  <th>{t("affiliate.dashboard.clicks") || "Click"}</th>
                  <th>{t("affiliate.dashboard.leads") || "Lead"}</th>
                  <th>{t("affiliate.dashboard.status") || "Trạng Thái"}</th>
                  <th>{t("affiliate.dashboard.bonus") || "Hoa Hồng"}</th>
                  <th>{t("affiliate.dashboard.link") || "Link"}</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((ref) => (
                  <tr key={ref.id}>
                    <td>{programMap[ref.progId]?.name || "—"}</td>
                    <td className="">{ref.clickCount || 0}</td>
                    <td className="">{ref.candidateId ? 1 : 0}</td>
                    <td>
                      <span className={`status-badge status-${ref.status}`}>
                        {ref.status}
                      </span>
                    </td>
                    <td className="text-right">💰 {(ref.bonus || 0).toLocaleString()} đ</td>
                    <td>
                      <button
                        className="btn btn-sm btn-copy"
                        onClick={() => handleCopyLink(ref.link)}
                      >
                        {copiedLink === ref.link
                          ? "✓ Copied"
                          : t("affiliate.dashboard.copy") || "Copy"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Resources Section */}
      <div className="resources-section">
        <h2>{t("affiliate.dashboard.resources") || "Tài Nguyên Quảng Bá"}</h2>
        <p>{t("affiliate.dashboard.resources_desc") || "Sử dụng các tài nguyên dưới đây để quảng bá chương trình:"}</p>
        <div className="resources-grid">
          <div className="resource-card">
            <h4>📸 Banner Hình Ảnh</h4>
            <p>Tải các banner quảng cáo chuyên nghiệp</p>
            <a href="https://zalo.me/alowork" target="_blank" rel="noreferrer">
              {t("affiliate.dashboard.visit") || "Truy Cập"}
            </a>
          </div>
          <div className="resource-card">
            <h4>📝 Bài Viết Mẫu</h4>
            <p>Sao chép và chia sẻ các bài viết sẵn</p>
            <a href="https://zalo.me/alowork" target="_blank" rel="noreferrer">
              {t("affiliate.dashboard.visit") || "Truy Cập"}
            </a>
          </div>
          <div className="resource-card">
            <h4>🎥 Video Quảng Bá</h4>
            <p>Video giới thiệu chương trình</p>
            <a href="https://zalo.me/alowork" target="_blank" rel="noreferrer">
              {t("affiliate.dashboard.visit") || "Truy Cập"}
            </a>
          </div>
          <div className="resource-card">
            <h4>💬 Nhóm Hỗ Trợ Zalo</h4>
            <p>Kết nối với cộng đồng CTV</p>
            <a href="https://zalo.me/alowork" target="_blank" rel="noreferrer">
              {t("affiliate.dashboard.join") || "Tham Gia"}
            </a>
          </div>
        </div>
      </div>

      {/* Payment Info */}
      <div className="payment-section">
        <h2>{t("affiliate.dashboard.payment") || "Thông Tin Thanh Toán"}</h2>
        <p>{t("affiliate.dashboard.payment_desc") || "Cập nhật thông tin tài khoản ngân hàng để nhận hoa hồng"}</p>
        <button className="btn btn-primary" onClick={() => navigate(`/${user.role}/profile`)}>
          {t("affiliate.dashboard.update_payment") || "Cập Nhật Thông Tin Ngân Hàng"}
        </button>
      </div>
    </div>
  );
}
