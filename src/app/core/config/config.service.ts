import { Injectable } from "@angular/core";
import { EntityMapperService } from "../entity/entity-mapper.service";
import { Config } from "./config";
import { Observable, ReplaySubject } from "rxjs";
import {
  CONFIGURABLE_ENUM_CONFIG_PREFIX,
  ConfigurableEnumConfig,
  ConfigurableEnumValue,
} from "../configurable-enum/configurable-enum.interface";
import { filter } from "rxjs/operators";
import { LoggingService } from "../logging/logging.service";

/**
 * Access dynamic app configuration retrieved from the database
 * that defines how the interface and data models should look.
 */
@Injectable({ providedIn: "root" })
export class ConfigService {
  /**
   * Subscribe to receive the current config and get notified whenever the config is updated.
   */
  private _configUpdates = new ReplaySubject<Config>(1);
  private currentConfig: Config;

  get configUpdates(): Observable<Config> {
    return this._configUpdates.asObservable();
  }

  constructor(
    private entityMapper: EntityMapperService,
    private logger: LoggingService
  ) {
    this.loadConfig();
    this.entityMapper
      .receiveUpdates(Config)
      .pipe(filter(({ entity }) => entity.getId() === Config.CONFIG_KEY))
      .subscribe(({ entity }) => this.updateConfigIfChanged(entity));
  }

  async loadConfig(): Promise<void> {
    this.entityMapper
      .load(Config, Config.CONFIG_KEY)
      .then((config) => this.detectLegacyConfig(config))
      .then((config) => this.updateConfigIfChanged(config))
      .catch(() => {});
  }

  private updateConfigIfChanged(config: Config) {
    if (!this.currentConfig || config._rev !== this.currentConfig?._rev) {
      this.currentConfig = config;
      this._configUpdates.next(config);
    }
  }

  public saveConfig(config: any): Promise<void> {
    return this.entityMapper.save(new Config(Config.CONFIG_KEY, config), true);
  }

  public exportConfig(): string {
    return JSON.stringify(this.currentConfig.data);
  }

  public getConfig<T>(id: string): T {
    return this.currentConfig.data[id];
  }

  /**
   * Get the array of pre-defined values for the given configurable enum id.
   * @param id
   */
  public getConfigurableEnumValues<T extends ConfigurableEnumValue>(
    id: string
  ): ConfigurableEnumConfig<T> {
    if (!id.startsWith(CONFIGURABLE_ENUM_CONFIG_PREFIX)) {
      id = CONFIGURABLE_ENUM_CONFIG_PREFIX + id;
    }
    return this.getConfig<any>(id);
  }

  public getAllConfigs<T>(prefix: string): T[] {
    const matchingConfigs = [];
    for (const id of Object.keys(this.currentConfig.data)) {
      if (id.startsWith(prefix)) {
        this.currentConfig.data[id]._id = id;
        matchingConfigs.push(this.currentConfig.data[id]);
      }
    }
    return matchingConfigs;
  }

  private detectLegacyConfig(config: Config): Config {
    // ugly but easy ... could use https://www.npmjs.com/package/jsonpath-plus in future
    const configString = JSON.stringify(config);
    if (
      configString.includes("EditEntityArray") ||
      configString.includes("EditSingleEntity")
    ) {
      this.logger.warn(
        "Legacy Config: EditEntityArray/EditSingleEntity found - you should use dataType instead"
      );
    }

    if (configString.includes("ImportantNotesComponent")) {
      this.logger.warn(
        "Legacy Config: ImportantNotesComponent found - you should use 'ImportantNotesDashboard' instead"
      );
    }

    return config;
  }
}
