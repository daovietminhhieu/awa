import Applicant from "../../components/Applicant";
import StackedBar from "../../components/plots/StackedBar";
import Pie from "../../components/plots/Pie";

import "./Overview.css";
import DigitalClock from "../../components/DigitalClock";
import { useI18n } from "../../i18n";
import Footer from "../../components/Footer";

export default function Overview() {
  const { t } = useI18n();

    return (
      <div>
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
              <h2 style={{ textAlign: "center" }}>{t('admin.overview.chart_title') || 'Interview Rate'}</h2>
              <Pie />
            </div>
          </div>

        </div>
  
        {/* Sidebar */}
        <div
          className="asidebar"
         
        >
          <h2 style={{ textAlign: "center", marginBottom: "20px" }}>{t('admin.overview.greeting') || 'Hello Admin,'}</h2>
          <hr style={{ margin: "20px 0" }}/>
          <p><strong>{t('admin.overview.balance_label') || 'Balance:'}</strong> {t('admin.overview.balance_value') || '0$'}</p>
          <hr style={{ margin: "20px 0" }}/>
          <p><strong>{t('admin.overview.total_candidates_label') || 'Total candidates:'}</strong> {t('admin.overview.total_candidates_value') || '250'}</p>
          <p>{t('admin.overview.interview_rate_label') || 'Interview rate:'} <strong>{t('admin.overview.interview_rate_value') || '35%'}</strong></p>
          <p>{t('admin.overview.hire_rate_label') || 'Hire rate:'} <strong>{t('admin.overview.hire_rate_value') || '12%'}</strong></p>
          <p>{t('admin.overview.concentration_label') || 'Profiles concentrated in country:'} <strong>{t('admin.overview.concentration_value') || 'Germany :D'}</strong></p>
          <hr style={{ margin: "20px 0" }} />
          <strong style={{marginBottom: 10}}>{t('admin.overview.recent_notifications') || 'Recent notifications'}</strong>
            <p>{t('admin.overview.notif_1') || 'Candidate A was interviewed'}</p>
            <p>{t('admin.overview.notif_2') || 'Candidate B submitted a new application'}</p>
            <p>{t('admin.overview.notif_3') || 'Candidate C declined the offer'}</p>
          <hr style={{ margin: "20px 0" }} />
          <strong style={{marginBottom: 10}}>{t('admin.overview.weather_title') || 'Weather Forecast'}</strong>
          <p>{t('admin.overview.weather_1') || '10:00 Cool, 27°C'}</p>
          <p>{t('admin.overview.weather_2') || '11:00 Sunny, 31°C'}</p>
          <p>{t('admin.overview.weather_3') || '12:00 Cloudy, 35°C'}</p>
          <p>{t('admin.overview.weather_4') || '13:00 Light rain, 30°C'}</p>
          <DigitalClock />
        </div>

      </div>
      <Footer/>
      </div>
    );
  }
  