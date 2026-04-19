import { useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { X, Download, Printer } from "lucide-react";
export default function QRModal({ restaurant, onClose }) {
  const qrRef = useRef();
  const [tableNumber, setTableNumber] = useState("");

  const menuUrl = `${window.location.origin}/menu/${restaurant.id}`;
  const tableUrl = tableNumber
    ? `${window.location.origin}/menu/${restaurant.id}?table=${tableNumber}`
    : menuUrl;

  function downloadQR() {
    const svg = qrRef.current.querySelector("svg");
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 400, 400);
      ctx.drawImage(img, 0, 0, 400, 400);
      const a = document.createElement("a");
      a.download = `qr-${restaurant.name}.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  }

  function printQR() {
    const svg = qrRef.current.querySelector("svg");
    const svgData = new XMLSerializer().serializeToString(svg);
    const win = window.open("", "_blank");
    win.document.write(`
      <html>
        <head>
          <title>QR - ${restaurant.name}</title>
          <style>
            body { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; font-family: sans-serif; }
            h2 { margin-bottom: 16px; }
            p { margin-top: 12px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <h2>${restaurant.name}</h2>
          ${svgData}
          <p>${tableUrl}</p>
        </body>
      </html>
    `);
    win.document.close();
    win.print();
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="font-bold text-gray-800">QR Code</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        {/* QR */}
        <div className="p-6 flex flex-col items-center gap-4">
          <p className="font-semibold text-gray-800">{restaurant.name}</p>

          <div
            ref={qrRef}
            className="p-4 bg-white border-2 border-gray-100 rounded-2xl"
          >
            <QRCodeSVG
              value={tableUrl}
              size={220}
              bgColor="#ffffff"
              fgColor="#1e3a5f"
              level="H"
              includeMargin={false}
            />
          </div>

          <p className="text-xs text-gray-400 text-center break-all px-2">
            {tableUrl}
          </p>

          {/* Per-table input */}
          <div className="w-full space-y-2 border-t pt-4">
            <p className="text-xs font-medium text-gray-600 text-center">
              Generate per-table QR (optional)
            </p>
            <input
              type="number"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              placeholder="Table number e.g. 5"
              className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-center"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="p-5 border-t flex gap-3">
          <button
            onClick={downloadQR}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-900 text-yellow-400 py-2 rounded-xl text-sm font-semibold hover:bg-blue-800 transition"
          >
            <Download size={16} />
            Download
          </button>
          <button
            onClick={printQR}
            className="flex-1 flex items-center justify-center gap-2 border border-gray-300 text-gray-600 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
          >
            <Printer size={16} />
            Print
          </button>
        </div>
      </div>
    </div>
  );
}
