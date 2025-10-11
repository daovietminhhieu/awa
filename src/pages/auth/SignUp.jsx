import { useState } from "react";
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaPhoneAlt } from "react-icons/fa";
import "./Login.css";
import { registerUser } from "../../api";
import { useI18n } from "../../i18n";

export default function SignUp() {
  const { t } = useI18n();
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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let newErrors = {};
  if (!form.name.trim()) newErrors.name = t('auth.name_required') || "Name is required";
  if (!form.phone.trim()) newErrors.phone = t('auth.phone_required') || "Phone is required";
  if (!form.email.trim()) newErrors.email = t('auth.email_required') || "Email is required";
  if (!form.password.trim()) newErrors.password = t('auth.password_required') || "Password is required";
  if (form.password !== form.confirm) newErrors.confirm = t('auth.passwords_mismatch') || "Passwords do not match";

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        const result = await registerUser({
          name: form.name,
          phone: form.phone,
          email: form.email,
          password: form.password,
          role: "recruiter",
        })
        setMessage("Register successfully");
        setForm({name: "", phone: "", email: "", password: "", confirm: ""})
      } catch(err) {
        setMessage(`${err.message}`);
      }
        setMessage("✅ Tạo tài khoản thành công");
    } else {
      setMessage("Tạo tài khoản thất bại");
    }
  };

  return (
    <div className="container">
      <form className="form" onSubmit={handleSubmit}>
        <div className="title">
          {t('auth.signup.title')}
          <div style={{ fontSize: "15px", marginTop: "10px", fontWeight: "bold" }}>
            {t('auth.signup.subtitle')}
          </div>
        </div>

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
              className={errors.name ? "error" : ""}
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
            />
          </div>
        </div>
        {errors.email && <p className="error-message">{errors.email}</p>}

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
            />
            <span
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          
        </div>
        {errors.password && <p className="error-message">{errors.password}</p>}

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
            />
            <span
              className="toggle-password"
              onClick={() => setShowConfirm(!showConfirm)}
            >
              {showConfirm ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        </div>
        {errors.confirm && <p className="error-message">{errors.confirm}</p>}

        {/* Submit */}
        <div className="form-options">
          <button type="submit" >{t('auth.signup.register')}</button>
        </div>

        {message && (
          <p className={message.includes("✅") ? "success-message" : "error-message"}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
