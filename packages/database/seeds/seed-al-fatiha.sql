-- ============================================================
-- Seed: Al-Fatiha (Surah 1 — The Opening)
-- ============================================================

-- Surah record
INSERT OR IGNORE INTO surahs (number, arabic_name, transliterated_name, english_name, revelation_type, verse_count)
VALUES (1, 'الفاتحة', 'Al-Fatiha', 'The Opening', 'meccan', 7);

-- The 7 ayahs of Al-Fatiha with full Arabic text (with tashkeel)
INSERT OR IGNORE INTO ayahs (surah_id, ayah_number, arabic_text, arabic_simple, bismillah_pre) VALUES
(1, 1, 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', 'بسم الله الرحمن الرحيم', 0),
(1, 2, 'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ', 'الحمد لله رب العالمين', 0),
(1, 3, 'ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', 'الرحمن الرحيم', 0),
(1, 4, 'مَٰلِكِ يَوْمِ ٱلدِّينِ', 'مالك يوم الدين', 0),
(1, 5, 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ', 'إياك نعبد وإياك نستعين', 0),
(1, 6, 'ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ', 'اهدنا الصراط المستقيم', 0),
(1, 7, 'صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ', 'صراط الذين أنعمت عليهم غير المغضوب عليهم ولا الضالين', 0);

-- Clear Quran translation (Dr. Mustafa Khattab)
INSERT OR IGNORE INTO translations (ayah_id, translation_key, text, translator, language) VALUES
(1, 'clear-quran', 'In the Name of Allah—the Most Compassionate, Most Merciful.', 'Dr. Mustafa Khattab', 'en'),
(2, 'clear-quran', 'All praise is for Allah—Lord of all worlds,', 'Dr. Mustafa Khattab', 'en'),
(3, 'clear-quran', 'the Most Compassionate, Most Merciful,', 'Dr. Mustafa Khattab', 'en'),
(4, 'clear-quran', 'Master of the Day of Judgment.', 'Dr. Mustafa Khattab', 'en'),
(5, 'clear-quran', 'You ˹alone˺ we worship and You ˹alone˺ we ask for help.', 'Dr. Mustafa Khattab', 'en'),
(6, 'clear-quran', 'Guide us along the Straight Path,', 'Dr. Mustafa Khattab', 'en'),
(7, 'clear-quran', 'the Path of those You have blessed—not those You are displeased with, or those who are astray.', 'Dr. Mustafa Khattab', 'en');

-- Pickthall translation
INSERT OR IGNORE INTO translations (ayah_id, translation_key, text, translator, language) VALUES
(1, 'pickthall', 'In the name of Allah, the Beneficent, the Merciful.', 'Mohammed Marmaduke Pickthall', 'en'),
(2, 'pickthall', 'Praise be to Allah, Lord of the Worlds,', 'Mohammed Marmaduke Pickthall', 'en'),
(3, 'pickthall', 'The Beneficent, the Merciful.', 'Mohammed Marmaduke Pickthall', 'en'),
(4, 'pickthall', 'Master of the Day of Judgment,', 'Mohammed Marmaduke Pickthall', 'en'),
(5, 'pickthall', 'Thee (alone) we worship; Thee (alone) we ask for help.', 'Mohammed Marmaduke Pickthall', 'en'),
(6, 'pickthall', 'Show us the straight path,', 'Mohammed Marmaduke Pickthall', 'en'),
(7, 'pickthall', 'The path of those whom Thou hast favoured; Not the (path) of those who earn Thine anger nor of those who go astray.', 'Mohammed Marmaduke Pickthall', 'en');

-- Arabic roots for key words in Al-Fatiha
INSERT OR IGNORE INTO arabic_roots (root_letters, meaning_arabic, meaning_english) VALUES
('بسم', 'الاسم', 'name / to name'),
('الله', NULL, 'God, Allah'),
('رحم', 'رحمة', 'mercy, compassion'),
('حمد', 'الحمد', 'praise, commendation'),
('رب', 'الرب', 'lord, sustainer'),
('علم', 'العلم', 'world, knowledge, universe'),
('ملك', 'الملك', 'king, dominion'),
('يوم', 'اليوم', 'day'),
('دين', 'الدين', 'religion, judgment, recompense'),
('عبد', 'العبادة', 'worship, servant'),
('عون', 'المعونة', 'help, assistance'),
('هدي', 'الهداية', 'guidance'),
('صرط', 'الصراط', 'path, road'),
('نعم', 'النعمة', 'blessing, favor'),
('غضب', 'الغضب', 'anger, wrath'),
('ضلل', 'الضلال', 'going astray, error');
