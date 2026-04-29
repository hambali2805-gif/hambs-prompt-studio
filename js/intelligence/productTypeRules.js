// V5 Product Type Rules — product-aware foundation for all categories.

export const PRODUCT_TYPE_RULES = {
  SKINCARE: {
    generic_skincare: base('Generic Skincare','skincare',[],['kulit terasa lebih nyaman','tekstur ringan','rutinitas terasa simpel'],['skincare terasa ribet','produk terasa berat'],['texture on fingertip','apply to face','mirror reaction'],['pump/scoop product','apply to cheek','blend with fingers'],['bottle/tube/jar shape','cap','label','texture'],['medical cure claims','instant transformation']),
    serum: base('Serum','skincare',['serum','essence','ampoule','niacinamide','retinol','vitamin c'],['cepat meresap','kulit terasa lembap','finish terlihat sehat'],['serum lengket','kulit kusam'],['dropper detail','liquid texture','tap on skin'],['open dropper','drop on fingertip','tap and blend'],['dropper bottle','liquid clarity','label'],['instant whitening','acne cure']),
    cleanser: base('Cleanser','skincare',['cleanser','facial wash','sabun muka','foam','gel wash'],['wajah terasa bersih','tidak terasa ketarik'],['sabun muka bikin ketarik','wajah berminyak'],['foam texture','rinse face','towel pat'],['squeeze tube','foam in palms','rinse'],['tube/bottle','cap','label'],['medical acne cure']),
    moisturizer: base('Moisturizer','skincare',['moisturizer','pelembap','cream','gel cream'],['kulit terasa lembap','finish nyaman'],['kulit kering','cream berat'],['cream texture','smooth spread','soft finish'],['open jar','apply cream','touch cheek'],['jar/tube','cap','cream texture'],['medical healing claims']),
    sunscreen: base('Sunscreen','skincare',['sunscreen','sunblock','spf','uv'],['nyaman dipakai harian','terasa terlindungi saat aktivitas'],['white cast','sunscreen lengket'],['two-finger amount','daylight cue','blend on face'],['squeeze tube','apply and blend','step into daylight'],['tube/bottle','SPF label if visible','cap'],['guaranteed medical protection']),
    mask: base('Face Mask','skincare',['masker','face mask','sheet mask','clay mask'],['me-time terasa santai','kulit terasa fresh'],['butuh me-time','wajah terasa capek'],['open mask','apply mask','relaxed face'],['peel mask','place on face','adjust edges'],['sachet/jar','mask texture'],['instant permanent result']),
    body_lotion: base('Body Lotion','skincare',['body lotion','lotion badan','hand body','body serum'],['kulit badan terasa lembap','tekstur nyaman'],['kulit kering','lotion lengket'],['pump lotion','apply to arm','smooth finish'],['pump bottle','spread on arm','rub gently'],['pump/tube','label','cap'],['skin whitening guarantee'])
  },

  FASHION: {
    generic_fashion: base('Generic Fashion','fashion',[],['nyaman dipakai','mudah dipadukan','look lebih rapi'],['outfit kurang nyaman','bingung styling'],['mirror outfit check','material detail','walk test'],['adjust outfit','turn to show fit','walk toward mirror'],['silhouette','color','material','fit'],['fake luxury claims']),
    running_shoes: base('Running Shoes','footwear',['sepatu lari','running shoe','running shoes','jogging','lari','runner','bantalan','sol empuk'],['bantalan empuk terasa di langkah','sol stabil','nyaman untuk jalan/lari ringan'],['baru jalan sebentar kaki tidak nyaman','sepatu keras bikin langkah berat'],['tie shoelaces','step test','sole grip','light jog'],['foot slides into shoe','hands tie laces','sole flexes while stepping','light jog'],['shoe silhouette','colorway','sole shape','lace design','pair consistency'],['fabric drape','OOTD mirror as main proof','dress styling']),
    footwear: base('Footwear','footwear',['sepatu','sneaker','sandal','heels','boots','alas kaki'],['nyaman dipakai jalan','sol stabil','fit kaki rapi'],['sepatu bikin lecet','sol terasa licin'],['wear shoe','adjust fit','walk test','sole detail'],['foot slides in','adjust strap/lace','step forward'],['shoe silhouette','sole','strap/lace','material'],['fabric drape as main detail']),
    clothing: base('Clothing','clothing',['baju','kaos','shirt','t-shirt','kemeja','jaket','celana','dress','hoodie','outer'],['bahan nyaman','fit rapi','mudah dipadukan'],['bahan panas','potongan kurang pas'],['mirror check','fabric close-up','turn slightly'],['adjust collar','smooth fabric','turn to show fit'],['cut','silhouette','fabric','stitching'],['sole grip','shoe-lace proof']),
    hijab: base('Hijab','clothing',['hijab','kerudung','pashmina','segi empat'],['bahan jatuh rapi','nyaman dipakai lama','mudah dibentuk'],['hijab mudah kusut','bahan panas'],['adjust hijab','fabric drape','side profile'],['pin fabric','smooth edges','adjust front drape'],['fabric texture','color','drape'],['shoe-only proof']),
    bag: base('Bag','bag',['tas','bag','backpack','ransel','sling bag','totebag','handbag','koper'],['kompartemen praktis','muat barang harian','nyaman dibawa'],['barang berantakan','tas kurang muat'],['open zipper','put items inside','show compartments'],['open zipper','place phone/wallet','wear on shoulder'],['bag silhouette','strap','zipper','material'],['footwear step test']),
    watch: base('Watch / Accessory','accessory',['jam tangan','watch','smartwatch','arloji','gelang','kalung','accessory','aksesoris'],['detail terlihat premium','cocok dipakai harian','melengkapi outfit'],['aksesori terlihat biasa','strap kurang nyaman'],['wrist close-up','strap detail','dial/screen detail'],['fasten strap','turn wrist','tap screen/show dial'],['dial/screen','strap','case finish'],['shoe sole proof']),
    sportswear: base('Sportswear','clothing',['sportswear','baju olahraga','legging','jersey','training'],['nyaman untuk bergerak','material ringan','fit mendukung aktivitas'],['gerak tidak bebas','bahan panas'],['stretch test','movement fit','gym/park'],['stretch arms','light squat','adjust waistband'],['fit','seams','material'],['formalwear-only framing'])
  },

  MAKANAN: {
    generic_food: base('Generic Food','food',[],['rasa menggugah selera','praktis dinikmati','tekstur terlihat enak'],['lagi lapar','butuh yang praktis'],['prepare food','texture close-up','first bite'],['open/serve','lift bite','chew reaction'],['packaging','serving form','label'],['medical nutrition claims','fashion mirror scene']),
    instant_noodle: base('Instant Noodle','food',['indomie','mie instan','mi instan','instant noodle','noodle','mie goreng','ramen'],['aroma bumbu naik','rasa gurih familiar','praktis saat lapar'],['lapar malam tapi malas ribet','butuh comfort food cepat'],['boil noodles','pour seasoning','stir noodles','first bite'],['open packet','pour noodles','stir seasoning','lift noodles with fork'],['packaging colors','label layout','serving appearance'],['raw fashion scene']),
    snack: base('Snack','food',['snack','keripik','chips','kripik','biskuit','wafer','cookies','camilan'],['tekstur renyah','enak buat ngemil','mudah dibawa'],['butuh camilan','ngemil terasa membosankan'],['tear packet','pick snack','crunch close-up'],['open bag','hand picks snack','bite crunch reaction'],['bag shape','snack texture','label colors'],['full cooking scene unless required']),
    sauce_condiment: base('Sauce / Condiment','food',['saus','sambal','kecap','mayonnaise','condiment','sauce'],['rasa makanan lebih hidup','tekstur saus menggoda'],['makanan terasa hambar','butuh tambahan rasa'],['squeeze bottle','pour sauce','dip food'],['squeeze bottle','sauce spreads','dip motion'],['bottle/sachet','cap','label','sauce texture'],['medicine-like claims']),
    frozen_food: base('Frozen Food','food',['frozen','nugget','sosis','bakso','dumpling','air fryer'],['praktis dimasak','hasil matang menggoda','cocok stok rumah'],['butuh lauk cepat','malas masak lama'],['take from freezer','cook on pan','plate result'],['open freezer','place on pan','flip food','serve'],['packaging','frozen shape','cooked result'],['raw unsafe eating']),
    dessert: base('Dessert','food',['dessert','cake','kue','puding','ice cream','es krim','coklat'],['manisnya pas','tekstur lembut','mood naik'],['butuh sweet treat','mood lagi turun'],['scoop/slice','soft bite','sweet reaction'],['scoop dessert','spoon lift','first bite'],['serving shape','texture','topping'],['health cure claims'])
  },

  MINUMAN: {
    generic_drink: base('Generic Drink','drink',[],['terasa segar','mudah dinikmati','cocok menemani aktivitas'],['lagi haus','butuh mood booster'],['open bottle/can','pour into glass','sip reaction'],['twist cap','pour over ice','sip'],['bottle/can shape','label','liquid color','cap'],['medical health claims']),
    coffee: base('Coffee','drink',['kopi','coffee','latte','americano','espresso','cappuccino'],['aroma kopi hangat','mood pagi kebangun','cocok buat fokus'],['pagi masih berat','butuh teman kerja'],['pour coffee','stir cup','steam','desk setup'],['pour liquid','stir','lift cup','sip'],['cup/bottle/can','label','coffee color','foam'],['energy medical claims']),
    tea: base('Tea','drink',['teh','tea','matcha','oolong','milk tea'],['rasanya menenangkan','cocok buat jeda santai'],['butuh jeda','hari hectic'],['pour tea','slow sip','warm/cold cue'],['pour tea','stir','hold cup','sip'],['bottle/cup/packaging','liquid color'],['medical detox claims']),
    water: base('Water','drink',['air mineral','water','mineral','botol air'],['segar setelah aktivitas','mudah dibawa'],['haus setelah aktivitas','mulut kering'],['cold bottle','condensation','relief sip'],['twist cap','lift bottle','sip'],['bottle shape','cap','label','water clarity'],['medical hydration guarantees']),
    isotonic: base('Isotonic Drink','drink',['isotonic','ion','sport drink','minuman olahraga','elektrolit'],['segar setelah bergerak','cocok setelah aktivitas','praktis dibawa olahraga'],['habis olahraga haus','butuh refresh cepat'],['gym/track','cold bottle','post-workout sip'],['twist cap','sip after workout','place beside towel'],['bottle shape','label','liquid color'],['performance guarantee']),
    soda: base('Soda / Sparkling Drink','drink',['soda','sparkling','cola','fizz','carbonated'],['sensasi dingin sparkling','rasa fun','cocok hangout'],['hari terasa flat','butuh minuman fun'],['open can','bubbles','pour over ice'],['pull tab','pour fizz','raise glass'],['can/bottle shape','label','liquid color'],['health claims']),
    juice: base('Juice','drink',['jus','juice','sari buah','orange','apel','mango'],['rasa buah segar','warna menggoda','jeda ringan'],['pengen rasa buah','butuh yang segar'],['pour juice','ice cubes','fresh reaction'],['open bottle/carton','pour into glass','sip'],['bottle/carton','label','liquid color'],['vitamin guarantee'])
  },

  ELEKTRONIK: {
    generic_electronics: base('Generic Electronics','electronics',[],['lebih praktis dipakai harian','desain modern','fitur mudah digunakan'],['setup ribet','device lama kurang praktis'],['unbox device','turn on','show feature'],['open box','lift device','press button'],['device shape','ports/buttons','screen','finish'],['fake specs','impossible performance numbers']),
    smartphone: base('Smartphone','electronics',['smartphone','hp','handphone','phone','ponsel','kamera hp'],['layar nyaman dilihat','pemakaian harian lancar','kamera praktis'],['hp lama lemot','baterai cepat habis'],['hold phone','swipe screen','camera detail'],['pick up phone','unlock','swipe','take photo'],['phone shape','camera module','screen','buttons/ports'],['fake exact specs unless provided']),
    laptop: base('Laptop','electronics',['laptop','notebook','macbook','komputer'],['kerja terasa lancar','setup rapi','mudah dipakai harian'],['kerja suka lemot','setup berantakan'],['open laptop','keyboard detail','screen glow'],['open lid','type','adjust screen'],['laptop silhouette','keyboard','screen ratio','ports'],['fake software UI']),
    earbuds: base('Earbuds','electronics',['earbuds','earphone','tws','airpods','headset kecil'],['praktis dibawa','nyaman dipakai harian','audio menemani aktivitas'],['kabel ribet','butuh audio praktis'],['charging case open','ear placement','tap control'],['open case','take earbud','place in ear','tap'],['case shape','earbud shape','LED/port'],['fake sound wave claims']),
    headphones: base('Headphones','electronics',['headphone','headphones','headset','gaming headset'],['nyaman dipakai lama','audio lebih imersif'],['headset bikin pegal','audio kurang fokus'],['earcup detail','wear headphones','listening reaction'],['lift headphones','place over ears','adjust headband'],['earcup','headband','controls'],['fake noise cancellation guarantee']),
    powerbank: base('Powerbank','electronics',['powerbank','power bank','charger portable','portable charger'],['praktis saat baterai menipis','mudah dibawa'],['baterai habis di luar','colokan susah dicari'],['plug cable','LED indicator','phone charging'],['connect cable','LED turns on','put in bag'],['powerbank shape','ports','LED','surface finish'],['fake capacity unless provided']),
    speaker: base('Speaker','electronics',['speaker','bluetooth speaker','soundbar'],['suara menemani ruangan','mudah dipakai saat santai'],['suara hp kurang terasa','butuh ambience'],['speaker grille','button press','room ambience'],['press power','phone pairs','place on table'],['speaker shape','grille','buttons/ports'],['fake decibel claims']),
    home_appliance: base('Home Appliance','electronics',['air fryer','blender','rice cooker','vacuum','setrika','kipas','dispenser','mesin'],['pekerjaan rumah lebih praktis','hasil terlihat rapi'],['pekerjaan rumah lama','alat lama ribet'],['press button','machine in use','result reveal'],['open lid/door','press button','show result'],['appliance shape','buttons','lid/door','finish'],['unsafe use','fake technical specs'])
  }
};

