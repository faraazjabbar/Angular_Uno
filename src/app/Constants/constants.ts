export type Value =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14;
export const FourPairs: Value[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
export const TwoPairs: Value[] = [0, 13, 14];
export enum UnoActions {
  NORMAL = 'normal',
  SKIP = 'skip',
  REVERSE = 'reverse',
  DRAWTWO = 'drawtwo',
  WILD = 'wild',
  DRAWFOUR = 'drawfour',
}
export enum UnoColors {
  RED = 'red',
  YELLOW = 'yellow',
  GREEN = 'green',
  BLUE = 'blue',
  BLACK = 'black',
}
export interface Player {
  id: number;
  name: string;
  deck: UnoCard[];
}
export interface UnoCard {
  value: Value;
  color: UnoColors;
  action: UnoActions;
  stackRotation?: number;
}
export const Colors: UnoColors[] = [
  UnoColors.RED,
  UnoColors.YELLOW,
  UnoColors.GREEN,
  UnoColors.BLUE,
];
export const SpecialActions: UnoActions[] = [
  UnoActions.SKIP,
  UnoActions.REVERSE,
  UnoActions.DRAWTWO,
  UnoActions.WILD,
  UnoActions.DRAWFOUR,
];
