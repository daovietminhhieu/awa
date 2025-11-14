import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaFacebook, FaLinkedin, FaGlobe } from "react-icons/fa";
import { useI18n } from "../i18n";
import { useNavigate } from "react-router-dom";

export default function Footer() {
  const {t} = useI18n();

  const navigate = useNavigate();

    const handleRegisterClick = () => {
    navigate("/signup");
  };

  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        {/* Logo / Brand */}
        <div style={styles.column}>
          <h2 style={styles.logo}>AloWork</h2>
          <p>{t('footer.subtitle')}</p>
        </div>

        {/* Liên hệ */}
        <div style={styles.column}>
          <h4>{t('footer.address')}</h4>
          <p><FaMapMarkerAlt /> {(t('footer.street'))}</p>
          <p><FaPhone /> +84817777000</p>
          <p><FaEnvelope /> alowork.com@gmail.com</p>
        </div>

        {/* Kết nối */}
        <div style={styles.column}>
          <h4>{t("footer.becomecollab")}</h4>
          <button onClick={handleRegisterClick} style={styles.signupBtn}>{t('footer.signup')}</button>
        </div>
      </div>

      <div style={styles.bottom}>

        {t('footer.right')}
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    backgroundColor: "#1f2937", // Tailwind: gray-800
    color: "#f3f4f6",           // Tailwind: gray-100
    padding: "40px 20px 20px",
    fontFamily: "Inter, sans-serif",
    borderRadius:"5px",
    position:"sticky",
    bottom:0,
    width:"100%"
  },
  container: {
    display: "flex",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "20px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  column: {
    flex: "1",
    minWidth: "240px",
  },
  logo: {
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "10px",
    color: "#facc15", // Tailwind: yellow-400
  },
  socials: {
    display: "flex",
    gap: "12px",
    fontSize: "20px",
    margin: "8px 0",
  },
  signupBtn: {
    marginTop: "8px",
    backgroundColor: "#f97316", // Tailwind: orange-500
    color: "#fff",
    padding: "8px 16px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  bottom: {
    textAlign: "center",
    paddingTop: "24px",
    fontSize: "13px",
    color: "#9ca3af", // Tailwind: gray-400
    borderTop: "1px solid #374151", // Tailwind: gray-700
    marginTop: "30px",
  }
};
