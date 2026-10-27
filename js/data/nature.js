/* Nature & animals — விலங்குகள், பறவைகள், கடல், பூச்சிகள், இயற்கை, வானிலை */
(function (TT) {
  'use strict';
  var D = TT.data;

  D.category({ key: 'animals', en: 'Animals', ta: 'விலங்குகள்', icon: '🐘', color: '#e8792a', desc: 'Farm, forest and friends' });
  D.words('animals', [
    { en: 'Dog', ta: 'நாய்', ro: 'naai', img: '🐕', say: 'நாய் என்ன சொல்லும்? அவ் அவ்!', note: 'Puppy = குட்டி (kutti)' },
    { en: 'Cat', ta: 'பூனை', ro: 'poonai', img: '🐈', say: 'பூனை என்ன சொல்லும்? மியாவோ!' },
    { en: 'Cow', ta: 'மாடு', ro: 'maadu', img: '🐄', tag: ['pasu', 'cow'], say: 'மாடு என்ன சொல்லும்? ஆம்ம்!' },
    { en: 'Bull', ta: 'எருது', ro: 'eruthu', img: '🐂' },
    { en: 'Calf', ta: 'கன்று', ro: 'kandru', img: '🐮' },
    { en: 'Goat', ta: 'ஆடு', ro: 'aadu', img: '🐐' },
    { en: 'Sheep', ta: 'செம்மறி ஆடு', ro: 'semmari aadu', img: '🐑' },
    { en: 'Horse', ta: 'குதிரை', ro: 'kuthirai', img: '🐎' },
    { en: 'Donkey', ta: 'கழுதை', ro: 'kazhuthai', img: '🫏' },
    { en: 'Elephant', ta: 'யானை', ro: 'yaanai', img: '🐘', say: 'யானை வந்துடுச்சு — தும் தும்!' },
    { en: 'Lion', ta: 'சிங்கம்', ro: 'singam', img: '🦁' },
    { en: 'Tiger', ta: 'புலி', ro: 'puli', img: '🐅' },
    { en: 'Leopard', ta: 'சிறுத்தை', ro: 'siruthai', img: '🐆' },
    { en: 'Monkey', ta: 'குரங்கு', ro: 'kurangu', img: '🐒' },
    { en: 'Bear', ta: 'கரடி', ro: 'karadi', img: '🐻' },
    { en: 'Pig', ta: 'பன்றி', ro: 'panri', img: '🐖' },
    { en: 'Rabbit', ta: 'முயல்', ro: 'muyal', img: '🐇' },
    { en: 'Deer', ta: 'மான்', ro: 'maan', img: '🦌' },
    { en: 'Buffalo', ta: 'எருமை', ro: 'erumai', img: '🐃' },
    { en: 'Fox', ta: 'நரி', ro: 'nari', img: '🦊' },
    { en: 'Wolf', ta: 'ஓநாய்', ro: 'onai', img: '🐺' },
    { en: 'Camel', ta: 'ஒட்டகம்', ro: 'ottagam', img: '🐪' },
    { en: 'Mouse', ta: 'எலி', ro: 'eli', img: '🐁' },
    { en: 'Rat', ta: 'ஆய்', ro: 'aai', img: '🐀', note: 'ஆய் is the big field rat' },
    { en: 'Squirrel', ta: 'அணில்', ro: 'anil', img: '🐿️' },
    { en: 'Hedgehog', ta: 'முள்ளெலி', ro: 'mulleli', img: '🦔' },
    { en: 'Bat', ta: 'வவ்வாலை', ro: 'vavvalai', img: '🦇' },
    { en: 'Puppy', ta: 'நாய்க் குட்டி', ro: 'naai kutti', img: '🐶', tag: ['dog baby'] },
    { en: 'Kitten', ta: 'பூனைக் குட்டி', ro: 'poonai kutti', img: '🐱', tag: ['kitty'] },
    { en: 'Lamb', ta: 'ஆட்டுக் குட்டி', ro: 'aadu kutti', img: '🐑', tag: ['baby sheep'] },
    { en: 'Foal', ta: 'குதிரைக் குட்டி', ro: 'kuthirai kutti', img: '🐴' },
    { en: 'Rhino', ta: 'காண்டா', ro: 'kaanda', img: '🦏' },
    { en: 'Hippo', ta: 'நீர்யானை', ro: 'neer yaanai', img: '🦛', note: 'The water elephant' },
    { en: 'Giraffe', ta: 'ஒட்டகச் சிவிங்கி', ro: 'ottaga chivingi', img: '🦒', tag: ['giraffe', 'jiraaf'], note: 'Camel-leopard — the longest neck!' },
    { en: 'Zebra', ta: 'வரிக்குதிரை', ro: 'varikuthirai', img: '🦓', tag: ['zebra'], note: 'A striped horse' },
    { en: 'Kangaroo', ta: 'கங்காரு', ro: 'kangaru', img: '🦘' },
    { en: 'Panda', ta: 'பாண்டா', ro: 'paanda', img: '🐼' },
    { en: 'Koala', ta: 'கோவாலா', ro: 'kovaala', img: '🐨' },
    { en: 'Crocodile', ta: 'முதலை', ro: 'mudhalai', img: '🐊' },
    { en: 'Tortoise', ta: 'ஆமை', ro: 'aamai', img: '🐢' },
    { en: 'Frog', ta: 'தவளை', ro: 'thavalai', img: '🐸' },
    { en: 'Snake', ta: 'பாம்பு', ro: 'paambu', img: '🐍' },
    { en: 'Lizard', ta: 'பல்லி', ro: 'pulli', img: '🦎' },
    { en: 'Otter', ta: 'நீர்நாய்', ro: 'neernai', img: '🦦', tag: ['otter'] },
    { en: 'Baboon', ta: 'வந்தரம்', ro: 'vantharam', img: '🐒', tag: ['baboon', 'kurangu', 'vaalilaak kurangu'], note: 'The tailless monkey' }
  ]);

  D.category({ key: 'birds', en: 'Birds', ta: 'பறவைகள்', icon: '🦚', color: '#0ea5e9', desc: 'Birds that fly' });
  D.words('birds', [
    { en: 'Bird', ta: 'பறவை', ro: 'paravai', img: '🐦' },
    { en: 'Hen', ta: 'கோழி', ro: 'kozhi', img: '🐔' },
    { en: 'Rooster', ta: 'சேவல்', ro: 'seval', img: '🐓', say: 'சேவல் காலைல கூவுது — குக் குருவீக்!' },
    { en: 'Chick', ta: 'குஞ்சு', ro: 'kunju', img: '🐤' },
    { en: 'Duck', ta: 'வாத்து', ro: 'vaaththu', img: '🦆' },
    { en: 'Peacock', ta: 'மயில்', ro: 'mayil', img: '🦚', note: 'மயில் ஆடும் — the peacock dances when it rains' },
    { en: 'Parrot', ta: 'கிளி', ro: 'kili', img: '🦜' },
    { en: 'Crow', ta: 'காக்கை', ro: 'kaakkai', img: '🐦‍⬛', tag: ['kaa'] },
    { en: 'Pigeon', ta: 'புறா', ro: 'pura', img: '🕊️' },
    { en: 'Sparrow', ta: 'குருவி', ro: 'kuruvi', img: '🐦' },
    { en: 'Owl', ta: 'ஆந்தை', ro: 'aandhai', img: '🦉' },
    { en: 'Eagle', ta: 'கழுகு', ro: 'kazhugu', img: '🦅' },
    { en: 'Swan', ta: 'அன்னம்', ro: 'annam', img: '🦢' },
    { en: 'Kingfisher', ta: 'மீன்கொத்தி', ro: 'meenkoththi', img: '🐦' },
    { en: 'Woodpecker', ta: 'மரங்கொத்தி', ro: 'marangoththi', img: '🐦' },
    { en: 'Crane', ta: 'கொக்கு', ro: 'kokku', img: '🕊️' },
    { en: 'Penguin', ta: 'பென்குயின்', ro: 'penguin', img: '🐧', tag: ['penguin'] },
    { en: 'Turkey', ta: 'டர்க்கி', ro: 'turki', img: '🦃' },
    { en: 'Nest', ta: 'கூடு', ro: 'koodu', img: '🪺' },
    { en: 'Egg', ta: 'முட்டை', ro: 'muttai', img: '🥚' },
    { en: 'Feather', ta: 'இறகு', ro: 'iragu', img: '🪶' },
    { en: 'Wings', ta: 'சிறகுகள்', ro: 'siragugal', img: '🪽' }
  ]);

  D.category({ key: 'sea', en: 'Sea creatures', ta: 'கடல் உயிரினங்கள்', icon: '🐳', color: '#0284c7', desc: 'Under the water' });
  D.words('sea', [
    { en: 'Fish', ta: 'மீன்', ro: 'meen', img: '🐟' },
    { en: 'Shark', ta: 'சுறா', ro: 'suraa', img: '🦈' },
    { en: 'Whale', ta: 'திமிங்கலம்', ro: 'thimingalam', img: '🐋' },
    { en: 'Dolphin', ta: 'டால்ஃபின்', ro: 'daalphin', img: '🐬' },
    { en: 'Octopus', ta: 'ஆக்டோபஸ்', ro: 'oktopas', img: '🐙' },
    { en: 'Crab', ta: 'நண்டு', ro: 'nandu', img: '🦀' },
    { en: 'Lobster', ta: 'பிரங்கு', ro: 'prangu', img: '🦞' },
    { en: 'Prawn', ta: 'இறால்', ro: 'iraal', img: '🦐', tag: ['prawn', 'iraival'] },
    { en: 'Seahorse', ta: 'கடல் குதிரை', ro: 'kadal kuthirai', img: 'svg:seahorse', tag: ['sea horse'] },
    { en: 'Jellyfish', ta: 'இழுது மீன்', ro: 'izhuthu meen', img: '🪼', tag: ['jellyfish', 'jelly meen'] },
    { en: 'Seal', ta: 'கடல் நாய்', ro: 'kadal naai', img: '🦭', tag: ['seal'] },
    { en: 'Sea turtle', ta: 'கடல் ஆமை', ro: 'kadal aamai', img: '🐢' },
    { en: 'Shell', ta: 'சிப்பை', ro: 'sippai', img: '🐚', tag: ['shell', 'sangu', 'conch'] },
    { en: 'Coral', ta: 'பவளம்', ro: 'pavalam', img: '🪸' },
    { en: 'Seaweed', ta: 'கடல் பாசி', ro: 'kadal paasi', img: '🌿' },
    { en: 'Boat fish net', ta: 'மீன்பிடி வலை', ro: 'meen pidhi valai', img: '🕸️', tag: ['fishing net'] }
  ]);

  D.category({ key: 'bugs', en: 'Insects', ta: 'பூச்சிகள்', icon: '🦋', color: '#65a30d', desc: 'Little crawling things' });
  D.words('bugs', [
    { en: 'Butterfly', ta: 'பட்டாம்பூச்சி', ro: 'pattampoochi', img: '🦋' },
    { en: 'Bee', ta: 'தேனீ', ro: 'theni', img: '🐝' },
    { en: 'Ant', ta: 'எறும்பு', ro: 'erumbu', img: '🐜' },
    { en: 'Spider', ta: 'சிலந்தி', ro: 'silanthi', img: '🕷️' },
    { en: 'Mosquito', ta: 'கொசு', ro: 'kosu', img: '🦟' },
    { en: 'Snail', ta: 'நத்தை', ro: 'nathai', img: '🐌' },
    { en: 'Beetle', ta: 'வண்டு', ro: 'vandu', img: '🪲' },
    { en: 'Moth', ta: 'அந்துப்பூச்சி', ro: 'anthu poochi', img: '🦋' },
    { en: 'Fly', ta: 'ஈ', ro: 'ee', img: '🪰' },
    { en: 'Flea', ta: 'யாப்பு', ro: 'yaappu', img: '🦗', tag: ['flea', 'tellu'] },
    { en: 'Worm', ta: 'புழு', ro: 'puluzh', img: '🪱' },
    { en: 'Caterpillar', ta: 'பட்டுப்புழு', ro: 'pattu puluzh', img: '🐛' },
    { en: 'Wing', ta: 'சிறகு', ro: 'siragu', img: '🪽' },
    { en: 'Web', ta: 'வலை', ro: 'valai', img: '🕸️' },
    { en: 'Honeycomb', ta: 'தேன்கூடு', ro: 'then koodu', img: '🍯' },
    { en: 'Firefly', ta: 'மின்மினிப் பூச்சி', ro: 'minmini poochi', img: '✨', note: 'Glow-worm of the summer night' }
  ]);

  D.category({ key: 'nature', en: 'Nature', ta: 'இயற்கை', icon: '🌳', color: '#16a34a', desc: 'Sun, moon, trees and more' });
  D.words('nature', [
    { en: 'Sun', ta: 'சூரியன்', ro: 'sooriyan', img: '☀️' },
    { en: 'Moon', ta: 'நிலா', ro: 'nilaa', img: '🌙' },
    { en: 'Star', ta: 'நட்சத்திரம்', ro: 'natchathiram', img: '⭐', mo: 'twinkle' },
    { en: 'Sky', ta: 'வானம்', ro: 'vaanam', img: '🌌' },
    { en: 'Cloud', ta: 'மேகம்', ro: 'megam', img: '☁️', mo: 'float' },
    { en: 'Rain', ta: 'மழை', ro: 'mazhai', img: '🌧️', mo: 'fall' },
    { en: 'Rainbow', ta: 'வானவில்', ro: 'vanavil', img: '🌈' },
    { en: 'Tree', ta: 'மரம்', ro: 'maram', img: '🌳' },
    { en: 'Flower', ta: 'பூ', ro: 'poo', img: '🌸' },
    { en: 'Leaf', ta: 'இலை', ro: 'ilai', img: '🍃' },
    { en: 'Grass', ta: 'புல்', ro: 'pul', img: '🌱' },
    { en: 'River', ta: 'ஆறு', ro: 'aaru', img: '🏞️', mo: 'flow' },
    { en: 'Sea', ta: 'கடல்', ro: 'kadal', img: '🌊', mo: 'flow' },
    { en: 'Mountain', ta: 'மலை', ro: 'malai', img: '⛰️' },
    { en: 'Hill', ta: 'குன்று', ro: 'kunru', img: '🗻' },
    { en: 'Earth', ta: 'பூமி', ro: 'boomi', img: '🌍', mo: 'spin' },
    { en: 'Fire', ta: 'தீ', ro: 'thee', img: '🔥', mo: 'flicker' },
    { en: 'Wind', ta: 'காற்று', ro: 'kaatru', img: '🌬️', mo: 'whoosh' },
    { en: 'Stone', ta: 'கல்', ro: 'kal', img: '🪨' },
    { en: 'Sand', ta: 'மணல்', ro: 'manal', img: '🏖️' },
    { en: 'Soil', ta: 'மண்', ro: 'man', img: '🟫' },
    { en: 'Garden', ta: 'தோட்டம்', ro: 'thottam', img: '🏡' },
    { en: 'Seed', ta: 'விதை', ro: 'vidhai', img: '🌰' },
    { en: 'Plant', ta: 'செடி', ro: 'sedi', img: '🪴' },
    { en: 'Fruit', ta: 'பழம்', ro: 'pazham', img: '🍎' },
    { en: 'Shadow', ta: 'நிழல்', ro: 'nizhal', img: '🌑' },
    { en: 'Jasmine', ta: 'மல்லிகை', ro: 'malligai', img: '🌼' },
    { en: 'Rose', ta: 'ரோஜா', ro: 'roja', img: '🌹' },
    { en: 'Lotus', ta: 'தாமரை', ro: 'thaamarai', img: '🌺' },
    { en: 'Hibiscus', ta: 'செம்பருத்தி', ro: 'semparuthi', img: '🌺' },
    { en: 'Tulsi', ta: 'துளசி', ro: 'thulasi', img: '🌿' },
    { en: 'Banana leaf', ta: 'வாழையிலை', ro: 'vaazhaiilai', img: '🍃' },
    { en: 'Coconut tree', ta: 'தென்னை', ro: 'thennai', img: '🌴' },
    { en: 'Paddy', ta: 'நெல்', ro: 'nel', img: '🌾' }
  ]);

  D.category({ key: 'weather', en: 'Weather', ta: 'வானிலை', icon: '🌦️', color: '#0891b2', desc: 'How is the sky today?' });
  D.words('weather', [
    { en: 'Sunny', ta: 'வெயில்', ro: 'veyil', img: '🌞' },
    { en: 'Rainy', ta: 'மழை', ro: 'mazhai', img: '🌧️', mo: 'fall' },
    { en: 'Storm', ta: 'புயல்', ro: 'puyal', img: '⛈️', mo: 'shake' },
    { en: 'Lightning', ta: 'மின்னல்', ro: 'minnal', img: '⚡', mo: 'flash' },
    { en: 'Thunder', ta: 'இடி', ro: 'idi', img: '🌩️', mo: 'shake' },
    { en: 'Snow', ta: 'பனி', ro: 'pani', img: '❄️', mo: 'fall' },
    { en: 'Ice', ta: 'பனிக்கட்டி', ro: 'panikkatti', img: '🧊' },
    { en: 'Fog', ta: 'மூடுபனி', ro: 'moodupani', img: '🌫️' },
    { en: 'Hot', ta: 'சூடு', ro: 'soodu', img: '🥵' },
    { en: 'Cold', ta: 'குளிர்', ro: 'kulir', img: '🥶' },
    { en: 'Breeze', ta: 'தென்றல்', ro: 'threndral', img: '🍃', mo: 'whoosh' },
    { en: 'Umbrella', ta: 'குடை', ro: 'kudai', img: '☂️' },
    { en: 'Raincoat', ta: 'மழை உடை', ro: 'mazhai udai', img: '🧥', tag: ['raincoat', 'mazhai aadai'] }
  ]);
})(window.TT = window.TT || {});
