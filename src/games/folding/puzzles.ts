import { makeFoldingPuzzle, type FoldingPuzzle } from './model';

function labels(rows: number, cols: number, cover: string): string[] {
  return Array.from({ length: rows * cols }, (_, index) => index === 0 ? cover : String(index + 1).padStart(2, '0'));
}

export const foldingPuzzles: FoldingPuzzle[] = [
  makeFoldingPuzzle({
    id: 'calling-card', title: 'The Calling Card', date: 'FEB 06 · 1927', sender: 'Ada Bellweather', subject: 'One clean crease',
    memo: 'Mrs. Hargrove wants a tent card for a luncheon table. The engraver has already printed both names. Fold the stock so her crest lands outside and the card stands with the grain.',
    aside: 'Do not hunt for a tool. Take the paper by an edge and put it where it belongs.',
    rows: 1, cols: 2, panelLabels: labels(1, 2, 'H'), canonical: [{ edge: 'right', count: 1 }], stock: 'ivory laid · 120 gsm', ink: 'warm black', delivery: '12 cards · noon',
  }),
  makeFoldingPuzzle({
    id: 'rail-timetable', title: 'Railway Timetable', date: 'MAR 18 · 1927', sender: 'Ada Bellweather', subject: 'A pocket fold, not a wad',
    memo: 'The interurban timetable is four panels wide. Conductors need the cover on top and the first departures immediately inside. It must open without turning the sheet end-for-end.',
    rows: 1, cols: 4, panelLabels: labels(1, 4, 'D&C'), canonical: [{ edge: 'right', count: 1 }, { edge: 'left', count: 1 }, { edge: 'right', count: 1 }], stock: 'thin book · 70 gsm', ink: 'navy', delivery: '2,000 copies · 4 PM',
  }),
  makeFoldingPuzzle({
    id: 'orpheum-program', title: 'Orpheum Program', date: 'APR 09 · 1927', sender: 'Milo Vane, Orpheum Theatre', subject: 'Opening night is tonight',
    memo: 'Four little pages, one sheet. The title block must face the patron; the cast list must not be upside down when the program first opens. Milo says this is “obvious.” Milo does not own a folding table.',
    rows: 2, cols: 2, panelLabels: labels(2, 2, 'ORP'), canonical: [{ edge: 'bottom', count: 1 }, { edge: 'right', count: 1 }], stock: 'cream wove · 80 gsm', ink: 'oxblood', delivery: '750 copies · 6 PM',
  }),
  makeFoldingPuzzle({
    id: 'medicine-insert', title: 'Dr. Voss’s Insert', date: 'MAY 21 · 1927', sender: 'Crown Apothecary', subject: 'Make six inches disappear',
    memo: 'The new tonic bottle is too small for the required directions. The printer gave us a six-panel strip and exactly no sympathy. Fold it to the approved packet without burying the dosage panel.',
    rows: 1, cols: 6, panelLabels: labels(1, 6, 'CROWN'), canonical: [{ edge: 'right', count: 2 }, { edge: 'left', count: 2 }, { edge: 'right', count: 1 }], stock: 'onion skin · 45 gsm', ink: 'black + red rule', delivery: '5,000 inserts · Friday',
  }),
  makeFoldingPuzzle({
    id: 'hotel-map', title: 'Hotel Street Map', date: 'JUN 30 · 1927', sender: 'The Leland Hotel', subject: 'Guests keep getting lost',
    memo: 'The concierge wants a street map that closes to one quarter of its area. The hotel star must be the first thing a guest sees. The river can end up anywhere; apparently nobody walks there.',
    rows: 2, cols: 4, panelLabels: labels(2, 4, '★'), canonical: [{ edge: 'right', count: 2 }, { edge: 'bottom', count: 1 }, { edge: 'left', count: 1 }], stock: 'map offset · 65 gsm', ink: 'charcoal + lake blue', delivery: '1,500 maps · Monday',
  }),
  makeFoldingPuzzle({
    id: 'garden-menu', title: 'Garden Menu', date: 'AUG 12 · 1927', sender: 'Bellweather & Sons Catering', subject: 'Your father promised a fancy fold',
    memo: 'The wedding menu has two gate panels and a center illustration. Father told the bride it would “open like a little stage.” He then left for the paper warehouse. Make his promise true.',
    rows: 2, cols: 4, panelLabels: labels(2, 4, 'B&S'), canonical: [{ edge: 'left', count: 1 }, { edge: 'right', count: 1 }, { edge: 'bottom', count: 1 }], stock: 'soft white cover · 105 gsm', ink: 'sage + black', delivery: '180 menus · 3 PM',
  }),
  makeFoldingPuzzle({
    id: 'museum-guide', title: 'Museum Guide', date: 'OCT 01 · 1927', sender: 'Detroit Industrial Museum', subject: 'Twelve panels, two hands',
    memo: 'The machine hall guide is awkward on purpose: visitors unfold it beside the exhibits. The locomotive engraving must become the cover; the donor list belongs at the back. Everything between may find its own way.',
    rows: 3, cols: 4, panelLabels: labels(3, 4, 'LOCO'), canonical: [{ edge: 'bottom', count: 1 }, { edge: 'right', count: 2 }, { edge: 'top', count: 1 }, { edge: 'left', count: 1 }], stock: 'antique white · 75 gsm', ink: 'iron black', delivery: '3,000 guides · Tuesday',
  }),
  makeFoldingPuzzle({
    id: 'mail-order', title: 'Mail-Order Circular', date: 'JAN 14 · 1928', sender: 'Kline Household Supply', subject: 'It has to fit the envelope we already bought',
    memo: 'Kline printed ten panels of bargains before checking the envelope. The return coupon must be buried until the last opening so customers see the vacuum cleaner first. Their purchasing department is very proud of this plan.',
    rows: 2, cols: 5, panelLabels: labels(2, 5, 'KLINE'), canonical: [{ edge: 'right', count: 2 }, { edge: 'left', count: 1 }, { edge: 'bottom', count: 1 }, { edge: 'right', count: 1 }], stock: 'newsprint finish · 60 gsm', ink: 'blue + orange', delivery: '10,000 circulars · rail pickup',
  }),
  makeFoldingPuzzle({
    id: 'election-map', title: 'Election Ward Map', date: 'SEP 08 · 1928', sender: 'County Clerk’s Office', subject: 'The poll workers need this tomorrow',
    memo: 'Sixteen wards, one sheet, and a cover marked PRECINCT COPY. The clerk wants it small enough for a coat pocket but still opening in a sensible order. We are not permitted to redraw the map.',
    rows: 4, cols: 4, panelLabels: labels(4, 4, 'PRECINCT'), canonical: [{ edge: 'right', count: 2 }, { edge: 'bottom', count: 2 }, { edge: 'left', count: 1 }, { edge: 'top', count: 1 }], stock: 'ledger · 72 gsm', ink: 'black + county red', delivery: '600 maps · dawn',
  }),
  makeFoldingPuzzle({
    id: 'centennial', title: 'Centennial Keepsake', date: 'FEB 06 · 1929', sender: 'Ada Bellweather', subject: 'Two years at the table',
    memo: 'The shop turns fifty. I printed the old storefront across twenty-four panels and left the fold to you. Make a pocket keepsake with the 1879 sign on the cover and the present crew on the final back panel. No rush. This one is ours.',
    aside: 'Ada has already rejected three perfectly serviceable folds because “they feel like instructions, not an object.”',
    rows: 4, cols: 6, panelLabels: labels(4, 6, '1879'), canonical: [{ edge: 'right', count: 2 }, { edge: 'left', count: 2 }, { edge: 'bottom', count: 2 }, { edge: 'right', count: 1 }, { edge: 'top', count: 1 }], stock: 'Bellweather rag · 90 gsm', ink: 'black + anniversary gold', delivery: 'one for every employee',
  }),
];
