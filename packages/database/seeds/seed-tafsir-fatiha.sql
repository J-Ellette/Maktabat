-- ============================================================
-- Seed: Tafsir Ibn Kathir — Al-Fatiha (Surah 1)
-- English condensed excerpts from Tafsir Ibn Kathir
-- Volume 1, Pages 1-86 (standard print edition)
-- ============================================================

-- Insert Ibn Kathir as a resource
INSERT OR IGNORE INTO resources (key, title_arabic, title_english, author, tradition, type, century, tier)
VALUES (
  'ibn-kathir',
  'تفسير القرآن العظيم',
  'Tafsir Ibn Kathir',
  'Ismail ibn Umar ibn Kathir',
  'sunni',
  'tafsir',
  8,
  'primary'
);

-- ─── Tafsir entries for Al-Fatiha ─────────────────────────────────────────────

-- Ayah 1:1 — Bismillah
INSERT OR IGNORE INTO tafsir_entries (ayah_id, tafsir_key, text, language, volume, page)
VALUES (
  1,
  'ibn-kathir',
  'The Basmalah — "In the Name of Allah, the Most Gracious, the Most Merciful" — is the opening of the Quran. Ibn Kathir explains that beginning with the Name of Allah signifies seeking blessing and divine assistance. The Divine Name "Allah" (الله) is the proper name of the Lord, derived from the verb meaning "to be worshipped." Al-Rahman and Al-Rahim are both derived from Rahmah (mercy), with Al-Rahman being more encompassing and Al-Rahim pointing toward His mercy upon the believers. Ibn Abbas (رضي الله عنه) reported that the Basmalah is a verse of every surah — it was revealed as a separator between the surahs.',
  'en',
  1,
  1
);

-- Ayah 1:2 — Al-hamdulillahi rabb il-'alamin
INSERT OR IGNORE INTO tafsir_entries (ayah_id, tafsir_key, text, language, volume, page)
VALUES (
  2,
  'ibn-kathir',
  '"All praise is due to Allah, Lord of the worlds." Hamd (الحمد) means complete, perfect praise combined with love and veneration. This differs from Madh (مدح), which is simple praise. The Rabb (رب) means the Creator, Owner, Sustainer, and Master. Al-'Alamin (العالمين) refers to all that exists besides Allah — every world and every type of creation: humans, jinn, angels, and all living beings. This verse teaches that all praise belongs to Allah alone, whether or not people acknowledge it, because He is the sole Creator and Sustainer of everything in existence. Ibn 'Abbas explained that al-'Alamin refers to all those that Allah has created in the heavens, earth, and what is between them.',
  'en',
  1,
  4
);

-- Ayah 1:3 — Al-Rahman Al-Rahim
INSERT OR IGNORE INTO tafsir_entries (ayah_id, tafsir_key, text, language, volume, page)
VALUES (
  3,
  'ibn-kathir',
  '"The Most Gracious, the Most Merciful." After mentioning His lordship over all creation, Allah follows with His attributes of mercy. Al-Rahman is a Divine Name derived from Al-Rahmah (mercy). Its structure (Fa'lan) indicates fullness and abundance — Allah''s mercy encompasses all of existence. Al-Rahim (Most Merciful) is an attribute (sifah) indicating that He directs this mercy specifically toward His believers. Allah''s mercy is without limit and beyond human comprehension. This repetition of the two names of mercy after the Basmalah emphasizes that Allah''s governance of the worlds is driven by mercy, not mere dominion.',
  'en',
  1,
  9
);

-- Ayah 1:4 — Malik yawm il-din
INSERT OR IGNORE INTO tafsir_entries (ayah_id, tafsir_key, text, language, volume, page)
VALUES (
  4,
  'ibn-kathir',
  '"Master of the Day of Recompense." Malik (مالك) — the Owner — refers to absolute ownership and sovereignty. Yawm al-Din (يوم الدين) is the Day of Judgment, also called yawm al-hisab (the Day of Reckoning). On that Day, no dominion will remain except Allah''s: "To whom belongs the kingdom this Day? To Allah, the One, the Irresistible" (Quran 40:16). Al-Din here means recompense and judgment — each soul will be recompensed for what it has earned. This verse reminds the worshipper that the One they praise (verse 2) and ask for mercy (verse 3) is also the Judge who holds ultimate authority over their final outcome.',
  'en',
  1,
  12
);

-- Ayah 1:5 — Iyyaka na'budu wa iyyaka nasta'in
INSERT OR IGNORE INTO tafsir_entries (ayah_id, tafsir_key, text, language, volume, page)
VALUES (
  5,
  'ibn-kathir',
  '"You alone we worship, and You alone we ask for help." This is the central verse of Al-Fatiha and the axis of the Quran''s message. The pronoun "You" (iyyaka) is placed before the verb for emphasis and exclusivity — meaning: we do not worship anyone except You. Ibn Kathir explains that this verse combines two pillars of religion: ibadah (worship) and tawakkul (reliance on Allah). True worship is only accepted when combined with sincere seeking of help from Allah. The verse shifts from third person (describing Allah''s attributes) to second person (direct address), marking the moment of direct connection between worshipper and Lord. This transition — called iltifat in Arabic rhetoric — is a profound grammatical shift that signals intimacy.',
  'en',
  1,
  17
);

-- Ayah 1:6 — Ihdina al-sirat al-mustaqim
INSERT OR IGNORE INTO tafsir_entries (ayah_id, tafsir_key, text, language, volume, page)
VALUES (
  6,
  'ibn-kathir',
  '"Guide us to the Straight Path." After affirming exclusive worship and reliance on Allah, the worshipper asks for the greatest gift: guidance. Al-Sirat al-Mustaqim (الصراط المستقيم) is the Straight Path — the clear, direct way to Allah''s pleasure and Paradise. Ibn Kathir cites the hadith that the Messenger of Allah ﷺ said: "This path is Islam." The word ihdina (guide us) combines two aspects: granting the ability to find the path, and granting the ability to stay on it. Even the Prophet ﷺ was commanded to recite this supplication, because guidance is continuous, not a one-time event — every action, decision, and moment requires Allah''s guidance.',
  'en',
  1,
  21
);

-- Ayah 1:7 — Sirat alladhina an'amta 'alayhim
INSERT OR IGNORE INTO tafsir_entries (ayah_id, tafsir_key, text, language, volume, page)
VALUES (
  7,
  'ibn-kathir',
  '"The path of those upon whom You have bestowed favor — not of those who have earned anger, nor of those who are astray." The blessed ones are the Prophets, truthful ones (siddiqun), martyrs, and righteous people (Quran 4:69). The "angry ones" (al-maghdubi 'alayhim) are those who knew the truth but willfully rejected it. The "astray ones" (al-dallin) are those who lost the path through ignorance or innovation. The Prophet ﷺ explicitly identified the first group with those who knew but rejected, and the second with those who worshipped without knowledge. This supplication in Al-Fatiha encapsulates the full purpose of the Quran: to guide humanity away from deviation and anger onto the straight path of those who earned divine blessing.',
  'en',
  1,
  30
);

-- ─── Add cross-reference: Ayah 1:7 references Quran 4:69 ─────────────────────
-- (tafsir_hadith_refs would go here once hadiths for these are inserted)
