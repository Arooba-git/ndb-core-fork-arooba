import { ComponentFixture, TestBed } from "@angular/core/testing";

import { RelatedEntitiesComponent } from "./related-entities.component";
import { MockedTestingModule } from "../../../../utils/mocked-testing.module";
import { EntityMapperService } from "../../../entity/entity-mapper.service";
import { Child } from "../../../../child-dev-project/children/model/child";
import { ChildSchoolRelation } from "../../../../child-dev-project/children/model/childSchoolRelation";

describe("RelatedEntitiesComponent", () => {
  let component: RelatedEntitiesComponent;
  let fixture: ComponentFixture<RelatedEntitiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RelatedEntitiesComponent, MockedTestingModule.withState()],
    }).compileComponents();

    fixture = TestBed.createComponent(RelatedEntitiesComponent);
    component = fixture.componentInstance;
    await component.onInitFromDynamicConfig({
      entity: new Child(),
      config: {
        entity: ChildSchoolRelation.ENTITY_TYPE,
        property: "childId",
        columns: [],
      },
    });
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should load the entities which are linked with the passed one", async () => {
    const c1 = new Child();
    const c2 = new Child();
    const r1 = new ChildSchoolRelation();
    r1.childId = c1.getId();
    const r2 = new ChildSchoolRelation();
    r2.childId = c1.getId();
    const r3 = new ChildSchoolRelation();
    r3.childId = c2.getId();
    const entityMapper = TestBed.inject(EntityMapperService);
    await entityMapper.saveAll([c1, c2, r1, r2, r3]);
    const columns = ["start", "end", "schoolId"];
    const filter = { start: { $exists: true } } as any;

    await component.onInitFromDynamicConfig({
      entity: c1,
      config: {
        entity: ChildSchoolRelation.ENTITY_TYPE,
        property: "childId",
        columns,
        filter,
      },
    });

    expect(component.columns).toBe(columns);
    expect(component.data).toEqual([r1, r2, r3]);
    expect(component.filter).toEqual({ ...filter, childId: c1.getId() });
  });

  it("should create a new entity that references the related one", async () => {
    const related = new Child();
    await component.onInitFromDynamicConfig({
      entity: related,
      config: {
        entity: ChildSchoolRelation.ENTITY_TYPE,
        property: "childId",
        columns: [],
      },
    });

    const newEntity = component.createNewRecordFactory()();

    expect(newEntity instanceof ChildSchoolRelation).toBeTrue();
    expect(newEntity["childId"]).toBe(related.getId());
  });
});
