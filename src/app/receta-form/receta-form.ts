import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RecetasService } from '../recetas';
import { AuthService } from '../auth';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Receta } from '../models';

@Component({
  selector: 'app-receta-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './receta-form.html',
  styleUrl: './receta-form.css',
})

export class RecetaFormComponent implements OnInit {
  private recetasSvc = inject(RecetasService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  
  titulo = '';
  descripcion = '';
  categoria: any = 'Desayuno';
  dificultad: any = 'Fácil';
  tiempo = 20;
  error: string | null = null;

  
  editMode = false;
  editId?: string | number;
  loadedReceta?: Receta;

  ngOnInit() {
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editMode = true;
      this.editId = id;
      this.loadRecetaForEdit(id);
    }
  }

  loadRecetaForEdit(id: string) {
    this.recetasSvc.getReceta(id).subscribe({
      next: r => {
        this.loadedReceta = r;
        this.titulo = r.titulo;
        this.descripcion = r.descripcion;
        this.categoria = r.categoria;
        this.dificultad = r.dificultad;
        this.tiempo = Number(r.tiempo) || 0;
        // comprueba permisos, si puede o no editar.
        const user = this.auth.getUser();
        const autorId = String(r.autorId);
        const userId = user ? String(user.id) : null;
        if (!user || (user.role !== 'admin' && autorId !== userId)) {
          alert('No tenés permisos para editar esta receta.');
          this.router.navigateByUrl('/mis-recetas');
        }
      },
      error: err => {
        console.error('Error cargando receta para editar', err);
        alert('No se pudo cargar la receta.');
        this.router.navigateByUrl('/mis-recetas');
      }
    });
  }

  submit() {
    this.error = null;
    const user = this.auth.getUser();
    if (!user) {
      this.error = 'Debes iniciar sesión';
      return;
    }

    const payload: Partial<Receta> = {
      titulo: this.titulo,
      descripcion: this.descripcion,
      categoria: this.categoria,
      dificultad: this.dificultad,
      tiempo: Number(this.tiempo),
    };

    if (this.editMode && this.editId) {
      
      this.recetasSvc.editarReceta(this.editId, payload).subscribe({
        next: () => {
          this.router.navigateByUrl('/mis-recetas');
        },
        error: err => {
          console.error('Error editando receta', err);
          this.error = 'Error al guardar cambios';
        }
      });
    } else {
      
      payload.autorId = String(user.id);
      this.recetasSvc.crearReceta(payload).subscribe({
        next: () => {
          this.router.navigateByUrl('/mis-recetas');
        },
        error: err => {
          console.error('Error creando receta', err);
          this.error = 'Error al crear receta';
        }
      });
    }
  }

  cancelar() {
    this.router.navigateByUrl('/mis-recetas');
  }
}



//////////////////////////////////////////////////////////////////////////////////////////////
// export class RecetaFormComponent {
//   private recetasSvc = inject(RecetasService);
//   private auth = inject(AuthService);
//   private router = inject(Router);

//   titulo = '';
//   descripcion = '';
//   categoria: any = 'Desayuno';
//   dificultad: any = 'Fácil';
//   tiempo = 20;
//   error: string | null = null;

//   submit() {
//     const user = this.auth.getUser();
//     if (!user) {
//       this.error = 'Debes iniciar sesión';
//       return;
//     }
//     const payload = {
//       titulo: this.titulo,
//       descripcion: this.descripcion,
//       categoria: this.categoria,
//       dificultad: this.dificultad,
//       tiempo: Number(this.tiempo),
//       autorId: user.id
//     };
//     this.recetasSvc.crearReceta(payload).subscribe({
//       next: () => this.router.navigateByUrl('/mis-recetas'),
//       error: e => this.error = 'Error al crear receta'
//     });
//   }
// }
