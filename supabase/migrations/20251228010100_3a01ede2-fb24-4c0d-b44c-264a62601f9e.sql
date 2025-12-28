-- Seed diverse gems for user - avoiding venues that match existing goals to prevent trigger issues

INSERT INTO user_gems (
  user_id, dj_id, venue_id, primary_genre_id, event_date, collected_at,
  rarity_tier, rarity_score, is_genesis_mint, modifiers, facet_ratings, private_note, is_rated
) VALUES
-- MYTHIC gems (99-100 score) - use Tresor instead of Berghain
('48a115e5-1d35-4280-bebf-90481e035724', 'eba60ab0-3a5f-4bd3-b694-c33e145db495', '5e3be737-0ea3-41d2-a89e-d59331979690', 'e428c45d-d8dc-4902-a230-539d815927cc', '2024-12-20', NOW() - INTERVAL '2 days',
 'mythic', 99, true, ARRAY['G', 'Q'], '{"sound_quality": 5, "crowd": 5, "energy": 5, "performance": 5}', 'Skrillex surprise set at Tresor - once in a lifetime!', true),

-- LEGENDARY gems (86-98 score)
('48a115e5-1d35-4280-bebf-90481e035724', '6b5cc210-fac6-497b-a0b7-152fe46f3790', 'eab17b22-cdae-479f-b9b8-618db600462f', 'dd4f0b20-fcf7-407e-bf4b-3718998f684a', '2024-12-15', NOW() - INTERVAL '5 days',
 'legendary', 92, true, ARRAY['G'], '{"sound_quality": 5, "crowd": 4, "energy": 5, "performance": 5}', 'Peggy Gou at Watergate was insane', true),

('48a115e5-1d35-4280-bebf-90481e035724', 'e0beaff6-1867-4c15-9ac0-4a78670a7cdd', '3c2bc0c0-29ca-4510-ac53-5f98bbdc8768', 'e428c45d-d8dc-4902-a230-539d815927cc', '2024-12-10', NOW() - INTERVAL '10 days',
 'legendary', 88, false, ARRAY['Q'], '{"sound_quality": 4, "crowd": 5, "energy": 5, "performance": 5}', 'Tale of Us at KitKat - quest complete!', true),

-- RARE gems (71-85 score)
('48a115e5-1d35-4280-bebf-90481e035724', '27e1cd36-3130-437b-9a87-92fc68af3035', 'ece9f72c-fda1-472b-b94b-413fd2b75b5c', 'e428c45d-d8dc-4902-a230-539d815927cc', '2024-12-01', NOW() - INTERVAL '20 days',
 'rare', 78, true, ARRAY['G'], '{"sound_quality": 4, "crowd": 4, "energy": 5, "performance": 4}', 'REZZ at Sisyphos - wild night', true),

('48a115e5-1d35-4280-bebf-90481e035724', 'a1f7b67a-e6b9-4353-80ea-c66d66ca3614', '8a6d85a9-6819-4949-af26-ed3a33f38607', '118b3175-d6d1-46cd-bf03-c222b7212157', '2024-11-25', NOW() - INTERVAL '25 days',
 'rare', 75, false, ARRAY[]::text[], '{"sound_quality": 5, "crowd": 4, "energy": 5, "performance": 4}', 'Excision at Black Box - bass capital', true),

('48a115e5-1d35-4280-bebf-90481e035724', 'a84c54d8-c969-475b-9add-1d19ad356fc8', '473d262b-98ae-4fbf-81a8-f3bf308168bf', '81e410b0-931a-4714-a6b3-a25549edab75', '2024-11-20', NOW() - INTERVAL '30 days',
 'rare', 72, false, ARRAY[]::text[], '{"sound_quality": 5, "crowd": 5, "energy": 4, "performance": 5}', 'Armin at Space Ibiza closing set', true),

-- UNCOMMON gems (41-70 score)
('48a115e5-1d35-4280-bebf-90481e035724', 'db0fa367-3fc4-437c-9ab2-8087bfe530c4', '864379d1-b89d-4f0c-b94d-b356af7e7c63', 'dd4f0b20-fcf7-407e-bf4b-3718998f684a', '2024-11-15', NOW() - INTERVAL '35 days',
 'uncommon', 58, false, ARRAY[]::text[], '{"sound_quality": 4, "crowd": 3, "energy": 4, "performance": 4}', 'Martin Garrix Miami vibes', true),

('48a115e5-1d35-4280-bebf-90481e035724', '7ead74f2-53b6-4f5d-ae7f-87ef1d1ead23', 'e7e547da-8ead-4fe4-9162-5e7f5ec8427e', '81e410b0-931a-4714-a6b3-a25549edab75', '2024-11-10', NOW() - INTERVAL '40 days',
 'uncommon', 52, false, ARRAY['Q'], '{"sound_quality": 4, "crowd": 4, "energy": 4, "performance": 3}', 'Tiesto at Space Miami - classic', true),

('48a115e5-1d35-4280-bebf-90481e035724', '45744e1a-dfc5-40e0-a133-ebc2aa1f4ef7', 'd71144e0-4518-45b4-b182-c8291fc02495', 'dd4f0b20-fcf7-407e-bf4b-3718998f684a', '2024-11-05', NOW() - INTERVAL '45 days',
 'uncommon', 48, false, ARRAY[]::text[], '{"sound_quality": 3, "crowd": 4, "energy": 4, "performance": 4}', null, true),

