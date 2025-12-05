import React, { useEffect, useState } from "react";
import { supabase } from "./client";

export default function FilesView() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load danh sách file từ bucket "files"
  useEffect(() => {
    const loadFiles = async () => {
      const { data, error } = await supabase.storage.from("alowork-partner").list("", {
        limit: 100,
        offset: 0,
        sortBy: { column: "created_at", order: "desc" },
      });

      if (error) {
        setError(error.message);
      } else {
        setFiles(data || []);
      }
      setLoading(false);
    };

    loadFiles();
  }, []);

  // Tạo signed URL để tải trực tiếp
  const handleDownload = async (fileName) => {
    const { data, error } = await supabase.storage
      .from("alowork-partner")
      .createSignedUrl(fileName, 60);

    if (error) {
      alert("Download error: " + error.message);
      return;
    }

    window.open(data.signedUrl, "_blank");
  };

  const handleDelete = async (fileName) => {
    const ok = window.confirm(`Xóa file "${fileName}"?`);
    if (!ok) return;
    const { error: sError } = await supabase.storage
      .from("alowork-partner")
      .remove([fileName]);
    if (sError) {
      alert("Delete error: " + sError.message);
      return;
    }
    await supabase.from("alowork-partner").delete().eq("path", fileName);
    setFiles((prev) => prev.filter((f) => f.name !== fileName));
  };

  return (
    <div>
      <h3>Danh sách files</h3>
      {loading && <p>Đang tải...</p>}
      {error && <p style={{ color: "red" }}>Lỗi: {error}</p>}

      <ul>
        {files.map((f) => (
          <li key={f.name} style={{ marginBottom: "10px" }}>
            <strong>{f.name}</strong>
            <button
              style={{ marginLeft: "10px" }}
              onClick={() => handleDownload(f.name)}
            >
              Download
            </button>
            <button
              style={{ marginLeft: "10px" }}
              onClick={() => handleDelete(f.name)}
            >
              Xóa
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
