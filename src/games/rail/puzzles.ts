import { makeRailPuzzle, switchPortId, targetPortId, type RailCar, type RailConnection, type RailPuzzle } from './model';

const tones: RailCar['tone'][] = ['brick', 'ochre', 'teal', 'olive', 'ink'];
function cars(prefix: string, labels: string[]): RailCar[] {
  return labels.map((label, index) => ({ id: `${prefix}${index + 1}`, mark: `${prefix.toUpperCase()}-${index + 1}`, label, tone: tones[index % tones.length]! }));
}
const c = (a: string, b: string): RailConnection => ({ a, b });

export const railPuzzles: RailPuzzle[] = [
  makeRailPuzzle({
    id: 'postal-cut', title: 'The Postal Cut', date: 'APR 17 · 1912', sender: 'E. W. Halsted, Yardmaster',
    subject: 'Two cars before breakfast',
    memo: 'The morning local arrives with the mail van ahead of the creamery car. I want each on its own road without a man walking down to throw points. The new automatic turnout is yours to prove.',
    aside: 'A facing move advances the brass cam. A trailing move simply springs the points aside.',
    yardNote: 'One alternating turnout. Connect the incoming road to both sidings.',
    switches: 1, incoming: cars('p', ['U.S. mail van', 'creamery refrigerator']), targetLabels: ['POST OFFICE', 'CREAMERY'],
    canonical: [c('in', switchPortId(0, 'stem')), c(switchPortId(0, 'a'), targetPortId('A')), c(switchPortId(0, 'b'), targetPortId('B'))],
  }),
  makeRailPuzzle({
    id: 'market-extra', title: 'Market Extra', date: 'MAY 02 · 1912', sender: 'E. W. Halsted, Yardmaster',
    subject: 'Four cars, three roads',
    memo: 'Produce traffic is doubling. The west siding takes every other wagon; the remaining pair must be separated between ice house and team track. No hand-thrown switch stands.',
    yardNote: 'Two automatic turnouts. Let one turnout feed the other.',
    switches: 2, incoming: cars('m', ['lettuce', 'ice', 'berries', 'hardware']), targetLabels: ['WEST MARKET', 'ICE HOUSE', 'TEAM TRACK'],
    canonical: [c('in', switchPortId(0, 'stem')), c(switchPortId(0, 'a'), targetPortId('A')), c(switchPortId(0, 'b'), switchPortId(1, 'stem')), c(switchPortId(1, 'a'), targetPortId('B')), c(switchPortId(1, 'b'), targetPortId('C'))],
  }),
  makeRailPuzzle({
    id: 'fairground', title: 'Fairground Special', date: 'JUN 11 · 1912', sender: 'M. Bell, Excursion Agent',
    subject: 'Keep the stock cars away from the platform',
    memo: 'The county fair brings six wagons in one cut. Passengers complain when livestock waits beside the excursion platform. Sort the cut before the first whistle.',
    yardNote: 'A two-stage ladder. The first road receives every other car.',
    switches: 2, incoming: cars('f', ['excursion coach', 'horses', 'baggage', 'cattle', 'coach', 'feed']), targetLabels: ['PASSENGER', 'STOCK', 'FREIGHT'],
    canonicalBranches: ['b', 'a'],
    canonical: [c('in', switchPortId(0, 'stem')), c(switchPortId(0, 'b'), targetPortId('A')), c(switchPortId(0, 'a'), switchPortId(1, 'stem')), c(switchPortId(1, 'a'), targetPortId('B')), c(switchPortId(1, 'b'), targetPortId('C'))],
  }),
  makeRailPuzzle({
    id: 'four-roads', title: 'Four Roads', date: 'AUG 28 · 1912', sender: 'E. W. Halsted, Yardmaster',
    subject: 'The ladder finally earns its name',
    memo: 'Detroit, Toledo, Ann Arbor, and the mill all want cars off the same inbound cut. Use the three new machines. I do not care how pretty it is until it works; then I care very much.',
    yardNote: 'Three turnouts can make four repeating destinations.',
    switches: 3, incoming: cars('r', ['auto parts', 'coal', 'paper', 'machinery', 'glass', 'flour', 'timber', 'tools']), targetLabels: ['DETROIT', 'TOLEDO', 'ANN ARBOR', 'MILL'],
    canonical: [c('in', switchPortId(0, 'stem')), c(switchPortId(0, 'a'), targetPortId('A')), c(switchPortId(0, 'b'), switchPortId(1, 'stem')), c(switchPortId(1, 'a'), targetPortId('B')), c(switchPortId(1, 'b'), switchPortId(2, 'stem')), c(switchPortId(2, 'a'), targetPortId('C')), c(switchPortId(2, 'b'), targetPortId('D'))],
  }),
  makeRailPuzzle({
    id: 'split-ladder', title: 'Split Ladder', date: 'OCT 04 · 1912', sender: 'A. Kimball, Division Engineer',
    subject: 'Stop building everything in a straight line',
    memo: 'Halsted says your yard works but wastes rail. I brought a second ladder arrangement from Cleveland: split the traffic first, then classify each half. Same cars. Less steel if you lay it sensibly.',
    yardNote: 'Three turnouts in a balanced tree. The geometry matters now.',
    switches: 3, incoming: cars('s', ['castings', 'lumber', 'bottles', 'coal', 'brick', 'grain', 'paint', 'wire']), targetLabels: ['NORTH', 'EAST', 'SOUTH', 'WEST'],
    canonical: [c('in', switchPortId(0, 'stem')), c(switchPortId(0, 'a'), switchPortId(1, 'stem')), c(switchPortId(0, 'b'), switchPortId(2, 'stem')), c(switchPortId(1, 'a'), targetPortId('A')), c(switchPortId(1, 'b'), targetPortId('B')), c(switchPortId(2, 'a'), targetPortId('C')), c(switchPortId(2, 'b'), targetPortId('D'))],
  }),
  makeRailPuzzle({
    id: 'second-shift', title: 'Second Shift', date: 'JAN 09 · 1913', sender: 'E. W. Halsted, Yardmaster',
    subject: 'The night crew leaves the cams where they stop',
    memo: 'Do not assume every machine wakes up pointing left. The night cut is already half classified when you take the board. Set the initial brass cams before you call for the shove.',
    yardNote: 'Three turnouts, mixed initial positions. Click a brass lever to set the first route.',
    switches: 3, canonicalBranches: ['b', 'a', 'b'], incoming: cars('n', ['newsprint', 'canned goods', 'stone', 'empty box', 'poultry', 'cement', 'oil', 'mail']), targetLabels: ['RIVER', 'CITY', 'WAREHOUSE', 'EAST'],
    canonical: [c('in', switchPortId(0, 'stem')), c(switchPortId(0, 'a'), switchPortId(1, 'stem')), c(switchPortId(0, 'b'), switchPortId(2, 'stem')), c(switchPortId(1, 'a'), targetPortId('A')), c(switchPortId(1, 'b'), targetPortId('B')), c(switchPortId(2, 'a'), targetPortId('C')), c(switchPortId(2, 'b'), targetPortId('D'))],
  }),
  makeRailPuzzle({
    id: 'short-iron', title: 'Short Iron', date: 'MAR 22 · 1913', sender: 'A. Kimball, Division Engineer',
    subject: 'Steel is not free',
    memo: 'The superintendent approved the automatic yard and immediately cut the rail allowance. Typical. The manifest is easy. Make the connections compact enough that I can defend the estimate.',
    yardNote: 'Four turnouts available. The shortest useful layout is not the most obvious tree.',
    switches: 4, incoming: cars('i', ['ore', 'coke', 'limestone', 'rails', 'ore', 'coke', 'limestone', 'rails', 'ore', 'coke']), targetLabels: ['ORE DOCK', 'COKE', 'STONE', 'ROLLING MILL'],
    canonical: [c('in', switchPortId(0, 'stem')), c(switchPortId(0, 'a'), switchPortId(1, 'stem')), c(switchPortId(0, 'b'), switchPortId(2, 'stem')), c(switchPortId(1, 'a'), targetPortId('A')), c(switchPortId(1, 'b'), targetPortId('B')), c(switchPortId(2, 'a'), targetPortId('C')), c(switchPortId(2, 'b'), targetPortId('D'))],
  }),
  makeRailPuzzle({
    id: 'interurban', title: 'Interurban Connection', date: 'JUL 03 · 1913', sender: 'M. Bell, Excursion Agent',
    subject: 'Do not strand the sleeping car',
    memo: 'Tomorrow the interurban hands us a mixed cut at dawn. The Pullman must reach the depot, perishables the cold store, and empties anywhere but the depot road. I promised the conductor we would look competent.',
    yardNote: 'A long repeating manifest. Watch the cams, not the car colors.',
    switches: 4, canonicalBranches: ['a', 'b', 'a', 'b'], incoming: cars('u', ['Pullman', 'milk', 'empty', 'fish', 'mail', 'empty', 'cream', 'baggage', 'empty', 'produce', 'coach', 'empty']), targetLabels: ['DEPOT', 'COLD STORE', 'EMPTY ROAD', 'FREIGHT'],
    canonical: [c('in', switchPortId(0, 'stem')), c(switchPortId(0, 'a'), targetPortId('A')), c(switchPortId(0, 'b'), switchPortId(1, 'stem')), c(switchPortId(1, 'a'), targetPortId('B')), c(switchPortId(1, 'b'), switchPortId(2, 'stem')), c(switchPortId(2, 'a'), targetPortId('C')), c(switchPortId(2, 'b'), targetPortId('D'))],
  }),
  makeRailPuzzle({
    id: 'relief-yard', title: 'Relief Yard', date: 'NOV 19 · 1913', sender: 'E. W. Halsted, Yardmaster',
    subject: 'Use the return side of a turnout',
    memo: 'A washout closes the west ladder. You may trail through a turnout from either branch; it springs back without advancing the cam. That little fact is worth several hundred feet of temporary rail.',
    yardNote: 'Reverse travel through a turnout is legal. A compact solution can reuse a stem.',
    switches: 4, incoming: cars('w', ['relief coal', 'water', 'timber', 'tools', 'food', 'wire', 'blankets', 'pipe', 'cement', 'oil']), targetLabels: ['WORK TRAIN', 'CAMP', 'MATERIAL', 'FUEL'],
    canonical: [c('in', switchPortId(0, 'stem')), c(switchPortId(0, 'a'), switchPortId(1, 'stem')), c(switchPortId(0, 'b'), switchPortId(2, 'stem')), c(switchPortId(1, 'a'), targetPortId('A')), c(switchPortId(1, 'b'), targetPortId('B')), c(switchPortId(2, 'a'), targetPortId('C')), c(switchPortId(2, 'b'), targetPortId('D'))],
  }),
  makeRailPuzzle({
    id: 'opening-day', title: 'Opening Day', date: 'APR 17 · 1914', sender: 'A. Kimball, Division Engineer',
    subject: 'The superintendent is bringing guests',
    memo: 'Two years ago this was a sketch and a box of brass cams. Tomorrow it opens as a real classification yard. Twelve cars, four roads, no switchmen on the ladder. Make it work. Then move the turnouts until it looks inevitable.',
    aside: 'Halsted has stopped calling them “your contraptions.” This is as close as he gets to praise.',
    yardNote: 'Four turnouts, twelve cars. Solve first; then chase rail length.',
    switches: 4, incoming: cars('o', ['mail', 'machinery', 'meat', 'coal', 'express', 'glass', 'fruit', 'ore', 'baggage', 'paper', 'ice', 'steel']), targetLabels: ['FAST FREIGHT', 'CITY', 'PERISHABLE', 'INDUSTRIAL'],
    canonicalBranches: ['b', 'a', 'b', 'a'],
    canonical: [c('in', switchPortId(0, 'stem')), c(switchPortId(0, 'a'), switchPortId(1, 'stem')), c(switchPortId(0, 'b'), switchPortId(2, 'stem')), c(switchPortId(1, 'a'), targetPortId('A')), c(switchPortId(1, 'b'), targetPortId('B')), c(switchPortId(2, 'a'), targetPortId('C')), c(switchPortId(2, 'b'), targetPortId('D'))],
  }),
];