('48a115e5-1d35-4280-bebf-90481e035724', 'acc884ab-de5b-4298-b234-3721b24107e6', '67e0200b-f144-4e7a-80d6-399003b49bf4', '5aaccdaa-61e1-4162-a076-06099d5cc6cf', '2024-10-28', NOW() - INTERVAL '50 days',
 'uncommon', 45, true, ARRAY['G'], '{"sound_quality": 5, "crowd": 5, "energy": 3, "performance": 4}', 'Kygo at The Gorge sunset set', true),

-- COMMON gems (0-40 score)
('48a115e5-1d35-4280-bebf-90481e035724', '57020f74-f9e0-4802-a546-0af3c4752a08', 'bf823309-35e0-40a2-aca5-150191f0d83d', 'dd4f0b20-fcf7-407e-bf4b-3718998f684a', '2024-10-20', NOW() - INTERVAL '55 days',
 'common', 35, false, ARRAY[]::text[], '{"sound_quality": 3, "crowd": 3, "energy": 4, "performance": 3}', null, true),

('48a115e5-1d35-4280-bebf-90481e035724', '25c3be76-b8e9-415e-8046-1262635bbeaa', '0a8772a1-86a3-416c-82c1-d9ef92306635', 'dd4f0b20-fcf7-407e-bf4b-3718998f684a', '2024-10-15', NOW() - INTERVAL '60 days',
 'common', 28, false, ARRAY[]::text[], '{"sound_quality": 3, "crowd": 2, "energy": 5, "performance": 3}', 'Steve Aoki cake throw lol', true),

('48a115e5-1d35-4280-bebf-90481e035724', 'd7057b70-5c19-4768-a781-32640f1bdcd2', '91311a00-b273-45aa-b397-0040d4f98aef', 'dd4f0b20-fcf7-407e-bf4b-3718998f684a', '2024-10-10', NOW() - INTERVAL '65 days',
 'common', 22, false, ARRAY[]::text[], '{"sound_quality": 4, "crowd": 3, "energy": 3, "performance": 3}', null, true),

('48a115e5-1d35-4280-bebf-90481e035724', '89d5d1b7-44f6-4217-a1cd-d51a994c59c6', '36958c7a-0729-427a-adee-c00da7101006', 'dd4f0b20-fcf7-407e-bf4b-3718998f684a', '2024-10-05', NOW() - INTERVAL '70 days',
 'common', 18, false, ARRAY[]::text[], null, null, false),

('48a115e5-1d35-4280-bebf-90481e035724', '9c162432-8301-442b-9de4-bf53cce66a6d', 'ea094b30-4682-4462-a511-070bb7b8bcc1', 'dd4f0b20-fcf7-407e-bf4b-3718998f684a', '2024-09-28', NOW() - INTERVAL '75 days',
 'common', 15, false, ARRAY[]::text[], null, null, false),

-- Additional variety - different genres  
('48a115e5-1d35-4280-bebf-90481e035724', 'd9c773f3-9e08-4e5c-bc93-d6ecb9e53d9c', '4faf2360-b09d-4dfe-9423-e158e889be5b', 'bafbfbbc-6c9c-4f0a-a05c-035cb99ff30e', '2024-09-20', NOW() - INTERVAL '80 days',
 'uncommon', 55, false, ARRAY[]::text[], '{"sound_quality": 4, "crowd": 4, "energy": 3, "performance": 4}', 'Marshmello ambient set surprise', true),

('48a115e5-1d35-4280-bebf-90481e035724', '238d35f1-9ffc-4d1a-ab38-b4f168aaa1a6', 'f3d09675-37df-4696-a4e8-ee641242a484', '0d4b48ed-5894-4f22-84e3-df25f86bdc81', '2024-09-15', NOW() - INTERVAL '85 days',
 'rare', 73, true, ARRAY['G'], '{"sound_quality": 4, "crowd": 4, "energy": 4, "performance": 5}', 'Chainsmokers experimental DJ set at TV Lounge', true),

('48a115e5-1d35-4280-bebf-90481e035724', 'b1190aa6-e65d-4ed6-983c-3223a4548f62', 'c3f6d877-dc3f-44f4-b96c-55c9217725c9', 'e428c45d-d8dc-4902-a230-539d815927cc', '2024-09-10', NOW() - INTERVAL '90 days',
 'uncommon', 62, false, ARRAY[]::text[], '{"sound_quality": 5, "crowd": 4, "energy": 4, "performance": 3}', 'R3HAB techno vibes at Kater Blau', true),

('48a115e5-1d35-4280-bebf-90481e035724', '00492a5e-5d21-436d-a616-765201d83615', '5aa7a6b4-f156-4687-b0e0-6a03032ab194', 'dd4f0b20-fcf7-407e-bf4b-3718998f684a', '2024-09-05', NOW() - INTERVAL '95 days',
 'legendary', 90, false, ARRAY['Q'], '{"sound_quality": 5, "crowd": 5, "energy": 5, "performance": 5}', 'Calvin Harris at ://about blank - bucket list!', true),

('48a115e5-1d35-4280-bebf-90481e035724', 'e10da7d6-6b6f-4a85-8156-8052bc499965', '91311a00-b273-45aa-b397-0040d4f98aef', 'dd4f0b20-fcf7-407e-bf4b-3718998f684a', '2024-08-30', NOW() - INTERVAL '100 days',
 'rare', 80, false, ARRAY[]::text[], '{"sound_quality": 4, "crowd": 5, "energy": 5, "performance": 4}', 'David Guetta at Smartbar underground set', true);

-- Update profile total_gems count
UPDATE profiles 
SET total_gems = (SELECT COUNT(*) FROM user_gems WHERE user_id = '48a115e5-1d35-4280-bebf-90481e035724')
WHERE id = '48a115e5-1d35-4280-bebf-90481e035724';