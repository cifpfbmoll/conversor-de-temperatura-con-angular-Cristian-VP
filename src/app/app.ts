import { Component, signal } from '@angular/core';
import { WeatherComponent } from './weather.component/weather.component';
import { MatCard, MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-root',
  imports: [
    WeatherComponent,
    MatCardModule
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent {
  protected readonly title = signal('Weather App');
}
