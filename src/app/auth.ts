import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from './models';
import { Observable, of } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private api = 'http://localhost:3000';
  private storageKey = 'cocina_user';

  // LOGIN  retorna Promise<User|null> para que await this.auth.login(...) funcione
  async login(email: string, password: string): Promise<User | null> {
    const url = `${this.api}/users`;
    
    const params: any = { email, password };
    try {
      const arr = await firstValueFrom(this.http.get<User[]>(url, { params }));
      const user = arr && arr.length ? arr[0] : null;
      if (user) this.saveLocalUser(user);
      return user;
    } catch (err) {
      console.error('AuthService.login error', err);
      return null;
    }
  }


  async register(payload: Partial<User>): Promise<User> {
    const url = `${this.api}/users`;
    const body = { ...payload, role: payload.role ?? 'user' };
    const created = await firstValueFrom(this.http.post<User>(url, body));
    this.saveLocalUser(created);
    return created;
  }

  logout() {
    localStorage.removeItem(this.storageKey);
  }

  getUser(): User | null {
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? JSON.parse(raw) as User : null;
    } catch {
      return null;
    }
  }

  isLoggedIn(): boolean {
    return !!this.getUser();
  }

  // updateUser y changePassword devuelven Observable porque el Perfil usa subscribe
  updateUser(id: number | string, payload: Partial<User>): Observable<User> {
    const url = `${this.api}/users/${id}`;
    return this.http.patch<User>(url, payload).pipe(
      tap(updated => {
        const local = this.getUser();
        if (local && String(local.id) === String(id)) {
          const merged: User = { ...local, ...updated };
          this.saveLocalUser(merged);
        }
      })
    );
  }

  changePassword(id: number | string, newPassword: string): Observable<User> {
    return this.updateUser(id, { password: newPassword });
  }

  private saveLocalUser(u: User) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(u));
    } catch (e) {
      console.error('No se pudo guardar usuario en localStorage', e);
    }
  }
}
