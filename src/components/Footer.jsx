export default function Footer() {
    return (
      <footer style={styles.footer}>
        <p>Thiết kế bởi: <strong>em Hiếu</strong></p>
        <p>© {new Date().getFullYear()} Ani Group. All rights reserved.</p>
      </footer>
    );
  }
  
  const styles = {
    footer: {
      backgroundColor: "#222",   // nền tối
      color: "#fff",             // chữ sáng
      textAlign: "center",       // căn giữa
      padding: "20px 10px",
      marginTop: "40px",
      fontSize: "14px"
    }
  };
  