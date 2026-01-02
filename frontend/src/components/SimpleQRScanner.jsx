import { Html5Qrcode } from "html5-qrcode";
import { useEffect, useRef } from "react";

const SimpleQRScanner = ({ onScanSuccess, onError }) => {
  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    // Create scanner instance ONCE
    html5QrCodeRef.current = new Html5Qrcode("simple-qr-reader");

    const startScanner = async () => {
      try {
        await html5QrCodeRef.current.start(
          { facingMode: "environment" }, // back camera
          {
            fps: 10,
            qrbox: { width: 250, height: 250 }
          },
          (decodedText) => {
            console.log("QR Code:", decodedText);
            onScanSuccess(decodedText);
          },
          (errorMessage) => {
            // Ignore frequent scan errors
            console.debug("Scan attempt:", errorMessage);
          }
        );
      } catch (err) {
        console.error("Camera start error:", err);
        if (onError) onError(err);
      }
    };

    startScanner();

    // Cleanup on unmount
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().then(() => {
          html5QrCodeRef.current.clear();
        }).catch(err => {
          console.error("Cleanup error:", err);
        });
      }
    };
  }, [onScanSuccess, onError]);

  return (
    <div>
      {/* Always render the div, never conditionally */}
      <div id="simple-qr-reader" style={{ width: "300px", margin: "0 auto" }} />
    </div>
  );
};

export default SimpleQRScanner;

export default SimpleQRScanner;