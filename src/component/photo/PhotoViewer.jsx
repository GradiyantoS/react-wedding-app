import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, limit, startAfter } from "firebase/firestore";
import { Link } from 'react-router-dom';
import { db } from "../../firebaseConfig";
import '../../styles/PhotoViewer.css';

export default function PhotoViewer() {
    const [images, setImages] = useState([]);
    const [lastDoc, setLastDoc] = useState(null);
    const [loading, setLoading] = useState(false);
  
    useEffect(() => {
      fetchImages();
    }, []);
  
    const fetchImages = async () => {
      setLoading(true);
      try {
        const baseQuery = query(
          collection(db, "images"),
          where("is_public", "==", true),
          orderBy("username"),
          limit(10)
        );
        const paginatedQuery = lastDoc ? query(baseQuery, startAfter(lastDoc)) : baseQuery;
  
        const querySnapshot = await getDocs(paginatedQuery);
        const newImages = [];
  
        querySnapshot.forEach((doc) => {
          newImages.push(doc.data());
        });
  
        setImages((prev) => [...prev, ...newImages]);
        setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
      } catch (error) {
        console.error("Error fetching shared photos:", error);
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <div className="shared-page">
        <h2 className="text-2xl font-bold text-center">Shared Photos</h2>
        <p className="text-lg mt-2 text-center">View public photos shared by others.</p>
  
        <div className="image-grid mt-6">
          {images.map((image, index) => (
            <div key={index} className="image-card">
              <img src={image.image} alt="Shared" className="shared-image" />
              <div className="image-details">
                <p className="username">Uploader: {image.username}</p>
                <p className="public-status">Status: {image.is_public ? 'Public' : 'Private'}</p>
              </div>
            </div>
          ))}
        </div>
  
        {loading && <p className="loading">Loading...</p>}
  
        {!loading && lastDoc && (
          <button onClick={fetchImages} className="load-more-btn">
            Load More
          </button>
        )}
  
        <div className="navigation-links">
          <Link to="/" className="nav-link">Go to Main Page</Link>
          <Link to="/manage" className="nav-link">Go to Manage Photos</Link>
        </div>
      </div>
    );
}