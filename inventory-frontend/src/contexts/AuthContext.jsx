import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is stored in localStorage
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      try {
        // Set default authorization header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      console.log('Attempting login with:', email);
      
      // First try the test route
      const response = await axios.post('http://127.0.0.1:8000/api/test-login', {
        email,
        password
      });
      
      console.log('Login response:', response.data);
      
      if (response.data.success) {
        const { token, user: userData } = response.data;
        
        // Save to localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Set default authorization header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        setUser(userData);
        
        return { success: true };
      } else {
        return { 
          success: false, 
          message: response.data.message || 'Invalid credentials'
        };
      }
      
    } catch (error) {
      console.error('Login error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // If Laravel fails completely, check localStorage
      console.log('Trying localStorage fallback...');
      
      // Get users from localStorage
      const savedUsers = localStorage.getItem('inventory_users');
      console.log('Saved users in localStorage:', savedUsers);
      
      if (savedUsers) {
        try {
          const users = JSON.parse(savedUsers);
          console.log('Parsed users:', users);
          
          // Find user by email
          const user = users.find(u => u.email === email);
          console.log('Found user in localStorage:', user);
          
          if (user) {
            // Check password (plain text comparison for demo)
            if (user.password === password) {
              const mockToken = `mock-token-${Date.now()}`;
              localStorage.setItem('token', mockToken);
              localStorage.setItem('user', JSON.stringify(user));
              setUser(user);
              console.log('Login successful with localStorage');
              return { success: true };
            } else {
              console.log('Password mismatch');
            }
          }
        } catch (parseError) {
          console.error('Error parsing localStorage users:', parseError);
        }
      }
      
      // Last resort: check default demo users
      const demoUsers = [
        {
          id: 1,
          name: 'Admin User',
          email: 'admin@inventory.com',
          password: 'password123',
          role: 'admin',
          phone: '1234567890',
          is_active: true
        },
        {
          id: 2,
          name: 'Manager User',
          email: 'manager@inventory.com',
          password: 'password123',
          role: 'manager',
          phone: '1234567891',
          is_active: true
        },
        {
          id: 3,
          name: 'Staff User',
          email: 'staff@inventory.com',
          password: 'password123',
          role: 'staff',
          phone: '1234567892',
          is_active: true
        }
      ];
      
      const demoUser = demoUsers.find(u => u.email === email && u.password === password);
      if (demoUser) {
        const mockToken = `mock-token-${Date.now()}`;
        localStorage.setItem('token', mockToken);
        localStorage.setItem('user', JSON.stringify(demoUser));
        setUser(demoUser);
        console.log('Login successful with demo user');
        return { success: true };
      }
      
      return { 
        success: false, 
        message: 'Invalid email or password. Try: admin@inventory.com / password123'
      };
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('token');
      // Only try Laravel logout if it's not a mock token
      if (token && !token.includes('mock-token')) {
        await axios.post('http://127.0.0.1:8000/api/logout');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
    }
  };

  const hasRole = (role) => {
    return user?.role === role;
  };

  const value = {
    user,
    loading,
    login,
    logout,
    hasRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};