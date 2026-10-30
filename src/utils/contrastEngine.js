// ஹெக்ஸ் கலரின் பிரைட்னஸைக் கணக்கிடும் அல்காரிதம் (W3C Formula)
export const getContrastFromHex = (hexColor) => {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Perceived Brightness கணக்கீடு
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? '#0f172a' : '#ffffff'; // வெளிச்சம் அதிகம்னா Black, குறைவுனா White
};

// அப்லோட் செய்த இமேஜின் சராசரி பிரைட்னஸைக் கணக்கிடும் முறை (Canvas Sampling)
export const getAverageBrightnessFromImage = (imageSrc) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = imageSrc;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 40; // வேகமான கணக்கீட்டிற்குச் சிறிய கேன்வாஸ்
      canvas.height = 40;
      ctx.drawImage(img, 0, 0, 40, 40);
      
      const imageData = ctx.getImageData(0, 0, 40, 40).data;
      let totalBrightness = 0;
      let count = 0;

      for (let i = 0; i < imageData.length; i += 4) {
        const r = imageData[i];
        const g = imageData[i + 1];
        const b = imageData[i + 2];
        totalBrightness += (r * 299 + g * 587 + b * 114) / 1000;
        count++;
      }

      const avg = totalBrightness / count;
      resolve(avg > 130 ? '#0f172a' : '#ffffff');
    };
    img.onerror = () => resolve('#ffffff');
  });
};