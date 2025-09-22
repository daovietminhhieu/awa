import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
// tạo __dirname thủ công
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUT_PATH = path.resolve(__dirname, "../mocks/courses.js");
const N = 20; // số courses muốn tạo

// Dữ liệu mẫu để random
const titles = [
  "AI for Business",
  "Data Science Bootcamp",
  "Cybersecurity 101",
  "Machine Learning Advanced",
  "Web Development Mastery",
  "Applied Analytics",
  "Business Intelligence",
  "NLP and Text Mining",
  "Cloud Data Engineering",
  "Financial Analytics"
];
const universities = [
  "MIT", "Stanford University", "University of Oxford", "National Taiwan University",
  "TU Munich", "Carnegie Mellon University", "Imperial College London",
  "University of Toronto", "University of Sydney", "ETH Zurich"
];
const countries = [
  "USA", "Germany", "Taiwan", "United Kingdom", "Australia", "Singapore", "Ireland"
];
const levels = ["Bachelor", "Master", "MSc", "Postgraduate", "Certificate", "Graduate Diploma"];
const statuses = ["active", "inactive", "upcoming", "closed"];
const tagsPool = ["AI","ML","Data","Cloud","Security","Math","NLP","Big Data","Analytics","Business"];

// Màu (palette) để gán vào trường color
const colors = [
  "#2196F3","#4CAF50","#FF9800","#9C27B0","#00BCD4","#E91E63",
  "#3F51B5","#FF5722","#607D8B","#CDDC39","#009688","#8BC34A",
  "#F44336","#673AB7","#FFC107"
];

// Helpers
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randTags = () => {
  const k = randInt(2, 6);
  const s = new Set();
  while (s.size < k) s.add(rand(tagsPool));
  return Array.from(s);
};
const pad2 = (n) => String(n).padStart(2, "0");

// Tạo mảng courses
const courses = Array.from({ length: N }, (_, i) => {
  const id = i + 1;
  const title = rand(titles) + (Math.random() > 0.6 ? ` - Specialization ${rand(["A","B","C"])}` : "");
  const uni = rand(universities);
  const country = rand(countries);
  const level = rand(levels);
  const duration = `${randInt(1, 3)} year${Math.random() > 0.6 ? "s" : ""}`;
  const fee = `${randInt(1500, 65000)} USD per year`;
  const status = rand(statuses);
  const day = pad2(randInt(1,28));
  const month = pad2(randInt(1,12));
  const year = 2025 + (Math.random() > 0.8 ? 1 : 0);
  const deadline = `${day}-${month}-${year}`; // format dd-mm-yyyy like dataset gốc
  const vacancies = randInt(5, 40);
  const bonus = Math.random() > 0.4 ? `${randInt(200,5000)} USD` : null;
  const reward = Math.random() > 0.4 ? `${randInt(100,5000)} USD` : null;
  const tags = randTags();
  const logo = `https://picsum.photos/seed/course${id}/50/50`;
  const jdFile = Math.random() > 0.5 ? `${String(id).padStart(3,"0")}.pdf` : null;
  const jdFileName = jdFile ? `/docs/jd_${String(id).padStart(3,"0")}.pdf` : null;
  const color = rand(colors);

  return {
    id,
    title,
    university: uni,
    country,
    level,
    duration,
    fee,
    logo,
    status,
    deadline,
    bonus,
    reward,
    vacancies,
    tags,
    jdFile,
    jdFileName,
    requirement: "Applicants should have relevant academic background and proof of English proficiency.",
    color
  };
});

// Viết file (bằng ESM export default để dùng trực tiếp trong React)
const newContent = `const courses = ${JSON.stringify(courses, null, 2)};\n\nexport default courses;\n`;

fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
fs.writeFileSync(OUT_PATH, newContent, "utf8");

console.log("✅ Đã ghi đè", OUT_PATH);
console.log(`   Tạo ${courses.length} courses, mỗi course có field "color".`);
