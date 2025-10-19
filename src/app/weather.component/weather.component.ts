import { CommonModule } from '@angular/common';
import { Component, Signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WeatherService } from '../services/weather.service';
import { WeatherModel } from '../models/weather.model';
import { ErrorModel } from '../models/error.model';
import { computed, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { CurrentDay } from '../models/currentDay';

@Component({
  selector: 'app-weather',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    MatCardModule
  ],
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.css']
})
export class WeatherComponent {
  private weatherService: WeatherService;
  weatherDataBase = signal<WeatherModel[]>([]);
  currentDayData = signal<CurrentDay>({ 
    currentTime: '', temperature: NaN , 
    iconBaseUri: '', 
    wheatherCondition: '' 
  });
  unit = signal<'C' | 'F'>('C');
  loading = signal<boolean>(false);
  error = signal<ErrorModel | null>(null);
  
  constructor(weatherService: WeatherService) {
    this.weatherService = weatherService;
  }

   get weatherData() {
    return computed(() => {
      if (this.unit() === 'C') return this.weatherDataBase();
      return this.weatherDataBase().map(d => ({
        ...d,
        maxTemperature: this.celsiusToFahrenheit(d.maxTemperature),
        minTemperature: this.celsiusToFahrenheit(d.minTemperature),
        feelsLikeMaxTemperature: this.celsiusToFahrenheit(d.feelsLikeMaxTemperature),
        feelsLikeMinTemperature: this.celsiusToFahrenheit(d.feelsLikeMinTemperature),
      }));
    });
  }

  
  get currentDay() {
    return computed(() => {
      const data = this.currentDayData();
      if (this.unit() === 'C') return data;
      return {
        ...data,
        temperature: this.celsiusToFahrenheit(data.temperature),
      };
    });
  }

  get currentTemperature() {
    return computed(() => Math.round(this.currentDay().temperature));
  }

  get currentIconUri() {
    return computed(() => this.currentDay().iconBaseUri?.concat('.png') || '');
  }

  get reformatWeatherCondition() {
    return computed(() => {
      const condition = this.currentDay().wheatherCondition;
      return condition ? this.reformatWord(true, condition) : '';
    });
  }

  get reformatDayName() {
    return computed(() => {
      const data = this.weatherDataBase();
      return data.length > 0 ? this.reformatWord(false, data[0].dayName) : '';
    });
  }

  ngOnInit() {
    this.loadWeatherPrognosis();
    this.loadCurrentDayWeather();
  }

  loadCurrentDayWeather() {
    this.weatherService.getCurrentDayWeather().subscribe({
      next: (data) => {
        console.log(data);
        this.currentDayData.set(data);
      },
      error: (error: ErrorModel) => {
        console.error(error);
        this.error.set(this.handleError(error));
      }
    });
  }

  loadWeatherPrognosis() {
    this.loading.set(true);
    this.weatherService.getWeatherData().subscribe({
      next: (data) => {
        console.log(data);
        this.weatherDataBase.set(data ?? []);
        this.error.set(null);
        this.loading.set(false);
      },
      error: (error: ErrorModel) => {
        console.error(error);
        this.weatherDataBase.set([]);
        this.error.set(this.handleError(error));
        this.loading.set(false);
      }
    });
  }

  handleError(error: ErrorModel): ErrorModel {
    const e: ErrorModel = { 
      code: error?.code ?? 0, 
      message: error?.message ?? 'Ocurrió un error inesperado.' 
    };
    switch (e.code) {
      case 400: e.message = 'Solicitud incorrecta. Verifica los parámetros.'; break;
      case 401: e.message = 'No autorizado. Verifica tu clave API.'; break;
      case 404: e.message = 'Recurso no encontrado.'; break;
      case 429: e.message = 'Demasiadas peticiones. Intenta más tarde.'; break;
      case 500: e.message = 'Error del servidor. Intenta nuevamente más tarde.'; break;
    }
    return e;
  }

  

  toggleUnit(unit: 'C' | 'F') {
    if (this.unit() !== unit) this.unit.set(unit);
  }

  private celsiusToFahrenheit(celsius: number): number {
    return (celsius * 9/5) + 32;
  }

  reformatWord(toLowerCase: boolean, word: string): string {
    if (!word) return '';
    var firstLetter = word.charAt(0).toUpperCase();
    var restOfWord = word.substring(1);
    return toLowerCase ? firstLetter.concat(restOfWord.toLowerCase()) : firstLetter.concat(restOfWord);
  }

}
