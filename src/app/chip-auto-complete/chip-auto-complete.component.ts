import { FocusMonitor } from '@angular/cdk/a11y';
import { Inject, Injector } from '@angular/core';
import {
  Component,
  ElementRef,
  forwardRef,
  HostBinding,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  Self,
  ViewChild,
} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  FormControl,
  FormGroup,
  NgControl,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator,
  Validators,
} from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatFormFieldControl } from '@angular/material/form-field';

import { Subject } from 'rxjs';
import { fromEvent } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-chip-auto-complete',
  templateUrl: './chip-auto-complete.component.html',
  styleUrls: ['./chip-auto-complete.component.css'],
  providers: [
    // {
    //   provide: NG_VALUE_ACCESSOR,
    //   useExisting: forwardRef(() => ChipAutoCompleteComponent),
    //   multi: true,
    // },
    // {
    //   provide: NG_VALIDATORS,
    //   useExisting: forwardRef(() => ChipAutoCompleteComponent),
    //   multi: true,
    // },
    { provide: MatFormFieldControl, useExisting: ChipAutoCompleteComponent },
  ],
})

/**
 * implement ControlValueAccessor, Validator: https://medium.com/angular-in-depth/angular-nested-reactive-forms-using-cvas-b394ba2e5d0d
 * implement MatFormFieldControl: https://material.angular.io/guide/creating-a-custom-form-field-control#oncontainerclickevent-mouseevent
 */
