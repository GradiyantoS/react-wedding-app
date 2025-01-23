
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './component/MainPage';
import PhotoManagement from './component/photo/PhotoManagement';
import PhotoViewer from './component/photo/PhotoViewer';
import AdminControlPage from './component/AdminControlPage';

function App() {

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/control" element={<AdminControlPage />} />
          <Route path="/manage" element={<PhotoManagement />} />
          <Route path="/shared" element={<PhotoViewer />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App
