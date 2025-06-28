import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiImage, FiDownload, FiUpload } = FiIcons;

const ImageOptimizer = () => {
  const [originalImage, setOriginalImage] = useState(null);
  const [optimizedImage, setOptimizedImage] = useState(null);
  const [quality, setQuality] = useState(80);
  const [format, setFormat] = useState('jpeg');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setOriginalImage({
          file,
          dataUrl: e.target.result,
          size: file.size
        });
        setOptimizedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const optimizeImage = () => {
    if (!originalImage) return;

    setLoading(true);
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      // Set canvas dimensions
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw image on canvas
      ctx.drawImage(img, 0, 0);

      // Convert to optimized format
      const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
      const optimizedDataUrl = canvas.toDataURL(mimeType, quality / 100);

      // Calculate optimized size (approximate)
      const optimizedSize = Math.round((optimizedDataUrl.length * 3) / 4);

      setOptimizedImage({
        dataUrl: optimizedDataUrl,
        size: optimizedSize,
        savings: ((originalImage.size - optimizedSize) / originalImage.size * 100).toFixed(1)
      });
      setLoading(false);
    };
    img.src = originalImage.dataUrl;
  };

  const downloadOptimized = () => {
    if (!optimizedImage) return;

    const link = document.createElement('a');
    link.href = optimizedImage.dataUrl;
    link.download = `optimized-image.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Upload Section */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <h3 className="text-white font-semibold text-lg mb-4 flex items-center">
          <SafeIcon icon={FiImage} className="mr-2 text-purple-400" />
          Image Optimizer
        </h3>

        <div className="space-y-4">
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-8 border-2 border-dashed border-slate-600 rounded-lg hover:border-purple-500 transition-colors group"
            >
              <SafeIcon icon={FiUpload} className="text-4xl text-slate-400 group-hover:text-purple-400 mx-auto mb-4" />
              <p className="text-slate-400 group-hover:text-white">
                Click to upload an image or drag and drop
              </p>
              <p className="text-slate-500 text-sm mt-2">
                Supports JPEG, PNG, WebP, and other formats
              </p>
            </button>
          </div>

          {originalImage && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white font-medium mb-2">
                  Quality: {quality}%
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={quality}
                  onChange={(e) => setQuality(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-slate-400 text-sm mt-1">
                  <span>10%</span>
                  <span>100%</span>
                </div>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Output Format</label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
                >
                  <option value="jpeg">JPEG</option>
                  <option value="png">PNG</option>
                  <option value="webp">WebP</option>
                </select>
              </div>
            </div>
          )}

          {originalImage && (
            <button
              onClick={optimizeImage}
              disabled={loading}
              className="w-full px-6 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              {loading ? 'Optimizing...' : 'Optimize Image'}
            </button>
          )}
        </div>
      </div>

      {/* Preview Section */}
      {originalImage && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Original */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <h3 className="text-white font-semibold text-lg mb-4">Original</h3>
            <div className="space-y-4">
              <div className="bg-slate-900/50 rounded-lg p-4 flex justify-center">
                <img
                  src={originalImage.dataUrl}
                  alt="Original"
                  className="max-w-full max-h-48 object-contain"
                />
              </div>
              <div className="text-sm text-slate-400">
                <p>Size: {formatFileSize(originalImage.size)}</p>
                <p>Format: {originalImage.file.type}</p>
              </div>
            </div>
          </div>

          {/* Optimized */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold text-lg">Optimized</h3>
              {optimizedImage && (
                <button
                  onClick={downloadOptimized}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                >
                  <SafeIcon icon={FiDownload} />
                  <span>Download</span>
                </button>
              )}
            </div>
            
            {optimizedImage ? (
              <div className="space-y-4">
                <div className="bg-slate-900/50 rounded-lg p-4 flex justify-center">
                  <img
                    src={optimizedImage.dataUrl}
                    alt="Optimized"
                    className="max-w-full max-h-48 object-contain"
                  />
                </div>
                <div className="text-sm text-slate-400">
                  <p>Size: {formatFileSize(optimizedImage.size)}</p>
                  <p>Format: {format.toUpperCase()}</p>
                  <p className="text-green-400">
                    Savings: {optimizedImage.savings}%
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900/50 rounded-lg p-8 text-center">
                <p className="text-slate-400">Click "Optimize Image" to see results</p>
              </div>
            )}
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />

      {/* Tips */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <h3 className="text-white font-semibold text-lg mb-4">Optimization Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-300">
          <div>
            <h4 className="text-white font-medium mb-2">JPEG</h4>
            <ul className="space-y-1">
              <li>• Best for photos and complex images</li>
              <li>• Smaller file sizes with lossy compression</li>
              <li>• Quality 80-90% is usually optimal</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-2">PNG</h4>
            <ul className="space-y-1">
              <li>• Best for graphics with transparency</li>
              <li>• Lossless compression</li>
              <li>• Larger file sizes but perfect quality</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ImageOptimizer;