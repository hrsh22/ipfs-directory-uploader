"use client"
import { useState } from 'react';
import { NFTStorage } from 'nft.storage';
import dotenv from 'dotenv';

dotenv.config();

export default function UploadDirectory() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadStatus, setUploadStatus] = useState('');
  const [directoryPath,   setDirectoryPath] = useState('');

  const token = process.env.NEXT_PUBLIC_NFT_STORAGE_API;

  const handleFileInputChange = ({ target }) => {
    const { files } = target;
    setSelectedFiles(Array.from(files).map((file) => file));
  };

  // function getFileMimeType(fileType) {
  //   switch (fileType) {
  //     case "jpg":
  //     case "jpeg":
  //       return "image/jpeg";
  //     case "png":
  //       return "image/png";
  //     case "gif":
  //       return "image/gif";
  //     case "json":
  //       return "application/json";
  //     default:
  //       return "application/octet-stream";
  //   }
  // }

  const uploadToIPFS = async (files) => {
    try {
      const client = new NFTStorage({ token });
  
      const fileObjects = files.map((file) => {
        const path = file.webkitRelativePath || file.path || file.name;
        return new File([file], path);
      });
  
      const cid = await client.storeDirectory(fileObjects);
  
      const directoryURI = `https://nftstorage.link/ipfs/${cid}`;
      
      return directoryURI;
    } catch (error) {
      console.error("IPFS upload failed:", error);
      throw error;
    }
  };
  
  
  

  const handleUpload = async () => {
    
    if (selectedFiles.length === 0) {
      console.error('No files selected');
      return;
    }

    console.log('selectedFiles', selectedFiles);

    console.log(`Storing ${selectedFiles.length} file(s)`);
    setUploadStatus('Uploading...');
    setDirectoryPath('waiting for upload to be completed...')
    try {
      const uploadedFiles = await uploadToIPFS(selectedFiles);
      console.log('Uploaded Files:', uploadedFiles);
      setUploadStatus('Upload Successful');
      setDirectoryPath(uploadedFiles);
      setSelectedFiles([]);
    } catch (error) {
      console.error('Upload Failed:', error);
      setUploadStatus('Upload Failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-indigo-200">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-4xl font-bold mb-4 text-center text-pink-600">
          Welcome to the Directory Uploader
        </h1>
        <p className="text-gray-700 mb-6">
          Upload files to nft.storage easily and securely with just a few clicks.
        </p>
        <div className="mb-4 text-center">
          <label
            htmlFor="fileInput"
            className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded cursor-pointer"
          >
            Select Files
            <input
              id="fileInput"
              type="file"
              className="hidden"
              onChange={handleFileInputChange}
              multiple
            />
          </label>
        </div>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
          onClick={handleUpload}
          disabled={selectedFiles.length === 0}
        >
          Upload to nft.storage
        </button>
        {uploadStatus && (
          <div className="mt-6">
            <h2 className="text-lg text-gray-500 font-bold mb-2">Upload Status:</h2>
            <p className={uploadStatus.includes('Failed') ? 'text-red-500' : 'text-green-500'}>{uploadStatus}</p>            
          </div>
        )}
        {directoryPath && (
  <div>
    <h2 className="text-lg text-gray-500 font-bold mb-2">Directory Path:</h2>
    <a
      href={directoryPath}
      className="text-blue-500 break-all"
      target="_blank"
      rel="noopener noreferrer"
    >
      {directoryPath}
    </a>
  </div>
)}

        {selectedFiles.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg text-black font-bold mb-2">Selected Files ({selectedFiles.length}):</h2>
            <ul className="list-disc text-black pl-6">
              {selectedFiles.map((file, index) => (
                <li key={index}>{file.name}</li>
              ))}
            </ul>
          </div>
        )}
        <p className="text-gray-500 text-center mt-4">
          Please ensure to note the CID after uploading.
        </p>
      </div>
    </div>
  );
}
