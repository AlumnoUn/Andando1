import { Component, inject, OnInit } from '@angular/core';
import { FavoritosService } from '../favoritos';
import { AuthService } from '../auth';
import { RecetasService } from '../recetas';
import { Receta, Favorito } from '../models';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-mis-favoritos',
  imports: [CommonModule, RouterModule],
  templateUrl:'./mis-favoritos.html' ,
  styleUrl:'./mis-favoritos.css' ,
})


export class MisFavoritosComponent implements OnInit {
  private favSvc = inject(FavoritosService);
  private auth = inject(AuthService);
  private recetasSvc = inject(RecetasService);

  favoritos: Favorito[] = [];
  recetas: Receta[] = [];

  ngOnInit() {
    this.load();
  }

  load() {
    const user = this.auth.getUser();
    if (!user) {
      this.favoritos = [];
      this.recetas = [];
      return;
    }

    this.favSvc.getFavoritosPorUsuario(user.id).subscribe({
      next: favs => {
        this.favoritos = favs || [];

        
        const ids = this.favoritos.map(f => String(f.recetaId)).filter(s => s && s.length > 0);

        
        console.log('MisFavoritos: ids detectados =', ids);

        if (ids.length) {
          
          this.recetasSvc.getRecetasByIds(ids).subscribe({
            next: rs => {
              this.recetas = rs || [];
            },
            error: err => {
              console.error('Error cargando recetas por ids', err);
              this.recetas = [];
            }
          });
        } else {
          this.recetas = [];
        }
      },
      error: err => {
        console.error('Error cargando favoritos', err);
        this.favoritos = [];
        this.recetas = [];
      }
    });
  }

  async quitar(receta: Receta) {
    const favorito = this.favoritos.find(f => String(f.recetaId) === String(receta.id));
    if (!favorito) return;

    try {
      await firstValueFrom(this.favSvc.removeFavoritoById(favorito.id));
      
      this.favoritos = this.favoritos.filter(f => String(f.id) !== String(favorito.id));
      this.recetas = this.recetas.filter(r => String(r.id) !== String(receta.id));
    } catch (e) {
      console.error('Error al quitar favorito', e);
    }
  }
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//   ngOnInit() {
//     this.load();
//   }

//   load() {
//     const user = this.auth.getUser();
//     if (!user) {
//       this.favoritos = [];
//       this.recetas = [];
//       return;
//     }

//     this.favSvc.getFavoritosPorUsuario(user.id).subscribe({
//       next: favs => {
//         this.favoritos = favs || [];

//         // ids como strings (no convertimos a Number)
//         const ids = this.favoritos.map(f => String(f.recetaId)).filter(s => s && s.length > 0);

//         if (ids.length) {
//           this.recetasSvc.getRecetasByIds(ids).subscribe({
//             next: rs => this.recetas = rs || [],
//             error: err => {
//               console.error('Error cargando recetas por ids', err);
//               this.recetas = [];
//             }
//           });
//         } else {
//           this.recetas = [];
//         }
//       },
//       error: err => {
//         console.error('Error cargando favoritos', err);
//         this.favoritos = [];
//         this.recetas = [];
//       }
//     });
//   }

//   async quitar(receta: Receta) {
//     const favorito = this.favoritos.find(f => String(f.recetaId) === String(receta.id));
//     if (!favorito) return;

//     try {
//       await firstValueFrom(this.favSvc.removeFavoritoById(favorito.id));
//       
//       this.favoritos = this.favoritos.filter(f => String(f.id) !== String(favorito.id));
//       this.recetas = this.recetas.filter(r => String(r.id) !== String(receta.id));
//     } catch (e) {
//       console.error('Error al quitar favorito', e);
//     }
//   }
// }