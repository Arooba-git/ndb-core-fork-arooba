import { Component } from "@angular/core";
import { ComingSoonDialogService } from "../../../core/coming-soon/coming-soon-dialog.service";

@Component({
  selector: "app-attendance-manager",
  templateUrl: "./attendance-manager.component.html",
  styleUrls: ["./attendance-manager.component.scss"],
})
export class AttendanceManagerComponent {
  constructor(public comingSoonDialog: ComingSoonDialogService) {}
}
