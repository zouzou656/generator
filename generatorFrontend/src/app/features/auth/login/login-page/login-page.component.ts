import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { AuthService } from '../../../../core/auth/auth.service';
import { loginRedirectForRole } from '../../utils/login-redirect';

@Component({
  selector: 'app-login-page',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    TranslatePipe
  ],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss'
})
export class LoginPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly form = this.fb.nonNullable.group({
    email: ['admin@generator.com', [Validators.required, Validators.email]],
    password: ['admin', [Validators.required, Validators.minLength(1)]],
    remember: [true]
  });

  loading = false;

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    
    this.loading = true;
    console.log('[Login] Submitting login form', {
      email: this.form.value.email
    });
    
    try {
      const value = this.form.getRawValue();
      
      console.log('[Login] Calling auth.login service');
      await this.auth.login({
        email: value.email,
        password: value.password
      });
      
      // Role is determined by the backend response
      const session = this.auth.session();
      if (!session) {
        throw new Error('Login failed - no session created');
      }
      
      console.log('[Login] Login successful, navigating to dashboard. Role:', session.role);
      const target = loginRedirectForRole(session.role);
      await this.router.navigateByUrl(target);
    } catch (error: any) {
      console.error('[Login] Login error:', error);
      
      // Extract error message
      let errorMessage = 'Invalid credentials. Please check your email and password.';
      
      if (error) {
        if (typeof error === 'string') {
          errorMessage = error;
        } else if (error.message) {
          errorMessage = error.message;
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }
      }
      
      // Check for network errors
      if (error?.status === 0 || error?.statusText === 'Unknown Error') {
        errorMessage = 'Cannot connect to server. Please ensure the API is running on http://localhost:5076';
      } else if (error?.status === 401) {
        errorMessage = 'Invalid email or password.';
      } else if (error?.status === 400) {
        errorMessage = errorMessage || 'Invalid request. Please check your credentials.';
      } else if (error?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      }
      
      this.snackBar.open(errorMessage, 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    } finally {
      this.loading = false;
    }
  }
}
