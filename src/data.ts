import type { PuzzleBase } from './core/types';

export interface RailPuzzle extends PuzzleBase {
  cols: number;
  rows: number;
  entry: [number, number];
  exits: { id: string; label: string; at: [number, number]; color: string }[];
  cars: { id: string; label: string; destination: string; color: string }[];
  blocked: [number, number][];
}

export interface BinderyPuzzle extends PuzzleBase {
  rows: number;
  cols: number;
  front: number[];
  back: number[];
  targetTop: number;
  targetBottom: number;
  targetLeaves: number;
}

export interface RiggingPuzzle extends PuzzleBase {
  load: number;
  pull: number;
  maxEffort: number;
  requiredTravel: number;
  fixed: { id: string; x: number; y: number }[];
  moving: { id: string; x: number; y: number }[];
  obstacles: { x: number; y: number; w: number; h: number }[];
}

export const railPuzzles: RailPuzzle[] = [
  {
    id: 'rail-1', number: 1, title: 'The Milk Spur', sender: 'E. Malloy, yardmaster', date: 'APR 3 1937',
    story: 'The dairy car has been missing the creamery platform since the old spur was lifted. Give the night crew a clean line before tomorrow’s first milk train.',
    instruction: 'Lay a continuous route from the inbound lead to CREAMERY. Drag between adjacent survey pins. That is the entire vocabulary.', metricLabel: 'Rail laid',
    cols: 9, rows: 6, entry: [0, 3], exits: [{ id: 'cream', label: 'CREAMERY', at: [8, 2], color: '#cc4b3e' }],
    cars: [{ id: 'm1', label: 'MILK', destination: 'cream', color: '#e9e2c9' }], blocked: [[4,3],[4,4]],
  },
  {
    id: 'rail-2', number: 2, title: 'Two Consignees', sender: 'E. Malloy, yardmaster', date: 'APR 11 1937',
    story: 'The feed merchant and the icehouse finally agreed to share the north lead. The tower will throw the junction for each car; your job is only to make the geometry possible.',
    instruction: 'Connect the inbound lead to both destinations. During the test, the tower routes each car toward its marked consignee at every junction.', metricLabel: 'Rail laid',
    cols: 9, rows: 6, entry: [0, 3], exits: [{ id: 'feed', label: 'FEED', at: [8, 1], color: '#d8aa55' }, { id: 'ice', label: 'ICE', at: [8, 5], color: '#5f93a5' }],
    cars: [{ id: 'f1', label: 'FEED', destination: 'feed', color: '#d8aa55' }, { id: 'i1', label: 'ICE', destination: 'ice', color: '#8bb6c4' }], blocked: [[5,3]],
  },
  {
    id: 'rail-3', number: 3, title: 'Keep the Main Clear', sender: 'M. Ruiz, dispatcher', date: 'MAY 2 1937',
    story: 'Passenger 14 is due at 2:10. We can still classify the coal and canned goods, but nothing may touch the fenced mainline right-of-way.',
    instruction: 'Reach COAL and CANNERY without entering fenced survey squares.', metricLabel: 'Rail laid', cols: 10, rows: 7, entry: [0, 4],
    exits: [{ id: 'coal', label: 'COAL', at: [9, 1], color: '#55504a' }, { id: 'can', label: 'CANNERY', at: [9, 6], color: '#b86247' }],
    cars: [{ id: 'c1', label: 'COAL', destination: 'coal', color: '#5c5850' }, { id: 'g1', label: 'CANS', destination: 'can', color: '#b86247' }], blocked: [[3,3],[4,3],[5,3],[6,3],[7,3]],
  },
  {
    id: 'rail-4', number: 4, title: 'The Flour Rush', sender: 'E. Malloy, yardmaster', date: 'MAY 19 1937',
    story: 'Hollis Mill wants three cars before dawn and the team track wants one. They arrive intermixed. The tower has the waybills; you have forty minutes of daylight to redraw the yard.',
    instruction: 'Provide usable routes to MILL and TEAM TRACK. Shared rail is cheaper than duplicate rail.', metricLabel: 'Rail laid', cols: 10, rows: 7, entry: [0, 3],
    exits: [{ id: 'mill', label: 'MILL', at: [9, 2], color: '#c19a5b' }, { id: 'team', label: 'TEAM', at: [9, 5], color: '#6e7f72' }],
    cars: [{ id: 'a', label: 'FLOUR', destination: 'mill', color: '#dfc99a' }, { id: 'b', label: 'TEAM', destination: 'team', color: '#829486' }, { id: 'c', label: 'FLOUR', destination: 'mill', color: '#dfc99a' }], blocked: [[6,1],[6,2],[6,3]],
  },
  {
    id: 'rail-5', number: 5, title: 'Across the Drain', sender: 'County engineer', date: 'JUN 7 1937',
    story: 'The drainage cut is staying. Bridge timber is not in the budget. Find a yard throat that serves both customers without crossing the blue stakes.',
    instruction: 'Route both cuts around the drainage reservation. Junctions emerge automatically where your track branches.', metricLabel: 'Rail laid', cols: 11, rows: 7, entry: [0, 3],
    exits: [{ id: 'lumber', label: 'LUMBER', at: [10, 1], color: '#9a6b46' }, { id: 'oil', label: 'OIL', at: [10, 5], color: '#2f3735' }],
    cars: [{ id: 'a', label: 'LUMBER', destination: 'lumber', color: '#a97c52' }, { id: 'b', label: 'OIL', destination: 'oil', color: '#414644' }], blocked: [[4,0],[4,1],[4,2],[4,3],[4,4],[5,4],[6,4]],
  },
  {
    id: 'rail-6', number: 6, title: 'Three Ways at Dawn', sender: 'M. Ruiz, dispatcher', date: 'JUN 23 1937',
    story: 'The new produce broker starts Monday. That makes three destinations from one inbound lead. The tower crew can route a car correctly only if a physical path exists.',
    instruction: 'Build one yard throat that reaches all three sidings.', metricLabel: 'Rail laid', cols: 11, rows: 8, entry: [0, 4],
    exits: [{ id: 'fruit', label: 'FRUIT', at: [10, 1], color: '#b85645' }, { id: 'mail', label: 'MAIL', at: [10, 4], color: '#c7b470' }, { id: 'stock', label: 'STOCK', at: [10, 7], color: '#6d7d55' }],
    cars: [{ id: 'a', label: 'FRUIT', destination: 'fruit', color: '#b85645' }, { id: 'b', label: 'MAIL', destination: 'mail', color: '#d7c984' }, { id: 'c', label: 'STOCK', destination: 'stock', color: '#7e8f63' }], blocked: [[5,2],[5,3],[5,4],[5,5]],
  },
  {
    id: 'rail-7', number: 7, title: 'Foundry Wall', sender: 'B. Klein, superintendent', date: 'JUL 14 1937',
    story: 'The foundry expanded its brick storehouse into our old ladder track. They paid for the land. They did not pay for a new yard.',
    instruction: 'Serve CASTINGS and SCRAP around the new masonry footprint.', metricLabel: 'Rail laid', cols: 12, rows: 8, entry: [0, 4],
    exits: [{ id: 'cast', label: 'CASTINGS', at: [11, 2], color: '#8f5a45' }, { id: 'scrap', label: 'SCRAP', at: [11, 6], color: '#5b6466' }],
    cars: [{ id: 'a', label: 'CAST', destination: 'cast', color: '#9b6550' }, { id: 'b', label: 'SCRAP', destination: 'scrap', color: '#687275' }], blocked: [[5,1],[6,1],[7,1],[5,2],[6,2],[7,2],[5,3],[6,3],[7,3]],
  },
  {
    id: 'rail-8', number: 8, title: 'No New Frog', sender: 'E. Malloy, yardmaster', date: 'AUG 1 1937',
    story: 'Purchasing rejected another crossing frog. Use the ground we already own. If two lines meet, they must share the junction instead of crossing through one another.',
    instruction: 'Reach all destinations. Track intersections become junctions, never grade crossings.', metricLabel: 'Rail laid', cols: 12, rows: 8, entry: [0, 4],
    exits: [{ id: 'a', label: 'DEPOT', at: [11, 1], color: '#b55c4b' }, { id: 'b', label: 'WAREHOUSE', at: [11, 4], color: '#7c866d' }, { id: 'c', label: 'COAL', at: [11, 7], color: '#4e4c48' }],
    cars: [{ id: '1', label: 'DEPOT', destination: 'a', color: '#c16b57' }, { id: '2', label: 'WARE', destination: 'b', color: '#879274' }, { id: '3', label: 'COAL', destination: 'c', color: '#595651' }], blocked: [[4,5],[5,5],[6,5],[7,5]],
  },
  {
    id: 'rail-9', number: 9, title: 'The Short Ladder', sender: 'B. Klein, superintendent', date: 'AUG 18 1937',
    story: 'Land values went up before our budget did. The board wants proof the three-track ladder can fit inside the parcel they already bought.',
    instruction: 'Serve three sidings inside the marked parcel. Every segment counts.', metricLabel: 'Rail laid', cols: 10, rows: 7, entry: [0, 3],
    exits: [{ id: 'a', label: 'A', at: [9, 1], color: '#a95245' }, { id: 'b', label: 'B', at: [9, 3], color: '#b79e5f' }, { id: 'c', label: 'C', at: [9, 5], color: '#6f8979' }],
    cars: [{ id: '1', label: 'A', destination: 'a', color: '#a95245' }, { id: '2', label: 'B', destination: 'b', color: '#b79e5f' }, { id: '3', label: 'C', destination: 'c', color: '#6f8979' }], blocked: [[2,0],[3,0],[4,0],[5,0],[6,0],[7,0],[2,6],[3,6],[4,6],[5,6],[6,6],[7,6]],
  },
  {
    id: 'rail-10', number: 10, title: 'Opening Day', sender: 'E. Malloy, yardmaster', date: 'SEP 6 1937',
    story: 'The new classification yard opens at sunrise. Four customers, one lead, no second chance to move the fence. Malloy left a bottle in the desk for whoever makes it work.',
    instruction: 'Build a compact yard that gives the tower a route to every consignee.', metricLabel: 'Rail laid', cols: 13, rows: 9, entry: [0, 4],
    exits: [{ id: 'mail', label: 'MAIL', at: [12, 1], color: '#d0b96e' }, { id: 'ice', label: 'ICE', at: [12, 3], color: '#74a1af' }, { id: 'mill', label: 'MILL', at: [12, 6], color: '#b68753' }, { id: 'coal', label: 'COAL', at: [12, 8], color: '#4f4d49' }],
    cars: [{ id: '1', label: 'MAIL', destination: 'mail', color: '#d0b96e' }, { id: '2', label: 'ICE', destination: 'ice', color: '#74a1af' }, { id: '3', label: 'MILL', destination: 'mill', color: '#b68753' }, { id: '4', label: 'COAL', destination: 'coal', color: '#4f4d49' }], blocked: [[5,2],[5,3],[5,4],[6,4],[7,4],[8,4],[8,5],[8,6]],
  },
];

