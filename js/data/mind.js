/* Words for thinking — நிறங்கள், எண்கள், வடிவங்கள், எதிர்மறை, மரியாதை, நேரம் */
(function (TT) {
  'use strict';
  var D = TT.data;

  D.category({ key: 'colors', en: 'Colors', ta: 'நிறங்கள்', icon: '🌈', color: '#f43f5e', desc: 'Point and name' });
  D.words('colors', [
    { en: 'Red', ta: 'சிவப்பு', ro: 'sivappu', img: '🔴' },
    { en: 'Blue', ta: 'நீலம்', ro: 'neelam', img: '🔵' },
    { en: 'Green', ta: 'பச்சை', ro: 'pachai', img: '🟢' },
    { en: 'Yellow', ta: 'மஞ்சள்', ro: 'manjal', img: '🟡' },
    { en: 'Orange', ta: 'ஆரஞ்சு', ro: 'aaranju', img: '🟠' },
    { en: 'Purple', ta: 'ஊதா', ro: 'ootha', img: '🟣' },
    { en: 'Pink', ta: 'இளஞ்சிவப்பு', ro: 'ilanjivappu', img: '🌸' },
    { en: 'Brown', ta: 'பழுப்பு', ro: 'pazhappu', img: '🟤' },
    { en: 'Black', ta: 'கருப்பு', ro: 'karupu', img: '⚫' },
    { en: 'White', ta: 'வெள்ளை', ro: 'vellai', img: '⚪' },
    { en: 'Grey', ta: 'சாம்பல்', ro: 'saambal', img: '🌫️' },
    { en: 'Gold', ta: 'தங்கம்', ro: 'thangam', img: '🥇' },
    { en: 'Silver', ta: 'வெள்ளி', ro: 'velli', img: '🥈' },
    { en: 'Colour', ta: 'நிறம்', ro: 'niram', img: '🎨' }
  ]);

  /* q = how many pictures to show · sym = Tamil numeral badge */
  D.category({ key: 'numbers', en: 'Numbers', ta: 'எண்கள்', icon: '🔢', color: '#4f46e5', desc: 'Count with me' });
  D.words('numbers', [
    { en: 'One', ta: 'ஒன்று', ro: 'ondru', img: '🍎', q: 1, sym: '௧' },
    { en: 'Two', ta: 'இரண்டு', ro: 'irandu', img: '🍌', q: 2, sym: '௨' },
    { en: 'Three', ta: 'மூன்று', ro: 'moondru', img: '🍇', q: 3, sym: '௩' },
    { en: 'Four', ta: 'நான்கு', ro: 'naangu', img: '🍊', q: 4, sym: '௪' },
    { en: 'Five', ta: 'ஐந்து', ro: 'aindhu', img: '🥭', q: 5, sym: '௫' },
    { en: 'Six', ta: 'ஆறு', ro: 'aaru', img: '🍎', q: 6, sym: '௬' },
    { en: 'Seven', ta: 'ஏழு', ro: 'ezhu', img: '🍌', q: 7, sym: '௭' },
    { en: 'Eight', ta: 'எட்டு', ro: 'ettu', img: '🍇', q: 8, sym: '௮' },
    { en: 'Nine', ta: 'ஒன்பது', ro: 'onbadhu', img: '🍊', q: 9, sym: '௯' },
    { en: 'Ten', ta: 'பத்து', ro: 'paththu', img: '🥭', q: 10, sym: '௰' },
    { en: 'Zero', ta: 'பூஜ்ஜியம்', ro: 'poojiyam', img: '🚫', q: 1, sym: '௦' },
    { en: 'Many', ta: 'நிறைய', ro: 'niraiya', img: '⭐', q: 10 },
    { en: 'Two little', ta: 'ரெண்டு', ro: 'rendu', img: '👀', q: 2, note: 'Rendu is the everyday way to say two' }
  ]);

  D.category({ key: 'shapes', en: 'Shapes', ta: 'வடிவங்கள்', icon: '🔺', color: '#0f766e', desc: 'Round and pointy' });
  D.words('shapes', [
    { en: 'Circle', ta: 'வட்டம்', ro: 'vattam', img: '⭕' },
    { en: 'Square', ta: 'சதுரம்', ro: 'sathuram', img: '🟥' },
    { en: 'Triangle', ta: 'முக்கோணம்', ro: 'mukkornam', img: '🔺' },
    { en: 'Rectangle', ta: 'செவ்வகம்', ro: 'sevvagam', img: '🟫' },
    { en: 'Star', ta: 'நட்சத்திர வடிவம்', ro: 'natchathira', img: '⭐' },
    { en: 'Heart', ta: 'இதய வடிவம்', ro: 'idhaya', img: '❤️' },
    { en: 'Oval', ta: 'நீள்வட்டம்', ro: 'neelvattam', img: '🥚' },
    { en: 'Diamond', ta: 'வைர வடிவம்', ro: 'vaiira', img: '🔶' },
    { en: 'Crescent', ta: 'பாதி நிலா', ro: 'pathi nilaa', img: '🌙' },
    { en: 'Ball shape', ta: 'பந்து வடிவம்', ro: 'panthu vadivam', img: '⚽', tag: ['sphere', 'golam'] },
    { en: 'Line', ta: 'கோடு', ro: 'kodu', img: '➖' },
    { en: 'Dot', ta: 'புள்ளி', ro: 'pulli', img: '🔴' }
  ]);

  D.category({ key: 'opposites', en: 'Opposites', ta: 'எதிர்ச் சொற்கள்', icon: '🙃', color: '#9333ea', desc: 'Big and small' });
  D.words('opposites', [
    { en: 'Big', ta: 'பெரிய', ro: 'periya', img: '🐘' },
    { en: 'Small', ta: 'சின்ன', ro: 'chinna', img: '🐭', tag: ['small', 'siriya'] },
    { en: 'Long', ta: 'நீளம்', ro: 'neelam', img: '📏' },
    { en: 'Short', ta: 'குட்டை', ro: 'kuttai', img: '🤏' },
    { en: 'Fast', ta: 'வேகம்', ro: 'vegam', img: '🏃' },
    { en: 'Slow', ta: 'மெதுவாக', ro: 'methuvaga', img: '🐢' },
    { en: 'Up', ta: 'மேலே', ro: 'mele', img: '⬆️' },
    { en: 'Down', ta: 'கீழே', ro: 'keele', img: '⬇️' },
    { en: 'In', ta: 'உள்ளே', ro: 'ullae', img: '📥' },
    { en: 'Out', ta: 'வெளியே', ro: 'veliyae', img: '📤' },
    { en: 'Open', ta: 'திற', ro: 'thira', img: '🔓' },
    { en: 'Close', ta: 'மூடு', ro: 'moodu', img: '🔒' },
    { en: 'Full', ta: 'நிறைய', ro: 'niraiya', img: '🍯' },
    { en: 'Empty', ta: 'காலி', ro: 'kaali', img: '🫙' },
    { en: 'Heavy', ta: 'பாரம்', ro: 'baaram', img: '🏋️', tag: ['heavy', 'kanam'] },
    { en: 'Light', ta: 'இலேசு', ro: 'lesu', img: '🪶', tag: ['light', 'ilaghu'] },
    { en: 'New', ta: 'புதிய', ro: 'pudhiya', img: '🆕' },
    { en: 'Old', ta: 'பழைய', ro: 'pazhaiya', img: '🕰️' },
    { en: 'Wet', ta: 'ஈரம்', ro: 'eeram', img: '🌧️' },
    { en: 'Dry', ta: 'உலர்', ro: 'ular', img: '☀️' },
    { en: 'Clean', ta: 'சுத்தம்', ro: 'sutham', img: '✨' },
    { en: 'Dirty', ta: 'அழுக்கு', ro: 'azhukku', img: '🤢' },
    { en: 'Near', ta: 'அருகில்', ro: 'arugil', img: '📍' },
    { en: 'Far', ta: 'தூரம்', ro: 'thooram', img: '🔭' },
    { en: 'More', ta: 'அதிகம்', ro: 'adhigam', img: '➕' },
    { en: 'Less', ta: 'குறைவு', ro: 'kuraivu', img: '➖' },
    { en: 'Left', ta: 'இடது', ro: 'idathu', img: '👈' },
    { en: 'Right', ta: 'வலது', ro: 'valathu', img: '👉' },
    { en: 'Loud', ta: 'சத்தம்', ro: 'satham', img: '📢' },
    { en: 'Quiet', ta: 'அமைதி', ro: 'amaithi', img: '🤫' },
    { en: 'Strong', ta: 'வலிமை', ro: 'valimai', img: '💪' },
    { en: 'Weak', ta: 'பலவீனம்', ro: 'palaveenam', img: '🐌' },
    { en: 'Hard', ta: 'கடினம்', ro: 'kadhinam', img: '🪨' },
    { en: 'Soft', ta: 'மென்மை', ro: 'menmai', img: '☁️' },
    { en: 'Sweet', ta: 'இனிப்பு', ro: 'inippu', img: '🍬' },
    { en: 'Sour', ta: 'புளிப்பு', ro: 'pulippu', img: '🍋' }
  ]);

  D.category({ key: 'manners', en: 'Manners', ta: 'மரியாதை', icon: '🙏', color: '#ca8a04', desc: 'Polite words' });
  D.words('manners', [
    { en: 'Hello', ta: 'வணக்கம்', ro: 'vanakkam', img: '🙏', say: 'வணக்கம் — say it with folded hands!' },
    { en: 'Yes', ta: 'ஆமாம்', ro: 'aamaam', img: '✅', tag: ['yes', 'aam'] },
    { en: 'No', ta: 'இல்லை', ro: 'illai', img: '❌' },
    { en: 'Please', ta: 'தயவு செய்து', ro: 'dhayavu seithu', img: '🙇' },
    { en: 'Thank you', ta: 'நன்றி', ro: 'nandri', img: '🤝', say: 'நன்றி சொல்லணும்' },
    { en: 'Sorry', ta: 'மன்னி', ro: 'manni', img: '😔' },
    { en: 'Welcome', ta: 'வரவேற்பு', ro: 'varaverpu', img: '🤗' },
    { en: 'Goodbye', ta: 'போய் வருகேன்', ro: 'poi varugen', img: '👋' },
    { en: 'Good morning', ta: 'காலை வணக்கம்', ro: 'kaalai vanakkam', img: '🌅' },
    { en: 'Good night', ta: 'நல்ல இரவு', ro: 'nalla iravu', img: '🌙', tag: ['good night', 'iravu vanakkam'] },
    { en: 'Very good', ta: 'ரொம்ப நல்லது', ro: 'romba nalladhu', img: '👍' },
    { en: 'Super', ta: 'சூப்பர்', ro: 'super', img: '🌟' },
    { en: 'Stop', ta: 'நில்', ro: 'nil', img: '✋' },
    { en: 'Wait', ta: 'காத்திரு', ro: 'kaathiru', img: '⏳' },
    { en: 'Come here', ta: 'இங்க வா', ro: 'inga vaa', img: '🫴' },
    { en: 'Look', ta: 'பார்', ro: 'par', img: '👀' },
    { en: 'Sir', ta: 'ஐயா', ro: 'aiya', img: '👨' },
    { en: 'Love you', ta: 'நீங்கள் என் அன்பு', ro: 'neengal en anbu', img: '💖' }
  ]);

  D.category({ key: 'time', en: 'Time & days', ta: 'நேரம்', icon: '⏰', color: '#2563eb', desc: 'When is it?' });
  D.words('time', [
    { en: 'Morning', ta: 'காலை', ro: 'kaalai', img: '🌅' },
    { en: 'Noon', ta: 'மதியம்', ro: 'madhiyam', img: '☀️' },
    { en: 'Evening', ta: 'மாலை', ro: 'maalai', img: '🌆' },
    { en: 'Night', ta: 'இரவு', ro: 'iravu', img: '🌃' },
    { en: 'Day', ta: 'பகல்', ro: 'pagal', img: '🌞' },
    { en: 'Today', ta: 'இன்று', ro: 'indru', img: '📅' },
    { en: 'Tomorrow', ta: 'நாளை', ro: 'naalai', img: '🌄' },
    { en: 'Yesterday', ta: 'நேற்று', ro: 'netru', img: '🔙' },
    { en: 'Now', ta: 'இப்போ', ro: 'ippo', img: '⏱️' },
    { en: 'Later', ta: 'பிறகு', ro: 'piragu', img: '⏳' },
    { en: 'Week', ta: 'வாரம்', ro: 'vaaram', img: '🗓️' },
    { en: 'Month', ta: 'மாதம்', ro: 'maadham', img: '📆' },
    { en: 'Year', ta: 'ஆண்டு', ro: 'aandu', img: '🎆' },
    { en: 'Sunday', ta: 'ஞாயிறு', ro: 'naayiru', img: '🌞', tag: ['day of week'] },
    { en: 'Monday', ta: 'திங்கள்', ro: 'thingal', img: '🌙', tag: ['day of week'] },
    { en: 'Tuesday', ta: 'செவ்வாய்', ro: 'sevvai', img: '🔴', tag: ['day of week'] },
    { en: 'Wednesday', ta: 'புதன்', ro: 'budhan', img: '🟢', tag: ['day of week'] },
    { en: 'Thursday', ta: 'வியாழன்', ro: 'viyazhan', img: '🟡', tag: ['day of week'] },
    { en: 'Friday', ta: 'வெள்ளி', ro: 'velli', img: '⚪', tag: ['day of week'] },
    { en: 'Saturday', ta: 'சனி', ro: 'sani', img: '⚫', tag: ['day of week'] },
    { en: 'Summer', ta: 'கோடை', ro: 'kothai', img: '🏖️' },
    { en: 'Monsoon', ta: 'மழைக்காலம்', ro: 'mazaikkalam', img: '🌧️' },
    { en: 'Winter', ta: 'குளிர்காலம்', ro: 'kulirkalam', img: '❄️' },
    { en: 'Spring', ta: 'இளவேனில்', ro: 'ilavenil', img: '🌸' },
    { en: 'Festival time', ta: 'பண்டிகை', ro: 'pandigai', img: '🎉' }
  ]);
})(window.TT = window.TT || {});
