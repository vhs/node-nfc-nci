# node-nfc-nci

NXP NFC NCI Linux Node wrapper

## Install

```
npm install @vhs/node-nfc-nci
```

**Note**: See [Requirements](#requirements) for installation requirements

## Usage

```javascript
const nci = require("node-nfc-nci");
```

This module exports an NCI interface object with single method: `listen`.

### `listen(callback: (context: EventEmitter) => void)`

When called, `listen` will attempt to initialize the device (on a separate thread) via the embedded `linux_libnfc-nci` library and if successful, immediately call the callback with a `context` object.

The `context` object passed to the callback is an event emitter and enables asynchronous operations between reading tags.

See [Events](#events) below for more information about the events.
See [Context](#context) below for more information about the context object.

## Events

| Event      | Argument(s)                     | Description                                                                                                                                                            |
| ---------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `error`    | `message<string>`               | emits on any error, even for errors when attempting to initialize the device.                                                                                          |
| `arrived`  | `tag<Tag>`                      | emits on NFC tag arrival                                                                                                                                               |
| `departed` | `tag<Tag>`                      | emits on NFC tag departure. Provide a copy of the original arrived tag. If NDEF data has been updated during the tag's presence it will not be reflected in departure. |
| `written`  | `current<Tag>`, `previous<Tag>` | emits on successful tag NDEF write. Provides updated tag and a copy of the original arrived tag prior to update.                                                       |

## Objects and Interfaces

### Context

#### Methods

##### `context.setNextWrite(type<string>, content<string>)`

Sets data to write for next tag to be detected.

This will attempt to indiscriminately write the next tag that arrives.

##### `context.clearNextWrite()`

Clears the pending next write.

##### `context.hasNextWrite()<bool>`

Check if there is a next write pending.

##### `context.immediateWrite(type<string>, content<string>)`

Attempts to immediately write to any device that is present.
However, tag `arrived` event provides a `tag.write` function which is an alias of `immediateWrite` but likely more practical because `immediateWrite` depends on a device being present.

### Tag Object

For properties, see example below.

#### Methods

##### `tag.write(type<string>, content<string>)`

This method attempts to immediately write to which ever tag is present.

As `tag.write` is a thin wrapper to `context.immediateWrite`, there are no guarantees that this write will only write to the tag specified in the `tag` object that was passed.

Acceptable types

-   `Text` - writes `en` lang text to the NDEF content |

Example of a typical Tag Object payload

```JSON
{
  "technology": {
    "code": 9,
    "name": "Type A - Mifare Ul",
    "type": "MIFARE_UL"
  },
  "uid": {
    "id": "04:e1:5f:d2:9c:39:80",
    "type": "NFCID1",
    "length": 7
  },
  "ndef": {
    "size": 868,
    "length": 18,
    "read": 11,
    "writeable": true,
    "type": "Text",
    "content": "hello world"
  }
}
```

## Example

```javascript
const nci = require("node-nfc-nci");

nci.listen((context) => {
    context.on("error", (msg) => console.log(msg));

    context.on("arrived", (tag) => {
        console.log(`ARRIVED: ${JSON.stringify(tag)}`);

        if (!context.hasNextWrite()) {
            if (tag.uid.id === "04:e1:5f:d2:9c:39:80") {
                tag.write("Text", "hello world");
            }
        }
    });

    context.on("written", (tag, previous) => {
        console.log(`PREVIOUS: ${JSON.stringify(previous)}`);
        console.log(`UPDATED: ${JSON.stringify(tag)}`);
    });

    context.on("departed", (tag) => {
        console.log(`DEPARTED: ${JSON.stringify(tag)}`);

        if (tag.ndef.content !== "foobar") {
            context.setNextWrite("Text", "foobar"); // will attempt write on any next tag
        }
    });
});
```

## Requirements

As this module compiles and uses an embedded version of the library, installing this module only requires base development/build tools.

### Alpine

`sudo apk --no-cache alpine-sdk autoconf automake bash cmake libtool`

### Debian/Ubuntu

`sudo apt install -y cmake automake autoconf libtool pkg-config`
