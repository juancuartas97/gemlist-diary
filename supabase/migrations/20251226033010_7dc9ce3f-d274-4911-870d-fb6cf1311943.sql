-- Insert European Clubs (Part 1)
INSERT INTO venues (name, venue_type, city, state, country, lat, lng, capacity) VALUES
-- Berlin, Germany
('Berghain', 'club', 'Berlin', NULL, 'Germany', 52.5108, 13.4426, 1500),
('Tresor', 'club', 'Berlin', NULL, 'Germany', 52.5106, 13.4200, 700),
('Watergate', 'club', 'Berlin', NULL, 'Germany', 52.5014, 13.4448, 500),
('KitKat Club', 'club', 'Berlin', NULL, 'Germany', 52.5156, 13.4144, 800),
('Sisyphos', 'club', 'Berlin', NULL, 'Germany', 52.4932, 13.5256, 2000),
('://about blank', 'club', 'Berlin', NULL, 'Germany', 52.5094, 13.4652, 600),
('Kater Blau', 'club', 'Berlin', NULL, 'Germany', 52.5122, 13.4268, 500),
('Wilde Renate', 'club', 'Berlin', NULL, 'Germany', 52.5081, 13.4673, 400),
('Ritter Butzke', 'club', 'Berlin', NULL, 'Germany', 52.5043, 13.3902, 450),
-- Amsterdam, Netherlands
('Shelter', 'club', 'Amsterdam', NULL, 'Netherlands', 52.3878, 4.9024, 700),
('De School', 'club', 'Amsterdam', NULL, 'Netherlands', 52.3547, 4.8686, 500),
('Paradiso', 'club', 'Amsterdam', NULL, 'Netherlands', 52.3622, 4.8838, 1500),
('Claire', 'club', 'Amsterdam', NULL, 'Netherlands', 52.3881, 4.8822, 400),
('AIR', 'club', 'Amsterdam', NULL, 'Netherlands', 52.3633, 4.8936, 800),
('Melkweg', 'club', 'Amsterdam', NULL, 'Netherlands', 52.3644, 4.8822, 1500),
-- London, UK
('fabric', 'club', 'London', NULL, 'UK', 51.5197, -0.1025, 1600),
('Printworks', 'warehouse', 'London', NULL, 'UK', 51.5002, -0.0173, 3000),
('Ministry of Sound', 'club', 'London', NULL, 'UK', 51.4981, -0.1006, 1500),
('XOYO', 'club', 'London', NULL, 'UK', 51.5263, -0.0834, 800),
('Corsica Studios', 'club', 'London', NULL, 'UK', 51.4939, -0.1006, 650),
('E1 London', 'warehouse', 'London', NULL, 'UK', 51.5109, -0.0553, 1500),
('Phonox', 'club', 'London', NULL, 'UK', 51.4637, -0.1153, 600),
('Village Underground', 'club', 'London', NULL, 'UK', 51.5241, -0.0781, 700),
('Egg London', 'club', 'London', NULL, 'UK', 51.5360, -0.1250, 800),
-- Ibiza, Spain
('Hï Ibiza', 'club', 'Ibiza', NULL, 'Spain', 38.8868, 1.4078, 5000),
('Ushuaïa', 'club', 'Ibiza', NULL, 'Spain', 38.8867, 1.4076, 8000),
('Amnesia', 'club', 'Ibiza', NULL, 'Spain', 38.9178, 1.4172, 5000),
('Pacha Ibiza', 'club', 'Ibiza', NULL, 'Spain', 38.9106, 1.4336, 3000),
('DC-10', 'club', 'Ibiza', NULL, 'Spain', 38.8731, 1.3739, 1500),
('Privilege', 'club', 'Ibiza', NULL, 'Spain', 38.9178, 1.4167, 10000),
('Eden', 'club', 'San Antonio', NULL, 'Spain', 38.9805, 1.3006, 5000),
-- Paris, France
('Rex Club', 'club', 'Paris', NULL, 'France', 48.8706, 2.3472, 800),
('Concrete', 'club', 'Paris', NULL, 'France', 48.8428, 2.3711, 400),
('Glazart', 'club', 'Paris', NULL, 'France', 48.8867, 2.3942, 800),
('La Machine du Moulin Rouge', 'club', 'Paris', NULL, 'France', 48.8842, 2.3322, 1000),
-- Other Europe
('Bootshaus', 'club', 'Cologne', NULL, 'Germany', 50.9533, 6.9089, 1500),
('Robert Johnson', 'club', 'Frankfurt', NULL, 'Germany', 50.0967, 8.7483, 400),
('Fuse', 'club', 'Brussels', NULL, 'Belgium', 50.8400, 4.3533, 600),
('Kompass Klub', 'club', 'Ghent', NULL, 'Belgium', 51.0500, 3.7333, 2000),
('Razzmatazz', 'club', 'Barcelona', NULL, 'Spain', 41.3989, 2.1894, 3000),
('Input', 'club', 'Barcelona', NULL, 'Spain', 41.3856, 2.1892, 800),
('D-Edge', 'club', 'São Paulo', NULL, 'Brazil', -23.5558, -46.6500, 1200)
ON CONFLICT (LOWER(TRIM(name)), LOWER(TRIM(city))) DO NOTHING;