-- ============================================================
-- Seed: Sample Hadiths from Sahih al-Bukhari and Sahih Muslim
-- ============================================================

-- Sahih al-Bukhari collection
INSERT OR IGNORE INTO hadith_collections (key, name_arabic, name_english, tradition, tier, compiler, century)
VALUES ('bukhari', 'صحيح البخاري', 'Sahih al-Bukhari', 'sunni', 'primary', 'Muhammad ibn Ismail al-Bukhari', 3);

-- Sahih Muslim collection
INSERT OR IGNORE INTO hadith_collections (key, name_arabic, name_english, tradition, tier, compiler, century)
VALUES ('muslim', 'صحيح مسلم', 'Sahih Muslim', 'sunni', 'primary', 'Muslim ibn al-Hajjaj', 3);

-- Book: Revelation (Bukhari Book 1)
INSERT OR IGNORE INTO hadith_books (collection_id, book_number, name_arabic, name_english)
VALUES (1, 1, 'كتاب بدء الوحي', 'Book of the Beginning of Revelation');

-- Book: Faith / Iman (Bukhari Book 2)
INSERT OR IGNORE INTO hadith_books (collection_id, book_number, name_arabic, name_english)
VALUES (1, 2, 'كتاب الإيمان', 'Book of Faith');

-- Book: Good Manners (Bukhari Book 78)
INSERT OR IGNORE INTO hadith_books (collection_id, book_number, name_arabic, name_english)
VALUES (1, 78, 'كتاب الأدب', 'Book of Good Manners');

-- Book: Jihad (Bukhari Book 56)
INSERT OR IGNORE INTO hadith_books (collection_id, book_number, name_arabic, name_english)
VALUES (1, 56, 'كتاب الجهاد والسير', 'Book of Jihad');

-- Book: Prophetic Characteristics (Bukhari Book 61)
INSERT OR IGNORE INTO hadith_books (collection_id, book_number, name_arabic, name_english)
VALUES (1, 61, 'كتاب المناقب', 'Book of Virtues');

-- Book: Faith (Muslim Book 1)
INSERT OR IGNORE INTO hadith_books (collection_id, book_number, name_arabic, name_english)
VALUES (2, 1, 'كتاب الإيمان', 'Book of Faith');

-- Book: Purification (Muslim Book 2)
INSERT OR IGNORE INTO hadith_books (collection_id, book_number, name_arabic, name_english)
VALUES (2, 2, 'كتاب الطهارة', 'Book of Purification');

-- ── Hadith 1: Actions by intentions (Bukhari 1) ───────────────────────────
INSERT OR IGNORE INTO hadiths (collection_id, book_id, hadith_number, arabic_text, english_text)
VALUES (
  1, 1, '1',
  'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى، فَمَنْ كَانَتْ هِجْرَتُهُ إِلَى دُنْيَا يُصِيبُهَا، أَوْ إِلَى امْرَأَةٍ يَنْكِحُهَا، فَهِجْرَتُهُ إِلَى مَا هَاجَرَ إِلَيْهِ.',
  'Actions are judged by intentions, so each man will have what he intended. Thus, he whose migration was to Allah and His Messenger, his migration is to Allah and His Messenger; but he whose migration was for some worldly thing he might gain, or for a wife he might marry, his migration is to that for which he migrated.'
);

INSERT OR IGNORE INTO hadith_grades (hadith_id, grade, grader, source)
VALUES (1, 'sahih', 'Al-Bukhari', 'Sahih al-Bukhari 1');

