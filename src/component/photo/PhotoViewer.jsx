import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, limit, startAfter } from "firebase/firestore";
import { Link } from 'react-router-dom';
import { db } from "../../firebaseConfig";
import '../../styles/PhotoViewer.css';
import '../../styles/App.css';

export default function PhotoViewer() {
  const [sharedPhotos, setSharedPhotos] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const [startX, setStartX] = useState(null);
  const [endX, setEndX] = useState(null);

  useEffect(()=>{
    fetchSharedPhotos();

    // Detect if the user is on a mobile device
    const checkMobile = () => {
      setIsMobile(window.matchMedia("(max-width: 768px)").matches);
    };

    checkMobile(); // Initial check
    window.addEventListener("resize", checkMobile); // Recheck on window resize
    return () => window.removeEventListener("resize", checkMobile);
  },[])

  useEffect(() => { // Fetch initial photos
    if (!isMobile) return;
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop + 1 >=
          document.documentElement.scrollHeight &&
        !isLoading &&
        hasMore
      ) {
        fetchSharedPhotos();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMobile,hasMore, isLoading]);

  const fetchSharedPhotos = async () => {
    if (isLoading || !hasMore) return; // Prevent multiple fetches or fetching when no more data

    setIsLoading(true);
    try {
      const q = lastDoc
        ? query(
            collection(db, "images"),
            where("is_public", "==", true),
            orderBy("created_at", "desc"),
            startAfter(lastDoc),
            limit(10) // Fetch next 10 documents
          )
        : query(
            collection(db, "images"),
            where("is_public", "==", true),
            orderBy("created_at", "desc"),
            limit(10) // Fetch first 10 documents
          );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const newPhotos = querySnapshot.docs.map((doc) => ({
          id: doc.id, // Add document ID
          ...doc.data(),
        }));

        setSharedPhotos((prevPhotos) => [...prevPhotos, ...newPhotos]);
        setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]); // Update lastDoc
      } else {
        setHasMore(false); // No more documents to fetch
      }
    } catch (error) {
      console.error("Error fetching shared photos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const openImage = (index) => {
    setCurrentImageIndex(index);
  };

  const closeImage = () => {
    setCurrentImageIndex(null);
  };

  const goToNextImage = () => {
    if (currentImageIndex !== null) {
      setCurrentImageIndex((currentImageIndex + 1) % sharedPhotos.length);
    }
  };

  const goToPrevImage = () => {
    if (currentImageIndex !== null) {
      setCurrentImageIndex((currentImageIndex - 1 + sharedPhotos.length) % sharedPhotos.length);
    }
  };

  const handleTouchStart = (e) => {
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setEndX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (startX && endX) {
      const diff = startX - endX;
      if (diff > 50) {
        goToNextImage();
      } else if (diff < -50) {
        goToPrevImage();
      }
    }
    setStartX(null);
    setEndX(null);
  };

  const handleModalClick = (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      closeImage();
    }
  };

  return (
    <div className="shared-page">
      <h2 className="text-2xl font-bold">Shared Photos</h2>
      <p className="text-lg mt-2">Browse photos shared by others.</p>

      {sharedPhotos.length === 0 && !isLoading && (
        <p className="text-gray-500 mt-4">No shared photos available.</p>
      )}

      <div className="image-grid mt-6">
        {sharedPhotos.map((photo, index) => (
          <div key={index} className="relative border border-gray-300 rounded-lg overflow-hidden group">
            <img
              className="w-full h-40 object-cover cursor-pointer"
              src={photo.image}
              alt="Uploaded"
              onClick={() => openImage(index)}
            />
            <div className="absolute bottom-0 left-0 w-full bg-gray-800 bg-opacity-50 text-white text-sm px-2 py-1">
              <span>{photo.username || 'Unknown User'}</span>
            </div>
          </div>
        ))}
      </div>

      {currentImageIndex !== null && (
        <div
          className="modal-overlay fixed top-0 left-0 w-full h-full bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={handleModalClick}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="relative flex items-center justify-center">
            <button
              className="absolute left-0 text-white text-2xl bg-gray-800 bg-opacity-50 rounded-full p-2 hover:bg-opacity-75"
              style={{ marginLeft: '-50px' }}
              onClick={goToPrevImage}
            >
              &lt;
            </button>
            <img
              className="max-w-full max-h-full mx-auto"
              src={sharedPhotos[currentImageIndex].image}
              alt="Large View"
            />
            <button
              className="absolute right-0 text-white text-2xl bg-gray-800 bg-opacity-50 rounded-full p-2 hover:bg-opacity-75"
              style={{ marginRight: '-50px' }}
              onClick={goToNextImage}
            >
              &gt;
            </button>
          </div>
        </div>
      )}

      {isLoading && <div className="loading-modal">Loading...</div>}
      
      {!isMobile && hasMore && (
        <div className="mt-6 text-center hidden md:block">
          <button
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            onClick={fetchSharedPhotos}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}

      {isLoading && <div className="text-center mt-4">Loading...</div>}
      <div className="navigation-links">
          <Link to="/" className="nav-link">Go to Main Page</Link>
          <Link to="/manage" className="nav-link">Manage Your Photos</Link>
      </div>
    </div>
  );
} 