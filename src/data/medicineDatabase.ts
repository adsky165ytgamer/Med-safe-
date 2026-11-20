import { MedicineAnalysis } from "../types/medicine";

export const PRELOADED_MEDICINES: Record<string, Record<string, MedicineAnalysis>> = {
  "crocin-650": {
    Hindi: {
      brandName: "क्रोसिन 650 (Crocin 650)",
      genericName: "पैरासिटामोल (Paracetamol) 650 mg",
      purpose: "यह दवा तेज बुखार कम करने और सिरदर्द, बदन दर्द, कमर दर्द या जोड़ों के दर्द को शांत करने के लिए दी जाती है।",
      dosage: "1 गोली जरूरत पड़ने पर हर 4 से 6 घंटे के अंतराल पर। 24 घंटे में अधिकतम 4 गोलियां ही लें।",
      timing: "भोजन या हल्के नाश्ते के बाद, एक पूरे गिलास सादे पानी के साथ लें।",
      warning: "24 घंटे में 4000 mg (4 ग्राम) से ज्यादा कभी न लें, इससे लीवर को गंभीर नुकसान हो सकता है। शराब का सेवन बिल्कुल न करें। अन्य पैरासिटामोल युक्त दवाओं के साथ न लें।",
      foodInstructions: "खाली पेट लेने से पेट में हल्की जलन हो सकती है, इसलिए बिस्कुट या रोटी खाने के बाद लें।",
      missedDose: "याद आते ही ले लें। यदि अगली खुराक का समय हो गया हो, तो छूटी हुई खुराक छोड़ दें। कभी भी दो गोली एक साथ न लें।",
      storage: "कमरे के तापमान (25°C से कम) पर ठंडी और सूखी जगह रखें। सीधी धूप और बच्चों की पहुंच से दूर रखें।",
      audioSpeechText: "यह दवा क्रोसिन 650 है, जिसमें पैरासिटामोल है। यह बुखार और दर्द से राहत देती है। खाने के बाद एक गोली लें। चौबीस घंटे में चार गोली से ज्यादा न लें।",
      keyBulletPoints: [
        "बुखार और शरीर के दर्द से तेज राहत",
        "हमेशा भोजन या नाश्ते के बाद ही लें",
        "लीवर सुरक्षा के लिए 24 घंटे में अधिकतम 4 गोली",
        "शराब का सेवन बिल्कुल न करें",
      ],
      schedule: [
        { timeSlot: "morning", time: "08:30 AM", label: "सुबह का समय", instruction: "1 गोली नाश्ते के बाद" },
        { timeSlot: "afternoon", time: "02:00 PM", label: "दोपहर का समय", instruction: "1 गोली यदि बुखार/दर्द बना रहे" },
        { timeSlot: "night", time: "09:00 PM", label: "रात का समय", instruction: "1 गोली रात के खाने के बाद" },
      ],
    },
    Telugu: {
      brandName: "క్రోసిన్ 650 (Crocin 650)",
      genericName: "పారాసిటమాల్ (Paracetamol) 650 mg",
      purpose: "జ్వరం తగ్గించడానికి మరియు తలనొప్పి, ఒళ్లు నొప్పులు, కండరాల నొప్పుల నుంచి ఉపశమనం పొందడానికి ఉపయోగిస్తారు.",
      dosage: "అవసరమైనప్పుడు 1 టాబ్లెట్ 4-6 గంటల వ్యవధిలో. 24 గంటల్లో 4 టాబ్లెట్ల కంటే ఎక్కువ తీసుకోకూడదు.",
      timing: "భోజనం లేదా టిఫిన్ తర్వాత ఒక గ్లాసు మంచి నీళ్లతో తీసుకోవాలి.",
      warning: "24 గంటల్లో 4000 mg కంటే ఎక్కువ మోతాదు కాలేయానికి (లివర్) హానికరం. ఆల్కహాల్ తాగినప్పుడు ఈ మందు వేసుకోకూడదు.",
      foodInstructions: "ఖాళీ కడుపుతో తీసుకోకూడదు, తేలికపాటి ఆహారం లేదా పాల తర్వాత తీసుకోవడం మంచిది.",
      missedDose: "గుర్తుకు వచ్చిన వెంటనే వేసుకోండి. తదుపరి డోస్ సమయం దగ్గరపడితే, మునుపటి డోస్ వదిలేయండి. రెండు మాత్రలు కలిపి వేసుకోకండి.",
      storage: "చల్లని మరియు పొడి ప్రదేశంలో భద్రపరచండి. పిల్లలకు దూరంగా ఉంచండి.",
      audioSpeechText: "ఈ మందు క్రోసిన్ 650 పారాసిటమాల్. జ్వరం మరియు నొప్పుల కోసం భోజనం తర్వాత ఒక టాబ్లెట్ వేసుకోండి.",
      keyBulletPoints: [
        "జ్వరం మరియు నొప్పుల నివారణకు పనిచేస్తుంది",
        "భోజనం చేసిన తర్వాత మాత్రమే వేసుకోవాలి",
        "రోజుకు 4 టాబ్లెట్లకు మించి వేసుకోకూడదు",
        "ఆల్కహాల్‌తో తీసుకోకూడదు",
      ],
      schedule: [
        { timeSlot: "morning", time: "08:30 AM", label: "ఉదయం", instruction: "టిఫిన్ తర్వాత 1 టాబ్లెట్" },
        { timeSlot: "night", time: "09:00 PM", label: "రాత్రి", instruction: "రాత్రి భోజనం తర్వాత 1 టాబ్లెట్" },
      ],
    },
    English: {
      brandName: "Crocin 650",
      genericName: "Paracetamol (Acetaminophen) 650 mg",
      purpose: "Prescribed to reduce fever and relieve mild-to-moderate pain such as headaches, back pain, and joint aches.",
      dosage: "1 tablet every 4 to 6 hours as needed. Do not exceed 4 tablets in 24 hours.",
      timing: "Take after meals with a full glass of plain water.",
      warning: "Never exceed 4000 mg daily to prevent liver toxicity. Avoid consuming alcohol while taking paracetamol.",
      foodInstructions: "Best taken after meals or a snack to prevent mild stomach upset.",
      missedDose: "Take as soon as remembered. If close to the next scheduled dose, skip it. Never double up.",
      storage: "Store below 25°C in a dry place away from heat, direct sunlight, and moisture.",
      audioSpeechText: "This medicine is Crocin 650 containing Paracetamol. It reduces fever and pain. Take one tablet after food with water.",
      keyBulletPoints: [
        "Effective relief from fever and body ache",
        "Take 1 tablet after meals",
        "Maximum 4 tablets in 24 hours",
        "Avoid alcohol and other paracetamol-containing products",
      ],
      schedule: [
        { timeSlot: "morning", time: "08:30 AM", label: "Morning Dose", instruction: "1 Tablet after breakfast" },
        { timeSlot: "night", time: "09:00 PM", label: "Night Dose", instruction: "1 Tablet after dinner" },
      ],
    },
  },
  "glycomet-500": {
    Hindi: {
      brandName: "ग्लाइकोमेट 500 (Glycomet 500)",
      genericName: "मेटफॉर्मिन हाइड्रोक्लोराइड (Metformin) 500 mg",
      purpose: "टाइप-2 डायबिटीज (शुगर) के मरीजों में खून में ग्लूकोज के स्तर को सामान्य और नियंत्रित रखने के लिए।",
      dosage: "1 गोली दिन में 1 से 2 बार, डॉक्टर के निर्देशानुसार।",
      timing: "भोजन के साथ या भोजन के तुरंत बाद लें ताकि पेट में गैस या दस्त की समस्या न हो।",
      warning: "दवा को अचानक बंद न करें। शराब से परहेज करें। यदि बहुत ज्यादा कमजोरी या सांस लेने में परेशानी हो तो डॉक्टर से तुरंत संपर्क करें।",
      foodInstructions: "हमेशा भोजन के मध्य या अंत में लें। पर्याप्त मात्रा में पानी पिएं।",
      missedDose: "याद आने पर तुरंत लें। यदि अगली खुराक का समय हो चुका है तो अतिरिक्त खुराक न लें।",
      storage: "नमी से बचाकर ठंडी जगह रखें।",
      audioSpeechText: "यह दवा मेटफॉर्मिन है जो शुगर नियंत्रित करती है। इसे खाने के साथ या खाने के तुरंत बाद लें।",
      keyBulletPoints: [
        "ब्लड शुगर को नियंत्रित रखती है",
        "हमेशा भोजन के साथ ही लें",
        "नियमित शुगर जांच करवाएं",
        "शराब का सेवन न करें",
      ],
      schedule: [
        { timeSlot: "morning", time: "09:00 AM", label: "सुबह नाश्ता", instruction: "1 गोली नाश्ते के साथ" },
        { timeSlot: "night", time: "08:30 PM", label: "रात का भोजन", instruction: "1 गोली रात के खाने के साथ" },
      ],
    },
    Telugu: {
      brandName: "గ్లైకోమెట్ 500 (Glycomet 500)",
      genericName: "మెట్‌ఫార్మిన్ (Metformin) 500 mg",
      purpose: "టైప్-2 షుగర్ (డయాబెటిస్) వ్యాధిగ్రస్తులలో రక్తంలో గ్లూకోజ్ స్థాయిలను నియంత్రించడానికి వాడతారు.",
      dosage: "డాక్టర్ సూచించిన విధంగా రోజుకు 1 లేదా 2 మాత్రలు.",
      timing: "భోజనం చేస్తున్నప్పుడు లేదా భోజనం చేసిన వెంటనే వేసుకోవాలి.",
      warning: "కడుపు నొప్పి లేదా విరేచనాలు రాకుండా భోజనంతో పాటు తీసుకోవాలి. ఆల్కహాల్ తీసుకోకూడదు.",
      foodInstructions: "భోజనంతో పాటు మాత్రమే వేసుకోవాలి. పుష్కలంగా నీరు త్రాగాలి.",
      missedDose: "గుర్తుకు రాగానే వేసుకోండి, డబుల్ డోస్ తీసుకోకండి.",
      storage: "తేమ లేని పొడి ప్రదేశంలో ఉంచండి.",
      audioSpeechText: "ఈ మందు షుగర్ అదుపులో ఉంచడానికి వాడతారు. భోజనం చేసేటప్పుడు ఒక టాబ్లెట్ వేసుకోండి.",
      keyBulletPoints: [
        "షుగర్ లెవెల్స్ అదుపులో ఉంచుతుంది",
        "భోజనంతో పాటు మాత్రమే తీసుకోవాలి",
        "ఆల్కహాల్‌కు దూరంగా ఉండండి",
      ],
      schedule: [
        { timeSlot: "morning", time: "09:00 AM", label: "ఉదయం", instruction: "టిఫిన్‌తో పాటు 1 టాబ్లెట్" },
        { timeSlot: "night", time: "08:30 PM", label: "రాత్రి", instruction: "రాత్రి భోజనంతో పాటు 1 టాబ్లెట్" },
      ],
    },
    English: {
      brandName: "Glycomet 500",
      genericName: "Metformin Hydrochloride 500 mg",
      purpose: "Prescribed to improve glycemic control in adults with type 2 diabetes mellitus.",
      dosage: "1 tablet once or twice daily as prescribed by your physician.",
      timing: "Take with or immediately after meals to reduce gastrointestinal side effects.",
      warning: "Do not skip meals. Avoid excessive alcohol intake. Discontinue and notify doctor prior to radiocontrast imaging procedures.",
      foodInstructions: "Take with food to minimize stomach upset, nausea, or diarrhea.",
      missedDose: "Take with the next meal. If it is time for your next dose, skip the missed dose. Never take a double dose.",
      storage: "Store below 30°C away from moisture and direct light.",
      audioSpeechText: "This medicine is Metformin 500. It helps manage blood sugar levels. Take with or right after your meals.",
      keyBulletPoints: [
        "Controls blood sugar levels",
        "Always take with meals",
        "Stay well hydrated",
        "Avoid alcohol consumption",
      ],
      schedule: [
        { timeSlot: "morning", time: "09:00 AM", label: "Morning Dose", instruction: "1 Tablet with breakfast" },
        { timeSlot: "night", time: "08:30 PM", label: "Night Dose", instruction: "1 Tablet with dinner" },
      ],
    },
  },
  "pan-40": {
    Hindi: {
      brandName: "पैन 40 (Pan 40)",
      genericName: "पैंटोप्रोजोल (Pantoprazole Gastro-resistant) 40 mg",
      purpose: "पेट में अत्यधिक एसिड, सीने में जलन (हार्टबर्न), खट्टी डकार और अल्सर की समस्या को ठीक करने के लिए।",
      dosage: "1 गोली दिन में एक बार, सुबह खाली पेट।",
      timing: "सुबह उठने के बाद, नाश्ता करने से 30 से 60 मिनट पहले एक गिलास सादे पानी के साथ निगलें।",
      warning: "गोली को चबाएं या तोड़ें नहीं, पूरी गोली निगलें। चाय या कॉफी के साथ न लें।",
      foodInstructions: "हमेशा खाली पेट लें। अधिक तीखे, तले-भुने भोजन से परहेज करें।",
      missedDose: "सुबह भूल जाने पर दोपहर के खाने से पहले ले सकते हैं।",
      storage: "सूखी और ठंडी जगह पर रखें।",
      audioSpeechText: "यह दवा गैस और एसिडिटी के लिए है। सुबह नाश्ते से आधा घंटा पहले खाली पेट एक गोली लें।",
      keyBulletPoints: [
        "एसिडिटी और सीने की जलन में असरदार",
        "सुबह नाश्ते से 30-40 मिनट पहले खाली पेट लें",
        "गोली को चबाएं नहीं, पूरी निगलें",
      ],
      schedule: [
        { timeSlot: "morning", time: "07:30 AM", label: "सुबह खाली पेट", instruction: "1 गोली नाश्ते से 30 मिनट पहले" },
      ],
    },
    Telugu: {
      brandName: "పాన్ 40 (Pan 40)",
      genericName: "పాంటోప్రాజోల్ (Pantoprazole) 40 mg",
      purpose: "కడుపులో ఎసిడిటీ, గ్యాస్, గుండెల్లో మంట మరియు అల్సర్ నివారణకు ఉపయోగిస్తారు.",
      dosage: "రోజుకు 1 టాబ్లెట్, ఉదయం ఖాళీ కడుపుతో.",
      timing: "ఉదయం టిఫిన్ చేయడానికి 30-45 నిమిషాల ముందు నీళ్లతో మింగాలి.",
      warning: "టాబ్లెట్‌ను నమలకూడదు, నేరుగా మింగాలి.",
      foodInstructions: "ఖాళీ కడుపుతో మాత్రమే వేసుకోవాలి. కారంగా ఉండే ఆహారాన్ని తగ్గించాలి.",
      missedDose: "గుర్తుకు రాగానే భోజనానికి ముందు వేసుకోండి.",
      storage: "చల్లని పొడి ప్రదేశంలో ఉంచండి.",
      audioSpeechText: "ఈ మందు ఎసిడిటీ మరియు గ్యాస్ కోసం. ఉదయం ఖాళీ కడుపుతో ఒక టాబ్లెట్ వేసుకోండి.",
      keyBulletPoints: [
        "గ్యాస్ మరియు గుండెల్లో మంటను తగ్గిస్తుంది",
        "ఉదయం టిఫిన్‌కు ముందు ఖాళీ కడుపుతో వేసుకోవాలి",
        "టాబ్లెట్ నమలకుండా మింగాలి",
      ],
      schedule: [
        { timeSlot: "morning", time: "07:30 AM", label: "ఉదయం ఖాళీ కడుపు", instruction: "టిఫిన్‌కు 30 నిమిషాల ముందు 1 టాబ్లెట్" },
      ],
    },
    English: {
      brandName: "Pan 40",
      genericName: "Pantoprazole Gastro-resistant 40 mg",
      purpose: "Treats gastroesophageal reflux disease (acid reflux), heartburn, acidity, and stomach ulcers.",
      dosage: "1 tablet once daily in the morning.",
      timing: "Take 30 to 60 minutes before breakfast with a glass of water.",
      warning: "Swallow the tablet whole; do not chew, crush, or break it.",
      foodInstructions: "Must be taken on an empty stomach for maximum effectiveness.",
      missedDose: "Take as soon as remembered before your next meal. Never double up.",
      storage: "Store below 25°C protected from light and moisture.",
      audioSpeechText: "This medicine is Pantoprazole 40 for acid reflux. Take one tablet on an empty stomach half an hour before breakfast.",
      keyBulletPoints: [
        "Relieves acidity and heartburn",
        "Take on empty stomach 30-60 min before breakfast",
        "Swallow whole without crushing",
      ],
      schedule: [
        { timeSlot: "morning", time: "07:30 AM", label: "Empty Stomach", instruction: "1 Tablet 30 min before breakfast" },
      ],
    },
  },
};

export function getLocalMedicineAnalysis(keyOrQuery: string, language: string = "Hindi"): MedicineAnalysis {
  const normalizedQuery = (keyOrQuery || "").toLowerCase();
  let key = "crocin-650";

  if (normalizedQuery.includes("glycomet") || normalizedQuery.includes("metformin") || normalizedQuery.includes("diabetes") || normalizedQuery.includes("sugar")) {
    key = "glycomet-500";
  } else if (normalizedQuery.includes("pan") || normalizedQuery.includes("panto") || normalizedQuery.includes("acidity") || normalizedQuery.includes("gas")) {
    key = "pan-40";
  }

  const langKey = language.toLowerCase().includes("telugu")
    ? "Telugu"
    : language.toLowerCase().includes("english")
    ? "English"
    : "Hindi";

  const medData = PRELOADED_MEDICINES[key]?.[langKey] || PRELOADED_MEDICINES["crocin-650"][langKey];
  return {
    ...medData,
    id: `${key}-${Date.now()}`,
    analyzedAt: new Date().toISOString(),
    languageUsed: language,
  };
}
