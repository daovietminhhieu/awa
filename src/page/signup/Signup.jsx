import { useState } from "react";
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaPhoneAlt } from "react-icons/fa";
import "../login/Login.css";
import { registerUser } from "../../api";
import { useI18n } from "../../i18n";

export default function SignUp() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let newErrors = {};
    const emailRegex = /\S+@\S+\.\S+/;
    const phoneRegex = /^(\+?\d{6,15})$/;
    if (!form.name.trim()) newErrors.name = t('auth.name_required') || "Name is required";
    if (!form.phone.trim()) newErrors.phone = t('auth.phone_required') || "Phone is required";
    else if (!phoneRegex.test(form.phone.trim())) newErrors.phone = t('auth.phone_invalid') || "Invalid phone number";
    if (!form.email.trim()) newErrors.email = t('auth.email_required') || "Email is required";
    else if (!emailRegex.test(form.email.trim())) newErrors.email = t('auth.email_invalid') || "Invalid email";
    if (!form.password.trim()) newErrors.password = t('auth.password_required') || "Password is required";
    else if (form.password.length < 6) newErrors.password = t('auth.password_length') || "At least 6 characters";
    if (form.password !== form.confirm) newErrors.confirm = t('auth.passwords_mismatch') || "Passwords do not match";

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        setLoading(true);
        const result = await registerUser({
          name: form.name,
          phone: form.phone,
          email: form.email,
          password: form.password,
          role: "recruiter",
        })
        setMessage(result?.message || "Register successfully");
        setForm({name: "", phone: "", email: "", password: "", confirm: ""})
      } catch(err) {
        setMessage(`${err.message}`);
      }
      setLoading(false);
      setMessage("✅ Tạo tài khoản thành công");
    } else {
      setMessage("Tạo tài khoản thất bại");
    }
  };

  return (
    <div className="auth-container">
      <style>{keyframesStyle}</style>
      <form className="form form--wide" onSubmit={handleSubmit}>
        <div className="title">
          {t('auth.signup.title')}
          <div style={{ fontSize: "15px", marginTop: "10px", fontWeight: "bold" }}>
            {t('auth.signup.subtitle')}
          </div>
        </div>

        <div className="form-auth-body">
          {/* Name */}
          <div className="input-group">
            <label className="label" htmlFor="name">{t('auth.signup.name_label') || 'Name'}</label>
            <div className="input-wrapper">
              <FaUser className="icon" />
              <input
                type="text"
                id="name"
                name="name"
                placeholder={t('auth.signup.enter_name') || 'Enter name...'}
                value={form.name}
                onChange={handleChange}
                className={errors.name ? "error" : ""}
                onFocus={() => errors.name && setErrors(prev=>({ ...prev, name: "" }))}
              />
            </div>
          </div>
          {errors.name && <p className="error-message">{errors.name}</p>}

          <div className="input-group">
            <label className="label">{t('auth.signup.phone_label') || 'Phone'}</label>
            <div className="input-wrapper">
              <FaPhoneAlt className="icon" />
              <input
                type="text" 
                id="phone"
                name="phone"
                placeholder={t('auth.signup.enter_phone') || 'Enter phone'}
                value={form.phone}
                onChange={handleChange}
                className={errors.phone ? "error" : ""}
                onFocus={() => errors.phone && setErrors(prev=>({ ...prev, phone: "" }))}
              />
            </div>
          </div>
          {errors.phone && <p className="error-message">{errors.phone}</p>}

          {/* Email */}
          <div className="input-group">
            <label className="label" htmlFor="email">{t('auth.signup.email_label')}</label>
            <div className="input-wrapper">
              <FaEnvelope className="icon" />
              <input
                type="email"
                id="email"
                name="email"
                placeholder={t('auth.signup.enter_email')}
                value={form.email}
                onChange={handleChange}
                className={errors.email ? "error" : ""}
                aria-invalid={!!errors.email}
                aria-describedby="signup-email-error"
                onFocus={() => errors.email && setErrors(prev=>({ ...prev, email: "" }))}
              />
            </div>
          </div>
          {errors.email && <p id="signup-email-error" className="error-message">{errors.email}</p>}

          {/* Password */}
          <div className="input-group">
            <label className="label" htmlFor="password">{t('auth.signup.password_label')}</label>
            <div className="input-wrapper">
              <FaLock className="icon" />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                placeholder={t('auth.signup.enter_password')}
                value={form.password}
                onChange={handleChange}
                className={errors.password ? "error" : ""}
                aria-invalid={!!errors.password}
                aria-describedby="signup-password-error"
                onFocus={() => errors.password && setErrors(prev=>({ ...prev, password: "" }))}
              />
              <span
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            
          </div>
          {errors.password && <p id="signup-password-error" className="error-message">{errors.password}</p>}

          {/* Confirm Password */}
          <div className="input-group">
            <label className="label" htmlFor="confirm">{t('auth.signup.confirm_password_label') || 'Confirm password'}</label>
            <div className="input-wrapper">
              <FaLock className="icon" />
              <input
                type={showConfirm ? "text" : "password"}
                id="confirm"
                name="confirm"
                placeholder={t('auth.signup.enter_confirm_password') || 'Confirm password'}
                value={form.confirm}
                onChange={handleChange}
                className={errors.confirm ? "error" : ""}
                aria-invalid={!!errors.confirm}
                aria-describedby="signup-confirm-error"
                onFocus={() => errors.confirm && setErrors(prev=>({ ...prev, confirm: "" }))}
              />
              <span
                className="toggle-password"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>
          {errors.confirm && <p id="signup-confirm-error" className="error-message">{errors.confirm}</p>}

          {/* Submit */}
          <div className="form-options">
            <button type="submit" disabled={loading}>
              {loading ? <span style={spinnerStyle}></span> : t('auth.signup.register')}
            </button>
          </div>

          {message && (
            <p className={`server-message ${message.includes("✅") ? "success" : "error"}`}>
              {message}
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
