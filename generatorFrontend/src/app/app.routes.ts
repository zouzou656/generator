import { Routes } from '@angular/router';
import { anonymousOnlyGuard } from './core/guards/anonymous-only.guard';
import { roleMatchGuard } from './core/guards/role-match.guard';
import { ownerContextGuard } from './core/guards/owner-context.guard';
import { PublicLayoutComponent } from './layout/public/public-layout/public-layout.component';
import { AuthLayoutComponent } from './layout/auth/auth-layout/auth-layout.component';
import { AdminLayoutComponent } from './layout/admin/admin-layout/admin-layout.component';
import { OwnerLayoutComponent } from './layout/owner/owner-layout/owner-layout.component';
import { HomePageComponent } from './features/portal/home/home-page/home-page.component';
import { AboutPageComponent } from './features/portal/about/about-page/about-page.component';
import { ServicesPageComponent } from './features/portal/services/services-page/services-page.component';
import { ContactPageComponent } from './features/portal/contact/contact-page/contact-page.component';
import { CheckBillPageComponent } from './features/portal/check-bill/check-bill-page/check-bill-page.component';
import { LoginPageComponent } from './features/auth/login/login-page/login-page.component';
import { NotFoundPageComponent } from './shared/not-found-page/not-found-page.component';

export const routes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      {
        path: '',
        component: HomePageComponent,
        title: 'Generator Platform – Home',
        data: {
          meta: {
            description:
              'Digitize generator billing, customer care and communication from one modern platform.'
          }
        }
      },
      {
        path: 'about',
        component: AboutPageComponent,
        title: 'About Generator Platform',
        data: {
          meta: {
            description: 'Learn how generator owners thrive with our all-in-one management suite.'
          }
        }
      },
      {
        path: 'services',
        component: ServicesPageComponent,
        title: 'Services – Generator Platform',
        data: {
          meta: {
            description: 'Billing automation, customer management and SMS campaigns for generators.'
          }
        }
      },
      {
        path: 'contact',
        component: ContactPageComponent,
        title: 'Contact – Generator Platform',
        data: {
          meta: {
            description: 'Talk with our team to explore generator billing transformation.'
          }
        }
      },
      {
        path: 'check-bill',
        component: CheckBillPageComponent,
        title: 'Check My Bill',
        data: {
          meta: {
            description: 'Look up generator bills by phone number and subscription instantly.'
          }
        }
      }
    ]
  },
  {
    path: 'auth',
    component: AuthLayoutComponent,
    canMatch: [anonymousOnlyGuard],
    children: [
      {
        path: 'login',
        component: LoginPageComponent,
        title: 'Login – Generator Platform'
      }
    ]
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canMatch: [roleMatchGuard],
    data: { roles: ['ADMIN'] },
    loadChildren: () => import('./features/admin/routes').then((m) => m.ADMIN_ROUTES)
  },
  {
    path: 'owner',
    component: OwnerLayoutComponent,
    canMatch: [roleMatchGuard],
    data: { roles: ['GENERATOR_OWNER'] },
    canActivateChild: [ownerContextGuard],
    loadChildren: () => import('./features/owner/routes').then((m) => m.OWNER_ROUTES)
  },
  {
    path: '**',
    component: NotFoundPageComponent,
    title: 'Page not found'
  }
];
