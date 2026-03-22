import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { StorageService } from '../../services/storage.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  trackingCode      = '';
  envioEncontrado: any = null;
  buscando          = false;
  user: any         = null;

  constructor(
    private http: HttpClient,
    public router: Router,
    private toastr: ToastrService,
    private storage: StorageService
  ) {}

  ngOnInit(): void {
    this.user = this.storage.getUser();
  }

  isLoggedIn():       boolean { return !!this.user; }
  get role():         string  { return this.user?.role || ''; }
  get isAdminGeneral():boolean { return this.role === 'Administrador General'; }
  get isAdminSede():  boolean  { return this.role === 'Administrador de Sede'; }
  get isOperador():   boolean  { return this.role === 'Operador'; }
  get isCliente():    boolean  { return this.role === 'Cliente'; }
  get isStaff():      boolean  { return this.isAdminGeneral || this.isAdminSede || this.isOperador; }

  buscarEnvio(): void {
    if (!this.trackingCode.trim()) {
      this.toastr.warning('Ingresa un código de seguimiento');
      return;
    }
    this.buscando = true;
    this.envioEncontrado = null;
    this.http.get(`${environment.api}/api/envios/tracking/${this.trackingCode.trim()}`).subscribe({
      next: (res: any) => {
        this.buscando = false;
        if (res.statusCode === 200 && res.data) {
          this.envioEncontrado = res.data;
        } else {
          this.toastr.error('No se encontró ningún envío con ese código');
        }
      },
      error: () => {
        this.buscando = false;
        this.toastr.error('Error al buscar el envío');
      }
    });
  }
}
