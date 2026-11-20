export interface SampleMedicinePreset {
  id: string;
  name: string;
  generic: string;
  indication: string;
  category: "Fever & Pain" | "Diabetes" | "Antibiotic" | "Heart & BP" | "Acidity" | "Allergy";
  badgeColor: string;
  icon: string;
  defaultDose: string;
  sampleImageData?: string;
}

export const SAMPLE_MEDICINES: SampleMedicinePreset[] = [
  {
    id: "crocin-650",
    name: "Crocin 650 (क्रोसिन 650)",
    generic: "Paracetamol 650 mg",
    indication: "Fever, Body Aches & Headache / बुखार और दर्द",
    category: "Fever & Pain",
    badgeColor: "emerald",
    icon: "💊",
    defaultDose: "1 tablet after meals (max 4 per day)",
  },
  {
    id: "metformin-500",
    name: "Glycomet 500 (ग्लाइकोमेट)",
    generic: "Metformin Hydrochloride 500 mg",
    indication: "Type 2 Diabetes / शुगर नियंत्रण",
    category: "Diabetes",
    badgeColor: "blue",
    icon: "🩸",
    defaultDose: "1 tablet with or after dinner",
  },
  {
    id: "amoxicillin-500",
    name: "Mox 500 (मॉक्स 500)",
    generic: "Amoxicillin 500 mg (Antibiotic)",
    indication: "Bacterial Throat/Chest Infection / संक्रमण",
    category: "Antibiotic",
    badgeColor: "purple",
    icon: "🦠",
    defaultDose: "1 capsule twice daily for full 5 days",
  },
  {
    id: "pan-40",
    name: "Pan 40 (पैन 40)",
    generic: "Pantoprazole 40 mg (Gastro-resistant)",
    indication: "Acid Reflux, Gas & Heartburn / गैस व एसिडिटी",
    category: "Acidity",
    badgeColor: "amber",
    icon: "🔥",
    defaultDose: "1 tablet empty stomach in the morning",
  },
  {
    id: "atorva-20",
    name: "Atorva 20 (अटोरवा)",
    generic: "Atorvastatin 20 mg",
    indication: "Cholesterol & Heart Protection / कोलेस्ट्रॉल",
    category: "Heart & BP",
    badgeColor: "rose",
    icon: "❤️",
    defaultDose: "1 tablet at bedtime",
  },
  {
    id: "cetirizine-10",
    name: "Cetzine 10 (सेटज़िन)",
    generic: "Cetirizine Hydrochloride 10 mg",
    indication: "Sneezing, Runny Nose, Itching / एलर्जी व जुकाम",
    category: "Allergy",
    badgeColor: "cyan",
    icon: "🤧",
    defaultDose: "1 tablet at night (may cause drowsiness)",
  },
];
