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
    const W = 420;
    const H = 620;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");

    // --- background ---
    ctx.fillStyle = "#0F2236";
    ctx.fillRect(0, 0, W, H);

    // --- gold border frame ---
    ctx.strokeStyle = "#C9A84C";
    ctx.lineWidth = 3;
    ctx.strokeRect(12, 12, W - 24, H - 24);

    // --- corner ornaments ---
    const corners = [
      [12, 12],
      [W - 12, 12],
      [12, H - 12],
      [W - 12, H - 12],
    ];
    corners.forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fillStyle = "#C9A84C";
      ctx.fill();
    });

    // --- restaurant name ---
    ctx.fillStyle = "#E8C96A";
    ctx.font = "bold 32px serif";
    ctx.textAlign = "center";
    ctx.fillText(restaurant.name, W / 2, 70);

    // --- "MENU" label ---
    ctx.fillStyle = "#ffffff";
    ctx.font = "13px sans-serif";
    ctx.letterSpacing = "6px";
    ctx.fillText("M E N U", W / 2, 100);

    // --- gold divider ---
    ctx.strokeStyle = "#C9A84C";
    ctx.globalAlpha = 0.4;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(50, 115);
    ctx.lineTo(W - 50, 115);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // --- QR code ---
    const svg = qrRef.current.querySelector("svg");
    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();

    img.onload = () => {
      // white rounded bg behind QR
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.roundRect(85, 125, 250, 250, 16);
      ctx.fill();

      ctx.drawImage(img, 95, 135, 230, 230);

      // --- scan me ---
      ctx.fillStyle = "#E8C96A";
      ctx.font = "bold 15px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("📷  SCAN TO VIEW MENU", W / 2, 405);

      // --- table number ---
      if (tableNumber) {
        ctx.fillStyle = "#ffffff";
        ctx.font = "12px sans-serif";
        ctx.fillText("Table Number", W / 2, 435);
        ctx.fillStyle = "#E8C96A";
        ctx.font = "bold 34px serif";
        ctx.fillText(`№ ${tableNumber}`, W / 2, 475);
      }

      // --- divider before social ---
      const dividerY = tableNumber ? 500 : 430;
      ctx.strokeStyle = "#C9A84C";
      ctx.globalAlpha = 0.3;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(50, dividerY);
      ctx.lineTo(W - 50, dividerY);
      ctx.stroke();
      ctx.globalAlpha = 1;

      // --- social media ---
      let socialY = dividerY + 35;
      ctx.font = "13px sans-serif";
      ctx.textAlign = "center";

      if (restaurant.instagram) {
        ctx.fillStyle = "#E8C96A";
        ctx.fillText(`📸  @${restaurant.instagram}`, W / 2, socialY);
        socialY += 28;
      }
      if (restaurant.telegram) {
        ctx.fillStyle = "#E8C96A";
        ctx.fillText(`✈️  @${restaurant.telegram}`, W / 2, socialY);
        socialY += 28;
      }
      if (restaurant.phone) {
        ctx.fillStyle = "#ffffff";
        ctx.fillText(`📞  ${restaurant.phone}`, W / 2, socialY);
        socialY += 28;
      }

      // --- bottom tagline ---
      ctx.fillStyle = "#C9A84C";
      ctx.globalAlpha = 0.4;
      ctx.font = "10px sans-serif";
      ctx.fillText("Powered by Dasturxon", W / 2, H - 22);
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
              body { margin:0; display:flex; align-items:center; justify-content:center; min-height:100vh; background:#f5f5f5; }
              img  { max-width:420px; border-radius:16px; box-shadow:0 4px 24px rgba(0,0,0,0.2); }
            </style>
          </head>
          <body><img src="${canvas.toDataURL("image/png")}" /></body>
        </html>
      `);
      win.document.close();
      win.print();
    });
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto">
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

        <div className="p-5 flex flex-col items-center gap-4">
          {/* Preview */}
          <div className="bg-lapis-dark rounded-2xl p-5 w-full flex flex-col items-center gap-3 border-2 border-gold/40">
            {/* Gold border line */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-gold to-transparent" />

            {/* Restaurant name */}
            <p className="font-display font-bold text-gold-light text-2xl tracking-wide text-center">
              {restaurant.name}
            </p>

            {/* Menu label */}
            <p className="text-white/60 text-xs tracking-[6px] uppercase">
              Menu
            </p>

            <div className="w-full h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

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
            <p className="text-gold-light text-xs font-semibold tracking-widest">
              📷 SCAN TO VIEW MENU
            </p>

            {/* Table number */}
            {tableNumber && (
              <div className="text-center">
                <p className="text-white/40 text-xs tracking-widest uppercase">
                  Table Number
                </p>
                <p className="text-gold font-display font-bold text-3xl">
                  № {tableNumber}
                </p>
              </div>
            )}

            <div className="w-full h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

            {/* Social */}
            <div className="flex flex-col items-center gap-1.5 w-full">
              {restaurant.instagram && (
                <p className="text-gold-light text-xs">
                  📸 @{restaurant.instagram}
                </p>
              )}
              {restaurant.telegram && (
                <p className="text-gold-light text-xs">
                  ✈️ @{restaurant.telegram}
                </p>
              )}
              {restaurant.phone && (
                <p className="text-white/70 text-xs">📞 {restaurant.phone}</p>
              )}
              {!restaurant.instagram &&
                !restaurant.telegram &&
                !restaurant.phone && (
                  <p className="text-white/30 text-xs italic">
                    No social media added
                  </p>
                )}
            </div>

            <div className="w-full h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
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
