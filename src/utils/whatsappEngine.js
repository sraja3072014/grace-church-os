/**
 * GraceOS - Direct WhatsApp Notification & Document Sharing Engine
 */

// Sanitize phone number to international format (+91 default)
export function sanitizePhone(phone) {
  if (!phone) return '';
  const digits = phone.replace(/[^0-9]/g, '');
  return digits.length === 10 ? `91${digits}` : digits;
}

// 1. Send 80G Offering / Tithe Receipt via WhatsApp
export function sendReceiptViaWhatsApp(receiptData, churchName = 'Grace Cathedral Church') {
  const phone = sanitizePhone(receiptData.phone || receiptData.contactPhone);
  if (!phone) {
    alert('Member phone number is missing.');
    return;
  }

  const message = encodeURIComponent(
`🕊️ *${churchName.toUpperCase()}* 🕊️
*Official 80G Contribution Receipt Confirmation*
----------------------------------------
Receipt No   : *${receiptData.id}*
Donor Name   : *${receiptData.member}*
Category     : ${receiptData.category}
Amount Paid  : *₹ ${Number(receiptData.amount).toLocaleString()}*
Date         : ${receiptData.date}
Payment Mode : ${receiptData.mode || 'UPI / Bank'}
${receiptData.panNumber ? `PAN Number   : ${receiptData.panNumber}\n` : ''}----------------------------------------
_"Each of you should give what you have decided in your heart to give, for God loves a cheerful giver." - 2 Corinthians 9:7_

Thank you warmly for your faithful support to the ministry of God's church!`
  );

  window.open(`https://web.whatsapp.com/send?phone=${phone}&text=${message}`, '_blank');
}

// 2. Send Birthday and Wedding Anniversary Greetings
export function sendBirthdayWishes(memberData, churchName = 'Grace Cathedral Church') {
  const phone = sanitizePhone(memberData.phone);
  if (!phone) return;

  const message = encodeURIComponent(
`🎉 *Happy Birthday & Blessed Wishes!* 🎉
Dear *${memberData.name}*,

On behalf of the Pastor and the entire church family at _${churchName}_, we wish you a joyous and spirit-filled birthday!

_"The Lord bless you and keep you; the Lord make his face shine on you and be gracious to you." - Numbers 6:24-25_

May God's favor, peace, and abundance guide you throughout this new year of life! Amen. ✝️`
  );

  window.open(`https://web.whatsapp.com/send?phone=${phone}&text=${message}`, '_blank');
}

// 3. Share Urgent Prayer Burdens to WhatsApp Group
export function shareCriticalPrayerBurdens(prayerItem, churchName = 'Grace Cathedral Church') {
  const message = encodeURIComponent(
`🚨 *URGENT PRAYER REQUEST* 🚨
Church: *${churchName}*
----------------------------------------
Requester : *${prayerItem.seekerName || prayerItem.requester || 'Church Member'}*
Prayer Need: *${prayerItem.title || prayerItem.category}*
Details   : _"${prayerItem.description || prayerItem.request}"_
Priority  : 🔴 CRITICAL INTERCESSION
----------------------------------------
We warmly request all intercessory prayer warriors to urgently lift this burden in prayer!`
  );

  // Direct WhatsApp share window for quick group sharing
  window.open(`https://api.whatsapp.com/send?text=${message}`, '_blank');
}