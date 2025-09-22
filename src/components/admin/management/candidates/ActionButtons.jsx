import React from "react";

export default function ActionButtons({ sub, onSave, onRemove, isLoading }) {
  return (
    <div className="action-buttons">
      <button onClick={() => onSave(sub)} disabled={isLoading}>
        {isLoading ? <span className="loading-spinner" /> : "Update"}
      </button>
      <button onClick={() => onRemove(sub)} className="remove-btn" disabled={isLoading}>
        Remove
      </button>
    </div>
  );
}
