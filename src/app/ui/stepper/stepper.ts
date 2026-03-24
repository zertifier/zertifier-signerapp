import {Component, inject} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-stepper',
  imports: [],
  templateUrl: './stepper.html',
  styleUrl: './stepper.css',
})
export class Stepper {
  router = inject(Router);
  route = inject(ActivatedRoute);

  next() {
    const currentIndex = this.route.snapshot.data['stepIndex'];
    const nextIndex = currentIndex + 1;

    const parent = this.route.parent!;
    const nextRoute = parent.routeConfig?.children?.find(
      r => r.data?.['stepIndex'] === nextIndex
    );

    if (nextRoute?.path) {
      this.router.navigate(['../', nextRoute.path], {
        relativeTo: this.route
      });
    }
  }

  previous() {
    const currentIndex = this.route.snapshot.data['stepIndex'];
    const nextIndex = currentIndex > 0 ? currentIndex - 1 : 0;

    const parent = this.route.parent!;
    const nextRoute = parent.routeConfig?.children?.find(
      r => r.data?.['stepIndex'] === nextIndex
    );

    if (nextRoute?.path) {
      this.router.navigate(['../', nextRoute.path], {
        relativeTo: this.route
      });
    }
  }
}
