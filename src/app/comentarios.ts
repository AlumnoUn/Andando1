import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Comentario } from './models';
import { Observable, forkJoin, of, firstValueFrom } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ComentariosService {
  private api = 'http://localhost:3000';

  constructor(private http: HttpClient) {}


  getComentariosPorReceta(recetaId: number | string): Observable<Comentario[]> {
    const params = new HttpParams()
      .set('recetaId', String(recetaId))
      .set('_sort', 'createdAt')
      .set('_order', 'asc'); 
    return this.http.get<Comentario[]>(`${this.api}/comentarios`, { params });
  }


  addComentario(recetaId: number | string, usuarioId: number | string, texto: string): Observable<Comentario> {
    const payload: Partial<Comentario> = {
      recetaId: String(recetaId),
      usuarioId: String(usuarioId),
      texto,
      createdAt: new Date().toISOString()
    };
    return this.http.post<Comentario>(`${this.api}/comentarios`, payload);
  }


  editarComentario(id: number | string, texto: string) {
    const payload = { texto, editedAt: new Date().toISOString() };
    return this.http.patch<Comentario>(`${this.api}/comentarios/${id}`, payload);
  }

  eliminarComentario(id: number | string) {
    return this.http.delete<void>(`${this.api}/comentarios/${id}`);
  }

  getComentariosPorUsuario(usuarioId: number | string): Observable<Comentario[]> {
    const params = new HttpParams().set('usuarioId', String(usuarioId)).set('_sort','createdAt').set('_order','desc');
    return this.http.get<Comentario[]>(`${this.api}/comentarios`, { params });
  }

  removeComentariosByRecetaId(recetaId: number | string): Observable<void> {
    return this.getComentariosPorReceta(recetaId).pipe(
      switchMap(coms => {
        if (!coms || coms.length === 0) return of(void 0);
        const deletes = coms.map(c => this.http.delete<void>(`${this.api}/comentarios/${c.id}`));
        return forkJoin(deletes).pipe(map(() => void 0));
      })
    );
  }
}
