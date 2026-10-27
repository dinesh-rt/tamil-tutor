/* People, body & feelings — குடும்பம், தொழில்கள், உடல், உணர்வுகள் */
(function (TT) {
  'use strict';
  var D = TT.data;

  D.category({ key: 'family', en: 'Family', ta: 'குடும்பம்', icon: '👨‍👩‍👧‍👦', color: '#e11d48', desc: 'People we love' });
  D.words('family', [
    { en: 'Mother', ta: 'அம்மா', ro: 'amma', img: '👩', say: 'அம்மா வந்திட்டாங்க!' },
    { en: 'Father', ta: 'அப்பா', ro: 'appa', img: '👨' },
    { en: 'Baby', ta: 'குழந்தை', ro: 'kuzhandhai', img: '👶', say: 'என்னை பாரு — நான் குழந்தை!' },
    { en: 'Grandmother', ta: 'பாட்டி', ro: 'paatti', img: '👵', say: 'பாட்டி கதை சொல்வாங்க' },
    { en: 'Grandfather', ta: 'தாத்தா', ro: 'thaatha', img: '👴' },
    { en: 'Elder sister', ta: 'அக்கா', ro: 'akkaa', img: '👧', tag: ['akka', 'sister'] },
    { en: 'Younger sister', ta: 'தங்கச்சி', ro: 'thangacchi', img: '👧', tag: ['thangai', 'sister'] },
    { en: 'Elder brother', ta: 'அண்ணன்', ro: 'annan', img: '👦', tag: ['annan', 'brother'] },
    { en: 'Younger brother', ta: 'தம்பி', ro: 'thambi', img: '👦', tag: ['thambi', 'brother'] },
    { en: 'Son', ta: 'மகன்', ro: 'magan', img: '👦' },
    { en: 'Daughter', ta: 'மகள்', ro: 'magal', img: '👧' },
    { en: 'Boy', ta: 'பையன்', ro: 'paiyan', img: '👦' },
    { en: 'Girl', ta: 'பெண் குழந்தை', ro: 'pen kuzhandhai', img: '👧' },
    { en: 'Man', ta: 'ஆண்', ro: 'aon', img: '👨' },
    { en: 'Woman', ta: 'பெண்', ro: 'pen', img: '👩' },
    { en: 'Maternal uncle', ta: 'மாமா', ro: 'maama', img: '🧔', note: 'Mama — mother’s brother' },
    { en: 'Aunt', ta: 'மாமி', ro: 'maami', img: '👩‍🦱' },
    { en: 'Uncle (dad’s brother)', ta: 'பெரியப்பா', ro: 'periyappa', img: '👨‍🦳', note: 'Father’s elder brother' },
    { en: 'Uncle junior', ta: 'சின்னப்பா', ro: 'chinnappa', img: '👨‍🦱', note: 'Father’s younger brother' },
    { en: 'Paternal aunt', ta: 'நித்தை', ro: 'nithai', img: '👩‍🦳', note: 'Father’s sister' },
    { en: 'Family', ta: 'குடும்பம்', ro: 'kutumbam', img: '👨‍👩‍👧‍👦' },
    { en: 'Friend', ta: 'நண்பன்', ro: 'nanban', img: '🧒', tag: ['friend', 'thozhan'] },
    { en: 'Guest', ta: 'விருந்தாளி', ro: 'virunthaali', img: '🤝' },
    { en: 'Neighbour', ta: 'அக்கம் பக்கம்', ro: 'akkam pakkam', img: '🏘️' }
  ]);

  D.category({ key: 'jobs', en: 'Jobs', ta: 'தொழில்கள்', icon: '👨‍🌾', color: '#0d9488', desc: 'What people do' });
  D.words('jobs', [
    { en: 'Teacher', ta: 'டீச்சர்', ro: 'theecher', img: '👩‍🏫', tag: ['teacher', 'aasiriyar', 'master'] },
    { en: 'Doctor', ta: 'டாக்டர்', ro: 'daactar', img: '👨‍⚕️', tag: ['doctor', 'maruththuvan'], say: 'டாக்டர் பாத்துடுவாங்க' },
    { en: 'Nurse', ta: 'நர்ஸ்', ro: 'nurse', img: '👩‍⚕️' },
    { en: 'Farmer', ta: 'விவசாயி', ro: 'vivasai', img: '👨‍🌾', note: 'Nellu — paddy — comes from the farmer' },
    { en: 'Cook', ta: 'சமையல்காரர்', ro: 'samaiyalkaarar', img: '👨‍🍳' },
    { en: 'Driver', ta: 'டிரைவர்', ro: 'driver', img: '🚗', tag: ['driver', 'oattunar'] },
    { en: 'Pilot', ta: 'பைலட்', ro: 'bilat', img: '🧑‍✈️', tag: ['pilot', 'vimaan oattunar'] },
    { en: 'Police', ta: 'பொலிஸ்', ro: 'polis', img: '👮', tag: ['police', 'kaavalar'] },
    { en: 'Fireman', ta: 'தீயணைப்பு வீரன்', ro: 'theeyanaippu veeran', img: '🚒' },
    { en: 'Postman', ta: 'தபால்காரர்', ro: 'thaapaalkaarar', img: '📬' },
    { en: 'Soldier', ta: 'இராணுவ வீரன்', ro: 'iraanuvu veeran', img: '🪖' },
    { en: 'Barber', ta: 'தையன்', ro: 'daiyan', img: '💈' },
    { en: 'Tailor', ta: 'தையல்காரர்', ro: 'thaiyalkaarar', img: '🪡' },
    { en: 'Carpenter', ta: 'தச்சர்', ro: 'thachar', img: '🪚' },
    { en: 'Fisherman', ta: 'மீனவன்', ro: 'meenavan', img: '🎣' },
    { en: 'Washerman', ta: 'தொழுவான்', ro: 'thozhuvan', img: '🧺' },
    { en: 'Singer', ta: 'பாடகர்', ro: 'paadakar', img: '🎤' },
    { en: 'Dancer', ta: 'நாட்டியக்காரி', ro: 'naattiyakaari', img: '💃' },
    { en: 'Artist', ta: 'ஓவியர்', ro: 'oviyaar', img: '🎨' },
    { en: 'Shopkeeper', ta: 'கடைக்காரர்', ro: 'kadaikkaarar', img: '🏪' }
  ]);

  D.category({ key: 'body', en: 'Body', ta: 'உடல் பகுதிகள்', icon: '👀', color: '#f97316', desc: 'Head to toe' });
  D.words('body', [
    { en: 'Head', ta: 'தலை', ro: 'thalai', img: 'svg:head' },
    { en: 'Hair', ta: 'முடி', ro: 'mudi', img: '🦱' },
    { en: 'Face', ta: 'முகம்', ro: 'mugam', img: '🙂' },
    { en: 'Eyes', ta: 'கண்', ro: 'kan', img: '👀' },
    { en: 'Ear', ta: 'காது', ro: 'kaadhu', img: '👂' },
    { en: 'Nose', ta: 'மூக்கு', ro: 'mookku', img: '👃' },
    { en: 'Mouth', ta: 'வாய்', ro: 'vaai', img: '👄' },
    { en: 'Teeth', ta: 'பல்', ro: 'pal', img: '🦷' },
    { en: 'Tongue', ta: 'நாக்கு', ro: 'naakku', img: '👅' },
    { en: 'Chin', ta: 'தாடை', ro: 'thaadai', img: '🧑' },
    { en: 'Neck', ta: 'கழுத்து', ro: 'kazhuthu', img: 'svg:neck', note: 'The giraffe has the longest neck!' },
    { en: 'Shoulder', ta: 'தோள்', ro: 'thol', img: '💪' },
    { en: 'Hand', ta: 'கை', ro: 'kai', img: '✋' },
    { en: 'Finger', ta: 'விரல்', ro: 'viral', img: '☝️' },
    { en: 'Thumb', ta: 'கட்டை விரல்', ro: 'kattai viral', img: '👍' },
    { en: 'Leg', ta: 'கால்', ro: 'kaal', img: '🦵' },
    { en: 'Knee', ta: 'முட்டி', ro: 'mutti', img: '🦵', tag: ['knee', 'muzhangaal'] },
    { en: 'Foot', ta: 'அடி', ro: 'adi', img: '🦶' },
    { en: 'Toes', ta: 'கால் விரல்', ro: 'kaal viral', img: '🦶' },
    { en: 'Belly', ta: 'வயிறு', ro: 'vaiyiru', img: 'svg:belly', say: 'வயிறு — இங்கே இருக்கு!' },
    { en: 'Back', ta: 'முதுகு', ro: 'mudhugu', img: '🧎' },
    { en: 'Bone', ta: 'எலும்பு', ro: 'elumbu', img: '🦴' },
    { en: 'Blood', ta: 'இரத்தம்', ro: 'iratham', img: '🩸' },
    { en: 'Heart', ta: 'இதயம்', ro: 'idhayam', img: '❤️' },
    { en: 'Brain', ta: 'மூளை', ro: 'molai', img: '🧠' },
    { en: 'Sweat', ta: 'வியர்வை', ro: 'viyarvai', img: '💦' },
    { en: 'Skin', ta: 'தோல்', ro: 'thol', img: '🖐️' }
  ]);

  D.category({ key: 'feelings', en: 'Feelings', ta: 'உணர்வுகள்', icon: '😊', color: '#c026d3', desc: 'How do you feel?' });
  D.words('feelings', [
    { en: 'Happy', ta: 'சந்தோஷம்', ro: 'santhosham', img: '😊', tag: ['happy', 'maghizhchi'], say: 'எனக்கு சந்தோஷம்!' },
    { en: 'Sad', ta: 'சோகம்', ro: 'sogam', img: '😢', tag: ['sad', 'thukkam'] },
    { en: 'Angry', ta: 'கோபம்', ro: 'kobam', img: '😠' },
    { en: 'Scared', ta: 'பயம்', ro: 'bayam', img: '😨' },
    { en: 'Tired', ta: 'களைப்பு', ro: 'kulaippu', img: '😪', tag: ['tired', 'sorvu'] },
    { en: 'Sleepy', ta: 'தூக்கம்', ro: 'thookkam', img: '😴' },
    { en: 'Hungry', ta: 'பசி', ro: 'pasi', img: '😋', say: 'எனக்கு பசிக்குது' },
    { en: 'Thirsty', ta: 'தாகம்', ro: 'thaagam', img: '🥤' },
    { en: 'Laughing', ta: 'சிரிப்பு', ro: 'sirippu', img: '😂', mo: 'shake' },
    { en: 'Crying', ta: 'அழுகை', ro: 'azhukai', img: '😭', mo: 'fall' },
    { en: 'Surprised', ta: 'ஆச்சரியம்', ro: 'aachariyam', img: '😲' },
    { en: 'Shy', ta: 'வெட்கம்', ro: 'vedkam', img: '🙈', tag: ['shy', 'naanam'] },
    { en: 'Love', ta: 'அன்பு', ro: 'anbu', img: '❤️' },
    { en: 'Excited', ta: 'உற்சாகம்', ro: 'utsagam', img: '🤩' },
    { en: 'Bored', ta: 'சலிப்பு', ro: 'salippu', img: '🥱' },
    { en: 'Sick', ta: 'உடம்பு சரியில்லை', ro: 'udambhu sariyillai', img: '🤒' },
    { en: 'Fine', ta: 'நலம்', ro: 'nalam', img: '🙂' },
    { en: 'Pain', ta: 'வலி', ro: 'vali', img: '😖' },
    { en: 'Brave', ta: 'தைரியம்', ro: 'thariyam', img: '💪' },
    { en: 'Confused', ta: 'குழப்பம்', ro: 'kuzhappam', img: '😵‍💫' },
    { en: 'Silly', ta: 'வேடிக்கை', ro: 'vedikkai', img: '🤪' },
    { en: 'Calm', ta: 'அமைதி', ro: 'amaithi', img: '😌' }
  ]);
})(window.TT = window.TT || {});
