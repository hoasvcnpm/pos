import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

  slug: string;
  private sub: any;

  constructor(private route: ActivatedRoute) {

  }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.slug = params['slug']; // (+) converts string 'id' to a number
      // console.log(this.slug);
    });
  }
  ngOnDestroy() {
    this.sub.unsubscribe();
  }

}
