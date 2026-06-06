import { Component, OnInit, inject } from '@angular/core';
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
export class LoginComponent implements OnInit {
  private fb     = inject(FormBuilder);
  private auth   = inject(AuthService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  resetMode = false;
  isLoading = false;

  // Un único FormGroup que nunca se destruye
  form = this.fb.group({
    correo:        ['', [Validators.required, Validators.email]],
    password:      ['', [Validators.required, Validators.minLength(6)]],
    dni:           [''],
    nuevaPassword: ['']
  });

  ngOnInit(): void {
    this.applyLoginValidators();
  }

  // ── Aplica validators para modo Login ──────────────────────────────
  private applyLoginValidators(): void {
    this.form.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.form.get('password')?.updateValueAndValidity();

    this.form.get('dni')?.clearValidators();
    this.form.get('dni')?.updateValueAndValidity();

    this.form.get('nuevaPassword')?.clearValidators();
    this.form.get('nuevaPassword')?.updateValueAndValidity();
  }

  // ── Aplica validators para modo Reset ──────────────────────────────
  private applyResetValidators(): void {
    this.form.get('password')?.clearValidators();
    this.form.get('password')?.updateValueAndValidity();

    this.form.get('dni')?.setValidators([Validators.required, Validators.pattern('^[0-9]{8}$')]);
    this.form.get('dni')?.updateValueAndValidity();

    this.form.get('nuevaPassword')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.form.get('nuevaPassword')?.updateValueAndValidity();
  }

  toggleResetMode(reset: boolean): void {
    this.resetMode = reset;
    this.isLoading = false;
    this.form.reset();

    if (reset) {
      this.applyResetValidators();
    } else {
      this.applyLoginValidators();
    }
  }

  onSubmit(): void {
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
}
