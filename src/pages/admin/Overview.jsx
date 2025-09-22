import Applicant from "../../components/Applicant";
import StackedBar from "../../components/plots/StackedBar";
import Pie from "../../components/plots/Pie";

import "./Overview.css";
import DigitalClock from "../../components/DigitalClock";

export default function Overview() {

    return (
      <div
        className="main-layout"
      >
        {/* Main Content */}
        <div>
          {/* Row 1 */}
          <div 
            className="grid-rows-style"
          >
 
            <div 
              className="card-style"
            >
              <StackedBar />
            </div>
            <div 
              className="card-style"
            >
              <Applicant />
            </div>
            <div className="card-style">
              <h2 style={{ textAlign: "center" }}>Tỷ lệ phỏng vấn</h2>
              <Pie />
            </div>
          </div>

        </div>
  
        {/* Sidebar */}
        <div
          className="asidebar"
         
        >
          <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Chào Admin,</h2>
          <hr style={{ margin: "20px 0" }}/>
          <p><strong>Số dư:</strong> 0$</p>
          <hr style={{ margin: "20px 0" }}/>
          <p><strong>Tổng số ứng viên:</strong> 250</p>
          <p>Tỷ lệ phỏng vấn: <strong>35%</strong></p>
          <p>Tỷ lệ trúng tuyển: <strong>12%</strong></p>
          <p>Hồ sơ tập trung nhiều ở quốc gia: <strong>Đức :D</strong></p>
          <hr style={{ margin: "20px 0" }} />
          <strong style={{marginBottom: 10}}>Thông báo gần đây</strong>
            <p>Ứng viên A đã được phỏng vấn</p>
            <p>Ứng viên B mới nộp hồ sơ</p>
            <p>Ứng viên C từ chối offer</p>
          <hr style={{ margin: "20px 0" }} />
          <strong style={{marginBottom: 10}}>Dự báo thời tiết</strong>
          <p>10:00 Trời mát, 27 độ c</p>
          <p>11:00 Trời nắng, 31 độ c</p>
          <p>12:00 Trời nhiều mây, 35 độ c</p>
          <p>13:00 Trời mưa nhẹ, 30 độ c</p>
          <DigitalClock />
        </div>

      </div>
    );
  }
  