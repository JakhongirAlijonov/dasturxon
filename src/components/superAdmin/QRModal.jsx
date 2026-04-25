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

  function generateCanvas(callback) {
    const canvas = document.createElement("canvas");
    const width = 400;
    const height = tableNumber ? 560 : 520;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    // background
    ctx.fillStyle = "#0F2236";
    ctx.fillRect(0, 0, width, height);

    // gold top border
    ctx.fillStyle = "#C9A84C";
    ctx.fillRect(0, 0, width, 6);

    // gold bottom border
    ctx.fillStyle = "#C9A84C";
    ctx.fillRect(0, height - 6, width, 6);

    // decorative corner dots
    const dots = [
      [20, 20],
      [width - 20, 20],
      [20, height - 20],
      [width - 20, height - 20],
    ];
    dots.forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#C9A84C";
      ctx.fill();
    });

    // restaurant name
    ctx.fillStyle = "#C9A84C";
    ctx.font = "bold 28px serif";
    ctx.textAlign = "center";
    ctx.fillText(restaurant.name, width / 2, 60);

    // thin gold divider line
    ctx.strokeStyle = "#C9A84C";
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.moveTo(40, 75);
    ctx.lineTo(width - 40, 75);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // QR code from SVG
    const svg = qrRef.current.querySelector("svg");
    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    img.onload = () => {
      // white background behind QR
      ctx.fillStyle = "#ffffff";
      ctx.roundRect(75, 90, 250, 250, 12);
      ctx.fill();

      // draw QR
      ctx.drawImage(img, 85, 100, 230, 230);

      // scan me text
      ctx.fillStyle = "#E8C96A";
      ctx.font = "bold 16px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("📷  SCAN ME", width / 2, 370);

      // menu url small text
      ctx.fillStyle = "#C9A84C";
      ctx.globalAlpha = 0.6;
      ctx.font = "11px sans-serif";
      ctx.fillText(menuUrl, width / 2, 395);
      ctx.globalAlpha = 1;

      // table number if present
      if (tableNumber) {
        ctx.fillStyle = "#C9A84C";
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        ctx.moveTo(40, 415);
        ctx.lineTo(width - 40, 415);
        ctx.stroke();
        ctx.globalAlpha = 1;

        ctx.fillStyle = "#ffffff";
        ctx.font = "14px sans-serif";
        ctx.fillText("Table Number", width / 2, 445);

        ctx.fillStyle = "#C9A84C";
        ctx.font = "bold 36px serif";
        ctx.fillText(`№ ${tableNumber}`, width / 2, 490);
      }

      // bottom tagline
      ctx.fillStyle = "#C9A84C";
      ctx.globalAlpha = 0.5;
      ctx.font = "11px sans-serif";
      ctx.fillText(
        "Dasturxon • Digital Menu",
        width / 2,
        tableNumber ? 535 : 490,
      );
      ctx.globalAlpha = 1;

      callback(canvas);
    };
    img.src =
      "data:image/svg+xml;base64," +
      btoa(unescape(encodeURIComponent(svgData)));
  }

  function downloadQR() {
    generateCanvas((canvas) => {
      const a = document.createElement("a");
      a.download = `qr-${restaurant.name}${tableNumber ? `-table${tableNumber}` : ""}.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    });
  }

  function printQR() {
    generateCanvas((canvas) => {
      const win = window.open("", "_blank");
      win.document.write(`
        <html>
          <head>
            <title>QR - ${restaurant.name}</title>
            <style>
              body { margin: 0; display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #f5f5f5; }
              img { max-width: 400px; border-radius: 12px; box-shadow: 0 4px 24px rgba(0,0,0,0.15); }
            </style>
          </head>
          <body>
            <img src="${canvas.toDataURL("image/png")}" />
          </body>
        </html>
      `);
      win.document.close();
      win.print();
    });
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

        {/* Preview card */}
        <div className="p-6 flex flex-col items-center gap-4">
          {/* Styled preview */}
          <div className="bg-lapis-dark rounded-2xl p-5 w-full flex flex-col items-center gap-3 border-2 border-gold/30">
            {/* Gold top line */}
            <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent" />

            {/* Restaurant name */}
            <p className="font-display font-bold text-gold-light text-xl tracking-wide">
              {restaurant.name}
            </p>

            {/* QR */}
            <div ref={qrRef} className="bg-white p-3 rounded-xl">
              <QRCodeSVG
                value={tableUrl}
                size={180}
                bgColor="#ffffff"
                fgColor="#0F2236"
                level="H"
                includeMargin={false}
              />
            </div>

            {/* Scan me */}
            <p className="text-gold-light text-sm font-semibold tracking-widest">
              📷 SCAN ME
            </p>

            {/* Table number */}
            {tableNumber && (
              <>
                <div className="w-full h-px bg-gold/20" />
                <div className="text-center">
                  <p className="text-white/50 text-xs tracking-widest uppercase">
                    Table Number
                  </p>
                  <p className="text-gold font-display font-bold text-3xl">
                    № {tableNumber}
                  </p>
                </div>
              </>
            )}

            {/* Gold bottom line */}
            <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent" />
          </div>

          {/* Table input */}
          <div className="w-full space-y-2">
            <p className="text-xs font-medium text-gray-600 text-center">
              Add table number (optional)
            </p>
            <input
              type="number"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              placeholder="e.g. 5"
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
