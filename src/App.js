// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import DesktopMandelbrotGameOfLife from './components/DesktopMandelbrotGameOfLife';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/conways-mandelbrot" element={<DesktopMandelbrotGameOfLife />} />
      </Routes>
    </Router>
  );
}

export default App;