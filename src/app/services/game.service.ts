import { Injectable } from '@angular/core';
import {
  Colors,
  FourPairs,
  Player,
  TwoPairs,
  UnoActions,
  UnoCard,
  UnoColors,
} from '../Constants/constants';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  loggedInUser: Player;
  roomKey: string;
  roomId: number;
  constructor() {}
  makeUnoDeck(): UnoCard[] {
    let unoDeck: UnoCard[] = [];
    Colors.forEach((color) => {
      FourPairs.forEach((num) => {
        const unoCard: UnoCard = {
          value: num,
          color: color,
          action: UnoActions.NORMAL,
        };
        if (num === 10) unoCard.action = UnoActions.SKIP;
        if (num === 11) unoCard.action = UnoActions.REVERSE;
        if (num === 12) unoCard.action = UnoActions.DRAWTWO;
        unoDeck.push(unoCard);
      });
    });
    unoDeck = unoDeck.concat(unoDeck);
    Colors.forEach((color) => {
      TwoPairs.forEach((num) => {
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
        unoDeck.push(unoCard);
      });
    });
    return unoDeck;
  }
  shuffleDeck(unshuffled: UnoCard[]): UnoCard[] {
    return unshuffled
      .map((a) => ({ sort: Math.random(), value: a }))
      .sort((a, b) => a.sort - b.sort)
      .map((a) => a.value);
  }
  distributeCards(cardDeck: UnoCard[], players: Player[]) {
    players.map((player) => (player.deck = []));
    for (let i = 1; i <= 7; i++) {
      players.forEach((player) => {
        player.deck.push(cardDeck.pop());
      });
    }
    return { cardDeck, players };
    // players.forEach((player) =>
    //   player.deck.sort((a, b) => (a.color - b.value ? 1 : -1))
    // );
  }
  getLoggedInUser() {
    return this.loggedInUser;
  }
  getRoom() {
    return { roomKey: this.roomKey, roomId: this.roomId };
  }
}
