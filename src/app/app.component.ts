/*
 *     This file is part of ndb-core.
 *
 *     ndb-core is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU General Public License as published by
 *     the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     ndb-core is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU General Public License for more details.
 *
 *     You should have received a copy of the GNU General Public License
 *     along with ndb-core.  If not, see <http://www.gnu.org/licenses/>.
 */

import {
  Component,
  Injector,
  ViewContainerRef,
  ɵcreateInjector as createInjector,
} from "@angular/core";
import { AnalyticsService } from "./core/analytics/analytics.service";
import { ConfigService } from "./core/config/config.service";
import { RouterService } from "./core/view/dynamic-routing/router.service";
import { EntityConfigService } from "./core/entity/entity-config.service";
import { SessionService } from "./core/session/session-service/session.service";
import { ActivatedRoute, Router } from "@angular/router";
import { environment } from "../environments/environment";
import { Child } from "./child-dev-project/children/model/child";
import { School } from "./child-dev-project/schools/model/school";
import { LoginState } from "./core/session/session-states/login-state.enum";
import { LoggingService } from "./core/logging/logging.service";
import { EntityRegistry } from "./core/entity/database-entity.decorator";

/**
 * Component as the main entry point for the app.
 * Actual logic and UI structure is defined in other modules.
 */
@Component({
  selector: "app-root",
  template: "<app-ui></app-ui>",
})
export class AppComponent {
  constructor(
    private viewContainerRef: ViewContainerRef, // need this small hack in order to catch application root view container ref
    private analyticsService: AnalyticsService,
    private configService: ConfigService,
    private routerService: RouterService,
    private entityConfigService: EntityConfigService,
    private sessionService: SessionService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private entities: EntityRegistry,
    private injector: Injector
  ) {
    this.initBasicServices();
  }

  private async initBasicServices() {
    // TODO: remove this after issue #886 now in next release (keep as fallback for one version)
    this.entities.add("Participant", Child);
    this.entities.add("Team", School);

    // first register to events

    // Re-trigger services that depend on the config when something changes
    this.configService.configUpdates.subscribe(() => {
      this.routerService.initRouting();
      this.entityConfigService.setupEntitiesFromConfig();
      this.router.navigate([], {
        relativeTo: this.activatedRoute,
        queryParamsHandling: "preserve",
      });
    });

    // update the user context for remote error logging and tracking and load config initially
    this.sessionService.loginState.subscribe((newState) => {
      if (newState === LoginState.LOGGED_IN) {
        const username = this.sessionService.getCurrentUser().name;
        LoggingService.setLoggingContextUser(username);
        this.analyticsService.setUser(username);
      } else {
        LoggingService.setLoggingContextUser(undefined);
        this.analyticsService.setUser(undefined);
      }
    });

    if (environment.production) {
      this.analyticsService.init();
    }

    if (environment.demo_mode) {
      const m = await import("./core/demo-data/demo-data.module");
      createInjector(m.DemoDataModule, this.injector);
    }
  }
}
