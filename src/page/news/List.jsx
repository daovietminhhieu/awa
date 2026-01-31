import { getPostsList } from "../../api";
import { useState, useEffect } from "react";
import "./List.css"; // import file css riêng
import { useNavigate } from "react-router-dom"; 

export default function NewsList() {
  const navigate = useNavigate();
  const [newsList, setNewsList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6; // số thẻ mỗi trang

  useEffect(() => {
    let ignore = false;

    const fetchNews = async () => {
      try {
        const news_list = await getPostsList();
        console.log(news_list);
        if (!ignore) setNewsList(news_list.data);
      } catch (error) {
        console.error("Error loading news list:", error);
      }
    };

    fetchNews();

    return () => {
      ignore = true;
    };
  }, []);

  // Pagination
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = newsList.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(newsList.length / postsPerPage);

  const handlePageChange = (page) => setCurrentPage(page);

  return (
    <div 
        className="news-container"
        
    >
      <h1 className="news-title">News List</h1>

      <div className="news-grid">
        {currentPosts.map((news) => (
        
          <div 
            key={news._id} 
            className="news-card"
            onClick={() => navigate(`/news/${news.slug}`)}
          >
            <img
              src={news.thumbnail_url}
              alt={news.title}
              className="news-img"
            />
            <h2 className="news-card-title">{news.title}</h2>
            <p className="news-info">
              <strong>Location:</strong> {news.location}
            </p>
            {news.eventDate && (
              <p className="news-info">
                <strong>Event:</strong> {news.eventDate.date} ({news.eventDate.startTime} - {news.eventDate.endTime})
              </p>
            )}
            <p className="news-date">
              Created: {new Date(news.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              className={`page-btn ${currentPage === i + 1 ? "active" : ""}`}
              onClick={() => handlePageChange(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
