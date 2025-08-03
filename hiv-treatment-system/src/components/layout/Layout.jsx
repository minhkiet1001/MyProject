import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { UserRole } from '../../types/index.js';
import notificationService from '../../services/notificationService';
import authService from '../../services/authService';

const Layout = ({ 
  children, 
  currentRole = UserRole.GUEST,
  userName, 
  pageTitle, 
  className = '',
  hasNotifications: propHasNotifications
}) => {
  const [hasNotifications, setHasNotifications] = useState(propHasNotifications || false);

  useEffect(() => {
    // If authenticated, check for notifications
    if (authService.isAuthenticated() && currentRole !== UserRole.GUEST) {
      const checkNotifications = async () => {
        try {
          const response = await notificationService.getUnreadCount();
          if (response && response.success) {
            setHasNotifications(response.data.count > 0);
          }
        } catch (error) {
          console.error('Error fetching notification count:', error);
        }
      };
      
      checkNotifications();
      
      // Poll for new notifications every minute
      const intervalId = setInterval(checkNotifications, 60000);
      
      return () => clearInterval(intervalId);
    }
  }, [currentRole]);
  // Define background color based on role
  const getBgColor = () => {
    switch(currentRole) {
      case UserRole.ADMIN:
        return 'bg-gray-100';
      case UserRole.MANAGER:
        return 'bg-blue-50';
      case UserRole.DOCTOR:
        return 'bg-green-50';
      case UserRole.STAFF:
        return 'bg-yellow-50';
      case UserRole.CUSTOMER:
        return 'bg-primary-50';
      default:
        return 'bg-white';
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${getBgColor()}`}>
      <Navbar currentRole={currentRole} userName={userName} hasNotifications={hasNotifications} />
      <main className="flex-grow">
        {pageTitle && (
          <div className="bg-white shadow">
            <div className="px-4 sm:px-6 lg:px-8 py-4">
              <h1 className="text-lg md:text-xl font-semibold text-gray-900">
                <span>{pageTitle}</span>
              </h1>
            </div>
          </div>
        )}
        
        <div className={`px-4 sm:px-6 lg:px-8 py-4 ${className}`}>
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Layout; 