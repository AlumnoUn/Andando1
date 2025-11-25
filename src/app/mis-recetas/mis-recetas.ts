import { Component, inject, OnInit } from '@angular/core';
import { RecetasService } from '../recetas';
import { AuthService } from '../auth';
import { Receta } from '../models';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-mis-recetas',
  imports: [CommonModule, RouterModule],
  templateUrl: './mis-recetas.html',
  styleUrl:'./mis-recetas.css', 
})

export class MisRecetasComponent implements OnInit {
  private recetasSvc = inject(RecetasService);
  private auth = inject(AuthService);
  private router = inject(Router);

  recetas: Receta[] = [];

  ngOnInit() {
    this.load();
  }

  load() {
    const user = this.auth.getUser();
    if (!user) {
      this.recetas = [];
      return;
    }

    this.recetasSvc.getRecetasPorAutor(user.id).subscribe({
      next: r => {
        const uid = String(user.id);
        const filtradas = (r || []).filter(rec => String(rec.autorId) === uid);
        this.recetas = filtradas;
        if ((r || []).length !== filtradas.length) {
          console.warn('MisRecetas: el backend devolvió elementos que no coinciden con autorId. Se filtraron en cliente.');
        }
      },
      error: e => {
        console.error('Error cargando mis recetas (backend). Intentando fallback.', e);
        this.recetasSvc.getAllRecetas().subscribe({
          next: all => {
            const uid = String(this.auth.getUser()?.id);
            this.recetas = (all || []).filter(rec => String(rec.autorId) === uid);
          },
          error: err2 => {
            console.error('Error fallback cargando recetas completas', err2);
            this.recetas = [];
          }
        });
      }
    });
  }

  puedeModificar(receta: Receta): boolean {
    const user = this.auth.getUser();
    if (!user) return false;
    const autorId = String(receta.autorId);
    const userId = String(user.id);
    return user.role === 'admin' || autorId === userId;
  }

  editar(receta: Receta) {
    this.router.navigate(['/editar-receta', receta.id]);
  }

  eliminar(receta: Receta) {
    const ok = confirm(`¿Eliminar la receta "${receta.titulo}"? Esta acción eliminará también los favoritos relacionados.`);
    if (!ok) return;

    this.recetasSvc.eliminarRecetaConFavoritos(receta.id).subscribe({
      next: () => {

        this.recetas = this.recetas.filter(r => String(r.id) !== String(receta.id));
      },
      error: err => {
        console.error('Error eliminando receta', err);
        alert('Ocurrió un error al eliminar la receta.');
      }
    });
  }
}
