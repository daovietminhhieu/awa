import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { allColors } from "./color";
import "./colorsSelector.css";

export default function ColorSelector({ title, selectedColor, onSelect }) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  const toggleMenu = () => setOpen((prev) => !prev);

  const handleSelect = (name, value) => {
    onSelect({ name, value });
    setOpen(false);
  };

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        !buttonRef.current?.contains(e.target) &&
        !dropdownRef.current?.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <button
        ref={buttonRef}
        className="color-selector-button"
        onClick={toggleMenu}
      >
        🎨 {title}
      </button>

      {open &&
        createPortal(
          <div className="color-selector-dropdown" ref={dropdownRef}>
            {Object.entries(allColors).map(([name, value]) => (
              <div
                key={name}
                className="color-item"
                onClick={() => handleSelect(name, value)}
              >
                <span
                  className="color-dot"
                  style={{ backgroundColor: value }}
                ></span>

                <span className="color-name">{name}</span>

                {value === selectedColor && (
                  <span className="color-check">✔</span>
                )}
              </div>
            ))}
          </div>,
          document.body
        )}
    </>
  );
}
