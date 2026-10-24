/* Ten real Tamil story-books.

   All ten are old folk tales — Panchantantrum and Aesop material that has
   belonged to nobody for a few thousand years — retold in short sentences for
   two-to-five-year-olds, with the sharp endings softened the way grandmother
   versions soften them. Nothing here is under copyright.

   One page is one spoken line, narrated into audio/books/<id>/p<nn>.mp3 by
   tools/make-story-pack.py, which also writes `dur` back into each page after
   measuring the file with ffprobe. So: edit `ta` here, re-run the tool, and
   the book re-narrates itself.

   `ro` is the transliteration and `en` the gloss. They are there so a grown-up
   can check a Tamil line at a glance — these retellings are simple sentences,
   but they were written by a machine, and a language tutor should have a human
   read them before a child does.
*/
(function (TT) {
  'use strict';

  var B = TT.books;

  function story(def) {
    def.story = true;
    def.ages = def.ages || '3-6';
    /* the stable cover name, not the generated one — tools/make-story-art.py
       --promote writes this file, and re-promoting swaps the picture without
       a line of data changing here */
    def.art = def.art || 'images/books/cover-' + def.id + '.webp';
    def.pages = (def.pages || []).map(function (p, i) {
      var nn = ('0' + (i + 1)).slice(-2);
      return {
        k: 'line',
        ta: p.ta,
        ro: p.ro || '',
        en: p.en || '',
        clip: 'audio/books/' + def.id + '/p' + nn + '.mp3',
        dur: p.dur || 0
      };
    });
    if (def.moral) {
      def.pages.push({
        k: 'moral', ta: def.moral.ta, ro: def.moral.ro || '', en: def.moral.en || '',
        clip: 'audio/books/' + def.id + '/p-moral.mp3', dur: def.moral.dur || 0
      });
    }
    B.book(def);
  }

  /* ────────────────────────────── 1. the thirsty crow — Panchantantrum */
  story({
    id: 'kakku-kudam',
    ta: 'காக்கையும் குடமும்',
    en: 'The Thirsty Crow',
    icon: '🐦‍⬛',
    color: '#475569',
    pages: [
      { ta: 'ஒரு சூடான நாள். ஒரு காக்கைக்கு மிகவும் தாகம்.', ro: 'oru sūḍāna nāḷ. oru kākkaiku migavum thagam.', en: 'One hot day, a crow was very thirsty.' },
      { ta: 'அது ஒரு மரத்தடியில் உட்கார்ந்தது. "எங்கே தண்ணீர்?"', ro: 'adhu oru marathadiyil ukkārnthadhu. "engē thaṇṇīr?"', en: 'It sat under a tree. "Where is water?"' },
      { ta: 'அருகே ஒரு குடம்! உள்ளே தண்ணீர் — ஆனால் மிகக் குறைவு.', ro: 'aruḡē oru kuḍam! uḷḷē thaṇṇīr — āṉāl migak kuṟaivu.', en: 'Nearby, a pot! Water inside — but far too little.' },
      { ta: 'காக்கை வாயை வைத்தது. அடையவே இல்ல! காக்கை கவலைப்பட்டது.', ro: 'kākkai vāyai vaikthadhu. aḍaiyavē illa! kākkai kalvaipaṭṭadhu.', en: 'It stretched its beak. It could not reach! The crow grew sad.' },
      { ta: 'அப்போது! காக்கைக்கு ஒரு யோசனை வந்தது.', ro: 'appōthu! kākkaiku oru yōsaṉai vanthadhu.', en: 'Then! An idea came to the crow.' },
      { ta: 'சிறு கற்களை எடுத்து குடத்தில் போட்டது. டிக்... டிக்... டிக்...', ro: 'sirukarkaḷai eḍuthu kuḍathil pōṭṭadhu. ṭik... ṭik... ṭik...', en: 'It picked up little stones and dropped them in. Tick... tick... tick...' },
      { ta: 'தண்ணீர் மேலே வந்தது! காக்கை குடித்தது. குளிராய் குடித்தது.', ro: 'thaṇṇīr mēlē vanthadhu! kākkai kuḍithadhu. kuḷirāi kuḍithadhu.', en: 'The water rose! The crow drank, nice and cool.' },
      { ta: 'காக்கை நன்றாக பறந்தது. "நன்றி, சிறு கற்களே!"', ro: 'kākkai naṉṟāga paṟanthadhu. "naṉṟi, siru kaṟkaḷē!"', en: 'The crow flew off happy. "Thank you, little stones!"' }
    ],
    moral: { ta: 'யோசித்துச் செய்வது வெற்றி பெறும்.', ro: 'yōsithu seiyadhu veṟṟi peṟum.', en: 'Thinking first, then doing, wins.' }
  });

  /* ───────────────── 2. the tortoise and the two geese — Panchantantrum */
  story({
    id: 'aamai-annangal',
    ta: 'ஆமையும் இரண்டு அன்னங்களும்',
    en: 'The Tortoise and the Two Geese',
    icon: '🐢',
    color: '#16a34a',
    pages: [
      { ta: 'ஒரு குளத்தில் ஒரு ஆமை. அதற்கு நண்பர்கள் இல்ல.', ro: 'oru kuḷathil oru āmai. adharku naṉbarkaḷ illa.', en: 'In a pond lived a tortoise with no friends.' },
      { ta: 'இரண்டு அன்னங்கள் வந்தன. "வா, நம்ம மலைக்குப் போகலாம்!"', ro: 'iraṇḍu aṉṉangaḷ vanthana. "vā, namma malaikku pōgalām!"', en: 'Two geese came. "Come, fly over to our mountain!"' },
      { ta: 'ஆமை சொன்னது, "எனக்கு சிறகுகள் இல்லியே..."', ro: 'āmai sonnadhu, "ena kku siragu kaḷaḷ liyē..."', en: 'The tortoise said, "I have no wings..."' },
      { ta: 'அன்னங்கள் ஒரு கம்பளம் கொண்டுவந்தன. "இதின் நடுவில் நில், நாங்கள் ஏற்றுகிறோம்."', ro: 'aṉṉangaḷ oru kambaḷam koṇḍuvandana. "idhin naḍuvil nil, nāṅgaḷ ēṟṟugiṟōm."', en: 'They brought a cloth. "Stand in the middle, we will lift you."' },
      { ta: 'ஆகாயத்தில் பறந்தன! காற்று மெல்ல வந்தது.', ro: 'ākāyathil paṟantha! kāṟṟu mella vanthadhu.', en: 'Up they flew! The breeze came softly.' },
      { ta: 'கீழே ஒருவர் பார்த்தார். "பார்த்தீங்களா! ஆமை பறக்கிறது!"', ro: 'kīḷē oruvar pārtthār. "pārtthīṅgaḷā! āmai paṟakkiradhu!"', en: 'Someone below looked up. "Look! A tortoise is flying!"' },
      { ta: 'ஆமை மகிழ்ச்சியில் சொன்னது, "நான் தான் பறக்கிறேன்!" — வாய் திறந்தது... தப்!', ro: 'āmai magizhchiyil sonnadhu, "nān thān paṟakkirēn!" — vāyi thiraṅgadh... thap!', en: 'The tortoise blurted, "I am flying!" — the mouth opened... thud!' },
      { ta: 'மெல்லிய புல்லில் விழுந்தது. அன்னங்கள் அதைக் காப்பாற்றின. அன்று முதல் அந்த ஊரில் ஆமை மகிழ்ச்சியாக இருக்கிறது.', ro: 'melliya pullil viḻundhadhu. aṉṉangaḷ adai kāpāṟṟina. aṉṟu mudhal aṉḍa ūril āmai magizhchiyāga irukkiradhu.', en: 'It fell on soft grass. The geese caught it safe, and it has lived happily in that village ever since.' }
    ],
    moral: { ta: 'பேச வேண்டாத இடத்தில் வாயை மூடிக்கொள்.', ro: 'pēś vēṇḍādai iḍathil vāyai mūḍikkoḷ.', en: 'Keep your mouth shut where it is not needed.' }
  });

  /* ────────────────── 3. the monkey and the crocodile — Panchantantrum */
  story({
    id: 'vanaram-mudalai',
    ta: 'வானரமும் முதலையையும்',
    en: 'The Monkey and the Crocodile',
    icon: '🐒',
    color: '#b45309',
    pages: [
      { ta: 'ஆற்றின் ஓரத்தில் ஒரு மாம்பழ மரம். அதில் ஒரு வானரம்.', ro: 'āṟṟin ōrathil oru māmpaḷa maram. adhill oru vānaram.', en: 'On the river bank a mango tree, and in it a monkey.' },
      { ta: 'ஆற்றில் ஒரு முதலை வந்தது. வானரம் இரண்டு மாம்பழங்கள் கொடுத்தது.', ro: 'āṟṟil oru mudalai vanthadhu. vānaram iraṇḍu māmpaḷangkaḷ koḍuthadhu.', en: 'A crocodile came. The monkey gave it two mangoes.' },
      { ta: 'ஒவ்வொரு நாளும் மாம்பழம்! "இவ்வளவு இனிமையான நண்பன் வேறில்லை," என்றது முதலை.', ro: 'ovvoru nāḷum māmpaḷam! "ivvaḷavu inimai-yāna naṉban vēṟillai," ēnradhu mudalai.', en: 'Mangoes every day! "No sweeter friend exists," said the crocodile.' },
      { ta: 'ஆனால் வீட்டில் அதன் மனைவி சொன்னாள், "அவனது இதயம் வேண்டும்."', ro: 'āṉāl vīṭṭil adan maṉaivi sonnāḷ, "avana thu iḍhayam vēṇṭum."', en: 'But at home his wife said, "I want his heart."' },
      { ta: 'முதலை வருந்தி வந்தது. "வா, என் வீட்டுக்கு வா..."', ro: 'mudalai varunthi vanthadhu. "vā, en vīṭṭukku vā..."', en: 'Sad, the crocodile came. "Come, come to my house..."' },
      { ta: 'வானரம் அறிவுள்ளவன்! "ஆற்றின் நடுவில் வீடு எப்படி இருக்கும்?"', ro: 'vānaram aṟivulla van! "āṟṟin naḍuvil vīḍu eppaḍi irukkum?"', en: 'The monkey was clever! "How can a house sit in the middle of a river?"' },
      { ta: '"அய்யோ! என் இதயம் இந்த மரத்தில் வைத்திருக்கிறேன்!" என்றது வானரம்.', ro: '"ayyō! en iḍhayam inḍḍa marathil vaikthirukkiṟēn!" ēnradhu vānaram.', en: '"Oh! I left my heart in this tree!" said the monkey.' },
      { ta: '"ஏறு, எடுத்துவா!" — வானரம் ஏறிவிட்டது. "நன்றி, முதலை. இனி நாம் நண்பர்களில்லை."', ro: '"ēṟu, eḍuthuvā!" — vānaram ēriviṭṭadhu. "naṉṟi, mudalai. ini nām naṉbarkaḷ illai."', en: '"Climb up and fetch it!" — the monkey was up. "Thanks, crocodile. We are no longer friends."' }
    ],
    moral: { ta: 'பயம் வந்தாள் அமைதியாக யோசி.', ro: 'bayam vandhāḷ amaithiyāga yōs.', en: 'When fear comes, think quietly.' }
  });

  /* ─────────────────────── 4. the lion and the rabbit — Panchantantrum */
  story({
    id: 'singam-muyal',
    ta: 'சிங்கமும் முயலும்',
    en: 'The Lion and the Rabbit',
    icon: '🦁',
    color: '#d97706',
    pages: [
      { ta: 'காட்டில் ஒரு சிங்கம். ஒவ்வொரு நாளும் விலங்குகளை வேட்டையாடியது.', ro: 'kāṭṭill oru singam. ovvoru nāḷum vilaṅgu kaḷai vēṭṭai-yāḍiyadhu.', en: 'In the forest a lion hunted animals every single day.' },
      { ta: 'எல்லாம் கூடி கேட்டன, "ராஜா, நாங்களே உணவு அனுப்புகிறோம்!"', ro: 'ellām kūḍi kēṭṭana, "rājā, nāṅgaḷē uṇavu aṉuppugiṟōm!"', en: 'They all asked, "King, we will send your food ourselves!"' },
      { ta: 'ஒரு நாள் ஒரு சிறு முயல் நடந்து வந்தது. சிங்கம் கோபப்பட்டது.', ro: 'oru nāḷ oru siru muyal naḍandhu vanthadhu. singam kōpapaṭṭadhu.', en: 'One day a little rabbit walked up. The lion was furious.' },
      { ta: 'முயல் சொன்னது, "மன்னிக்கவும்! இன்னொரு சிங்கம் வந்தது. ‘நான் ராஜா’ என்கிறது!"', ro: 'muyal sonnadhu, "mannikkavum! inno ru singam vanthadhu. ‘nān rājā’ enkiradhu!"', en: 'The rabbit said, "Sorry! Another lion came. It says *I* am the king!"' },
      { ta: '"எங்கே அவன்? காட்டு!" முயல் ஒரு ஆழமான கிணற்றிடம் அழைத்துச் சென்றது.', ro: '"engē avaṉ? kāṭṭu!" muyal oru āḻamāna kiṇṟiḍam azhaiththu senthadhu.', en: '"Where is he? Show me!" The rabbit led it to a deep well.' },
      { ta: 'கிணற்றில் சிங்கத்தின் நிழல். சிங்கம் கர்ஜித்தது... கொந்தளித்து உள்ளே குதித்தது.', ro: 'kiṇṟil singaththin niḻal. singam karjithadhu... kondaliththu uḷḷē kuḑithadhu.', en: 'The lion\'s shadow in the well. It roared and leapt in.' },
      { ta: 'காட்டுல எல்லா விலங்குகளும் சந்தோஷம். முயல் குதித்து குதித்து நடந்தது.', ro: 'kāṭṭula ellā vilaṅgukaḷum sandōṣam. muyal Kudithu Kudithu naḍandhadhu.', en: 'Every animal in the forest was happy. The rabbit hopped home.' }
    ],
    moral: { ta: 'பலம் இருந்தால் போதாது, புத்தி வேண்டும்.', ro: 'palam irunthāl pōdhādhu, putti vēṇṭum.', en: 'Strength is not enough; you need wit.' }
  });

  /* ────────────────────────── 5. the hare and the tortoise — Aesop */
  story({
    id: 'muyal-aamai',
    ta: 'முயலும் ஆமையும்',
    en: 'The Hare and the Tortoise',
    icon: '🐇',
    color: '#7c3aed',
    pages: [
      { ta: 'முயல் பெரிதாக சொன்னது, "நான் வேகமா ஓடுவேன்! எனக்கு ஓட்டத்தில் ஜெயிக்க முடியாது!"', ro: 'muyal peridhāga sonnadhu, "nān vēgama ōḍuvēn! enakku ōṭṭathil jhaikka muḍiyādu!"', en: 'The hare bragged, "I run so fast — nobody can beat me!"' },
      { ta: 'ஆமை மெல்ல சிரித்தது. "சரி, போட்டி வைத்துக்கொள்வோம்."', ro: 'āmai mella siridhadhu. "sari, pōṭṭi vaikthukkoḷvōm."', en: 'The tortoise smiled slowly. "Then let us race."' },
      { ta: 'எல்லா விலங்குகளும் வந்து பார்த்தன. "தொடங்கு!" முயல் போய்விட்டது!', ro: 'ellā vilaṅgu kaḷum vandhu pārtthana. "thoḍangu!" muyal pōyviṭṭadhu!', en: 'All the animals came to watch. "Go!" and the hare was gone!' },
      { ta: 'முயல் திரும்பிப் பார்த்தது. "ஆமை இன்னும் தூரத்தில். சிறிது தூங்கலாமா?"', ro: 'muyal thirumbip pārtthadhu. "āmai innum thūrathil. siridhu thūṅgalāmā?"', en: 'The hare looked back. "The tortoise is far behind. A little nap?"' },
      { ta: 'முயல் தூங்கியது. ஆமை நிக்கலே. மெல்ல மெல்ல, ஆனா நிக்கலே.', ro: 'muyal thūṅgiyadhu. āmai nikka lē. mella mella, āṉā nikka lē.', en: 'The hare slept. The tortoise never stopped. Slowly, but never stopping.' },
      { ta: 'முயல் திடுக்கிட்டு எழுந்தது! ஆமை கோட்டை நோக்கி வந்துகிண்டிருந்தது!', ro: 'muyal thidukkiṭṭu eḻundhadhu! āmai kōṭṭai nōkki vandhukiṇḍirundhadhu!', en: 'The hare woke with a start! The tortoise was at the line!' },
      { ta: 'ஆமை ஜெயித்தது! எல்லாரும் கத்தினா. "ஆமை! ஆமை!"', ro: 'āmai jheitadhu! ellārum kathina. "āmai! āmai!"', en: 'The tortoise won! Everyone shouted, "Tortoise! Tortoise!"' }
    ],
    moral: { ta: 'நிறுத்தாதவன் ஜெயிப்பான்.', ro: 'niṟuthāda vaṉ jheippāṉ.', en: 'Whoever keeps going wins.' }
  });

  /* ───────────────────────── 6. the lion and the mouse — Aesop */
  story({
    id: 'singam-eli',
    ta: 'சிங்கமும் எலியும்',
    en: 'The Lion and the Mouse',
    icon: '🐭',
    color: '#0891b2',
    pages: [
      { ta: 'சிங்கம் உறங்கியது. ஒரு சிறு எலி அதன் மீது ஏறி விளையாடியது.', ro: 'singam uṟangiyaḍhu. oru siru eli adhan mēḍu ēri viḷaiyāḍiyadhu.', en: 'A lion slept, and a little mouse played on top of it.' },
      { ta: 'சிங்கம் கோபத்தில் பிடித்தது! "உன்னை விழுங்கிடுவேன்!"', ro: 'singam kōpathil piḍithadhu! "uṉṇai viḻuṅgiḍuvēn!"', en: 'The lion grabbed it in anger! "I will swallow you!"' },
      { ta: 'எலி கெஞ்சியது, "விட்டுடு! ஒரு நாள் நான் உனக்கு உதவுவேன்." சிங்கம் சிரித்து விட்டது.', ro: 'eli keñchiyaḍhu, "viṭṭuḍu! oru nāḷ nān unakku udhavuvēn." singam siridhu viṭṭadhu.', en: 'The mouse begged, "Let me go! One day I will help you." The lion laughed and let it go.' },
      { ta: 'ஒரு நாள் வேடன் வலையில் சிங்கம் சிக்கியது! கர்ஜனை! யாலும் வரலை.', ro: 'oru nāḷ vēḍan valaiyil singam chikkiyadhu! karjanai! yālum varala.', en: 'One day the lion got caught in a hunter\'s net! It roared, and nobody came.' },
      { ta: 'எலி ஓடி வந்தது. "நான் வந்தேன்!" பல்லை காட்டி கீறு... கீறு...', ro: 'eli ōḍi vanthadhu. "nān vandhēn!" pallai kāṭṭi kīṟu... kīṟu...', en: 'The mouse ran up. "I am here!" Teeth out — slice... slice...' },
      { ta: 'வலை அறுந்து போச்சு! சிங்கம் வெளியே வந்தது.', ro: 'valai aṟundu pōchu! singam veḷiyē vandhadhu.', en: 'The net tore! The lion came free.' },
      { ta: '"சிறியவங்க even பெரிய உதவி செய்வாங்க," என்றது சிங்கம். இரண்டும் நண்பர்களாயிற்று.', ro: '"siriya vanga even periya udhavi seiyvānga," ēnradhu singam. iruṇḍum naṉbarkaḷāyiṟṟu.', en: '"Even small friends do big help," said the lion. They became friends.' }
    ],
    moral: { ta: 'யாரையும் சிறியவள் என நினைக்காதே.', ro: 'yārai yum siriya vaḷ ena ninaikāthē.', en: 'Never think anyone is too small to matter.' }
  });

  /* ──────────────────────────── 7. the crow and the fox — Aesop */
  story({
    id: 'kakku-nari',
    ta: 'காக்கையும் நரியும்',
    en: 'The Crow and the Fox',
    icon: '🦊',
    color: '#ea580c',
    pages: [
      { ta: 'காக்கை ஒரு எள் லட்டை பிடிச்சு மரத்தில் உக்காந்தது. "இது என்னுடையது!"', ro: 'kākkai oru eḷ laṭṭai piḍichu marathil ukkāndhadhu. "idhu eṉuḍaiyadhū!"', en: 'A crow held a sesame sweet and sat in a tree. "This is mine!"' },
      { ta: 'ஒரு நரி வந்து பார்க்குது. "என்ன அழகான நிறம்! என்ன அழகான கண்கள்!"', ro: 'oru nari vandhu pārkuthu. "enna azhagāna niṟam! enna azhagāna kaṅgaḷ!"', en: 'A fox came and looked. "What lovely colour! What lovely eyes!"' },
      { ta: 'காக்கைக்கு ரொம்ப மகிழ்ச்சி. நரி சொன்னது, "பாடும்! உன் குரல் கேட்கணும்!"', ro: 'kākkaiku romba magizhchi. nari sonnadhu, "pāḍum! un kural kēḍkaṇum!"', en: 'The crow was thrilled. The fox said, "Sing! I must hear your voice!"' },
      { ta: 'காக்கை வாயை திறந்தது — "கா! கா! கா!" லட்டு கீழே விழுந்தது!', ro: 'kākkai vāyai thiraṅgadh — "kā! kā! kā!" laṭṭu kīḷē viḻundhadhu!', en: 'The crow opened its beak — "Caw! Caw! Caw!" The sweet fell!' },
      { ta: 'நரி லட்டை எடுத்துக்கொண்டது. "நன்றி காக்கை! பாட தெரியாதவளுக்கு பாட சொன்னேனே!"', ro: 'nari laṭṭai eḍuthukkoṇḍadhu. "naṉṟi kākkai! pāḍa theriyādhavaḷukku pāḍa sonnēnē!"', en: 'The fox took the sweet. "Thanks, crow! I asked a non-singer to sing!"' },
      { ta: 'காக்கை தலையை அசைத்தது. ஒரு லட்டு போச்சு — ஆனா ஒரு பாடம் கிடைச்சு.', ro: 'kākkai thalaiyai asaiyadhu. oru laṭṭu pōchu — āṉā oru pāḍam kiḍaichu.', en: 'The crow shook its head. One sweet lost — but one lesson gained.' }
    ],
    moral: { ta: 'புகழ் பேசுனவளை நம்பறதுக்கு முன்ன ஆలోசிக்கணும்.', ro: 'pugazh pēsuṉavaḷai nambṟadhukku munna ālōsikkaṇum.', en: 'Think before you believe a flatterer.' }
  });

  /* ──────────────────── 8. the donkey in the lion's skin — Aesop */
  story({
    id: 'kazhudhai-singa-udai',
    ta: 'கழுதை சிங்க உடையில்',
    en: 'The Donkey in the Lion\'s Skin',
    icon: '🫏',
    color: '#6b7280',
    pages: [
      { ta: 'ஒரு கழுதை. காட்டுல ஒவ்வொரு நாளும் வேட்டை. ஒரு நாள் அது பழைய சிங்க தோலை கண்டுபிடிச்சது.', ro: 'oru kazhudhai. kāṭṭula ovvoru nāḷum vēṭṭai. oru nāḷ adhu pazhaiya singa tholai kaṇḍupidi chadhu.', en: 'A donkey, hunted daily, one day found an old lion\'s skin.' },
      { ta: 'அதை போட்டுக்கொண்டது. "இப்ப எனக்கு பயம் இல்ல!"', ro: 'adhai pōṭṭikkoṇḍadhu. "ippa enakku bayam illa!"', en: 'It put it on. "Now nobody frightens me!"' },
      { ta: 'மான் பயந்து ஓயுது. வாத்து ஓயுது. ஆடு ஓயுது. கழுதைக்கு ரொம்ப பெருமையாய் போச்சு.', ro: 'mān bayandhu ōyudhu. vāthu ōyudhu. āḍu ōyudhu. kazhudhaikku romba perumaiyāi pōchu.', en: 'The deer ran, the ducks ran, the goats ran. The donkey swelled with pride.' },
      { ta: '"நான் தான் காட்டு ராஜா!" என்று பெரிதாக முனகியது.', ro: '"nān thān kāṭṭu rājā!" endru peridhāga munugiyaḍhu.', en: '"I am the king of the forest!" it grumbled grandly.' },
      { ta: 'ஆனா காற்று வந்தது. தலையில தோலை சரிக்க வச்சுது. கழுதைக்கு கோபம் — அதான் பாடத் தொடங்கியது: டியா... டியா... டியா!', ro: 'āṉā kāṟṟu vanthadhu. thalaiyila tholai sarikka vachchudhu. kazhudhaikku kōbam — adhan pāḍad thoḍangiyadhu: ḍiyā... ḍiyā... ḍiyā!', en: 'But the wind slipped the skin. The donkey got angry — and started to bray: hee-haw... hee-haw...!' },
      { ta: 'நரி சிரிச்சு. "சிங்க உடையில இருந்தாலும், குரல் கழுதை குரல் தான்!"', ro: 'nari sirichu. "singa uḍaiyila irundhālum, kural kazhudhai kural thān!"', en: 'The fox laughed. "Lion skin or not — that voice is still a donkey!"' },
      { ta: 'எல்லாரும் ஓடி வந்து தோலை கிழிச்சா. கழுதை வெட்கமா நகர்ந்தது.', ro: 'ellārum ōḍi vandhu tholai kiḻichā. kazhudhai vetkama nagarnadhu.', en: 'They all ran up and tore the skin off. The donkey walked away ashamed.' }
    ],
    moral: { ta: 'வேறவங்க உடையை போடுறதுல பயம் மறைஞ்சிருக்கு.', ro: 'vēṟavaṅga uḍaiyai pōḍuṟadhu la bayam maṟañchirukku.', en: 'Borrowed clothes only hide fear for a day.' }
  });

  /* ────────────────── 9. the two cats and the monkey — Panchantantrum */
  story({
    id: 'iru-punai-kurang',
    ta: 'இரண்டு பூனைகளும் குரங்கும்',
    en: 'The Two Cats and the Monkey',
    icon: '🐈',
    color: '#db2777',
    pages: [
      { ta: 'இரண்டு பூனைகள் ஒரு ரொட்டி துண்டை கண்டுபிடிச்சன. "எனது!" "இல்லை, எனது!"', ro: 'iruṇḍu pūnaigaḷ oru roṭṭi tuṇḍai kaṇḍupidi chana. "eṉadhu!" "illai, eṉadhu!"', en: 'Two cats found a piece of bread. "Mine!" "No, mine!"' },
      { ta: 'அவை சண்டை போட்டன. அழுதன. "இதை யார் சமமா பிரிப்பாங்க?"', ro: 'avai saṇḍai pōṭṭana. azhudhana. "idhai yār samamā piruppāṅga?"', en: 'They fought and cried. "Who will divide it fairly?"' },
      { ta: 'ஒரு குரங்கு வந்தது. "நான் நியாயமா பிரிச்சு தருறேன்!"', ro: 'oru kurangu vanthadhu. "nān niyāyamā pirichu tharuṟēn!"', en: 'A monkey came. "I will divide it fairly!"' },
      { ta: 'அது இரண்டு துண்டு பண்ணது. "இது கொஞ்சம் பெரியது!" — பெரிய துண்டை கடிச்சது.', ro: 'adhu iraṇḍu tuṇḍu paṇṇadhu. "idhu koñcam periya thu!" — periya tuṇḍai kaḑichadhu.', en: 'It made two pieces. "This one is bigger!" — and bit the bigger one.' },
      { ta: '"இப்ப இது பெரியதாய் போச்சு!" — மறு துண்டையும் கடிச்சது.', ro: '"ippa idhu periya thāi pōchu!" — maṟu tuṇḍaiyum kaḑichadhu.', en: '"Now this one is bigger!" — and it bit the other.' },
      { ta: 'சிறிது, சிறிதா... ரொட்டி முழுக்க குரங்கின் வயித்துல போய்விட்டது!', ro: 'siridhu, siridhā... roṭṭi muḻukka kuraṅgin vaiyathuil pōyviṭṭadhu!', en: 'Little by little... the whole bread ended in the monkey\'s belly!' },
      { ta: 'இரண்டு பூனைகளும் ஒண்ணா பார்த்துக்கிட்டன. அன்று முதல் அவை சண்டை போடலை.', ro: 'iruṇḍu pūnaigalum oṇṇā pārtthukkiṭṭana. aṉṟu mudhal avai saṇḍai pōḍalē.', en: 'The two cats looked at each other. From that day they never fought again.' }
    ],
    moral: { ta: 'சண்டை போட்டா இரண்டு பேரும் இழப்பாங்க.', ro: 'saṇḍai pōṭṭā iruṇḍu pērum iḻappāṅga.', en: 'When two fight, both lose.' }
  });

  /* ───────────────────────────── 10. the blue jackal — Panchantantrum */
  story({
    id: 'neela-nari',
    ta: 'நீல நரி',
    en: 'The Blue Jackal',
    icon: '🐺',
    color: '#2563eb',
    pages: [
      { ta: 'ஒரு நரி. காட்டுல எல்லாரும் அதை துரத்தினா. ஓ, ஓ, ஓ!', ro: 'oru nari. kāṭṭula ellārum adhai thuraṭṭina. ō, ō, ō!', en: 'A jackal. Everyone in the forest chased it. Shoo, shoo, shoo!' },
      { ta: 'ஓடி ஓடி அது ஒரு தண்ணீர் தொட்டியில் விழுந்தது! உள்ளே நீல நிறம்!', ro: 'ōḍi ōḍi adhu oru thaṇṇīr toṭṭiyil viḻundhadhu! uḷḷē nīla niṟam!', en: 'Running, it fell into a water vat! Inside was blue dye!' },
      { ta: 'அது வெளியே வந்தது — முழுக்க நீலம்! எல்லாம் நிமிர்ந்து பார்த்தன.', ro: 'adhu veḷiyē vandhadhu — muḻukka nīlam! ellām ni mirndhu pārtthana.', en: 'It came out — blue all over! Everyone looked up.' },
      { ta: 'யானை சொன்னது, "இது நம்ம அரசனாக வரவேண்டிய தேவதை!" எல்லாம் வணங்கின.', ro: 'yānai sonnadhu, "idhu namma arasaṉāga varavēṇḍiya thēvadhā!" ellā vaṇaṅgina.', en: 'The elephant said, "This is the spirit sent to be our king!" Everyone bowed.' },
      { ta: 'நரி பெரிய மனிஷி மாதிரி நடந்தது. "நான் உங்கள் அரசன்!" என்று சொல்லுச்சு.', ro: 'nari periya maniṣi mādiri naḍandhadhu. "nān uṅkaḷ arasaṉ!" endru solluchu.', en: 'The jackal walked like a grand person. "I am your king!" it said.' },
      { ta: 'ஒரு இரவு, வெளியே நரிகள் கூடின. "ஓவோ... ஓவோ..." என்றன.', ro: 'oru iravu, veḷiyē nari gaḷ kūḍina. "ōvō... ōvō..." ēnṟana.', en: 'One night the other jackals gathered. "Howl... howl..."' },
      { ta: 'நரியும் மறந்துட்டது — "ஓவோ... ஓவோ!" எல்லாரும் திரும்பிப் பார்த்தா.', ro: 'nariyum marandhuṭṭadhu — "ōvō... ōvō!" ellārum thirumbip pārtthā.', en: 'The jackal forgot itself — "Howl... howl!" Everyone turned to look.' },
      { ta: '"நீ நீல நிற நரி தான்!" என்று எல்லாம் துரத்தினா. அப்புறம் அது நரியா மறந்துட்டது.', ro: '"nī nīla niṟa nari thān!" endru ellām thuraṭṭina. appuṟam adhu nariyā maṟandhuṭṭadhu.', en: '"You are only a blue jackal!" they all shouted. After that it stayed a plain jackal.' }
    ],
    moral: { ta: 'போலி பெருமை ஒரு நாள் தான் நிற்கும்.', ro: 'pōli perumai oru nāḷ thān niṟkkum.', en: 'Borrowed grandeur lasts one day.' }
  });

  TT.stories = {
    all: function () { return TT.books.all().filter(function (b) { return b.story; }); }
  };
})(window.TT = window.TT || {});
