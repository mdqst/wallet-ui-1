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

// routing
import { useNavigate } from 'react-router-dom';

// contexts
import { useAuth } from '../../context/AuthContext';

const Login: React.FC = () => {
  // Extracting necessary values and functions from AuthContext
  const { wallet, hasProvider, isConnecting, connectMetaMask } = useAuth();
  const navigate = useNavigate();

  // Redirect to dashboard if user is already logged in
  useEffect(() => {
    if (hasProvider && wallet.accounts.length > 0) {
      navigate('/dashboard'); // Redirect to '/dashboard' route
    }
  }, [hasProvider, navigate, wallet.accounts.length]); // Dependency array

  const navigateToDashboard = () => {
    navigate('/dashboard'); // Redirect to '/dashboard' route
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-purple-600">
      <div className="max-w-md w-full p-6 bg-white border border-gray-300 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-center mb-4">Login to Wallet UI</h2>
        <h4 className="text-lg font-semibold text-center mb-4">
          Wallet UI app that showcases the usage of Etherspot UI components.
        </h4>
        <p className="text-sm font-normal text-center mb-4">
          Etherspot UI components created using Etherspot Transaction Kit for sending transactions, sending ERC tokens,
          and other Ethereum-related functionalities which are running on blockchain. For styling of all components of
          Etherspot UI, tailwind has been configured.
        </p>
        <div className="pt-2 text-center text-sm font-medium">
          <p> If you want guidance to create your own application, click on below login </p>
        </div>
        {/* Conditionally rendering login button */}
        {window.ethereum?.isMetaMask && wallet.accounts.length < 1 && (
          <button
            disabled={isConnecting}
            onClick={connectMetaMask}
            className="w-full py-4 px-4 mb-4 bg-purple-500 hover:bg-grey-300 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {isConnecting ? 'Connecting...' : 'Login With MetaMask'}
          </button>
        )}
        {/* Conditionally rendering connected MetaMask link  */}
        {hasProvider && wallet.accounts.length > 0 && (
          <button onClick={navigateToDashboard}>Connected to MetaMask</button>
        )}
      </div>
    </div>
  );
};

export default Login;
