import React, { useState, useEffect, createContext, PropsWithChildren, useContext, useCallback } from 'react';

import detectEthereumProvider from '@metamask/detect-provider';

import { useSDK } from '@metamask/sdk-react';
import { PrimeSdk, MetaMaskWalletProvider } from '@etherspot/prime-sdk';

interface WalletState {
  accounts: string[];
  balance: string;
  chainId: string;
}

interface AuthContextData {
  wallet: WalletState;
  hasProvider: boolean | null;
  error: boolean;
  errorMessage: string;
  isConnecting: boolean;
  primeSdk: PrimeSdk | null;
  connectMetaMask: () => void;
  clearError: () => void;
  logout: () => void;
}

const disconnectedState: WalletState = { accounts: [], balance: '', chainId: '' };

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthContextProvider = ({ children }: PropsWithChildren) => {
  const [hasProvider, setHasProvider] = useState<boolean | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const clearError = () => setErrorMessage('');
  const [wallet, setWallet] = useState(disconnectedState);
  const [primeSdk, setPrimeSdk] = useState<PrimeSdk | null>(null);
  const { sdk } = useSDK();
  // useCallback ensures that you don't uselessly recreate the _updateWallet function on every render
  const _updateWallet = useCallback(async (providedAccounts?: string[]) => {
    const accounts = providedAccounts || ((await window.ethereum?.request({ method: 'eth_accounts' })) as string[]);

    if (accounts.length === 0) {
      // If there are no accounts, then the user is disconnected
      setWallet(disconnectedState);
      return;
    }

    const balance = (await window.ethereum?.request({
      method: 'eth_getBalance',
      params: [accounts[0], 'latest'],
    })) as string;
    const chainId = (await window.ethereum?.request({
      method: 'eth_chainId',
    })) as string;
    setWallet({ accounts, balance, chainId });

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

    return () => {
      try {
        window.ethereum?.removeListener('accountsChanged', updateWallet);
        window.ethereum?.removeListener('chainChanged', updateWalletAndAccounts);
      } catch (error) {
        console.error('Error removing event listeners:', error);
      }
    };
  }, [updateWallet, updateWalletAndAccounts]);

  const connectMetaMask = async () => {
    setIsConnecting(true);

    try {
      const accounts: any = await window.ethereum?.request({
        method: 'eth_requestAccounts',
      });
      if (accounts.length > 0) {
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
