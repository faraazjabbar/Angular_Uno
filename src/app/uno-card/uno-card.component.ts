import { Component, Input, OnInit } from '@angular/core';
import { UnoCard } from '../Constants/constants';

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
