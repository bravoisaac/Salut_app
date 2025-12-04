import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule],
})
export class LoginPage {
  email = '';
  password = '';
  errorMsg = '';
  loading = false;

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  submit() {
    this.loading = true;
    this.errorMsg = '';

    this.auth.login(this.email, this.password).subscribe({
      next: async (res: any) => {
        // Laravel responde { token, user, ... }
        await this.auth.setToken(res.token);
        this.router.navigateByUrl('/home', { replaceUrl: true });
      },
      error: (err) => {
        this.errorMsg =
          err?.error?.message ||
          err?.error?.errors?.email?.[0] ||
          'Error al iniciar sesión';
      }
    }).add(() => {
      this.loading = false;
    });
  }
}
