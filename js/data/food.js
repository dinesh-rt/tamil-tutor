/* Food — பழங்கள், காய்கறிகள், உணவுகள், பானங்கள் */
(function (TT) {
  'use strict';
  var D = TT.data;

  D.category({ key: 'fruits', en: 'Fruits', ta: 'பழங்கள்', icon: '🥭', color: '#f59e0b', desc: 'Sweet and tasty' });
  D.words('fruits', [
    { en: 'Mango', ta: 'மாம்பழம்', ro: 'maam pazham', img: '🥭', mo: 'bounce', say: 'மாம்பழம் ரொம்ப ருசியா இருக்கு!', note: 'King of fruits — காய் மாங்காய் is raw mango' },
    { en: 'Banana', ta: 'வாழைப்பழம்', ro: 'vaazhai pazham', img: '🍌', mo: 'swing' },
    { en: 'Apple', ta: 'ஆப்பிள்', ro: 'aapil', img: '🍎', mo: 'bounce' },
    { en: 'Orange', ta: 'ஆரஞ்சு', ro: 'aaranju', img: '🍊', mo: 'bounce' },
    { en: 'Grapes', ta: 'திராட்சை', ro: 'thiraatchai', img: '🍇', mo: 'swing' },
    { en: 'Watermelon', ta: 'தர்பூசணி', ro: 'thurboozeni', img: '🍉', mo: 'wobble' },
    { en: 'Pineapple', ta: 'அனத்தாழை', ro: 'anathazhai', img: '🍍', mo: 'sway' },
    { en: 'Papaya', ta: 'பப்பாளி', ro: 'papali', img: 'svg:papaya', mo: 'sway' },
    { en: 'Coconut', ta: 'தேங்காய்', ro: 'thengai', img: '🥥', mo: 'wobble' },
    { en: 'Tender coconut', ta: 'இளநீர்', ro: 'ilaner', img: '🥥', mo: 'sway', tag: ['young coconut'] },
    { en: 'Pomegranate', ta: 'மாதுளை', ro: 'madhulai', img: 'svg:pomegranate', mo: 'pop', say: 'மாதுளையில் எத்தனை விதைகள்!' },
    { en: 'Guava', ta: 'காய்', ro: 'kaai', img: 'svg:guava', mo: 'bounce' },
    { en: 'Jackfruit', ta: 'பலாப்பழம்', ro: 'palaa pazham', img: 'svg:jackfruit', mo: 'sway', note: 'Biggest fruit in the village!' },
    { en: 'Lemon', ta: 'எலுமிச்சை', ro: 'elumichai', img: '🍋', mo: 'shake', say: 'எலுமிச்சை ரொம்ப புளிப்பா இருக்கும்' },
    { en: 'Strawberry', ta: 'ஸ்டிராபெரி', ro: 'strawberi', img: '🍓', mo: 'bounce' },
    { en: 'Cherry', ta: 'செர்ரி', ro: 'serri', img: '🍒', mo: 'swing' },
    { en: 'Pear', ta: 'பேரிக்காய்', ro: 'peerikkai', img: '🍐', mo: 'swing' },
    { en: 'Peach', ta: 'ஆடூகம்', ro: 'aadugam', img: '🍑', mo: 'bounce' },
    { en: 'Dates', ta: 'பேரீச்சை', ro: 'peerichai', img: '🌴', mo: 'sway', tag: ['dates fruit'] },
    { en: 'Sapota', ta: 'சீதை', ro: 'seethai', img: '🟤', mo: 'bounce', tag: ['chikoo', 'sapota'] },
    { en: 'Sweet lime', ta: 'முசம்மி', ro: 'musammi', img: '🍊', mo: 'bounce' },
    { en: 'Fruit salad', ta: 'பழ கலவை', ro: 'pazha kalavai', img: '🥗', mo: 'pulse' }
  ]);

  D.category({ key: 'veggies', en: 'Vegetables', ta: 'காய்கறிகள்', icon: '🥕', color: '#15803d', desc: 'Strong food' });
  D.words('veggies', [
    { en: 'Tomato', ta: 'தக்காளி', ro: 'thakkali', img: '🍅', mo: 'bounce' },
    { en: 'Potato', ta: 'உருளைக்கிழங்கு', ro: 'urulaikkizhangu', img: '🥔', mo: 'wobble' },
    { en: 'Onion', ta: 'வெங்காயம்', ro: 'vengayam', img: '🧅', mo: 'pulse' },
    { en: 'Brinjal', ta: 'கத்தரிக்காய்', ro: 'kathirikkai', img: '🍆', mo: 'swing', tag: ['eggplant'] },
    { en: 'Carrot', ta: 'கேரட்', ro: 'kerat', img: '🥕', mo: 'pop', note: 'Rabbit food! முள்ளங்கி is the white radish' },
    { en: 'Cucumber', ta: 'வெள்ளரி', ro: 'vellarika', img: '🥒', mo: 'sway' },
    { en: 'Cabbage', ta: 'கோஸ்', ro: 'kos', img: '🥬', mo: 'pulse', note: 'Also called முக்கைக்கோஸ்' },
    { en: 'Cauliflower', ta: 'பூக்கோசு', ro: 'pookosu', img: '🥦', mo: 'pulse' },
    { en: 'Okra', ta: 'வெண்டைக்காய்', ro: 'vendakkai', img: '🌶️', mo: 'sway', tag: ['lady finger'] },
    { en: 'Beans', ta: 'அவரைக்காய்', ro: 'avarakkai', img: '🫛', mo: 'swing', tag: ['green beans'] },
    { en: 'Green chilli', ta: 'மிளகாய்', ro: 'milagai', img: '🌶️', mo: 'shake', say: 'மிளகாய் கடிக்கிறதா? உம்ம்ம்!' },
    { en: 'Corn', ta: 'மக்காச்சோளம்', ro: 'makkaacholam', img: '🌽', mo: 'wiggle' },
    { en: 'Peas', ta: 'பட்டாணி', ro: 'pattani', img: '🫛', mo: 'pop' },
    { en: 'Mushroom', ta: 'காளான்', ro: 'kaalan', img: '🍄', mo: 'pop' },
    { en: 'Leafy greens', ta: 'கீரை', ro: 'keerai', img: '🥬', mo: 'sway', note: 'Murungai keerai makes you strong!' },
    { en: 'Pumpkin', ta: 'பூசணிக்காய்', ro: 'poosanikkai', img: '🎃', mo: 'wobble' },
    { en: 'Bottle gourd', ta: 'சோகை', ro: 'sogai', img: '🥒', mo: 'sway', note: 'A soft green gourd' },
    { en: 'Bitter gourd', ta: 'பாவற்காய்', ro: 'paavarikkai', img: '🥒', mo: 'wiggle', note: 'Pulisua? yes, bitter but healthy' },
    { en: 'Drumstick', ta: 'முருங்கை', ro: 'murungai', img: '🌿', mo: 'sway', tag: ['drumstick', 'moringa'] },
    { en: 'Sweet potato', ta: 'சக்கரை அவரை', ro: 'sakkara avare', img: '🍠', mo: 'wobble' },
    { en: 'Garlic', ta: 'பூண்டு', ro: 'pundu', img: '🧄', mo: 'pulse' },
    { en: 'Ginger', ta: 'இஞ்சி', ro: 'inji', img: '🫚', mo: 'wiggle' },
    { en: 'Turmeric', ta: 'மஞ்சள்', ro: 'manjal', img: '🟡', mo: 'pulse', note: 'The yellow spice — also means the colour yellow' },
    { en: 'Curry leaf', ta: 'கறிவேப்பிலை', ro: 'kariveppilai', img: '🍃', mo: 'flutter' },
    { en: 'Coriander', ta: 'கொத்தமல்லி', ro: 'kothamalli', img: '🌿', mo: 'sway' },
    { en: 'Mint', ta: 'புதினா', ro: 'pudhina', img: '🌿', mo: 'sway' },
    { en: 'Tamarind', ta: 'புளி', ro: 'puli', img: '🟤', mo: 'wobble' }
  ]);

  D.category({ key: 'food', en: 'Food', ta: 'உணவுகள்', icon: '🍚', color: '#dc6b1f', desc: 'Yummy meals' });
  D.words('food', [
    { en: 'Rice', ta: 'சாதம்', ro: 'saadham', img: '🍚', mo: 'pulse', say: 'சாதம் சாப்பிடு பாப்பா' },
    { en: 'Sambar', ta: 'சாம்பார்', ro: 'saampaar', img: '🍛', mo: 'steam' },
    { en: 'Rasam', ta: 'ரசம்', ro: 'rasam', img: '🍲', mo: 'steam' },
    { en: 'Curry', ta: 'குழம்பு', ro: 'kuzhambu', img: '🍲', mo: 'steam' },
    { en: 'Chutney', ta: 'சட்னி', ro: 'satni', img: '🥣', mo: 'pulse' },
    { en: 'Dosa', ta: 'தோசை', ro: 'dosa', img: '🥞', mo: 'flip', say: 'தோசை போடலாமா?' },
    { en: 'Idli', ta: 'இட்லி', ro: 'idli', img: 'svg:idli', mo: 'bounce' },
    { en: 'Vada', ta: 'வடை', ro: 'vada', img: '🍩', mo: 'spin' },
    { en: 'Uttapam', ta: 'உத்தப்பம்', ro: 'uttapam', img: '🥞', mo: 'pulse' },
    { en: 'Pongal', ta: 'பொங்கல்', ro: 'pongal', img: '🥘', mo: 'steam', note: 'Pongalo pongal! eaten at harvest time' },
    { en: 'Upma', ta: 'உப்புமா', ro: 'upuma', img: '🥣', mo: 'pulse' },
    { en: 'Poori', ta: 'பூரி', ro: 'poori', img: '🫓', mo: 'pop' },
    { en: 'Chapati', ta: 'ரொட்டி', ro: 'rotti', img: '🫓', mo: 'flip' },
    { en: 'Parotta', ta: 'பரோட்டா', ro: 'parotta', img: '🫓', mo: 'flip' },
    { en: 'Bread', ta: 'பிரட்', ro: 'brad', img: '🍞', mo: 'bounce' },
    { en: 'Butter', ta: 'வெண்ணெய்', ro: 'venney', img: '🧈', mo: 'melt' },
    { en: 'Ghee', ta: 'நெய்', ro: 'ney', img: '🫙', mo: 'pulse', note: 'Ghee rice — நெய் சாதம்' },
    { en: 'Egg', ta: 'முட்டை', ro: 'muttai', img: '🥚', mo: 'wobble' },
    { en: 'Omelette', ta: 'ஆம்லெட்', ro: 'omlet', img: '🍳', mo: 'flip' },
    { en: 'Chicken', ta: 'கோழி இறைச்சி', ro: 'kozhi iraichi', img: '🍗', mo: 'shake' },
    { en: 'Meat', ta: 'இறைச்சி', ro: 'iraichi', img: '🥩', mo: 'pulse' },
    { en: 'Fish curry', ta: 'மீன் குழம்பு', ro: 'meen kuzhambu', img: '🐟', mo: 'swim' },
    { en: 'Biryani', ta: 'பிரியாணி', ro: 'biriyani', img: '🍛', mo: 'steam' },
    { en: 'Porridge', ta: 'கஞ்சி', ro: 'kanji', img: '🥣', mo: 'steam', note: 'Kanji — warm rice porridge' },
    { en: 'Curd', ta: 'தயிர்', ro: 'thayir', img: '🥣', mo: 'swirl' },
    { en: 'Sweets', ta: 'இனிப்பு', ro: 'inippu', img: '🍬', mo: 'twinkle', say: 'இனிப்பு சாப்பிடுவோமா?' },
    { en: 'Laddu', ta: 'லட்டு', ro: 'lattu', img: 'svg:laddu', mo: 'spin' },
    { en: 'Murukku', ta: 'முறுக்கு', ro: 'murukku', img: 'svg:murukku', mo: 'spin' },
    { en: 'Payasam', ta: 'கீர்', ro: 'keer', img: '🍮', mo: 'wobble', tag: ['kheer'] },
    { en: 'Jaggery', ta: 'கருப்பட்டி', ro: 'karupatti', img: '🟤', mo: 'pulse', note: 'Brown sugar candy — karuppatti' },
    { en: 'Sugar', ta: 'சர்க்கரை', ro: 'sarkkarai', img: '🍚', mo: 'pulse' },
    { en: 'Salt', ta: 'உப்பு', ro: 'uppu', img: '🧂', mo: 'shake' },
    { en: 'Honey', ta: 'தேன்', ro: 'then', img: '🍯', mo: 'drip' },
    { en: 'Oil', ta: 'எண்ணெய்', ro: 'enney', img: '🫗', mo: 'drip' },
    { en: 'Pickle', ta: 'ஊறுகாய்', ro: 'oorukai', img: '🫙', mo: 'pulse' },
    { en: 'Podi', ta: 'பொடி', ro: 'podi', img: '🥣', mo: 'shake' },
    { en: 'Chips', ta: 'சிப்ஸ்', ro: 'chips', img: '🍟', mo: 'crunch' },
    { en: 'Biscuit', ta: 'பிஸ்கட்', ro: 'biskat', img: '🍪', mo: 'crunch' },
    { en: 'Cake', ta: 'கேக்', ro: 'kek', img: '🎂', mo: 'bounce' },
    { en: 'Chocolate', ta: 'சாக்லேட்', ro: 'chaklet', img: '🍫', mo: 'melt' },
    { en: 'Ice cream', ta: 'ஐஸ்கிரீம்', ro: 'aiskrim', img: '🍦', mo: 'melt' },
    { en: 'Lollipop', ta: 'குண்டு போனா', ro: 'kundu bona', img: '🍭', mo: 'swing', tag: ['lolly'] },
    { en: 'Popcorn', ta: 'பாப்கார்ன்', ro: 'popkorn', img: '🍿', mo: 'pop' }
  ]);

  D.category({ key: 'drinks', en: 'Drinks', ta: 'பானங்கள்', icon: '🥛', color: '#0369a1', desc: 'Sip sip sip' });
  D.words('drinks', [
    { en: 'Water', ta: 'தண்ணீர்', ro: 'thanneer', img: '💧', mo: 'drip', say: 'தண்ணீர் குடிங்க' },
    { en: 'Milk', ta: 'பால்', ro: 'paal', img: '🥛', mo: 'swirl', say: 'பால் குடித்தா வலு வரும்' },
    { en: 'Buttermilk', ta: 'மோர்', ro: 'mor', img: '🥛', mo: 'swirl' },
    { en: 'Lassi', ta: 'லஸ்ஸி', ro: 'lassi', img: '🥤', mo: 'swirl' },
    { en: 'Juice', ta: 'பழ ரசம்', ro: 'pazha rasam', img: '🧃', mo: 'drip', tag: ['juice'] },
    { en: 'Tea', ta: 'டீ', ro: 'tee', img: '☕', mo: 'steam', note: 'Chaya! Filter coffee is the famous one' },
    { en: 'Coffee', ta: 'காபி', ro: 'kaapi', img: '☕', mo: 'steam' },
    { en: 'Lemon juice', ta: 'எலுமிச்சை ரசம்', ro: 'elumichai rasam', img: '🍋', mo: 'drip' },
    { en: 'Soda', ta: 'சோடா', ro: 'soda', img: '🥤', mo: 'fizz' },
    { en: 'Hot chocolate', ta: 'ஹாட் சாக்லேட்', ro: 'hot chaklet', img: '☕', mo: 'steam' }
  ]);
})(window.TT = window.TT || {});
