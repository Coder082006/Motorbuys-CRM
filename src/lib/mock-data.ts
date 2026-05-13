export const bikes = [
  { id: 1, name: "Yamaha NMAX 155", price: 285000, type: "Automatic", brand: "Yamaha", model: "NMAX 155", cc: 155, color: "Matte Black", year: 2024, status: "Available", img: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600", specs: "155cc · ABS · LED" },
  { id: 2, name: "Honda PCX 160", price: 320000, type: "Automatic", brand: "Honda", model: "PCX 160", cc: 160, color: "Pearl White", year: 2024, status: "Available", img: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600", specs: "160cc · Smart Key · ABS" },
  { id: 3, name: "Vespa Primavera", price: 410000, type: "Automatic", brand: "Vespa", model: "Primavera 150", cc: 150, color: "Sky Blue", year: 2024, status: "Reserved", img: "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=600", specs: "150cc · Classic · LED" },
  { id: 4, name: "Honda CB150R", price: 365000, type: "Semi-Automatic", brand: "Honda", model: "CB150R", cc: 150, color: "Red", year: 2024, status: "Available", img: "https://images.unsplash.com/photo-1517846693597-1a0c47b1f7c0?w=600", specs: "150cc · Naked Sport" },
  { id: 5, name: "Yamaha MT-15", price: 395000, type: "Semi-Automatic", brand: "Yamaha", model: "MT-15", cc: 155, color: "Cyan Storm", year: 2024, status: "Available", img: "https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=600", specs: "155cc · VVA · LED" },
  { id: 6, name: "Suzuki GSX-R150", price: 380000, type: "Semi-Automatic", brand: "Suzuki", model: "GSX-R150", cc: 150, color: "Blue", year: 2024, status: "Sold", img: "https://images.unsplash.com/photo-1611241443322-b5c0f2f5f3da?w=600", specs: "150cc · Sport · 6-speed" },
  { id: 7, name: "Royal Enfield Classic 350", price: 525000, type: "Manual", brand: "Royal Enfield", model: "Classic 350", cc: 349, color: "Bronze", year: 2024, status: "Available", img: "https://images.unsplash.com/photo-1558981852-426c6c22a060?w=600", specs: "349cc · Cruiser · Retro" },
  { id: 8, name: "KTM Duke 200", price: 485000, type: "Manual", brand: "KTM", model: "Duke 200", cc: 200, color: "Orange", year: 2024, status: "Available", img: "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=600", specs: "200cc · Streetfighter" },
  { id: 9, name: "Bajaj Pulsar NS200", price: 360000, type: "Manual", brand: "Bajaj", model: "Pulsar NS200", cc: 200, color: "Black", year: 2024, status: "In Service", img: "https://images.unsplash.com/photo-1568708318935-fbe8a83e29db?w=600", specs: "200cc · Liquid Cooled" },
];

export const customers = [
  { id: 1, name: "John Mwangi", phone: "+254 712 345 678", region: "Nairobi", status: "Active", assignedTo: "Peter Otieno" },
  { id: 2, name: "Grace Wanjiku", phone: "+254 722 111 222", region: "Kiambu", status: "Prospect", assignedTo: "Mary Achieng" },
  { id: 3, name: "Samuel Kiprop", phone: "+254 733 999 888", region: "Eldoret", status: "Active", assignedTo: "Peter Otieno" },
  { id: 4, name: "Aisha Hassan", phone: "+254 700 555 444", region: "Mombasa", status: "Inactive", assignedTo: "Mary Achieng" },
  { id: 5, name: "David Kamau", phone: "+254 711 222 333", region: "Nakuru", status: "Prospect", assignedTo: "James Mutua" },
  { id: 6, name: "Linet Atieno", phone: "+254 720 444 555", region: "Kisumu", status: "Active", assignedTo: "Peter Otieno" },
];

export const monthlySales = [
  { month: "Jan", revenue: 4200000, units: 12 },
  { month: "Feb", revenue: 3800000, units: 10 },
  { month: "Mar", revenue: 5100000, units: 15 },
  { month: "Apr", revenue: 4700000, units: 13 },
  { month: "May", revenue: 6200000, units: 18 },
  { month: "Jun", revenue: 5800000, units: 17 },
  { month: "Jul", revenue: 7100000, units: 21 },
  { month: "Aug", revenue: 6500000, units: 19 },
];

export const topBikes = [
  { name: "Yamaha NMAX", value: 28 },
  { name: "Honda PCX", value: 22 },
  { name: "Royal Enfield", value: 16 },
  { name: "KTM Duke", value: 12 },
  { name: "Others", value: 22 },
];

export const recentSales = [
  { id: "S-1042", customer: "John Mwangi", bike: "Yamaha NMAX 155", amount: 285000, date: "2026-05-12" },
  { id: "S-1041", customer: "Aisha Hassan", bike: "Honda PCX 160", amount: 320000, date: "2026-05-11" },
  { id: "S-1040", customer: "Samuel Kiprop", bike: "Royal Enfield 350", amount: 525000, date: "2026-05-10" },
  { id: "S-1039", customer: "Grace Wanjiku", bike: "Yamaha MT-15", amount: 395000, date: "2026-05-09" },
];

export const leads = {
  "Inquiry": [
    { id: 1, customer: "Brian Otieno", phone: "+254 712 000 111", bike: "Yamaha NMAX", sales: "Mary A." },
    { id: 2, customer: "Faith Njeri", phone: "+254 722 333 444", bike: "Honda PCX", sales: "Peter O." },
  ],
  "Showroom Visit": [
    { id: 3, customer: "Kevin Mutua", phone: "+254 733 555 666", bike: "KTM Duke 200", sales: "James M." },
  ],
  "Test Ride": [
    { id: 4, customer: "Lucy Wairimu", phone: "+254 700 777 888", bike: "Vespa Primavera", sales: "Mary A." },
    { id: 5, customer: "Dennis Kimani", phone: "+254 711 999 000", bike: "Royal Enfield", sales: "Peter O." },
  ],
  "Negotiation": [
    { id: 6, customer: "Mercy Achieng", phone: "+254 720 111 222", bike: "Honda CB150R", sales: "James M." },
  ],
  "Closed Won": [
    { id: 7, customer: "John Mwangi", phone: "+254 712 345 678", bike: "Yamaha NMAX 155", sales: "Peter O." },
  ],
  "Closed Lost": [
    { id: 8, customer: "Tom Barasa", phone: "+254 733 222 333", bike: "Suzuki GSX-R150", sales: "Mary A." },
  ],
};

export const loans = [
  { id: 1, customer: "John Mwangi", amount: 285000, monthly: 26500, duration: 12, status: "Active" },
  { id: 2, customer: "Grace Wanjiku", amount: 320000, monthly: 18200, duration: 24, status: "Active" },
  { id: 3, customer: "Samuel Kiprop", amount: 525000, monthly: 24800, duration: 24, status: "Pending" },
  { id: 4, customer: "Aisha Hassan", amount: 395000, monthly: 36500, duration: 12, status: "Approved" },
  { id: 5, customer: "David Kamau", amount: 360000, monthly: 17200, duration: 24, status: "Defaulted" },
  { id: 6, customer: "Linet Atieno", amount: 285000, monthly: 13500, duration: 24, status: "Completed" },
];

export const payments = [
  { id: "MPX-9F2A1", customer: "John Mwangi", amount: 26500, date: "2026-05-10", status: "Success" },
  { id: "MPX-7C3B2", customer: "Grace Wanjiku", amount: 18200, date: "2026-05-09", status: "Success" },
  { id: "MPX-5A1D9", customer: "Aisha Hassan", amount: 36500, date: "2026-05-08", status: "Success" },
  { id: "MPX-2E8F4", customer: "David Kamau", amount: 17200, date: "2026-05-01", status: "Failed" },
];

export const campaigns = [
  { id: 1, title: "Yamaha NMAX Launch", platform: "Facebook", status: "Active", budget: 150000, spent: 92000, leads: 84 },
  { id: 2, title: "Ride Safe August", platform: "Instagram", status: "Active", budget: 80000, spent: 41000, leads: 37 },
  { id: 3, title: "Test Ride Weekend", platform: "Google", status: "Paused", budget: 60000, spent: 60000, leads: 51 },
  { id: 4, title: "Citi FM Drive", platform: "Radio", status: "Completed", budget: 120000, spent: 120000, leads: 28 },
  { id: 5, title: "Coast Billboard", platform: "Billboard", status: "Active", budget: 200000, spent: 75000, leads: 12 },
];

export const smsCampaigns = [
  { id: 1, title: "Eid Promotion", recipients: 1240, status: "Sent", sentAt: "2026-05-08 10:00" },
  { id: 2, title: "New Stock Alert", recipients: 880, status: "Scheduled", sentAt: "2026-05-15 09:00" },
  { id: 3, title: "Service Reminder", recipients: 560, status: "Draft", sentAt: "—" },
];

export const promotions = [
  { id: 1, title: "May Madness", discount: "10% off", start: "2026-05-01", end: "2026-05-31", status: "Active" },
  { id: 2, title: "Free Service Pack", discount: "Free 3 services", start: "2026-04-15", end: "2026-06-15", status: "Active" },
  { id: 3, title: "Trade-in Bonus", discount: "Up to 50K", start: "2026-06-01", end: "2026-06-30", status: "Upcoming" },
];

export const services = [
  { id: 1, customer: "John Mwangi", bike: "Yamaha NMAX 155", type: "Full Service", status: "In Progress", technician: "Eric W.", cost: 8500 },
  { id: 2, customer: "Grace Wanjiku", bike: "Honda PCX 160", type: "Oil Change", status: "Completed", technician: "Joel K.", cost: 2500 },
  { id: 3, customer: "Samuel Kiprop", bike: "Royal Enfield 350", type: "Tyre Replacement", status: "Received", technician: "Eric W.", cost: 14000 },
  { id: 4, customer: "Aisha Hassan", bike: "Honda PCX 160", type: "Brake Service", status: "Awaiting Parts", technician: "Joel K.", cost: 4200 },
];

export const spareParts = [
  { name: "Brake Pad - Yamaha NMAX", part: "BP-NMAX-01", stock: 24, price: 1800 },
  { name: "Engine Oil 10W-40 1L", part: "OIL-10W40", stock: 120, price: 950 },
  { name: "Air Filter Honda PCX", part: "AF-PCX-160", stock: 18, price: 1200 },
  { name: "Spark Plug NGK", part: "SP-NGK-CR8E", stock: 80, price: 650 },
  { name: "Chain Kit KTM Duke", part: "CK-KTM-200", stock: 6, price: 5400 },
];

export const users = [
  { id: 1, name: "Alice Admin", username: "alice", email: "alice@motocrm.co", role: "Admin", phone: "+254 700 000 001", status: "Active" },
  { id: 2, name: "Peter Otieno", username: "peter", email: "peter@motocrm.co", role: "Sales", phone: "+254 700 000 002", status: "Active" },
  { id: 3, name: "Mary Achieng", username: "mary", email: "mary@motocrm.co", role: "Sales", phone: "+254 700 000 003", status: "Active" },
  { id: 4, name: "Daniel Finance", username: "daniel", email: "daniel@motocrm.co", role: "Financing", phone: "+254 700 000 004", status: "Active" },
  { id: 5, name: "Nadia Ads", username: "nadia", email: "nadia@motocrm.co", role: "Advertising", phone: "+254 700 000 005", status: "Active" },
  { id: 6, name: "Brian Marketing", username: "brian", email: "brian@motocrm.co", role: "Marketing", phone: "+254 700 000 006", status: "Inactive" },
  { id: 7, name: "Eric Wanjala", username: "eric", email: "eric@motocrm.co", role: "Service", phone: "+254 700 000 007", status: "Active" },
];

export const formatKES = (n: number) => "KSh " + n.toLocaleString();
