import React, { createContext, useContext, useState, useEffect } from 'react';
import { emailService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isGmailConnected, setIsGmailConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkStatus = async () => {
    try {
      const { data } = await emailService.fetchEmails();
      setIsGmailConnected(data.isGmailConnected);
    } catch (err) {
      console.error("Failed to check connection status", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  return (
    <AuthContext.Provider value={{ isGmailConnected, setIsGmailConnected, loading, checkStatus }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
