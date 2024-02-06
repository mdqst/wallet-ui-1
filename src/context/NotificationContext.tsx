/* MIT License
 *
 * Copyright (c) 2024 Etherspot
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import React, { createContext, useContext, ReactNode } from 'react';

// library
import { toast, ToastOptions, Toaster } from 'react-hot-toast';

// Define types for the notification and its context
type NotificationType = 'info' | 'success' | 'error';

interface Notification {
  type: NotificationType;
  message: string;
  options?: ToastOptions;
}

// Define properties for the NotificationContext
interface NotificationContextProps {
  showNotification: (notification: Notification) => void;
}

// Create a context for notifications
const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

// Create a NotificationProvider component to manage and display notifications
export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Function to display notifications
  const showNotification = ({ type, message, options }: Notification) => {
    // Default options for the notifications
    const defaultOptions: ToastOptions = {
      duration: 3000,
      style: {
        border: '1px solid #713200',
        padding: '16px',
        color: '#713200',
      },
      className: `bg-${type === 'error' ? 'red' : type === 'success' ? 'green' : 'blue'}-500 text-white`,
    };

    // Determine the appropriate toast function based on the notification type
    const toastFunction = type === 'error' ? toast.error : type === 'success' ? toast.success : toast;

    // Display the toast notification with merged options
    toastFunction(message, {
      ...defaultOptions,
      ...options,
    });
  };

  // Provide the NotificationContext with the showNotification function
  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {/* Render the Toaster component from react-hot-toast to display notifications */}
      <Toaster />
    </NotificationContext.Provider>
  );
};

// Custom hook to use the NotificationContext in other components
export const useNotification = () => {
  const context = useContext(NotificationContext);
  // Throw an error if useNotification is not used within a NotificationProvider
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
