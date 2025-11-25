import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Receta } from './models';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { FavoritosService } from './favoritos';

@Injectable({ providedIn: 'root' })
export class RecetasService {
  private api = 'http://localhost:3000';

  constructor(private http: HttpClient, private favSvc: FavoritosService) {}

  getRecetas(page = 1, limit = 6, q?: string, categoria?: string): Observable<Receta[]> {
    let params = new HttpParams()
      .set('_page', String(page))
      .set('_limit', String(limit))
      .set('_sort', 'createdAt')
      .set('_order', 'desc');

    if (q) params = params.set('q', q);
    if (categoria) params = params.set('categoria', categoria);

    return this.http.get<Receta[]>(`${this.api}/recetas`, { params });
  }

  getAllRecetas(q?: string, categoria?: string): Observable<Receta[]> {
    let params = new HttpParams()
      .set('_sort', 'createdAt')
      .set('_order', 'desc');

    if (q) params = params.set('q', q);
    if (categoria) params = params.set('categoria', categoria);

    return this.http.get<Receta[]>(`${this.api}/recetas`, { params });
  }

  getReceta(id: number | string): Observable<Receta> {
    return this.http.get<Receta>(`${this.api}/recetas/${id}`);
  }

  crearReceta(receta: Partial<Receta>) {
    receta.createdAt = new Date().toISOString();
    return this.http.post<Receta>(`${this.api}/recetas`, receta);
  }

  editarReceta(id: number | string, receta: Partial<Receta>) {
    return this.http.put<Receta>(`${this.api}/recetas/${id}`, receta);
  }

  eliminarReceta(id: number | string) {
    return this.http.delete(`${this.api}/recetas/${id}`);
  }


  eliminarRecetaConFavoritos(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.api}/recetas/${id}`).pipe(
      switchMap(() => this.favSvc.removeFavoritosByRecetaId(id))
    );
  }

  getRecetasPorAutor(autorId: number | string): Observable<Receta[]> {
    const params = new HttpParams()
      .set('autorId', String(autorId))
      .set('_sort', 'createdAt')
      .set('_order', 'desc');
    return this.http.get<Receta[]>(`${this.api}/recetas`, { params });
  }

  getRecetasByIds(ids: Array<number | string>): Observable<Receta[]> {
    if (!ids || ids.length === 0) {
      return of([] as Receta[]);
    }

    const uniqIds = Array.from(new Set(ids.map(i => String(i))));
    const calls = uniqIds.map(id =>
      this.getReceta(id).pipe(
        catchError(err => {
          console.warn(`Receta ${id} no encontrada o error:`, err);
          return of(null as unknown as Receta | null);
        })
      )
    );

    return forkJoin(calls).pipe(map(arr => (arr || []).filter(Boolean) as Receta[]));
  }
}