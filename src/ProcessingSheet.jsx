import { useEffect, useState } from "react";
import "./processing-sheet.css";

export default function ProcessingSheet({
  open,
  onClose,
  txHash,
  isPending,
  isDark
}) {
  const [closing, setClosing] = useState(false);

  // lock background scroll
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [open]);

  if (!open) return null;

  // close with slide animation
  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
    }, 250);
  };

  const openTx = () => {
    if (!txHash) return;
    window.open(`https://etherscan.io/tx/${txHash}`, "_blank");
  };

  return (
    <div className="ps-backdrop" onClick={handleClose}>
      <div
        className={`ps-sheet ${isDark ? "dark" : "light"} ${
          closing ? "closing" : ""
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with close */}
        <div className="ps-header">
          <button className="ps-close" onClick={handleClose}>
            ✕
          </button>
        </div>

        {/* GIF */}
        <div className="ps-gif-wrap">
          <img
            src={
              isDark
                ? "/gifs/processing-dark.gif"
                : "/gifs/processing-light.gif"
            }
            alt="processing"
          />
        </div>

        {/* Text (same in both modes now) */}
        <h2 className="ps-title">Processing…</h2>
        <p className="ps-sub">
          Transaction in progress! Blockchain validation is underway.
          This may take a few minutes.
        </p>

        {/* Action */}
        <button
          className="ps-action"
          onClick={openTx}
          disabled={!txHash}
        >
          Transaction details
        </button>
      </div>
    </div>
  );
}
