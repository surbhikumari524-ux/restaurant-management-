// Default Seed Data for TableMaster Pro Restaurant Management

const INITIAL_RESTAURANT_CONFIG = {
  name: "L'Étoile Bistro & Grill",
  tagline: "Modern Artisan Dining & Craft Cocktails",
  address: "428 Grand Boulevard, Metropolitan City",
  phone: "+1 (555) 789-2468",
  taxRate: 0.05, // 5% sales tax
  serviceChargeRate: 0.10, // 10% optional service charge
  currency: "$"
};

const SECTIONS = [
  { id: "all", name: "All Areas", icon: "layout-grid" },
  { id: "main", name: "Main Dining", icon: "utensils" },
  { id: "patio", name: "Garden Patio", icon: "sun" },
  { id: "vip", name: "VIP Lounge", icon: "crown" },
  { id: "bar", name: "Bar & High Tops", icon: "wine" }
];

const STAFF_MEMBERS = [
  { id: "srv-1", name: "Elena Vance", code: "101", role: "Head Waiter" },
  { id: "srv-2", name: "Marcus Chen", code: "102", role: "Captain" },
  { id: "srv-3", name: "Sophia Rossi", code: "103", role: "Senior Server" },
  { id: "srv-4", name: "David Kim", code: "104", role: "Junior Server" },
  { id: "srv-5", name: "Amara Patel", code: "105", role: "Bartender" }
];

const MENU_CATEGORIES = [
  { id: "starters", name: "Starters & Tapas", icon: "cookie" },
  { id: "mains", name: "Entrées & Steaks", icon: "beef" },
  { id: "pizza_pasta", name: "Pizza & Pastas", icon: "pizza" },
  { id: "sides", name: "Sides & Greens", icon: "salad" },
  { id: "desserts", name: "Desserts", icon: "cake" },
  { id: "beverages", name: "Cocktails & Drinks", icon: "glass-water" }
];

