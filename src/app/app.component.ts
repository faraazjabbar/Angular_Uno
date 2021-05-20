import { Component } from '@angular/core';

type Value = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14;

enum UnoActions {
  NORMAL = 'normal',
  SKIP = 'skip',
  REVERSE = 'reverse',
  DRAWTWO = 'drawtwo',
  WILD = 'wild',
  DRAWFOUR = 'drawfour',
}
enum UnoColors {
  RED = 'red',
  YELLOW = 'yellow',
  GREEN = 'green',
  BLUE = 'blue',
}
export interface Player {
  name: string;
  deck: UnoCard[];
}
export interface UnoCard {
  value: Value;
  color: UnoColors;
  action: UnoActions;
}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'Angular-uno';
  card: UnoCard;
  fourPairs: Value[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  twoPairs: Value[] = [0, 13, 14];
  colors: UnoColors[] = [
    UnoColors.RED,
    UnoColors.YELLOW,
    UnoColors.GREEN,
    UnoColors.BLUE,
  ];
  specialActions: UnoActions[] = [
    UnoActions.SKIP,
    UnoActions.REVERSE,
    UnoActions.DRAWTWO,
    UnoActions.WILD,
    UnoActions.DRAWFOUR,
  ];
  UnoDeck: UnoCard[] = [];
  Players: Player[] = [
    { name: 'Linga', deck: [] },
    { name: 'Faraaz', deck: [] },
  ];
  ngOnInit() {
    this.makeUnoDeck();
    this.UnoDeck = this.shuffleDeck(this.UnoDeck);
  }
  makeUnoDeck() {
    this.colors.forEach((color) => {
      this.fourPairs.forEach((num) => {
        const unoCard: UnoCard = {
          value: num,
          color: color,
          action: UnoActions.NORMAL,
        };
        if (num === 10) unoCard.action = UnoActions.SKIP;
        if (num === 11) unoCard.action = UnoActions.REVERSE;
        if (num === 12) unoCard.action = UnoActions.DRAWTWO;
        this.UnoDeck.push(unoCard);
      });
    });
    this.UnoDeck = this.UnoDeck.concat(this.UnoDeck);
    this.colors.forEach((color) => {
      this.twoPairs.forEach((num) => {
        const unoCard: UnoCard = {
          value: num,
          color: color,
          action: UnoActions.NORMAL,
        };
        if (num === 13) {
          unoCard.action = UnoActions.WILD;
          unoCard.color = null;
        }
        if (num === 14) {
          unoCard.action = UnoActions.DRAWFOUR;
          unoCard.color = null;
        }
        this.UnoDeck.push(unoCard);
      });
    });
  }
  shuffleDeck(unshuffled: any[]) {
    return unshuffled
      .map((a) => ({ sort: Math.random(), value: a }))
      .sort((a, b) => a.sort - b.sort)
      .map((a) => a.value);
  }
  distributeCard(cardDeck, players) {}
}
