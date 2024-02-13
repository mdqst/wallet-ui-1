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

import React, { useEffect } from 'react';

// contexts
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

// utils
import { formatBalance, formatChainAsNum } from '../../utils';

const Dashboard = () => {
  // Accessing wallet data and notification function from context
  const { wallet } = useAuth();
  const { showNotification } = useNotification();

  // Show notification based on wallet status
  useEffect(() => {
    if (wallet.accounts.length > 0) {
      // Show success notification if user is logged in and connected
      showNotification({
        type: 'success',
        message: 'Successfully logged in.',
        options: { position: 'top-center' },
      });
    } else {
      // Show error notification if there's an issue with connection
      showNotification({
        type: 'error',
        message: "Something hasn't worked, please open the developer console and check the logs.",
        options: { position: 'top-center' },
      });
    }
  }, [wallet.accounts.length, showNotification]); // Dependency array
  return (
    <div className="min-h-screen flex items-center justify-center bg-white-600">
      <div className="max-w-md w-full p-6 bg-purple border bg-purple-500 border-gray-300 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-center mb-4">Wallet Details</h2>
        <p>Wallet Accounts: {wallet.accounts[0]} </p> {/* Displaying the latest first account */}
        <p>Wallet Balance: {formatBalance(wallet.balance)}</p> {/* Displaying formatted balance */}
        <p>Numeric Chain ID: {formatChainAsNum(wallet.chainId)}</p> {/* Displaying formatted chain ID */}
      </div>
    </div>
  );
};

export default Dashboard;
