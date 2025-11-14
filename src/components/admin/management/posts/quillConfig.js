// src/pages/admin/programms/quillConfig.js
import { Quill } from "react-quill-new";

// --- Font whitelist ---
const Font = Quill.import("formats/font");
Font.whitelist = ["arial", "verdana", "helvetica", "tahoma"];
Quill.register(Font, true);

// --- Size whitelist ---
const Size = Quill.import("attributors/style/size");
Size.whitelist = [
  "12px", "14px", "16px", "18px", "20px", "24px", "28px", "32px"
];
Quill.register(Size, true);

export default Quill;