const MENU_ITEMS = [
  // Starters
  {
    id: "m-1",
    name: "Truffle Parmesan Fries",
    category: "starters",
    price: 13.50,
    prepTime: "8 min",
    dietary: "Vegetarian",
    desc: "Crispy hand-cut fries, white truffle oil, shaved 24-mo Parmigiano, garlic aioli."
  },
  {
    id: "m-2",
    name: "Bruschetta Burrata Trio",
    category: "starters",
    price: 16.00,
    prepTime: "10 min",
    dietary: "Vegetarian",
    desc: "Heirloom cherry tomatoes, fresh basil, cold-pressed olive oil, creamy Puglia burrata."
  },
  {
    id: "m-3",
    name: "Crispy Calamari Fritti",
    category: "starters",
    price: 18.50,
    prepTime: "12 min",
    dietary: "Seafood",
    desc: "Flash-fried tender squid, lemon caper remoulade, smoked paprika dust."
  },
  {
    id: "m-4",
    name: "Spicy Honey Glazed Wings",
    category: "starters",
    price: 15.00,
    prepTime: "14 min",
    dietary: "Non-Veg",
    desc: "Slow-roasted wings glazed in hot blossom honey, scallions, sesame seeds."
  },

  // Mains
  {
    id: "m-5",
    name: "Prime Angus Ribeye 12oz",
    category: "mains",
    price: 44.00,
    prepTime: "22 min",
    dietary: "Chef Special",
    desc: "Dry-aged 35 days, rosemary garlic butter, charred asparagus, red wine demi-glace."
  },
  {
    id: "m-6",
    name: "Pan-Seared Atlantic Salmon",
    category: "mains",
    price: 34.50,
    prepTime: "18 min",
    dietary: "Gluten-Free",
    desc: "Crispy skin salmon, cauliflower silk puree, lemon beurre blanc, charred broccolini."
  },
  {
    id: "m-7",
    name: "Wild Mushroom Risotto",
    category: "mains",
    price: 27.00,
    prepTime: "16 min",
    dietary: "Vegetarian",
    desc: "Arborio rice, porcini & morel broth, aged taleggio cheese, fresh thyme, shaved truffles."
  },
  {
    id: "m-8",
    name: "French Roasted Herb Chicken",
    category: "mains",
    price: 29.50,
    prepTime: "20 min",
    dietary: "Gluten-Free",
    desc: "Sous-vide half chicken, roasted shallots, creamy dijon jus, potato mousseline."
  },

  // Pizza & Pastas
  {
    id: "m-9",
    name: "Margherita D.O.P. Pizza",
    category: "pizza_pasta",
    price: 21.00,
    prepTime: "12 min",
    dietary: "Vegetarian",
    desc: "San Marzano tomatoes, fior di latte mozzarella, fresh sweet basil, evoo."
  },
  {
    id: "m-10",
    name: "Diavola Pepperoni & Hot Honey",
    category: "pizza_pasta",
    price: 24.00,
    prepTime: "14 min",
    dietary: "Popular",
    desc: "Artisan spicy salami, chili flakes, mozzarella, finished with spicy calabrian honey."
  },
  {
    id: "m-11",
    name: "Handmade Tagliatelle Bolognese",
    category: "pizza_pasta",
    price: 26.50,
    prepTime: "15 min",
    dietary: "Classic",
    desc: "Fresh egg tagliatelle, 6-hour slow braised beef & pork ragù, Parmigiano-Reggiano."
  },

  // Sides & Greens
  {
    id: "m-12",
    name: "Baby Gem Caesar Salad",
    category: "sides",
    price: 14.00,
    prepTime: "8 min",
    dietary: "Salad",
    desc: "Crisp romaine hearts, focaccia croutons, white anchovy dressing, shaved pecorino."
  },
  {
    id: "m-13",
    name: "Charred Garlic Broccolini",
    category: "sides",
    price: 11.50,
    prepTime: "7 min",
    dietary: "Vegan",
    desc: "Toasted sliced almonds, chili crisp, grilled lemon wedge."
  },

  // Desserts
  {
    id: "m-14",
    name: "Classic Venetian Tiramisu",
    category: "desserts",
    price: 13.00,
    prepTime: "5 min",
    dietary: "Vegetarian",
    desc: "Espresso-soaked savoiardi, mascarpone cream, Valrhona dark cocoa powder."
  },
  {
    id: "m-15",
    name: "Warm Molten Dark Lava Cake",
    category: "desserts",
    price: 14.50,
    prepTime: "10 min",
    dietary: "Vegetarian",
    desc: "Guanaja chocolate center, Madagascar vanilla bean gelato, raspberry coulis."
  },

  // Beverages
  {
    id: "m-16",
    name: "Smoked Old Fashioned",
    category: "beverages",
    price: 17.00,
    prepTime: "5 min",
    dietary: "Cocktail",
    desc: "Woodford Reserve Bourbon, demerara syrup, angostura bitters, smoked with cherry wood."
  },
  {
    id: "m-17",
    name: "Sparkling Aperol Spritz",
    category: "beverages",
    price: 15.00,
    prepTime: "4 min",
    dietary: "Cocktail",
    desc: "Prosecco DOC, Aperol, splash of club soda, fresh orange slice, castelvetrano olive."
  },
  {
    id: "m-18",
    name: "Espresso Velvet Martini",
    category: "beverages",
    price: 16.50,
    prepTime: "5 min",
    dietary: "Cocktail",
    desc: "Ketel One Vodka, fresh espresso shot, coffee liqueur, creamy foam top."
  },
  {
    id: "m-19",
    name: "Artisan Mint Lemonade (Mocktail)",
    category: "beverages",
    price: 8.50,
    prepTime: "3 min",
    dietary: "Non-Alcoholic",
    desc: "Fresh squeezed Meyer lemons, crushed garden mint, agave nectar, sparkling water."
  }
];

