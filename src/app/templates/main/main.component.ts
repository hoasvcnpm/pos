import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit, OnDestroy {

  slug: string;
  page: string;
  list: string;
  item: string;
  private sub: any;

  data = [5,6,7,8,9];

  constructor(private route: ActivatedRoute) {

  }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.slug = params['slug']; // (+) converts string 'id' to a number
      // console.log(this.slug);
      this.page = params['page'];
      this.list = params['list'];
      this.item = params['item'];
    });
  }
  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  changeData($event)
  {
    this.data = (<HTMLButtonElement>$event.target).form.d;
  }

}
