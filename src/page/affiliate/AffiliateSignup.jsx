import React, { useState } from "react";
import { useI18n } from "../../i18n";
import { signupL } from "../../api";
import "./AffiliateSignup.css";
import { useNavigate } from "react-router-dom";

export default function AffiliateSignup() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirm: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.name || !form.email || !form.password || !form.password_confirm) {
      setError(t("affiliate.signup.required_fields") || "Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (form.password !== form.password_confirm) {
      setError(t("affiliate.signup.password_mismatch") || "Mật khẩu không khớp");
      return;
    }

    if (form.password.length < 6) {
      setError(t("affiliate.signup.password_min") || "Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    setLoading(true);
    try {
      const result = await signupL({
        name: form.name,
        email: form.email,
        password: form.password,
        role: "recruiter", // Affiliates are recruiters in this system
      });

      if (result.success) {
        setSuccess(
          t("affiliate.signup.success_message") ||
            "Đăng ký thành công! Admin sẽ duyệt tài khoản của bạn trong 24-48 giờ."
        );
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setError(result.message || t("affiliate.signup.error") || "Đăng ký thất bại");
      }
    } catch (err) {
      setError(err.message || t("affiliate.signup.error") || "Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="affiliate-signup-container">
      <div className="affiliate-signup-box">
        <h1>{t("affiliate.signup.title") || "Trở Thành Cộng Tác Viên"}</h1>
        <p className="signup-subtitle">
          {t("affiliate.signup.subtitle") ||
            "Chia sẻ chương trình và nhận hoa hồng lên đến 30% cho mỗi ứng viên thành công"}
        </p>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit} className="affiliate-form">
          <div className="form-group">
            <label>{t("affiliate.signup.name") || "Họ và tên"}</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder={t("affiliate.signup.name_placeholder") || "Nhập họ và tên"}
              required
            />
          </div>

          <div className="form-group">
            <label>{t("affiliate.signup.email") || "Email"}</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder={t("affiliate.signup.email_placeholder") || "Nhập email"}
              required
            />
          </div>

          <div className="form-group">
            <label>{t("affiliate.signup.password") || "Mật khẩu"}</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder={t("affiliate.signup.password_placeholder") || "Ít nhất 6 ký tự"}
              required
            />
          </div>

          <div className="form-group">
            <label>{t("affiliate.signup.password_confirm") || "Xác nhận mật khẩu"}</label>
            <input
              type="password"
              name="password_confirm"
              value={form.password_confirm}
              onChange={handleChange}
              placeholder={t("affiliate.signup.password_confirm_placeholder") || "Nhập lại mật khẩu"}
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn-submit">
            {loading
              ? t("affiliate.signup.registering") || "Đang đăng ký..."
              : t("affiliate.signup.register") || "Đăng Ký"}
          </button>
        </form>

        <div className="signup-footer">
          <p>
            {t("affiliate.signup.have_account") || "Đã có tài khoản?"}
            <a href="/login"> {t("affiliate.signup.login") || "Đăng nhập"}</a>
          </p>
        </div>

        <div className="benefits-section">
          <h3>{t("affiliate.signup.benefits") || "Lợi Ích"}</h3>
          <ul>
            <li>✅ {t("affiliate.signup.benefit_1") || "Hoa hồng cao lên đến 30%"}</li>
            <li>✅ {t("affiliate.signup.benefit_2") || "Quản lý link riêng từ dashboard"}</li>
            <li>✅ {t("affiliate.signup.benefit_3") || "Theo dõi realtime (click, lead, conversion)"}</li>
            <li>✅ {t("affiliate.signup.benefit_4") || "Rút tiền trực tiếp vào tài khoản ngân hàng"}</li>
            <li>✅ {t("affiliate.signup.benefit_5") || "Hỗ trợ 24/7 từ đội ngũ Alowork"}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
