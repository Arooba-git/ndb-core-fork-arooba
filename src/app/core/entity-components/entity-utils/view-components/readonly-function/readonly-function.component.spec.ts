import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ReadonlyFunctionComponent } from "./readonly-function.component";
import { Child } from "../../../../../child-dev-project/children/model/child";
import { UntypedFormControl, UntypedFormGroup } from "@angular/forms";

describe("ReadonlyFunctionComponent", () => {
  let component: ReadonlyFunctionComponent;
  let fixture: ComponentFixture<ReadonlyFunctionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReadonlyFunctionComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReadonlyFunctionComponent);
    component = fixture.componentInstance;
    const formGroup = new UntypedFormGroup({});
    const formControl = new UntypedFormControl();
    formGroup.registerControl("name", formControl);
    component.onInitFromDynamicConfig({
      entity: Child.create("nameBefore"),
      id: "",
      value: undefined,
      config: (entity) => entity.name,
    });
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
