# Discord Build Tracker

Tracks the latest builds of Discord for the stable, PTB, and canary release channels every minute.

**Base API URL**: `https://discord-build-tracker.hampuskraft.workers.dev`

## Constants

### `ReleaseChannel`

| Constant | Value    |
| -------- | -------- |
| Stable   | 'stable' |
| Ptb      | 'ptb'    |
| Canary   | 'canary' |

## Types

### `BuildResponse`

Timestamps are in milliseconds since the Unix epoch.

| Field        | Type    | Description                      |
| ------------ | ------- | -------------------------------- |
| channel      | string  | The release channel.             |
| build_number | number  | The build number.                |
| version_hash | string  | The version hash.                |
| timestamp    | number  | The timestamp of the build.      |
| rollback     | boolean | Whether the build is a rollback. |

## Endpoints

### GET `/`

Redirects to the GitHub repository.

#### Response

Redirects to `https://github.com/hampuskraft/discord-build-tracker` with a 302 status code.

---

### GET `/stats`

Fetches statistics about the build database.

#### Response Schema

| Field    | Type   | Description                                    |
| -------- | ------ | ---------------------------------------------- |
| total    | number | The total number of builds in the database.    |
| stable   | number | The number of stable builds in the database.   |
| ptb      | number | The number of PTB builds in the database.      |
| canary   | number | The number of canary builds in the database.   |
| rollback | number | The number of rollback builds in the database. |

---

### GET `/latest/all`

Fetches the latest build for each release channel.

#### Response Schema

| Field  | Type                            | Description              |
| ------ | ------------------------------- | ------------------------ |
| canary | [BuildResponse](#buildresponse) | The latest canary build. |
| ptb    | [BuildResponse](#buildresponse) | The latest PTB build.    |
| stable | [BuildResponse](#buildresponse) | The latest stable build. |

---

### GET `/latest/:type`

Fetches the latest build for a specific release channel.

#### Path Parameters

| Parameter | Type   | Description                   |
| --------- | ------ | ----------------------------- |
| type      | string | The release channel to fetch. |

Refer to [ReleaseChannel](#releasechannel) for possible values.

#### Response Schema

See [BuildResponse](#buildresponse).

---

### GET `/search`

Fetches builds based on query parameters. All query parameters are optional.

#### Query Parameters

| Parameter | Type    | Description                            |
| --------- | ------- | -------------------------------------- |
| type      | string  | The release channel to fetch.          |
| before    | number  | The timestamp to fetch builds before.  |
| after     | number  | The timestamp to fetch builds after.   |
| limit     | number  | The maximum number of builds to fetch. |
| rollback  | boolean | Whether to fetch rollback builds.      |

Refer to [ReleaseChannel](#releasechannel) for `type` values.

#### Response Schema

Array of [BuildResponse](#buildresponse).
