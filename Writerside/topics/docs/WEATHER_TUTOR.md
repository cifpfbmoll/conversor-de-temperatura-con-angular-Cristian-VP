# Guía de tutor: Banner del tiempo — Contrato y pasos prácticos

Este documento recoge el "Contrato" (inputs/outputs) y los "Pasos prácticos" priorizados para implementar el banner del tiempo en el proyecto. Está pensado para conservar contexto entre sesiones y para que sigas la ruta de aprendizaje.

---

## 1) Contrato breve (servicio y componente)

### WeatherService
- Propósito: Encapsular la comunicación con la API de clima y transformar la respuesta en objetos que la UI consuma fácilmente.
- Entradas (métodos públicos):
  - `obtenerPronosticoPorCiudad(city: string, units?: 'metric'|'imperial')`
  - `obtenerPronosticoPorCoords(lat: number, lon: number, units?: 'metric'|'imperial')`
- Salidas:
  - `Observable<DiaPronostico[]>` o `Observable<WeatherModel>` (usar Observable para aprovechar RxJS y `async` en plantillas).
- Errores:
  - Emitir un Observable de error con forma `{ code: number, message: string }` o lanzar `HttpErrorResponse` manejable.
- Indicaciones:
  - No almacenar la API key en el repo. Leerla desde `environment` o pasarla como parámetro para prácticas locales.
  - Incluir `catchError` para transformar errores HTTP en mensajes legibles.

### WeatherComponent
- Propósito: UI / orquestador — pedir datos, gestionar estado (loading/error), mostrar el banner y permitir toggle C/°F.
- Estado público:
  - `pronosticoDias: DiaPronostico[]`
  - `unidad: 'C'|'F'` (o `'metric'|'imperial'` internamente)
  - `cargando: boolean`
  - `error: string | null`
- Comportamiento (métodos clave):
  - `ngOnInit()` → opcional: cargar datos por defecto o geolocalización.
  - `cargarPronostico()` → llama al servicio, activa `cargando`, maneja `error`.
  - `toggleUnidad()` → convierte en memoria todas las temperaturas (sin volver a llamar a la API).
- Errores y UX:
  - Validar ciudad vacía antes de enviar pedido.
  - Mostrar spinner mientras `cargando` es true.
  - Mostrar snackbar/alert con mensaje en caso de error.

### DiaPronostico (modelo)
- Campos mínimos recomendados:
  - `fecha: Date`
  - `temperatura: number` (valor según unidad solicitada)
  - `descripcion: string`
  - `iconoClima: string` (código o `iconUrl` completo)
  - `humidity?: number`
  - `windSpeed?: number`

Sugerencia: incluir `tempC?` y `tempF?` si prefieres cachear ambas unidades.

---

## 2) Edge cases importantes
- Ciudad vacía: no llamar a la API; mostrar validación.
- Errores de red / 401 / 429 (rate limit): mostrar mensaje claro y no hacer retries infinitos.
- Respuesta con estructura inesperada: hacer `transformarRespuesta` robusto y defensivo.
- Geolocalización denegada: fallback a búsqueda por ciudad.
- Volúmenes de datos grandes: normalmente `forecast` por 7 días está bien; paginar/recortar si fuese necesario.

---

## 3) Pasos prácticos (priorizados)
A continuación los pasos ordenados por prioridad, cada uno con una breve explicación y nota de implementación.

1) Corregir decoradores / paths de plantillas
- Por qué: errores comunes en Angular al compilar si `templateUrl`/`styleUrls` apuntan a rutas erróneas o si usas `styleUrl` en singular.
- Qué hacer: en `src/app/weather/weather.ts` usar `templateUrl: './weather.component.html'` y `styleUrls: ['./weather.component.css']`. Añadir `standalone: true` si lo vas a usar como componente standalone en tests y rutas.

2) Proveer HttpClient
- Por qué: servicios usan `HttpClient`; sin `provideHttpClient()` o `HttpClientModule` la inyección falla.
- Qué hacer: en `src/app/app.config.ts` añadir `import { provideHttpClient } from '@angular/common/http'` y `provideHttpClient()` en `providers`.

