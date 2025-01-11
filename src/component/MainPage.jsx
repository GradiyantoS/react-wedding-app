
import { Link } from 'react-router-dom';
import '../styles/App.css';
import background from '../assets/background.jpg';


export default function MainPage(){
    
    return(
        <div className="main-page" style={{ backgroundImage: `url(${background})`, backgroundSize: 'cover', backgroundPosition: 'center', minHeight: '100vh' }}>
            <header className="header text-center py-10">
                <h1 className="text-4xl font-bold text-white">Your Wedding Moments</h1>
                <p className="text-lg mt-4 text-white">Capture and Share Your Special Day</p>
            </header>
            <div className="buttons flex flex-col items-center mt-10">
                <Link to="/manage" className="btn px-4 py-2 bg-blue-500 text-white rounded mt-4">Manage Your Photos</Link>
                <Link to="/shared" className="btn px-4 py-2 bg-green-500 text-white rounded mt-4">View Shared Photos</Link>
            </div>
        </div>
    )
}