-- ── Hadith 2: Five pillars of Islam (Bukhari 8) ────────────────────────────
INSERT OR IGNORE INTO hadiths (collection_id, book_id, hadith_number, arabic_text, english_text)
VALUES (
  1, 2, '8',
  'بُنِيَ الإِسْلاَمُ عَلَى خَمْسٍ: شَهَادَةِ أَنْ لاَ إِلَهَ إِلاَّ اللَّهُ وَأَنَّ مُحَمَّدًا رَسُولُ اللَّهِ، وَإِقَامِ الصَّلاَةِ، وَإِيتَاءِ الزَّكَاةِ، وَالْحَجِّ، وَصَوْمِ رَمَضَانَ.',
  'Islam is built upon five pillars: testifying that there is no god but Allah and that Muhammad is the Messenger of Allah, performing the prayer, paying the Zakat, making the pilgrimage to the House, and fasting in Ramadan.'
);

INSERT OR IGNORE INTO hadith_grades (hadith_id, grade, grader, source)
VALUES (2, 'sahih', 'Al-Bukhari', 'Sahih al-Bukhari 8');

-- ── Hadith 3: Faith has over seventy branches (Bukhari 9) ─────────────────
INSERT OR IGNORE INTO hadiths (collection_id, book_id, hadith_number, arabic_text, english_text)
VALUES (
  1, 2, '9',
  'الإِيمَانُ بِضْعٌ وَسَبْعُونَ أَوْ بِضْعٌ وَسِتُّونَ شُعْبَةً، فَأَفْضَلُهَا قَوْلُ لاَ إِلَهَ إِلاَّ اللَّهُ، وَأَدْنَاهَا إِمَاطَةُ الأَذَى عَنِ الطَّرِيقِ، وَالْحَيَاءُ شُعْبَةٌ مِنَ الإِيمَانِ.',
  'Faith has over seventy branches — or over sixty branches — the most excellent of which is the declaration that there is no god but Allah, and the humblest of which is the removal of a bone (or thorn) from the road, and modesty is a branch of faith.'
);

INSERT OR IGNORE INTO hadith_grades (hadith_id, grade, grader, source)
VALUES (3, 'sahih', 'Al-Bukhari', 'Sahih al-Bukhari 9');

-- ── Hadith 4: The Muslim is safe from tongue and hand (Bukhari 10) ─────────
INSERT OR IGNORE INTO hadiths (collection_id, book_id, hadith_number, arabic_text, english_text)
VALUES (
  1, 2, '10',
  'الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ، وَالْمُهَاجِرُ مَنْ هَجَرَ مَا نَهَى اللَّهُ عَنْهُ.',
  'A Muslim is one from whose tongue and hands the Muslims are safe, and an emigrant (muhajir) is one who abandons what Allah has forbidden.'
);

INSERT OR IGNORE INTO hadith_grades (hadith_id, grade, grader, source)
VALUES (4, 'sahih', 'Al-Bukhari', 'Sahih al-Bukhari 10');

-- ── Hadith 5: Love for brother what you love for yourself (Bukhari 13) ─────
INSERT OR IGNORE INTO hadiths (collection_id, book_id, hadith_number, arabic_text, english_text)
VALUES (
  1, 2, '13',
  'لاَ يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ.',
  'None of you will truly believe until he loves for his brother what he loves for himself.'
);

INSERT OR IGNORE INTO hadith_grades (hadith_id, grade, grader, source)
VALUES (5, 'sahih', 'Al-Bukhari', 'Sahih al-Bukhari 13');

-- ── Hadith 6: The Prophet ﷺ was the best in character (Bukhari 3559) ───────
INSERT OR IGNORE INTO hadiths (collection_id, book_id, hadith_number, arabic_text, english_text)
VALUES (
  1, 61, '3559',
  'كَانَ النَّبِيُّ صلى الله عليه وسلم أَحْسَنَ النَّاسِ خُلُقًا.',
  'The Prophet (peace be upon him) was the best of all people in character (and manners).'
);

INSERT OR IGNORE INTO hadith_grades (hadith_id, grade, grader, source)
VALUES (6, 'sahih', 'Al-Bukhari', 'Sahih al-Bukhari 3559');

