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

  submitContact() {
    if (!this.name || !this.email || !this.message) return;
    // Aquí iría la llamada al servicio de email
    this.enviado = true;
    setTimeout(() => { this.enviado = false; this.name=''; this.email=''; this.asunto=''; this.message=''; }, 4000);
  }
}
