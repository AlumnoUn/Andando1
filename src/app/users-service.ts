import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from './models';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private http = inject(HttpClient);
  private api = 'http://localhost:3000';

  private cache = new Map<string, User>();

  getCachedUser(id: number | string): User | undefined {
    return this.cache.get(String(id));
  }

  getUserById(id: number | string): Observable<User | null> {
    const key = String(id);
    const cached = this.cache.get(key);
    if (cached) {
      return of(cached);
    }
    return this.http.get<User>(`${this.api}/users/${key}`).pipe(
      tap(u => {
        if (u) this.cache.set(key, u);
      }),
      catchError(err => {
        // si no existe o error, devuelve null y no rompe
        console.warn('UsersService.getUserById error', err);
        return of(null);
      })
    );
  }
  
  preloadUsers(ids: Array<number | string>) {
    const uniq = Array.from(new Set((ids || []).map(i => String(i))));
    uniq.forEach(id => {
      if (!this.cache.has(id)) {
        this.getUserById(id).subscribe();
      }
    });
  }
}
