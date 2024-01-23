import { useEffect, useState } from 'react';
import Cropper from 'cropperjs';
//  import ReactCrop from 'react-image-crop'
import '../cropperjs/cropper'
import '../cropperjs/cropper.css'
function App() {
  const [cropImage,serCropImage]=useState(null)
  useEffect(() => { 
    chrome.runtime.sendMessage({ event: 'Capture Screenshot' }, function (response) {
      const img = new Image();
      img.src = response.dataUrl;
      img.onload = function () {
        img.style.width = '98vw';
      };
      document.body.appendChild(img);

      const link = document.createElement('a');
      link.download = 'download';
      link.href = response.dataUrl;
      const download = new Image();
      download.src = 'Download.png';
      download.className = 'download';
      link.appendChild(download);
      document.body.appendChild(link);

      const crop = new Image();
      crop.src = 'crop.png';
      crop.className = 'crop';
      const setCropper = document.createElement('p');
      setCropper.appendChild(crop);
      document.body.appendChild(setCropper);

      crop.addEventListener('click', function () {
        const cropper = new Cropper(img, {
          aspectRatio: 1.7777777777777777,
          viewMode: 3,
          crop: function (event) {
            console.log(event.detail);
            const croppedCanvas = cropper.getCroppedCanvas({ width: event.detail.width });
            const croppedImage = croppedCanvas.toDataURL('image/png');

            // Store cropped image in IndexedDB
            saveToIndexedDB(croppedImage);

            const button = document.createElement('button');
            button.innerHTML = 'Save Crop';

            button.addEventListener('click', function () {
              const downloadLink = document.createElement('a');
              downloadLink.download = 'cropped_image.png';
              downloadLink.href = croppedImage;
              document.body.appendChild(downloadLink);
              downloadLink.click();
              document.body.removeChild(downloadLink);
            });

            document.body.appendChild(button);
          },
        });

        console.log(cropper);
      });
    });
  }, []);

  function saveToIndexedDB(croppedImage) {
    const request = indexedDB.open('CroppedImagesDatabase', 1);

    request.onupgradeneeded = function (event) {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('croppedImages')) {
        db.createObjectStore('croppedImages', { autoIncrement: true });
      }
    };

    request.onsuccess = function (event) {
      const db = event.target.result;
      const transaction = db.transaction(['croppedImages'], 'readwrite');
      const objectStore = transaction.objectStore('croppedImages');
      const addRequest = objectStore.add(croppedImage);

      addRequest.onsuccess = function () {
        console.log('Cropped image added to IndexedDB');
      };

      addRequest.onerror = function (error) {
        console.error('Error adding cropped image to IndexedDB:', error);
      };

      transaction.oncomplete = function () {
        db.close();
      };
    };

    request.onerror = function (event) {
      console.error('Error opening IndexedDB:', event.target.error);
    };
  }

  return null

  // (
  //   <div>
  //     <ReactCrop >
  //       <img src={} alt="" />
  //     </ReactCrop>
  //   </div>
  // );
}

export default App;
