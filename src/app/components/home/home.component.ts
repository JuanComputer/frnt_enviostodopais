import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  trackingCode = '';
  envioEncontrado: any = null;
  user: any = null;

  constructor(
    private http: HttpClient,
    public router: Router,
    private toastr: ToastrService,
    private storage: StorageService
  ) {}

  ngOnInit(): void {
    this.user = this.storage.getUser();
  }

  isLoggedIn(): boolean {
    return !!this.user;
  }

  buscarEnvio() {
    if (!this.trackingCode.trim()) {
      this.toastr.warning('Ingrese un código de envío válido');
      return;
    }

    this.http.get(`https://back-enviostodopais.onrender.com/api/envios/tracking/${this.trackingCode}`).subscribe({
      next: (res: any) => {
        if (res.statusCode === 200 && res.data) {
          this.envioEncontrado = res.data;
        } else {
          this.envioEncontrado = null;
          this.toastr.error('No se encontró el envío');
        }
      },
      error: () => {
        this.toastr.error('Error al buscar el envío');
      }
    });
  }

  irZonaClientes() {
    this.router.navigate(['/auth']);
  }

  irCrearEnvio() {
    this.router.navigate(['/crear-envio']);
  }
}
