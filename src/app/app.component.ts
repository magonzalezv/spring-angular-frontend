import { Component } from '@angular/core';
import { AuthService } from './usuarios/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Bienvenido a Angular';

  constructor(
    private authService: AuthService
  ) {

  }

  estaAutenticado():boolean {
    return this.authService.estaAutenticado();
  }
}
