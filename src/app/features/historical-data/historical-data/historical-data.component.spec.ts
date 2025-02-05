import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from "@angular/core/testing";

import { HistoricalDataComponent } from "./historical-data.component";
import { Entity } from "../../../core/entity/model/entity";
import { HistoricalEntityData } from "../model/historical-entity-data";
import moment from "moment";
import { HistoricalDataService } from "../historical-data.service";
import { MockedTestingModule } from "../../../utils/mocked-testing.module";
import { FormDialogService } from "../../../core/form-dialog/form-dialog.service";

describe("HistoricalDataComponent", () => {
  let component: HistoricalDataComponent;
  let fixture: ComponentFixture<HistoricalDataComponent>;
  let mockHistoricalDataService: jasmine.SpyObj<HistoricalDataService>;

  beforeEach(async () => {
    mockHistoricalDataService = jasmine.createSpyObj(["getHistoricalDataFor"]);
    mockHistoricalDataService.getHistoricalDataFor.and.resolveTo([]);

    await TestBed.configureTestingModule({
      imports: [HistoricalDataComponent, MockedTestingModule.withState()],
      providers: [
        { provide: HistoricalDataService, useValue: mockHistoricalDataService },
        { provide: FormDialogService, useValue: null },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HistoricalDataComponent);
    component = fixture.componentInstance;

    component.onInitFromDynamicConfig({
      entity: new Entity(),
      config: [],
    });
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should load the historical data", fakeAsync(() => {
    const entity = new Entity();
    const relatedData = new HistoricalEntityData();
    relatedData.relatedEntity = entity.getId();
    mockHistoricalDataService.getHistoricalDataFor.and.resolveTo([relatedData]);

    component.onInitFromDynamicConfig({ entity: entity });
    tick();

    expect(component.entries).toEqual([relatedData]);
    expect(mockHistoricalDataService.getHistoricalDataFor).toHaveBeenCalledWith(
      entity.getId()
    );
  }));

  it("should generate new records with a link to the passed entity", () => {
    const entity = new Entity();
    component.onInitFromDynamicConfig({ entity: entity });

    const newEntry = component.getNewEntryFunction()();

    expect(newEntry.relatedEntity).toBe(entity.getId());
    expect(moment(newEntry.date).isSame(new Date(), "day")).toBeTrue();
  });
});
