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
import { CreateJoinRoomComponent } from './create-join-room/create-join-room.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
    UnoCardComponent,
    GameRoomComponent,
    CreateJoinRoomComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModalModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireDatabaseModule,
    FormsModule,
    HttpClientModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
