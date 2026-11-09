-- ============================================================================
-- CANTEEN MANAGEMENT SYSTEM - SUPABASE SEED DATA (supabase/seed.sql)
-- ============================================================================

-- Categories
INSERT INTO public.menu_categories (id, name, slug, description, display_order, active)
VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Meals', 'meals', 'Nutritious, authentic thalis and lunch Combos', 1, true),
  ('c1000000-0000-0000-0000-000000000002', 'Beverages', 'beverages', 'Hot teas, artisanal coffees, and chilled coolers', 2, true),
  ('c1000000-0000-0000-0000-000000000003', 'Snacks', 'snacks', 'Quick bites, samosas, rolls, and quick street food', 3, true),
  ('c1000000-0000-0000-0000-000000000004', 'Desserts', 'desserts', 'Traditional Indian sweets and baked confections', 4, true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order;

-- Menu items
INSERT INTO public.menu_items (
  id, category_id, name, description, ingredients, price, image_url,
  available, featured, is_veg, preparation_time_minutes, calories, serving_start, serving_end
) VALUES
  (
    'm1000000-0000-0000-0000-000000000001',
    'c1000000-0000-0000-0000-000000000001',
    'Special Veg Thali',
    'Complete North Indian platter with 2 sabzis (Paneer & Mixed Veg), Dal Tadka, Jeera Rice, 3 Butter Rotis, Gulab Jamun, and Papad.',
    ARRAY['Paneer', 'Mixed Vegetables', 'Toor Dal', 'Basmati Rice', 'Whole Wheat', 'Ghee', 'Gulab Jamun'],
    90.00,
    'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800',
    true, true, true, 8, 680, '11:00:00', '21:00:00'
  ),
  (
    'm1000000-0000-0000-0000-000000000002',
    'c1000000-0000-0000-0000-000000000001',
    'Paneer Butter Masala Combo',
    'Rich and creamy tomato gravy with cottage cheese cubes, served with 2 layered Laccha Parathas and spicy mint chutney.',
    ARRAY['Cottage Cheese', 'Butter', 'Cream', 'Tomatoes', 'Wheat Flour', 'Spices'],
    110.00,
    'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=800',
    true, true, true, 10, 720, '11:00:00', '21:00:00'
  ),
  (
    'm1000000-0000-0000-0000-000000000003',
    'c1000000-0000-0000-0000-000000000001',
    'Crispy Masala Dosa',
    'Golden fermented crepe stuffed with spiced potato mash, accompanied by steaming drumstick Sambhar and fresh coconut chutney.',
    ARRAY['Rice Batter', 'Urad Dal', 'Potatoes', 'Mustard Seeds', 'Curry Leaves', 'Coconut'],
    60.00,
    'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=800',
    true, false, true, 6, 380, '07:00:00', '21:00:00'
  ),
  (
    'm1000000-0000-0000-0000-000000000004',
    'c1000000-0000-0000-0000-000000000001',
    'Delhi Chole Bhature',
    'Two puffed golden bhaturas served with slow-cooked pindi chole, pickled green chillies, and fresh onion rings.',
    ARRAY['Chickpeas', 'Refined Flour', 'Spices', 'Yogurt', 'Pickle'],
    75.00,
    'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&q=80&w=800',
    true, true, true, 7, 620, '07:00:00', '16:00:00'
  ),
  (
    'm1000000-0000-0000-0000-000000000005',
    'c1000000-0000-0000-0000-000000000001',
    'Dum Veg Biryani',
    'Slow-cooked fragrant basmati rice infused with whole spices, saffron, and fresh vegetables. Served with chilled cucumber raita.',
    ARRAY['Basmati Rice', 'Carrots', 'Beans', 'Green Peas', 'Saffron', 'Mint', 'Yogurt'],
    95.00,
    'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=800',
    true, false, true, 8, 540, '11:00:00', '21:00:00'
  ),
  (
    'm1000000-0000-0000-0000-000000000006',
    'c1000000-0000-0000-0000-000000000002',
    'Adrak Elaichi Cutting Chai',
    'Freshly brewed Assam CTC tea simmered with hand-crushed ginger, green cardamom pods, and farm-fresh whole milk.',
    ARRAY['Assam Tea', 'Fresh Ginger', 'Cardamom', 'Whole Milk', 'Jaggery/Sugar'],
    15.00,
    'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=800',
    true, true, true, 3, 90, '07:00:00', '21:00:00'
  ),
  (
    'm1000000-0000-0000-0000-000000000007',
    'c1000000-0000-0000-0000-000000000002',
    'South Indian Filter Coffee',
    'Traditional chicory-blend decoction frothed with boiling whole milk, served piping hot in a classic brass dabarah and tumbler.',
    ARRAY['Plantation Coffee', 'Chicory', 'Fresh Milk', 'Sugar'],
    25.00,
    'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=800',
    true, false, true, 3, 110, '07:00:00', '21:00:00'
  ),
  (
    'm1000000-0000-0000-0000-000000000008',
    'c1000000-0000-0000-0000-000000000002',
    'Thick Mango Lassi',
    'Whisked Alphonso mango pulp blended with thick creamy yogurt and topped with crushed pistachio slivers.',
    ARRAY['Mango Pulp', 'Curd', 'Pistachios', 'Cardamom'],
    45.00,
    'https://images.unsplash.com/photo-1528740561666-dc2479dc08ab?auto=format&fit=crop&q=80&w=800',
    true, true, true, 4, 210, '11:00:00', '21:00:00'
  ),
  (
    'm1000000-0000-0000-0000-000000000009',
    'c1000000-0000-0000-0000-000000000002',
    'Cold Coffee with Vanilla Scoop',
    'Thick blended espresso shake topped with a rich creamy vanilla ice cream scoop and cocoa dust.',
    ARRAY['Espresso', 'Chilled Milk', 'Vanilla Ice Cream', 'Chocolate Syrup'],
    60.00,
    'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=800',
    true, false, true, 4, 260, '11:00:00', '21:00:00'
  ),
  (
    'm1000000-0000-0000-0000-000000000010',
    'c1000000-0000-0000-0000-000000000003',
    'Samosa Pav Duo',
    'Two crispy golden samosas packed with spiced potatoes and green peas, tucked in soft ladi pavs with dry garlic chutney.',
    ARRAY['Potatoes', 'Green Peas', 'Pav Bread', 'Garlic Chutney', 'Spices'],
    35.00,
    'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=800',
    true, true, true, 2, 340, '07:00:00', '21:00:00'
  ),
  (
    'm1000000-0000-0000-0000-000000000011',
    'c1000000-0000-0000-0000-000000000003',
    'Double Cheese Spicy Maggi',
    'The campus legend: 2-minute noodles tossed with butter, sweet corn, capsicum, and smothered in molten mozzarella.',
    ARRAY['Maggi Noodles', 'Mozzarella Cheese', 'Sweet Corn', 'Capsicum', 'Butter'],
    50.00,
    'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&q=80&w=800',
    true, true, true, 5, 410, '07:00:00', '21:00:00'
  ),
  (
    'm1000000-0000-0000-0000-000000000012',
    'c1000000-0000-0000-0000-000000000003',
    'Paneer Kathi Roll',
    'Marinated charred cottage cheese cubes, bell peppers, and sliced onions wrapped in a flaky handmade paratha with spicy green chutney.',
    ARRAY['Paneer Tikka', 'Paratha', 'Onions', 'Bell Peppers', 'Mint Chutney'],
    70.00,
    'https://images.unsplash.com/photo-1626777553634-51e948ff5511?auto=format&fit=crop&q=80&w=800',
    true, false, true, 6, 440, '11:00:00', '21:00:00'
  ),
  (
    'm1000000-0000-0000-0000-000000000013',
    'c1000000-0000-0000-0000-000000000003',
    'Butter Pav Bhaji',
    'Mashed spiced vegetable curry cooked on a flat tawa with generous dollops of Amul butter, served with two toasted soft buns.',
    ARRAY['Potatoes', 'Tomatoes', 'Cauliflower', 'Amul Butter', 'Pav Bread'],
    75.00,
    'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&q=80&w=800',
    true, true, true, 7, 520, '12:00:00', '21:00:00'
  ),
  (
    'm1000000-0000-0000-0000-000000000014',
    'c1000000-0000-0000-0000-000000000004',
    'Hot Gulab Jamun (2 Pcs)',
    'Soft, melt-in-the-mouth khoya dumplings soaked in hot saffron and cardamom sugar syrup.',
    ARRAY['Khoya', 'Saffron', 'Sugar', 'Cardamom', 'Rose Water'],
    35.00,
    'https://images.unsplash.com/photo-1589119908995-c6837fa14d48?auto=format&fit=crop&q=80&w=800',
    true, true, true, 2, 280, '11:00:00', '21:00:00'
  ),
  (
    'm1000000-0000-0000-0000-000000000015',
    'c1000000-0000-0000-0000-000000000004',
    'Kesar Rasmalai (2 Pcs)',
    'Flattened chenna discs poached in thickened saffron milk garnished with almond and pistachio flakes.',
    ARRAY['Cow Milk Chenna', 'Saffron Milk', 'Pistachios', 'Almonds'],
    55.00,
    'https://images.unsplash.com/photo-1621303837174-89787a7d4729?auto=format&fit=crop&q=80&w=800',
    true, false, true, 2, 240, '11:00:00', '21:00:00'
  )
ON CONFLICT (id) DO NOTHING;

-- Operating hours
INSERT INTO public.operating_hours (day_of_week, service_type, start_time, end_time, active)
SELECT 
  d,
  s.service_type,
  s.start_time,
  s.end_time,
  true
FROM generate_series(0, 6) AS d
CROSS JOIN (
  VALUES
    ('BREAKFAST', '07:00:00'::TIME, '11:00:00'::TIME),
    ('LUNCH',     '11:00:00'::TIME, '16:00:00'::TIME),
    ('SNACKS',    '16:00:00'::TIME, '19:00:00'::TIME),
    ('DINNER',    '19:00:00'::TIME, '21:00:00'::TIME)
) AS s(service_type, start_time, end_time)
ON CONFLICT (day_of_week, service_type) DO NOTHING;

-- Inventory
INSERT INTO public.inventory (id, ingredient_name, category, quantity, unit, minimum_quantity)
VALUES
  ('i1000000-0000-0000-0000-000000000001', 'Basmati Rice', 'Grains', 150.00, 'kg', 30.00),
  ('i1000000-0000-0000-0000-000000000002', 'Cottage Cheese (Paneer)', 'Dairy', 38.00, 'kg', 10.00),
  ('i1000000-0000-0000-0000-000000000003', 'Whole Wheat Atta', 'Grains', 120.00, 'kg', 25.00),
  ('i1000000-0000-0000-0000-000000000004', 'Potatoes', 'Vegetables', 95.00, 'kg', 20.00),
  ('i1000000-0000-0000-0000-000000000005', 'Farm Fresh Milk', 'Dairy', 75.00, 'liters', 15.00),
  ('i1000000-0000-0000-0000-000000000006', 'Assam Tea Leaves', 'Dry Goods', 18.00, 'kg', 4.00),
  ('i1000000-0000-0000-0000-000000000007', 'Filter Coffee Powder', 'Dry Goods', 8.50, 'kg', 2.00),
  ('i1000000-0000-0000-0000-000000000008', 'Amul Butter', 'Dairy', 24.00, 'kg', 5.00),
  ('i1000000-0000-0000-0000-000000000009', 'Refined Sunflower Oil', 'Cooking Essentials', 45.00, 'liters', 12.00),
  ('i1000000-0000-0000-0000-000000000010', 'Pav Buns', 'Bakery', 240.00, 'pcs', 50.00),
  ('i1000000-0000-0000-0000-000000000011', 'Toor Dal', 'Pulses', 60.00, 'kg', 15.00),
  ('i1000000-0000-0000-0000-000000000012', 'Mozzarella Cheese', 'Dairy', 6.00, 'kg', 5.00)
ON CONFLICT (ingredient_name) DO NOTHING;
