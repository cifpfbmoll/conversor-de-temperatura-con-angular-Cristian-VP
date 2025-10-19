// filepath: /workspaces/weather-temperature-conversor/temperature_conversor/src/app/app.routes.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WeatherComponent } from './weather.component/weather.component';

export const routes: Routes = [
  { path: '', component: WeatherComponent }, // Ruta principal
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }