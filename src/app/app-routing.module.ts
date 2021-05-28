import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateJoinRoomComponent } from './create-join-room/create-join-room.component';

import { GameRoomComponent } from './game-room/game-room.component';

const routes: Routes = [
  { path: '', component: CreateJoinRoomComponent },
  { path: 'room/:roomId', component: GameRoomComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
