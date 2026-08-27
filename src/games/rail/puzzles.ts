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
    switches: 2, incoming: cars('f', ['excursion coach', 'horses', 'baggage', 'machinery', 'coach', 'cattle']), targetLabels: ['PASSENGER', 'STOCK', 'FREIGHT'],
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
    subject: 'One road, reached two ways',
    memo: 'The ore dock gets the first two cars of every four. I will not pay for two parallel ore roads just because the cars reach them from opposite halves of the ladder. Bring both streams together through the back of one machine, then send coke and stone to their own tracks.',
    aside: 'This is the first drawing where a turnout earns its keep without ever being faced.',
    yardNote: 'Two branches must merge onto the same ore road. A trailing turnout is a junction, not only a splitter.',
    switches: 4, incoming: cars('i', ['ore', 'ore', 'coke', 'limestone', 'ore', 'ore', 'coke', 'limestone', 'ore', 'ore', 'coke', 'limestone']), targetLabels: ['ORE DOCK', 'COKE', 'STONE'],
    canonical: [c('in', switchPortId(0, 'stem')), c(switchPortId(0, 'a'), switchPortId(1, 'stem')), c(switchPortId(0, 'b'), switchPortId(2, 'stem')), c(switchPortId(1, 'a'), switchPortId(3, 'a')), c(switchPortId(2, 'a'), switchPortId(3, 'b')), c(switchPortId(3, 'stem'), targetPortId('A')), c(switchPortId(1, 'b'), targetPortId('B')), c(switchPortId(2, 'b'), targetPortId('C'))],
  }),
  makeRailPuzzle({
    id: 'interurban', title: 'Interurban Connection', date: 'JUL 03 · 1913', sender: 'M. Bell, Excursion Agent',
    subject: 'Do not strand the sleeping car',
    memo: 'Tomorrow the interurban hands us a mixed cut at dawn. Pullman, mail, baggage, and express must reach the depot; milk, fish, and cream go straight to the cold store; the empties stay off the passenger road; hardware belongs with freight. I promised the conductor we would look competent.',
    yardNote: 'Twelve cars, three cams, four roads. The manifest looks irregular until you read the machine states.',
    switches: 3, canonicalBranches: ['a', 'b', 'a'], incoming: cars('u', ['Pullman', 'empty', 'mail', 'milk', 'baggage', 'hardware', 'coach', 'fish', 'express', 'empty', 'parcels', 'cream']), targetLabels: ['DEPOT', 'COLD STORE', 'EMPTY ROAD', 'FREIGHT'],
    canonical: [c('in', switchPortId(0, 'stem')), c(switchPortId(0, 'a'), targetPortId('A')), c(switchPortId(0, 'b'), switchPortId(1, 'stem')), c(switchPortId(1, 'a'), targetPortId('B')), c(switchPortId(1, 'b'), switchPortId(2, 'stem')), c(switchPortId(2, 'a'), targetPortId('C')), c(switchPortId(2, 'b'), targetPortId('D'))],
  }),
  makeRailPuzzle({
    id: 'relief-yard', title: 'Relief Yard', date: 'NOV 19 · 1913', sender: 'E. W. Halsted, Yardmaster',
    subject: 'The camp road comes from both halves',
    memo: 'A washout leaves one usable road to the relief camp. Water, blankets, food, tents, tools, and medicine arrive in two different phases of the cut; timber and pipe need the material road; coal and oil go to fuel. Fold the two camp streams together through a turnout from the return side.',
    aside: 'Halsted has stopped explaining why the old ladder cannot do this. He just circles the consist and writes “fix it.”',
    yardNote: 'Mixed starting cams plus a trailing merge. The camp road must be reached from both halves of the classifier.',
    switches: 4, canonicalBranches: ['b', 'b', 'a', 'a'], incoming: cars('w', ['water', 'timber', 'coal', 'blankets', 'food', 'pipe', 'oil', 'tents', 'tools', 'lumber', 'fuel oil', 'medicine']), targetLabels: ['CAMP', 'MATERIAL', 'FUEL'],
    canonical: [c('in', switchPortId(0, 'stem')), c(switchPortId(0, 'a'), switchPortId(1, 'stem')), c(switchPortId(0, 'b'), switchPortId(2, 'stem')), c(switchPortId(1, 'a'), switchPortId(3, 'a')), c(switchPortId(2, 'a'), switchPortId(3, 'b')), c(switchPortId(3, 'stem'), targetPortId('A')), c(switchPortId(1, 'b'), targetPortId('B')), c(switchPortId(2, 'b'), targetPortId('C'))],
  }),
  makeRailPuzzle({
    id: 'opening-day', title: 'Opening Day', date: 'APR 17 · 1914', sender: 'A. Kimball, Division Engineer',
    subject: 'Five roads before the superintendent arrives',
    memo: 'Two years ago this was a sketch and a box of brass cams. Tomorrow it opens as a real classification yard. The first cut mixes fast freight, city freight, perishables, industrial loads, and export grain. Four automatic machines, five roads, no switchmen on the ladder. Make the pattern look inevitable.',
    aside: 'Halsted has stopped calling them “your contraptions.” This is as close as he gets to praise.',
    yardNote: 'Four turnouts, five destinations, sixteen cars, mixed starting cams. There is no spare machine now.',
    switches: 4, incoming: cars('o', ['machinery', 'mail', 'meat', 'glass', 'export grain', 'express', 'fruit', 'paper', 'steel', 'parcels', 'ice', 'furniture', 'export flour', 'newspapers', 'milk', 'hardware']), targetLabels: ['FAST FREIGHT', 'CITY', 'PERISHABLE', 'INDUSTRIAL', 'PORT'],
    canonicalBranches: ['b', 'a', 'b', 'a'],
    canonical: [c('in', switchPortId(0, 'stem')), c(switchPortId(0, 'a'), switchPortId(1, 'stem')), c(switchPortId(0, 'b'), switchPortId(2, 'stem')), c(switchPortId(1, 'a'), targetPortId('A')), c(switchPortId(1, 'b'), targetPortId('B')), c(switchPortId(2, 'a'), targetPortId('C')), c(switchPortId(2, 'b'), switchPortId(3, 'stem')), c(switchPortId(3, 'a'), targetPortId('D')), c(switchPortId(3, 'b'), targetPortId('E'))],
  }),
];
