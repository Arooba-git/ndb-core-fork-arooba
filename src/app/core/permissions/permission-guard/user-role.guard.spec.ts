import { TestBed } from "@angular/core/testing";

import { UserRoleGuard } from "./user-role.guard";
import { SessionService } from "../../session/session-service/session.service";
import { RouterTestingModule } from "@angular/router/testing";
import { ActivatedRouteSnapshot, Router } from "@angular/router";
import { AuthUser } from "../../session/session-service/auth-user";
import { ConfigService } from "../../config/config.service";
import { PREFIX_VIEW_CONFIG } from "../../view/dynamic-routing/view-config.interface";

describe("UserRoleGuard", () => {
  let guard: UserRoleGuard;
  let mockSessionService: jasmine.SpyObj<SessionService>;
  const normalUser: AuthUser = { name: "normalUser", roles: ["user_app"] };
  const adminUser: AuthUser = {
    name: "admin",
    roles: ["admin", "user_app"],
  };
  let mockConfigService: jasmine.SpyObj<ConfigService>;

  beforeEach(() => {
    mockSessionService = jasmine.createSpyObj(["getCurrentUser"]);
    mockConfigService = jasmine.createSpyObj(["getConfig"]);

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: SessionService, useValue: mockSessionService },
        UserRoleGuard,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    });
    guard = TestBed.inject(UserRoleGuard);
  });

  it("should be created", () => {
    expect(guard).toBeTruthy();
  });

  it("should return true if current user is allowed", () => {
    mockSessionService.getCurrentUser.and.returnValue(adminUser);

    const result = guard.canActivate({
      routeConfig: { path: "url" },
      data: { permittedUserRoles: ["admin"] },
    } as any);

    expect(result).toBeTrue();
  });

  it("should return false for a user without permissions", () => {
    mockSessionService.getCurrentUser.and.returnValue(normalUser);
    const router = TestBed.inject(Router);
    spyOn(router, "navigate");

    const result = guard.canActivate({
      routeConfig: { path: "url" },
      data: { permittedUserRoles: ["admin"] },
    } as any);

    expect(result).toBeFalse();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it("should navigate to 404 for real navigation requests without permissions", () => {
    mockSessionService.getCurrentUser.and.returnValue(normalUser);
    const router = TestBed.inject(Router);
    spyOn(router, "navigate");
    const route = new ActivatedRouteSnapshot();
    Object.assign(route, {
      routeConfig: { path: "url" },
      data: { permittedUserRoles: ["admin"] },
    });

    guard.canActivate(route);

    expect(router.navigate).toHaveBeenCalledWith(["/404"]);
  });

  it("should return true if no config is set", () => {
    const result = guard.canActivate({ routeConfig: { path: "url" } } as any);

    expect(result).toBeTrue();
  });

  it("should check permissions of a given route (checkRoutePermissions)", () => {
    mockConfigService.getConfig.and.callFake((id) => {
      switch (id) {
        case PREFIX_VIEW_CONFIG + "free":
          return {} as any;
        case PREFIX_VIEW_CONFIG + "restricted":
          return { permittedUserRoles: ["admin"] } as any;
      }
    });

    mockSessionService.getCurrentUser.and.returnValue(normalUser);
    expect(guard.checkRoutePermissions("free")).toBeTrue();
    expect(guard.checkRoutePermissions("/free")).toBeTrue();
    expect(guard.checkRoutePermissions("restricted")).toBeFalse();

    mockSessionService.getCurrentUser.and.returnValue(adminUser);
    expect(guard.checkRoutePermissions("free")).toBeTrue();
    expect(guard.checkRoutePermissions("restricted")).toBeTrue();
  });
});
