import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { User } from '../models';
import { AuthService } from '../auth';
import { RecetasService } from '../recetas';

@Component({
  selector: 'app-perfil',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})

export class PerfilComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  
  private recetasSvc = inject(RecetasService);

  user: User | null = null;
  nombre = '';
  email = '';
  password = '';
  confirmPassword = '';

  loading = true;
  working = false;
  error: string | null = null;
  success: string | null = null;

  ngOnInit() {
    const u = this.auth.getUser();
    if (!u) {
      this.router.navigateByUrl('/login');
      return;
    }
    this.user = u;
    this.nombre = u.nombre;
    this.email = u.email;
    this.loading = false;
  }

  validar(): boolean {
    this.error = null;
    if (!this.nombre || !this.email) {
      this.error = 'Nombre y email son obligatorios.';
      return false;
    }
    if (this.password || this.confirmPassword) {
      if (this.password.length < 6) {
        this.error = 'La contraseña debe tener al menos 6 caracteres.';
        return false;
      }
      if (this.password !== this.confirmPassword) {
        this.error = 'Las contraseñas no coinciden.';
        return false;
      }
    }
    return true;
  }

  guardar() {
    if (!this.validar() || !this.user) return;
    this.working = true;
    this.success = null;

    const updates: Partial<User> = {
      nombre: this.nombre,
      email: this.email
    };

    const cambiarPass = !!(this.password && this.password.length >= 6);
    if (cambiarPass) {
      (updates as any).password = this.password;
    }

    this.auth.updateUser(this.user.id!, updates).subscribe({
      next: updated => {
        this.working = false;
        this.success = 'Perfil actualizado correctamente.';
        this.password = '';
        this.confirmPassword = '';

        
      },
      error: err => {
        console.error('Error actualizando perfil', err);
        this.working = false;
        this.error = 'Ocurrió un error al actualizar. Probá de nuevo.';
      }
    });
  }

  cancelar() {
    
    const u = this.auth.getUser();
    if (u) {
      this.nombre = u.nombre;
      this.email = u.email;
      this.password = '';
      this.confirmPassword = '';
      this.error = null;
      this.success = null;
    } else {
      this.router.navigateByUrl('/');
    }
  }
}