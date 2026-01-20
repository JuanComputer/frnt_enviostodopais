import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Envio } from '../../shared/models/envio.model';
import { ResponseDto } from '../../shared/models/response-dto';

@Injectable({ providedIn: 'root' })
export class EnviosService {
  private base = 'https://back-enviostodopais.onrender.com/api/envios';

  constructor(private http: HttpClient) {}

  crear(payload: any): Observable<ResponseDto<Envio>> {
    return this.http.post<ResponseDto<Envio>>(`${this.base}/crear`, payload);
  }

  listar(filters?: any): Observable<ResponseDto<Envio[]>> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(k => {
        if (filters[k] !== undefined && filters[k] !== null) params = params.set(k, filters[k]);
      });
    }
    return this.http.get<ResponseDto<Envio[]>>(`${this.base}/listar`, { params });
  }

  obtenerPorTracking(codigo: string) {
    return this.http.get<ResponseDto<Envio>>(`${this.base}/tracking/${codigo}`);
  }

  cambiarEstado(id: string, nuevoEstado: string) {
    return this.http.put<ResponseDto<Envio>>(`${this.base}/${id}/estado`, null, { params: { nuevoEstado } });
  }

  editar(id: string, payload: any) {
    return this.http.put<ResponseDto<Envio>>(`${this.base}/${id}/editar`, null, { params: payload });
  }

  eliminar(id: string) {
    return this.http.delete<ResponseDto<string>>(`${this.base}/${id}`);
  }
}
