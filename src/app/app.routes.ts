import { Routes } from '@angular/router';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { LoginComponent } from './login/login.component';
import { DvipComponent } from './dvip/dvip.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PicturesComponent } from './pictures/pictures.component';

export const routes: Routes = [
    // { path: '', component: LandingPageComponent, title: "Burst Van Pictures" },
    { path: '', redirectTo: 'login/driver', pathMatch: 'full' },
    { path: 'login/:type', component: LoginComponent, title: "Login" },
    { path: 'dvip/pictures', component: DvipComponent, title: "DVIP" },
    { path: 'dashboard', component: DashboardComponent, title: "Dashboard" },
    { path: 'pictures', component: PicturesComponent, title: "Pictures" },
    { path: 'logout', redirectTo: 'login/driver' },
    { path: '**', redirectTo: 'login/driver' }
];
