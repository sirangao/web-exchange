import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar           from './components/Navbar';
import PrivateRoute     from './components/PrivateRoute';

import HomePage          from './pages/HomePage';
import LoginPage         from './pages/LoginPage';
import RegisterPage      from './pages/RegisterPage';
import ListingDetailPage from './pages/ListingDetailPage';
import CreateListingPage from './pages/CreateListingPage';
import MyListingsPage    from './pages/MyListingsPage';
import MeetupsPage       from './pages/MeetupsPage';
import ProfilePage       from './pages/ProfilePage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          {/* Public */}
          <Route path="/"          element={<HomePage />} />
          <Route path="/login"     element={<LoginPage />} />
          <Route path="/register"  element={<RegisterPage />} />
          <Route path="/listings/:id" element={<ListingDetailPage />} />

          {/* Protected */}
          <Route path="/create-listing" element={
            <PrivateRoute><CreateListingPage /></PrivateRoute>
          } />
          <Route path="/edit-listing/:id" element={
            <PrivateRoute><CreateListingPage /></PrivateRoute>
          } />
          <Route path="/my-listings" element={
            <PrivateRoute><MyListingsPage /></PrivateRoute>
          } />
          <Route path="/meetups" element={
            <PrivateRoute><MeetupsPage /></PrivateRoute>
          } />
          <Route path="/profile" element={
            <PrivateRoute><ProfilePage /></PrivateRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
