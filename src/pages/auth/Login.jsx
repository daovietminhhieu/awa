import { useState } from "react";
import {
  FaUser, FaLock, FaEye, FaEyeSlash,
  FaEnvelope, FaFacebook, FaLinkedin
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { API_BASE, loginUser } from "../../api";
import "./Login.css";
import { useI18n } from "../../i18n";

export default function Login() {
  const { login } = useAuth();
  const { t } = useI18n();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({ username: "", password: "" });
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverMessage, setServerMessage] = useState("");

  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [resetLoading, setResetLoading] = useState(false); // loading cho nút Send

  const spinnerStyle = {
    display: "inline-block",
    width: "16px",
    height: "16px",
    border: "2px solid rgba(0, 0, 0, 0.2)",
    borderRadius: "50%",
    borderTopColor: "#333",
    animation: "spin 0.6s linear infinite",
  };

  const keyframesStyle = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerMessage("");
    const username = e.target.username.value.trim();
    const password = e.target.password.value.trim();

    let newErrors = { username: "", password: "" };
    let hasError = false;

    if (!username) {
      newErrors.username = t('auth.enter_email') || "Please fill email";
      hasError = true;
    }
    if (!password) {
      newErrors.password = t('auth.enter_password') || "Please fill password";
      hasError = true;
    }

    setErrors(newErrors);
    if (hasError) {
      setShake(true);
      setTimeout(() => setShake(false), 550);
      return;
    }

    setLoading(true);

  // Login example
  try {
    const result = await loginUser({ email: username, password });
    login(result.data, result.token);
  } catch (err) {
    console.error("❌ Lỗi đăng nhập:", err.message);
  }

    setLoading(false);
  };

  return (
    <div className="container">
      {/* Thêm keyframe animation style inline */}
      <style>{keyframesStyle}</style>

      <div className={`shake-wrapper ${shake ? "is-shaking" : ""}`}>
        <form className="form" onSubmit={handleSubmit}>
          <div className="title">
            {t('auth.login.welcome_back')}
            <div style={{ fontSize: "15px", marginTop: "10px", fontWeight: "bold" }}>
              {t('auth.login.login_to_continue')}
            </div>
          </div>

          {/* Email */}
          <div className="input-group">
            <label className="label" htmlFor="username">{t('auth.login.email_label')}</label>
            <div className="input-wrapper">
              <FaUser className="icon" />
              <input
                type="text"
                id="username"
                name="username"
                placeholder={t('auth.login.enter_email')}
                className={errors.username ? "error" : ""}
              />
            </div>
          </div>
          {errors.username && <p className="error-message">{errors.username}</p>}

          {/* Password */}
          <div className="input-group">
            <label className="label" htmlFor="password">{t('auth.login.password_label')}</label>
            <div className="input-wrapper">
              <FaLock className="icon" />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                placeholder={t('auth.login.enter_password')}
                className={errors.password ? "error" : ""}
              />
              <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>
          {errors.password && <p className="error-message">{errors.password}</p>}

          {/* Remember me */}
          <div className="form-options">
            <button type="submit" disabled={loading}>
              {loading ? <span style={spinnerStyle}></span> : t('auth.login.login_button')}
            </button>
          </div>
          <div className="remember-me">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{marginTop:3}}
              />
              <label htmlFor="remember">{t('auth.login.remember')}</label>
            </div>
          <div style={{ marginTop: "12px", textAlign: "right" }}>
            <span
              style={{ cursor: "pointer", color: "#007bff", textDecoration: "underline" }}
              onClick={() => setShowReset(true)}
            >
              {t('auth.login.forgot_password')}
            </span>
          </div>

          {/* Modal Forgot Password */}
          {showReset && (
            <div className="modal-overlay">
              <div className="modal">
                <h3>{t('auth.login.reset_title')}</h3>
                <p>{t('auth.login.reset_instructions')}</p>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="Your email"
                  style={{ width: "100%", padding: "8px", margin: "10px 0" }}
                />
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                  <button onClick={() => setShowReset(false)} disabled={resetLoading}>{t('auth.login.cancel')}</button>
                  <button
                    onClick={async () => {
                      setResetMessage("");
                      setResetLoading(true);
                      try {
                        const res = await fetch(`${API_BASE}/db/users/resetPassword`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ email: resetEmail }),
                        });

                        const data = await res.json();
                        if (!res.ok) throw new Error(data.message || "Reset failed");
                        setResetMessage("✔️ Mật khẩu mới đẫkalsmxlkãmlká.");
                      } catch (err) {
                        setResetMessage("❌ " + err.message);
                      }
                      setResetLoading(false);
                    }}
                    disabled={resetLoading}
                  >
                    {resetLoading ? <span style={spinnerStyle}></span> : t('auth.send')}
                  </button>
                </div>
                {resetMessage && <p style={{ marginTop: "10px", color: "#555" }}>{resetMessage}</p>}
              </div>
            </div>
          )}

          {/* Server message */}
          {serverMessage && (
            <p className={`server-message ${serverMessage.includes("thành công") ? "success" : "error"}`}>
              {serverMessage}
            </p>
          )}

          {/**
           * 
           * Đăng nhập bằng nền tảng thứ 3 
            <div className="divider"><span>or</span></div>
            <div className="social-login">
              <button type="button" className="social-btn email"><FaEnvelope /> Email</button>
              <button type="button" className="social-btn facebook"><FaFacebook /> Facebook</button>
              <button type="button" className="social-btn linkedin"><FaLinkedin /> LinkedIn</button>
            </div>
           * 
           */}
        </form>
      </div>
    </div>
  );
}
