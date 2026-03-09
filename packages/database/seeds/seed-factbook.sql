-- Factbook seed data: Islamic encyclopedia entries
-- These entries correspond to the demo data in FactbookPanel.tsx

INSERT OR IGNORE INTO factbook_entries (slug, title_arabic, title_english, type, summary, body) VALUES
(
  'ibrahim',
  'إبراهيم',
  'Ibrahim (Abraham)',
  'person',
  'The patriarch Prophet Ibrahim (Abraham), the father of monotheism, mentioned 69 times in the Quran.',
  'Ibrahim (عليه السلام) is one of the greatest Prophets in Islam, known as Khalilullah — the Friend of Allah. He is the ancestor of both the Arab and Israelite nations through his sons Ismail and Ishaq respectively.

Allah tested Ibrahim with numerous trials, the most famous being his willingness to sacrifice his son at Allah''s command. This event is commemorated annually during Eid al-Adha.

Ibrahim, together with his son Ismail, rebuilt the Ka''bah in Mecca, establishing it as the focal point of Islamic worship. He is mentioned by name 69 times in the Quran, more than any other prophet besides Musa.

**Key Quranic Themes:**
- His rejection of idolatry (Surah al-Anbiya'' 21:51-70)
- His argument about God with Nimrod (2:258)
- Building the Ka''bah (2:127)
- The sacrifice (37:99-111)
- His prayer for Mecca (14:35-41)'
),
(
  'musa',
  'موسى',
  'Musa (Moses)',
  'person',
  'Prophet Musa, the most frequently mentioned prophet in the Quran (136 times), who led the Children of Israel out of Egypt.',
  'Musa ibn Imran (عليه السلام) is the most frequently mentioned prophet in the Quran, appearing by name 136 times. He is one of the five greatest prophets (Ulul Azm).

Allah spoke to Musa directly, earning him the title Kalimullah (the one Allah spoke to). He was sent to Pharaoh (Fir''awn) and the Children of Israel (Banu Isra''il).

**Key Events:**
- Birth and rescue from Pharaoh''s persecution
- Encounter with Allah at the burning bush (28:29-30)
- The ten plagues of Egypt
- The parting of the Red Sea
- The revelation of the Torah at Mount Sinai
- The golden calf incident'
),
(
  'mecca',
  'مكة المكرمة',
  'Mecca (Makkah al-Mukarramah)',
  'place',
  'The holiest city in Islam, birthplace of the Prophet Muhammad ﷺ and site of the Masjid al-Haram and the Ka''bah.',
  'Mecca (مكة المكرمة — The Honored Mecca) is the holiest city in Islam, located in the Hejaz region of modern-day Saudi Arabia.

It is the birthplace of the Prophet Muhammad ﷺ (570 CE) and the site of the first revelation of the Quran (610 CE). The city houses the Masjid al-Haram, the largest mosque in the world, at the center of which stands the Ka''bah — the cubic structure that Muslims face during prayer.

**Significance:**
- Qiblah: Direction of Muslim prayer worldwide
- Hajj: One of the five pillars of Islam, annual pilgrimage
- Umrah: Minor pilgrimage, performable year-round
- Haram zone: Special sanctity and legal protections

**Quranic References:**
Mecca is referred to in the Quran as "Bakkah" (3:96), "Umm al-Qura" (Mother of Cities, 6:92, 42:7), and "al-Balad al-Amin" (the Secure City, 95:3).'
),
(
  'tawbah',
  'التوبة',
  'Tawbah (Repentance)',
  'concept',
  'The Islamic concept of sincere repentance and turning back to Allah, a central theme throughout the Quran.',
  'Tawbah (التوبة) — repentance — is one of the most important concepts in Islam. It refers to the act of turning away from sin and returning to Allah with sincere remorse.

**Conditions of Valid Tawbah (scholars'' consensus):**
1. Cessation of the sin immediately
2. Genuine remorse for having committed it
3. Firm resolve not to return to it
4. If the sin involved another person''s rights: restoring those rights

**Key Quranic Verses:**
- "Indeed, Allah loves those who constantly repent" (2:222)
- "Say: O My servants who have transgressed against themselves, do not despair of Allah''s mercy" (39:53)
- Surah al-Tawbah (Chapter 9) — the only surah without Bismillah at its start

**Allah''s Names related to Tawbah:**
- At-Tawwab (the Ever-Relenting, Most Acceptor of Repentance)
- Al-Ghafur (the Most Forgiving)
- Al-Ghaffar (the Repeatedly Forgiving)'
),
(
  'zakat',
  'الزكاة',
  'Zakat (Obligatory Charity)',
  'concept',
  'The third pillar of Islam — mandatory annual almsgiving of 2.5% on qualifying wealth held for one lunar year.',
  'Zakat (الزكاة) is the third of the Five Pillars of Islam and refers to the obligatory annual payment of a portion of qualifying wealth to designated categories of recipients.

**Calculation:**
- Rate: 2.5% of qualifying assets
- Threshold (nisab): Value equivalent to 85 grams of gold or 595 grams of silver
- Condition: Assets held for one full lunar year (hawl)

**Eight Categories of Recipients (Quran 9:60):**
1. Al-Fuqara'' (the poor)
2. Al-Masakin (the needy)
3. ''Amileen (zakat collectors)
4. Al-Mu''allafatu qulubuhum (those whose hearts are to be reconciled)
5. Fir-Riqab (freeing of slaves/captives)
6. Al-Gharimeen (those in debt)
7. Fi Sabilillah (in the cause of Allah)
8. Ibn al-Sabil (the wayfarer)

**Distinguished from Sadaqah:** Sadaqah is any voluntary charity; Zakat is obligatory.'
),
(
  'badr',
  'بدر',
  'Battle of Badr',
  'event',
  'The first major military engagement between the Muslims of Medina and the Quraysh of Mecca, in 2 AH (624 CE). A decisive Muslim victory.',
  'The Battle of Badr (غزوة بدر) took place on 17 Ramadan, 2 AH (13 March 624 CE) near the wells of Badr in the Hejaz region.

**Background:**
The Muslims of Medina, led by the Prophet ﷺ, intercepted a Qurayshi trading caravan returning from Syria. The Quraysh dispatched a large army to protect the caravan and confront the Muslims.

**Forces:**
- Muslim army: approximately 313–317 men, poorly equipped
- Qurayshi army: approximately 950–1,000 men, well-armed

**Outcome:**
A decisive Muslim victory. 70 Qurayshi soldiers were killed and 70 captured. Key Qurayshi leaders including Abu Jahl were killed. The Muslims lost 14 men.

**Quranic Significance:**
Allah sent angels to assist the Muslims (8:9). Surah al-Anfal (Chapter 8) was revealed largely in connection with this battle, addressing matters of war spoils, the etiquette of battle, and gratitude to Allah.

**Legacy:**
Badr is considered the most important battle in early Islamic history, establishing Muslim military credibility and demonstrating divine support for the nascent Muslim community.'
);
