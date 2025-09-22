import { useState } from "react";
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import "./Login.css";

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let newErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    if (!form.password.trim()) newErrors.password = "Password is required";
    if (form.password !== form.confirm) newErrors.confirm = "Passwords do not match";

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setMessage("✅ Registered successfully (mock)!");
    } else {
      setMessage("");
    }
  };

  return (
    <div className="container">
      <form className="form" onSubmit={handleSubmit}>
        <div className="title">
          Create Account
          <div style={{ fontSize: "15px", marginTop: "10px", fontWeight: "bold" }}>
            Sign up to get started
          </div>
        </div>

        {/* Name */}
        <div className="input-group">
          <label className="label" htmlFor="name">Name</label>
          <div className="input-wrapper">
            <FaUser className="icon" />
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Enter your name"
              value={form.name}
              onChange={handleChange}
              className={errors.name ? "error" : ""}
            />
          </div>
        </div>
        {errors.name && <p className="error-message">{errors.name}</p>}

        {/* Email */}
        <div className="input-group">
          <label className="label" htmlFor="email">Email</label>
          <div className="input-wrapper">
            <FaEnvelope className="icon" />
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter email"
              value={form.email}
              onChange={handleChange}
              className={errors.email ? "error" : ""}
            />
          </div>
        </div>
        {errors.email && <p className="error-message">{errors.email}</p>}

        {/* Password */}
        <div className="input-group">
          <label className="label" htmlFor="password">Password</label>
          <div className="input-wrapper">
            <FaLock className="icon" />
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              placeholder="Enter password"
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
          <label className="label" htmlFor="confirm">Confirm Password</label>
          <div className="input-wrapper">
            <FaLock className="icon" />
            <input
              type={showConfirm ? "text" : "password"}
              id="confirm"
              name="confirm"
              placeholder="Re-enter password"
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
          <button type="submit" >Sign Up</button>
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
