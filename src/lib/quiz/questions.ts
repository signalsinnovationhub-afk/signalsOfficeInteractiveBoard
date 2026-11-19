export type Question = {
  question: string;
  answers: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
  explanation: string;
  source?: string | null;
  image_url?: string | null;
  question_en?: string | null;
  answers_en?: [string, string, string, string] | null;
  explanation_en?: string | null;
  source_en?: string | null;
};

export const questions: Question[] = [
  {
    question:
      'Das "Last Exam of Humanity" wurde Ende 2024 entwickelt – 2.500 extrem knifflige Fragen aus Mathe, Biologie, Geschichte und Logik, die KI damals NICHT lösen konnte. Wie viel Prozent davon lösen die führenden KI-Modelle heute?',
    answers: ["ca. 10 %", "ca. 25 %", "ca. 50 %", "ca. 85 %"],
    correct: 2,
    explanation:
      "Innerhalb von nur 18 Monaten ist KI von 0 % auf 50 % gesprungen. Wahrscheinlich braucht es bald ein neues 'letztes Examen' – die Modelle nähern sich rasant der 100 %.",
  },
  {
    question:
      'Leo Tolstoi brauchte 7 Jahre, um "Krieg und Frieden" zu schreiben – 1.000 Seiten, rund 300.000 Token. Wie schnell und zu welchem Preis schafft eine moderne KI denselben Output?',
    answers: [
      "10 Minuten und 5 USD",
      "1 Stunde und 1 USD",
      "ca. 1 Minute und 15 Cent",
      "30 Sekunden, kostenlos",
    ],
    correct: 2,
    explanation:
      "15 Cent reichen. Die Inferenz-Kosten von KI sind innerhalb eines Jahres um Faktor 10 bis 100 gefallen – Text-Generierung ist praktisch kostenlos geworden.",
  },
  {
    question:
      "Wie viel investieren die großen Tech-Konzerne (Google, Microsoft, Amazon, Meta, Oracle & Co.) global PRO WERKTAG in neue KI-Datacenter?",
    answers: [
      "ca. 200 Millionen USD",
      "ca. 500 Millionen USD",
      "ca. 2 Milliarden USD",
      "ca. 10 Milliarden USD",
    ],
    correct: 2,
    explanation:
      "Zwei Milliarden – pro Werktag. Big Tech wird 2026 zusammen rund 790 Mrd. USD in Datacenter stecken. Das ist mehr als Manhattan-Projekt, Marshallplan, Apollo-Programm und Internationale Raumstation ZUSAMMEN gekostet haben.",
  },
  {
    question:
      "Wohin gehen aktuell 3 von 4 Dollar, die Unternehmen im B2B-Bereich für KI ausgeben?",
    answers: [
      "zu OpenAI (ChatGPT)",
      "zu Anthropic (Claude)",
      "zu Google (Gemini)",
      "zu Microsoft (Copilot)",
    ],
    correct: 1,
    explanation:
      "Anthropic dominiert den B2B-Markt – auch wenn ChatGPT bei Privatnutzern bekannter ist. Grund: Claude ist führend bei Coding, und Geschäftskunden sind deutlich loyaler als Privatnutzer.",
  },
  {
    question:
      "Tech-Konzerne haben in den letzten Jahren massenhaft Mitarbeiter entlassen. Was ist der HAUPTSÄCHLICHE Grund dafür?",
    answers: [
      "KI ersetzt Junior-Jobs",
      "Outsourcing nach Indien",
      "Zinswende + Corona-Overhiring",
      "Demografischer Wandel",
    ],
    correct: 2,
    explanation:
      "Nicht KI, sondern die Zinssteigerung von 0,25 % auf über 4 % plus massives Overhiring während Corona. Zusätzlich fließt Kapital jetzt in Datacenter statt in Gehälter – der CFO killt Jobs, nicht ChatGPT.",
  },
  {
    question:
      'Das Spitzenmodell "Claude Sonnet" von Anthropic kostet rund 15 USD pro 1 Mio. Output-Token. Was kostet ein vergleichbares Modell des chinesischen Anbieters DeepSeek?',
    answers: ["ca. 10 USD", "ca. 5 USD", "unter 1 USD", "gleicher Preis"],
    correct: 2,
    explanation:
      "Weniger als 7 % des US-Preises. China destilliert westliche Modelle und bietet sie als 'Discount-Version' an. Resultat: China entwickelt sich zur globalen Token-Fabrik – das größte strategische Problem für US-Frontier-Labs.",
  },
  {
    question: "Wie groß ist der Anteil der WELTBEVÖLKERUNG, der heute aktiv für KI bezahlt?",
    answers: ["ca. 30 %", "ca. 10 %", "ca. 3 %", "ca. 0,3 %"],
    correct: 3,
    explanation:
      "99,7 % zahlen NICHTS für KI. Wer für KI zahlt, ist automatisch im Top-1% der frühen Adopter weltweit. Riesiges Potenzial – und gleichzeitig das größte Marktrisiko für die KI-Konzerne.",
  },
  {
    question:
      "Wo werden rund 90 % der weltweit produzierten fortschrittlichen KI-Chips hergestellt?",
    answers: ["USA", "Südkorea", "Taiwan", "China"],
    correct: 2,
    explanation:
      "Auf einer einzigen kleinen Insel. Damit hängt die gesamte globale KI-Infrastruktur an einem geopolitischen Hotspot. Europa hat in der Chip-Produktion praktisch keine Souveränität.",
  },
  {
    question:
      "Wegen der Flut an KI-generierter Musik hat Spotify eine bemerkenswerte Entscheidung getroffen. Welche?",
    answers: [
      "KI-Songs komplett verboten",
      "Extra-Gebühr für KI-Musik",
      "Siegel für menschliche Artists",
      "Eigene Tracking-Kategorie",
    ],
    correct: 2,
    explanation:
      "Spotify kennzeichnet jetzt MENSCHLICHE Künstler – nicht KI. Der Paradigmenwechsel: KI-Watermarks funktionieren nicht. Stattdessen muss der immer seltener werdende menschliche Content ausgezeichnet werden – wie ein Bio-Siegel.",
  },
  {
    question:
      'Wie hat sich die Halluzinationsrate (also das "Erfinden" falscher Fakten) bei den neuesten Reasoning-Modellen wie GPT-5.5, Claude Opus 4.7 oder Gemini 3 Pro entwickelt?',
    answers: [
      "Drastisch gesunken",
      "Konstant niedrig geblieben",
      "Sogar gestiegen",
      "Komplett verschwunden",
    ],
    correct: 2,
    explanation:
      "Kontraintuitiv: Reasoning-Modelle halluzinieren MEHR, nicht weniger. Im Mai 2026 lagen ALLE führenden Reasoning-Modelle bei über 10 % Halluzinationsrate. Sie 'wissen' mehr, raten aber auch häufiger.",
  },
];