const INITIAL_TABLES = [
  // Main Dining Hall
  {
    id: "T1",
    name: "Table 1",
    section: "main",
    shape: "square",
    capacity: 2,
    status: "occupied", // available | occupied | reserved | billing | cleaning
    currentGuest: {
      name: "Arthur Dent",
      partySize: 2,
      phone: "+1 555-0199",
      seatedAt: new Date(Date.now() - 42 * 60 * 1000).toISOString(), // 42 mins ago
      server: "Elena Vance",
      notes: "Celebrating anniversary"
    },
    orders: [
      { id: "o-1", itemId: "m-1", name: "Truffle Parmesan Fries", price: 13.50, qty: 1, note: "Extra crispy", status: "served" },
      { id: "o-2", itemId: "m-5", name: "Prime Angus Ribeye 12oz", price: 44.00, qty: 1, note: "Medium rare", status: "served" },
      { id: "o-3", itemId: "m-6", name: "Pan-Seared Atlantic Salmon", price: 34.50, qty: 1, note: "", status: "served" },
      { id: "o-4", itemId: "m-16", name: "Smoked Old Fashioned", price: 17.00, qty: 2, note: "", status: "served" }
    ]
  },
  {
    id: "T2",
    name: "Table 2",
    section: "main",
    shape: "square",
    capacity: 2,
    status: "available",
    currentGuest: null,
    orders: []
  },
  {
    id: "T3",
    name: "Table 3",
    section: "main",
    shape: "rectangle",
    capacity: 4,
    status: "billing",
    currentGuest: {
      name: "Olivia Wilde",
      partySize: 3,
      phone: "+1 555-8821",
      seatedAt: new Date(Date.now() - 75 * 60 * 1000).toISOString(), // 75 mins ago
      server: "Marcus Chen",
      notes: "Asked for bill"
    },
    orders: [
      { id: "o-5", itemId: "m-2", name: "Bruschetta Burrata Trio", price: 16.00, qty: 1, note: "", status: "served" },
      { id: "o-6", itemId: "m-10", name: "Diavola Pepperoni & Hot Honey", price: 24.00, qty: 2, note: "Extra honey", status: "served" },
      { id: "o-7", itemId: "m-14", name: "Classic Venetian Tiramisu", price: 13.00, qty: 2, note: "", status: "served" },
      { id: "o-8", itemId: "m-17", name: "Sparkling Aperol Spritz", price: 15.00, qty: 3, note: "", status: "served" }
    ]
  },
  {
    id: "T4",
    name: "Table 4",
    section: "main",
    shape: "rectangle",
    capacity: 4,
    status: "available",
    currentGuest: null,
    orders: []
  },
  {
    id: "T5",
    name: "Table 5",
    section: "main",
    shape: "rectangle",
    capacity: 6,
    status: "reserved",
    reservationInfo: {
      guestName: "Dr. Gregory House",
      partySize: 5,
      time: "8:00 PM",
      phone: "+1 555-4321",
      notes: "Birthday group. Needs quiet corner."
    },
    currentGuest: null,
    orders: []
  },
  {
    id: "T6",
    name: "Table 6",
    section: "main",
    shape: "rectangle",
    capacity: 6,
    status: "cleaning",
    currentGuest: null,
    orders: []
  },
  {
    id: "T7",
    name: "Table 7",
    section: "main",
    shape: "round",
    capacity: 4,
    status: "occupied",
    currentGuest: {
      name: "Hannah Abbott",
      partySize: 4,
      phone: "+1 555-9012",
      seatedAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
      server: "Sophia Rossi",
      notes: "Nut allergy on table"
    },
    orders: [
      { id: "o-9", itemId: "m-9", name: "Margherita D.O.P. Pizza", price: 21.00, qty: 2, note: "Nut allergy!", status: "preparing" },
      { id: "o-10", itemId: "m-11", name: "Handmade Tagliatelle Bolognese", price: 26.50, qty: 2, note: "", status: "preparing" },
      { id: "o-11", itemId: "m-19", name: "Artisan Mint Lemonade (Mocktail)", price: 8.50, qty: 4, note: "", status: "served" }
    ]
  },
  {
    id: "T8",
    name: "Table 8",
    section: "main",
    shape: "round",
    capacity: 4,
    status: "available",
    currentGuest: null,
    orders: []
  },

  // Garden Patio
  {
    id: "P1",
    name: "Patio 1",
    section: "patio",
    shape: "round",
    capacity: 2,
    status: "occupied",
    currentGuest: {
      name: "Miles Morales",
      partySize: 2,
      phone: "+1 555-3312",
      seatedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      server: "David Kim",
      notes: "Outdoor heaters requested"
    },
    orders: [
      { id: "o-12", itemId: "m-3", name: "Crispy Calamari Fritti", price: 18.50, qty: 1, note: "", status: "served" },
      { id: "o-13", itemId: "m-7", name: "Wild Mushroom Risotto", price: 27.00, qty: 1, note: "", status: "preparing" },
      { id: "o-14", itemId: "m-18", name: "Espresso Velvet Martini", price: 16.50, qty: 2, note: "", status: "served" }
    ]
  },
  {
    id: "P2",
    name: "Patio 2",
    section: "patio",
    shape: "round",
    capacity: 2,
    status: "available",
    currentGuest: null,
    orders: []
  },
  {
    id: "P3",
    name: "Patio 3",
    section: "patio",
    shape: "rectangle",
    capacity: 4,
    status: "reserved",
    reservationInfo: {
      guestName: "Clara Oswald",
      partySize: 4,
      time: "8:30 PM",
      phone: "+1 555-7766",
      notes: "Patio preference, high chair for toddler"
    },
    currentGuest: null,
    orders: []
  },
  {
    id: "P4",
    name: "Patio 4",
    section: "patio",
    shape: "rectangle",
    capacity: 6,
    status: "available",
    currentGuest: null,
    orders: []
  },

  // VIP Lounge
  {
    id: "VIP1",
    name: "VIP Suite Gold",
    section: "vip",
    shape: "booth",
    capacity: 8,
    status: "occupied",
    currentGuest: {
      name: "Lady Catherine De Bourgh",
      partySize: 6,
      phone: "+1 555-9999",
      seatedAt: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
      server: "Marcus Chen",
      notes: "VIP Client - Complimentary sparkling water"
    },
    orders: [
      { id: "o-15", itemId: "m-5", name: "Prime Angus Ribeye 12oz", price: 44.00, qty: 4, note: "2 Medium, 2 Medium-Well", status: "served" },
      { id: "o-16", itemId: "m-8", name: "French Roasted Herb Chicken", price: 29.50, qty: 2, note: "", status: "served" },
      { id: "o-17", itemId: "m-16", name: "Smoked Old Fashioned", price: 17.00, qty: 6, note: "", status: "served" },
      { id: "o-18", itemId: "m-15", name: "Warm Molten Dark Lava Cake", price: 14.50, qty: 4, note: "", status: "served" }
    ]
  },
  {
    id: "VIP2",
    name: "VIP Suite Platinum",
    section: "vip",
    shape: "booth",
    capacity: 8,
    status: "reserved",
    reservationInfo: {
      guestName: "Bruce Wayne",
      partySize: 6,
      time: "9:00 PM",
      phone: "+1 555-1000",
      notes: "Private security discreet seating"
    },
    currentGuest: null,
    orders: []
  },

  // Bar Area
  {
    id: "B1",
    name: "Bar Stool 1-2",
    section: "bar",
    shape: "bar",
    capacity: 2,
    status: "occupied",
    currentGuest: {
      name: "James Bond",
      partySize: 1,
      phone: "+1 555-0007",
      seatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      server: "Amara Patel",
      notes: "Cocktails only"
    },
    orders: [
      { id: "o-19", itemId: "m-16", name: "Smoked Old Fashioned", price: 17.00, qty: 1, note: "Shaken, not stirred", status: "served" },
      { id: "o-20", itemId: "m-1", name: "Truffle Parmesan Fries", price: 13.50, qty: 1, note: "", status: "served" }
    ]
  },
  {
    id: "B2",
    name: "Bar Stool 3-4",
    section: "bar",
    shape: "bar",
    capacity: 2,
    status: "available",
    currentGuest: null,
    orders: []
  },
  {
    id: "B3",
    name: "Bar High Top A",
    section: "bar",
    shape: "bar",
    capacity: 4,
    status: "available",
    currentGuest: null,
    orders: []
  },
  {
    id: "B4",
    name: "Bar High Top B",
    section: "bar",
    shape: "bar",
    capacity: 4,
    status: "cleaning",
    currentGuest: null,
    orders: []
  }
];