export const binderyPuzzles: BinderyPuzzle[] = [
  { id:'bind-1', number:1, title:'A Four-Page Circular', sender:'M. Bellweather', date:'FEB 4 1925', story:'A grocer wants a little circular that opens like a book. The pressman imposed it correctly; the folder did not.', instruction:'Fold the sheet until page 1 is on the front and page 4 is on the back. Click an edge arrow to fold that side inward.', metricLabel:'Folds', rows:1, cols:2, front:[4,1], back:[2,3], targetTop:1, targetBottom:4, targetLeaves:2 },
  { id:'bind-2', number:2, title:'The Church Bulletin', sender:'M. Bellweather', date:'FEB 12 1925', story:'Reverend Pike brought back half the run. Page two is outside where the hymn list should be. Do the dummy before we waste another ream.', instruction:'Make a four-leaf signature with page 1 on top and page 8 on the back.', metricLabel:'Folds', rows:2, cols:2, front:[8,1,6,3], back:[2,7,4,5], targetTop:1, targetBottom:8, targetLeaves:4 },
  { id:'bind-3', number:3, title:'Railway Timetable', sender:'C. Dane, Erie & Western', date:'MAR 1 1925', story:'Conductors need a timetable small enough for a vest pocket but large enough to read when opened. The printer gave us a long sheet.', instruction:'Fold the strip into a four-leaf packet, page 1 outside front and page 8 outside back.', metricLabel:'Folds', rows:1, cols:4, front:[8,1,6,3], back:[2,7,4,5], targetTop:1, targetBottom:8, targetLeaves:4 },
  { id:'bind-4', number:4, title:'The Seed List', sender:'Harlow Seed Co.', date:'MAR 19 1925', story:'Harlow wants the order blank in the center spread so customers can tear it out without losing the catalog cover.', instruction:'Fold the imposed sheet into an eight-leaf signature with the numbered covers outside.', metricLabel:'Folds', rows:2, cols:4, front:[16,1,14,3,12,5,10,7], back:[2,15,4,13,6,11,8,9], targetTop:1, targetBottom:16, targetLeaves:8 },
  { id:'bind-5', number:5, title:'A Map for Tourists', sender:'Lake County Motor Club', date:'APR 6 1925', story:'The motor club insists the road map open wide but collapse to one glove-box panel. They do not care which fold happens first. We do.', instruction:'Collapse the sheet to one panel with cover 1 up and back 8 down.', metricLabel:'Folds', rows:2, cols:2, front:[8,1,6,3], back:[2,7,4,5], targetTop:1, targetBottom:8, targetLeaves:4 },
  { id:'bind-6', number:6, title:'The Opera Program', sender:'Orpheum Theatre', date:'APR 24 1925', story:'The printer changed paper grain and the old folding order scuffs the black title panel. Find a different sequence that lands on the same finished program.', instruction:'Finish with page 1 on top and page 16 on the back. Several fold orders work.', metricLabel:'Folds', rows:2, cols:4, front:[16,1,14,3,12,5,10,7], back:[2,15,4,13,6,11,8,9], targetTop:1, targetBottom:16, targetLeaves:8 },
  { id:'bind-7', number:7, title:'Pocket Almanac', sender:'R. Vale & Sons', date:'MAY 10 1925', story:'Vale wants sixteen pages from one side-and-turn form. The sample is elegant. The foreman says the fold sequence is impossible. Settle it.', instruction:'Produce a sixteen-page signature with the numbered covers outside.', metricLabel:'Folds', rows:4, cols:4, front:[32,1,30,3,28,5,26,7,24,9,22,11,20,13,18,15], back:[2,31,4,29,6,27,8,25,10,23,12,21,14,19,16,17], targetTop:1, targetBottom:32, targetLeaves:16 },
  { id:'bind-8', number:8, title:'Two-Up Invitation', sender:'Mrs. A. Mercer', date:'MAY 28 1925', story:'Mrs. Mercer is paying for good stock and refuses to pay for waste. Two invitations are imposed together; one finished packet must present the proper face.', instruction:'Fold to the approved outside faces without cutting the sheet.', metricLabel:'Folds', rows:2, cols:4, front:[16,1,14,3,12,5,10,7], back:[2,15,4,13,6,11,8,9], targetTop:1, targetBottom:16, targetLeaves:8 },
  { id:'bind-9', number:9, title:'The Union Rules', sender:'Local 317', date:'JUN 15 1925', story:'The union wants a pocket rules booklet by Friday and the compositor has already locked the form. Nothing moves except the paper.', instruction:'Find a fold sequence that puts the first and last pages outside.', metricLabel:'Folds', rows:4, cols:4, front:[32,1,30,3,28,5,26,7,24,9,22,11,20,13,18,15], back:[2,31,4,29,6,27,8,25,10,23,12,21,14,19,16,17], targetTop:1, targetBottom:32, targetLeaves:16 },
  { id:'bind-10', number:10, title:'Bellweather No. 1000', sender:'M. Bellweather', date:'JUL 1 1925', story:'Our thousandth job is our own specimen book. No customer to blame, no deadline to hide behind. Make the fold feel inevitable.', instruction:'Finish the sixteen-leaf signature cleanly. This is the shop test.', metricLabel:'Folds', rows:4, cols:4, front:[32,1,30,3,28,5,26,7,24,9,22,11,20,13,18,15], back:[2,31,4,29,6,27,8,25,10,23,12,21,14,19,16,17], targetTop:1, targetBottom:32, targetLeaves:16 },
];

