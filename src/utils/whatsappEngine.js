/**
 * GraceOS - Direct WhatsApp Notification & Document Sharing Engine
 */

// சர்வதேச வடிவிற்கு போன் நம்பரைச் சீரமைத்தல் (+91 default)
export function sanitizePhone(phone) {
  if (!phone) return '';
  const digits = phone.replace(/[^0-9]/g, '');
  return digits.length === 10 ? `91${digits}` : digits;
}

// 1. 🌟 80G காணிக்கை / தசமபாக ரசீதை WhatsApp-ல் அனுப்புதல்
export function sendReceiptViaWhatsApp(receiptData, churchName = 'Grace Cathedral Church') {
  const phone = sanitizePhone(receiptData.phone || receiptData.contactPhone);
  if (!phone) {
    alert('விசுவாசியின் தொலைபேசி எண் விடுபட்டுள்ளது.');
    return;
  }

  const message = encodeURIComponent(
`🕊️ *${churchName.toUpperCase()}* 🕊️
*அதிகாரப்பூர்வ 80G காணிக்கை ரசீது உறுதிப்படுத்தல்*
----------------------------------------
ரசீது எண் (Receipt No) : *${receiptData.id}*
நன்கொடையாளர் பெயர்    : *${receiptData.member}*
காணிக்கை பிரிவு          : ${receiptData.category}
செலுத்தப்பட்ட தொகை     : *₹ ${Number(receiptData.amount).toLocaleString()}*
தேதி (Date)           : ${receiptData.date}
செலுத்திய முறை         : ${receiptData.mode || 'UPI / Bank'}
${receiptData.panNumber ? `பான் எண் (PAN)        : ${receiptData.panNumber}\n` : ''}----------------------------------------
_"உற்சாகமாய் கொடுக்கிறவனிடத்தில் தேவன் பிரியமாயிருக்கிறார்." - 2 கொரிந்தியர் 9:7_

உங்கள் காணிக்கைக்கும் சபை ஊழிய தாங்குதலுக்கும் மனமார்ந்த நன்றிகள்!`
  );

  window.open(`https://web.whatsapp.com/send?phone=${phone}&text=${message}`, '_blank');
}

// 2. 🌟 பிறந்தநாள் மற்றும் திருமண நாள் வாழ்த்துகள் அனுப்புதல்
export function sendBirthdayWishes(memberData, churchName = 'Grace Cathedral Church') {
  const phone = sanitizePhone(memberData.phone);
  if (!phone) return;

  const message = encodeURIComponent(
`🎉 *இனிய பிறந்தநாள் நல்வாழ்த்துகள்!* 🎉
அன்பிற்குரிய *${memberData.name}*,

_${churchName}_ போதகர் மற்றும் சபை விசுவாசிகள் சார்பாக உங்களுக்கு ஆசீர்வதிக்கப்பட்ட பிறந்தநாள் வாழ்த்துகளைத் தெரிவித்துக் கொள்கிறோம்.

_"கர்த்தர் உன்னை ஆசீர்வதித்து, உன்னைக் காக்கக்கடவர்; கர்த்தர் தம்முடைய முகத்தை உன்மேல் பிரகாசிக்கப்பண்ணி, உன்மேல் கிருபையாயிருக்கக்கடவர்." - எண்ணாகமம் 6:24-25_

இப்புதிய ஆண்டில் கர்த்தருடைய நன்மையும் கிருபையும் உங்களை வழிநடத்துவதாக! ஆமென். ✝️`
  );

  window.open(`https://web.whatsapp.com/send?phone=${phone}&text=${message}`, '_blank');
}

// 3. 🌟 அவசர ஜெபக் குறிப்பை WhatsApp குழுவிற்கு உடனடியாக அனுப்புதல்
export function shareCriticalPrayerBurdens(prayerItem, churchName = 'Grace Cathedral Church') {
  const message = encodeURIComponent(
`🚨 *அவசர ஜெப விண்ணப்பம் (URGENT PRAYER REQUEST)* 🚨
சபை: *${churchName}*
----------------------------------------
விண்ணப்பதாரர் : *${prayerItem.seekerName || prayerItem.requester || 'சபை விசுவாசி'}*
ஜெபத் தேவை    : *${prayerItem.title || prayerItem.category}*
விவரம்        : _"${prayerItem.description || prayerItem.request}"_
முன்னுரிமை     : 🔴 CRITICAL INTERCESSION
----------------------------------------
மத்தியஸ்த ஜெப வீரர்கள் அனைவரும் இந்த விசேஷ தேவைக்காக உடனே பாரத்தோடு ஜெபிக்கும்படி அன்புடன் கேட்டுக்கொள்கிறோம்!`
  );

  // குழுவில் பகிர வசதியாக நேரடி WhatsApp ஷேர் விண்டோ
  window.open(`https://api.whatsapp.com/send?text=${message}`, '_blank');
}