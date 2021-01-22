import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'chip-auto-complete';
  text: string = '';

  public parentForm: FormGroup = new FormGroup({
    fruit: new FormControl(''),
  });

  add = () => {
    console.log('add one');
  };

  onSubmit() {
    this.text = '';
    this.text += `this.parentForm.value: ${JSON.stringify(this.parentForm.value)}\n`;
    this.text += `this.parentForm.get('fruit')?.value: ${JSON.stringify(this.parentForm.get('fruit')?.value)}\n`;
    this.text += `this.parentForm.get('fruit')?.valid: ${JSON.stringify(this.parentForm.get('fruit')?.valid)}\n`;
  }
}