3) Implementar `WeatherService`
- Inyectar `HttpClient`.
- Añadir `obtenerPronosticoPorCiudad` y `obtenerPronosticoPorCoords`.
- Construir URL (concatenando `apiKey`, parámetros, `units`).
- `transformarRespuesta(response)` que devuelva `DiaPronostico[]` o `WeatherModel`.
- Manejar errores con `catchError`.

4) Crear modelo `weather.model.ts` o `weather.ts`
- Definir `DiaPronostico`/`WeatherModel` con campos listados arriba.

5) Actualizar plantilla `weather.component.html`
- Input (texto) para ciudad + botón Buscar.
- Mostrar spinner si `cargando`.
- Mostrar `pronosticoDias` con `*ngFor` (tarjeta por día).
- Toggle unidad (C/F) que llama `toggleUnidad()`.

6) Implementar lógica de conversión en componente
- `celsiusAFahrenheit(c: number) => (c*9/5)+32`
- `fahrenheitACelsius(f: number) => (f-32)*5/9`
- `toggleUnidad()` debe transformar los valores en memoria y actualizar `unidad`.

7) Tests
- Servicio: usar `HttpClientTestingModule` + `HttpTestingController` para mockear respuestas y validar `transformarRespuesta`.
- Componente: mockear `WeatherService` o usar un stub con `of(mockData)` y verificar renderizado/estado.

8) Manejo de API Key y seguridad
- No subir la key a git.
- Opciones: `environment.ts` local (no trackear), leer de `window` en runtime inyectada por entorno, o pedir al usuario introducirla (bueno para prácticas).

---

## 4) Notas prácticas / URL y fórmulas
- Fórmulas de conversión de temperatura:
  - C → F: `(C × 9/5) + 32`
  - F → C: `(F − 32) × 5/9`
- Iconos (OpenWeatherMap): `https://openweathermap.org/img/wn/${icon}@2x.png`
- Endpoint ejemplo OpenWeatherMap (current weather):
  - `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${units}&appid=${apiKey}`
- Si quieres forecast de varios días usa `onecall` (requiere lat/lon) o el endpoint `/forecast`.

---

## 5) Archivo y rutas recomendadas en el proyecto
- `src/app/weather/weather.component.ts`  (componente standalone)
- `src/app/weather/weather.component.html`
- `src/app/weather/weather.component.css`
- `src/app/weather/weather.model.ts`
- `src/app/weather.service.ts` (servicio root)
- `src/app/app.config.ts` (añadir `provideHttpClient()` aquí)

---

## 6) Comandos útiles para pruebas y build (local)
- Ejecutar tests:
```
npm test
```
- Levantar app (dev server):
```
npm start
```
- Build:
```
npm run build
```

> Nota: el proyecto usa Angular Standalone (Angular 16+). Si `npm start` no está mapeado, usa `npx ng serve` o el script que tengas en `package.json`.

---

## 7) Próximos pasos sugeridos (para que siga tu aprendizaje)
1. Aplica las correcciones de paths y `provideHttpClient()` (muy rápido y te permite inyectar `HttpClient`).
2. Implementa `WeatherService` mínimo que haga una petición con una API key pasada manualmente. Prueba con `HttpClientTestingModule`.
3. Implementa plantilla básica del componente y el toggle de unidades.
4. Añade tests unitarios simples (servicio + componente).
5. Mejora UX: manejo de errores, accesibilidad, estilos.

---

## 8) Referencias rápidas
- OpenWeatherMap docs: https://openweathermap.org/api
- Angular HttpClient: https://angular.io/guide/http
- RxJS: https://rxjs.dev/guide/overview

---

Guarda este archivo. Si quieres, ahora puedo darte el primer snippet para corregir el `Weather` component (decorator) y el snippet para `app.config.ts` (añadir `provideHttpClient()`) para que los pegues tú mismo.
