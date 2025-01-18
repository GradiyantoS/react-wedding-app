import React, { useState, useEffect } from 'react';
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { collection, query, where, getDocs,setDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { app,storage, db } from "../../firebaseConfig";
import {v4 as uuidv4} from "uuid";
import { Link } from 'react-router-dom';
import '../../styles/ManagePhotos.css';
import '../../styles/App.css';
import Modal from 'react-modal';
import imageCompression from 'browser-image-compression';

Modal.setAppElement('#root'); // Prevent accessibility warnings

export default function PhotoManagement() {
  const [username, setUsername] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [images, setImages] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingModalOpen, setLoadingModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    console.log("Firebase App Initialized:", app);
    const storedSession = localStorage.getItem('session_id');
    const storedUsername = localStorage.getItem('username');

    if (!storedSession || !storedUsername) {
      setIsModalOpen(true);
    } else {
      setSessionId(storedSession);
      setUsername(storedUsername);
      fetchImages(storedSession);
    }
  }, []);

  const fetchImages = async (uuid) => {
    try {
      console.info(db);        
      const q = query(collection(db, "images"), where("session_id", "==", uuid));
      const querySnapshot = await getDocs(q);
      const images = [];
      console.log(querySnapshot);
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if(data.image){
          images.push(data);
        }
      });

      console.log("Fetched images:", images);
      console.log("Number of images:", images.length);

      setImages(images);
    } catch (error) {
      console.error("Error fetching images:", error);
    }
  };

  const handleAddUser = () => {
    const uuid = uuidv4();
    localStorage.setItem('session_id', uuid);
    localStorage.setItem('username', username);
    setSessionId(uuid);
    setIsModalOpen(false);
  };


  const informationSaving = async (image ="") =>{
    const id = uuidv4();
    const imageData = {
      id,
      session_id : sessionId,
      username,
      image,
      is_public: false,
    };
    console.log(imageData);
    await setDoc(doc(db, "images", id), imageData);
    return imageData;
  }

  const handleUploadImage = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const options = {
        maxSizeMB: 4, // Max file size (in MB)
        maxWidthOrHeight: 1024, // Max width or height of the output image
        useWebWorker: true, // Use web workers for better performance
      };
      const compressedFile = await imageCompression(file, options);

      const now = new Date();
      const formattedDate = `${String(now.getDate()).padStart(2, '0')}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getFullYear()).slice(2)}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
      const fileName = `${username}_${formattedDate}`;

      const storageRef = ref(storage, `pictures/${fileName}`);
      try {
        setLoadingModalOpen(true);
        setIsUploading(true);
        // Upload the file to Firebase Storage
        const snapshot = await uploadBytes(storageRef, compressedFile);
        const downloadURL = await getDownloadURL(snapshot.ref);

        const imageData = await informationSaving(downloadURL);
        // Update local state
        setImages([...images, imageData]);
      } catch (error) {
        console.error("Error uploading image:", error);
        setLoadingModalOpen(false);
      } finally {
        setIsUploading(false);
        setLoadingModalOpen(false); // Hide loading modal
      }
    }
  };

  const handleDeleteImage = async (image) => {
    const confirmation = window.confirm("Are you sure you want to delete this image?");
    if (!confirmation) return;

    try {
      // Delete the image from Firestore
      await deleteDoc(doc(db, "images", image.id));

      // Delete the image from Firebase Storage
      const imageRef = ref(storage, image.image);
      await deleteObject(imageRef);

      // Update the state
      setImages(images.filter((img) => img.id !== image.id));
      console.log("Image deleted successfully.");
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };

  const toggleImageStatus = async (image) => {
    try {
      const updatedImage = { ...image, is_public: !image.is_public };
      await updateDoc(doc(db, "images", image.id), { is_public: updatedImage.is_public });

      const updatedImages = images.map((img) => (img.id === image.id ? updatedImage : img));
      setImages(updatedImages);
    } catch (error) {
      console.error("Error updating image status:", error);
    }
  };

  return (
    <div className="manage-page">
      <h2 className="text-2xl font-bold">Manage Your Photos</h2>
      <p className="text-lg mt-2">Upload, view, and manage your photos.</p>
      {isUploading && <div className="loading-spinner"></div>}
      {images.length === 0 && <p className="text-gray-500 mt-4">No photos available.</p>}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-6">
        {images.map((image, index) => (
          <div key={index} className="relative border border-gray-300 rounded-lg overflow-hidden">
            <img
              className="w-full h-40 object-cover"
              src={image.image}
              alt="Uploaded"
              onClick={() => setSelectedImage(image)}
            />
            <div className="absolute bottom-0 left-0 w-full bg-gray-800 bg-opacity-50 text-white text-sm flex justify-between p-2 opacity-70 group-hover:opacity-100 transition">
              <button onClick={() => toggleImageStatus(image)}>
                {image.is_public ? '👁️ Public' : '🔒 Private'}
              </button>
              <button onClick={() => handleDeleteImage(image)}>🗑️ Delete</button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-center">
        <label htmlFor="file-upload" className="inline-flex items-center justify-center bg-blue-500 text-white px-6 py-2 rounded-lg cursor-pointer hover:bg-blue-700 transition">
          <span className="mr-2 text-xl">➕</span>
          <span className="text-lg font-medium">Add Image</span>
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            onChange={handleUploadImage}
            hidden
          />
        </label>
      </div>

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

      {loadingModalOpen && (
        <Modal isOpen={loadingModalOpen} className="loading-modal">
          <p>Uploading image, please wait...</p>
        </Modal>
      )}
      
      {selectedImage && (
        <Modal isOpen={!!selectedImage} onRequestClose={() => setSelectedImage(null)} className="modal">
          <img src={selectedImage.image} alt="Selected" className="modal-image" />
        </Modal>
      )}
      <div className="navigation-links">
          <Link to="/" className="nav-link">Go to Main Page</Link>
          <Link to="/shared" className="nav-link">View Shared Photos</Link>
      </div>
    </div>
  );
}