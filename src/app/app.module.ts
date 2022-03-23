import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';
import { ModalWelcomeDialog } from './modal-welcome/modal-welcome.component';

@NgModule({
  declarations: [
    AppComponent,
    ModalWelcomeDialog
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    BrowserAnimationsModule,
    MatDialogModule
  ],
  providers: [],
  entryComponents: [ModalWelcomeDialog],
  bootstrap: [AppComponent]
})
export class AppModule { }
