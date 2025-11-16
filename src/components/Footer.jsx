import { FaPhone, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import { useI18n } from "../i18n";
import { useNavigate } from "react-router-dom";

export default function Footer() {
  const { t } = useI18n();
  const navigate = useNavigate();

  const handleRegisterClick = () => {
    navigate("/signup");
  };

  return (
    <footer style={styles.footer}>
      <div style={styles.overlay}></div>

      <div style={styles.container}>
        {/* Logo / Brand */}
        <div style={styles.column}>
          <h2 style={styles.logo}>AloWork</h2>
          <p>{t("footer.subtitle")}</p>
        </div>

        {/* Contact */}
        <div style={styles.column}>
          <h4>{t("footer.address")}</h4>
          <p><FaMapMarkerAlt /> {t("footer.street")}</p>
          <p><FaPhone /> +84817777000</p>
          <p><FaEnvelope /> alowork.com@gmail.com</p>
        </div>

        {/* Connect */}
        <div style={styles.column}>
          <h4>{t("footer.becomecollab")}</h4>
          <button onClick={handleRegisterClick} style={styles.signupBtn}>
            {t("footer.signup")}
          </button>
        </div>
      </div>

      <div style={styles.bottom}>
        {t("footer.right")}
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    position: "relative",
    color: "#f3f4f6",
    padding: "60px 20px 30px",
    fontFamily: "Inter, sans-serif",
    width: "100%",
    backgroundImage: "url('/footer_style6.svg')",
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "top center",
    borderRadius: "5px",
  },

  overlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(0,0,0,0.25)", // giúp chữ nổi hơn trên mesh
    zIndex: 0,
  },

  container: {
    display: "flex",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "20px",
    maxWidth: "1200px",
    margin: "0 auto",
    position: "relative",
    zIndex: 1,
  },

  column: {
    flex: "1",
    minWidth: "240px",
  },

  logo: {
    fontSize: "26px",
    fontWeight: "bold",
    marginBottom: "10px",
    color: "rgb(249, 115, 22)",
  },

  signupBtn: {
    marginTop: "8px",
    backgroundColor: "#f97316",
    color: "#fff",
    padding: "10px 20px",
    border: "none",
    borderRadius: "6px",
    fontSize: "15px",
    cursor: "pointer",
    transition: "0.25s",
  },

  bottom: {
    textAlign: "center",
    paddingTop: "24px",
    fontSize: "13px",
    color: "#d1d5db",
    borderTop: "1px solid rgba(255,255,255,0.12)",
    marginTop: "30px",
    position: "relative",
    zIndex: 1,
  }
};
