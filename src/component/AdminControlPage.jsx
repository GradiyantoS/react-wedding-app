// AdminControlPage with Photo Management and User Blacklist Toggle
import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, doc, updateDoc, deleteDoc, orderBy } from "firebase/firestore";
import { db } from "../firebaseConfig";
import Modal from "react-modal";
import '../styles/App.css';

function AdminControlPage() {
    const [photos, setPhotos] = useState([]);
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(true);
    const [credentials, setCredentials] = useState({ username: "", password: "" });
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUsername, setSelectedUsername] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
  
    useEffect(() => {
        const lastLogin = localStorage.getItem('lastLogin');
        const currentTime = Date.now();

        if (lastLogin && currentTime - parseInt(lastLogin, 10) < 30 * 60 * 1000) {
            setIsModalOpen(false);
            fetchUsers();
        } else {
            setIsModalOpen(true);
        }
    }, []);
  
    useEffect(() => {
        setFilteredUsers(
          users.filter((user) => user.username.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [searchTerm, users]);

    const validateCredentials = () => {
        const { username, password } = credentials;
        const credentialEnv = import.meta.env.VITE_ADMIN_CREDENTIALS; // Format: username#password

        if (!credentialEnv) {
            console.error("Missing credentials in environment variables.");
            return false;
        }

        const [envUsername, envPassword] = credentialEnv.split("#");
        return username === envUsername && password === envPassword;
    };
    
    const handleLogin = () => {
        if (validateCredentials()) {
            localStorage.setItem('lastLogin', Date.now().toString());
            setIsModalOpen(false);
            fetchUsers();
        } else {
            alert("Invalid username or password.");
        }
    };
  
    const fetchPhotos = async (username) => {
      setIsLoading(true);
      try {
        const q = query(
          collection(db, "images"),
          where("username", "==", username)
        );
        const querySnapshot = await getDocs(q);
        const fetchedPhotos = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setPhotos(fetchedPhotos);
      } catch (error) {
        console.error("Error fetching photos:", error);
      } finally {
        setIsLoading(false);
      }
    };
  
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const q = query(collection(db, "users"));
        const querySnapshot = await getDocs(q);
        const fetchedUsers = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setUsers(fetchedUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setIsLoading(false);
      }
    };
  
    const deletePhoto = async (photoId) => {
      try {
        await deleteDoc(doc(db, "images", photoId));
        setPhotos((prevPhotos) => prevPhotos.filter((photo) => photo.id !== photoId));
        console.log("Photo deleted successfully.");
      } catch (error) {
        console.error("Error deleting photo:", error);
      }
    };
  
    const toggleBlacklist = async (userId, isBlacklisted) => {
      try {
        const userDocRef = doc(db, "users", userId);
        await updateDoc(userDocRef, { is_blacklist: !isBlacklisted });
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === userId ? { ...user, is_blacklist: !isBlacklisted } : user
          )
        );
        console.log(`User ${userId} blacklist status updated to ${!isBlacklisted}`);
      } catch (error) {
        console.error("Error toggling blacklist status:", error);
      }
    };
  
    const handleViewPhotos = (username) => {
      setPhotos([]); // Reset photos list
      setSelectedUsername(username);
      fetchPhotos(username);
    };
  
    return (
      <div className="admin-control-page">
        <Modal
          isOpen={isModalOpen}
          onRequestClose={() => setIsModalOpen(false)}
          className="modal"
          overlayClassName="overlay"
        >
          <h2 className="text-xl font-bold">Admin Login</h2>
          <input
            type="text"
            placeholder="Username"
            className="border px-4 py-2 mt-4 rounded-lg w-full"
            value={credentials.username}
            onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
          />
          <input
            type="password"
            placeholder="Password"
            className="border px-4 py-2 mt-4 rounded-lg w-full"
            value={credentials.password}
            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
          />
          <button
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition mt-4"
            onClick={handleLogin}
          >
            Login
          </button>
        </Modal>
  
        {!isModalOpen && (
          <>
            <h2 className="text-2xl font-bold">Admin Control</h2>
  
            <div className="mt-6">
              <h3 className="text-lg font-bold">User Management</h3>
              <input
                type="text"
                placeholder="Search users"
                className="border px-4 py-2 rounded-lg w-full mb-4"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                />
              <div className="user-list mt-4 overflow-y-auto max-h-64 border rounded-lg p-4">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className={`user-item flex items-center justify-between p-4 border rounded-lg mb-2 ${
                      user.is_blacklist ? "bg-red-100" : "bg-green-100"
                    }`}
                  >
                    <span>{user.username}</span>
                    <div className="flex gap-2">
                      <button
                        className={`px-4 py-2 rounded-lg text-white ${
                          user.is_blacklist ? "bg-red-500 hover:bg-red-700" : "bg-green-500 hover:bg-green-700"
                        }`}
                        onClick={() => toggleBlacklist(user.id, user.is_blacklist)}
                      >
                        {user.is_blacklist ? "Blacklist: True" : "Blacklist: False"}
                      </button>
                      <button
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                        onClick={() => handleViewPhotos(user.username)}
                      >
                        View Photos
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
  
            {selectedUsername && (
              <div className="mt-6">
                <h3 className="text-lg font-bold">Photo Management</h3>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-6">
                  {photos.map((photo) => (
                    <div key={photo.id} className="relative border border-gray-300 rounded-lg overflow-hidden">
                      <img src={photo.image} alt="Uploaded" className="w-full h-40 object-cover"  onClick={() => setSelectedImage(photo)}/>
                      <div className="absolute bottom-0 left-0 w-full bg-gray-800 bg-opacity-50 text-white text-sm flex justify-between p-2 opacity-70 group-hover:opacity-100 transition">
                        <p>
                            {photo.username}
                        </p>
                        <button
                          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                          onClick={() => deletePhoto(photo.id)}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
  
                {selectedImage && (
                    <Modal isOpen={!!selectedImage} onRequestClose={() => setSelectedImage(null)} className="modal">
                        <img src={selectedImage.image} alt="Selected" className="modal-image" />
                    </Modal>
                )}
                {isLoading && <p className="text-center mt-4">Loading...</p>}
              </div>
            )}
          </>
        )}
      </div>
    );
  }
  

export default AdminControlPage;