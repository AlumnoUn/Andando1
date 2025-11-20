import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-registro',
  imports: [CommonModule, FormsModule],
  templateUrl: './registro.html',
  styleUrl:'./registro.css',
})
export class RegistroComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  nombre = '';
  email = '';
  password = '';
  error: string | null = null;

  async onSubmit() {
    this.error = null;
    if (this.password.length < 6) {
      this.error = 'La contraseña debe tener al menos 6 caracteres';
      return;
    }
    try {
      await this.auth.register({
      nombre: this.nombre,
      email: this.email,
      password: this.password,
      role: 'user'
});
      this.router.navigateByUrl('/');
    } catch (err: any) {
      this.error = String(err || 'Error en registro');
    }
  }
}
