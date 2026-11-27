-- Deterministic Seed Data for Maskan Platform
-- Default demo password for admin@maskan.mr & concierge@maskan.mr: Maskan2026!

INSERT INTO users (id, email, password_hash, full_name, role, preferred_lang, preferred_theme, preferred_currency)
VALUES
    ('11111111-1111-4111-8111-111111111101', 'admin@maskan.mr',
     '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYf/6lJ0Z2u', 'سلطان ولد أحمد', 'ADMIN', 'ar', 'light', 'USD'),
    ('11111111-1111-4111-8111-111111111102', 'concierge@maskan.mr',
     '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYf/6lJ0Z2u', 'Amélie Diallo', 'CONCIERGE', 'fr', 'light', 'EUR')
ON CONFLICT (email) DO NOTHING;

INSERT INTO exchange_rates (code, name_ar, name_fr, symbol_ar, symbol_fr, rate_to_usd, is_prefix)
VALUES
    ('USD', 'دولار أمريكي', 'Dollar américain', '$', '$', 1.0000, TRUE),
    ('EUR', 'يورو أوروبي', 'Euro', '€', '€', 0.9200, FALSE),
    ('MRU', 'أوقية موريتانية', 'Ouguiya mauritanienne', 'أ.م', 'MRU', 39.8000, FALSE)
ON CONFLICT (code) DO NOTHING;

INSERT INTO properties (id, code, name_ar, name_fr, type, district_ar, district_fr, rooms, area_sqm, price_per_night_usd, status, image_key, image_url)
VALUES
    ('22222222-2222-4222-8222-222222222201', 'p1',
     'شقة أفق المدينة', 'Appartement Horizon Urbain', 'APARTMENT',
     'تفرغ زينة — الواجهة الشمالية', 'Tevragh Zeina — Façade Nord',
     3, 165, 140.00, 'OCCUPIED', 'img1', '/assets/property-01.webp'),
    ('22222222-2222-4222-8222-222222222202', 'p2',
     'منزل الواحة التيركوازية', 'Villa Oasis Turquoise', 'HOUSE',
     'حي السفارات', 'Quartier des Ambassades',
     5, 380, 290.00, 'OCCUPIED', 'img2', '/assets/property-02.webp'),
    ('22222222-2222-4222-8222-222222222203', 'p3',
     'دوبلكس الأرز الهادئ', 'Duplex Cèdre Serein', 'APARTMENT',
     'وسط المدينة — برج النخيل', 'Centre-Ville — Tour des Palmiers',
     2, 135, 125.00, 'AVAILABLE', 'img3', '/assets/property-03.webp'),
    ('22222222-2222-4222-8222-222222222204', 'p4',
     'منزل الزيتون العائلي', 'Résidence Familiale Les Oliviers', 'HOUSE',
     'الضاحية الغربية', 'Banlieue Ouest',
     4, 310, 245.00, 'OCCUPIED', 'img4', '/assets/property-04.webp')
ON CONFLICT (code) DO NOTHING;

-- Active & Current Month Bookings (November 2026)
INSERT INTO bookings (booking_code, property_id, guest_name, guest_phone, check_in, check_out, nights, total_usd, status, created_by)
VALUES
    ('BK-401', '22222222-2222-4222-8222-222222222201', 'أحمد ولد سيدي', '+222 36 44 12 09', '2026-11-25', '2026-11-29', 4, 560.00, 'CONFIRMED', '11111111-1111-4111-8111-111111111101'),
    ('BK-402', '22222222-2222-4222-8222-222222222202', 'ريم العتيبي', '+966 55 210 8841', '2026-11-26', '2026-12-01', 5, 1450.00, 'CONFIRMED', '11111111-1111-4111-8111-111111111101'),
    ('BK-403', '22222222-2222-4222-8222-222222222203', 'كريم بنجلون', '+212 661 30 92 14', '2026-11-28', '2026-12-01', 3, 375.00, 'PENDING', '11111111-1111-4111-8111-111111111101'),
    ('BK-404', '22222222-2222-4222-8222-222222222204', 'مريم المختار', '+222 44 90 15 22', '2026-11-27', '2026-11-30', 3, 735.00, 'PENDING', '11111111-1111-4111-8111-111111111101'),
    ('BK-405', '22222222-2222-4222-8222-222222222204', 'طارق الحسن', '+222 33 81 00 45', '2026-11-12', '2026-11-18', 6, 1470.00, 'COMPLETED', '11111111-1111-4111-8111-111111111101'),
    ('BK-406', '22222222-2222-4222-8222-222222222201', 'نورة السالم', '+966 50 942 1180', '2026-11-05', '2026-11-10', 5, 700.00, 'COMPLETED', '11111111-1111-4111-8111-111111111101'),
    -- Historical Completed Bookings (Jun–Oct 2026) powering 6-month revenue analytics
    ('BK-351', '22222222-2222-4222-8222-222222222201', 'Jean-Luc Moreau', '+33 6 12 45 78 90', '2026-06-08', '2026-06-18', 10, 1400.00, 'COMPLETED', '11111111-1111-4111-8111-111111111102'),
    ('BK-352', '22222222-2222-4222-8222-222222222202', 'فاطمة منت سالم', '+222 46 21 88 10', '2026-06-12', '2026-06-19', 7, 2030.00, 'COMPLETED', '11111111-1111-4111-8111-111111111101'),
    ('BK-361', '22222222-2222-4222-8222-222222222203', 'Claire Laurent', '+33 6 98 22 41 15', '2026-07-04', '2026-07-17', 13, 1625.00, 'COMPLETED', '11111111-1111-4111-8111-111111111102'),
    ('BK-362', '22222222-2222-4222-8222-222222222202', 'يوسف الشنقيطي', '+222 22 19 44 00', '2026-07-10', '2026-07-19', 9, 2610.00, 'COMPLETED', '11111111-1111-4111-8111-111111111101'),
    ('BK-371', '22222222-2222-4222-8222-222222222201', 'Nadia Benali', '+212 662 11 04 33', '2026-08-03', '2026-08-17', 14, 1960.00, 'COMPLETED', '11111111-1111-4111-8111-111111111102'),
    ('BK-372', '22222222-2222-4222-8222-222222222204', 'سعد الدوسري', '+966 54 331 0920', '2026-08-06', '2026-08-19', 13, 3185.00, 'COMPLETED', '11111111-1111-4111-8111-111111111101'),
    ('BK-381', '22222222-2222-4222-8222-222222222203', 'Olivier Petit', '+33 6 44 09 18 72', '2026-09-05', '2026-09-17', 12, 1500.00, 'COMPLETED', '11111111-1111-4111-8111-111111111102'),
    ('BK-382', '22222222-2222-4222-8222-222222222204', 'هند المرابط', '+222 36 88 21 04', '2026-09-10', '2026-09-20', 10, 2450.00, 'COMPLETED', '11111111-1111-4111-8111-111111111101'),
    ('BK-391', '22222222-2222-4222-8222-222222222201', 'Marc-Antoine Roux', '+33 7 81 30 55 19', '2026-10-04', '2026-10-17', 13, 1820.00, 'COMPLETED', '11111111-1111-4111-8111-111111111102'),
    ('BK-392', '22222222-2222-4222-8222-222222222202', 'عمر الفاسي', '+212 661 88 73 20', '2026-10-11', '2026-10-21', 10, 2900.00, 'COMPLETED', '11111111-1111-4111-8111-111111111101')
ON CONFLICT (booking_code) DO NOTHING;
