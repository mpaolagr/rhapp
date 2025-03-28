import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { PublicGuard } from './guards/public.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'signin', // TODO: Set this to ''
    pathMatch: 'full'
  },
  {
    path: '',
    loadChildren: () => import('./pages/secure/secure.module').then(m => m.SecureModule),
    canActivate: [AuthGuard] // Secure all child pages
  },
  {
    path: 'register',
    loadChildren: () => import('./pages/public/register/register.module').then(m => m.RegisterPageModule),
    canActivate: [PublicGuard] // Prevent for signed in users
  },
  {
    path: 'signin',
    loadChildren: () => import('./pages/public/signin/signin.module').then(m => m.SigninPageModule),
    canActivate: [PublicGuard] // Prevent for signed in users
  },
  {
    path: 'signup',
    loadChildren: () => import('./pages/public/signup/signup.module').then(m => m.SignupPageModule),
    canActivate: [PublicGuard] // Prevent for signed in users
  },
  {
    path: 'password-reset',
    loadChildren: () => import('./pages/public/password-reset/password-reset.module').then( m => m.PasswordResetPageModule),
    canActivate: [PublicGuard] // Prevent for signed in users
  },
  {
    path: 'setpass',
    loadChildren: () => import('./pages/public/setpass/setpass.module').then( m => m.SetpassPageModule),
    canActivate: [PublicGuard] // Prevent for signed in users
  },
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules, relativeLinkResolution: 'legacy' })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
