import { useI18n } from "../../i18n";
import { useRef, useState, useCallback, useEffect } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";


export function normalizeQuillHTML(html = "") {
  if (!html) return html;

  // 1. Fix OL nhưng lại chứa bullet
  html = html.replace(
    /<ol>([\s\S]*?)<\/ol>/g,
    (match, content) => {
      if (content.includes('data-list="bullet"')) {
        return `<ul>${content}</ul>`;
      }
      return match;
    }
  );

  // 2. Fix UL nhưng lại chứa ordered
  html = html.replace(
    /<ul>([\s\S]*?)<\/ul>/g,
    (match, content) => {
      if (content.includes('data-list="ordered"')) {
        return `<ol>${content}</ol>`;
      }
      return match;
    }
  );

  return html;
}
export function QuillEditor({ title, value, onChange, onClose, onSaved }) {
    const { t, lang } = useI18n();
    const quillRef = useRef(null);
  
    const [thumbnail, setThumbnail] = useState();
    const [fileType, setFileType] = useState();
    const [uploading, setUploading] = useState(false);
  
  
    /* --- Handler upload video trong editor --- */
    const handleVideoUpload = useCallback(async () => {
      const quill = quillRef.current?.getEditor();
      if (!quill) return;
  
      const range = quill.getSelection(true);
      
      const choice = window.prompt(
        "🎥 Dán link YouTube hoặc bấm Cancel để tải video từ máy:"
      );
  
      if (choice && choice.startsWith("http")) {
        // ✅ Nhúng YouTube
        const youtubeMatch = choice.match(
          /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/
        );
        if (youtubeMatch) {
          const embedUrl = `https://www.youtube.com/embed/${youtubeMatch[1]}`;
          quill.insertEmbed(range.index, "video", embedUrl);
        } else {
          alert("⚠️ Link không hợp lệ. Hãy nhập đúng link YouTube!");
        }
        return;
      }
  
      // 🟢 Upload video từ máy
      const fileInput = document.createElement("input");
      fileInput.setAttribute("type", "file");
      fileInput.setAttribute("accept", "video/*");
      fileInput.click();
  
      fileInput.onchange = async () => {
        const file = fileInput.files[0];
        if (!file) return;
  
        quill.insertText(range.index, "⏳ Đang tải video...", "italic", true);
        try {
          const url = await upFileToStorage(file);
          quill.deleteText(range.index, "⏳ Đang tải video...".length);
          quill.insertEmbed(range.index, "video", url);
          alert("✅ Video đã tải lên thành công!");
        } catch (err) {
          console.error(err);
          alert("❌ Lỗi tải video!");
          quill.deleteText(range.index, "⏳ Đang tải video...".length);
        }
      };
    }, []);
  
    /* --- Cấu hình ReactQuill đầy đủ --- */
const quillModules = {
  toolbar: {
    container: [
      [{ 'header': [1, 2, 3, false] }],
      [{ 'font': [] }],
      [{ 'size': ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px'] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['blockquote', 'code-block'],
      ['link', 'image', 'video'],
      ['clean']
    ],
    handlers: {
      video: handleVideoUpload
    }
  },
  clipboard: {
    matchVisual: false,
  },
  keyboard: {
    bindings: {
      // ✅ IMPROVED FIX: Remove confusing video bindings - let Quill handle it natively
      // This was preventing cursor movement after videos loaded from backend
    }
  }
};
  
    const quillFormats = [
      'header', 'font', 'size',
      'bold', 'italic', 'underline', 'strike',
      'color', 'background',
      'script',
      'list', 'bullet', 'indent',
      'align', 'direction',
      'blockquote', 'code-block',
      'link', 'image', 'video'
    ];
  
    const handleFileChange = async (file, type) => {
      setUploading(true);
      try {
        const url = await upFileToStorage(file);
        setThumbnail(url);
        setFileType(type);
        alert("✅ " + t("admin.post.upload_success"));
      } catch {
        alert("❌ " + t("admin.post.upload_error"));
      } finally {
        setUploading(false);
      }
    };
  
    // Thêm useEffect để debug content
  
    /* =========================================================
       SAVE POST
       ========================================================= */
    const handleSubmit = async (e) => {
      e.preventDefault();
  
      // if (!title || !thumbnail || !selectedProgram) {
      //   alert("⚠️ " + t("admin.post.missing_fields"));
      //   return;
      // }

      console.log("Preparing to save post...");
  
      const payload = {
        ...data
      };
  
      console.log("Saving payload:", payload);
  
      try {
        await updatePostL(data.id, payload);
        alert("✅ " + t("admin.post.edit_form.update_success"));
        onSaved?.();
        onClose?.();
      } catch (err) {
        console.error(err);
        alert("❌ " + t("admin.post.edit_form.update_error"));
      }
    };
  
    return (
      <div className="editor-container-indivi">
  
        <form className="post-editor" onSubmit={handleSubmit}>
  

          <h3>{title}</h3>
  
          {/* Ảnh */}
          {/* <label>{t("admin.post.edit_form.thumbnail")}</label>
          <input type="file" onChange={(e) => handleFileChange(e.target.files[0], "image")} />
          {uploading && <p>{t("admin.post.uploading")}</p>}
          {thumbnail && (
            <img src={thumbnail} alt="thumbnail" width="220" style={{ borderRadius: 8 }} />
          )}
   */}
  
          {/* Nội dung */}

          <div className="quill-container">
            <ReactQuill
              ref={quillRef}
              theme="snow"
              value={normalizeQuillHTML(value)}
              onChange={onChange}
              modules={quillModules}
              formats={quillFormats}
              style={{ height: "400px", marginBottom: "50px" }}
            />

          </div>
  
          {/* <div className="editor-actions">
            <button type="submit" className="save-btn">
              💾 {t("admin.post.edit_form.save")}
            </button>
            <button type="button" onClick={onClose} className="cancel-btn">
              ❌ {t("admin.post.edit_form.cancel")}
            </button>
          </div> */}
        </form>
      </div>
    );
  }