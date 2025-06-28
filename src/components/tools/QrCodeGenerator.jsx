import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiDownload, FiCopy, FiCheck } = FiIcons;

const QrCodeGenerator = () => {
  const [text, setText] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [size, setSize] = useState(200);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef(null);

  const generateQRCode = () => {
    if (!text.trim()) return;

    // Using QR Server API for simplicity
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}`;
    setQrCodeUrl(qrUrl);
  };

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;

    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = 'qrcode.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Input Section */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <h3 className="text-white font-semibold text-lg mb-4">QR Code Generator</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-white font-medium mb-2">Text or URL</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text, URL, or any data to encode..."
              className="w-full h-24 bg-slate-700/50 border border-slate-600 rounded-lg p-4 text-white text-sm resize-none focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-white font-medium mb-2">Size: {size}px</label>
            <input
              type="range"
              min="100"
              max="500"
              value={size}
              onChange={(e) => setSize(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-slate-400 text-sm mt-1">
              <span>100px</span>
              <span>500px</span>
            </div>
          </div>
          <button
            onClick={generateQRCode}
            disabled={!text.trim()}
            className="w-full px-6 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            Generate QR Code
          </button>
        </div>
      </div>

      {/* QR Code Display */}
      {qrCodeUrl && (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-semibold text-lg">Generated QR Code</h3>
            <div className="flex space-x-3">
              <button
                onClick={copyToClipboard}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
              >
                <SafeIcon icon={copied ? FiCheck : FiCopy} className={copied ? 'text-green-400' : ''} />
                <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy Text'}</span>
              </button>
              <button
                onClick={downloadQRCode}
                className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
              >
                <SafeIcon icon={FiDownload} />
                <span>Download</span>
              </button>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="bg-white p-4 rounded-lg">
              <img
                src={qrCodeUrl}
                alt="Generated QR Code"
                className="block"
                style={{ width: size, height: size }}
              />
            </div>
          </div>
          <div className="mt-4 text-center">
            <p className="text-slate-400 text-sm">
              Scan with any QR code reader or camera app
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default QrCodeGenerator;