# OUTFIT RELOAD — Men’s Clothing Store Prototype

A responsive men-only fashion storefront and separate admin dashboard.

## Demo catalogue
25 sample products across Shirts, Pants, T-Shirts, Watches and Shoes. Each item includes a demo AED price, image, description, available size(s), colour swatches and optional tag. Replace sample data/photos/prices with real inventory before launch.

## Files
- `index.html` — customer storefront (English, Arabic RTL, Bangla language selector)
- `admin.html` — separate admin dashboard
- `catalog.js` — 25 seeded demo products
- `store.js`, `styles.css` — storefront behavior and design
- `admin.js`, `admin.css` — product and order management demo
- `supabase-schema.sql` — starter schema for a future production backend

## Preview
Open `index.html` in a browser. Internet is required for Google Fonts and Unsplash demo images.

## Admin demo
Open `admin.html`; demo password: `admin123`. Add/edit/delete products and manage store settings. Data is saved in this browser’s localStorage only and is not shared across devices.

## Brand details prefilled
- Brand: OUTFIT RELOAD
- Mobile: 01404609228
- WhatsApp checkout: 8801404609228 (assumes Bangladesh country code +880; confirm this is the correct WhatsApp number)
- Facebook: https://www.facebook.com/mehedi.hasan.santo.0615
- TikTok: @mehedihasan0615
- Audience: Men / boys only

## Important
This is still a front-end prototype, not a production-ready store. The demo password is client-side and not secure. Orders/products are local to one browser. Before accepting real customer orders, connect Supabase (or another backend), secure admin authentication, image storage, database policies, server-side order validation and backups. WhatsApp orders open a prefilled message; admin order records in this prototype are stored only on the customer’s browser and are not synchronized to your admin device.
