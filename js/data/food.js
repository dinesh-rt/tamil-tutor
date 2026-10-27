/* Food — பழங்கள், காய்கறிகள், உணவுகள், பானங்கள் */
(function (TT) {
  'use strict';
  var D = TT.data;

  D.category({ key: 'fruits', en: 'Fruits', ta: 'பழங்கள்', icon: '🥭', color: '#f59e0b', desc: 'Sweet and tasty' });
  D.words('fruits', [
    { en: 'Mango', ta: 'மாம்பழம்', ro: 'maam pazham', img: '🥭', say: 'மாம்பழம் ரொம்ப ருசியா இருக்கு!', note: 'King of fruits — காய் மாங்காய் is raw mango' },
    { en: 'Banana', ta: 'வாழைப்பழம்', ro: 'vaazhai pazham', img: '🍌' },
    { en: 'Apple', ta: 'ஆப்பிள்', ro: 'aapil', img: '🍎' },
    { en: 'Orange', ta: 'ஆரஞ்சு', ro: 'aaranju', img: '🍊' },
    { en: 'Grapes', ta: 'திராட்சை', ro: 'thiraatchai', img: '🍇' },
    { en: 'Watermelon', ta: 'தர்பூசணி', ro: 'thurboozeni', img: '🍉' },
    { en: 'Pineapple', ta: 'அன்னாசிப் பழம்', ro: 'annaasi pazham', img: '🍍', tag: ['annanas', 'pine apple', 'anaasu'] },
    { en: 'Papaya', ta: 'பப்பாளி', ro: 'papali', img: 'svg:papaya' },
    { en: 'Coconut', ta: 'தேங்காய்', ro: 'thengai', img: '🥥' },
    { en: 'Tender coconut', ta: 'இளநீர்', ro: 'ilaner', img: '🥥', tag: ['young coconut'] },
    { en: 'Pomegranate', ta: 'மாதுளை', ro: 'madhulai', img: 'svg:pomegranate', say: 'மாதுளையில் எத்தனை விதைகள்!' },
    { en: 'Guava', ta: 'கொய்யா', ro: 'koyya', img: 'svg:guava', tag: ['koyya', 'guava'] },
    { en: 'Jackfruit', ta: 'பலாப்பழம்', ro: 'palaa pazham', img: 'svg:jackfruit', note: 'Biggest fruit in the village!' },
    { en: 'Lemon', ta: 'எலுமிச்சை', ro: 'elumichai', img: '🍋', say: 'எலுமிச்சை ரொம்ப புளிப்பா இருக்கும்' },
    { en: 'Strawberry', ta: 'ஸ்டிராபெரி', ro: 'strawberi', img: '🍓' },
    { en: 'Cherry', ta: 'செர்ரி', ro: 'serri', img: '🍒' },
    { en: 'Pear', ta: 'பேரிக்காய்', ro: 'peerikkai', img: '🍐' },
    { en: 'Peach', ta: 'பீச்', ro: 'peech', img: '🍑', tag: ['peach', 'aadugam'] },
    { en: 'Dates', ta: 'பேரீச்சை', ro: 'peerichai', img: '🌴', tag: ['dates fruit'] },
    { en: 'Sapota', ta: 'சீதை', ro: 'seethai', img: '🟤', tag: ['chikoo', 'sapota'] },
    { en: 'Sweet lime', ta: 'முசம்மி', ro: 'musammi', img: '🍊' },
    { en: 'Fruit salad', ta: 'பழ கலவை', ro: 'pazha kalavai', img: '🥗' }
  ]);

  D.category({ key: 'veggies', en: 'Vegetables', ta: 'காய்கறிகள்', icon: '🥕', color: '#15803d', desc: 'Strong food' });
  D.words('veggies', [
    { en: 'Tomato', ta: 'தக்காளி', ro: 'thakkali', img: '🍅' },
    { en: 'Potato', ta: 'உருளைக்கிழங்கு', ro: 'urulaikkizhangu', img: '🥔' },
    { en: 'Onion', ta: 'வெங்காயம்', ro: 'vengayam', img: '🧅' },
    { en: 'Brinjal', ta: 'கத்தரிக்காய்', ro: 'kathirikkai', img: '🍆', tag: ['eggplant'] },
    { en: 'Carrot', ta: 'கேரட்', ro: 'kerat', img: '🥕', note: 'Rabbit food! முள்ளங்கி is the white radish' },
    { en: 'Cucumber', ta: 'வெள்ளரி', ro: 'vellarri', img: '🥒' },
    { en: 'Cabbage', ta: 'முட்டைக்கோசு', ro: 'muttaikosu', img: '🥬', note: 'கோஸ் for short' },
    { en: 'Cauliflower', ta: 'பூக்கோசு', ro: 'pookosu', img: '🥦' },
    { en: 'Okra', ta: 'வெண்டைக்காய்', ro: 'vendakkai', img: 'svg:okra', tag: ['lady finger', 'vendakkai'] },
    { en: 'Beans', ta: 'அவரைக்காய்', ro: 'avarakkai', img: '🫛', tag: ['green beans'] },
    { en: 'Green chilli', ta: 'மிளகாய்', ro: 'milagai', img: '🌶️', say: 'மிளகாய் கடிக்கிறதா? உம்ம்ம்!' },
    { en: 'Corn', ta: 'மக்காச்சோளம்', ro: 'makkaacholam', img: '🌽' },
    { en: 'Peas', ta: 'பட்டாணி', ro: 'pattani', img: '🫛' },
    { en: 'Mushroom', ta: 'காளான்', ro: 'kaalan', img: '🍄' },
    { en: 'Leafy greens', ta: 'கீரை', ro: 'keerai', img: '🥬', note: 'Murungai keerai makes you strong!' },
    { en: 'Pumpkin', ta: 'பூசணிக்காய்', ro: 'poosanikkai', img: '🎃' },
    { en: 'Bottle gourd', ta: 'சுரைக்காய்', ro: 'suraikkai', img: 'svg:bottlegourd', note: 'A soft green gourd' },
    { en: 'Bitter gourd', ta: 'பாவற்காய்', ro: 'paavarikkai', img: '🥒', note: 'Pulisua? yes, bitter but healthy' },
    { en: 'Drumstick', ta: 'முருங்கை', ro: 'murungai', img: '🌿', tag: ['drumstick', 'moringa'] },
    { en: 'Sweet potato', ta: 'சக்கரை அவரை', ro: 'sakkara avare', img: '🍠' },
    { en: 'Garlic', ta: 'பூண்டு', ro: 'pundu', img: '🧄' },
    { en: 'Ginger', ta: 'இஞ்சி', ro: 'inji', img: '🫚' },
    { en: 'Turmeric', ta: 'மஞ்சள்', ro: 'manjal', img: '🟡', note: 'The yellow spice — also means the colour yellow' },
    { en: 'Curry leaf', ta: 'கறிவேப்பிலை', ro: 'kariveppilai', img: '🍃' },
    { en: 'Coriander', ta: 'கொத்தமல்லி', ro: 'kothamalli', img: '🌿' },
    { en: 'Mint', ta: 'புதினா', ro: 'pudhina', img: '🌿' },
    { en: 'Tamarind', ta: 'புளி', ro: 'puli', img: '🟤' }
  ]);

  D.category({ key: 'food', en: 'Food', ta: 'உணவுகள்', icon: '🍚', color: '#dc6b1f', desc: 'Yummy meals' });
  D.words('food', [
    { en: 'Rice', ta: 'சாதம்', ro: 'saadham', img: '🍚', say: 'சாதம் சாப்பிடு பாப்பா' },
    { en: 'Sambar', ta: 'சாம்பார்', ro: 'saampaar', img: '🍛' },
    { en: 'Rasam', ta: 'ரசம்', ro: 'rasam', img: '🍲' },
    { en: 'Curry', ta: 'குழம்பு', ro: 'kuzhambu', img: '🍲' },
    { en: 'Chutney', ta: 'சட்னி', ro: 'satni', img: '🥣' },
    { en: 'Dosa', ta: 'தோசை', ro: 'dosa', img: '🥞', say: 'தோசை போடலாமா?' },
    { en: 'Idli', ta: 'இட்லி', ro: 'idli', img: 'svg:idli' },
    { en: 'Vada', ta: 'வடை', ro: 'vada', img: '🍩' },
    { en: 'Uttapam', ta: 'உத்தப்பம்', ro: 'uttapam', img: '🥞' },
    { en: 'Pongal', ta: 'பொங்கல்', ro: 'pongal', img: '🥘', note: 'Pongalo pongal! eaten at harvest time' },
    { en: 'Upma', ta: 'உப்புமா', ro: 'upuma', img: '🥣' },
    { en: 'Poori', ta: 'பூரி', ro: 'poori', img: '🫓' },
    { en: 'Chapati', ta: 'ரொட்டி', ro: 'rotti', img: '🫓' },
    { en: 'Parotta', ta: 'பரோட்டா', ro: 'parotta', img: '🫓' },
    { en: 'Bread', ta: 'பிரட்', ro: 'prad', img: '🍞' },
    { en: 'Butter', ta: 'வெண்ணெய்', ro: 'venney', img: '🧈' },
    { en: 'Ghee', ta: 'நெய்', ro: 'ney', img: '🫙', note: 'Ghee rice — நெய் சாதம்' },
    { en: 'Egg', ta: 'முட்டை', ro: 'muttai', img: '🥚' },
    { en: 'Omelette', ta: 'ஆம்லெட்', ro: 'omlet', img: '🍳' },
    { en: 'Chicken', ta: 'கோழி இறைச்சி', ro: 'kozhi iraichi', img: '🍗' },
    { en: 'Meat', ta: 'இறைச்சி', ro: 'iraichi', img: '🥩' },
    { en: 'Fish curry', ta: 'மீன் குழம்பு', ro: 'meen kuzhambu', img: '🐟' },
    { en: 'Biryani', ta: 'பிரியாணி', ro: 'biriyani', img: '🍛' },
    { en: 'Porridge', ta: 'கஞ்சி', ro: 'kanji', img: '🥣', note: 'Kanji — warm rice porridge' },
    { en: 'Curd', ta: 'தயிர்', ro: 'thayir', img: '🥣' },
    { en: 'Sweets', ta: 'இனிப்பு', ro: 'inippu', img: '🍬', say: 'இனிப்பு சாப்பிடுவோமா?' },
    { en: 'Laddu', ta: 'லட்டு', ro: 'lattu', img: 'svg:laddu' },
    { en: 'Murukku', ta: 'முறுக்கு', ro: 'murukku', img: 'svg:murukku' },
    { en: 'Payasam', ta: 'கீர்', ro: 'keer', img: '🍮', tag: ['kheer'] },
    { en: 'Jaggery', ta: 'கருப்பட்டி', ro: 'karupatti', img: '🟤', note: 'Brown sugar candy — karuppatti' },
    { en: 'Sugar', ta: 'சர்க்கரை', ro: 'sarkkarai', img: '🍚' },
    { en: 'Salt', ta: 'உப்பு', ro: 'uppu', img: '🧂' },
    { en: 'Honey', ta: 'தேன்', ro: 'then', img: '🍯' },
    { en: 'Oil', ta: 'எண்ணெய்', ro: 'enney', img: '🫗' },
    { en: 'Pickle', ta: 'ஊறுகாய்', ro: 'oorukai', img: '🫙' },
    { en: 'Podi', ta: 'பொடி', ro: 'podi', img: '🥣' },
    { en: 'Chips', ta: 'சிப்ஸ்', ro: 'chips', img: '🍟' },
    { en: 'Biscuit', ta: 'பிஸ்கட்', ro: 'biskat', img: '🍪' },
    { en: 'Cake', ta: 'கேக்', ro: 'kek', img: '🎂' },
    { en: 'Chocolate', ta: 'சாக்லேட்', ro: 'chaklet', img: '🍫' },
    { en: 'Ice cream', ta: 'ஐஸ்கிரீம்', ro: 'aiskrim', img: '🍦' },
    { en: 'Lollipop', ta: 'குச்சி மிட்டாய்', ro: 'kuchi mittai', img: '🍭', tag: ['lolly', 'lollipop', 'mittai'] },
    { en: 'Popcorn', ta: 'பாப்கார்ன்', ro: 'popkorn', img: '🍿' }
  ]);

  D.category({ key: 'drinks', en: 'Drinks', ta: 'பானங்கள்', icon: '🥛', color: '#0369a1', desc: 'Sip sip sip' });
  D.words('drinks', [
    { en: 'Water', ta: 'தண்ணீர்', ro: 'thanneer', img: '💧', say: 'தண்ணீர் குடிங்க' },
    { en: 'Milk', ta: 'பால்', ro: 'paal', img: '🥛', say: 'பால் குடித்தா வலு வரும்' },
    { en: 'Buttermilk', ta: 'மோர்', ro: 'mor', img: '🥛' },
    { en: 'Lassi', ta: 'லஸ்ஸி', ro: 'lassi', img: '🥤' },
    { en: 'Juice', ta: 'பழ ரசம்', ro: 'pazha rasam', img: '🧃', tag: ['juice'] },
    { en: 'Tea', ta: 'டீ', ro: 'tee', img: '☕', note: 'Chaya! Filter coffee is the famous one' },
    { en: 'Coffee', ta: 'காபி', ro: 'kaapi', img: '☕' },
    { en: 'Lemon juice', ta: 'எலுமிச்சை ரசம்', ro: 'elumichai rasam', img: '🍋' },
    { en: 'Soda', ta: 'சோடா', ro: 'soda', img: '🥤' },
    { en: 'Hot chocolate', ta: 'ஹாட் சாக்லேட்', ro: 'hot chaklet', img: '☕' }
  ]);
})(window.TT = window.TT || {});
