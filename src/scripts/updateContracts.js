import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// tạo __dirname cho ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUT_PATH = path.resolve(__dirname, "../mocks/contracts.js");

// dữ liệu mẫu
const names = ["Nguyen Van A", "Tran Thi B", "Le Van C", "Pham Thi D", "Hoang Van E"];
const positions = ["Software Engineer", "Data Analyst", "Project Manager", "QA Tester", "HR Specialist"];
const statuses = ["active", "inactive", "terminated", "pending"];
const colors = ["#2196F3", "#4CAF50", "#FF9800", "#9C27B0", "#00BCD4", "#E91E63"];

// hàm random
const random = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomDate = (start, end) =>
  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
    .toISOString()
    .split("T")[0];

// sinh contracts
const contracts = Array.from({ length: 15 }).map((_, i) => {
  const start = randomDate(new Date(2023, 0, 1), new Date(2024, 11, 31));
  const end = randomDate(new Date(2025, 0, 1), new Date(2026, 11, 31));

  return {
    id: i + 1,
    employeeName: random(names),
    position: random(positions),
    startDate: start,
    endDate: end,
    salary: `${(1000 + Math.floor(Math.random() * 4000)).toLocaleString()} USD`,
    status: random(statuses),
    contractFile: `/docs/contract_${i + 1}.pdf`,
    color: random(colors),
  };
});

// ghi đè file contracts.js
const content =
  `const contracts = ${JSON.stringify(contracts, null, 2)};\n\nexport default contracts;`;

fs.writeFileSync(OUT_PATH, content, "utf-8");

console.log("✅ contracts.js đã được cập nhật ngẫu nhiên!");
