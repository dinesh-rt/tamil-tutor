/* People, body & feelings — குடும்பம், தொழில்கள், உடல், உணர்வுகள் */
(function (TT) {
  'use strict';
  var D = TT.data;

  D.category({ key: 'family', en: 'Family', ta: 'குடும்பம்', icon: '👨‍👩‍👧‍👦', color: '#e11d48', desc: 'People we love' });
  D.words('family', [
    { en: 'Mother', ta: 'அம்மா', ro: 'amma', img: '👩', mo: 'sway', say: 'அம்மா வந்திட்டாங்க!' },
    { en: 'Father', ta: 'அப்பா', ro: 'appa', img: '👨', mo: 'sway' },
    { en: 'Baby', ta: 'குழந்தை', ro: 'kuzhandhai', img: '👶', mo: 'bounce', say: 'என்னை பாரு — நான் குழந்தை!' },
    { en: 'Grandmother', ta: 'பாட்டி', ro: 'paatti', img: '👵', mo: 'sway', say: 'பாட்டி கதை சொல்வாங்க' },
    { en: 'Grandfather', ta: 'தாத்தா', ro: 'thaatha', img: '👴', mo: 'sway' },
    { en: 'Elder sister', ta: 'அக்கா', ro: 'akkaa', img: '👧', mo: 'twirl', tag: ['akka', 'sister'] },
    { en: 'Younger sister', ta: 'தங்கை', ro: 'thangai', img: '👧', mo: 'twirl', tag: ['thangai', 'sister'] },
    { en: 'Elder brother', ta: 'அண்ணன்', ro: 'annan', img: '👦', mo: 'bounce', tag: ['annan', 'brother'] },
    { en: 'Younger brother', ta: 'தம்பி', ro: 'thambi', img: '👦', mo: 'bounce', tag: ['thambi', 'brother'] },
    { en: 'Son', ta: 'மகன்', ro: 'magan', img: '👦', mo: 'bounce' },
    { en: 'Daughter', ta: 'மகள்', ro: 'magal', img: '👧', mo: 'twirl' },
    { en: 'Boy', ta: 'பையன்', ro: 'paiyan', img: '👦', mo: 'bounce' },
    { en: 'Girl', ta: 'பெண் குழந்தை', ro: 'pen kuzhandhai', img: '👧', mo: 'twirl' },
    { en: 'Man', ta: 'ஆண்', ro: 'aon', img: '👨', mo: 'pulse' },
    { en: 'Woman', ta: 'பெண்', ro: 'pen', img: '👩', mo: 'pulse' },
    { en: 'Maternal uncle', ta: 'மாமா', ro: 'maama', img: '🧔', mo: 'wave', note: 'Mama — mother’s brother' },
    { en: 'Aunt', ta: 'மாமி', ro: 'maami', img: '👩‍🦱', mo: 'wave' },
    { en: 'Uncle (dad’s brother)', ta: 'பெரியப்பா', ro: 'periyappa', img: '👨‍🦳', mo: 'wave', note: 'Father’s elder brother' },
    { en: 'Uncle junior', ta: 'சின்னப்பா', ro: 'chinnappa', img: '👨‍🦱', mo: 'wave', note: 'Father’s younger brother' },
    { en: 'Paternal aunt', ta: 'நித்தை', ro: 'nithai', img: '👩‍🦳', mo: 'wave', note: 'Father’s sister' },
    { en: 'Family', ta: 'குடும்பம்', ro: 'kutumbam', img: '👨‍👩‍👧‍👦', mo: 'bounce' },
    { en: 'Friend', ta: 'தோழன்', ro: 'thozhan', img: '🧒', mo: 'wave' },
    { en: 'Guest', ta: 'விருந்தாளி', ro: 'virunthaali', img: '🤝', mo: 'wave' },
    { en: 'Neighbour', ta: 'அக்கம் பக்கம்', ro: 'akkam pakkam', img: '🏘️', mo: 'pulse' }
  ]);

  D.category({ key: 'jobs', en: 'Jobs', ta: 'தொழில்கள்', icon: '👨‍🌾', color: '#0d9488', desc: 'What people do' });
  D.words('jobs', [
    { en: 'Teacher', ta: 'ஆசிரியர்', ro: 'aasiriyar', img: '👩‍🏫', mo: 'wave' },
    { en: 'Doctor', ta: 'மருத்துவர்', ro: 'maruththuvan', img: '👨‍⚕️', mo: 'pulse', say: 'மருத்துவர் பாத்துடுவாங்க' },
    { en: 'Nurse', ta: 'நர்ஸ்', ro: 'nurse', img: '👩‍⚕️', mo: 'pulse' },
    { en: 'Farmer', ta: 'விவசாயி', ro: 'vivasai', img: '👨‍🌾', mo: 'sway', note: 'Nellu — paddy — comes from the farmer' },
    { en: 'Cook', ta: 'சமையல்காரர்', ro: 'samaiyalkaarar', img: '👨‍🍳', mo: 'stir' },
    { en: 'Driver', ta: 'ஓட்டுநர்', ro: 'oattunar', img: '🚗', mo: 'drive' },
    { en: 'Pilot', ta: 'விமான ஓட்டுநர்', ro: 'vimaan oattunar', img: '🧑‍✈️', mo: 'fly' },
    { en: 'Police', ta: 'காவலர்', ro: 'kaavalar', img: '👮', mo: 'salute' },
    { en: 'Fireman', ta: 'தீயணைப்பு வீரன்', ro: 'theeyanaippu veeran', img: '🚒', mo: 'pulse' },
    { en: 'Postman', ta: 'தபால்காரர்', ro: 'thaapaalkaarar', img: '📬', mo: 'walk' },
    { en: 'Soldier', ta: 'இராணுவ வீரன்', ro: 'iraanuvu veeran', img: '🪖', mo: 'salute' },
    { en: 'Barber', ta: 'தையன்', ro: 'daiyan', img: '💈', mo: 'snip' },
    { en: 'Tailor', ta: 'தையல்காரர்', ro: 'thaiyalkaarar', img: '🪡', mo: 'poke' },
    { en: 'Carpenter', ta: 'தச்சர்', ro: 'thachar', img: '🪚', mo: 'saw' },
    { en: 'Fisherman', ta: 'மீனவன்', ro: 'meenavan', img: '🎣', mo: 'cast' },
    { en: 'Washerman', ta: 'தொழுவான்', ro: 'thozhuvan', img: '🧺', mo: 'sway' },
    { en: 'Singer', ta: 'பாடகர்', ro: 'paadakar', img: '🎤', mo: 'sing' },
    { en: 'Dancer', ta: 'நாட்டியக்காரி', ro: 'naattiyakaari', img: '💃', mo: 'dance' },
    { en: 'Artist', ta: 'ஓவியர்', ro: 'oviyaar', img: '🎨', mo: 'draw' },
    { en: 'Shopkeeper', ta: 'கடைக்காரர்', ro: 'kadaikkaarar', img: '🏪', mo: 'pulse' }
  ]);

  D.category({ key: 'body', en: 'Body', ta: 'உடல் பகுதிகள்', icon: '👀', color: '#f97316', desc: 'Head to toe' });
  D.words('body', [
    { en: 'Head', ta: 'தலை', ro: 'thalai', img: 'svg:head', mo: 'nod' },
    { en: 'Hair', ta: 'முடி', ro: 'mudi', img: '🦱', mo: 'sway' },
    { en: 'Face', ta: 'முகம்', ro: 'mugam', img: '🙂', mo: 'nod' },
    { en: 'Eyes', ta: 'கண்', ro: 'kan', img: '👀', mo: 'blink' },
    { en: 'Ear', ta: 'காது', ro: 'kaadhu', img: '👂', mo: 'wiggle' },
    { en: 'Nose', ta: 'மூக்கு', ro: 'mookku', img: '👃', mo: 'wiggle' },
    { en: 'Mouth', ta: 'வாய்', ro: 'vaai', img: '👄', mo: 'smack' },
    { en: 'Teeth', ta: 'பல்', ro: 'pal', img: '🦷', mo: 'shine' },
    { en: 'Tongue', ta: 'நாக்கு', ro: 'naakku', img: '👅', mo: 'wiggle' },
    { en: 'Chin', ta: 'தாடை', ro: 'thaadai', img: '🧑', mo: 'nod' },
    { en: 'Neck', ta: 'கழுத்து', ro: 'kazhuthu', img: '🦒', mo: 'stretch', note: 'Long like a mayil? No — like a giraffe!' },
    { en: 'Shoulder', ta: 'தோள்', ro: 'thol', img: '💪', mo: 'shrug' },
    { en: 'Hand', ta: 'கை', ro: 'kai', img: '✋', mo: 'wave' },
    { en: 'Finger', ta: 'விரல்', ro: 'viral', img: '☝️', mo: 'poke' },
    { en: 'Thumb', ta: 'கட்டை விரல்', ro: 'kattai viral', img: '👍', mo: 'up' },
    { en: 'Leg', ta: 'கால்', ro: 'kaal', img: '🦵', mo: 'kick' },
    { en: 'Knee', ta: 'முழங்கால்', ro: 'muzhangaal', img: '🦵', mo: 'bend' },
    { en: 'Foot', ta: 'அடி', ro: 'adi', img: '🦶', mo: 'stomp' },
    { en: 'Toes', ta: 'கால் விரல்', ro: 'kaal viral', img: '🦶', mo: 'wiggle' },
    { en: 'Belly', ta: 'வயிறு', ro: 'vaiyiru', img: 'svg:belly', mo: 'bubble', say: 'வயிறு — இங்கே இருக்கு!' },
    { en: 'Back', ta: 'முதுகு', ro: 'mudhugu', img: '🧎', mo: 'sway' },
    { en: 'Bone', ta: 'எலும்பு', ro: 'elumbu', img: '🦴', mo: 'shake' },
    { en: 'Blood', ta: 'இரத்தம்', ro: 'iratham', img: '🩸', mo: 'drip' },
    { en: 'Heart', ta: 'இதயம்', ro: 'idhayam', img: '❤️', mo: 'heartbeat' },
    { en: 'Brain', ta: 'மூளை', ro: 'molai', img: '🧠', mo: 'pulse' },
    { en: 'Sweat', ta: 'வியர்வை', ro: 'viyarvai', img: '💦', mo: 'drip' },
    { en: 'Skin', ta: 'தோல்', ro: 'thol', img: '🖐️', mo: 'wiggle' }
  ]);

  D.category({ key: 'feelings', en: 'Feelings', ta: 'உணர்வுகள்', icon: '😊', color: '#c026d3', desc: 'How do you feel?' });
  D.words('feelings', [
    { en: 'Happy', ta: 'மகிழ்ச்சி', ro: 'maghizhchi', img: '😊', mo: 'bounce', say: 'எனக்கு மகிழ்ச்சி!' },
    { en: 'Sad', ta: 'துக்கம்', ro: 'thukkam', img: '😢', mo: 'fade' },
    { en: 'Angry', ta: 'கோபம்', ro: 'kobam', img: '😠', mo: 'shake' },
    { en: 'Scared', ta: 'பயம்', ro: 'bayam', img: '😨', mo: 'shiver' },
    { en: 'Tired', ta: 'சோர்வு', ro: 'sorvu', img: '😪', mo: 'droop' },
    { en: 'Sleepy', ta: 'தூக்கம்', ro: 'thookkam', img: '😴', mo: 'float' },
    { en: 'Hungry', ta: 'பசி', ro: 'pasi', img: '😋', mo: 'rub', say: 'எனக்கு பசிக்குது' },
    { en: 'Thirsty', ta: 'தாகம்', ro: 'thaagam', img: '🥤', mo: 'rub' },
    { en: 'Laughing', ta: 'சிரிப்பு', ro: 'sirippu', img: '😂', mo: 'shake' },
    { en: 'Crying', ta: 'அழுகை', ro: 'azhukai', img: '😭', mo: 'fall' },
    { en: 'Surprised', ta: 'ஆச்சரியம்', ro: 'aachariyam', img: '😲', mo: 'pop' },
    { en: 'Shy', ta: 'நாணம்', ro: 'naanam', img: '🙈', mo: 'hide' },
    { en: 'Love', ta: 'அன்பு', ro: 'anbu', img: '❤️', mo: 'heartbeat' },
    { en: 'Excited', ta: 'உற்சாகம்', ro: 'utsagam', img: '🤩', mo: 'jump' },
    { en: 'Bored', ta: 'சலிப்பு', ro: 'salippu', img: '🥱', mo: 'yawn' },
    { en: 'Sick', ta: 'உடம்பு சரியில்லை', ro: 'udamburi sariyillai', img: '🤒', mo: 'shiver' },
    { en: 'Fine', ta: 'நலம்', ro: 'nalam', img: '🙂', mo: 'nod' },
    { en: 'Pain', ta: 'வலி', ro: 'vali', img: '😖', mo: 'shake' },
    { en: 'Brave', ta: 'தைரியம்', ro: 'thariyam', img: '💪', mo: 'flex' },
    { en: 'Confused', ta: 'குழப்பம்', ro: 'kuzhappam', img: '😵‍💫', mo: 'wobble' },
    { en: 'Silly', ta: 'வேடிக்கை', ro: 'vedikkai', img: '🤪', mo: 'wiggle' },
    { en: 'Calm', ta: 'அமைதி', ro: 'amaithi', img: '😌', mo: 'float' }
  ]);
})(window.TT = window.TT || {});
