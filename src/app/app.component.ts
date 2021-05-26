import { Component } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';

type Value = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14;

enum UnoActions {
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
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  unoColors = UnoColors;
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
  currentColor: UnoColors;
  loggedInUser: Player;
  direction = true; // true for clockwise, false for anti-clockwise direction
  tableCards: UnoCard[] = [];
  showPass = false;
  constructor(
    config: NgbModalConfig,
    private modalService: NgbModal,
    private db: AngularFireDatabase
  ) {
    config.backdrop = 'static';
    config.keyboard = false;
  }
  ngOnInit() {
    this.makeUnoDeck();
    this.unoDeck = this.shuffleDeck(this.unoDeck);
    this.distributeCard(this.unoDeck, this.players);
    let firstCard: UnoCard = this.unoDeck.pop();
    while (firstCard.action !== UnoActions.NORMAL) {
      this.unoDeck.unshift(firstCard);
      firstCard = this.unoDeck.pop();
    }
    this.currentCard = firstCard;
    this.currentColor = this.currentCard.color;
    this.tableCards.push({
      ...this.currentCard,
      stackRotation: Math.floor(Math.random() * (40 - -40 + 1) + -40),
    });
    this.loggedInUser = this.players[0]; //assume
    this.currentPlayer = this.players[0]; // assume
  }
  openColorPicker(content) {
    this.modalService
      .open(content, { animation: true, centered: true })
      .result.then((color) => {
        this.currentColor = color;
        this.tableCards[this.tableCards.length - 1].color = this.currentColor;
      });
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
          unoCard.color = UnoColors.BLACK;
        }
        if (num === 14) {
          unoCard.action = UnoActions.DRAWFOUR;
          unoCard.color = UnoColors.BLACK;
        }
        this.unoDeck.push(unoCard);
      });
    });
  }
  alert(msg) {
    alert(msg);
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
    // players.forEach((player) =>
    //   player.deck.sort((a, b) => (a.color - b.value ? 1 : -1))
    // );
  }

  onPlayingCard(card: UnoCard, cardIndex: number, id: number, content): void {
    if (id !== this.currentPlayer?.id) return;
    if (
      card.color !== UnoColors.BLACK &&
      this.currentColor !== card?.color &&
      this.currentCard?.value !== card?.value
    ) {
      alert('The card is not valid');
      return;
    }

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
    this.onCommon(card, cardIndex);

    if (card.action === UnoActions.NORMAL) {
      this.moveToNextPlayer();
      return;
    }
    if (card.action === UnoActions.SKIP) {
      if (this.players.length !== 2) {
        this.moveToNextPlayer();
        this.moveToNextPlayer();
      }
      return;
    }
    if (card.action === UnoActions.REVERSE) {
      if (this.players.length !== 2) {
        this.onReverse();
        this.moveToNextPlayer();
      }
      return;
    }
    if (card.action === UnoActions.DRAWTWO) {
      // Solution 1: moveToNextPlayer + add 2 cards + moveToNextPlayer (current implementation)
      // Solution 2: add 2 cards to next player + skipNextPlayer
      this.moveToNextPlayer();
      this.onDrawOne();
      this.onDrawOne();
      this.moveToNextPlayer();
      return;
    }
    if (card.action === UnoActions.WILD) {
      this.onWild(content);
      this.moveToNextPlayer();
      return;
    }
    if (card.action === UnoActions.DRAWFOUR) {
      // Solution 1: moveToNextPlayer + add 4 cards(2 drawTwo) + moveToNextPlayer (current implementation)
      // Solution 2: add 4 cards to next player + skipNextPlayer
      this.onWild(content);
      this.moveToNextPlayer();
      this.onDrawOne();
      this.onDrawOne();
      this.onDrawOne();
      this.onDrawOne();
      this.moveToNextPlayer();
    }
  }

  onCommon(card: UnoCard, cardIndex: number) {
    this.showPass = false;
    // Common Gameplay:
    // Remove played 'card' from the 'currentPlayer's deck'
    this.currentPlayer.deck.splice(cardIndex, 1);
    // Add the 'currentCard' to 'tableCards' (indicating below the current card)
    this.tableCards.push({
      ...card,
      stackRotation: Math.floor(Math.random() * (20 - -40 + 1) + -40),
    });
    // Change the 'currentCard' to the 'card' played
    this.currentCard = card;
    this.currentColor = this.currentCard.color;
    if (!this.currentPlayer.deck.length) alert('Player Won');
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

  onWild(content) {
    // Ask color, set current color
    this.openColorPicker(content);
  }

  onDrawOne(showPass = false) {
    // Add one card from 'unoDeck' to 'currentPlayer's deck'
    if (this.showPass) return;
    this.currentPlayer.deck.push(this.unoDeck.pop());
    this.showPass = showPass;
  }
}
