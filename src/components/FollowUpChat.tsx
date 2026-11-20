import React, { useState } from "react";
import { MessageSquare, Send, Sparkles, Volume2, VolumeX, HelpCircle, CheckCircle } from "lucide-react";
import { MedicineAnalysis, TextSize } from "../types/medicine";
import { speakText, stopSpeaking } from "../utils/audio";
import { SUPPORTED_LANGUAGES } from "../data/languages";

interface FollowUpChatProps {
  medicine: MedicineAnalysis;
  selectedLanguage: string;
  textSize: TextSize;
}

interface QnAPair {
  question: string;
  answer: string;
}

const COMMON_QUESTIONS = [
  "Can I take this with warm milk or tea?",
  "Can this tablet be crushed or split in half?",
  "What should I do if I accidentally took two doses?",
  "Can I take this alongside my blood pressure medicine?",
  "Does this cause sleepiness or dizziness in seniors?",
];

export const FollowUpChat: React.FC<FollowUpChatProps> = ({
  medicine,
  selectedLanguage,
  textSize,
}) => {
  const [question, setQuestion] = useState<string>("");
  const [qaHistory, setQaHistory] = useState<QnAPair[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [speakingIdx, setSpeakingIdx] = useState<number | null>(null);

  const currentLangObj = SUPPORTED_LANGUAGES.find(
    (l) => l.name.toLowerCase() === selectedLanguage.toLowerCase()
  ) || SUPPORTED_LANGUAGES[0];

  const handleAsk = async (queryText?: string) => {
    const q = queryText || question;
    if (!q.trim() || isLoading) return;

    setIsLoading(true);
    setQuestion("");

    try {
      const response = await fetch("/api/ask-medicine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: q,
          medicineContext: {
            brandName: medicine.brandName,
            genericName: medicine.genericName,
            purpose: medicine.purpose,
            dosage: medicine.dosage,
            timing: medicine.timing,
            warning: medicine.warning,
          },
          language: selectedLanguage,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get answer");
      }

      const data = await response.json();
      const newPair: QnAPair = {
        question: q,
        answer: data.answer || "No response received. Please consult your physician.",
      };
      setQaHistory((prev) => [newPair, ...prev]);

      // Automatically speak the answer in elder language for ease of access
      speakAnswer(data.answer, 0);
    } catch (err: any) {
      console.error(err);
      setQaHistory((prev) => [
        {
          question: q,
          answer: `Error answering: ${err.message}. Please consult your physician or pharmacist directly.`,
        },
        ...prev,
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const speakAnswer = (text: string, index: number) => {
    if (speakingIdx === index) {
      stopSpeaking();
      setSpeakingIdx(null);
      return;
    }
    setSpeakingIdx(index);
    speakText(
      text,
      currentLangObj.speechCode,
      0.85,
      () => setSpeakingIdx(null),
      () => setSpeakingIdx(null)
    );
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
          <MessageSquare className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg md:text-xl font-bold text-white">
            Ask Elder / Caregiver Questions About {medicine.brandName}
          </h3>
          <p className="text-xs text-slate-400">
            Get instant clinical guidance explained simply in {selectedLanguage}
          </p>
        </div>
      </div>

      {/* Suggested Quick Questions */}
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-teal-400" />
          <span>Tap a frequent elder question:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {COMMON_QUESTIONS.map((cq, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleAsk(cq)}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-xl bg-slate-950/70 hover:bg-teal-950/40 text-slate-300 hover:text-teal-200 border border-slate-800 hover:border-teal-700/60 text-xs font-semibold text-left transition-all disabled:opacity-50"
            >
              {cq}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAsk();
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={`Type a question in ${selectedLanguage} or English (e.g. Can this be taken with food?)...`}
          className="flex-1 px-4 py-3 rounded-2xl bg-slate-950/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm font-medium shadow-inner"
        />
        <button
          type="submit"
          disabled={isLoading || !question.trim()}
          className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-md flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Sparkles className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">Ask</span>
        </button>
      </form>

      {/* Answers History */}
      {qaHistory.length > 0 && (
        <div className="space-y-3 pt-3 border-t border-slate-800">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Answers & Advice:
          </div>
          {qaHistory.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2"
            >
              <div className="text-xs font-bold text-teal-300 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Q: {item.question}</span>
              </div>
              <p className="text-sm md:text-base font-semibold text-slate-200 leading-relaxed">
                {item.answer}
              </p>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => speakAnswer(item.answer, idx)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    speakingIdx === idx
                      ? "bg-red-500 text-white"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                  }`}
                >
                  {speakingIdx === idx ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
                  <span>{speakingIdx === idx ? "Stop Voice" : `Listen in ${selectedLanguage}`}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
