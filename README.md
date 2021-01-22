# ChipAutoComplete

This project is a angular material component which combin feature of chips and auto-complete. 
Also, it support:
* reactive from control
```html
<form [formGroup]="parentForm" (ngSubmit)="onSubmit()">
  <app-chip-auto-complete formControlName="fruit">
  </app-chip-auto-complete>
  <button type="submit" [disabled]="parentForm.invalid">Confirm</button>
</form>
```
```typescript
this.form.get(controlName).value;
```
* mat-form-field
```html
<mat-form-field>
    <mat-label>eqId</mat-label>
    <app-chip-auto-complete 
        formControlName="eqId"
    ></app-chip-auto-complete>
</mat-form-field>

```
## Feature
* cannot select duplicate option
* support partial name

## Example
```html
<app-chip-auto-complete
    formControlName="fruit"
    [options]="['apple', 'banana', 'orange']"
    [maxSelected]="2"
    [add]="add"
  >
</app-chip-auto-complete>
```
## Environment
This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 11.0.4.

## Development

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

