import { AutoSlider } from "../components/Slides";
import Divider from "../components/Divider";
import Footer from "../components/Footer";

import partners from "../mocks/logo";
import TopProgramme from "../components/TopProgramme";
import { SuccessStories, WhyChoose, Partner, TipsAndEventsSection, BecomeCollaborator } from "../components/Short";




export default function HomePage() {
  
  return (
    <>
      <div className="page-container">


        <TopProgramme /> 
        <WhyChoose />  
        <Divider />
        <SuccessStories />  
        <TipsAndEventsSection />
        <Partner /> 
        <AutoSlider logos={partners} />
        <BecomeCollaborator />  {/* Thêm mục CTV vào đây */}
      
      </div>
     <Footer />
    </>
  );
}
