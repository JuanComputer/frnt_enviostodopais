import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from '../../environments/environment';
@Injectable({
    providedIn: 'root'
  })
  export class MaestraService {
    private API_ENVIOS= `${environment.api}/maestra`; // Server para API_CONTRATO

  constructor(
    private httpClient: HttpClient, // httpClient
  ) {
  }
  public finMaestraPrueba(): Observable<any[]> {
    return this.httpClient.get<any[]>(`${this.API_ENVIOS}`); // Devolvemos el observable
  }
}