const INITIAL_RESERVATIONS = [
  {
    id: "res-101",
    guestName: "Dr. Gregory House",
    phone: "+1 (555) 432-1000",
    email: "house@princeton-plains.org",
    partySize: 5,
    date: new Date().toISOString().split("T")[0],
    time: "20:00",
    tableId: "T5",
    section: "main",
    status: "confirmed", // confirmed | seated | cancelled | no-show
    tags: ["Birthday", "Quiet Corner"],
    notes: "Requires wheelchair friendly access to corner."
  },
  {
    id: "res-102",
    guestName: "Clara Oswald",
    phone: "+1 (555) 776-6210",
    email: "clara.o@coalhill.edu",
    partySize: 4,
    date: new Date().toISOString().split("T")[0],
    time: "20:30",
    tableId: "P3",
    section: "patio",
    status: "confirmed",
    tags: ["Patio Lover", "Toddler"],
    notes: "High chair needed, likes candle lit outdoor corner."
  },
  {
    id: "res-103",
    guestName: "Bruce Wayne",
    phone: "+1 (555) 100-0024",
    email: "bruce@wayne-enterprises.com",
    partySize: 6,
    date: new Date().toISOString().split("T")[0],
    time: "21:00",
    tableId: "VIP2",
    section: "vip",
    status: "confirmed",
    tags: ["VIP Elite", "Business Dinner"],
    notes: "Pre-chilled vintage champagne upon arrival."
  },
  {
    id: "res-104",
    guestName: "Sarah Connor",
    phone: "+1 (555) 892-4411",
    email: "s.connor@skydefense.net",
    partySize: 2,
    date: new Date().toISOString().split("T")[0],
    time: "21:30",
    tableId: "T2",
    section: "main",
    status: "confirmed",
    tags: ["Anniversary"],
    notes: "Table near window if possible."
  }
];