-- ── Hadith 7: Removing harm from the road is charity (Bukhari 2989) ────────
INSERT OR IGNORE INTO hadiths (collection_id, book_id, hadith_number, arabic_text, english_text)
VALUES (
  1, 56, '2989',
  'كُلُّ سُلاَمَى مِنَ النَّاسِ عَلَيْهِ صَدَقَةٌ كُلَّ يَوْمٍ تَطْلُعُ فِيهِ الشَّمْسُ، تَعْدِلُ بَيْنَ اثْنَيْنِ صَدَقَةٌ، وَتُعِينُ الرَّجُلَ فِي دَابَّتِهِ فَتَحْمِلُهُ عَلَيْهَا، أَوْ تَرْفَعُ لَهُ عَلَيْهَا مَتَاعَهُ صَدَقَةٌ، وَالْكَلِمَةُ الطَّيِّبَةُ صَدَقَةٌ، وَبِكُلِّ خُطْوَةٍ تَمْشِيهَا إِلَى الصَّلاَةِ صَدَقَةٌ، وَتُمِيطُ الأَذَى عَنِ الطَّرِيقِ صَدَقَةٌ.',
  'Charity is due upon every joint of a person on every day the sun rises: to judge justly between two people is charity; to help a man with his mount and lift his luggage onto it is charity; a good word is charity; every step taken toward the prayer is charity; and removing a harmful thing from the road is charity.'
);

INSERT OR IGNORE INTO hadith_grades (hadith_id, grade, grader, source)
VALUES (7, 'sahih', 'Al-Bukhari', 'Sahih al-Bukhari 2989');

-- ── Hadith 8: The strong man restrains his anger (Bukhari 6114) ────────────
INSERT OR IGNORE INTO hadiths (collection_id, book_id, hadith_number, arabic_text, english_text)
VALUES (
  1, 78, '6114',
  'لَيْسَ الشَّدِيدُ بِالصُّرَعَةِ، إِنَّمَا الشَّدِيدُ الَّذِي يَمْلِكُ نَفْسَهُ عِنْدَ الْغَضَبِ.',
  'The strong man is not the one who wrestles, but the strong man is in fact the one who controls himself in a fit of rage.'
);

INSERT OR IGNORE INTO hadith_grades (hadith_id, grade, grader, source)
VALUES (8, 'sahih', 'Al-Bukhari', 'Sahih al-Bukhari 6114');

-- ── Hadith 9: Cleanliness is half of faith (Muslim 223) ────────────────────
INSERT OR IGNORE INTO hadiths (collection_id, book_id, hadith_number, arabic_text, english_text)
VALUES (
  2, 7, '223',
  'الطُّهُورُ شَطْرُ الإِيمَانِ وَالْحَمْدُ لِلَّهِ تَمْلأُ الْمِيزَانَ، وَسُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ تَمْلآَنِ - أَوْ تَمْلأُ - مَا بَيْنَ السَّمَاوَاتِ وَالأَرْضِ.',
  'Cleanliness is half of faith, and ''Praise be to Allah'' fills the scale, and ''Glory be to Allah and Praise be to Allah'' fill up what is between the heavens and the earth.'
);

INSERT OR IGNORE INTO hadith_grades (hadith_id, grade, grader, source)
VALUES (9, 'sahih', 'Muslim', 'Sahih Muslim 223');

-- ── Hadith 10: Smiling at your brother is charity (Tirmidhi via Muslim) ────
INSERT OR IGNORE INTO hadiths (collection_id, book_id, hadith_number, arabic_text, english_text)
VALUES (
  2, 6, '2626',
  'لاَ تَحْقِرَنَّ مِنَ الْمَعْرُوفِ شَيْئًا وَلَوْ أَنْ تَلْقَى أَخَاكَ بِوَجْهٍ طَلْقٍ.',
  'Do not belittle any act of kindness, even meeting your brother with a cheerful face.'
);

INSERT OR IGNORE INTO hadith_grades (hadith_id, grade, grader, source)
VALUES (10, 'sahih', 'Muslim', 'Sahih Muslim 2626');
