/* Ten Tamil story-books, and where each one comes from.

   Two things were wrong here before, and both are the kind that quietly
   outlives a code review.

   1. PROVENANCE. The plots are old — Panchantantrum and Aesop, belonging to
      nobody for a couple of thousand years — but the *sentences* in this file
      used to be written by a model, with nothing saying so and nothing naming
      a parent text. So every book now carries `source` and `sourceNote`, and
      the archived parent text is kept in sources/stories/ (tools/fetch-story-
      sources.py pulls it, and --list shows the whole map). Two of these tales
      have a true archived twin on ta.wikisource, one has a close cousin, and
      the rest have no Tamil parent we could find in the three archives we
      checked — which is now written down instead of being quietly glossed as
      "folk tale". Check a claim by opening the file; do not take this
      comment's word for it.

   2. REGISTER. The word bank went through a spoken-Tamil pass ("the words a
      toddler actually hears, not the ones a textbook uses"). This file never
      did, so it stood in written register right next to a word bank that did —
      அதின், -இல் locatives, நில், -கிறேן, வேண்டும். tools/check-data.js now lints
      these pages for exactly those forms, so the two halves of the app cannot
      drift apart again.

   What we took from the archive is the story: who is in it, what happens, in
   what order, and the idiom. What we did not take is the register — the
   archived books say இருந்தன and வாழ்ந்து வந்தன, and a two-year-old hears
   இருந்துச்சு and வாழ்ந்து வந்துச்சு. tools/check-data.js checks the shape of
   these pages; the Tamil itself still wants a human read before a child hears
   it, and `ro` is the plain-ASCII phonetic the word bank uses (maam pazham,
   aaranju), not a scholarly transliteration.

   One page is one spoken line, narrated into audio/books/<id>/p<nn>.mp3 by
   tools/make-story-pack.py, which writes `dur` back after measuring the file.
   Edit `ta` here, re-run that tool, and the book re-narrates itself. Page art
   is named by page number, not listed — see views/library.js.
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
    /* Page art is named, not listed, for the same reason the clips are: the
       page number is the identity. --promote-pages writes
       images/books/p-<id>-<nn>.webp and the page finds its picture with no
       data edit. A page that has no file yet simply shows no picture — see
       the 404 latch in views/library.js. */
    def.pages = (def.pages || []).map(function (p, i) {
      var nn = ('0' + (i + 1)).slice(-2);
      return {
        k: 'line',
        ta: p.ta,
        ro: p.ro || '',
        en: p.en || '',
        clip: 'audio/books/' + def.id + '/p' + nn + '.mp3',
        art: p.art || 'images/books/p-' + def.id + '-' + nn + '.webp',
        dur: p.dur || 0
      };
    });
    if (def.moral) {
      def.pages.push({
        k: 'moral', ta: def.moral.ta, ro: def.moral.ro || '', en: def.moral.en || '',
        clip: 'audio/books/' + def.id + '/p-moral.mp3',
        art: def.moral.art || 'images/books/p-' + def.id + '-moral.webp',
        dur: def.moral.dur || 0
      });
    }
    B.book(def);
  }

  /* ────────────────────────────── 1. the thirsty crow — Aesop */
  /* No Tamil parent found. The thirsty-crow-and-the-pot tale is Aesop's, and it
     is not in the archived Panchantantrum (57 tales) or the other two
     collections; the archived crow tales that ARE there (கரும்பாம்பைக் கொன்ற
     காகம், ஒட்டகத்தைச் கொன்ற காகம்) are different stories. So it is labelled
     Aesop rather than being given a fake Tamil grandfather. */
  story({
    id: 'kakku-kudam',
    ta: 'காக்கையும் குடமும்',
    en: 'The Thirsty Crow',
    icon: '🐦‍⬛',
    color: '#475569',
    source: 'Aesop — no Tamil parent text found',
    sourceNote: 'The pot-and-pebbles crow is Aesop, not Panchantantrum: it is not in the '
      + 'archived 57-tale Panchantantrum or the other two ta.wikisource collections. Kept '
      + 'because toddlers love it; the telling here is ours.',
    pages: [
      { ta: 'ஒரு நாள் கொத்த வெயில். காக்கைக்கு ஒண்ணே தாகம்.', ro: 'oru naal kotta veyil. kaakkaikku onne thaagam.', en: 'One day, blistering heat. The crow was terribly thirsty.' },
      { ta: 'அது ஒரு மரத்து அடியில உக்காந்துச்சு. "எங்கே இருக்கு தண்ணி?"', ro: 'adhu oru marathu adiyila ukkaanthuchu. "engae irukku thanni?"', en: 'It sat down under a tree. "Where is the water?"' },
      { ta: 'அருகில ஒரே குடம்! உள்ளே தண்ணி — ஆனா அடியில சிறிது தான்.', ro: 'arulhila orae kudam! ullae thanni  -  aana adiyila siridhu thaana.', en: 'Right nearby, a pot! Water inside — but only a little at the bottom.' },
      { ta: 'காக்கை வாயை வைச்சுச்சு. அடையல! அடையல! காக்கை புலம்புச்சு.', ro: 'kaakkai vaagai vaichuchu. adaiyala! adaiyala! kaakkai pulambuchu.', en: 'The crow put its beak in. It could not reach! It could not reach! The crow moaned.' },
      { ta: 'அப்புறம்! காக்கைக்கு ஒரே யோசனை.', ro: 'appuram! kaakkaiku orae yosana.', en: 'Then! The crow got one whole idea.' },
      { ta: 'சின்ன கல்ல எடுத்து குடத்துல போட்டது. டிக்... டிக்... டிக்...', ro: 'sinna kalla eduthu kudathula pottadhu. tik... tik... tik...', en: 'It picked up little stones and dropped them in. Tick... tick... tick...' },
      { ta: 'தண்ணி மேலே வந்துச்சு! காக்கை குடிச்சுச்சு. எவ்ளோ குளிர்!', ro: 'thanni melae vanthuchu! kaakkai kudichuchu. evllo kulir!', en: 'The water came up! The crow drank and drank. So cool!' },
      { ta: 'காக்கை சந்தோஷமா பறந்துச்சு. "நன்றி, சின்ன கல்லே!"', ro: 'kaakkai sandoshama paranthuchu. "nandri, sinna kalle!"', en: 'The crow flew off happy. "Thank you, little stones!"' }
    ],
    moral: { ta: 'முதல்ல யோசி, அப்புறம் பண்ணு.', ro: 'mudhalla yosi, appuram pannu.', en: 'Think first, then do.' }
  });

  /* ─────────── 2. the tortoise and the two geese — Panchantantrum, archived */
  /* The true archived twin: பஞ்ச தந்திரக் கதைகள் / வாயடக்கம் இல்லாத ஆமை
     ("the tortoise whose mouth would not shut"). Same pond, same two geese,
     same lifted-off friend, same mouth that opens when it must not. Two
     deliberate departures, both ours to own:
       · the archived geese carry the tortoise on a *stick* it bites in the
         middle; ours uses a cloth. (The page art shows a cloth — switching to
         a stick means re-rendering those pages.)
       · the archived tortoise falls and dies. Ours lands in soft grass. That
         is the grandmother-version softening, and it is a choice, not a
         translation. See the note in README. */
  story({
    id: 'aamai-annangal',
    ta: 'ஆமையும் இரண்டு அன்னங்களும்',
    en: 'The Tortoise and the Two Geese',
    icon: '🐢',
    color: '#16a34a',
    source: 'பஞ்ச தந்திரக் கதைகள் — வாயடக்கம் இல்லாத ஆமை (ta.wikisource)',
    sourceNote: 'Plot, cast and sequence from the archived telling; the cloth (the archive '
      + 'uses a stick) and the safe landing (the archive kills the tortoise) are our '
      + 'softening. Sources in sources/stories/.',
    pages: [
      { ta: 'ஒரு குளத்துல ஒரே ஆமை. அதற்கு நண்பர்களே இல்ல.', ro: 'oru kulathula orae aamai. adhariku nanbarkale illa.', en: 'In one pond lived one tortoise. It had no friends at all.' },
      { ta: 'இரண்டு அன்னங்கள் வந்துச்சு. "வா, எங்க கூட வா!"', ro: 'irandu annangal vanthuchu. "vaa, enga kooda vaa!"', en: 'Two geese came along. "Come, come with us!"' },
      { ta: 'ஆமை சொன்னது, "எனக்கென்ன சிறகு இருக்கப் போகுது..."', ro: 'aamai sonnadhu, "enakenna siragu irukka poogudhu..."', en: 'The tortoise said, "When would I ever get wings..."' },
      { ta: 'அன்னங்கள் ஒரே கம்பளம் கொண்டாந்தன. "இத நடுவுல நில்லு, நாங்க ஏத்துறோம்."', ro: 'annangal orae kambalam kondandhana. "idha naduvula nillu, naang ethrurom."', en: 'The geese brought a cloth. "Stand in the middle, we will lift you up."' },
      { ta: 'ஆகாயத்துல பறந்துச்சு! காற்று மெல்ல வந்துச்சு.', ro: 'aakaayathula paranthuchu! kaatru mella vanthuchu.', en: 'They flew up in the sky! The breeze came softly.' },
      { ta: 'கீழே ஒருத்தர் மேலே பார்த்தார். "பாத்தீங்களா! ஆமை பறக்கு!"', ro: 'keezhae oruthar melae paaththaar. "paatheengala! aamai paraku!"', en: 'Someone below looked up. "Look at that! A tortoise is flying!"' },
      { ta: 'ஆமை மறந்துட்டது — "நான் தான் பறக்குவேன்!" வாய் திறந்தது... தப்!', ro: 'aamai marandhuttadhu  -  "naaan thaana parakkuven!" vaai thirandhadhu... thap!', en: 'The tortoise forgot itself — "It is me flying!" The mouth opened... thud!' },
      { ta: 'மெதுவான புல்லில விழுந்துச்சு. அன்னங்கள் அதை காப்பாத்தின. அன்ருலிருந்து அந்த ஊரில ஆமை சந்தோஷமா இருக்கு.', ro: 'medhuvaan pullila vizhunthuchu. annangal adhai kaappaathina. anrulirundhu andha oorila aamai sandoshama irukku.', en: 'It fell on soft grass. The geese kept it safe. From that day the tortoise has been happy in that village.' }
    ],
    moral: { ta: 'பேச வேண்டாத இடத்துல வாயை மூடிக்கோ.', ro: 'pesa vendaad idattuila vaagai moodikko.', en: 'Keep your mouth shut where it should not open.' }
  });

  /* ──────────── 3. the monkey and the crocodile — Panchantantrum, archived */
  /* The true archived twin: கிடைத்த குரங்கைக் கைவிட்ட முதலை ("the crocodile who
     gave up the monkey it had got"). The archived opening matches ours — a tree
     on the bank, fruit dropping into the water, a friendship built on it, then
     the wife's craving and a messenger crocodile. Title fixed here: it read
     'வானரமும் முதலையையும்', which is not a Tamil form. */
  story({
    id: 'vanaram-mudalai',
    ta: 'வானரமும் முதலையும்',
    en: 'The Monkey and the Crocodile',
    icon: '🐒',
    color: '#b45309',
    source: 'பஞ்ச தந்திரக் கதைகள் — கிடைத்த குரங்கைக் கைவிட்ட முதலை (ta.wikisource)',
    sourceNote: 'Archived twin of this tale: bank tree, fallen fruit, the crocodile\'s '
      + 'friendship, the wife\'s craving, the monkey\'s quick wit. Sentences are ours, in '
      + 'spoken register.',
    pages: [
      { ta: 'ஆற்றோரத்துல ஒரே மாமரம். அதுல ஒரே வானரம்.', ro: 'aatroarathula orae maamaram. adhula orae vaanaram.', en: 'On the river bank, one mango tree. In it, one monkey.' },
      { ta: 'ஆத்துல ஒரே முதலை வந்துச்சு. வானரம் இரண்டு மாம்பழம் கொடுத்தது.', ro: 'aathula orae mudalai vanthuchu. vaanaram irandu maampazham koduthadhu.', en: 'One crocodile came in the river. The monkey handed it two mangoes.' },
      { ta: 'எல்லா நாளும் மாம்பழம்! "இவ்வளவு இனிமையான நண்பன் வேணாம்," முதலை சொன்னது.', ro: 'ella naalum maampazham! "ivvalavu inimaiyana nanban vendaam," mudalai sonnadhu.', en: 'Mangoes every single day! "I could not wish a sweeter friend," said the crocodile.' },
      { ta: 'ஆனா வீட்ல அதன் மனைவி சொன்னா, "அவன் இதயம் வேணும்."', ro: 'aana veetla adhan maniwi sonnaa, "avan idhayam venum."', en: 'But at home his wife said, "I want his heart."' },
      { ta: 'முதலை மனசு கெட்டு வந்துச்சு. "வா... என் வீட்டுல வா."', ro: 'mudalai manasu kettu vanthuchu. "vaa... en veetula vaa."', en: 'Heavy-hearted, the crocodile came. "Come... come to my house."' },
      { ta: 'வானரம் புத்திசாலி! "ஆத்து நடுவுல வீடு எப்படி இருக்கும்?"', ro: 'vaanaram putthisaali! "aathu naduvula veedu eppadi irukkum?"', en: 'The monkey had wit! "How can a house sit in the middle of a river?"' },
      { ta: '"ஐயோ! என் இதயம் இந்த மரத்துல தானே வைச்சிருக்கேன்!" வானரம் சொன்னது.', ro: '"aiyo! en idhayam indha marathula thaanae vaichirukken!" vaanaram sonnadhu.', en: '"Oh! I left my heart in this tree, of course!" said the monkey.' },
      { ta: '"ஏறு, எடுத்துட்டு வா!" — வானரம் ஏறிடுச்சு. "நன்றி முதலை. இனி நாம நண்பர்களில்ல."', ro: '"erru, eduthuttu vaa!"  -  vaanaram eriduchu. "nandri mudalai. ini naama nanbarkarilla."', en: '"Climb up and fetch it!" — and the monkey was up. "Thanks, crocodile. We are not friends now."' }
    ],
    moral: { ta: 'பயம் வந்தா, அமைதியா யோசி.', ro: 'bayam vandha, amaithiya yosi.', en: 'When fear comes, think quietly.' }
  });

  /* ─────────────── 4. the lion and the rabbit — Panchantantrum, archived cousin */
  /* சிங்கத்தைக் கொன்ற முயல் is on ta.wikisource, but the archived rabbit tale
     there uses the well-and-reflection trick on an *elephant* king, and adds the
     bargain the earlier version of this book was missing: the animals agree to
     send the lion one animal a day, which is why a rabbit ever has to turn up
     late. That bargain is now page 2. The stronger animal is a lion here, as it
     always has been in this book. */
  story({
    id: 'singam-muyal',
    ta: 'சிங்கமும் முயலும்',
    en: 'The Lion and the Rabbit',
    icon: '🦁',
    color: '#d97706',
    source: 'பஞ்ச தந்திரக் கதைகள் — சிங்கத்தைக் கொன்ற முயல் / யானையை வென்ற வெள்ளை முயல் (ta.wikisource)',
    sourceNote: 'The archived rabbit tales use the well-and-reflection trick on an elephant '
      + 'king; the one-animal-a-day bargain (page 2) is theirs. Here the bully is a lion, as '
      + 'in every telling of this book.',
    pages: [
      { ta: 'காட்டுல ஒரே சிங்கம். எல்லா நாளும் விலங்குகளை பிடிச்சு தின்னது.', ro: 'kaattula orae singam. ella naalum vilangukalai pichu thinnadhu.', en: 'In the forest, one lion. Every day it caught animals and ate them.' },
      { ta: 'எல்லாம் கூடி கேட்டுச்சு — "ராஜா, நாங்களே ஒவ்வொரு நாளும் ஒரே விலங்கு அனுப்பறோம்!"', ro: 'ellaam koodi kettuchu  -  "raaja, naangale ovvoru naalum orae vilangu anupprom!"', en: 'They all gathered and asked — "King, we ourselves will send you one animal every day!"' },
      { ta: 'ஒரு நாள் ஒரே சின்ன முயல் நடந்து வந்துச்சு. சிங்கத்திற்கு ஒண்ணே கோபம்.', ro: 'oru naal orae sinna muyal nadandhu vanthuchu. singaththiriku onne kobam.', en: 'One day one little rabbit walked up. The lion was furiously angry.' },
      { ta: 'முயல் சொன்னது, "மன்னிச்சுடுங்க! இன்னொரு சிங்கம் வந்துச்சு. ‘நான் தான் ராஜா’ னு சொல்லுது!"', ro: 'muyal sonnadhu, "mannichuchum! inna oru singam vanthuchu. \'naaan thaana raaja\' nu solludhu!"', en: 'The rabbit said, "Forgive me! Another lion came. It says *it* is the king!"' },
      { ta: '"எங்கே அவன்? காட்டு!" முயல் அதை ஆழமான கிணத்து கிட்ட அழைச்சுப் போச்சு.', ro: '"engae ava? kaattu!" muyal adhai aazhamaana kinathu kitta aazhuchu poochu.', en: '"Where is he? Show me!" The rabbit led it to a deep well.' },
      { ta: 'கிணத்துல சிங்கத்தின் பிம்பம்! சிங்கம் கர்ஜிச்சு... உள்ளே குதிச்சு.', ro: 'kinathula singaththin pimpam! singam karjichu... ullae kudichu.', en: 'The lion\'s own image in the well! The lion roared... and jumped in.' },
      { ta: 'காட்டுல எல்லா விலங்குகளுக்கும் சந்தோஷம். முயல் குதிச்சு குதிச்சுப் போச்சு.', ro: 'kaattula ella vilangukalukkum sandosham. muyal kudichu kudichu poochu.', en: 'Every animal in the forest was happy. The rabbit hopped and hopped away.' }
    ],
    moral: { ta: 'பலம் மட்டும் போதாது, புத்தி வேணும்.', ro: 'palam mattum poodhaadhu, putti venum.', en: 'Strength alone is not enough; you need wit.' }
  });

  /* ────────────────────────── 5. the hare and the tortoise — Aesop */
  /* Aesop. The archived hare tales we could find (மோசம் போன முயலும் மைனாவும்,
     யானையை வென்ற வெள்ளை முயல்) are other stories entirely. Page 1 used to say
     "எனக்கு ஓட்டத்தில் ஜெயிக்க முடியாது!" — which means *I cannot win*, the exact
     opposite of the brag, and of the English gloss under it. Fixed. */
  story({
    id: 'muyal-aamai',
    ta: 'முயலும் ஆமையும்',
    en: 'The Hare and the Tortoise',
    icon: '🐇',
    color: '#7c3aed',
    source: 'Aesop — no Tamil parent text found',
    sourceNote: 'The race is Aesop. The archived Tamil hare tales are different stories. '
      + 'Page 1 once bragged in the negative ("I cannot win"); that is fixed.',
    pages: [
      { ta: 'முயல் பெருசா சொன்னது, "என்னாலே வேகமா ஓட முடியும்! என்னை யாரும் தோற்கடிக்க முடியாது!"', ro: 'muyal perusa sonnadhu, "ennale vegama oda mudiyum! ennai yaarum thoorrakadikka mudiyaadhu!"', en: 'The hare bragged big, "I can run fast! Nobody can beat me!"' },
      { ta: 'ஆமை மெல்ல சிரிச்சது. "சரி, ஓட்டம் போடலாமா?"', ro: 'aamai mella sirichadhu. "sari, ottam podalaama?"', en: 'The tortoise smiled slowly. "Then shall we have a race?"' },
      { ta: 'எல்லா விலங்குகளும் வந்து நின்னன. "தொடங்கு!" முயல் போய்டுச்சு!', ro: 'ella vilangugalum vandhu ninnana. "thodangu! muyal pooiduchu!"', en: 'All the animals came and stood. "Go!" and the hare was off!' },
      { ta: 'முயல் திரும்பி பாத்தது. "ஆமை இன்னும் தூரத்துலதான். கொஞ்சம் தூங்கலாமா?"', ro: 'muyal thirumbi paathadhu. "aamai innum thoora thulathan. konjam thungalamaa?"', en: 'The hare looked back. "The tortoise is still far away. A little sleep?"' },
      { ta: 'முயல் தூங்கிடுச்சு. ஆமை நிக்கவே இல்ல. மெல்ல மெல்ல — ஆனா நிக்கவே இல்ல.', ro: 'muyal thoonjiduchu. aamai nikkave illa. mella mella  -  aana nikkave illa.', en: 'The hare fell asleep. The tortoise did not stop at all. Slowly, slowly — but not stopping at all.' },
      { ta: 'முயல் திடுக்கிட்டு எழுந்துச்சு! ஆமை கோட்ட கிட்ட வந்துடுச்சு!', ro: 'muyal thidukkittu elunthuchu! aamai kootta kitta vandhuchu!', en: 'The hare shot awake! The tortoise was at the line!' },
      { ta: 'ஆமை ஜெயிச்சுடுச்சு! எல்லாரும் கத்தினா — "ஆமை! ஆமை!"', ro: 'aamai jeyichuchu! ellaarum kathina  -  "aamai! aamai!"', en: 'The tortoise won! Everyone shouted — "Tortoise! Tortoise!"' }
    ],
    moral: { ta: 'நிக்காதவன் தான் ஜெயிப்பான்.', ro: 'nikkaadha van thaana jeyippaan.', en: 'The one who never stops is the one who wins.' }
  });

  /* ───────────────────────── 6. the lion and the mouse — Aesop */
  /* Aesop. The archived mouse tales (யானையை ஏமாற்றிய எலி, உருவம் மாறிய எலி) are
     about a mouse fooling an elephant — a different animal and a different
     moral. Page 7 used to carry the English word "even" inside the Tamil line;
     that could not have been spoken aloud. */
  story({
    id: 'singam-eli',
    ta: 'சிங்கமும் எலியும்',
    en: 'The Lion and the Mouse',
    icon: '🐭',
    color: '#0891b2',
    source: 'Aesop — no Tamil parent text found',
    sourceNote: 'The net and the gnawed ropes are Aesop. Archived Tamil mouse tales are about '
      + 'a mouse fooling an elephant. Page 7 once had the English word "even" inside the '
      + 'Tamil; fixed.',
    pages: [
      { ta: 'சிங்கம் உறங்குச்சு. ஒரே சின்ன எலி அதன் மேல ஏறி விளையாடிது.', ro: 'singam uranguchu. orae sinna eli adhan mela eriv vilaiyadidhu.', en: 'The lion was asleep. One little mouse climbed on it and played.' },
      { ta: 'சிங்கத்திற்கு ஒண்ணே கோபம் — பிடிச்சுடுச்சு! "உன்னை விழுங்கிடுவேன்!"', ro: 'singaththiriku onne kobam  -  pichuchu! "unnai vizhunggiduven!"', en: 'The lion was furious — it grabbed the mouse! "I will swallow you!"' },
      { ta: 'எலி கெஞ்சிச்சு, "விட்டுடு! ஒரு நாள் நான் உனக்கு உதவுவேன்." சிங்கம் சிரிச்சு விட்டுடுச்சு.', ro: 'eli kenjichu, "vittudu! oru naal naaan unakku udhavuven." singam sirichu vittuchu.', en: 'The mouse begged, "Let me go! One day I will help you." The lion laughed and let it go.' },
      { ta: 'ஒரு நாள் வேட்டைக்காரன் விலையில சிங்கம் சிக்கிடுச்சு! கர்ஜனை! ஆனா யாரும் வரல.', ro: 'oru naal veettaikaraanilai singam chikkiduchu! karjanai! aana yaarum varala.', en: 'One day the lion got caught in a hunter\'s net! It roared! But nobody came.' },
      { ta: 'எலி ஓடி வந்துச்சு. "நான் வந்தேன்!" பல்லை காட்டி — கீறு... கீறு...', ro: 'eli oodi vanthuchu. "naaan vandhen! pallai kaatti  -  keeru... keeru...', en: 'The mouse came running. "I am here!" Teeth bared — slice... slice...' },
      { ta: 'வலை அறுந்துடுச்சு! சிங்கம் வெளியே வந்துடுச்சு.', ro: 'ilai arunthuchu! singam veliyae vandhuchu.', en: 'The net cut through! The lion came out free.' },
      { ta: '"சின்னவங்களாலே பெரிய உதவி ஆகிடும்," சிங்கம் சொன்னது. இரண்டும் நண்பர்களாயிடுச்சு.', ro: '"sinnavangalaale periya udhavi aagidum," singam sonnadhu. irandumn nanbarkalaayiduchu.', en: '"Even small ones can do big help," said the lion. The two became friends.' }
    ],
    moral: { ta: 'யாரையும் சின்னவங்க னு எண்ணாதே.', ro: 'yaaraiyum sinnavanga nu ennaadhe.', en: 'Do not count anyone as too small.' }
  });

  /* ──────────────────────────── 7. the crow and the fox — Aesop */
  /* Aesop (the cheese-and-flattery fable, with a sesame sweet in place of the
     cheese). The archived fox tales are the clever fox of the Panchantantrum —
     a different animal in a different trick. */
  story({
    id: 'kakku-nari',
    ta: 'காக்கையும் நரியும்',
    en: 'The Crow and the Fox',
    icon: '🦊',
    color: '#ea580c',
    source: 'Aesop — no Tamil parent text found',
    sourceNote: 'Flattery-and-the-fallen-morsel is Aesop; the sweet stands in for the cheese. '
      + 'The archived நரி tales are the clever fox of the Panchantantrum, not this trick.',
    pages: [
      { ta: 'காக்கை ஒரே எள் லட்டை பிடிச்சு மரத்துல உக்காந்துச்சு. "இது என்னுடையது!"', ro: 'kaakkai orae el lattai pichu marathula ukkaanthuchu. "idhu ennudaiyadhu!"', en: 'A crow held one sesame sweet and sat in a tree. "This one is mine!"' },
      { ta: 'ஒரே நரி வந்து பாத்துச்சு. "என்ன நிறம்! என்ன கண்கள்!"', ro: 'orae nari vandhu paaththuchu. "enna niram! enna kangal!"', en: 'One fox came and looked. "What a colour! What eyes!"' },
      { ta: 'காக்கைக்கு ரொம்ப சந்தோஷம். நரி சொன்னது, "பாட்டு! உன் குரல் கேட்கணும்!"', ro: 'kaakkaiku romba sandosham. nari sonnadhu, "paattu! un kural ketkanum!"', en: 'The crow was overjoyed. The fox said, "Sing! I must hear your voice!"' },
      { ta: 'காக்கை வாயை திறந்துச்சு — "கா! கா! கா!" லட்டு கீழே விழுந்துடுச்சு!', ro: 'kaakkai vaagai thirandhuchu  -  "kaa! kaa! kaa!" lattai keezhae vizhunthuchu!', en: 'The crow opened its beak — "Caw! Caw! Caw!" The sweet fell down!' },
      { ta: 'நரி லட்டை எடுத்துக்கிட்டுச்சு. "நன்றி காக்கை! பாட வராதவளுக்கு பாட னு சொன்னேனே!"', ro: 'nari lattai eduthukittuchu. "nandri kaakkai! paada varaadha valukku paada nu sonnene!"', en: 'The fox took the sweet. "Thanks, crow! I asked someone who cannot sing to sing!"' },
      { ta: 'காக்கை தலையை அசைச்சுச்சு. ஒரே லட்டு போச்சு — ஆனா ஒரே பாடம் கிடைச்சு.', ro: 'kaakkai Thalaiyai asaichuchu. orae lattai poochu  -  aana orae paadam kidaichu.', en: 'The crow shook its head. One sweet gone — but one lesson got.' }
    ],
    moral: { ta: 'புகழ் சொல்றவள நம்புறதுக்கு முன்ன யோசி.', ro: 'pugazh solra vala namburadhukku muna yosi.', en: 'Think before you believe someone who flatters you.' }
  });

  /* ──────────── 8. the donkey in the lion's skin — Aesop */
  /* The donkey-and-lion-skin tale is Aesop's washerman's donkey. The archived
     donkey tales are both something else — அறிவில்லாமல் ஒழிந்து போன கழுதை is
     the lion who wants a donkey's liver, and தன் வாயினால் கெட்ட கழுதை is the
     donkey that ruins itself by braying. Both fetched and kept, neither is
     this book, so this one stays Aesop rather than wearing a borrowed skin of
     its own. */
  story({
    id: 'kazhudhai-singa-udai',
    ta: 'கழுதை சிங்க உடையில்',
    en: 'The Donkey in the Lion\'s Skin',
    icon: '🫏',
    color: '#6b7280',
    source: 'Aesop — no Tamil parent text found',
    sourceNote: 'The washerman\'s donkey is Aesop. The archived Tamil donkey tales are the '
      + 'lion who wants a donkey\'s liver, and the donkey ruined by its own bray — kept in '
      + 'sources/stories/ as possible replacements.',
    pages: [
      { ta: 'ஒரே கழுதை. காட்டுல எல்லா நாளும் அதுக்கு பயம். ஒரு நாள் பழைய சிங்க தோலை கண்டுபிடிச்சது.', ro: 'orae kazhudhai. kaattula ella naalum adhaikku bayam. oru naal pazhaiya singa tholai kanda pidichadhu.', en: 'One donkey. In the forest it was afraid every single day. One day it found an old lion\'s skin.' },
      { ta: 'அதை போட்டுக்கிட்டுச்சு. "இப்ப எனக்கு பயமே இல்ல!"', ro: 'adhai poottukittuchu. "ippa enakku bayame illa!"', en: 'It put it on. "Now I am not afraid at all!"' },
      { ta: 'மான் பயந்து ஓடுது. வாத்து ஓடுது. ஆடு ஓடுது. கழுதைக்கு ரொம்ப பெருமை.', ro: 'maan bayandhu oodudhu. vaathu oodudhu. aadu oodudhu. kazhudhaikku romba perumai.', en: 'The deer run in fear. The ducks run. The goats run. The donkey is very proud.' },
      { ta: '"நான் தான் காட்டு ராஜா!" னு பெருசா முனகிச்சு.', ro: '"naaan thaana kaattu raaja!" nu perusa munagichu.', en: '"I am the king of the forest!" it grumbled grandly.' },
      { ta: 'ஆனா காற்று வந்துச்சு. தோலை சரிக்க வைச்சுடுச்சு. கழுதைக்கு கோபம் — அதான் பாட ஆரம்பிச்சு: டியா... டியா... டியா!', ro: 'aana kaatru vanthuchu. tholai sarikka vaichuchu. kazudhaikku kobam  -  adhaan paada aarambichu: diya... diya... diya!', en: 'But the wind came. It slipped the skin off. The donkey got angry — and started to sing: hee-haw... hee-haw... hee-haw!' },
      { ta: 'நரி சிரிச்சு. "சிங்க உடையில இருந்தாலும், குரல் கழுதை குரல் தான்!"', ro: 'nari sirichu. "singa udaiyila irundhaalum, kural kazhudhai kural thaana!"', en: 'The fox laughed. "Even in a lion\'s skin, that voice is a donkey\'s voice!"' },
      { ta: 'எல்லாரும் ஓடி வந்து தோலை கிழிச்சாங்க. கழுதை வெட்கமா நகர்ந்துடுச்சு.', ro: 'ellaarum oodi vandhu tholai kizhichanga. kazhudhai vetkama nagarnduchu.', en: 'They all ran up and tore the skin. The donkey moved off ashamed.' }
    ],
    moral: { ta: 'வேறவங்க உடையை போடுறதுல பயம் மறைஞ்சிருக்கு.', ro: 'veravanga udaiyai pooduradhula bayam marainchirukku.', en: 'Behind borrowed clothes, the fear is still hiding.' }
  });

  /* ─────────── 9. the two cats and the monkey — Panchantantrum, not archived */
  /* This is a genuine Panchantantrum tale by descent, but the archived text
     was not in the three collections we fetched — அறிவுக் கதைகள் / இரு குரங்கின்
     கைச்சாறு is about a physician misreading a riddle, not two cats dividing
     food. So the descent is claimed as descent, and the missing text is
     recorded as missing. */
  story({
    id: 'iru-punai-kurang',
    ta: 'இரண்டு பூனைகளும் குரங்கும்',
    en: 'The Two Cats and the Monkey',
    icon: '🐈',
    color: '#db2777',
    source: 'Panchantantrum descent — archived text not found',
    sourceNote: 'A Panchantantrum tale by descent, but no archived Tamil text for it turned up '
      + 'in the 207 fetched tales (இரு குரங்கின் கைச்சாறு is a different story). This '
      + 'telling is ours.',
    pages: [
      { ta: 'இரண்டு பூனைகள் ஒரே ரொட்டி துண்டு கண்டுபிடிச்சன. "எனது!" "இல்லை, எனது!"', ro: 'irandu poonaigal orae rotti dundai kanda pidichana. "enadhu!" "illai, enadhu!"', en: 'Two cats found one piece of bread. "Mine!" "No, mine!"' },
      { ta: 'அவை சண்டை போட்டுக்கிட்டு அழுதன. "இதை யாரு சமமா பிரிப்பாங்க?"', ro: 'avai sandai poottukittu azhudhana. "idhai yaaru samama pirippanga?"', en: 'They fought over it and cried. "Who will divide this fairly?"' },
      { ta: 'ஒரே குரங்கு வந்துச்சு. "நான் நியாயமா பிரிச்சு தரேன்!"', ro: 'orae kurangu vanthuchu. "naaan niyaayama pirichu tharen!"', en: 'One monkey came. "I will divide it fairly and give it!"' },
      { ta: 'அது இரண்டு துண்டு பண்ணது. "இது கொஞ்சம் பெரியதா இருக்கு!" — பெரிய துண்ட கடிச்சது.', ro: 'adhu irandu dundu pannadhu. "idhu konjam periyaadha irukku!"  -  periya dunda kadichadhu.', en: 'It made two pieces. "This one looks bigger!" — and bit the big piece.' },
      { ta: '"இப்ப இது பெரியதா இருக்கு!" — மறு துண்டையும் கடிச்சது.', ro: '"ippa idhu periyaadha irukku!"  -  maru dundaiyum kadichadhu.', en: '"Now this one looks bigger!" — and it bit the other piece too.' },
      { ta: 'சிறிது சிறிதா... ரொட்டி முழுக்க குரங்கின் வயிறுல போய்டுச்சு!', ro: 'siridhu siridha... rotti muzhukka kurangin vayirula pooiduchu!', en: 'Little by little... the whole bread went into the monkey\'s belly!' },
      { ta: 'இரண்டு பூனைகளும் ஒண்ணா பாத்துக்கிட்டன. அன்ருலிருந்து அவை சண்டை போடவே இல்ல.', ro: 'irandu poonaigalum onna paaththukittana. anrulirundhu avai sandai poodave illa.', en: 'The two cats just looked at each other. From that day they never fought at all.' }
    ],
    moral: { ta: 'சண்டை போட்டா இரண்டு பேரும் இழப்பாங்க.', ro: 'sandai pootta irandu perum izhappanga.', en: 'When two fight, both of them lose.' }
  });

  /* ───────────────── 10. the blue jackal — Panchantantrum descent, archived cousin */
  /* The dye-vat jackal is Panchantantrum by descent (mitralabha), and the
     archived corpus has its cousin — சிங்கத்திடம் வளர்ந்த நரிக்குட்டி, the jackal
     cub raised among lions who boasts he fears nothing, ending "just as the
     jackal cub raised among lions thought itself a lion." Same shape: a
     pretender undone by its own voice. The vat itself is not in the archived
     text, so the descent is named and the gap is named too. */
  story({
    id: 'neela-nari',
    ta: 'நீல நரி',
    en: 'The Blue Jackal',
    icon: '🐺',
    color: '#2563eb',
    source: 'Panchantantrum descent — cousin archived: சிங்கத்திடம் வளர்ந்த நரிக்குட்டி (ta.wikisource)',
    sourceNote: 'Same shape as the archived jackal-cub-raised-among-lions tale: a pretender '
      + 'undone by its own voice. The dye vat itself is not in the archived text.',
    pages: [
      { ta: 'ஒரே நரி. காட்டுல எல்லாரும் அதை துரத்துவாங்க. ஓ! ஓ! ஓ!', ro: 'orae nari. kaattula ellaarum adhai thurattuvaanga. oo! oo! oo!', en: 'One jackal. Everyone in the forest chased it. Shoo! Shoo! Shoo!' },
      { ta: 'ஓடி ஓடி அது ஒரே தண்ணி தொட்டியில விழுந்துச்சு! உள்ளே நீல நிறம்!', ro: 'oodi oodi adhu orae thanni tottiyila vizhunthuchu! ullae neela niram!', en: 'Running and running it fell into a water vat! Inside was blue dye!' },
      { ta: 'அது வெளியே வந்துச்சு — முழுக்க நீலம்! எல்லாம் நிமிர்ந்து பாத்துச்சு.', ro: 'adhu veliyae vandhuchu  -  muzhukka neelam! ellaam nirndhu paaththuchu.', en: 'It came out — blue all over! Everyone turned round to look.' },
      { ta: 'யானை சொன்னது, "இது நம்ம அரசனா வர வேண்டிய தெய்வம்!" எல்லாம் வணங்கின.', ro: 'yaanai sonnadhu, "idhu namma arasanaa vara vendaadheyvam!" ellaam vanangina.', en: 'The elephant said, "This is the god who must come to be our king!" Everyone bowed.' },
      { ta: 'நரி பெரிய மனிஷி மாதிரி நடந்துச்சு. "நான் உங்க அரசன்!" னு சொல்லுச்சு.', ro: 'nari periya manisi maadiri nadanthuchu. "naaan unga arasan!" nu solluchu.', en: 'The jackal walked like a grand person. "I am your king!" it said.' },
      { ta: 'ஒரு இரவு, வெளியே நரிகள் கூடின. "ஓவோ... ஓவோ..." னு கத்தின.', ro: 'oru iravu, veliyae narigal koodina. "oovoo... oovoo..." nu kathina.', en: 'One night, outside, the jackals gathered. "Howl... howl..." they called.' },
      { ta: 'நரியும் மறந்துடுச்சு — "ஓவோ... ஓவோ!" எல்லாரும் திரும்பி பாத்தாங்க.', ro: 'nariyum marandhuchu  -  "oovoo... oovoo!" ellaarum thirumbi paaththaanga.', en: 'The jackal forgot itself too — "Howl... howl!" Everyone turned to look.' },
      { ta: '"நீ நீல நிற நரி தான்!" னு எல்லாரும் துரத்தினாங்க. அப்புறம் அது சாதாரண நரியா ஆகிடுச்சு.', ro: '"nee neela nira nari thaana!" nu ellaarum thurattinaanga. appuram adhu saadhaarana nariyaaa aagiduchu.', en: '"You are only a blue jackal!" they all shouted. After that it became an ordinary jackal again.' }
    ],
    moral: { ta: 'போலி பெருமை ஒரே நாள் தான் நிற்கும்.', ro: 'pooli perumai orae naal thaana nirkum.', en: 'Borrowed pride stands for one day only.' }
  });

  TT.stories = {
    all: function () { return TT.books.all().filter(function (b) { return b.story; }); }
  };
})(window.TT = window.TT || {});
