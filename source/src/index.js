import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App';
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import TreeChart from "./TreeChart";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/tree/:category" element={<TreeChart />} />
      </Routes>
    </Router>
  </React.StrictMode>
);