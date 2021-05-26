import { UnoCard } from './../app.component';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-uno-card',
  templateUrl: './uno-card.component.html',
  styleUrls: ['./uno-card.component.css'],
})
export class UnoCardComponent implements OnInit {
  @Input() card: UnoCard;

  constructor() {}

  ngOnInit(): void {}
}
