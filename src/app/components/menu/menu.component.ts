import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'ui-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {

  slug: string;
  page: string;
  list: string;
  item: string;
  private sub: any;

  menuItems = [
    { slug : 'about', title : 'About' },
    { slug : 'list/item-1', title : 'Item 1' },
    { slug : 'list/item-2', title : 'Item 2' },
    { slug : 'faq', title : 'Faq' },
    { slug : 'contact', title : 'Contact' },
  ];

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

}
