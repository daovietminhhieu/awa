// Danh sách dữ liệu mô phỏng
export const countries = ["Nhật Bản", "Hàn Quốc", "Đài Loan", "Đức", "Úc"];
export const industries = ["Điều dưỡng", "Xây dựng", "Kỹ sư", "Du học"];
export const statuses = ["Mới", "Đang xét duyệt", "Phỏng vấn", "Trúng tuyển", "Xuất cảnh"];
export const provinces = [
  "Hà Nội",
  "Hải Dương",
  "Thanh Hóa",
  "Nghệ An",
  "TP.HCM",
  "Đồng Nai",
  "Bình Dương",
];

// Hàm random
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function choice(arr) {
  return arr[randInt(0, arr.length - 1)];
}
function weightedChoice(choices, weights) {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < choices.length; i++) {
    r -= weights[i];
    if (r <= 0) return choices[i];
  }
  return choices[choices.length - 1];
}

// Tạo danh sách ứng viên giả lập
export function generateApplicants(n = 200, year = 2025) {
  const data = [];
  for (let i = 0; i < n; i++) {
    data.push({
      ApplicantID: i + 1,
      Country: choice(countries),
      Industry: choice(industries),
      Status: weightedChoice(statuses, [0.3, 0.25, 0.2, 0.15, 0.1]),
      Province: choice(provinces),
      Month: randInt(1, 12),
      Year: year,
    });
  }
  return data;
}

// Pie chart: phân bổ theo ngành nghề
export function getPieDataByIndustry(data) {
  const counts = data.reduce((acc, d) => {
    acc[d.Industry] = (acc[d.Industry] || 0) + 1;
    return acc;
  }, {});
  return { labels: Object.keys(counts), data: Object.values(counts) };
}

// Stacked bar chart: quốc gia & trạng thái
export function getStackedBarDataByCountryStatus(data) {
  const countriesSet = [...new Set(data.map((d) => d.Country))];

  const datasets = statuses.map((status) => {
    const dataByCountry = countriesSet.map(
      (country) =>
        data.filter((d) => d.Country === country && d.Status === status).length
    );

    return {
      label: status,
      data: dataByCountry,
    };
  });

  return { labels: countriesSet, datasets };
}




