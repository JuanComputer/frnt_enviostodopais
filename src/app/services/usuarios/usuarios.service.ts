import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ResponseDto } from '../../shared/models/response-dto';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private base = 'https://back-enviostodopais.onrender.com/api/usuarios';

  constructor(private http: HttpClient) {}

  listar(rol?: string, activo?: boolean) {
    let q = '/listar';
    const params: string[] = [];
    if (rol) params.push(`rol=${rol}`);
    if (typeof activo === 'boolean') params.push(`activo=${activo}`);
    if (params.length) q += '?' + params.join('&');
    return this.http.get<ResponseDto<any>>(this.base + q);
  }
}
