import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Favorito } from './models';
import { Observable, firstValueFrom, forkJoin, of } from 'rxjs';
import{map, switchMap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class FavoritosService {
  private api = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getFavoritosPorUsuario(usuarioId: number | string): Observable<Favorito[]> {
    const params = new HttpParams()
      .set('usuarioId', String(usuarioId))
      .set('_sort', 'createdAt')
      .set('_order', 'desc');
    return this.http.get<Favorito[]>(`${this.api}/favoritos`, { params });
  }

  getFavoritosPorReceta(recetaId: number | string): Observable<Favorito[]> {
    const params = new HttpParams()
      .set('recetaId', String(recetaId))
      .set('_sort', 'createdAt')
      .set('_order', 'desc');
    return this.http.get<Favorito[]>(`${this.api}/favoritos`, { params });
  }

  async findFavorito(usuarioId: number | string, recetaId: number | string): Promise<Favorito | undefined> {
    const params = new HttpParams()
      .set('usuarioId', String(usuarioId))
      .set('recetaId', String(recetaId));
    const url = `${this.api}/favoritos`;
    const favs = await firstValueFrom(this.http.get<Favorito[]>(url, { params }));
    return favs.length ? favs[0] : undefined;
  }

  addFavorito(usuarioId: number | string, recetaId: number | string): Observable<Favorito> {
    const payload: Partial<Favorito> = {
      usuarioId: String(usuarioId),
      recetaId: String(recetaId),
      createdAt: new Date().toISOString()
    };
    return this.http.post<Favorito>(`${this.api}/favoritos`, payload);
  }

  removeFavoritoById(favoritoId: number | string) {
    return this.http.delete<void>(`${this.api}/favoritos/${favoritoId}`);
  }

  async removeFavorito(usuarioId: number | string, recetaId: number | string): Promise<void> {
    const f = await this.findFavorito(usuarioId, recetaId);
    if (f) {
      await firstValueFrom(this.http.delete<void>(`${this.api}/favoritos/${f.id}`));
    }
  }

    removeFavoritosByRecetaId(recetaId: number | string): Observable<void> {

    return this.getFavoritosPorReceta(recetaId).pipe(
      switchMap(favs => {
        if (!favs || favs.length === 0) {

          return of(void 0);
        }
        const deletes = favs.map(f => this.http.delete<void>(`${this.api}/favoritos/${f.id}`));
        return forkJoin(deletes).pipe(map(() => void 0));
      })
    );
  }
}
