import { Component, Input, OnInit } from '@angular/core';
import { Player } from '../Constants/constants';

@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.css'],
})
export class UserInfoComponent implements OnInit {
  @Input() player: Player;
  @Input() currentPlayer: Player;

  constructor() {}

  ngOnInit(): void {}
}
