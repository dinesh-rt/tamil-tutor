/* Nature & animals — விலங்குகள், பறவைகள், கடல், பூச்சிகள், இயற்கை, வானிலை */
(function (TT) {
  'use strict';
  var D = TT.data;

  D.category({ key: 'animals', en: 'Animals', ta: 'விலங்குகள்', icon: '🐘', color: '#e8792a', desc: 'Farm, forest and friends' });
  D.words('animals', [
    { en: 'Dog', ta: 'நாய்', ro: 'naai', img: '🐕', mo: 'bounce', say: 'நாய் என்ன சொல்லும்? அவ் அவ்!', note: 'Puppy = குட்டி (kutti)' },
    { en: 'Cat', ta: 'பூனை', ro: 'poonai', img: '🐈', mo: 'creep', say: 'பூனை என்ன சொல்லும்? மியாவோ!' },
    { en: 'Cow', ta: 'பசு', ro: 'pasu', img: '🐄', mo: 'sway', say: 'பசு என்ன சொல்லும்? ஆம்ம்!' },
    { en: 'Bull', ta: 'எருது', ro: 'eruthu', img: '🐂', mo: 'stomp' },
    { en: 'Calf', ta: 'கன்று', ro: 'kandru', img: '🐮', mo: 'bounce' },
    { en: 'Goat', ta: 'ஆடு', ro: 'aadu', img: '🐐', mo: 'hop' },
    { en: 'Sheep', ta: 'செம்மறி ஆடு', ro: 'semmari aadu', img: '🐑', mo: 'sway' },
    { en: 'Horse', ta: 'குதிரை', ro: 'kuthirai', img: '🐎', mo: 'gallop' },
    { en: 'Donkey', ta: 'கழுதை', ro: 'kazhuthai', img: '🫏', mo: 'wobble' },
    { en: 'Elephant', ta: 'யானை', ro: 'yaanai', img: '🐘', mo: 'stomp', say: 'யானை வந்துடுச்சு — தும் தும்!' },
    { en: 'Lion', ta: 'சிங்கம்', ro: 'singam', img: '🦁', mo: 'shake' },
    { en: 'Tiger', ta: 'புலி', ro: 'puli', img: '🐅', mo: 'creep' },
    { en: 'Leopard', ta: 'சிறுத்தை', ro: 'siruthai', img: '🐆', mo: 'creep' },
    { en: 'Monkey', ta: 'குரங்கு', ro: 'kurangu', img: '🐒', mo: 'swing' },
    { en: 'Bear', ta: 'கரடி', ro: 'karadi', img: '🐻', mo: 'wobble' },
    { en: 'Pig', ta: 'பன்றி', ro: 'panri', img: '🐖', mo: 'wiggle' },
    { en: 'Rabbit', ta: 'முயல்', ro: 'muyal', img: '🐇', mo: 'hop' },
    { en: 'Deer', ta: 'மான்', ro: 'maan', img: '🦌', mo: 'float' },
    { en: 'Buffalo', ta: 'எருமை', ro: 'erumai', img: '🐃', mo: 'stomp' },
    { en: 'Fox', ta: 'நரி', ro: 'nari', img: '🦊', mo: 'creep' },
    { en: 'Wolf', ta: 'ஓநாய்', ro: 'onai', img: '🐺', mo: 'shake' },
    { en: 'Camel', ta: 'ஒட்டகம்', ro: 'ottagam', img: '🐪', mo: 'sway' },
    { en: 'Mouse', ta: 'எலி', ro: 'eli', img: '🐁', mo: 'creep' },
    { en: 'Rat', ta: 'ஆய்', ro: 'aai', img: '🐀', mo: 'creep', note: 'ஆய் is the big field rat' },
    { en: 'Squirrel', ta: 'அணில்', ro: 'anil', img: '🐿️', mo: 'hop' },
    { en: 'Hedgehog', ta: 'முள்ளெலி', ro: 'mulleli', img: '🦔', mo: 'wobble' },
    { en: 'Bat', ta: 'வவ்வாலை', ro: 'vavvalai', img: '🦇', mo: 'flap' },
    { en: 'Puppy', ta: 'நாய்க் குட்டி', ro: 'naai kutti', img: '🐶', mo: 'bounce', tag: ['dog baby'] },
    { en: 'Kitten', ta: 'பூனைக் குட்டி', ro: 'poonai kutti', img: '🐱', mo: 'bounce', tag: ['kitty'] },
    { en: 'Lamb', ta: 'ஆட்டுக் குட்டி', ro: 'aadu kutti', img: '🐑', mo: 'hop', tag: ['baby sheep'] },
    { en: 'Foal', ta: 'குதிரைக் குட்டி', ro: 'kuthirai kutti', img: '🐴', mo: 'gallop' },
    { en: 'Rhino', ta: 'காண்டா', ro: 'kaanda', img: '🦏', mo: 'stomp' },
    { en: 'Hippo', ta: 'நீரேறு', ro: 'neeretu', img: '🦛', mo: 'float' },
    { en: 'Giraffe', ta: 'ஜிராஃப்', ro: 'jiraaf', img: '🦒', mo: 'sway' },
    { en: 'Zebra', ta: 'குவைரா', ro: 'kvaira', img: '🦓', mo: 'gallop' },
    { en: 'Kangaroo', ta: 'கங்காரு', ro: 'kangaru', img: '🦘', mo: 'hop' },
    { en: 'Panda', ta: 'பாண்டா', ro: 'paanda', img: '🐼', mo: 'wobble' },
    { en: 'Koala', ta: 'கோவாலா', ro: 'kovaala', img: '🐨', mo: 'swing' },
    { en: 'Crocodile', ta: 'முதலை', ro: 'mudhalai', img: '🐊', mo: 'creep' },
    { en: 'Tortoise', ta: 'ஆமை', ro: 'aamai', img: '🐢', mo: 'creep' },
    { en: 'Frog', ta: 'தவளை', ro: 'thavalai', img: '🐸', mo: 'hop' },
    { en: 'Snake', ta: 'பாம்பு', ro: 'paambu', img: '🐍', mo: 'slither' },
    { en: 'Lizard', ta: 'புல்லி', ro: 'pulli', img: '🦎', mo: 'creep' },
    { en: 'Otter', ta: 'சோக்கு', ro: 'sokku', img: '🦦', mo: 'swim' },
    { en: 'Baboon', ta: 'கழுவுக்குரங்கு', ro: 'kazhavu kurangu', img: '🐵', mo: 'swing' }
  ]);

  D.category({ key: 'birds', en: 'Birds', ta: 'பறவைகள்', icon: '🦚', color: '#0ea5e9', desc: 'Birds that fly' });
  D.words('birds', [
    { en: 'Bird', ta: 'பறவை', ro: 'paravai', img: '🐦', mo: 'flap' },
    { en: 'Hen', ta: 'கோழி', ro: 'kozhi', img: '🐔', mo: 'peck' },
    { en: 'Rooster', ta: 'சேவல்', ro: 'seval', img: '🐓', mo: 'peck', say: 'சேவல் காலைல கூவுது — குக் குருவீக்!' },
    { en: 'Chick', ta: 'குஞ்சு', ro: 'kunju', img: '🐤', mo: 'hop' },
    { en: 'Duck', ta: 'வாத்து', ro: 'vaaththu', img: '🦆', mo: 'waddle' },
    { en: 'Peacock', ta: 'மயில்', ro: 'mayil', img: '🦚', mo: 'sway', note: 'மயில் ஆடும் — the peacock dances when it rains' },
    { en: 'Parrot', ta: 'கிளி', ro: 'kili', img: '🦜', mo: 'swing' },
    { en: 'Crow', ta: 'காக்கை', ro: 'kaakkai', img: '🐦‍⬛', mo: 'flap', tag: ['kaa'] },
    { en: 'Pigeon', ta: 'ப்புறா', ro: 'pura', img: '🕊️', mo: 'flap' },
    { en: 'Sparrow', ta: 'குருவி', ro: 'kuruvi', img: '🐦', mo: 'hop' },
    { en: 'Owl', ta: 'ஆந்தை', ro: 'aandhai', img: '🦉', mo: 'blink' },
    { en: 'Eagle', ta: 'கழுகு', ro: 'kazhugu', img: '🦅', mo: 'glide' },
    { en: 'Swan', ta: 'அன்னம்', ro: 'annam', img: '🦢', mo: 'glide' },
    { en: 'Kingfisher', ta: 'மீன்கொத்தி', ro: 'meenkoththi', img: '🐦', mo: 'glide' },
    { en: 'Woodpecker', ta: 'மரங்கொத்தி', ro: 'marangoththi', img: '🐦', mo: 'peck' },
    { en: 'Crane', ta: 'கொக்கு', ro: 'kokku', img: '🕊️', mo: 'glide' },
    { en: 'Penguin', ta: 'பெங்குவின்', ro: 'penguvun', img: '🐧', mo: 'waddle' },
    { en: 'Turkey', ta: 'டர்க்கி', ro: 'turki', img: '🦃', mo: 'waddle' },
    { en: 'Nest', ta: 'கூடு', ro: 'koodu', img: '🪺', mo: 'pulse' },
    { en: 'Egg', ta: 'முட்டை', ro: 'muttai', img: '🥚', mo: 'wobble' },
    { en: 'Feather', ta: 'இறகு', ro: 'iragu', img: '🪶', mo: 'float' },
    { en: 'Wings', ta: 'சிறகுகள்', ro: 'siragugal', img: '🪽', mo: 'flap' }
  ]);

  D.category({ key: 'sea', en: 'Sea creatures', ta: 'கடல் உயிரினங்கள்', icon: '🐳', color: '#0284c7', desc: 'Under the water' });
  D.words('sea', [
    { en: 'Fish', ta: 'மீன்', ro: 'meen', img: '🐟', mo: 'swim' },
    { en: 'Shark', ta: 'சுறா', ro: 'suraa', img: '🦈', mo: 'swim' },
    { en: 'Whale', ta: 'திமிங்கலம்', ro: 'thimingalam', img: '🐋', mo: 'swim' },
    { en: 'Dolphin', ta: 'டால்ஃபின்', ro: 'daalphin', img: '🐬', mo: 'jump' },
    { en: 'Octopus', ta: 'ஆக்டோபஸ்', ro: 'oktopas', img: '🐙', mo: 'wiggle' },
    { en: 'Crab', ta: 'நண்டு', ro: 'nandu', img: '🦀', mo: 'sideways' },
    { en: 'Lobster', ta: 'பிரங்கு', ro: 'prangu', img: '🦞', mo: 'sideways' },
    { en: 'Prawn', ta: 'இறைவை', ro: 'iraivai', img: '🦐', mo: 'swim' },
    { en: 'Seahorse', ta: 'கடல் குதிரை', ro: 'kadal kuthirai', img: '🐎', mo: 'float', tag: ['sea horse'] },
    { en: 'Jellyfish', ta: 'ஜெல்லி மீன்', ro: 'jelly meen', img: '🪼', mo: 'float' },
    { en: 'Seal', ta: 'சீல்', ro: 'seel', img: '🦭', mo: 'wobble' },
    { en: 'Sea turtle', ta: 'கடல் ஆமை', ro: 'kadal aamai', img: '🐢', mo: 'swim' },
    { en: 'Shell', ta: 'சங்கு', ro: 'sangu', img: '🐚', mo: 'pulse' },
    { en: 'Coral', ta: 'பவளம்', ro: 'pavalam', img: '🪸', mo: 'sway' },
    { en: 'Seaweed', ta: 'கடல் பாசி', ro: 'kadal paasi', img: '🌿', mo: 'sway' },
    { en: 'Boat fish net', ta: 'மீன்பிடி வலை', ro: 'meen pidhi valai', img: '🕸️', mo: 'pulse', tag: ['fishing net'] }
  ]);

  D.category({ key: 'bugs', en: 'Insects', ta: 'பூச்சிகள்', icon: '🦋', color: '#65a30d', desc: 'Little crawling things' });
  D.words('bugs', [
    { en: 'Butterfly', ta: 'பட்டாம்பூச்சி', ro: 'pattampoochi', img: '🦋', mo: 'flutter' },
    { en: 'Bee', ta: 'தேனீ', ro: 'theni', img: '🐝', mo: 'buzz' },
    { en: 'Ant', ta: 'எறும்பு', ro: 'erumbu', img: '🐜', mo: 'march' },
    { en: 'Spider', ta: 'சிலந்தி', ro: 'silanthi', img: '🕷️', mo: 'creep' },
    { en: 'Mosquito', ta: 'கொசு', ro: 'kosu', img: '🦟', mo: 'buzz' },
    { en: 'Snail', ta: 'நத்தை', ro: 'nathai', img: '🐌', mo: 'creep' },
    { en: 'Beetle', ta: 'வண்டு', ro: 'vandu', img: '🪲', mo: 'creep' },
    { en: 'Moth', ta: 'அந்துப்பூச்சி', ro: 'anthu poochi', img: '🦋', mo: 'flutter' },
    { en: 'Fly', ta: 'ஈ', ro: 'ee', img: '🪰', mo: 'buzz' },
    { en: 'Flea', ta: 'யாப்பு', ro: 'yaappu', img: '🐜', mo: 'hop' },
    { en: 'Worm', ta: 'புழு', ro: 'puluzh', img: '🪱', mo: 'slither' },
    { en: 'Caterpillar', ta: 'பட்டுப்புழு', ro: 'pattu puluzh', img: '🐛', mo: 'creep' },
    { en: 'Wing', ta: 'சிறகு', ro: 'siragu', img: '🪽', mo: 'flap' },
    { en: 'Web', ta: 'வலை', ro: 'valai', img: '🕸️', mo: 'pulse' },
    { en: 'Honeycomb', ta: 'தேன்கூடு', ro: 'then koodu', img: '🍯', mo: 'pulse' },
    { en: 'Firefly', ta: 'மின்னிப் பூச்சி', ro: 'minni poochi', img: '✨', mo: 'twinkle' }
  ]);

  D.category({ key: 'nature', en: 'Nature', ta: 'இயற்கை', icon: '🌳', color: '#16a34a', desc: 'Sun, moon, trees and more' });
  D.words('nature', [
    { en: 'Sun', ta: 'சூரியன்', ro: 'sooriyan', img: '☀️', mo: 'pulse' },
    { en: 'Moon', ta: 'நிலா', ro: 'nilaa', img: '🌙', mo: 'float' },
    { en: 'Star', ta: 'நட்சத்திரம்', ro: 'natchathiram', img: '⭐', mo: 'twinkle' },
    { en: 'Sky', ta: 'வானம்', ro: 'vaanam', img: '🌌', mo: 'float' },
    { en: 'Cloud', ta: 'மேகம்', ro: 'megam', img: '☁️', mo: 'float' },
    { en: 'Rain', ta: 'மழை', ro: 'mazhai', img: '🌧️', mo: 'fall' },
    { en: 'Rainbow', ta: 'வானவில்', ro: 'vanavil', img: '🌈', mo: 'pulse' },
    { en: 'Tree', ta: 'மரம்', ro: 'maram', img: '🌳', mo: 'sway' },
    { en: 'Flower', ta: 'பூ', ro: 'poo', img: '🌸', mo: 'bloom' },
    { en: 'Leaf', ta: 'இலை', ro: 'ilai', img: '🍃', mo: 'flutter' },
    { en: 'Grass', ta: 'புல்', ro: 'pul', img: '🌱', mo: 'sway' },
    { en: 'River', ta: 'ஆறு', ro: 'aaru', img: '🏞️', mo: 'flow' },
    { en: 'Sea', ta: 'கடல்', ro: 'kadal', img: '🌊', mo: 'flow' },
    { en: 'Mountain', ta: 'மலை', ro: 'malai', img: '⛰️', mo: 'pulse' },
    { en: 'Hill', ta: 'குன்று', ro: 'kunru', img: '🗻', mo: 'pulse' },
    { en: 'Earth', ta: 'பூமி', ro: 'boomi', img: '🌍', mo: 'spin' },
    { en: 'Fire', ta: 'தீ', ro: 'thee', img: '🔥', mo: 'flicker' },
    { en: 'Wind', ta: 'காற்று', ro: 'kaatru', img: '🌬️', mo: 'whoosh' },
    { en: 'Stone', ta: 'கல்', ro: 'kal', img: '🪨', mo: 'pulse' },
    { en: 'Sand', ta: 'மணல்', ro: 'manal', img: '🏖️', mo: 'wiggle' },
    { en: 'Soil', ta: 'மண்', ro: 'man', img: '🟫', mo: 'pulse' },
    { en: 'Garden', ta: 'தோட்டம்', ro: 'thottam', img: '🏡', mo: 'sway' },
    { en: 'Seed', ta: 'விதை', ro: 'vidhai', img: '🌰', mo: 'pop' },
    { en: 'Plant', ta: 'செடி', ro: 'sedi', img: '🪴', mo: 'grow' },
    { en: 'Fruit', ta: 'பழம்', ro: 'pazham', img: '🍎', mo: 'bounce' },
    { en: 'Shadow', ta: 'நிழல்', ro: 'nizhal', img: '🌑', mo: 'fade' },
    { en: 'Jasmine', ta: 'மல்லிகை', ro: 'malligai', img: '🌼', mo: 'bloom' },
    { en: 'Rose', ta: 'ரோஜா', ro: 'roja', img: '🌹', mo: 'bloom' },
    { en: 'Lotus', ta: 'தாமரை', ro: 'thaamarai', img: '🌺', mo: 'bloom' },
    { en: 'Hibiscus', ta: 'செம்பருத்தி', ro: 'semparuthi', img: '🌺', mo: 'bloom' },
    { en: 'Tulsi', ta: 'துளசி', ro: 'thulasi', img: '🌿', mo: 'sway' },
    { en: 'Banana leaf', ta: 'வாழையிலை', ro: 'vaazhaiilai', img: '🍃', mo: 'flutter' },
    { en: 'Coconut tree', ta: 'தென்னை', ro: 'thennai', img: '🌴', mo: 'sway' },
    { en: 'Paddy', ta: 'நெல்', ro: 'nel', img: '🌾', mo: 'sway' }
  ]);

  D.category({ key: 'weather', en: 'Weather', ta: 'வானிலை', icon: '🌦️', color: '#0891b2', desc: 'How is the sky today?' });
  D.words('weather', [
    { en: 'Sunny', ta: 'வெயில்', ro: 'veyil', img: '🌞', mo: 'pulse' },
    { en: 'Rainy', ta: 'மழை', ro: 'mazhai', img: '🌧️', mo: 'fall' },
    { en: 'Storm', ta: 'புயல்', ro: 'puyal', img: '⛈️', mo: 'shake' },
    { en: 'Lightning', ta: 'மின்னல்', ro: 'minnal', img: '⚡', mo: 'flash' },
    { en: 'Thunder', ta: 'இடி', ro: 'idi', img: '🌩️', mo: 'shake' },
    { en: 'Snow', ta: 'பனி', ro: 'pani', img: '❄️', mo: 'fall' },
    { en: 'Ice', ta: 'பனிக்கட்டி', ro: 'panikkatti', img: '🧊', mo: 'shiver' },
    { en: 'Fog', ta: 'மூடுபனி', ro: 'moodupani', img: '🌫️', mo: 'fade' },
    { en: 'Hot', ta: 'சூடு', ro: 'soodu', img: '🥵', mo: 'flicker' },
    { en: 'Cold', ta: 'குளிர்', ro: 'kulir', img: '🥶', mo: 'shiver' },
    { en: 'Breeze', ta: 'தென்றல்', ro: 'threndral', img: '🍃', mo: 'whoosh' },
    { en: 'Umbrella', ta: 'குடை', ro: 'kudai', img: '☂️', mo: 'swing' },
    { en: 'Raincoat', ta: 'மழை ஆடை', ro: 'mazhai aadai', img: '🧥', mo: 'sway' }
  ]);
})(window.TT = window.TT || {});
