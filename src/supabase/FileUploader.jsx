import React, { useState } from "react";
import { supabase } from "./client";

export default function FileUploader() {
  const [file, setFile] = useState(null);

  const handleUpload = async () => {
    if (!file) return;
    const path = `${Date.now()}_${file.name}`;

    // Upload lên bucket "files"
    const { error } = await supabase.storage
      .from("alowork-partner")
      .upload(path, file, { cacheControl: "3600", upsert: false });

    if (error) {
      alert("Upload error: " + error.message);
      return;
    }

    // Lưu metadata vào DB
    await supabase.from("partner_files").insert({
      original_name: file.name,
      size: file.size,
      content_type: file.type,
      path,
      owner: (await supabase.auth.getUser()).data.user?.id,
    });

    setFile(null);
    alert("Upload thành công!");
  };

  return (
    <div>
      <input type="file" onChange={e => setFile(e.target.files[0])} />
      <button onClick={handleUpload} disabled={!file}>
        Upload
      </button>
    </div>
  );
}
