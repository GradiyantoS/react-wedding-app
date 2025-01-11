import React, { useState, useEffect } from 'react';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { storage, db } from "../../firebaseConfig";
import { Link } from 'react-router-dom';
import '../../styles/ManagePhotos.css';
import Modal from 'react-modal';

Modal.setAppElement('#root'); // Prevent accessibility warnings

const localDataPath = '/src/data/local.json';
const localImageFolder = '/src/assets/pictures/';

export default function PhotoManagement() {
    const [username, setUsername] = useState('');
    const [sessionId, setSessionId] = useState('');
    const [images, setImages] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
  
    useEffect(() => {
      const storedSession = localStorage.getItem('session_id');
      if (!storedSession) {
        setIsModalOpen(true);
      } else {
        setSessionId(storedSession);
        fetchImages(storedSession);
      }
    }, []);
  
    const fetchImages = async (uuid) => {
      try {
        const q = query(collection(db, "images"), where("uuid", "==", uuid));
        const querySnapshot = await getDocs(q);
  
        const userImages = [];
        querySnapshot.forEach((doc) => {
          userImages.push(doc.data());
        });
  
        setImages(userImages);
      } catch (error) {
        console.error("Error fetching images:", error);
      }
    };
  
    const handleAddUser = () => {
      const uuid = Math.random().toString(36).substr(2, 9);
      localStorage.setItem('session_id', uuid);
      setSessionId(uuid);
      setIsModalOpen(false);
    };
  
    const handleUploadImage = async (event) => {
      const file = event.target.files[0];
      if (file) {
        const storageRef = ref(storage, `pictures/${Date.now()}-${file.name}`);
        try {
          // Upload the file to Firebase Storage
          const snapshot = await uploadBytes(storageRef, file);
          const downloadURL = await getDownloadURL(snapshot.ref);
  
          // Save metadata to Firestore
          const imageData = {
            uuid: sessionId,
            username,
            image: downloadURL,
            is_public: false,
          };
  
          const docRef = await addDoc(collection(db, "images"), imageData);
          console.log("Document written with ID: ", docRef.id);
  
          // Update local state
          setImages([...images, imageData]);
        } catch (error) {
          console.error("Error uploading image:", error);
        }
      }
    };
  
    const handleDeleteImage = (image) => {
      setImages(images.filter((img) => img !== image));
    };
  
    const toggleImageStatus = (image) => {
      const updatedImages = images.map((img) => {
        if (img === image) {
          return { ...img, is_public: !img.is_public };
        }
        return img;
      });
      setImages(updatedImages);
    };
  
    return (
      <div className="manage-page">
        <h2 className="text-2xl font-bold">Manage Your Photos</h2>
        <p className="text-lg mt-2">Upload, view, and manage your photos.</p>
  
        {images.length === 0 && <p className="text-gray-500 mt-4">No photos available.</p>}
  
        <div className="image-grid mt-6">
          {images.map((image, index) => (
            <div key={index} className="image-card">
              <img
                src={image.image}
                alt="Uploaded"
                onClick={() => setSelectedImage(image)}
              />
              <div className="image-options">
                <button onClick={() => toggleImageStatus(image)}>
                  {image.is_public ? '👁️ Public' : '🔒 Private'}
                </button>
                <button onClick={() => handleDeleteImage(image)}>🗑️ Delete</button>
              </div>
            </div>
          ))}
        </div>
  
        <input
          type="file"
          accept="image/*"
          onChange={handleUploadImage}
          className="upload-btn mt-6"
        />
  
        <Modal isOpen={isModalOpen} className="modal">
          <h2 className="text-lg font-bold">Enter Your Username</h2>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input-field mt-4"
          />
          <button onClick={handleAddUser} className="btn mt-6">Submit</button>
        </Modal>
  
        {selectedImage && (
          <Modal isOpen={!!selectedImage} onRequestClose={() => setSelectedImage(null)} className="modal">
            <img src={selectedImage.image} alt="Selected" className="modal-image" />
          </Modal>
        )}

        <div className="navigation-links">
            <Link to="/" className="nav-link">Go to Main Page</Link>
            <Link to="/shared" className="nav-link">Go to Manage Photos</Link>
        </div>
      </div>
    );
}