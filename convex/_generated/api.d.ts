/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as createDeal from "../createDeal.js";
import type * as customTemplates from "../customTemplates.js";
import type * as dealDerivedHealth from "../dealDerivedHealth.js";
import type * as dealMessages from "../dealMessages.js";
import type * as dealPhaseSync from "../dealPhaseSync.js";
import type * as dealUpdates from "../dealUpdates.js";
import type * as devAuthReset from "../devAuthReset.js";
import type * as devRoster from "../devRoster.js";
import type * as documentUpdates from "../documentUpdates.js";
import type * as http from "../http.js";
import type * as membership from "../membership.js";
import type * as migrations from "../migrations.js";
import type * as reports from "../reports.js";
import type * as seed from "../seed.js";
import type * as seedData from "../seedData.js";
import type * as starterClosing from "../starterClosing.js";
import type * as taskUpdates from "../taskUpdates.js";
import type * as templateApply from "../templateApply.js";
import type * as viewer from "../viewer.js";
import type * as workspace from "../workspace.js";
import type * as workspaceAccess from "../workspaceAccess.js";
import type * as workspaceRosterAdmin from "../workspaceRosterAdmin.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  createDeal: typeof createDeal;
  customTemplates: typeof customTemplates;
  dealDerivedHealth: typeof dealDerivedHealth;
  dealMessages: typeof dealMessages;
  dealPhaseSync: typeof dealPhaseSync;
  dealUpdates: typeof dealUpdates;
  devAuthReset: typeof devAuthReset;
  devRoster: typeof devRoster;
  documentUpdates: typeof documentUpdates;
  http: typeof http;
  membership: typeof membership;
  migrations: typeof migrations;
  reports: typeof reports;
  seed: typeof seed;
  seedData: typeof seedData;
  starterClosing: typeof starterClosing;
  taskUpdates: typeof taskUpdates;
  templateApply: typeof templateApply;
  viewer: typeof viewer;
  workspace: typeof workspace;
  workspaceAccess: typeof workspaceAccess;
  workspaceRosterAdmin: typeof workspaceRosterAdmin;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
