import React from 'react';
// import { useAccount, useSwitchChain } from 'wagmi'; // Not needed if we handle in App.jsx
// import { bsc } from 'wagmi/chains';

// Removed useEffect to allow manual control via button click
export const NetworkGuard = ({ children }) => {
  // Directly render children. App.jsx handle the network switch logic now.
  return <>{children}</>;
};
