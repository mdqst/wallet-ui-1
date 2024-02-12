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

import React, { useState, useEffect, createContext, PropsWithChildren, useContext, useCallback } from 'react';

// Libraries
import detectEthereumProvider from '@metamask/detect-provider';
import { useSDK } from '@metamask/sdk-react';
import { PrimeSdk, MetaMaskWalletProvider } from '@etherspot/prime-sdk';

// Define wallet state
interface WalletState {
  accounts: string[];
  balance: string;
  chainId: string;
}

// Define the authentication context data
interface AuthContextData {
  wallet: WalletState; // Wallet state containing accounts, balance, and chainId
  hasProvider: boolean | null; // Whether MetaMask provider is available
  error: boolean; // Whether an error occurred or not
  errorMessage: string; // Error message
  isConnecting: boolean; // Whether MetaMask is currently connecting or not
  primeSdk: PrimeSdk | null; // PrimeSdk instance
  connectMetaMask: () => void; // Function to connect MetaMask
  clearError: () => void; // Function to clear error message
  logout: () => void; // Function to log out
}

// Define the initial disconnected state of the wallet
const disconnectedState: WalletState = { accounts: [], balance: '', chainId: '' };

// Create the authentication context
const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// AuthContextProvider component provides the authentication context to its children
export const AuthContextProvider = ({ children }: PropsWithChildren) => {
  const [hasProvider, setHasProvider] = useState<boolean | null>(null); // Whether MetaMask provider is available
  const [isConnecting, setIsConnecting] = useState(false); // Whether MetaMask is currently connecting
  const [errorMessage, setErrorMessage] = useState(''); // Error message
  const clearError = () => setErrorMessage(''); // Function to clear error message
  const [wallet, setWallet] = useState(disconnectedState); // Wallet state
  const [primeSdk, setPrimeSdk] = useState<PrimeSdk | null>(null); // PrimeSdk instance
  const { sdk } = useSDK(); // MetaMask SDK hook

  // Update wallet state
  const _updateWallet = useCallback(async (providedAccounts?: string[]) => {
    const accounts = providedAccounts || ((await window.ethereum?.request({ method: 'eth_accounts' })) as string[]);

    if (accounts.length === 0) {
      // If there are no accounts, then the user is disconnected
      setWallet(disconnectedState);
      return;
    }

    // Get balance of account
    const balance = (await window.ethereum?.request({
      method: 'eth_getBalance',
      params: [accounts[0], 'latest'],
    })) as string;

    // Get chain ID of account
    const chainId = (await window.ethereum?.request({
      method: 'eth_chainId',
    })) as string;

    // Wallet info setup in wallet state
    setWallet({ accounts, balance, chainId });

    // Initiate PrimeSDK after login withe metamask and setting up PrimeSDK in global state
    const metamaskProvider = await MetaMaskWalletProvider.connect();
    const prime_sdk = new PrimeSdk(metamaskProvider, { chainId: Number(chainId), projectKey: '' });
    setPrimeSdk(prime_sdk);
  }, []);

  const updateWalletAndAccounts = useCallback(() => _updateWallet(), [_updateWallet]);
  const updateWallet = useCallback((accounts: any) => _updateWallet(accounts), [_updateWallet]);

  /**
   * This logic checks if MetaMask is installed. If it is, some event handlers are set up
   * to update the wallet state when MetaMask changes. The function returned by useEffect
   * is used as a "cleanup": it removes the event handlers whenever the MetaMaskProvider
   * is unmounted.
   */
  useEffect(() => {
    const getProvider = async () => {
      try {
        const provider = await detectEthereumProvider({ silent: true });
        setHasProvider(Boolean(provider));

        if (provider) {
          updateWalletAndAccounts();
          window.ethereum?.on('accountsChanged', updateWallet);
          window.ethereum?.on('chainChanged', updateWalletAndAccounts);
        }
      } catch (error) {
        console.error('Error detecting Ethereum provider:', error);
        setErrorMessage('Error detecting Ethereum provider');
      }
    };

    getProvider();

    // Cleanup function to remove event listeners
    return () => {
      try {
        window.ethereum?.removeListener('accountsChanged', updateWallet);
        window.ethereum?.removeListener('chainChanged', updateWalletAndAccounts);
      } catch (error) {
        console.error('Error removing event listeners:', error);
      }
    };
  }, [updateWallet, updateWalletAndAccounts]);

  // Function to connect MetaMask
  const connectMetaMask = async () => {
    setIsConnecting(true);

    try {
      // Request account
      const accounts: any = await window.ethereum?.request({
        method: 'eth_requestAccounts',
      });
      if (accounts.length > 0) {
        // Request for sign verification
        const message = 'Connect + Sign';
        await window.ethereum?.request({
          method: 'personal_sign',
          params: [message, accounts[0]],
        });
        updateWallet(accounts);
      } else {
        console.log('account not found');
      }
    } catch (err: any) {
      console.error('Error connecting MetaMask:', err);
      setErrorMessage(err.message);
    }
    setIsConnecting(false);
  };
  // Function to log out
  const logout = () => {
    try {
      sdk?.terminate();
      setWallet(disconnectedState);
      setIsConnecting(false);
    } catch (error) {
      console.error('Error logging out:', error);
      setErrorMessage('Error logging out');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        wallet,
        hasProvider,
        error: !!errorMessage,
        errorMessage,
        isConnecting,
        primeSdk,
        connectMetaMask,
        clearError,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useMetaMask must be used within a "MetaMaskContextProvider"');
  }
  return context;
};