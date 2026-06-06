import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact-us',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.scss']
})
export class ContactUsComponent {
  name    = '';
  email   = '';
  asunto  = '';
  message = '';
  enviado = false;

  // Errores por campo
  errors: { name?: string; email?: string; asunto?: string; message?: string } = {};

  private emailValido(e: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());
  }

  private validar(): boolean {
    this.errors = {};
    if (!this.name.trim())              this.errors.name    = 'El nombre es obligatorio';
    if (!this.email.trim())             this.errors.email   = 'El correo es obligatorio';
    else if (!this.emailValido(this.email)) this.errors.email = 'Ingresa un correo válido';
    if (!this.asunto.trim())            this.errors.asunto  = 'El asunto es obligatorio';
    if (!this.message.trim())           this.errors.message = 'El mensaje es obligatorio';
    return Object.keys(this.errors).length === 0;
  }

  submitContact(): void {
    if (!this.validar()) return;
    // Aquí iría la llamada al servicio de email
    this.enviado = true;
    setTimeout(() => {
      this.enviado  = false;
      this.name     = '';
      this.email    = '';
      this.asunto   = '';
      this.message  = '';
      this.errors   = {};
    }, 4000);
  }
}
