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
  id: number;
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
  unoDeck: UnoCard[] = [];
  players: Player[] = [
    { id: 1, name: 'Linga', deck: [] },
    { id: 2, name: 'Faraaz', deck: [] },
  ];
  currentCard: UnoCard;
  currentPlayer: Player;
  loggedInUser: Player;
  direction = true; // true for clockwise, false for anti-clockwise direction
  tableCards: UnoCard[] = [];
  showPass = false;

  ngOnInit() {
    this.makeUnoDeck();
    this.unoDeck = this.shuffleDeck(this.unoDeck);
    this.distributeCard(this.unoDeck, this.players);
    this.currentCard = this.unoDeck.pop();
    this.loggedInUser = this.players[0]; //assume
    this.currentPlayer = this.players[0]; // assume
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
        this.unoDeck.push(unoCard);
      });
    });
    this.unoDeck = this.unoDeck.concat(this.unoDeck);
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
        this.unoDeck.push(unoCard);
      });
    });
  }

  shuffleDeck(unshuffled: UnoCard[]): UnoCard[] {
    return unshuffled
      .map((a) => ({ sort: Math.random(), value: a }))
      .sort((a, b) => a.sort - b.sort)
      .map((a) => a.value);
  }

  distributeCard(cardDeck: UnoCard[], players: Player[]) {
    for (let i = 1; i <= 7; i++) {
      players.forEach((player) => {
        player.deck.push(cardDeck.pop());
      });
    }
  }

  onPlayingCard(card: UnoCard, cardIndex: number): void {
    this.showPass = false;
    /* action:
        normal -> onCommon + moveToNextPlayer
        skip -> onCommon + skipNextPlayer
        reverse -> onCommon + onReverse +  moveToNextPlayer
        drawTwo -> onCommon + onDrawTwo + skipNextPlayer
        wild -> onCommon + onWild + moveToNextPlayer
        drawFour -> onCommon + onDrawFour + onWild + skipNextPlayer
     */
    // skipNextPlayer -> 2*moveToNextPlayer
    // onDrawFour -> 2*onDrawTwo
    // onDrawTwo -> 2*onDrawOne - showPass condition
    if (card.action === UnoActions.NORMAL) {
      this.onCommon(card, cardIndex);
      this.moveToNextPlayer();
      return;
    }
    if (card.action === UnoActions.SKIP) {
      this.onCommon(card, cardIndex);
      if (this.players.length !== 2) {
        this.moveToNextPlayer();
        this.moveToNextPlayer();
      }
      return;
    }
    if (card.action === UnoActions.REVERSE) {
      this.onCommon(card, cardIndex);
      if (this.players.length !== 2) {
        this.onReverse();
        this.moveToNextPlayer();
      }
      return;
    }
    if (card.action === UnoActions.DRAWTWO) {
      this.onCommon(card, cardIndex);
      // Solution 1: moveToNextPlayer + add 2 cards + moveToNextPlayer (current implementation)
      // Solution 2: add 2 cards to next player + skipNextPlayer
      this.moveToNextPlayer();
      this.onDrawOne();
      this.onDrawOne();
      this.moveToNextPlayer();
      return;
    }
    if (card.action === UnoActions.WILD) {
      this.onCommon(card, cardIndex);
      this.onWild();
      this.moveToNextPlayer();
      return;
    }
    if (card.action === UnoActions.DRAWFOUR) {
      this.onCommon(card, cardIndex);
      // Solution 1: moveToNextPlayer + add 4 cards(2 drawTwo) + moveToNextPlayer (current implementation)
      // Solution 2: add 4 cards to next player + skipNextPlayer
      this.moveToNextPlayer();
      this.onDrawOne();
      this.onDrawOne();
      this.onDrawOne();
      this.onDrawOne();
      this.onWild();
      this.moveToNextPlayer();
    }
  }

  onCommon(card: UnoCard, cardIndex: number) {
    // Common Gameplay:
    // Remove played 'card' from the 'currentPlayer's deck'
    this.currentPlayer.deck.splice(cardIndex, 1);
    // Add the 'currentCard' to 'tableCards' (indicating below the current card)
    this.tableCards.unshift(this.currentCard);
    // Change the 'currentCard' to the 'card' played
    this.currentCard = card;
  }

  moveToNextPlayer() {
    this.showPass = false;
    const currentPlayerIndex = this.players.findIndex(
      (player) => player.id === this.currentPlayer.id
    );
    // Change the current player based on direction
    if (this.direction) {
      // clockwise
      this.currentPlayer =
        this.players[(currentPlayerIndex + 1) % this.players.length];
    } else {
      // anti-clockwise
      this.currentPlayer = currentPlayerIndex
        ? this.players[currentPlayerIndex - 1]
        : this.players[this.players.length - 1];
    }
  }

  onReverse() {
    // Change direction
    this.direction = !this.direction;
  }

  onWild() {
    // Ask color, set current color
  }

  onDrawOne(showPass = false) {
    // Add one card from 'unoDeck' to 'currentPlayer's deck'
    this.currentPlayer.deck.push(this.unoDeck.pop());
    this.showPass = showPass;
  }
}