function base(label,parentType,keywords,benefits,painPoints,actions,motions,referenceFocus,avoid){
  return { label,parentType,keywords,benefits,painPoints,actions,motions,referenceFocus,avoid,
    sensory: actions,
    contexts: defaultContexts(parentType),
    negatives: avoid
  };
}
function defaultContexts(parentType){
  return {
    skincare:['bathroom vanity','bedroom mirror','morning routine'], footwear:['front porch','urban sidewalk','gym warm-up area'], clothing:['bedroom mirror','street style corner','cafe outfit check'], bag:['desk packing scene','cafe table','car seat'], accessory:['desk detail shot','mirror outfit check','cafe close-up'], food:['kitchen counter','dining table','cozy room'], drink:['desk break','cafe table','outdoor sunlight'], electronics:['home office desk','tech loft','bedroom desk setup'], fashion:['bedroom mirror','street style corner','cafe lifestyle setting']
  }[parentType] || ['realistic daily-life setting'];
}
export function normalizeCategory(category=''){
  const c=String(category).trim().toUpperCase();
  return ['SKINCARE','FASHION','MAKANAN','MINUMAN','ELEKTRONIK'].includes(c)?c:'FASHION';
}
export function getDefaultTypeForCategory(category){
  return {SKINCARE:'generic_skincare',FASHION:'generic_fashion',MAKANAN:'generic_food',MINUMAN:'generic_drink',ELEKTRONIK:'generic_electronics'}[normalizeCategory(category)];
}
export function getRulesForType(category, productType){
  const c=normalizeCategory(category); const set=PRODUCT_TYPE_RULES[c]; const key=set[productType]?productType:getDefaultTypeForCategory(c);
  return {key,...set[key]};
}
