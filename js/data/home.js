/* Home & things — வீடு, அடுக்குறை, ஆடைகள் */
(function (TT) {
  'use strict';
  var D = TT.data;

  D.category({ key: 'home', en: 'House things', ta: 'வீட்டுப் பொருட்கள்', icon: '🏠', color: '#7c3aed', desc: 'Things at home' });
  D.words('home', [
    { en: 'House', ta: 'வீடு', ro: 'veedu', img: '🏠', say: 'நம்ம வீடு எங்கே?' },
    { en: 'Door', ta: 'கதவு', ro: 'kadavu', img: '🚪', tag: ['door', 'vaasal'] },
    { en: 'Window', ta: 'ஜன்னல்', ro: 'jannal', img: '🪟' },
    { en: 'Wall', ta: 'சுவர்', ro: 'suvar', img: '🧱' },
    { en: 'Floor', ta: 'தரை', ro: 'tharai', img: '🟫' },
    { en: 'Roof', ta: 'கூரை', ro: 'koorai', img: '🏚️' },
    { en: 'Bed', ta: 'படுக்கை', ro: 'padukkai', img: '🛏️' },
    { en: 'Pillow', ta: 'தலையணை', ro: 'thalaiyanai', img: '💤' },
    { en: 'Blanket', ta: 'போர்வை', ro: 'porvai', img: '🛌' },
    { en: 'Chair', ta: 'குர்சி', ro: 'kurci', img: '🪑' },
    { en: 'Table', ta: 'மேசை', ro: 'mesai', img: '🍽️' },
    { en: 'Sofa', ta: 'சோபா', ro: 'sopa', img: '🛋️' },
    { en: 'Lamp', ta: 'விளக்கு', ro: 'vilakku', img: '💡' },
    { en: 'Oil lamp', ta: 'அகல் விளக்கு', ro: 'agal vilakku', img: '🪔', note: 'Lit during Deepavali' },
    { en: 'Fan', ta: 'விசிறி', ro: 'visiri', img: '🌀' },
    { en: 'Clock', ta: 'கடிகாரம்', ro: 'katigaaram', img: '⏰' },
    { en: 'Key', ta: 'சாவி', ro: 'saavi', img: '🔑' },
    { en: 'Lock', ta: 'பூட்டு', ro: 'pootu', img: '🔒' },
    { en: 'Television', ta: 'டீவி', ro: 'teeivi', img: '📺', tag: ['television', 'tv', 'tholaikkadchi'] },
    { en: 'Phone', ta: 'ஃபோன்', ro: 'phon', img: '📱', tag: ['phone', 'mobile', 'tholaipesi'] },
    { en: 'Fridge', ta: 'ஃப்ரிஜ்', ro: 'friji', img: '🧊', tag: ['fridge', 'cooling box', 'kulira sadhana petti'] },
    { en: 'Broom', ta: 'விளக்குமாறு', ro: 'vilakku maarru', img: '🧹', tag: ['broom', 'moknai'] },
    { en: 'Bucket', ta: 'வாளி', ro: 'vaali', img: '🪣' },
    { en: 'Basket', ta: 'கூடை', ro: 'kudai', img: '🧺' },
    { en: 'Dustbin', ta: 'குப்பைத் தொட்டி', ro: 'kuppai thotti', img: '🗑️' },
    { en: 'Ladder', ta: 'ஏணி', ro: 'aeni', img: '🪜' },
    { en: 'Torch', ta: 'கைவிளக்கு', ro: 'kaivilakku', img: '🔦' },
    { en: 'Rope', ta: 'கயிறு', ro: 'kaiiru', img: '🪢' },
    { en: 'Pot', ta: 'குடம்', ro: 'kudam', img: '🏺' },
    { en: 'Box', ta: 'பெட்டி', ro: 'petti', img: '📦' },
    { en: 'Bag', ta: 'பை', ro: 'pai', img: '👜' },
    { en: 'Cloth', ta: 'துணி', ro: 'thuni', img: '🧺' },
    { en: 'Towel', ta: 'துடைத்துணி', ro: 'thudaith thuni', img: '🧻', tag: ['towel', 'thundu'] },
    { en: 'Soap', ta: 'சோப்பு', ro: 'soppu', img: '🧼' },
    { en: 'Mirror', ta: 'கண்ணாடி', ro: 'kannaadi', img: '🪞' },
    { en: 'Comb', ta: 'சீப்பு', ro: 'seppu', img: '🪮' },
    { en: 'Scissors', ta: 'கத்தரிக்கோல்', ro: 'katharikkol', img: '✂️' },
    { en: 'Needle', ta: 'ஊசி', ro: 'oosi', img: '🪡' },
    { en: 'Thread', ta: 'நூல்', ro: 'nool', img: '🧵' },
    { en: 'Mat', ta: 'பாய்', ro: 'paai', img: '🟩' },
    { en: 'Umbrella stand', ta: 'குடை நிலை', ro: 'kudai nilai', img: '☂️' },
    { en: 'Balloon', ta: 'பலூன்', ro: 'baloon', img: '🎈' },
    { en: 'Gift', ta: 'பரிசு', ro: 'parisu', img: '🎁' },
    { en: 'Switch', ta: 'சுவிட்ச்', ro: 'switch', img: '🔘' },
    { en: 'Gardening', ta: 'தோட்டப் பணி', ro: 'thotta pani', img: '🪴' }
  ]);

  D.category({ key: 'kitchen', en: 'Kitchen', ta: 'சமையலறை', icon: '🍳', color: '#b45309', desc: 'Cooking things' });
  D.words('kitchen', [
    { en: 'Stove', ta: 'அடுப்பு', ro: 'aduppu', img: '🔥' },
    { en: 'Pan', ta: 'வாணலி', ro: 'vaanali', img: '🍳' },
    { en: 'Cooking pot', ta: 'பானை', ro: 'paanai', img: '🍲' },
    { en: 'Lid', ta: 'மூடி', ro: 'moodi', img: '🥘' },
    { en: 'Spoon', ta: 'கரவீடு', ro: 'karaveedu', img: '🥄', tag: ['spoon', 'karandi'] },
    { en: 'Bowl', ta: 'பாத்திரம்', ro: 'paathiram', img: '🥣' },
    { en: 'Plate', ta: 'தட்டு', ro: 'tattu', img: '🍽️' },
    { en: 'Cup', ta: 'கோப்பை', ro: 'koppai', img: '🍵' },
    { en: 'Glass', ta: 'கிளாஸ்', ro: 'glass', img: '🥃' },
    { en: 'Bottle', ta: 'பாட்டில்', ro: 'paattil', img: '🍼' },
    { en: 'Kettle', ta: 'செம்பு', ro: 'sembu', img: '🫖', tag: ['kettle', 'neer sembu'] },
    { en: 'Knife', ta: 'கத்தி', ro: 'kathi', img: '🔪' },
    { en: 'Mixer', ta: 'மிக்சர்', ro: 'mixar', img: '🌀' },
    { en: 'Tiffin box', ta: 'டிபன் பெட்டி', ro: 'dibon petti', img: '🍱' },
    { en: 'Sieve', ta: 'சல்லடை', ro: 'selladai', img: '🥅' },
    { en: 'Coffee filter', ta: 'காபி ஃபில்டர்', ro: 'kaapi filter', img: '☕' }
  ]);

  D.category({ key: 'clothes', en: 'Clothes', ta: 'ஆடைகள்', icon: '👕', color: '#db2777', desc: 'Get dressed!' });
  D.words('clothes', [
    { en: 'Shirt', ta: 'சட்டை', ro: 'sattai', img: '👕' },
    { en: 'Pant', ta: 'பேண்ட்', ro: 'pant', img: '👖' },
    { en: 'Dress', ta: 'பாவாடை', ro: 'paavadai', img: '👗' },
    { en: 'Saree', ta: 'புடவை', ro: 'pudavai', img: '🥻' },
    { en: 'Lungi', ta: 'வேட்டி', ro: 'vetti', img: '🩳' },
    { en: 'Vest', ta: 'வெஸ்ட்', ro: 'vesht', img: '🎽', tag: ['vest', 'inner vest'] },
    { en: 'Jacket', ta: 'ஜாக்கெட்', ro: 'jacket', img: '🧥' },
    { en: 'Scarf', ta: 'துண்டு', ro: 'thundu', img: '🧣' },
    { en: 'Gloves', ta: 'கையுறை', ro: 'kaiyurai', img: '🧤' },
    { en: 'Socks', ta: 'சாக்ஸ்', ro: 'socks', img: '🧦' },
    { en: 'Shoes', ta: 'காலணி', ro: 'kaalani', img: '👟' },
    { en: 'Slippers', ta: 'செருப்பு', ro: 'seruppu', img: '🩴' },
    { en: 'Cap', ta: 'தொப்பி', ro: 'thoppi', img: '🧢' },
    { en: 'Helmet', ta: 'ஹெல்மெட்', ro: 'helmet', img: '⛑️' },
    { en: 'Uniform', ta: 'சீருடை', ro: 'sirudai', img: '👔' },
    { en: 'Necklace', ta: 'மாலை', ro: 'maalai', img: '📿' },
    { en: 'Ring', ta: 'மோதிரம்', ro: 'modhiram', img: '💍' },
    { en: 'Watch', ta: 'கைக்கடிகாரம்', ro: 'kaikatigaaram', img: '⌚' },
    { en: 'Spectacles', ta: 'கண் கண்ணாடி', ro: 'kan kannaadi', img: '👓', tag: ['specs', 'glasses'] },
    { en: 'Bindi', ta: 'பொட்டு', ro: 'potu', img: '🔴', note: 'The little dot Amma wears' },
    { en: 'Mask', ta: 'மாஸ்க்', ro: 'mask', img: '😷', tag: ['mask', 'mukakkavasam'] },
    { en: 'Handbag', ta: 'கைப் பை', ro: 'kai pai', img: '👜' }
  ]);
})(window.TT = window.TT || {});
