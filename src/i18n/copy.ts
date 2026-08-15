import type { Grade } from '../game/scoring';
import type { Mode } from '../game/types';

export type Locale = 'en' | 'pl';

export const LOCALES: readonly Locale[] = ['en', 'pl'];

/** Every word the game says. Functions carry the values that vary. */
export interface Copy {
  tagline: string;
  language: string;
  modeGroup: string;
  modes: Record<Mode, { name: string; desc: string }>;
  howManySeconds: string;
  fineprint: string;
  clearRecords: string;
  clearRecordsConfirm: string;
  clearRecordsDone: string;

  back: string;
  again: string;
  tapAnywhere: string;

  wait: string;
  waitReflex: string;
  /** Ends where the number begins — the seconds are their own element. */
  waitBeforeCount: string;
  seconds: (value: string) => string;
  countingNow: (seconds: string) => string;
  flashTap: string;
  flashStart: string;

  grades: Record<Grade, string>;
  /** Decimal separator: a full stop in English, a comma in Polish. */
  decimal: string;
  unitSeconds: string;
  unitLate: string;
  unitShort: string;

  falseStart: string;
  falseStartDetail: string;
  tooEarly: string;
  dropped: string;
  droppedDetail: string;
  againstTarget: (target: string, you: string) => string;

  firstRound: string;
  newRecordBy: (better: string) => string;
  sameAsRecord: string;
  offBest: (worse: string, best: string) => string;
  ringLabel: (now: string, best: string) => string;

  bestNone: string;
  bestReflex: (value: string) => string;
  bestOff: (value: string) => string;

  announceReaction: (value: string, grade: string) => string;
  announceLate: (value: string, grade: string) => string;
  announceFalseStart: string;
  announceTooEarly: (value: string) => string;
  announceDropped: string;
}

const EN: Copy = {
  tagline: 'Stop the clock.',
  language: 'Language',
  modeGroup: 'Game mode',
  modes: {
    reflex: {
      name: 'Reflex',
      desc: 'It lights up. You tap. Speed is all that counts.',
    },
    count: {
      name: 'Count',
      desc: 'A random 2–10s to count out in the dark. Early is burnt.',
    },
    lock: {
      name: 'Lock',
      desc: 'Pick one number of seconds and practise it until you own it.',
    },
  },
  howManySeconds: 'How many seconds',
  fineprint:
    'Plays bright flashes on a dark screen. Sit this one out if that is a problem for you.',
  clearRecords: 'Clear records',
  clearRecordsConfirm: 'Sure?',
  clearRecordsDone: 'Cleared',

  back: 'Modes',
  again: 'Again',
  tapAnywhere: 'or tap anywhere on the screen',

  wait: 'Wait',
  waitReflex: 'do not press until it lights up',
  waitBeforeCount: 'the flash starts it — then you count',
  seconds: (value) => `${value}s`,
  countingNow: (seconds) => `counting ${seconds}s`,
  flashTap: 'Tap',
  flashStart: 'Start',

  grades: {
    uncanny: 'Uncanny',
    elite: 'Elite',
    sharp: 'Sharp',
    solid: 'Solid',
    steady: 'Steady',
    slack: 'Warming up',
  },
  decimal: '.',
  unitSeconds: 'seconds',
  unitLate: 'seconds late',
  unitShort: 'seconds early',

  falseStart: 'False start',
  falseStartDetail: 'You went before the light.',
  tooEarly: 'Too early',
  dropped: 'Dropped',
  droppedDetail: 'No press came. Round dropped.',
  againstTarget: (target, you) => `target ${target}s · you ${you}s`,

  firstRound: 'your first round in this mode',
  newRecordBy: (better) => `new record — ${better}s better`,
  sameAsRecord: 'exactly your record',
  offBest: (worse, best) => `${worse}s off your best of ${best}s`,
  ringLabel: (now, best) =>
    `${now} seconds against your best of ${best}. The ring is the record.`,

  bestNone: '—',
  bestReflex: (value) => `${value}s`,
  bestOff: (value) => `${value}s off`,

  announceReaction: (value, grade) => `${value} seconds. ${grade}.`,
  announceLate: (value, grade) => `${value} seconds late. ${grade}.`,
  announceFalseStart: 'False start. You went before the light.',
  announceTooEarly: (value) => `Too early by ${value} seconds.`,
  announceDropped: 'Round dropped. No press came.',
};

