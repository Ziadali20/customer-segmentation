import React from "react";
import { motion } from "framer-motion";
import { FiUploadCloud } from "react-icons/fi";

const buttonVariants = {
  hover: { scale: 1.05, transition: { duration: 0.3 } },
  tap: { scale: 0.95 },
};

function FileUploader({ file, handleFileChange, handleUpload, loading, error }) {
  return (
    <motion.div className="file-upload-card" variants={buttonVariants}>
      <div className="file-upload-buttons">
        <motion.button
          className="choose-file-button"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <label className="file-input-label">
            {file ? file.name : "Choose CSV File"}
            <input
              type="file"
              accept=".csv"
              hidden
              onChange={handleFileChange}
            />
          </label>
          <FiUploadCloud />
        </motion.button>
        <motion.button
          className="upload-button"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          onClick={handleUpload}
          disabled={loading}
        >
          {loading ? "Processing..." : "Upload & Analyze"}
        </motion.button>
      </div>
      {error && (
        <motion.div
          className="error-message"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {error}
        </motion.div>
      )}
    </motion.div>
  );
}

export default FileUploader;