/* Home & things — வீடு, அடுக்குறை, ஆடைகள் */
(function (TT) {
  'use strict';
  var D = TT.data;

  D.category({ key: 'home', en: 'House things', ta: 'வீட்டுப் பொருட்கள்', icon: '🏠', color: '#7c3aed', desc: 'Things at home' });
  D.words('home', [
    { en: 'House', ta: 'வீடு', ro: 'veedu', img: '🏠', mo: 'pulse', say: 'நம்ம வீடு எங்கே?' },
    { en: 'Door', ta: 'வாசல்', ro: 'vaasal', img: '🚪', mo: 'swing' },
    { en: 'Window', ta: 'ஜன்னல்', ro: 'jannal', img: '🪟', mo: 'fade' },
    { en: 'Wall', ta: 'சுவர்', ro: 'suvar', img: '🧱', mo: 'pulse' },
    { en: 'Floor', ta: 'தரை', ro: 'tharai', img: '🟫', mo: 'pulse' },
    { en: 'Roof', ta: 'கூரை', ro: 'koorai', img: '🏚️', mo: 'pulse' },
    { en: 'Bed', ta: 'படுக்கை', ro: 'padukkai', img: '🛏️', mo: 'float' },
    { en: 'Pillow', ta: 'தலையணை', ro: 'thalaiyanai', img: '💤', mo: 'float' },
    { en: 'Blanket', ta: 'போர்வை', ro: 'porvai', img: '🛌', mo: 'wiggle' },
    { en: 'Chair', ta: 'குர்சி', ro: 'kurci', img: '🪑', mo: 'wobble' },
    { en: 'Table', ta: 'மேசை', ro: 'mesai', img: '🍽️', mo: 'pulse' },
    { en: 'Sofa', ta: 'சோபா', ro: 'sopa', img: '🛋️', mo: 'float' },
    { en: 'Lamp', ta: 'விளக்கு', ro: 'vilakku', img: '💡', mo: 'blink' },
    { en: 'Oil lamp', ta: 'அகல் விளக்கு', ro: 'agal vilakku', img: '🪔', mo: 'flicker', note: 'Lit during Deepavali' },
    { en: 'Fan', ta: 'விசிறி', ro: 'visiri', img: '🌀', mo: 'spin' },
    { en: 'Clock', ta: 'கடிகாரம்', ro: 'katigaaram', img: '⏰', mo: 'tick' },
    { en: 'Key', ta: 'சாவி', ro: 'saavi', img: '🔑', mo: 'jingle' },
    { en: 'Lock', ta: 'பூட்டு', ro: 'pootu', img: '🔒', mo: 'click' },
    { en: 'Television', ta: 'தொலைக்காட்சி', ro: 'tholaikkadchi', img: '📺', mo: 'blink' },
    { en: 'Phone', ta: 'தொலைபேசி', ro: 'tholaipesi', img: '📱', mo: 'vibrate' },
    { en: 'Fridge', ta: 'குளிர்சாதனப் பெட்டி', ro: 'cooling petti', img: '🧊', mo: 'hum', tag: ['fridge'] },
    { en: 'Broom', ta: 'மொக்னை', ro: 'moknai', img: '🧹', mo: 'sweep' },
    { en: 'Bucket', ta: 'வாளி', ro: 'vaali', img: '🪣', mo: 'swing' },
    { en: 'Basket', ta: 'கூடை', ro: 'kudai', img: '🧺', mo: 'swing' },
    { en: 'Dustbin', ta: 'குப்பைத் தொட்டி', ro: 'kuppai thotti', img: '🗑️', mo: 'wobble' },
    { en: 'Ladder', ta: 'ஏணி', ro: 'aeni', img: '🪜', mo: 'climb' },
    { en: 'Torch', ta: 'கைவிளக்கு', ro: 'kaivilakku', img: '🔦', mo: 'flash' },
    { en: 'Rope', ta: 'கயிறு', ro: 'kaiiru', img: '🪢', mo: 'wiggle' },
    { en: 'Pot', ta: 'குடம்', ro: 'kudam', img: '🏺', mo: 'pulse' },
    { en: 'Box', ta: 'பெட்டி', ro: 'petti', img: '📦', mo: 'pop' },
    { en: 'Bag', ta: 'பை', ro: 'pai', img: '👜', mo: 'swing' },
    { en: 'Cloth', ta: 'துணி', ro: 'thuni', img: '🧺', mo: 'wiggle' },
    { en: 'Towel', ta: 'துடைப்பான்', ro: 'thudaippaan', img: '🧻', mo: 'sway' },
    { en: 'Soap', ta: 'சோப்பு', ro: 'soppu', img: '🧼', mo: 'bubble' },
    { en: 'Mirror', ta: 'கண்ணாடி', ro: 'kannaadi', img: '🪞', mo: 'shine' },
    { en: 'Comb', ta: 'சீப்பு', ro: 'seppu', img: '🪮', mo: 'sweep' },
    { en: 'Scissors', ta: 'கத்தரிக்கோல்', ro: 'katharikkol', img: '✂️', mo: 'snip' },
    { en: 'Needle', ta: 'ஊசி', ro: 'oosi', img: '🪡', mo: 'poke' },
    { en: 'Thread', ta: 'நூல்', ro: 'nool', img: '🧵', mo: 'wiggle' },
    { en: 'Mat', ta: 'பாய்', ro: 'paai', img: '🟩', mo: 'pulse' },
    { en: 'Umbrella stand', ta: 'குடை', ro: 'kudai', img: '☂️', mo: 'swing' },
    { en: 'Balloon', ta: 'பலூன்', ro: 'baloon', img: '🎈', mo: 'float' },
    { en: 'Gift', ta: 'பரிசு', ro: 'parisu', img: '🎁', mo: 'pop' },
    { en: 'Switch', ta: 'சுவிட்ச்', ro: 'switch', img: '🔘', mo: 'click' },
    { en: 'Gardening', ta: 'தோட்டம்', ro: 'thottam', img: '🪴', mo: 'grow' }
  ]);

  D.category({ key: 'kitchen', en: 'Kitchen', ta: 'அடுக்குறை', icon: '🍳', color: '#b45309', desc: 'Cooking things' });
  D.words('kitchen', [
    { en: 'Stove', ta: 'அடுப்பு', ro: 'aduppu', img: '🔥', mo: 'flicker' },
    { en: 'Pan', ta: 'வாணலி', ro: 'vaanali', img: '🍳', mo: 'flip' },
    { en: 'Cooking pot', ta: 'பானை', ro: 'paanai', img: '🍲', mo: 'steam' },
    { en: 'Lid', ta: 'மூடி', ro: 'moodi', img: '🥘', mo: 'fade' },
    { en: 'Spoon', ta: 'சமையல் கரண்டி', ro: 'karandi', img: '🥄', mo: 'stir' },
    { en: 'Bowl', ta: 'பாத்திரம்', ro: 'paathiram', img: '🥣', mo: 'pulse' },
    { en: 'Plate', ta: 'தட்டு', ro: 'tattu', img: '🍽️', mo: 'spin' },
    { en: 'Cup', ta: 'கோப்பை', ro: 'koppai', img: '🍵', mo: 'steam' },
    { en: 'Glass', ta: 'கிளாஸ்', ro: 'glass', img: '🥃', mo: 'clink' },
    { en: 'Bottle', ta: 'பாட்டில்', ro: 'paattil', img: '🍼', mo: 'wobble' },
    { en: 'Kettle', ta: 'நீர் செம்பு', ro: 'neer sembu', img: '🫖', mo: 'steam' },
    { en: 'Knife', ta: 'கத்தி', ro: 'kathi', img: '🔪', mo: 'chop' },
    { en: 'Mixer', ta: 'மிக்சர்', ro: 'mixar', img: '🌀', mo: 'spin' },
    { en: 'Tiffin box', ta: 'டிபன் பெட்டி', ro: 'dibon petti', img: '🍱', mo: 'pop' },
    { en: 'Sieve', ta: 'சல்லடை', ro: 'selladai', img: '🥅', mo: 'shake' },
    { en: 'Coffee filter', ta: 'காபி ஃபில்டர்', ro: 'kaapi filter', img: '☕', mo: 'drip' }
  ]);

  D.category({ key: 'clothes', en: 'Clothes', ta: 'ஆடைகள்', icon: '👕', color: '#db2777', desc: 'Get dressed!' });
  D.words('clothes', [
    { en: 'Shirt', ta: 'சட்டை', ro: 'sattai', img: '👕', mo: 'sway' },
    { en: 'Pant', ta: 'பேண்ட்', ro: 'pant', img: '👖', mo: 'sway' },
    { en: 'Dress', ta: 'பாவடை', ro: 'paavadai', img: '👗', mo: 'twirl' },
    { en: 'Saree', ta: 'புடவை', ro: 'pudavai', img: '🥻', mo: 'sway' },
    { en: 'Lungi', ta: 'வேட்டி', ro: 'vetti', img: '🩳', mo: 'sway' },
    { en: 'Vest', ta: 'இனர் வெஸ்ட்', ro: 'inner vest', img: '🎽', mo: 'wiggle' },
    { en: 'Jacket', ta: 'ஜாக்கெட்', ro: 'jacket', img: '🧥', mo: 'sway' },
    { en: 'Scarf', ta: 'துண்டு', ro: 'thundu', img: '🧣', mo: 'sway' },
    { en: 'Gloves', ta: 'கையுறை', ro: 'kaiyurai', img: '🧤', mo: 'wiggle' },
    { en: 'Socks', ta: 'சாக்ஸ்', ro: 'socks', img: '🧦', mo: 'wiggle' },
    { en: 'Shoes', ta: 'காலணி', ro: 'kaalani', img: '👟', mo: 'step' },
    { en: 'Slippers', ta: 'செருப்பு', ro: 'seruppu', img: '🩴', mo: 'step' },
    { en: 'Cap', ta: 'தொப்பி', ro: 'thoppi', img: '🧢', mo: 'pop' },
    { en: 'Helmet', ta: 'ஹெல்மெட்', ro: 'helmet', img: '⛑️', mo: 'pulse' },
    { en: 'Uniform', ta: 'சீருடை', ro: 'sirudai', img: '👔', mo: 'sway' },
    { en: 'Necklace', ta: 'மாலை', ro: 'maalai', img: '📿', mo: 'sway' },
    { en: 'Ring', ta: 'மோதிரம்', ro: 'modhiram', img: '💍', mo: 'shine' },
    { en: 'Watch', ta: 'கைக்கடிகாரம்', ro: 'kaikatigaaram', img: '⌚', mo: 'tick' },
    { en: 'Spectacles', ta: 'கண்ணாடி', ro: 'kannaadi', img: '👓', mo: 'shine' },
    { en: 'Bindi', ta: 'பொட்டு', ro: 'ponnu', img: '🔴', mo: 'pop', note: 'The little dot Amma wears' },
    { en: 'Mask', ta: 'முகக்கவசம்', ro: 'mukakkavasam', img: '😷', mo: 'fade' },
    { en: 'Handbag', ta: 'கைப் பை', ro: 'kai pai', img: '👜', mo: 'swing' }
  ]);
})(window.TT = window.TT || {});
