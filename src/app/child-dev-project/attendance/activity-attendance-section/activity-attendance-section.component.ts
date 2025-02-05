import {
  Component,
  Inject,
  Input,
  LOCALE_ID,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { OnInitDynamicComponent } from "../../../core/view/dynamic-components/on-init-dynamic-component.interface";
import { RecurringActivity } from "../model/recurring-activity";
import { AttendanceDetailsComponent } from "../attendance-details/attendance-details.component";
import { AttendanceService } from "../attendance.service";
import { formatPercent, NgIf } from "@angular/common";
import { ActivityAttendance } from "../model/activity-attendance";
import moment from "moment";
import { FormFieldConfig } from "../../../core/entity-components/entity-form/entity-form/FormConfig";
import { FormDialogService } from "../../../core/form-dialog/form-dialog.service";
import { DynamicComponent } from "../../../core/view/dynamic-components/dynamic-component.decorator";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatButtonModule } from "@angular/material/button";
import { EntitySubrecordComponent } from "../../../core/entity-components/entity-subrecord/entity-subrecord/entity-subrecord.component";
import { AttendanceCalendarComponent } from "../attendance-calendar/attendance-calendar.component";
import { AttendanceSummaryComponent } from "../attendance-summary/attendance-summary.component";

@DynamicComponent("ActivityAttendanceSection")
@Component({
  selector: "app-activity-attendance-section",
  templateUrl: "./activity-attendance-section.component.html",
  imports: [
    NgIf,
    MatProgressBarModule,
    EntitySubrecordComponent,
    MatSlideToggleModule,
    MatTooltipModule,
    MatButtonModule,
    AttendanceCalendarComponent,
    AttendanceSummaryComponent,
  ],
  standalone: true,
})
export class ActivityAttendanceSectionComponent
  implements OnChanges, OnInitDynamicComponent
{
  @Input() activity: RecurringActivity;
  @Input() forChild?: string;

  loading: boolean = true;
  records: ActivityAttendance[] = [];
  allRecords: ActivityAttendance[] = [];
  combinedAttendance: ActivityAttendance;

  columns: FormFieldConfig[] = [
    {
      id: "periodFrom",
      label: $localize`:The month something took place:Month`,
      view: "DisplayDate",
      additional: "YYYY-MM",
    },
    {
      id: "presentEvents",
      label: $localize`:How many children are present at a meeting|Title of table column:Present`,
      view: "ReadonlyFunction",
      additional: (e: ActivityAttendance) =>
        this.forChild
          ? e.countEventsPresent(this.forChild)
          : e.countTotalPresent(),
    },
    {
      id: "totalEvents",
      label: $localize`:Events of an attendance:Events`,
      view: "ReadonlyFunction",
      additional: (e: ActivityAttendance) => e.countEventsTotal(),
    },
    {
      id: "attendancePercentage",
      label: $localize`:Percentage of people that attended an event:Attended`,
      view: "ReadonlyFunction",
      additional: (e: ActivityAttendance) =>
        formatPercent(
          this.forChild
            ? e.getAttendancePercentage(this.forChild)
            : e.getAttendancePercentageAverage(),
          this.locale,
          "1.0-0"
        ),
    },
  ];

  constructor(
    private attendanceService: AttendanceService,
    @Inject(LOCALE_ID) private locale: string,
    private formDialog: FormDialogService
  ) {}

  async ngOnChanges(changes: SimpleChanges) {
    if (
      changes.hasOwnProperty("activity") ||
      changes.hasOwnProperty("forChild")
    ) {
      await this.init();
    }
  }

  async onInitFromDynamicConfig(config: any) {
    this.activity = config.entity as RecurringActivity;
    await this.init();
  }

  async init(loadAll: boolean = false) {
    this.loading = true;
    if (loadAll) {
      this.allRecords = await this.attendanceService.getActivityAttendances(
        this.activity
      );
    } else {
      this.allRecords = await this.attendanceService.getActivityAttendances(
        this.activity,
        moment().startOf("month").subtract(6, "months").toDate()
      );
    }
    this.updateDisplayedRecords(false);
    this.createCombinedAttendance();
    this.loading = false;
  }

  private createCombinedAttendance() {
    this.combinedAttendance = new ActivityAttendance();
    this.combinedAttendance.activity = this.activity;
    this.allRecords.forEach((record) => {
      this.combinedAttendance.events.push(...record.events);
      if (
        !this.combinedAttendance.periodFrom ||
        moment(record.periodFrom).isBefore(
          this.combinedAttendance.periodFrom,
          "day"
        )
      ) {
        this.combinedAttendance.periodFrom = record.periodFrom;
      }

      if (
        !this.combinedAttendance.periodTo ||
        moment(record.periodTo).isAfter(this.combinedAttendance.periodTo, "day")
      ) {
        this.combinedAttendance.periodTo = record.periodTo;
      }
    });
  }

  updateDisplayedRecords(includeRecordsWithoutParticipation: boolean) {
    if (includeRecordsWithoutParticipation || !this.forChild) {
      this.records = this.allRecords;
    } else {
      this.records = this.allRecords.filter(
        (r) =>
          r.countEventsAbsent(this.forChild) +
            r.countEventsPresent(this.forChild) >
          0
      );
    }

    if (this.records?.length > 0) {
      this.records.sort(
        (a, b) => b.periodFrom.getTime() - a.periodFrom.getTime()
      );
    }
  }

  showDetails(activity: ActivityAttendance) {
    this.formDialog.openDialog(AttendanceDetailsComponent, activity, {
      forChild: this.forChild,
    });
  }

  getBackgroundColor?: (rec: ActivityAttendance) => string = (
    rec: ActivityAttendance
  ) => rec.getColor(this.forChild);
}
