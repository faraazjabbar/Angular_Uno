import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { GameRoomComponent } from './game-room/game-room.component';

const routes: Routes = [{ path: 'room/:roomId', component: GameRoomComponent }];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
