import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from './templates/main/main.component';
import { HomeComponent } from './templates/home/home.component';

/*
Example:
{path: '', redirectTo: 'home', pathMatch: 'full'},
{path: 'home', component: HomeComponent},
{path: 'search:searchTerm', component: SearchComponent, inputs: { searchTerm: searchTerm }}, // bind the @Input searchTerm from SearchComponent to the searchTerm route parameter
{path: '**', component: HomeComponent}
*/

const routes: Routes = [
  {
    path: '', component: MainComponent
  },
  {
    path: 'home', component: HomeComponent
  },
  {
    path: ':list/:item', component: MainComponent
  },
  {
    path: ':page', component: MainComponent
  },
];
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forRoot(
      routes,
      {
        enableTracing: true, // <-- debugging purposes only
        // useHash: true, // use hashtag#
      }
    ),
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule { }
