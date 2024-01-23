# Discord Build Tracker

The Discord Build Tracker API provides semi-realtime tracking of Discord build updates across stable, PTB, and canary channels.

**Base API URL**: `https://discord-build-tracker.hampuskraft.workers.dev`

## Constants

### `ReleaseChannel`

| Constant | Value    |
| -------- | -------- |
| STABLE   | 'stable' |
| PTB      | 'ptb'    |
| CANARY   | 'canary' |

## Types

### `BuildResponse`

| Field        | Type    | Description                       |
| ------------ | ------- | --------------------------------- |
| channel      | String  | Release channel of the build      |
| build_number | Number  | The build number                  |
| version_hash | String  | The version hash of the build     |
| timestamp    | Int64   | Timestamp of the build            |
| rollback     | Boolean | Optional; true if it's a rollback |

## Endpoints

### GET `/`

Redirects to a specific URL.

#### Response

Redirects to `https://github.com/hampuskraft/discord-build-tracker` with a 302 status code.

---

### GET `/stats`

Provides statistics about the builds.

#### Response Schema

| Field    | Type   | Description                                   |
| -------- | ------ | --------------------------------------------- |
| total    | Number | Total number of builds                        |
| stable   | Number | Number of builds in the STABLE channel        |
| ptb      | Number | Number of builds in the PTB channel           |
| canary   | Number | Number of builds in the CANARY channel        |
| rollback | Number | Number of builds that were marked as rollback |

---

### GET `/latest/all`

Fetches the latest build for all release channels.

#### Response Schema

| Field  | Type                            | Description                         |
| ------ | ------------------------------- | ----------------------------------- |
| canary | [BuildResponse](#buildresponse) | Latest build for the CANARY channel |
| ptb    | [BuildResponse](#buildresponse) | Latest build for the PTB channel    |
| stable | [BuildResponse](#buildresponse) | Latest build for the STABLE channel |

---

### GET `/latest/:type`

Fetches the latest build for a specific release channel.

#### Path Parameters

| Parameter | Type   | Description                     |
| --------- | ------ | ------------------------------- |
| type      | String | The type of the release channel |

Refer to [ReleaseChannel](#releasechannel) for possible values.

#### Response Schema

See [BuildResponse](#buildresponse).

---

### GET `/search`

Searches builds based on various query parameters.

#### Query Parameters

| Parameter | Type    | Description                                            |
| --------- | ------- | ------------------------------------------------------ |
| type      | String  | Optional; the type of the release channel              |
| before    | Int64   | Optional; fetch builds before this unix timestamp (ms) |
| after     | Int64   | Optional; fetch builds after this unix timestamp (ms)  |
| limit     | Number  | Optional; limit for the number of results              |
| rollback  | Boolean | Optional; filter by rollback status                    |

Refer to [ReleaseChannel](#releasechannel) for `type` values.

#### Response Schema

Array of [BuildResponse](#buildresponse).