export const riggingPuzzles: RiggingPuzzle[] = Array.from({ length: 10 }, (_, i) => {
  const defs = [
    ['The House Curtain','L. March, head carpenter','The new house curtain is heavier than the old traveler. One flyman must be able to lift it without leaning his whole body into the line.','Reeve one continuous rope from HANDLINE to DEAD END. Use the available sheaves to keep effort at or below 180 lb.',600,180,4],
    ['The Painted Moon','D. Varga, scenic designer','The moon flat looks weightless from the house. Up here it is four hundred pounds of timber, muslin, and bad decisions.','Rig the moon so one operator can fly it on cue.',420,150,3],
    ['Act II Chandelier','L. March, head carpenter','The chandelier has to rise during applause. We have one quiet operator and no room for a second purchase line.','Reeve enough supporting parts to lift the chandelier under the effort limit.',720,190,4],
    ['The Garden Border','A. Chen, stage manager','The garden border must clear the sightline before the actors cross under it. The cue is short and the rope cannot rub the proscenium steel.','Rig the border, avoiding the marked obstruction.',360,120,3],
    ['Snow Cloth','L. March, head carpenter','The snow cloth is light but travels almost the full height of the loft. A heavy purchase would make the handline run absurdly far.','Meet the effort limit without using more supporting parts than necessary.',280,110,3],
    ['Touring Drop','C. Bell, road carpenter','The touring company brought a painted drop twice as heavy as promised. We cannot drill the grid for new hardware.','Use only the sheaves already hung in the loft.',800,210,4],
    ['The False Ceiling','A. Chen, stage manager','The ceiling piece flies just inches behind the border. A crossed line will saw against the neighboring set all week.','Rig a clean path with no rope through the obstruction.',650,180,4],
    ['Finale Banner','D. Varga, scenic designer','The finale banner is all surface area. It has to move smoothly enough that the audience never notices the machinery.','Find the simplest purchase that keeps hand effort below the limit.',520,145,4],
    ['The Brass Arch','L. March, head carpenter','The brass arch is the heaviest single piece in the show. Management refused a motor because motors can fail. Apparently people cannot.','Build a manual purchase that one flyman can actually haul.',980,190,6],
    ['Opening Night','A. Chen, stage manager','Every department gets one impossible request on opening night. Ours is a thousand-pound portal, one operator, and a cue that begins in darkness.','Reeve the cleanest safe purchase you can. If it works, the house opens.',1000,175,6],
  ][i] as [string,string,string,string,number,number,number];
  const [title,sender,story,instruction,load,maxEffort,supports] = defs;
  const fixed = Array.from({ length: Math.max(3, supports) }, (_, n) => ({ id:`F${n+1}`, x: 35 + n * (50 / Math.max(2, supports-1)), y: 20 + (n%2)*4 }));
  const moving = Array.from({ length: Math.max(2, Math.ceil(supports/2)) }, (_, n) => ({ id:`M${n+1}`, x: 45 + n * (35 / Math.max(1, Math.ceil(supports/2)-1)), y: 67 }));
  return { id:`rig-${i+1}`, number:i+1, title, sender, date:`${['SEP','SEP','OCT','OCT','NOV','NOV','DEC','DEC','JAN','JAN'][i]} ${3+i*3} 1956`, story, instruction, metricLabel:'Hand effort', load, pull:10, maxEffort, requiredTravel:18 + i*2, fixed, moving, obstacles: i>=3 ? [{x:61,y:34,w:8,h:20}] : [] };
});
