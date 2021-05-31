import { FirebaseService } from './../services/firebase.service';
import { GameService } from './../services/game.service';
import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { ActivatedRoute } from '@angular/router';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import {
  Player,
  UnoActions,
  GameRoom,
  UnoCard,
  UnoColors,
} from '../Constants/constants';

@Component({
  selector: 'app-game-room',
  templateUrl: './game-room.component.html',
  styleUrls: ['./game-room.component.css'],
})
export class GameRoomComponent implements OnInit {
  roomId = '';
  unoColors = UnoColors;
  title = 'Angular-uno';
  card: UnoCard;
  unoDeck: UnoCard[] = [];
  players: Player[] = [
    { id: 1, name: 'Linga', deck: [] },
    { id: 2, name: 'Faraaz', deck: [] },
    { id: 3, name: 'Sunil', deck: [] },
  ];
  currentCard: UnoCard;
  currentPlayer: Player;
  currentColor: UnoColors;
  loggedInUser: Player;
  direction = true; // true for clockwise, false for anti-clockwise direction
  tableCards: UnoCard[] = [];
  showPass = false;
  gameRoom: GameRoom;
  // loggedInDeck: UnoCard[];
  unoClicked = false;
  constructor(
    config: NgbModalConfig,
    private modalService: NgbModal,
    private db: AngularFireDatabase,
    private readonly activatedRoute: ActivatedRoute,
    private gameService: GameService,
    private fb: FirebaseService
  ) {
    config.backdrop = 'static';
    config.keyboard = false;
  }
  ngOnInit() {
    this.activatedRoute.params.subscribe((params) => {
      this.roomId = params?.roomId;
    });
    this.db
      .object<GameRoom>('/gameRooms/' + this.gameService.getRoom().roomKey)
      .snapshotChanges()
      .subscribe((gameRooms) => {
        this.gameRoom = { ...gameRooms.payload.val() };
        this.loggedInUser = this.gameRoom.players.find(
          (player) => player.id === this.loggedInUser.id
        );
      });

    // .subscribe((data) => console.log(data));
    this.unoDeck = this.gameService.shuffleDeck(this.gameService.makeUnoDeck());
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
    this.loggedInUser = this.gameService.getLoggedInUser(); //assume
    this.currentPlayer = this.players[0]; // assume
  }
  openColorPicker(content) {
    return this.modalService.open(content, { animation: true, centered: true })
      .result;
  }
  initiateGame() {
    const cardPlayers = this.gameService.distributeCards(
      this.gameRoom.shuffledDeck,
      this.gameRoom.players
    );
    let firstCard: UnoCard = cardPlayers.cardDeck.pop();
    while (firstCard.action !== UnoActions.NORMAL) {
      cardPlayers.cardDeck.unshift(firstCard);
      firstCard = cardPlayers.cardDeck.pop();
    }
    const currentCard = firstCard;
    const currentColor = currentCard.color;
    const tableCards = [
      {
        ...currentCard,
        stackRotation: Math.floor(Math.random() * (40 - -40 + 1) + -40),
      },
    ];
    const currentPlayer = cardPlayers.players[0];
    this.db
      .object<GameRoom>('/gameRooms/' + this.gameService.getRoom().roomKey)
      .update({
        players: cardPlayers.players,
        shuffledDeck: cardPlayers.cardDeck,
        gameStarted: true,
        tableCards,
        currentCard,
        currentColor,
        currentPlayer,
      });
  }
  alert(msg) {
    alert(msg);
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
    const gameRoom = { ...this.gameRoom };
    if (id !== gameRoom.currentPlayer?.id) return;
    if (
      card.color !== UnoColors.BLACK &&
      gameRoom.currentColor !== card?.color &&
      gameRoom.currentCard?.value !== card?.value
    ) {
      alert('The card is not valid');
      return;
    }
    if (
      this.loggedInUser?.deck?.length === 2 &&
      this.loggedInUser?.id === gameRoom?.currentPlayer?.id &&
      !this.unoClicked
    ) {
      this.onDrawOne();
      this.onDrawOne();
      this.unoClicked = false;
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
      this.db
        .object<GameRoom>('/gameRooms/' + this.gameService.getRoom().roomKey)
        .set(this.gameRoom);
      return;
    }
    if (card.action === UnoActions.SKIP) {
      if (this.players.length !== 2) {
        this.moveToNextPlayer();
        this.moveToNextPlayer();
        this.db
          .object<GameRoom>('/gameRooms/' + this.gameService.getRoom().roomKey)
          .set(this.gameRoom);
        return;
      }
    }
    if (card.action === UnoActions.REVERSE) {
      if (this.players.length !== 2) {
        this.onReverse();
        this.moveToNextPlayer();
        this.db
          .object<GameRoom>('/gameRooms/' + this.gameService.getRoom().roomKey)
          .set(this.gameRoom);
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
      this.db
        .object<GameRoom>('/gameRooms/' + this.gameService.getRoom().roomKey)
        .set(this.gameRoom);
      return;
    }
    if (card.action === UnoActions.WILD) {
      this.openColorPicker(content).then((color) => {
        this.gameRoom.currentColor = color;
        this.gameRoom.tableCards[this.gameRoom.tableCards.length - 1].color =
          this.gameRoom.currentColor;
        this.moveToNextPlayer();
        this.db
          .object<GameRoom>('/gameRooms/' + this.gameService.getRoom().roomKey)
          .set(this.gameRoom);
      });
    }
    if (card.action === UnoActions.DRAWFOUR) {
      // Solution 1: moveToNextPlayer + add 4 cards(2 drawTwo) + moveToNextPlayer (current implementation)
      // Solution 2: add 4 cards to next player + skipNextPlayer
      this.openColorPicker(content).then((color) => {
        this.gameRoom.currentColor = color;
        this.gameRoom.tableCards[this.gameRoom.tableCards.length - 1].color =
          this.gameRoom.currentColor;
        this.moveToNextPlayer();
        this.onDrawOne();
        this.onDrawOne();
        this.onDrawOne();
        this.onDrawOne();
        this.moveToNextPlayer();
        this.db
          .object<GameRoom>('/gameRooms/' + this.gameService.getRoom().roomKey)
          .set(this.gameRoom);
      });
    }
  }

  onCommon(card: UnoCard, cardIndex: number) {
    const currentPlayerIndex = this.gameRoom.players.findIndex(
      (player) => player.id === this.gameRoom.currentPlayer.id
    );
    this.showPass = false;
    // Common Gameplay:
    // Remove played 'card' from the 'currentPlayer's deck'
    this.gameRoom.players[currentPlayerIndex].deck.splice(cardIndex, 1);
    // Add the 'currentCard' to 'tableCards' (indicating below the current card)
    this.gameRoom.tableCards.push({
      ...card,
      stackRotation: Math.floor(Math.random() * (20 - -40 + 1) + -40),
    });
    // Change the 'currentCard' to the 'card' played
    this.gameRoom.currentCard = card;
    this.gameRoom.currentColor = this.gameRoom.currentCard.color;
    if (!this.gameRoom.players[currentPlayerIndex].deck.length)
      alert('Player Won');
  }

  moveToNextPlayer(pass: boolean = false) {
    this.showPass = false;
    const currentPlayerIndex = this.gameRoom.players.findIndex(
      (player) => player.id === this.gameRoom.currentPlayer.id
    );
    // Change the current player based on direction
    if (this.gameRoom.direction) {
      // clockwise
      this.gameRoom.currentPlayer =
        this.gameRoom.players[
          (currentPlayerIndex + 1) % this.gameRoom.players.length
        ];
    } else {
      // anti-clockwise
      this.gameRoom.currentPlayer = currentPlayerIndex
        ? this.gameRoom.players[currentPlayerIndex - 1]
        : this.gameRoom.players[this.gameRoom.players.length - 1];
    }
    if (pass)
      this.db
        .object<GameRoom>('/gameRooms/' + this.gameService.getRoom().roomKey)
        .set({
          ...this.gameRoom,
        });
  }

  onReverse() {
    // Change direction
    this.gameRoom.direction = !this.gameRoom.direction;
  }

  onWild(content) {
    // Ask color, set current color
    this.openColorPicker(content);
  }

  onDrawOne(showPass = false) {
    // Add one card from 'unoDeck' to 'currentPlayer's deck'
    if (this.showPass) return;
    const currentPlayerIndex = this.gameRoom.players.findIndex(
      (player) => player.id === this.gameRoom.currentPlayer.id
    );
    this.gameRoom.players[currentPlayerIndex].deck.push(
      this.gameRoom.shuffledDeck.pop()
    );
    this.showPass = showPass;
    if (showPass)
      this.db
        .object<GameRoom>('/gameRooms/' + this.gameService.getRoom().roomKey)
        .set({
          ...this.gameRoom,
        });
  }

  onUnoClicked(): void {
    this.unoClicked = true;
  }
}
