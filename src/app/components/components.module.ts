import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { ListComponent } from './list/list.component';
import { MenuComponent } from './menu/menu.component';
import { ArticleComponent } from './article/article.component';


@NgModule({
  declarations: [
    ListComponent,
    MenuComponent,
    ArticleComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    RouterModule,
    ListComponent,
    MenuComponent,
    ArticleComponent
  ]
})
export class ComponentsModule { }
