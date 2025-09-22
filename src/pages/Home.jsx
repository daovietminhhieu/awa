import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import FilterSearch from '../components/FilterSearch';
import {NewsSlider, PartnerSlider} from '../components/Slides';
import Card from '../components/Card';
import Divider from '../components/Divider.jsx';
import Footer from '../components/Footer.jsx';


import mockNews from '../mocks/news.js';
import partners from '../mocks/logo.js';
import coursesData  from '../mocks/courses';


function parseFeeToNumber(fee) {
    if (fee == null) return NaN;
    if (typeof fee === "number") return fee;
    const s = String(fee);
    const match = s.match(/[\d.,]+/);
    if (!match) return NaN;
    let numStr = match[0].replace(/,/g, "");
    const n = parseFloat(numStr);
    return Number.isFinite(n) ? n : NaN;
  }

  
export default function HomePage() {

    const [filteredCourses, setFilteredCourses] = useState(coursesData);
    const navigate = useNavigate();

    const coursesTitle = "Chương trình học hiện tại";
    const workTitle = "Hợp đồng lao động";
    const handleFilterChange = (filters) => {
        let result = coursesData;
        
        console.log(filters.fee);

        if (filters.tag) {
          result = result.filter((c) => c.tags.includes(filters.tag));
        }
        if (filters.fee) {
            result = result.filter((c) => {
              const value = parseFeeToNumber(c.fee);
              if (!Number.isFinite(value)) return false; // không có fee thì loại luôn
          
              if (filters.fee === "0-1000") return value <= 1000;
              if (filters.fee === "1000-2000") return value > 1000 && value <= 2000;
              if (filters.fee === "2000+") return value > 2000;
          
              return true;
            });
          }
          
        if (filters.country) {
          result = result.filter((c) => c.country === filters.country);
        }
        if (filters.deadline) {
          result = result.filter(
            (c) => new Date(c.deadline) <= new Date(filters.deadline)
          );
        }
    
        setFilteredCourses(result);
    };

    const handleSelectCourse = (course) => {
      // Điều hướng sang trang detail và truyền state
      navigate(`/courses/${course.id}`, { state: { course } });
    };

    return (
        <>
            <FilterSearch
                courses={coursesData}
                onFilterChange={handleFilterChange}
                onSelectCourse={handleSelectCourse}/>
            <PartnerSlider logos={partners}/>
            <Card courses={filteredCourses} title={coursesTitle}/>
            <Divider />
            <Card courses={filteredCourses} title={workTitle} />
            <NewsSlider  news={mockNews} />
            <Footer />
        </>
    );
}
