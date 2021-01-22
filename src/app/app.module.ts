import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ChipAutoCompleteComponent } from './chip-auto-complete/chip-auto-complete.component';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
@NgModule({
  declarations: [AppComponent, ChipAutoCompleteComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatIconModule,
    ReactiveFormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
