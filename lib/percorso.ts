// Contenuto del percorso Academy "Assicurati": 4 lezioni e un quiz finale.
// Testo educativo e neutro: Finanz non è un intermediario assicurativo e non consiglia polizze specifiche.
//
// Ogni lezione è una sequenza di card, come nell'app:
// - teoria: titolo con emoji, frase in grassetto, box colorati e definizioni
// - domanda: "Mettiti alla prova", scelta multipla (anche frasi da completare)
// - vero_falso: "Mettiti alla prova", due bottoni
// - sondaggio: "Piccolo sondaggio", nessuna risposta giusta
// - simulatore: "Prova tu", un cursore sul danno che mostra chi paga cosa

export type Blocco =
  | { stile: "testo" | "azzurro" | "rosa" | "giallo"; testo: string }
  | { stile: "definizione"; termine: string; testo: string };

export type Card =
  | { tipo: "teoria"; emoji: string; titolo: string; lead: string; blocchi: Blocco[] }
  | { tipo: "domanda"; emoji: string; testo: string; risposte: string[]; corretta: number }
  | { tipo: "vero_falso"; emoji: string; testo: string; vero: boolean }
  | { tipo: "sondaggio"; testo: string; risposte: string[] }
  | { tipo: "simulatore"; emoji: string; testo: string; franchigia: number; massimale: number; dannoMax: number };

export type Lezione = {
  emoji: string;
  titolo: string;
  kiwi: number;
  // Illustrazione della schermata "Lezione completata"
  premio: string;
  card: Card[];
};

export const PERCORSO = {
  titolo: "Assicurati",
  livello: "Intermedio",
  cover: "/cover-assicurati.jpg",
  kiwiTraguardo: 150,
};

