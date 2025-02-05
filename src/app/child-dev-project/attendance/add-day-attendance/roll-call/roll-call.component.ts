import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from "@angular/core";
import { animate, style, transition, trigger } from "@angular/animations";
import {
  ATTENDANCE_STATUS_CONFIG_ID,
  AttendanceStatusType,
} from "../../model/attendance-status";
import { Note } from "../../../notes/model/note";
import { EventAttendance } from "../../model/event-attendance";
import { ConfigService } from "../../../../core/config/config.service";
import { EntityMapperService } from "../../../../core/entity/entity-mapper.service";
import { Child } from "../../../children/model/child";
import { LoggingService } from "../../../../core/logging/logging.service";
import { sortByAttribute } from "../../../../utils/utils";
import { NoteDetailsComponent } from "../../../notes/note-details/note-details.component";
import { FormDialogService } from "../../../../core/form-dialog/form-dialog.service";
import { NgClass, NgForOf, NgIf } from "@angular/common";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatButtonModule } from "@angular/material/button";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { ChildBlockComponent } from "../../../children/child-block/child-block.component";
import { RollCallTabComponent } from "./roll-call-tab/roll-call-tab.component";
import {
  HAMMER_GESTURE_CONFIG,
  HammerGestureConfig,
  HammerModule,
} from "@angular/platform-browser";
import Hammer from "hammerjs";

// Only allow horizontal swiping
class HorizontalHammerConfig extends HammerGestureConfig {
  overrides = {
    swipe: { direction: Hammer.DIRECTION_HORIZONTAL },
    pinch: { enable: false },
    rotate: { enable: false },
  };
}

/**
 * Displays the participants of the given event one by one to mark attendance status.
 */
@Component({
  selector: "app-roll-call",
  templateUrl: "./roll-call.component.html",
  styleUrls: ["./roll-call.component.scss"],
  animations: [
    trigger("completeRollCall", [
      transition("void => *", [
        style({ backgroundColor: "transparent" }),
        animate(1000),
      ]),
    ]),
  ],
  imports: [
    NgIf,
    MatProgressBarModule,
    MatButtonModule,
    FontAwesomeModule,
    ChildBlockComponent,
    NgForOf,
    NgClass,
    RollCallTabComponent,
    HammerModule,
  ],
  providers: [
    {
      provide: HAMMER_GESTURE_CONFIG,
      useClass: HorizontalHammerConfig,
    },
  ],
  standalone: true,
})
export class RollCallComponent implements OnChanges {
  /**
   * The event to be displayed and edited.
   */
  @Input() eventEntity: Note;

  /**
   * (optional) property name of the participant entities by which they are sorted
   */
  @Input() sortParticipantsBy?: string;

  /**
   * Emitted when the roll call is finished and results can be saved.
   */
  @Output() complete = new EventEmitter<Note>();

  /**
   * Emitted when the user wants to dismiss & leave the roll call view.
   */
  @Output() exit = new EventEmitter();

  /**
   * The index, child and attendance that is currently being processed
   */
  currentIndex = 0;
  currentChild: Child;
  currentAttendance: EventAttendance;
  /**
   * whether any changes have been made to the model
   */
  isDirty: boolean = false;

  /** options available for selecting an attendance status */
  availableStatus: AttendanceStatusType[];

  children: Child[] = [];

  constructor(
    private configService: ConfigService,
    private entityMapper: EntityMapperService,
    private formDialog: FormDialogService,
    private loggingService: LoggingService
  ) {}

  async ngOnChanges(changes: SimpleChanges) {
    if (changes.eventEntity) {
      this.loadAttendanceStatusTypes();
      await this.loadParticipants();
      this.setInitialIndex();
    }
    if (changes.sortParticipantsBy) {
      this.sortParticipants();
    }
  }

  /**
   * Set the index of the first child that expects user input.
   * This is the first entry of the list, if the user has never recorded attendance
   * for this event. Else it is the first child without any attendance information
   * (i.e. got skipped or the user left at this child)
   * @private
   */
  private setInitialIndex() {
    let index = 0;
    for (const entry of this.children) {
      if (!this.eventEntity.getAttendance(entry.getId())?.status?.id) {
        break;
      }
      index += 1;
    }

    // do not jump to end - if all participants are recorded, start with first instead
    if (index >= this.children.length) {
      index = 0;
    }

    this.goToParticipantWithIndex(index);
  }

  private loadAttendanceStatusTypes() {
    this.availableStatus =
      this.configService.getConfigurableEnumValues<AttendanceStatusType>(
        ATTENDANCE_STATUS_CONFIG_ID
      );
  }

  private async loadParticipants() {
    this.children = [];
    for (const childId of this.eventEntity.children) {
      let child;
      try {
        child = await this.entityMapper.load(Child, childId);
      } catch (e) {
        this.loggingService.warn(
          "Could not find child " +
            childId +
            " for event " +
            this.eventEntity.getId()
        );
        this.eventEntity.removeChild(childId);
        continue;
      }
      this.children.push(child);
    }
    this.sortParticipants();
  }

  private sortParticipants() {
    if (!this.sortParticipantsBy) {
      return;
    }

    this.children.sort(sortByAttribute<any>(this.sortParticipantsBy, "asc"));
    // also sort the participants in the Note entity itself for display in details view later
    this.eventEntity.children = this.children.map((e) => e.getId());
  }

  markAttendance(status: AttendanceStatusType) {
    this.currentAttendance.status = status;
    this.isDirty = true;

    this.goToNext();
  }

  goToParticipantWithIndex(newIndex: number) {
    this.currentIndex = newIndex;

    if (this.isFinished) {
      this.complete.emit(this.eventEntity);
    } else {
      this.currentChild = this.children[this.currentIndex];
      this.currentAttendance = this.eventEntity.getAttendance(
        this.currentChild.getId()
      );
    }
  }

  goToPrevious() {
    if (this.currentIndex - 1 >= 0) {
      this.goToParticipantWithIndex(this.currentIndex - 1);
    }
  }

  goToNext() {
    if (this.currentIndex + 1 <= this.children.length) {
      this.goToParticipantWithIndex(this.currentIndex + 1);
    }
  }

  goToFirst() {
    this.goToParticipantWithIndex(0);
  }

  goToLast() {
    // jump directly to completed state, i.e. beyond last participant index
    this.goToParticipantWithIndex(this.children.length);
  }

  get isFirst(): boolean {
    return this.currentIndex === 0;
  }

  get isLast(): boolean {
    return this.currentIndex === this.children.length - 1;
  }

  get isFinished(): boolean {
    return this.currentIndex >= this.children.length;
  }

  finish() {
    this.exit.emit();
  }

  showDetails() {
    this.formDialog.openDialog(NoteDetailsComponent, this.eventEntity);
  }
}
