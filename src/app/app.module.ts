import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { UnoCardComponent } from './uno-card/uno-card.component';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { AngularFireModule } from '@angular/fire';
import { AngularFireDatabaseModule } from '@angular/fire/database';

import { environment } from 'src/environments/environment';
import { GameRoomComponent } from './game-room/game-room.component';

@NgModule({
  declarations: [AppComponent, UnoCardComponent, GameRoomComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModalModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireDatabaseModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
