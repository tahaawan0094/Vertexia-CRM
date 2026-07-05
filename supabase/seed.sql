-- ============================================================
-- Vertexia CRM — Seed Data
-- 10 realistic Karachi-based sample leads across varied industries
-- Run AFTER 001_initial_schema.sql and AFTER creating your first admin user
-- ============================================================

-- NOTE: assigned_to is left NULL so any rep can see them on first run
-- Update with a real user UUID if needed

insert into public.leads (
  business_name, industry, city, phone, whatsapp_number,
  contact_person, contact_role, current_website_status,
  source, status, notes
) values
(
  'Bismillah Restaurant & BBQ',
  'Restaurant / Food & Beverage',
  'Karachi',
  '+92-321-4567890',
  '+923214567890',
  'Usman Raza',
  'owner',
  'none',
  'cold_call',
  'new',
  'Popular dine-in BBQ spot near Tariq Road. No online presence whatsoever. Competitor next door has Google Maps + website.'
),
(
  'Al-Shifa Medical Clinic',
  'Healthcare / Medical Clinic',
  'Karachi',
  '+92-300-9876543',
  '+923009876543',
  'Dr. Nadia Farooq',
  'owner',
  'outdated',
  'cold_call',
  'contacted',
  'Website last updated in 2019. No online booking. Patients are being lost to a newer clinic nearby with a modern site.'
),
(
  'Zainab Boutique & Stitching',
  'Fashion / Clothing Boutique',
  'Karachi',
  '+92-333-1122334',
  '+923331122334',
  'Zainab Khan',
  'owner',
  'none',
  'social',
  'follow_up',
  'Active on Instagram but no website. Wants to sell online. Expressed interest but said will think about it.'
),
(
  'Tech Hub Computer Accessories',
  'Electronics / Retail',
  'Karachi',
  '+92-345-5566778',
  '+923455566778',
  'Farhan Ahmed',
  'manager',
  'has_website',
  'referral',
  'new',
  'Has a basic WordPress site that loads very slowly. Looking for a faster, more professional option.'
),
(
  'Green Valley Academy',
  'Education / Tutoring Center',
  'Karachi',
  '+92-311-9988776',
  '+923119988776',
  'Saima Mirza',
  'owner',
  'none',
  'cold_call',
  'new',
  'Private tutoring center for O/A levels. No website. Relies on word of mouth and WhatsApp groups only.'
),
(
  'Furniture Palace Karachi',
  'Furniture / Home Decor',
  'Karachi',
  '+92-322-3344556',
  '+923223344556',
  'Imran Sheikh',
  'owner',
  'outdated',
  'cold_call',
  'contacted',
  'Large showroom in Korangi. Has an old website with broken images. Wants to showcase catalog online.'
),
(
  'Quick Fix Auto Workshop',
  'Automotive / Car Repair',
  'Karachi',
  '+92-314-7788990',
  '+923147788990',
  null,
  'unknown',
  'none',
  'cold_call',
  'new',
  'Mid-sized auto workshop near Shahrae Faisal. No web presence. Depends on roadside signage.'
),
(
  'Sana Skin & Beauty Salon',
  'Beauty / Salon & Spa',
  'Karachi',
  '+92-336-2211443',
  '+923362211443',
  'Sana Butt',
  'owner',
  'none',
  'social',
  'follow_up',
  'Premium ladies salon in DHA. Instagram following of 8k+. Wants a booking page and service menu on a website.'
),
(
  'Al-Barkat General Store',
  'Retail / Grocery',
  'Karachi',
  '+92-300-5544332',
  '+923005544332',
  'Babar Hussain',
  'owner',
  'none',
  'cold_call',
  'new',
  'Family-run grocery with delivery. Wants to list products and accept WhatsApp orders via website.'
),
(
  'Creative Minds Design Studio',
  'Creative Agency / Design',
  'Karachi',
  '+92-321-6677889',
  '+923216677889',
  'Ali Hassan',
  'owner',
  'outdated',
  'referral',
  'contacted',
  'Small graphic design studio. Current site is a Wix free tier with ads. Wants something professional to win corporate clients.'
);
