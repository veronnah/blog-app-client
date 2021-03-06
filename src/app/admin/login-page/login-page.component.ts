import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {User} from "../../shared/interfaces";
import {AuthService} from "../shared/services/auth.service";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {NotifierService} from "../shared/services/notifier.service";

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit {

  public form: FormGroup;
  public submitted: boolean = false;
  public message: string;

  constructor(
    public authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private notifierService: NotifierService,
  ) {
  }

  ngOnInit(): void {
    this.checkMessage();
    this.initLoginForm();
  }

  public checkMessage() {
    this.route.queryParams.subscribe((params: Params) => {
      if (params ['authFailed']) {
        this.message = 'The session has expired. Please login again';
      }
    });
  }

  public initLoginForm() {
    this.form = new FormGroup({
      email: new FormControl(null, [
        Validators.email,
        Validators.required,
      ]),
      password: new FormControl(null, [
        Validators.required,
        Validators.minLength(6),
      ])
    });
  }

  public login() {
    if (this.form.invalid) {
      return;
    }
    this.submitted = true;

    const user: User = {
      email: this.form.value.email,
      password: this.form.value.password,
    };

    this.authService.login(user).subscribe({
      next: () => {
        this.form.reset();
        this.router.navigate(['/admin', 'dashboard']).then();
        this.submitted = false;
      },
      error: () => {
        this.submitted = false;
        this.notifierService.showSnackbar('Something went wrong', 'error');
      }
    })
  }

}
