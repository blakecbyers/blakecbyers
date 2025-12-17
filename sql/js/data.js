const DB = {
    menu: [
        { id: 1, name: "Espresso", type: "Hot", price: 3.50, caffeine: 65 },
        { id: 2, name: "Cold Brew", type: "Cold", price: 5.00, caffeine: 200 },
        { id: 3, name: "Latte", type: "Hot", price: 4.50, caffeine: 75 },
        { id: 4, name: "Frappe", type: "Cold", price: 6.00, caffeine: 40 },
        { id: 5, name: "Drip", type: "Hot", price: 2.50, caffeine: 120 },
        { id: 6, name: "Matcha", type: "Hot", price: 5.50, caffeine: 30 }
    ],
    customers: [
        { id: 101, name: "Sarah", loyalty_pts: 150, fav_drink: "Latte" },
        { id: 102, name: "Mike", loyalty_pts: 20, fav_drink: "Drip" },
        { id: 103, name: "Jessica", loyalty_pts: 500, fav_drink: "Cold Brew" },
        { id: 104, name: "David", loyalty_pts: 0, fav_drink: "Espresso" }
    ],
    orders: [
        { id: 901, customer_id: 101, item_id: 3, qty: 1 },
        { id: 902, customer_id: 103, item_id: 2, qty: 2 },
        { id: 903, customer_id: 102, item_id: 5, qty: 1 },
        { id: 904, customer_id: 103, item_id: 1, qty: 1 },
        { id: 905, customer_id: 104, item_id: 1, qty: 3 }
    ]
};

const LEVELS = [
    { id: 1, title: "Opening Shift", desc: "Open the menu to see what we are serving today.", task: "Select all columns from the 'menu' table.", hint: "SELECT * FROM menu", xp: 100, check: (d) => d.length === 6 },
    { id: 2, title: "Budget Brews", desc: "The college students are here. Find items under $4.00.", task: "Select from menu where price < 4.", hint: "SELECT * FROM menu WHERE price < 4", xp: 125, check: (d) => d.length === 2 && d.every(r => r.price < 4) },
    { id: 3, title: "The Caffeine Fix", desc: "A customer needs to stay awake for 3 days. Find the strong stuff.", task: "Select name from menu where caffeine > 150.", hint: "SELECT name FROM menu WHERE caffeine > 150", xp: 150, check: (d) => d.length === 1 && d[0].name === "Cold Brew" },
    { id: 4, title: "VIP List", desc: "Find our most loyal customers (over 100 points).", task: "Select name from customers where loyalty_pts > 100.", hint: "SELECT name FROM customers WHERE loyalty_pts > 100", xp: 175, check: (d) => d.length === 2 },
    { id: 5, title: "Inventory Check", desc: "How many different drinks do we serve?", task: "Get the COUNT(*) from menu.", hint: "SELECT COUNT(*) FROM menu", xp: 200, check: (d) => d[0].count === 6 },
    { id: 6, title: "Daily Revenue", desc: "Calculate the average price of our drinks.", task: "Calculate AVG(price) from menu.", hint: "SELECT AVG(price) FROM menu", xp: 250, check: (d) => Math.floor(d[0].avg_price) === 4 },
    { id: 7, title: "Who Ordered What?", desc: "Link orders to customers to write names on cups.", task: "Join customers and orders on customer_id = id.", hint: "SELECT name FROM customers JOIN orders ON customer_id = id", xp: 300, check: (d) => d.length === 5 && d[0].name },
    { id: 8, title: "Menu Audit", desc: "Sort the menu by price, most expensive first.", task: "Select * from menu order by price DESC.", hint: "SELECT * FROM menu ORDER BY price DESC", xp: 350, check: (d) => d[0].price === 6.00 }
];
window.SQL_LEVELS = SQL_LEVELS;
