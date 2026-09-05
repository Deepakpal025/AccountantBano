# Accountant Bano — Simple PDF Store

Simple static website made with HTML + CSS + Vanilla JavaScript.

## Run locally

Open `index.html` directly, or use any simple local server.

## Vercel

Upload this folder/repository to GitHub and import it into Vercel.
No build command is required for this static version.

## Add your logo

Replace:

`assets/logo.png`

with your logo.

## Add PDF preview images

Put images inside:

`images/`

Then update `image` inside `script.js`.

## Add PDF files

Put preview/download PDF files inside:

`pdf/`

Then update `pdf` inside `script.js`.

## Add a new PDF

Open `script.js` and add another object inside `products`.

Example:

{
  id: 4,
  title: "My New PDF",
  description: "Short description",
  price: 99,
  oldPrice: 199,
  category: "Accounting",
  image: "images/my-pdf.jpg",
  pdf: "pdf/my-pdf.pdf",
  paymentLink: "https://your-payment-link.com",
  badge: "NEW",
  pages: "100+ Pages",
  language: "Hindi"
}

## WhatsApp number

At the top of `script.js`, replace:

const WHATSAPP_NUMBER = "91XXXXXXXXXX";

with your WhatsApp number including country code.

## Email

The email is currently:

rupaiyaguruji@gmail.com

Change CONTACT_EMAIL if needed.

## Important

Replace all demo payment links with your real payment links before publishing.
