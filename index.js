const { EventEmitter } = require("events");

const debug =
    process.env.NODE_DEBUG && process.env.NODE_DEBUG.includes("node-nfc-nci");

const moduleFile = debug
    ? `./build/Debug/node-nfc-nci.node`
    : `./build/Release/node-nfc-nci.node`;

const native_nci = require(moduleFile);

class NCIListener extends EventEmitter {
    constructor() {
        super();

        this.emitter = new EventEmitter();
        this.context = null;

        this.emitter.on("arrived", (tag) => {
            tag.write = (type, content) =>
                this.context.immediateWrite({ type, content });

            this.emit("arrived", tag);
        });

        this.emitter.on("error", (error) => {
            this.emit("error", error);
        });

        this.emitter.on("departed", (tag) => {
            this.emit("departed", tag);
        });

        this.emitter.on("written", (tag, previous) => {
            this.emit("written", tag, previous);
        });
    }

    setNextWrite(type, content) {
        this.context.setNextWrite({ type, content });
    }

    clearNextWrite() {
        this.context.clearNextWrite();
    }

    hasNextWrite() {
        return this.context.hasNextWrite();
    }

    listen(cb) {
        this.context = native_nci.listen(this.emitter.emit.bind(this.emitter));

        if (cb) {
            cb(this);
        }
    }
}

module.exports = new NCIListener();
