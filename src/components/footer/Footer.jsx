import { FaPhone, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import { useI18n } from "../../i18n";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import './Footer.css';
import { use } from "react";

export default function Footer() {
  const { t } = useI18n();
  const navigate = useNavigate();

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 480);

  const handleRegisterClick = () => {
    navigate("/signup");
  };

    useEffect(() => {
      const handleResize = () => {
        setIsMobile(window.innerWidth <= 480);
      };
      window.addEventListener("resize", handleResize);
      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }, []);


  return (
     <>
    <footer style={styles.footer}>
      {/* <div style={styles.waveTop} /> */}
      {/* <div style={styles.overlay}></div> */}

      <div style={styles.container} className="footer-container">
        {/* Logo / Brand */}
        <div style={{display:"flex", flexDirection:isMobile?"column":"row", gap:"20px"}}>
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
        </div>

        {/* Connect */}
          <div style={styles.column}>
          <h4>{t("footer.becomecollab")}</h4>
          <button onClick={handleRegisterClick} style={styles.signupBtn} className="btn btn-primary">
            {t("footer.signup")}
          </button>
        </div>
      </div>

      <div style={styles.bottom}>
        {t("footer.right")}
      </div>
    </footer>
     </>
  );
}


const homeOrange = "--home-orange: #ef4444;";

const styles = {
  footer: {
    position: "relative",
    color: "white",
    padding: "48px 20px 28px",
    fontFamily: "Inter, sans-serif",
    width: "100%",
    background: "var(--text-primary)",
    borderRadius: "5px",
  },

  container: {
    display: "flex",
    flexDirection:"column",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "20px",
    maxWidth: "var(--site-container-width)",
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
    fontWeight: "700",
    marginBottom: "10px",
    color: "white",
    textShadow: "0 6px 18px rgba(11,102,255,0.06)",
  },
  
  signupBtn: {
    marginTop: "8px",
    padding: "10px 20px",
    background: "linear-gradient(90deg, #ef4444 0%, #f97316 50%, #ef4444 100%)",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    cursor: "pointer",
    transition: "0.18s",
  },

  bottom: {
    textAlign: "center",
    paddingTop: "24px",
    fontSize: "13px",
    color: "white",
    borderTop: "1px solid var(--neutral-300)",
    marginTop: "30px",
    position: "relative",
    zIndex: 1,
  }
};
