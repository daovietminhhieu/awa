import { useState, useEffect } from "react";

export default function DigitalClock() {
    const [time, setTime] = useState(new Date());
  
    useEffect(() => {
      const timer = setInterval(() => setTime(new Date()), 1000);
      return () => clearInterval(timer);
    }, []);
  
    const formatTime = (date) => {
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const seconds = String(date.getSeconds()).padStart(2, "0");
      return `${hours}:${minutes}:${seconds}`;
    };
  
    return (
      <div style={{
        marginTop: "250px",       // 👈 tự đẩy xuống cuối asidebar
        textAlign: "center",
        padding: "10px",
        background: "#212121",
        color: "#00e676",
        borderRadius: "8px",
        fontFamily: "monospace",
        fontSize: "20px",
        letterSpacing: "2px"
      }}>
        {formatTime(time)}
      </div>
    );
  }
  