export const LEZIONI: Lezione[] = [
  {
    emoji: "🛡️",
    titolo: "Spostare il rischio",
    kiwi: 25,
    premio: "🚀",
    card: [
      {
        tipo: "domanda",
        emoji: "📖",
        testo: "Hai risparmiato un anno per una bici elettrica da 2.000€. Un mese dopo te la rubano sotto casa e non sei assicurato. Chi ti ridà i soldi?",
        risposte: ["Il Comune", "Nessuno", "Il negozio che te l'ha venduta"],
        corretta: 1,
      },
      {
        tipo: "teoria",
        emoji: "🤝",
        titolo: "Il patto",
        lead: "Nessuno, a meno che tu non abbia fatto un patto prima.",
        blocchi: [
          { stile: "azzurro", testo: "Paghi una piccola cifra a qualcuno con le spalle più larghe. Se succede il peggio, il danno se lo prende lui." },
          { stile: "definizione", termine: "Assicurazione", testo: "accordo con cui sposti un rischio economico su una compagnia, in cambio di un pagamento" },
        ],
      },
      {
        tipo: "teoria",
        emoji: "🌧️",
        titolo: "Il danno resta",
        lead: "La bici, però, sparisce comunque.",
        blocchi: [
          { stile: "azzurro", testo: "Un'assicurazione non ferma il ladro e non ti riporta la bici sotto casa." },
          { stile: "rosa", testo: "Cambia solo una cosa: chi paga il conto quando il danno è già fatto." },
        ],
      },
      {
        tipo: "domanda",
        emoji: "📖",
        testo: "Quando sottoscrivi un'assicurazione, cosa stai facendo davvero?",
        risposte: [
          "Un investimento senza rischi",
          "Sposto un rischio economico su una compagnia",
          "Verso una cauzione che mi tornerà indietro",
          "Compro la certezza che non succederà niente",
        ],
        corretta: 1,
      },
      {
        tipo: "teoria",
        emoji: "📄",
        titolo: "Nero su bianco",
        lead: "Un patto così non si fa con una stretta di mano.",
        blocchi: [
          { stile: "azzurro", testo: "Firmi un contratto: dentro c'è scritto cosa è coperto, quanto paghi e a quali condizioni." },
          { stile: "definizione", termine: "Polizza", testo: "il documento del contratto assicurativo, con i rischi coperti, il prezzo e le condizioni" },
        ],
      },
      {
        tipo: "sondaggio",
        testo: "Quale rischio ti preoccupa di più?",
        risposte: ["Un incidente in auto o in moto", "Un problema di salute", "Un problema ai denti", "Un danno in casa", "Non ci penso proprio"],
      },
      {
        tipo: "vero_falso",
        emoji: "🔐",
        testo: "Se assicuri la bici contro il furto, nessuno te la può più rubare.",
        vero: false,
      },
      {
        tipo: "teoria",
        emoji: "💰",
        titolo: "Il prezzo",
        lead: "Spostare un rischio su qualcun altro, però, non è gratis.",
        blocchi: [
          { stile: "testo", testo: "Chi se lo prende vuole essere pagato." },
          { stile: "rosa", testo: "Quanto, esattamente? E chi decide la cifra?" },
        ],
      },
    ],
  },
  {
    emoji: "💶",
    titolo: "Il premio",
    kiwi: 30,
    premio: "🎯",
    card: [
      {
        tipo: "domanda",
        emoji: "📖",
        testo: "Due amiche hanno la stessa auto. Una la usa solo d'estate, l'altra fa 80 km al giorno per lavoro. Chi paga di più per assicurarla?",
        risposte: ["Chi la usa solo d'estate", "Chi la usa ogni giorno", "Pagano la stessa cifra"],
        corretta: 1,
      },
      {
        tipo: "teoria",
        emoji: "📊",
        titolo: "Più rischio, più prezzo",
        lead: "Chi guida tutti i giorni ha molte più occasioni di fare un incidente.",
        blocchi: [
          { stile: "azzurro", testo: "Per la compagnia vuol dire più rischio. E chi porta più rischio, paga di più." },
          { stile: "definizione", termine: "Premio assicurativo", testo: "la cifra che paghi alla compagnia per farti coprire un rischio" },
        ],
      },
      {
        tipo: "teoria",
        emoji: "🧮",
        titolo: "Come nasce la cifra",
        lead: "Il premio ha due ingredienti.",
        blocchi: [
          { stile: "azzurro", testo: "Quanto è probabile che il danno succeda, e quanto costerebbe." },
          { stile: "rosa", testo: "Quanto costa far funzionare la compagnia: personale, periti, uffici." },
          { stile: "giallo", testo: "Non è un numero a caso: è un calcolo statistico." },
          {
            stile: "testo",
            testo:
              "La compagnia mette insieme i dati di migliaia di assicurati simili a te e stima la frequenza dei sinistri, cioè quante volte all'anno capita un danno ogni cento polizze, e il costo medio di ciascun danno. Moltiplicando i due numeri ottiene il premio puro: la cifra che, in media, servirà a pagare i rimborsi. A questa si aggiungono i caricamenti, cioè le spese di gestione, le provvigioni di chi vende la polizza e un margine di sicurezza nel caso i danni dell'anno siano più del previsto. Infine ci sono le imposte, che in Italia variano a seconda del tipo di polizza. Per questo due compagnie possono chiederti premi diversi per la stessa copertura: hanno dati, costi e margini diversi.",
          },
        ],
      },
      {
        tipo: "domanda",
        emoji: "📖",
        testo: "Il premio dipende dalla probabilità del danno e dai ______ della compagnia.",
        risposte: ["Costi di gestione", "Guadagni in Borsa", "Interessi bancari", "Rimborsi dell'anno prima"],
        corretta: 0,
      },
      {
        tipo: "teoria",
        emoji: "🪪",
        titolo: "Anche chi sei conta",
        lead: "I chilometri non sono l'unico fattore.",
        blocchi: [
          { stile: "azzurro", testo: "La compagnia guarda anche la tua età, la zona in cui vivi e gli incidenti che hai avuto." },
          { stile: "rosa", testo: "Sembra ingiusto, ma a parità di tutto il resto chi ha 20 anni di solito paga più di chi ne ha 45: in quella fascia d'età, statisticamente, gli incidenti sono di più." },
        ],
      },
      {
        tipo: "sondaggio",
        testo: "Sai quanto paghi ogni anno per le tue assicurazioni?",
        risposte: ["Sì, al centesimo", "Più o meno", "No, se ne occupa qualcun altro", "Non ne ho"],
      },
      {
        tipo: "vero_falso",
        emoji: "🚗",
        testo: "Due persone con la stessa auto pagano sempre lo stesso premio.",
        vero: false,
      },
      {
        tipo: "teoria",
        emoji: "👀",
        titolo: "Il rimborso",
        lead: "Ora sai come si calcola quanto paghi.",
        blocchi: [
          { stile: "azzurro", testo: "Ma quando il danno succede davvero, ti ridanno tutta la cifra?" },
          { stile: "rosa", testo: "Non sempre. Nel contratto ci sono tre paletti da conoscere." },
        ],
      },
    ],
  },
  {
    emoji: "🧾",
    titolo: "Franchigia e massimale",
    kiwi: 25,
    premio: "🏅",
    card: [
      {
        tipo: "domanda",
        emoji: "📖",
        testo: "La tua polizza ha una franchigia di 300€. Ti succede un danno da 1.000€. Quanto ti rimborsa la compagnia?",
        risposte: ["1.000€", "700€", "300€"],
        corretta: 1,
      },
      {
        tipo: "teoria",
        emoji: "🧱",
        titolo: "La franchigia",
        lead: "Una parte del danno resta sempre a te.",
        blocchi: [
          { stile: "azzurro", testo: "Con una franchigia di 300€, i primi 300€ del danno li paghi tu. Il resto lo paga la compagnia." },
          { stile: "definizione", termine: "Franchigia", testo: "la parte fissa del danno, in euro, che resta a tuo carico" },
        ],
      },
      {
        tipo: "teoria",
        emoji: "➗",
        titolo: "Lo scoperto",
        lead: "A volte quella parte non è una cifra fissa, ma una percentuale.",
        blocchi: [
          { stile: "azzurro", testo: "Con uno scoperto del 10%, su un danno da 2.000€ ne paghi 200." },
          { stile: "definizione", termine: "Scoperto", testo: "la parte del danno, in percentuale, che resta a tuo carico" },
        ],
      },
      {
        tipo: "teoria",
        emoji: "🔝",
        titolo: "Il massimale",
        lead: "C'è anche un tetto a quello che la compagnia paga.",
        blocchi: [
          { stile: "azzurro", testo: "Oltre il massimale, il resto del danno lo paghi tu." },
          { stile: "rosa", testo: "Un massimale basso costa meno, ma ti lascia scoperto proprio quando il danno è grosso." },
          { stile: "definizione", termine: "Massimale", testo: "la cifra massima che la compagnia paga per un danno" },
        ],
      },
      {
        tipo: "simulatore",
        emoji: "🎛️",
        testo: "Franchigia di 300€, massimale di 10.000€. Sposta il cursore: chi paga il danno?",
        franchigia: 300,
        massimale: 10000,
        dannoMax: 20000,
      },
      {
        tipo: "domanda",
        emoji: "📖",
        testo: "Massimale di 10.000€, danno da 25.000€. Chi paga i 15.000€ che mancano?",
        risposte: ["La compagnia", "Tu", "Lo Stato", "Nessuno, il danno si annulla"],
        corretta: 1,
      },
      {
        tipo: "teoria",
        emoji: "🚫",
        titolo: "Le esclusioni",
        lead: "Alcuni casi la polizza non li copre proprio.",
        blocchi: [
          { stile: "azzurro", testo: "Sono elencati in una sezione a parte del contratto, spesso verso la fine." },
          { stile: "giallo", testo: "È la parte del contratto da leggere per prima." },
        ],
      },
      {
        tipo: "vero_falso",
        emoji: "📈",
        testo: "Con un massimale più alto, la compagnia ti può rimborsare un danno più grande.",
        vero: true,
      },
      {
        tipo: "teoria",
        emoji: "🔍",
        titolo: "Il confronto",
        lead: "Ora sai leggere una polizza.",
        blocchi: [{ stile: "rosa", testo: "Ma come capisci se un'offerta è migliore di un'altra?" }],
      },
    ],
  },
  {
    emoji: "🔍",
    titolo: "Confrontare le polizze",
    kiwi: 30,
    premio: "⭐",
    card: [
      {
        tipo: "domanda",
        emoji: "📖",
        testo: "La polizza A costa 180€ all'anno con franchigia di 500€. La B costa 240€ con franchigia di 100€. Quale ti costa meno?",
        risposte: ["Sempre la A", "Sempre la B", "Dipende da quanti danni ti capitano"],
        corretta: 2,
      },
      {
        tipo: "teoria",
        emoji: "⚖️",
        titolo: "Mele con mele",
        lead: "Il prezzo, da solo, non dice niente.",
        blocchi: [
          { stile: "azzurro", testo: "Confronta polizze con massimali, franchigie ed esclusioni simili." },
          { stile: "rosa", testo: "Altrimenti stai confrontando due cose diverse." },
        ],
      },
      {
        tipo: "teoria",
        emoji: "🔁",
        titolo: "Ce l'hai già?",
        lead: "Molte polizze si rinnovano da sole, ogni anno.",
        blocchi: [
          { stile: "azzurro", testo: "Prima del rinnovo, rileggi la tua: cosa copre, quanto paghi, cosa manca." },
          { stile: "rosa", testo: "Capita di pagare per anni una copertura che non serve più, mentre manca quella che servirebbe." },
        ],
      },
      {
        tipo: "sondaggio",
        testo: "Quando hai riletto l'ultima volta una tua polizza?",
        risposte: ["Quest'anno", "Qualche anno fa", "Mai", "Non ho polizze"],
      },
      {
        tipo: "teoria",
        emoji: "⏳",
        titolo: "Il ripensamento",
        lead: "Dopo la firma non sei subito bloccato.",
        blocchi: [
          { stile: "azzurro", testo: "Per molte polizze hai qualche giorno per recedere dal contratto." },
          { stile: "giallo", testo: "Quanti giorni, lo trovi scritto nel contratto." },
        ],
      },
      {
        tipo: "domanda",
        emoji: "📖",
        testo: "Per confrontare due polizze, cosa guardi?",
        risposte: ["Solo il prezzo", "Il nome della compagnia", "Prezzo, massimali, franchigie ed esclusioni", "La pubblicità più simpatica"],
        corretta: 2,
      },
      {
        tipo: "vero_falso",
        emoji: "🏷️",
        testo: "La polizza più economica è sempre la più conveniente.",
        vero: false,
      },
      {
        tipo: "teoria",
        emoji: "🎓",
        titolo: "Ultimo passo",
        lead: "Hai finito le lezioni del percorso.",
        blocchi: [{ stile: "azzurro", testo: "Ora un quiz di 5 domande per vedere cosa ti è rimasto." }],
      },
    ],
  },
];

export type Domanda = { testo: string; risposte: string[]; corretta: number };

export const QUIZ: Domanda[] = [
  {
    testo: "Cos'è il massimale?",
    risposte: ["Il prezzo che paghi ogni anno", "Il massimo che la compagnia paga", "La parte del danno che resta a te"],
    corretta: 1,
  },
  {
    testo: "Quale di questi fattori NON cambia il premio dell'RC auto?",
    risposte: ["La tua età", "La zona in cui vivi", "Il colore dell'auto", "Gli incidenti che hai avuto"],
    corretta: 2,
  },
  {
    testo: "Franchigia di 200€, danno da 800€. Quanto paghi tu?",
    risposte: ["200€", "600€", "800€", "Niente"],
    corretta: 0,
  },
  {
    testo: "Scoperto del 10%, danno da 2.000€. Quanto paghi tu?",
    risposte: ["10€", "200€", "1.800€", "2.000€"],
    corretta: 1,
  },
  {
    testo: "Per confrontare due polizze devi guardare...",
    risposte: ["Solo il prezzo", "Il nome della compagnia", "Prezzo, massimali, franchigie ed esclusioni"],
    corretta: 2,
  },
];
