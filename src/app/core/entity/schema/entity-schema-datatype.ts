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


import { EntitySchemaField } from './entity-schema-field';
import { EntitySchemaService } from './entity-schema.service';
import { Entity } from '../entity';

/**
 * Interface to be implemented by any Datatype transformer of the Schema system.
 */
export interface EntitySchemaDatatype {
  name: string;
  transformToDatabaseFormat(value: any, schemaField: EntitySchemaField, schemaService: EntitySchemaService, parent: Entity): any;
  transformToObjectFormat(value: any, schemaField: EntitySchemaField, schemaService: EntitySchemaService, parent: any): any;
}
