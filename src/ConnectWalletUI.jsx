import { useEffect, useState } from "react";
import "./connect.css";



export default function ConnectWalletUI({
  onProcess,
  onViewTx,      // 👈 ADD
  txHash,        // 👈 ADD
  isPending,
  isSuccess,
  error,
  amount,
  setAmount,
  targetAddress,
  setTargetAddress,
  clearError
}) {
  const [clicked, setClicked] = useState(false);

  // ✅ Apply theme ONCE (since you removed it from App.jsx)
  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.remove("theme-dark", "theme-light");
    document.documentElement.classList.add(
      prefersDark ? "theme-dark" : "theme-light"
    );
  }, []);

  // ✅ READ theme LIVE (always correct)
  const isDark = document.documentElement.classList.contains("theme-dark");

  const USD_PRICE = 1;
  const usdValue =
    amount && !isNaN(amount) ? (Number(amount) * USD_PRICE).toFixed(2) : "0.00";

  const getButtonText = () => {
    if (isPending) return "Processing...";
    return "Next";
  };


  return (
    <div className="page">
      <div className="card">

        {/* <h2 className="title">Send USDT</h2>*/}

        {/* ADDRESS */}
        <label className="label">Address or Domain Name</label>
        <div className="input-row primary">
          <input
            placeholder="Search or Enter"
            value={targetAddress || ''}
            onChange={(e) => setTargetAddress(e.target.value)}
          />

          <span
            className="paste"
            onClick={() =>
              navigator.clipboard.readText().then((t) => {
                console.log("📋 Raw clipboard content:", t);
                setTargetAddress(t);
              })
            }
          >
            Paste
          </span>

          <div className="right-icons">
           <svg xmlns="http://www.w3.org/2000/svg"
     width="24"
     height="24"
     viewBox="0 0 24 24"
     stroke="#1D4ED8"
     stroke-width="2.3"
     className="contact-icon"
     fill="none"

     stroke-linecap="round"
     stroke-linejoin="round">
      
  <rect x="6" y="4" width="14" height="16" rx="2"/>

  <line x1="4" y1="8"  x2="6" y2="8"/>
  <line x1="4" y1="12" x2="6" y2="12"/>
  <line x1="4" y1="16" x2="6" y2="16"/>

  <line x1="9" y1="9"  x2="17" y2="9"/>
  <line x1="9" y1="12" x2="17" y2="12"/>

</svg>

            {/* QR icon */}
            <svg xmlns="http://www.w3.org/2000/svg"
     width="24"
     height="24"
     viewBox="0 0 24 24"
     fill="none"
     stroke="#22c55e"
     className="qr-icon"
     stroke-width="2.5"
     stroke-linecap="round"
     stroke-linejoin="round">

  <path d="M4 8V6a2 2 0 0 1 2-2h2"/>

  <path d="M16 4h2a2 2 0 0 1 2 2v2"/>

  <path d="M20 16v2a2 2 0 0 1-2 2h-2"/>

  <path d="M8 20H6a2 2 0 0 1-2-2v-2"/>

  <line x1="5" y1="12" x2="19" y2="12"/>

</svg>
          </div>
        </div>
          {/* DESTINATION NETWORK */}
        <label className="label">Destination network</label>
        <div className="network-row">
          <div className="network-left">
          <div className="eth-circle">
  <img
    src={isDark ? "/images/eth.png" : "/images/eth.svg"}
    alt="Ethereum"
    className="eth-icon"
  />
</div>

            <span>Ethereum</span>
          </div>
          <img
            className="network-arrow"
            src="/images/arrow-icon.png"
            alt="arrow"
          />

        </div>
        {/* AMOUNT */}
        <label className="label">Amount</label>
        <div className="input-row amount-row">
          <input
            type="number"
            placeholder="USDC Amount"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              clearError(); // 🔥 clears error while typing
            }}
            onFocus={() => {
              clearError(); // 🔥 clears error on click
            }}
          />



          <span className="unit">USDT</span>
          <span className="max" onClick={() => setAmount('1000')}>Max</span>
        </div>

        {/* ESTIMATE / ERROR */}
        {error?.message === "Not enough balance" ? (
          <p
            className="estimate"
            style={{ color: "red" }}
          >
            Not enough balance
          </p>
        ) : (
          <p className="estimate">≈ ${usdValue}</p>
        )}
        {/* ACTION AREA (Next → Success replacement) */}
        {/* ACTION AREA (Next → Success replacement) */}
        {isSuccess ? (
          <div
            className={`connect-btn ${isDark ? "dark" : "light"
              } success`}
          >
            Sent Successfully
          </div>
        ) : (
          <button
            className={`connect-btn ${isDark ? "dark" : "light"} active`}
            onClick={() => {
              setClicked(true);
              onProcess();
            }}
            disabled={isPending}
          >
            {isPending ? "Processing..." : "Next"}
          </button>
        )}


      </div>
    </div>
  );
}
