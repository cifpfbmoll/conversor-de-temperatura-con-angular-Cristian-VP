import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { WeatherModel } from '../models/weather.model';
import { catchError, map, tap } from 'rxjs/operators';
import { ErrorModel } from '../models/error.model';
import { environment } from '../../environments/apiKey';
import { CurrentDay } from '../models/currentDay';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private apiKey: string = environment.weatherApiKey;
  private apiForecastURL: string = 'https://weather.googleapis.com/v1/forecast/days:lookup';
  private apiCurrentURL: string = 'https://weather.googleapis.com/v1/currentConditions:lookup';
  private HttpClient: HttpClient;

  constructor(http: HttpClient) {
    this.HttpClient = http;
  }

  getCurrentDayWeather(): Observable<CurrentDay> {
    const params = new HttpParams()
      .set('key', this.apiKey)
      .set('location.latitude', '39.35486297645984')
      .set('location.longitude', '3.127796133857223')
      .set('languageCode', 'es');

    return this.HttpClient.get<any>(this.apiCurrentURL, { params }).pipe(
      tap(response => console.log('🌤️ Current Day RAW:', response)),
      map(response => this.refactorCurrentDayResponse(response)),
      tap(processed => console.log('🔄 Current Day Procesado:', processed)),
      catchError((error: HttpErrorResponse) => {
        const payload: ErrorModel = {
          code: error?.status ?? 0,
          message: error?.error?.error?.message ?? error?.message ?? 'Error desconocido'
        };
        return throwError(() => payload);
      })
    );
  }

  getWeatherData(): Observable<WeatherModel[]> {  
    const params = new HttpParams()
      .set('key', this.apiKey)
      .set('location.latitude', '39.35486297645984')
      .set('location.longitude', '3.127796133857223')
      .set('pageSize', '8')
      .set('languageCode', 'es');

    return this.HttpClient.get<any>(this.apiForecastURL, { params }).pipe(
      map(response => this.refactorWeatherResponse(response)),
      tap(processed => console.log('🔄 Forecast Procesado - Total:', processed.length)),
      catchError((error: HttpErrorResponse) => {
        const payload: ErrorModel = {
          code: error?.status ?? 0,
          message: error?.error?.error?.message ?? error?.message ?? 'Error desconocido'
        };
        return throwError(() => payload);
      })
    );
  } 

  private refactorCurrentDayResponse(response: any): CurrentDay {    
    const currentTime = response.currentTime 
      ? new Date(response.currentTime).toLocaleString('es-ES', {
          timeZone: 'Europe/Madrid',
          weekday: 'long',
          hour: '2-digit',
          minute: '2-digit'
        })
      : '';
    
    return {
      currentTime: currentTime,
      temperature: Number(response.temperature?.degrees ?? NaN),
      iconBaseUri: response.weatherCondition?.iconBaseUri || '',
      wheatherCondition: response.weatherCondition?.description?.text || ''
    };
  }

  private refactorWeatherResponse(response: any): WeatherModel[] {
    return response.forecastDays?.map((day: any) => ({
      displayDate: `${day.displayDate?.year}-${String(day.displayDate?.month).padStart(2, '0')}-${String(day.displayDate?.day).padStart(2, '0')}`,
      dayName: new Date(day.displayDate?.year, day.displayDate?.month - 1, day.displayDate?.day)
                .toLocaleDateString('es-ES', { weekday: 'long' }),
      daytimeForecast: day.daytimeForecast?.weatherCondition?.description?.text || '',
      weatherCondition: day.daytimeForecast?.weatherCondition?.type || '',
      maxTemperature: Math.round(Number(day.maxTemperature?.degrees ?? NaN)),
      minTemperature: Math.round(Number(day.minTemperature?.degrees ?? NaN)),
      feelsLikeMaxTemperature: Math.round(Number(day.feelsLikeMaxTemperature?.degrees ?? NaN)),
      feelsLikeMinTemperature: Math.round(Number(day.feelsLikeMinTemperature?.degrees ?? NaN)),
      iconBaseUri: day.daytimeForecast?.weatherCondition?.iconBaseUri || ''
    })) || [];
  }
}