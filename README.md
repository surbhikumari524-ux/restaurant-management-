# 🍽️ TableMaster Pro — Restaurant Management & Live Floor POS System

An interactive, modern, full-featured **Restaurant Management Application** built to streamline floor operations, live table status tracking, walk-in guest seating, reservations, dining orders, kitchen tickets (KOT), and billing settlements.

---

## ✨ Features Included

### 1. 🗺️ Interactive Live Floor Plan & Table Matrix
- **Multiple Dining Zones**:
  - **Main Dining Hall** (Tables 1–8: 2-seater, 4-seater, 6-seater round & rectangular setups)
  - **Garden Patio** (Patio 1–4: outdoor dining tables)
  - **VIP Private Lounge** (VIP Suite Gold & Platinum: 8-seater luxury booths)
  - **Bar & High Tops** (Bar Stools & Cocktail High-Tops)
- **Real-Time Color-Coded Statuses**:
  - 🟢 **Available**: Ready for walk-in or reservation seating
  - 🔴 **Occupied & Dining**: Active party, shows seated guest name, item count, live elapsed timer
  - 🟣 **Bill Due / Payment Pending**: Bill requested, highlighted with alert glow
  - 🔵 **Reserved**: Booked for upcoming guest slot with party details
  - ⚪ **Turnaround / Cleaning**: Table vacated, needs sanitizing before next seating
- **Filter Controls**: Filter by area section, status (available/occupied/reserved/cleaning), and party capacity (2-seater, 4-seater, 6+).

### 2. 🧾 Interactive Table Slide-Over Drawer (Mini POS)
- **Table Overview**: Real-time timer (`data-elapsed-for`), lead guest name, phone, party size, assigned server selector.
- **Menu Catalog & Dish Search**:
  - Browse dishes across Starters, Entrées, Pizzas & Pastas, Sides, Desserts, and Cocktails.
  - Search dish by name or keyword.
  - 1-click add to table order.
- **Order Management**:
  - Quantity controls (`+` / `-`).
  - Item kitchen statuses (*Preparing* / *Served*).
  - Special preparation notes (e.g., "Medium Rare", "Nut allergy!").
- **Financial Breakdown & Bill Calculator**:
  - Live Subtotal calculation.
  - Configurable 5% Sales Tax & 10% Service Charge.
  - Grand Total display.
  - **Send to Kitchen (KOT)**: Dispatches ticket to kitchen expediter.
  - **Print Thermal Receipt**: Displays authentic thermal-style paper receipt ready to print.
  - **Settle Bill & Free Table**: Records closed transaction in audit ledger and switches table to cleaning turnaround.

### 3. 🚶‍♂️ Walk-In Seating Flow ("Quick Seat")
- Dedicated Walk-In Seating modal accessible from top bar or on any available table card.
- Assigns lead guest name, party size, server, and preferences.
- Instantly seats guests and activates table timer.

### 4. 📅 Reservation & Waitlist Manager
- View all confirmed, seated, or cancelled bookings.
- Search bookings by guest name, phone number, or table ID.
- **"+ Book Table" Form**: Schedule date, time slot, guest name, phone, party size, table assignment, and occasion tags (Birthday, Anniversary, VIP, Quiet Corner).
- 1-click **"Seat Party Now"** button: instantly marks booking seated and initializes the table.

### 5. 👨‍🍳 Kitchen Order Ticket (KOT) Expediter Screen
- Live kitchen screen displaying active food orders per table.
- Item checklist with cooking notes and status toggles (*Mark Ready* / *Served*).
- 1-click *"Mark All Served"* expediting button.

### 6. 📊 Real-Time Shift Performance & Revenue Analytics
- Gross Shift Revenue (settled checks + active dining subtotals).
- Number of turned tables.
- Average Check Size calculation.
- Historical audit ledger of all closed transactions with timestamps and server attribution.

### 7. 🔊 Audio Feedback & Tactile UX
- Built-in Web Audio API synthesizer for tactile acoustic feedback:
  - Two-tone welcome chime on seating.
  - Soft blip on adding menu items.
  - Register chime on bill settlement.
  - Toggleable mute button in top navbar.

### 8. 💾 Persistence & Shift Data Export
- All table statuses, orders, reservations, and transactions persist automatically in `localStorage`.
- **Export Shift Data**: Downloads full JSON shift report with one click.
- **Reset Demo Data**: Easily restore original sample dataset at any time.

---

## 🚀 How to Run

### Method 1: Instant Direct Launch (No Installation Required)
Simply double-click [`index.html`](file:///C:/Users/surbh/OneDrive/Desktop/New%20folder/index.html) or open it in any web browser (Chrome, Edge, Firefox, Safari).

### Method 2: Local HTTP Server (Node.js)
```bash
npm start
```
or
```bash
node server.js
```
Then visit: **`http://localhost:3000`** in your browser.

### Method 3: Python Server
```bash
python -m http.server 3000
```

---

## 📁 File Structure

- [`index.html`](file:///C:/Users/surbh/OneDrive/Desktop/New%20folder/index.html) — Complete responsive Single-Page Application interface
- [`app.js`](file:///C:/Users/surbh/OneDrive/Desktop/New%20folder/app.js) — Application state machine, audio synthesizer, DOM controllers, and event bindings
- [`data.js`](file:///C:/Users/surbh/OneDrive/Desktop/New%20folder/data.js) — Default seed data (tables, menu items, reservations, staff)
- [`styles.css`](file:///C:/Users/surbh/OneDrive/Desktop/New%20folder/styles.css) — Custom styles, thermal receipt print styling (`@media print`), animations
- [`server.js`](file:///C:/Users/surbh/OneDrive/Desktop/New%20folder/server.js) — Lightweight zero-dependency Node.js HTTP server
- [`package.json`](file:///C:/Users/surbh/OneDrive/Desktop/New%20folder/package.json) — NPM project metadata and start script
