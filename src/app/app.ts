import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterModule],
  templateUrl: './app.html',
  styles: [`

body {
  margin: 0;
  font-family: "Poppins", "Segoe UI", sans-serif;
  background: #f5fdf7;
  color: #2f4f2f;
}


.container {
  width: 90%;
  max-width: 1200px;
  margin: 0 auto;
}


.navbar {
  background: linear-gradient(90deg, #2ecc71, #27ae60);
  padding: 15px 0;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.navbar .container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}


.brand {
  font-size: 26px;
  font-weight: 700;
  color: white;
  cursor: pointer;
  letter-spacing: 1px;
  border-radius: 10px;
  padding: 5px 10px;
  transition: transform 0.2s ease;
}

.brand:hover {
  transform: scale(1.05);
}


.nav {
  display: flex;
  align-items: center;
  gap: 20px;
}

.nav a {
  text-decoration: none;
  color: white;
  font-weight: 500;
  padding: 8px 14px;
  border-radius: 8px;
  transition: background 0.2s, transform 0.2s;
}

.nav a:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}


.nav button {
  background: white;
  color: #27ae60;
  border: none;
  padding: 8px 15px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s, transform 0.2s;
}

.nav button:hover {
  background: #e8ffe8;
  transform: translateY(-2px);
}

main.container {
  margin-top: 20px;
}
  `]
})
export class AppComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  isLogged() { return this.auth.isLoggedIn(); }
  isAdmin() {
    const u = this.auth.getUser();
    return !!u && u.role === 'admin';
  }

  logout() {
    this.auth.logout();
  }

  goHome() {
    this.router.navigateByUrl('/');
  }
}