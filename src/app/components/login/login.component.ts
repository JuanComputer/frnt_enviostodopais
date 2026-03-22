import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ToastrService, ToastrModule } from 'ngx-toastr';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, ToastrModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  private fb     = inject(FormBuilder);
  private auth   = inject(AuthService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  resetMode = false;
  isLoading = false;

  form = this.fb.group({
    correo:       ['', [Validators.required, Validators.email]],
    password:     ['', [Validators.required, Validators.minLength(6)]],
    dni:          [''],
    nuevaPassword:['']
  });

  ngOnInit() {
    this.toggleResetMode(false);
  }

  onSubmit() {
    if (this.form.invalid) {
      this.toastr.warning('Completa todos los campos correctamente');
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    if (!this.resetMode) {
      const { correo, password } = this.form.value;
      this.auth.login(correo!, password!).subscribe({
        next: (res: any) => {
          this.isLoading = false;
          if (res?.statusCode === 200) {
            this.toastr.success(`Bienvenido, ${res.data.role}`);
            setTimeout(() => { window.location.href = '/'; }, 150);
          } else {
            this.toastr.error(res.message || 'Error al iniciar sesión');
          }
        },
        error: () => {
          this.isLoading = false;
          this.toastr.error('Error de conexión con el servidor');
        }
      });
    } else {
      const { correo, dni, nuevaPassword } = this.form.value;
      this.auth.resetPassword(correo!, dni!, nuevaPassword!).subscribe({
        next: (res: any) => {
          this.isLoading = false;
          if (res?.statusCode === 200) {
            this.toastr.success('Contraseña restablecida con éxito');
            this.toggleResetMode(false);
          } else {
            this.toastr.error(res.message || 'Error al restablecer contraseña');
          }
        },
        error: () => {
          this.isLoading = false;
          this.toastr.error('Error de conexión con el servidor');
        }
      });
    }
  }

  toggleResetMode(reset = true) {
    this.resetMode = reset;
    this.isLoading = false;
    if (reset) {
      this.form = this.fb.group({
        correo:       ['', [Validators.required, Validators.email]],
        password:     [''],
        dni:          ['', [Validators.required, Validators.pattern('^[0-9]{8}$')]],
        nuevaPassword:['', [Validators.required, Validators.minLength(6)]]
      });
    } else {
      this.form = this.fb.group({
        correo:       ['', [Validators.required, Validators.email]],
        password:     ['', [Validators.required, Validators.minLength(6)]],
        dni:          [''],
        nuevaPassword:['']
      });
    }
  }
}
