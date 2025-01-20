
import { Link } from 'react-router-dom';
import '../styles/App.css';
import background from '../assets/background.jpg';


export default function MainPage(){

    return (
        <div className="main-page bg-cover bg-center min-h-screen flex flex-col justify-between" style={{ backgroundImage: `url(${background})` }}>
          <div className="flex flex-col items-center justify-center text-center text-white p-6">
            <h1 className="text-4xl font-bold mb-4 ">Derian & Felicia</h1>
            <p className="text-med italic">Capture the moment and share it</p>
          </div>
    
          <div className="button-container flex flex-col gap-4 p-6">
            <a
              href="/manage"
              className="elegant-btn bg-black bg-opacity-75 text-white border border-white py-3 px-6 text-lg font-semibold rounded-md hover:bg-opacity-90 transition"
            >
              Manage Your Photos
            </a>
            <a
              href="/shared"
              className="elegant-btn bg-white text-black border border-black py-3 px-6 text-lg font-semibold rounded-md hover:bg-gray-200 transition"
            >
              View Shared Photos
            </a>
          </div>
        </div>
    );
}