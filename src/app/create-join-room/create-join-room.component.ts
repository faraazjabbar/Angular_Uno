import { AngularFireDatabase } from '@angular/fire/database';
import { FirebaseService } from './../services/firebase.service';
import {
  GameRoom,
  Player,
  UnoActions,
  UnoColors,
} from './../Constants/constants';
import { GameService } from './../services/game.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-create-join-room',
  templateUrl: './create-join-room.component.html',
  styleUrls: ['./create-join-room.component.css'],
})
export class CreateJoinRoomComponent implements OnInit, OnDestroy {
  userName = '';
  roomId = '';
  createMode = true; // assume create mode default
  showError = false;

  constructor(
    private gameService: GameService,
    private fb: FirebaseService,
    private router: Router,
    private db: AngularFireDatabase
  ) {}

  ngOnInit(): void {}

  createRoom() {
    if (!this.userName) {
      this.showError = true;
      return;
    }
    this.showError = false;
    const player: Player = {
      id: Math.floor(Math.random() * (99999999 - 1000) + 1000),
      name: this.userName,
      deck: [],
    };
    this.gameService.loggedInUser = player;
    const randId = Math.floor(Math.random() * (9999 - 1000) + 1000);
    const gameRoom: GameRoom = {
      roomId: randId,
      createdAt: new Date().toString(),
      players: [player],
      currentCard: null,
      currentColor: null,
      direction: true,
      tableCards: [],
      currentPlayer: player,
      gameStarted: false,
      shuffledDeck: this.gameService.shuffleDeck(
        this.gameService.makeUnoDeck()
      ),
      creator: player,
    };
    console.log(gameRoom);
    this.fb.add<GameRoom>('/gameRooms', gameRoom).then((_) => {
      this.fb.get<GameRoom>('/gameRooms').subscribe((gameRooms) => {
        const gameObject = gameRooms.find(
          (gameRoom) => gameRoom.roomId === randId
        );
        this.gameService.roomId = randId;
        this.gameService.roomKey = gameObject?.key;
        localStorage.setItem('roomId', gameObject?.roomId.toString());
        localStorage.setItem('roomKey', gameObject?.key.toString());
        localStorage.setItem('loggedInUserId', player.id.toString());
        this.router.navigate(['room', randId]);
      });
    });
  }

  joinRoom() {
    if (!this.userName || !this.roomId) {
      this.showError = true;
      return;
    }
    this.showError = false;
    //To do
    //check whether room exists or not
    this.fb
      .get<GameRoom>('/gameRooms')
      .pipe(take(1))
      .subscribe((gameRooms) => {
        const gameObject = gameRooms.find(
          (gameRoom) => gameRoom.roomId === +this.roomId
        );
        if (!gameObject) {
          alert('Wrong Room Id');
          return;
        }
        this.gameService.roomId = gameObject?.roomId;
        this.gameService.roomKey = gameObject?.key;
        localStorage.setItem('roomId', gameObject?.roomId.toString());
        localStorage.setItem('roomKey', gameObject?.key.toString());

        const player: Player = {
          id: Math.floor(Math.random() * (99999999 - 1000) + 1000),
          name: this.userName,
          deck: [],
        };
        const players = [...gameObject.players];
        players.push(player);
        console.log(players);
        this.db
          .object('/gameRooms/' + this.gameService.getRoom().roomKey)
          .update({ players: players });
        this.gameService.loggedInUser = player;
        localStorage.setItem('roomId', gameObject?.roomId.toString());
        localStorage.setItem('roomKey', gameObject?.key.toString());
        localStorage.setItem('loggedInUserId', player.id.toString());

        this.router.navigate(['room', gameObject?.roomId]);
      });
  }

  toggleMode(): void {
    this.createMode = !this.createMode;
    this.showError = false;
  }
  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    console.log('destroyed');
  }
}
