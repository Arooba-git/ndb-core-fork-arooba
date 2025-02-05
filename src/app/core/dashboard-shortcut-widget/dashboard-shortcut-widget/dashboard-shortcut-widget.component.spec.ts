import { ComponentFixture, TestBed } from "@angular/core/testing";
import { DashboardShortcutWidgetComponent } from "./dashboard-shortcut-widget.component";
import { FontAwesomeTestingModule } from "@fortawesome/angular-fontawesome/testing";

describe("ShortcutDashboardWidgetComponent", () => {
  let component: DashboardShortcutWidgetComponent;
  let fixture: ComponentFixture<DashboardShortcutWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardShortcutWidgetComponent, FontAwesomeTestingModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardShortcutWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
