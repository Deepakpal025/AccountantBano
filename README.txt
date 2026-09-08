=====================================================
ACCOUNTANT BANO WEBSITE — README (Hinglish me)
=====================================================

Yeh website Instagram bio link ke liye hai. Aapko koi bhi
HTML ya CSS edit nahi karni. Bas ek file edit karni hai:

    updates.json

---------------------------------------------------
1) NAYA UPDATE KAISE ADD KAREIN
---------------------------------------------------

updates.json file kholo aur "updates" list ke sabse UPAR
ek naya block add karo (comma lagana mat bhoolna):

{
  "title": "Naya Update Ka Title",
  "description": "Chhota description likho.",
  "image": "images/naya-file.jpg",
  "link": "files/naya-file.pdf",
  "button": "Download Notes",
  "category": "Tally",
  "date": "08 September 2026",
  "new": true,
  "pinned": false
}

Bas save karo aur website upload/refresh karo — naya card
apne aap show ho jayega. Naya update hamesha list ke sabse
upar rakhein, wahi sabse pehle dikhega.

---------------------------------------------------
2) IMAGE KAHA PASTE KAREIN
---------------------------------------------------

"images" folder ke andar apni image paste karo.
Example: images/gst-notes.jpg

Phir updates.json me:
"image": "images/gst-notes.jpg"

Agar image nahi hai to bas likh do:
"image": ""

Website apne aap default icon dikha degi.

---------------------------------------------------
3) PDF KAHA PASTE KAREIN
---------------------------------------------------

"files" folder ke andar PDF paste karo.
Example: files/tally-notes.pdf

Phir updates.json me:
"link": "files/tally-notes.pdf"

---------------------------------------------------
4) updates.json ME ENTRY KAISE ADD KAREIN (SUMMARY)
---------------------------------------------------

Har field ka matlab:

- title       : Card ka heading
- description : Chhota sa description
- image       : images/ folder ka path (ya "" agar nahi hai)
- link        : PDF, Telegram, YouTube ya kisi bhi website ka link
- button      : Button par kya likha dikhega (e.g. "Download Notes")
- category    : Tally / GST / TDS / Excel / Notes / Course / Community / Important
- date        : Update ki date, jo card par dikhegi
- new         : true likhoge to "NEW" badge dikhega
- pinned      : true likhoge to card sabse upar "📌 Important" ke sath pin ho jayega

---------------------------------------------------
5) TELEGRAM LINK KAISE ADD KAREIN
---------------------------------------------------

script.js file kholo, sabse upar CONFIG milega:

const CONFIG = {
  instagram: "https://instagram.com/YOUR-USERNAME",
  telegram: "https://t.me/YOUR-LINK",
  youtube: "https://youtube.com/@YOUR-CHANNEL",
  whatsapp: "https://wa.me/91XXXXXXXXXX",
  websiteName: "Accountant Bano"
};

"telegram" ke aage apna real Telegram link paste karo aur
save kar do.

---------------------------------------------------
6) INSTAGRAM LINK KAISE CHANGE KAREIN
---------------------------------------------------

Same CONFIG block me, "instagram" ke aage apna Instagram
profile link daal do. YouTube aur WhatsApp bhi isi tarah
change hote hain.

---------------------------------------------------
7) GITHUB PAGES PAR FREE WEBSITE KAISE HOST KAREIN
---------------------------------------------------

1. GitHub par account banao (github.com)
2. Naya repository banao, naam do: accountant-bano
3. Is poore folder (index.html, style.css, script.js,
   updates.json, images/, files/, assets/) ko us repository
   me upload kar do.
4. Repository ke "Settings" me jao -> "Pages" section kholo
5. "Branch" me "main" select karo, folder "/root" rakho,
   Save kar do.
6. 1-2 minute me aapki website live ho jayegi, link kuch
   aisa hoga:
   https://your-username.github.io/accountant-bano/
7. Yahi link apne Instagram bio me daal do.

---------------------------------------------------
8) CUSTOM DOMAIN BAAD ME KAISE CONNECT KAREIN
---------------------------------------------------

1. Koi domain kharido (e.g. GoDaddy, Namecheap, Hostinger)
2. Domain ke DNS settings me jao aur ek "CNAME" record add
   karo jo aapke domain ko:
   your-username.github.io
   par point kare.
3. GitHub repository ke "Settings -> Pages" me "Custom domain"
   field me apna domain likh do (e.g. accountantbano.com)
4. Kuch der me domain active ho jayega aur website us par
   khulne lagegi.

=====================================================
Bas itna hi! Naya content dalna ho to sirf updates.json
edit karo — baaki sab automatic hai.
=====================================================