const PL: Copy = {
  tagline: 'Zatrzymaj zegar.',
  language: 'Język',
  modeGroup: 'Tryb gry',
  modes: {
    reflex: {
      name: 'Refleks',
      desc: 'Ekran się zapala. Klikasz. Liczy się tylko refleks.',
    },
    count: {
      name: 'Odliczanie',
      desc: 'Losowe 2–10s do odliczenia w ciemności. Za wcześnie = spalone.',
    },
    lock: {
      name: 'Trening',
      desc: 'Wybierasz jedną liczbę sekund i ćwiczysz ją, aż ją opanujesz.',
    },
  },
  howManySeconds: 'Ile sekund',
  fineprint:
    'Gra pokazuje jasne błyski na ciemnym ekranie. Odpuść, jeśli to dla Ciebie problem.',
  clearRecords: 'Kasuj rekordy',
  clearRecordsConfirm: 'Na pewno?',
  clearRecordsDone: 'Skasowane',

  back: 'Tryby',
  again: 'Jeszcze raz',
  tapAnywhere: 'albo dotknij ekranu gdziekolwiek',

  wait: 'Czekaj',
  waitReflex: 'nie klikaj, dopóki się nie zapali',
  waitBeforeCount: 'błysk to start — dopiero potem odliczasz',
  seconds: (value) => `${value}s`,
  countingNow: (seconds) => `liczysz ${seconds}s`,
  flashTap: 'Teraz',
  flashStart: 'Start',

  grades: {
    uncanny: 'Nieziemsko',
    elite: 'Elita',
    sharp: 'Ostro',
    solid: 'Solidnie',
    steady: 'Równo',
    slack: 'Rozgrzewka',
  },
  decimal: ',',
  unitSeconds: 'sekundy',
  unitLate: 'sekundy po czasie',
  unitShort: 'sekundy za wcześnie',

  falseStart: 'Falstart',
  falseStartDetail: 'Kliknięcie przed błyskiem.',
  tooEarly: 'Za wcześnie',
  dropped: 'Przepadło',
  droppedDetail: 'Nikt nie kliknął. Runda przepadła.',
  againstTarget: (target, you) => `cel ${target}s · Ty ${you}s`,

  firstRound: 'pierwszy wynik w tym trybie',
  newRecordBy: (better) => `nowy rekord — o ${better}s lepiej`,
  sameAsRecord: 'dokładnie tyle co rekord',
  offBest: (worse, best) => `o ${worse}s gorzej od rekordu ${best}s`,
  ringLabel: (now, best) =>
    `${now} sekundy przy rekordzie ${best}. Pierścień to rekord.`,

  bestNone: '—',
  bestReflex: (value) => `${value}s`,
  bestOff: (value) => `${value}s błędu`,

  announceReaction: (value, grade) => `${value} sekundy. ${grade}.`,
  announceLate: (value, grade) => `${value} sekundy po czasie. ${grade}.`,
  announceFalseStart: 'Falstart. Kliknięcie przed błyskiem.',
  announceTooEarly: (value) => `Za wcześnie o ${value} sekundy.`,
  announceDropped: 'Runda przepadła. Nikt nie kliknął.',
};

export const COPY: Record<Locale, Copy> = { en: EN, pl: PL };

/** Polish for a Polish browser, English for everyone else. */
export function detectLocale(languages: readonly string[]): Locale {
  return languages.some((tag) => tag.toLowerCase().startsWith('pl'))
    ? 'pl'
    : 'en';
}
