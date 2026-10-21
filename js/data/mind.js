/* Words for thinking — நிறங்கள், எண்கள், வடிவங்கள், எதிர்மறை, மரியாதை, நேரம் */
(function (TT) {
  'use strict';
  var D = TT.data;

  D.category({ key: 'colors', en: 'Colors', ta: 'நிறங்கள்', icon: '🌈', color: '#f43f5e', desc: 'Point and name' });
  D.words('colors', [
    { en: 'Red', ta: 'சிவப்பு', ro: 'sivappu', img: '🔴', mo: 'pulse' },
    { en: 'Blue', ta: 'நீலம்', ro: 'neelam', img: '🔵', mo: 'pulse' },
    { en: 'Green', ta: 'பச்சை', ro: 'pachai', img: '🟢', mo: 'pulse' },
    { en: 'Yellow', ta: 'மஞ்சள்', ro: 'manjal', img: '🟡', mo: 'pulse' },
    { en: 'Orange', ta: 'ஆரஞ்சு', ro: 'aaranju', img: '🟠', mo: 'pulse' },
    { en: 'Purple', ta: 'ஊதா', ro: 'ootha', img: '🟣', mo: 'pulse' },
    { en: 'Pink', ta: 'இளஞ்சிவப்பு', ro: 'ilanjivappu', img: '🌸', mo: 'bloom' },
    { en: 'Brown', ta: 'பழுப்பு', ro: 'pazhappu', img: '🟤', mo: 'pulse' },
    { en: 'Black', ta: 'கருப்பு', ro: 'karupu', img: '⚫', mo: 'pulse' },
    { en: 'White', ta: 'வெள்ளை', ro: 'vellai', img: '⚪', mo: 'pulse' },
    { en: 'Grey', ta: 'சாம்பல்', ro: 'saambal', img: '🌫️', mo: 'fade' },
    { en: 'Gold', ta: 'தங்கம்', ro: 'thangam', img: '🥇', mo: 'shine' },
    { en: 'Silver', ta: 'வெள்ளி', ro: 'velli', img: '🥈', mo: 'shine' },
    { en: 'Colour', ta: 'நிறம்', ro: 'niram', img: '🎨', mo: 'spin' }
  ]);

  /* q = how many pictures to show · sym = Tamil numeral badge */
  D.category({ key: 'numbers', en: 'Numbers', ta: 'எண்கள்', icon: '🔢', color: '#4f46e5', desc: 'Count with me' });
  D.words('numbers', [
    { en: 'One', ta: 'ஒன்று', ro: 'ondru', img: '🍎', q: 1, sym: '௧', mo: 'bounce' },
    { en: 'Two', ta: 'இரண்டு', ro: 'irandu', img: '🍌', q: 2, sym: '௨', mo: 'bounce' },
    { en: 'Three', ta: 'மூன்று', ro: 'moondru', img: '🍇', q: 3, sym: '௩', mo: 'bounce' },
    { en: 'Four', ta: 'நான்கு', ro: 'naangu', img: '🍊', q: 4, sym: '௪', mo: 'bounce' },
    { en: 'Five', ta: 'ஐந்து', ro: 'aindhu', img: '🥭', q: 5, sym: '௫', mo: 'bounce' },
    { en: 'Six', ta: 'ஆறு', ro: 'aaru', img: '🍎', q: 6, sym: '௬', mo: 'bounce' },
    { en: 'Seven', ta: 'ஏழு', ro: 'ezhu', img: '🍌', q: 7, sym: '௭', mo: 'bounce' },
    { en: 'Eight', ta: 'எட்டு', ro: 'ettu', img: '🍇', q: 8, sym: '௮', mo: 'bounce' },
    { en: 'Nine', ta: 'ஒன்பது', ro: 'onbadhu', img: '🍊', q: 9, sym: '௯', mo: 'bounce' },
    { en: 'Ten', ta: 'பத்து', ro: 'paththu', img: '🥭', q: 10, sym: '௰', mo: 'bounce' },
    { en: 'Zero', ta: 'பூஜ்யம்', ro: 'soojyam', img: '🚫', q: 1, sym: '௦', mo: 'shake' },
    { en: 'Many', ta: 'நிறைய', ro: 'niraiya', img: '⭐', q: 10, mo: 'twinkle' },
    { en: 'Two little', ta: 'ரெண்டு', ro: 'rendu', img: '👀', q: 2, mo: 'blink', note: 'Rendu is the everyday way to say two' }
  ]);

  D.category({ key: 'shapes', en: 'Shapes', ta: 'வடிவங்கள்', icon: '🔺', color: '#0f766e', desc: 'Round and pointy' });
  D.words('shapes', [
    { en: 'Circle', ta: 'வட்டம்', ro: 'vattam', img: '⭕', mo: 'spin' },
    { en: 'Square', ta: 'சதுரம்', ro: 'sathuram', img: '🟥', mo: 'pulse' },
    { en: 'Triangle', ta: 'முக்கோணம்', ro: 'mukkornam', img: '🔺', mo: 'pop' },
    { en: 'Rectangle', ta: 'செவ்வகம்', ro: 'sevvagam', img: '🟫', mo: 'pulse' },
    { en: 'Star', ta: 'நட்சத்திர வடிவம்', ro: 'natchathira', img: '⭐', mo: 'twinkle' },
    { en: 'Heart', ta: 'இதய வடிவம்', ro: 'idhaya', img: '❤️', mo: 'heartbeat' },
    { en: 'Oval', ta: 'நீள்வட்டம்', ro: 'neelvattam', img: '🥚', mo: 'wobble' },
    { en: 'Diamond', ta: 'வைர வடிவம்', ro: 'vaiira', img: '🔶', mo: 'shine' },
    { en: 'Crescent', ta: 'பாதி நிலா', ro: 'pathi nilaa', img: '🌙', mo: 'float' },
    { en: 'Ball shape', ta: 'கோளம்', ro: 'golam', img: '⚽', mo: 'bounce' },
    { en: 'Line', ta: 'கோடு', ro: 'kodu', img: '➖', mo: 'stretch' },
    { en: 'Dot', ta: 'புள்ளி', ro: 'pulli', img: '🔴', mo: 'pop' }
  ]);

  D.category({ key: 'opposites', en: 'Opposites', ta: 'எதிர்ச் சொற்கள்', icon: '🙃', color: '#9333ea', desc: 'Big and small' });
  D.words('opposites', [
    { en: 'Big', ta: 'பெரிய', ro: 'periya', img: '🐘', mo: 'grow' },
    { en: 'Small', ta: 'சிறிய', ro: 'siriya', img: '🐭', mo: 'shrink' },
    { en: 'Long', ta: 'நீளம்', ro: 'neelam', img: '📏', mo: 'stretch' },
    { en: 'Short', ta: 'குட்டை', ro: 'kuttai', img: '🤏', mo: 'shrink' },
    { en: 'Fast', ta: 'வேகம்', ro: 'vegamaaga', img: '🏃', mo: 'run' },
    { en: 'Slow', ta: 'மெதுவாக', ro: 'methuvaga', img: '🐢', mo: 'crawl' },
    { en: 'Up', ta: 'மேலே', ro: 'mele', img: '⬆️', mo: 'up' },
    { en: 'Down', ta: 'கீழே', ro: 'keele', img: '⬇️', mo: 'down' },
    { en: 'In', ta: 'உள்ளே', ro: 'ullae', img: '📥', mo: 'pop' },
    { en: 'Out', ta: 'வெளியே', ro: 'veliyae', img: '📤', mo: 'pop' },
    { en: 'Open', ta: 'திற', ro: 'thira', img: '🔓', mo: 'swing' },
    { en: 'Close', ta: 'மூடு', ro: 'moodu', img: '🔒', mo: 'click' },
    { en: 'Full', ta: 'நிறைய', ro: 'niraiya', img: '🍯', mo: 'pulse' },
    { en: 'Empty', ta: 'காலி', ro: 'kaali', img: '🫙', mo: 'fade' },
    { en: 'Heavy', ta: 'கனம்', ro: 'kamam', img: '🏋️', mo: 'stomp' },
    { en: 'Light', ta: 'இலகு', ro: 'ilaghu', img: '🪶', mo: 'float' },
    { en: 'New', ta: 'புதிய', ro: 'pudhiya', img: '🆕', mo: 'shine' },
    { en: 'Old', ta: 'பழைய', ro: 'pazhaiya', img: '🕰️', mo: 'fade' },
    { en: 'Wet', ta: 'ஈரம்', ro: 'eamam', img: '🌧️', mo: 'drip' },
    { en: 'Dry', ta: 'உலர்', ro: 'ular', img: '☀️', mo: 'pulse' },
    { en: 'Clean', ta: 'சுத்தம்', ro: 'sutham', img: '✨', mo: 'twinkle' },
    { en: 'Dirty', ta: 'அழுக்கு', ro: 'azhukku', img: '🤢', mo: 'shake' },
    { en: 'Near', ta: 'அருகில்', ro: 'arugil', img: '📍', mo: 'pop' },
    { en: 'Far', ta: 'தூரம்', ro: 'thooram', img: '🔭', mo: 'zoom' },
    { en: 'More', ta: 'அதிகம்', ro: 'adhigam', img: '➕', mo: 'grow' },
    { en: 'Less', ta: 'குறைவு', ro: 'kuraivu', img: '➖', mo: 'shrink' },
    { en: 'Left', ta: 'இடது', ro: 'idathu', img: '👈', mo: 'slide-left' },
    { en: 'Right', ta: 'வலது', ro: 'valathu', img: '👉', mo: 'slide-right' },
    { en: 'Loud', ta: 'சத்தம்', ro: 'satham', img: '📢', mo: 'shake' },
    { en: 'Quiet', ta: 'அமைதி', ro: 'amaithi', img: '🤫', mo: 'fade' },
    { en: 'Strong', ta: 'வலிமை', ro: 'valimai', img: '💪', mo: 'flex' },
    { en: 'Weak', ta: 'பலவீனம்', ro: 'palaveenam', img: '🐌', mo: 'crawl' },
    { en: 'Hard', ta: 'கடினம்', ro: 'kadhinam', img: '🪨', mo: 'pulse' },
    { en: 'Soft', ta: 'மென்மை', ro: 'menmai', img: '☁️', mo: 'float' },
    { en: 'Sweet', ta: 'இனிப்பு', ro: 'inippu', img: '🍬', mo: 'twinkle' },
    { en: 'Sour', ta: 'புளிப்பு', ro: 'pulippu', img: '🍋', mo: 'sour' }
  ]);

  D.category({ key: 'manners', en: 'Manners', ta: 'மரியாதை', icon: '🙏', color: '#ca8a04', desc: 'Polite words' });
  D.words('manners', [
    { en: 'Hello', ta: 'வணக்கம்', ro: 'vanakkam', img: '🙏', mo: 'wave', say: 'வணக்கம் — say it with folded hands!' },
    { en: 'Yes', ta: 'ஆம்', ro: 'aam', img: '✅', mo: 'nod' },
    { en: 'No', ta: 'இல்லை', ro: 'illai', img: '❌', mo: 'shake' },
    { en: 'Please', ta: 'தயவு செய்து', ro: 'dhayavu seithu', img: '🙇', mo: 'bow' },
    { en: 'Thank you', ta: 'நன்றி', ro: 'nandri', img: '🤝', mo: 'wave', say: 'நன்றி சொல்லணும்' },
    { en: 'Sorry', ta: 'மன்னி', ro: 'manni', img: '😔', mo: 'bow' },
    { en: 'Welcome', ta: 'வரவேற்பு', ro: 'varaverpu', img: '🤗', mo: 'hug' },
    { en: 'Goodbye', ta: 'போய் வருகேன்', ro: 'poi varugen', img: '👋', mo: 'wave' },
    { en: 'Good morning', ta: 'காலை வணக்கம்', ro: 'kaalai vanakkam', img: '🌅', mo: 'grow' },
    { en: 'Good night', ta: 'இரவு வணக்கம்', ro: 'iravu vanakkam', img: '🌙', mo: 'float' },
    { en: 'Very good', ta: 'ரொம்ப நன்று', ro: 'romba nandru', img: '👍', mo: 'up' },
    { en: 'Super', ta: 'சூப்பர்', ro: 'super', img: '🌟', mo: 'twinkle' },
    { en: 'Stop', ta: 'நில்', ro: 'nil', img: '✋', mo: 'freeze' },
    { en: 'Wait', ta: 'காத்திரு', ro: 'kaathiru', img: '⏳', mo: 'fade' },
    { en: 'Come here', ta: 'இங்க வா', ro: 'inga vaa', img: '🫴', mo: 'come' },
    { en: 'Look', ta: 'பார்', ro: 'par', img: '👀', mo: 'blink' },
    { en: 'Sir', ta: 'ஐயா', ro: 'aiya', img: '👨', mo: 'bow' },
    { en: 'Love you', ta: 'நீங்க என் அன்பு', ro: 'neengal en anbu', img: '💖', mo: 'heartbeat' }
  ]);

  D.category({ key: 'time', en: 'Time & days', ta: 'நேரம்', icon: '⏰', color: '#2563eb', desc: 'When is it?' });
  D.words('time', [
    { en: 'Morning', ta: 'காலை', ro: 'kaalai', img: '🌅', mo: 'grow' },
    { en: 'Noon', ta: 'மதியம்', ro: 'madhiyam', img: '☀️', mo: 'pulse' },
    { en: 'Evening', ta: 'மாலை', ro: 'maalai', img: '🌆', mo: 'float' },
    { en: 'Night', ta: 'இரவு', ro: 'iravu', img: '🌃', mo: 'fade' },
    { en: 'Day', ta: 'பகல்', ro: 'pagal', img: '🌞', mo: 'pulse' },
    { en: 'Today', ta: 'இன்று', ro: 'indru', img: '📅', mo: 'pop' },
    { en: 'Tomorrow', ta: 'நாளை', ro: 'naalai', img: '🌄', mo: 'up' },
    { en: 'Yesterday', ta: 'நேற்று', ro: 'netru', img: '🔙', mo: 'fade' },
    { en: 'Now', ta: 'இப்போ', ro: 'ippo', img: '⏱️', mo: 'tick' },
    { en: 'Later', ta: 'பிறகு', ro: 'piragu', img: '⏳', mo: 'fade' },
    { en: 'Week', ta: 'வாரம்', ro: 'vaaram', img: '🗓️', mo: 'pulse' },
    { en: 'Month', ta: 'மாதம்', ro: 'maadham', img: '📆', mo: 'pulse' },
    { en: 'Year', ta: 'ஆண்டு', ro: 'aandu', img: '🎆', mo: 'twinkle' },
    { en: 'Sunday', ta: 'ஞாயிறு', ro: 'kayiru', img: '🌞', mo: 'pulse', tag: ['day of week'] },
    { en: 'Monday', ta: 'திங்கள்', ro: 'thingal', img: '🌙', mo: 'float', tag: ['day of week'] },
    { en: 'Tuesday', ta: 'செவ்வாய்', ro: 'sevvai', img: '🔴', mo: 'pulse', tag: ['day of week'] },
    { en: 'Wednesday', ta: 'புதன்', ro: 'budhan', img: '🟢', mo: 'pulse', tag: ['day of week'] },
    { en: 'Thursday', ta: 'வியாழன்', ro: 'viyazhan', img: '🟡', mo: 'pulse', tag: ['day of week'] },
    { en: 'Friday', ta: 'வெள்ளி', ro: 'velli', img: '⚪', mo: 'shine', tag: ['day of week'] },
    { en: 'Saturday', ta: 'சனி', ro: 'sani', img: '⚫', mo: 'pulse', tag: ['day of week'] },
    { en: 'Summer', ta: 'கோடை', ro: 'kothai', img: '🏖️', mo: 'flicker' },
    { en: 'Monsoon', ta: 'மழைக்காலம்', ro: 'mazaikkalam', img: '🌧️', mo: 'fall' },
    { en: 'Winter', ta: 'குளிர்காலம்', ro: 'kulirkalam', img: '❄️', mo: 'fall' },
    { en: 'Spring', ta: 'இளவேனில்', ro: 'ilavenil', img: '🌸', mo: 'bloom' },
    { en: 'Festival time', ta: 'பண்டிகை', ro: 'pandigai', img: '🎉', mo: 'confetti' }
  ]);
})(window.TT = window.TT || {});
