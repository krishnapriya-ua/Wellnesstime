// cropperImage.js
export const getCroppedImg = (imageSrc, croppedAreaPixels,quality=0.7) => {
    const image = new Image();
    image.src = imageSrc;
  
    return new Promise((resolve, reject) => {
      image.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
  
        // Set the canvas size to the crop area
        canvas.width = croppedAreaPixels.width;
        canvas.height = croppedAreaPixels.height;
  
        // Draw the image inside the canvas using the cropped area
        ctx.drawImage(
          image,
          croppedAreaPixels.x,
          croppedAreaPixels.y,
          croppedAreaPixels.width,
          croppedAreaPixels.height,
          0,
          0,
          croppedAreaPixels.width,
          croppedAreaPixels.height
        );
  
        // Get the base64 representation of the cropped image
        const croppedImage = canvas.toDataURL('image/jpeg',quality);
        resolve(croppedImage);
      };
  
      image.onerror = (error) => reject(error);
    });
  };
  