export class ChipAutoCompleteComponent
  implements
    OnInit,
    OnDestroy,
    ControlValueAccessor,
    Validator,
    MatFormFieldControl<string[]> {
  /** array of chips */
  public selectedChips: string[] = [];

  /** clear input value after user select eq from auto-complete */
  @ViewChild('input') input: ElementRef;

  /** all option for auto complete */
  @Input('options')
  set options(options) {
    this._options = options;
    this.filterOptions = this._options;
    this.stateChanges.next();
  }
  get options() {
    return this._options;
  }
  _options: string[] = ['Mary', 'John', 'Peter'];

  /** allow select multiple chips */
  @Input('maxSelected') maxSelected: number = 5;
  @Input('add') _add: () => void = () => {};

  /** save all filter options by user key in string */
  public filterOptions: string[] = this._options;

  /** subect to unsubscribe other subscribe */
  private unsubscribeAll$ = new Subject<boolean>();

  /** for nested form */
  public basicForm: FormGroup = new FormGroup({
    input: new FormControl('', [Validators.required]),
  });

  /** for nested form */
  public onTouched: () => void = () => {};

  constructor(
    @Optional() @Self() public ngControl: NgControl,
    private fm: FocusMonitor,
    private elRef: ElementRef<HTMLElement>,
    // @Inject(NG_VALIDATORS)private validators:Validator, 
  ) {
    // Replace the provider from above with this.
    if (this.ngControl != null) {
      // Setting the value accessor directly (instead of using
      // the providers) to avoid running into a circular import.
      this.ngControl.valueAccessor = this;
      // (this.ngControl.control as AbstractControl).setValidators(this.validate);

    }

    fm.monitor(elRef.nativeElement, true).subscribe((origin) => {
      this.focused = !!origin;
      this.stateChanges.next();
    });
  }

  ngOnInit(): void {
    // const control = new FormControl(this.controlName);
    // this.formGroup.addControl(this.formControlName, control);
  }

  ngOnDestroy(): void {
    this.unsubscribeAll$.next(true);
    this.unsubscribeAll$.complete();
    this.stateChanges.complete();
    this.fm.stopMonitoring(this.elRef.nativeElement);
  }

  ngAfterViewInit() {
    fromEvent(this.input.nativeElement, 'input')
      .pipe(
        takeUntil(this.unsubscribeAll$),
        map((res) => {
          return (<HTMLInputElement>(<InputEvent>res).target).value;
        }),
        map((value) => {
          if (!value) {
            return this._options;
          }
          return this._options.filter((option) =>
            option.toLowerCase().includes(value.toLowerCase())
          );
        })
      )
      .subscribe((filterOptions) => {
        this.filterOptions = filterOptions;
      });
  }

  addChip(event: MatChipInputEvent) {
    if (this.filterOptions.length === 1) {
      const addOption: string = this.filterOptions[0];
      this.addSelectOption(addOption);
    }
  }

  removeChip(selectedChip: string) {
    this.selectedChips.splice(
      this.selectedChips.findIndex((chip) => chip === selectedChip),
      1
    );
    this.basicForm.get('input')?.setValue(null);
  }

  selectAutoComplete(e: MatAutocompleteSelectedEvent) {
    this.addSelectOption(e.option.viewValue);
  }

  private addSelectOption(addOption: string) {
    // setvalue to null by formControl not work
    this.input.nativeElement.value = '';

    if (this.selectedChips.find((selectedChip) => selectedChip === addOption)) {
      // already add in chip
      return;
    }

    if (this.selectedChips.length >= this.maxSelected) {
      return;
    }
    this.selectedChips.push(addOption);
    this._add();

    // reset auto-complete
    this.filterOptions = this._options;
  }

  /** implement ControlValueAccessor*/
  writeValue(val: any): void {
    val && this.basicForm.setValue(val, { emitEvent: false });
  }

  /** implement ControlValueAccessor, be called with the value if the value changes in the form control element itself (view -> model) */
  registerOnChange(fn: any): void {
    console.log('on change');
    this.basicForm.valueChanges
      .pipe(
        map((value) => {
          // form control name
          return this.selectedChips;
        })
      )
      .subscribe(fn);
  }

  /** implement ControlValueAccessor*/
  registerOnTouched(fn: any): void {
    console.log('on blur');
    this.onTouched = fn;
  }

  /** implement ControlValueAccessor*/
  setDisabledState?(isDisabled: boolean): void {
    isDisabled ? this.basicForm.disable() : this.basicForm.enable();
  }

  /** implement ControlValueAccessor FIXME*/
  validate(c: AbstractControl): ValidationErrors | null {
    console.log('Basic Info validation', c);
    return this.basicForm.valid
      ? null
      : {
          invalidForm: {
            valid: false,
            message: 'basicForm fields are invalid',
          },
        };
  }

  @Input()
  /** implemnet MatFormFieldControl */
  get value(): string[] {
    return this.selectedChips;
  }
  /** implemnet MatFormFieldControl */
  set value(stringArr: string[]) {
    this.selectedChips = stringArr;
    this.stateChanges.next();
  }

  /** implemnet MatFormFieldControl */
  stateChanges = new Subject<void>();

  /** implemnet MatFormFieldControl */
  static nextId = 0;
  @HostBinding() id = `example-tel-input-${ChipAutoCompleteComponent.nextId++}`;

  /** implemnet MatFormFieldControl */
  @Input()
  get placeholder() {
    return this._placeholder;
  }
  set placeholder(plh) {
    this._placeholder = plh;
    this.stateChanges.next();
  }
  public _placeholder: string = '';

  /** implemnet MatFormFieldControl */
  public focused = false;

  /** implemnet MatFormFieldControl */
  get empty() {
    return !this.basicForm.value['input'];
  }

  /** whether the label should be in the floating position */
  get shouldLabelFloat() {
    return this.focused || !this.empty;
  }

  /** implemnet MatFormFieldControl */
  @Input()
  get required() {
    return this._required;
  }
  set required(req) {
    this._required = req;
    this.stateChanges.next();
  }
  private _required = false;

  /** implemnet MatFormFieldControl */
  @Input()
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(value: boolean) {
    this._disabled = value;
    this._disabled ? this.basicForm.disable() : this.basicForm.enable();
    this.stateChanges.next();
  }
  private _disabled = false;

  /** implemnet MatFormFieldControl, for displaying mat-error */
  get errorState() {
    // return this.ngControl.errors !== null && !!this.ngControl.touched;
    if(this.ngControl.touched && this.selectedChips.length === 0){
      this.ngControl.control?.setErrors({'empty chip': true});
      return true;
    }
    return false;
  }
  /** implemnet MatFormFieldControl */
  controlType = 'chip-auto-complete';

  /** implemnet MatFormFieldControl */
  setDescribedByIds(ids: string[]) {}

  /** implements MatFormFieldControl, will be called when the form field is clicked on.*/
  onContainerClick(event: MouseEvent) {
    if ((event.target as Element).tagName.toLowerCase() != 'input') {
      this.elRef.nativeElement.querySelector('input')?.focus();
    }
    this.ngControl?.control?.markAsTouched();

  }
}
