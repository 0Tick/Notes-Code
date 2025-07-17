/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import * as $protobuf from "protobufjs/minimal";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

export const NotesCode = $root.NotesCode = (() => {

    /**
     * Namespace NotesCode.
     * @exports NotesCode
     * @namespace
     */
    const NotesCode = {};

    NotesCode.Document = (function() {

        /**
         * Properties of a Document.
         * @memberof NotesCode
         * @interface IDocument
         * @property {Array.<NotesCode.IStroke>|null} [strokes] Document strokes
         * @property {Array.<NotesCode.IImage>|null} [images] Document images
         * @property {Array.<NotesCode.ITextBlock>|null} [textBlocks] Document textBlocks
         */

        /**
         * Constructs a new Document.
         * @memberof NotesCode
         * @classdesc Represents a Document.
         * @implements IDocument
         * @constructor
         * @param {NotesCode.IDocument=} [properties] Properties to set
         */
        function Document(properties) {
            this.strokes = [];
            this.images = [];
            this.textBlocks = [];
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Document strokes.
         * @member {Array.<NotesCode.IStroke>} strokes
         * @memberof NotesCode.Document
         * @instance
         */
        Document.prototype.strokes = $util.emptyArray;

        /**
         * Document images.
         * @member {Array.<NotesCode.IImage>} images
         * @memberof NotesCode.Document
         * @instance
         */
        Document.prototype.images = $util.emptyArray;

        /**
         * Document textBlocks.
         * @member {Array.<NotesCode.ITextBlock>} textBlocks
         * @memberof NotesCode.Document
         * @instance
         */
        Document.prototype.textBlocks = $util.emptyArray;

        /**
         * Creates a new Document instance using the specified properties.
         * @function create
         * @memberof NotesCode.Document
         * @static
         * @param {NotesCode.IDocument=} [properties] Properties to set
         * @returns {NotesCode.Document} Document instance
         */
        Document.create = function create(properties) {
            return new Document(properties);
        };

        /**
         * Encodes the specified Document message. Does not implicitly {@link NotesCode.Document.verify|verify} messages.
         * @function encode
         * @memberof NotesCode.Document
         * @static
         * @param {NotesCode.IDocument} message Document message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Document.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.strokes != null && message.strokes.length)
                for (let i = 0; i < message.strokes.length; ++i)
                    $root.NotesCode.Stroke.encode(message.strokes[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.images != null && message.images.length)
                for (let i = 0; i < message.images.length; ++i)
                    $root.NotesCode.Image.encode(message.images[i], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            if (message.textBlocks != null && message.textBlocks.length)
                for (let i = 0; i < message.textBlocks.length; ++i)
                    $root.NotesCode.TextBlock.encode(message.textBlocks[i], writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified Document message, length delimited. Does not implicitly {@link NotesCode.Document.verify|verify} messages.
         * @function encodeDelimited
         * @memberof NotesCode.Document
         * @static
         * @param {NotesCode.IDocument} message Document message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Document.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Document message from the specified reader or buffer.
         * @function decode
         * @memberof NotesCode.Document
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {NotesCode.Document} Document
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Document.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.NotesCode.Document();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        if (!(message.strokes && message.strokes.length))
                            message.strokes = [];
                        message.strokes.push($root.NotesCode.Stroke.decode(reader, reader.uint32()));
                        break;
                    }
                case 2: {
                        if (!(message.images && message.images.length))
                            message.images = [];
                        message.images.push($root.NotesCode.Image.decode(reader, reader.uint32()));
                        break;
                    }
                case 3: {
                        if (!(message.textBlocks && message.textBlocks.length))
                            message.textBlocks = [];
                        message.textBlocks.push($root.NotesCode.TextBlock.decode(reader, reader.uint32()));
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Document message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof NotesCode.Document
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {NotesCode.Document} Document
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Document.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Document message.
         * @function verify
         * @memberof NotesCode.Document
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Document.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.strokes != null && message.hasOwnProperty("strokes")) {
                if (!Array.isArray(message.strokes))
                    return "strokes: array expected";
                for (let i = 0; i < message.strokes.length; ++i) {
                    let error = $root.NotesCode.Stroke.verify(message.strokes[i]);
                    if (error)
                        return "strokes." + error;
                }
            }
            if (message.images != null && message.hasOwnProperty("images")) {
                if (!Array.isArray(message.images))
                    return "images: array expected";
                for (let i = 0; i < message.images.length; ++i) {
                    let error = $root.NotesCode.Image.verify(message.images[i]);
                    if (error)
                        return "images." + error;
                }
            }
            if (message.textBlocks != null && message.hasOwnProperty("textBlocks")) {
                if (!Array.isArray(message.textBlocks))
                    return "textBlocks: array expected";
                for (let i = 0; i < message.textBlocks.length; ++i) {
                    let error = $root.NotesCode.TextBlock.verify(message.textBlocks[i]);
                    if (error)
                        return "textBlocks." + error;
                }
            }
            return null;
        };

        /**
         * Creates a Document message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof NotesCode.Document
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {NotesCode.Document} Document
         */
        Document.fromObject = function fromObject(object) {
            if (object instanceof $root.NotesCode.Document)
                return object;
            let message = new $root.NotesCode.Document();
            if (object.strokes) {
                if (!Array.isArray(object.strokes))
                    throw TypeError(".NotesCode.Document.strokes: array expected");
                message.strokes = [];
                for (let i = 0; i < object.strokes.length; ++i) {
                    if (typeof object.strokes[i] !== "object")
                        throw TypeError(".NotesCode.Document.strokes: object expected");
                    message.strokes[i] = $root.NotesCode.Stroke.fromObject(object.strokes[i]);
                }
            }
            if (object.images) {
                if (!Array.isArray(object.images))
                    throw TypeError(".NotesCode.Document.images: array expected");
                message.images = [];
                for (let i = 0; i < object.images.length; ++i) {
                    if (typeof object.images[i] !== "object")
                        throw TypeError(".NotesCode.Document.images: object expected");
                    message.images[i] = $root.NotesCode.Image.fromObject(object.images[i]);
                }
            }
            if (object.textBlocks) {
                if (!Array.isArray(object.textBlocks))
                    throw TypeError(".NotesCode.Document.textBlocks: array expected");
                message.textBlocks = [];
                for (let i = 0; i < object.textBlocks.length; ++i) {
                    if (typeof object.textBlocks[i] !== "object")
                        throw TypeError(".NotesCode.Document.textBlocks: object expected");
                    message.textBlocks[i] = $root.NotesCode.TextBlock.fromObject(object.textBlocks[i]);
                }
            }
            return message;
        };

        /**
         * Creates a plain object from a Document message. Also converts values to other types if specified.
         * @function toObject
         * @memberof NotesCode.Document
         * @static
         * @param {NotesCode.Document} message Document
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Document.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.arrays || options.defaults) {
                object.strokes = [];
                object.images = [];
                object.textBlocks = [];
            }
            if (message.strokes && message.strokes.length) {
                object.strokes = [];
                for (let j = 0; j < message.strokes.length; ++j)
                    object.strokes[j] = $root.NotesCode.Stroke.toObject(message.strokes[j], options);
            }
            if (message.images && message.images.length) {
                object.images = [];
                for (let j = 0; j < message.images.length; ++j)
                    object.images[j] = $root.NotesCode.Image.toObject(message.images[j], options);
            }
            if (message.textBlocks && message.textBlocks.length) {
                object.textBlocks = [];
                for (let j = 0; j < message.textBlocks.length; ++j)
                    object.textBlocks[j] = $root.NotesCode.TextBlock.toObject(message.textBlocks[j], options);
            }
            return object;
        };

        /**
         * Converts this Document to JSON.
         * @function toJSON
         * @memberof NotesCode.Document
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Document.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Document
         * @function getTypeUrl
         * @memberof NotesCode.Document
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Document.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/NotesCode.Document";
        };

        return Document;
    })();

    NotesCode.Stroke = (function() {

        /**
         * Properties of a Stroke.
         * @memberof NotesCode
         * @interface IStroke
         * @property {Array.<NotesCode.IPoint>|null} [points] Stroke points
         * @property {string|null} [color] Stroke color
         * @property {number|null} [width] Stroke width
         * @property {number|null} [minX] Stroke minX
         * @property {number|null} [minY] Stroke minY
         * @property {number|null} [maxX] Stroke maxX
         * @property {number|null} [maxY] Stroke maxY
         */

        /**
         * Constructs a new Stroke.
         * @memberof NotesCode
         * @classdesc Represents a Stroke.
         * @implements IStroke
         * @constructor
         * @param {NotesCode.IStroke=} [properties] Properties to set
         */
        function Stroke(properties) {
            this.points = [];
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Stroke points.
         * @member {Array.<NotesCode.IPoint>} points
         * @memberof NotesCode.Stroke
         * @instance
         */
        Stroke.prototype.points = $util.emptyArray;

        /**
         * Stroke color.
         * @member {string} color
         * @memberof NotesCode.Stroke
         * @instance
         */
        Stroke.prototype.color = "";

        /**
         * Stroke width.
         * @member {number} width
         * @memberof NotesCode.Stroke
         * @instance
         */
        Stroke.prototype.width = 0;

        /**
         * Stroke minX.
         * @member {number} minX
         * @memberof NotesCode.Stroke
         * @instance
         */
        Stroke.prototype.minX = 0;

        /**
         * Stroke minY.
         * @member {number} minY
         * @memberof NotesCode.Stroke
         * @instance
         */
        Stroke.prototype.minY = 0;

        /**
         * Stroke maxX.
         * @member {number} maxX
         * @memberof NotesCode.Stroke
         * @instance
         */
        Stroke.prototype.maxX = 0;

        /**
         * Stroke maxY.
         * @member {number} maxY
         * @memberof NotesCode.Stroke
         * @instance
         */
        Stroke.prototype.maxY = 0;

        /**
         * Creates a new Stroke instance using the specified properties.
         * @function create
         * @memberof NotesCode.Stroke
         * @static
         * @param {NotesCode.IStroke=} [properties] Properties to set
         * @returns {NotesCode.Stroke} Stroke instance
         */
        Stroke.create = function create(properties) {
            return new Stroke(properties);
        };

        /**
         * Encodes the specified Stroke message. Does not implicitly {@link NotesCode.Stroke.verify|verify} messages.
         * @function encode
         * @memberof NotesCode.Stroke
         * @static
         * @param {NotesCode.IStroke} message Stroke message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Stroke.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.points != null && message.points.length)
                for (let i = 0; i < message.points.length; ++i)
                    $root.NotesCode.Point.encode(message.points[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.color != null && Object.hasOwnProperty.call(message, "color"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.color);
            if (message.width != null && Object.hasOwnProperty.call(message, "width"))
                writer.uint32(/* id 3, wireType 5 =*/29).float(message.width);
            if (message.minX != null && Object.hasOwnProperty.call(message, "minX"))
                writer.uint32(/* id 4, wireType 5 =*/37).float(message.minX);
            if (message.minY != null && Object.hasOwnProperty.call(message, "minY"))
                writer.uint32(/* id 5, wireType 5 =*/45).float(message.minY);
            if (message.maxX != null && Object.hasOwnProperty.call(message, "maxX"))
                writer.uint32(/* id 6, wireType 5 =*/53).float(message.maxX);
            if (message.maxY != null && Object.hasOwnProperty.call(message, "maxY"))
                writer.uint32(/* id 7, wireType 5 =*/61).float(message.maxY);
            return writer;
        };

        /**
         * Encodes the specified Stroke message, length delimited. Does not implicitly {@link NotesCode.Stroke.verify|verify} messages.
         * @function encodeDelimited
         * @memberof NotesCode.Stroke
         * @static
         * @param {NotesCode.IStroke} message Stroke message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Stroke.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Stroke message from the specified reader or buffer.
         * @function decode
         * @memberof NotesCode.Stroke
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {NotesCode.Stroke} Stroke
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Stroke.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.NotesCode.Stroke();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        if (!(message.points && message.points.length))
                            message.points = [];
                        message.points.push($root.NotesCode.Point.decode(reader, reader.uint32()));
                        break;
                    }
                case 2: {
                        message.color = reader.string();
                        break;
                    }
                case 3: {
                        message.width = reader.float();
                        break;
                    }
                case 4: {
                        message.minX = reader.float();
                        break;
                    }
                case 5: {
                        message.minY = reader.float();
                        break;
                    }
                case 6: {
                        message.maxX = reader.float();
                        break;
                    }
                case 7: {
                        message.maxY = reader.float();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Stroke message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof NotesCode.Stroke
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {NotesCode.Stroke} Stroke
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Stroke.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Stroke message.
         * @function verify
         * @memberof NotesCode.Stroke
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Stroke.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.points != null && message.hasOwnProperty("points")) {
                if (!Array.isArray(message.points))
                    return "points: array expected";
                for (let i = 0; i < message.points.length; ++i) {
                    let error = $root.NotesCode.Point.verify(message.points[i]);
                    if (error)
                        return "points." + error;
                }
            }
            if (message.color != null && message.hasOwnProperty("color"))
                if (!$util.isString(message.color))
                    return "color: string expected";
            if (message.width != null && message.hasOwnProperty("width"))
                if (typeof message.width !== "number")
                    return "width: number expected";
            if (message.minX != null && message.hasOwnProperty("minX"))
                if (typeof message.minX !== "number")
                    return "minX: number expected";
            if (message.minY != null && message.hasOwnProperty("minY"))
                if (typeof message.minY !== "number")
                    return "minY: number expected";
            if (message.maxX != null && message.hasOwnProperty("maxX"))
                if (typeof message.maxX !== "number")
                    return "maxX: number expected";
            if (message.maxY != null && message.hasOwnProperty("maxY"))
                if (typeof message.maxY !== "number")
                    return "maxY: number expected";
            return null;
        };

        /**
         * Creates a Stroke message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof NotesCode.Stroke
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {NotesCode.Stroke} Stroke
         */
        Stroke.fromObject = function fromObject(object) {
            if (object instanceof $root.NotesCode.Stroke)
                return object;
            let message = new $root.NotesCode.Stroke();
            if (object.points) {
                if (!Array.isArray(object.points))
                    throw TypeError(".NotesCode.Stroke.points: array expected");
                message.points = [];
                for (let i = 0; i < object.points.length; ++i) {
                    if (typeof object.points[i] !== "object")
                        throw TypeError(".NotesCode.Stroke.points: object expected");
                    message.points[i] = $root.NotesCode.Point.fromObject(object.points[i]);
                }
            }
            if (object.color != null)
                message.color = String(object.color);
            if (object.width != null)
                message.width = Number(object.width);
            if (object.minX != null)
                message.minX = Number(object.minX);
            if (object.minY != null)
                message.minY = Number(object.minY);
            if (object.maxX != null)
                message.maxX = Number(object.maxX);
            if (object.maxY != null)
                message.maxY = Number(object.maxY);
            return message;
        };

        /**
         * Creates a plain object from a Stroke message. Also converts values to other types if specified.
         * @function toObject
         * @memberof NotesCode.Stroke
         * @static
         * @param {NotesCode.Stroke} message Stroke
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Stroke.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.arrays || options.defaults)
                object.points = [];
            if (options.defaults) {
                object.color = "";
                object.width = 0;
                object.minX = 0;
                object.minY = 0;
                object.maxX = 0;
                object.maxY = 0;
            }
            if (message.points && message.points.length) {
                object.points = [];
                for (let j = 0; j < message.points.length; ++j)
                    object.points[j] = $root.NotesCode.Point.toObject(message.points[j], options);
            }
            if (message.color != null && message.hasOwnProperty("color"))
                object.color = message.color;
            if (message.width != null && message.hasOwnProperty("width"))
                object.width = options.json && !isFinite(message.width) ? String(message.width) : message.width;
            if (message.minX != null && message.hasOwnProperty("minX"))
                object.minX = options.json && !isFinite(message.minX) ? String(message.minX) : message.minX;
            if (message.minY != null && message.hasOwnProperty("minY"))
                object.minY = options.json && !isFinite(message.minY) ? String(message.minY) : message.minY;
            if (message.maxX != null && message.hasOwnProperty("maxX"))
                object.maxX = options.json && !isFinite(message.maxX) ? String(message.maxX) : message.maxX;
            if (message.maxY != null && message.hasOwnProperty("maxY"))
                object.maxY = options.json && !isFinite(message.maxY) ? String(message.maxY) : message.maxY;
            return object;
        };

        /**
         * Converts this Stroke to JSON.
         * @function toJSON
         * @memberof NotesCode.Stroke
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Stroke.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Stroke
         * @function getTypeUrl
         * @memberof NotesCode.Stroke
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Stroke.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/NotesCode.Stroke";
        };

        return Stroke;
    })();

    NotesCode.Point = (function() {

        /**
         * Properties of a Point.
         * @memberof NotesCode
         * @interface IPoint
         * @property {number|null} [pressure] Point pressure
         * @property {number|null} [x] Point x
         * @property {number|null} [y] Point y
         */

        /**
         * Constructs a new Point.
         * @memberof NotesCode
         * @classdesc Represents a Point.
         * @implements IPoint
         * @constructor
         * @param {NotesCode.IPoint=} [properties] Properties to set
         */
        function Point(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Point pressure.
         * @member {number} pressure
         * @memberof NotesCode.Point
         * @instance
         */
        Point.prototype.pressure = 0;

        /**
         * Point x.
         * @member {number} x
         * @memberof NotesCode.Point
         * @instance
         */
        Point.prototype.x = 0;

        /**
         * Point y.
         * @member {number} y
         * @memberof NotesCode.Point
         * @instance
         */
        Point.prototype.y = 0;

        /**
         * Creates a new Point instance using the specified properties.
         * @function create
         * @memberof NotesCode.Point
         * @static
         * @param {NotesCode.IPoint=} [properties] Properties to set
         * @returns {NotesCode.Point} Point instance
         */
        Point.create = function create(properties) {
            return new Point(properties);
        };

        /**
         * Encodes the specified Point message. Does not implicitly {@link NotesCode.Point.verify|verify} messages.
         * @function encode
         * @memberof NotesCode.Point
         * @static
         * @param {NotesCode.IPoint} message Point message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Point.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.x != null && Object.hasOwnProperty.call(message, "x"))
                writer.uint32(/* id 1, wireType 5 =*/13).float(message.x);
            if (message.y != null && Object.hasOwnProperty.call(message, "y"))
                writer.uint32(/* id 2, wireType 5 =*/21).float(message.y);
            if (message.pressure != null && Object.hasOwnProperty.call(message, "pressure"))
                writer.uint32(/* id 3, wireType 5 =*/29).float(message.pressure);
            return writer;
        };

        /**
         * Encodes the specified Point message, length delimited. Does not implicitly {@link NotesCode.Point.verify|verify} messages.
         * @function encodeDelimited
         * @memberof NotesCode.Point
         * @static
         * @param {NotesCode.IPoint} message Point message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Point.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Point message from the specified reader or buffer.
         * @function decode
         * @memberof NotesCode.Point
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {NotesCode.Point} Point
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Point.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.NotesCode.Point();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 3: {
                        message.pressure = reader.float();
                        break;
                    }
                case 1: {
                        message.x = reader.float();
                        break;
                    }
                case 2: {
                        message.y = reader.float();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Point message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof NotesCode.Point
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {NotesCode.Point} Point
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Point.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Point message.
         * @function verify
         * @memberof NotesCode.Point
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Point.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.pressure != null && message.hasOwnProperty("pressure"))
                if (typeof message.pressure !== "number")
                    return "pressure: number expected";
            if (message.x != null && message.hasOwnProperty("x"))
                if (typeof message.x !== "number")
                    return "x: number expected";
            if (message.y != null && message.hasOwnProperty("y"))
                if (typeof message.y !== "number")
                    return "y: number expected";
            return null;
        };

        /**
         * Creates a Point message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof NotesCode.Point
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {NotesCode.Point} Point
         */
        Point.fromObject = function fromObject(object) {
            if (object instanceof $root.NotesCode.Point)
                return object;
            let message = new $root.NotesCode.Point();
            if (object.pressure != null)
                message.pressure = Number(object.pressure);
            if (object.x != null)
                message.x = Number(object.x);
            if (object.y != null)
                message.y = Number(object.y);
            return message;
        };

        /**
         * Creates a plain object from a Point message. Also converts values to other types if specified.
         * @function toObject
         * @memberof NotesCode.Point
         * @static
         * @param {NotesCode.Point} message Point
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Point.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.x = 0;
                object.y = 0;
                object.pressure = 0;
            }
            if (message.x != null && message.hasOwnProperty("x"))
                object.x = options.json && !isFinite(message.x) ? String(message.x) : message.x;
            if (message.y != null && message.hasOwnProperty("y"))
                object.y = options.json && !isFinite(message.y) ? String(message.y) : message.y;
            if (message.pressure != null && message.hasOwnProperty("pressure"))
                object.pressure = options.json && !isFinite(message.pressure) ? String(message.pressure) : message.pressure;
            return object;
        };

        /**
         * Converts this Point to JSON.
         * @function toJSON
         * @memberof NotesCode.Point
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Point.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Point
         * @function getTypeUrl
         * @memberof NotesCode.Point
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Point.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/NotesCode.Point";
        };

        return Point;
    })();

    NotesCode.Image = (function() {

        /**
         * Properties of an Image.
         * @memberof NotesCode
         * @interface IImage
         * @property {string|null} [image] Image image
         * @property {number|null} [x] Image x
         * @property {number|null} [y] Image y
         * @property {number|null} [scaleX] Image scaleX
         * @property {number|null} [scaleY] Image scaleY
         */

        /**
         * Constructs a new Image.
         * @memberof NotesCode
         * @classdesc Represents an Image.
         * @implements IImage
         * @constructor
         * @param {NotesCode.IImage=} [properties] Properties to set
         */
        function Image(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Image image.
         * @member {string} image
         * @memberof NotesCode.Image
         * @instance
         */
        Image.prototype.image = "";

        /**
         * Image x.
         * @member {number} x
         * @memberof NotesCode.Image
         * @instance
         */
        Image.prototype.x = 0;

        /**
         * Image y.
         * @member {number} y
         * @memberof NotesCode.Image
         * @instance
         */
        Image.prototype.y = 0;

        /**
         * Image scaleX.
         * @member {number} scaleX
         * @memberof NotesCode.Image
         * @instance
         */
        Image.prototype.scaleX = 0;

        /**
         * Image scaleY.
         * @member {number} scaleY
         * @memberof NotesCode.Image
         * @instance
         */
        Image.prototype.scaleY = 0;

        /**
         * Creates a new Image instance using the specified properties.
         * @function create
         * @memberof NotesCode.Image
         * @static
         * @param {NotesCode.IImage=} [properties] Properties to set
         * @returns {NotesCode.Image} Image instance
         */
        Image.create = function create(properties) {
            return new Image(properties);
        };

        /**
         * Encodes the specified Image message. Does not implicitly {@link NotesCode.Image.verify|verify} messages.
         * @function encode
         * @memberof NotesCode.Image
         * @static
         * @param {NotesCode.IImage} message Image message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Image.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.image != null && Object.hasOwnProperty.call(message, "image"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.image);
            if (message.x != null && Object.hasOwnProperty.call(message, "x"))
                writer.uint32(/* id 2, wireType 5 =*/21).float(message.x);
            if (message.y != null && Object.hasOwnProperty.call(message, "y"))
                writer.uint32(/* id 3, wireType 5 =*/29).float(message.y);
            if (message.scaleX != null && Object.hasOwnProperty.call(message, "scaleX"))
                writer.uint32(/* id 4, wireType 5 =*/37).float(message.scaleX);
            if (message.scaleY != null && Object.hasOwnProperty.call(message, "scaleY"))
                writer.uint32(/* id 5, wireType 5 =*/45).float(message.scaleY);
            return writer;
        };

        /**
         * Encodes the specified Image message, length delimited. Does not implicitly {@link NotesCode.Image.verify|verify} messages.
         * @function encodeDelimited
         * @memberof NotesCode.Image
         * @static
         * @param {NotesCode.IImage} message Image message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Image.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an Image message from the specified reader or buffer.
         * @function decode
         * @memberof NotesCode.Image
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {NotesCode.Image} Image
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Image.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.NotesCode.Image();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.image = reader.string();
                        break;
                    }
                case 2: {
                        message.x = reader.float();
                        break;
                    }
                case 3: {
                        message.y = reader.float();
                        break;
                    }
                case 4: {
                        message.scaleX = reader.float();
                        break;
                    }
                case 5: {
                        message.scaleY = reader.float();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes an Image message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof NotesCode.Image
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {NotesCode.Image} Image
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Image.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an Image message.
         * @function verify
         * @memberof NotesCode.Image
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Image.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.image != null && message.hasOwnProperty("image"))
                if (!$util.isString(message.image))
                    return "image: string expected";
            if (message.x != null && message.hasOwnProperty("x"))
                if (typeof message.x !== "number")
                    return "x: number expected";
            if (message.y != null && message.hasOwnProperty("y"))
                if (typeof message.y !== "number")
                    return "y: number expected";
            if (message.scaleX != null && message.hasOwnProperty("scaleX"))
                if (typeof message.scaleX !== "number")
                    return "scaleX: number expected";
            if (message.scaleY != null && message.hasOwnProperty("scaleY"))
                if (typeof message.scaleY !== "number")
                    return "scaleY: number expected";
            return null;
        };

        /**
         * Creates an Image message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof NotesCode.Image
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {NotesCode.Image} Image
         */
        Image.fromObject = function fromObject(object) {
            if (object instanceof $root.NotesCode.Image)
                return object;
            let message = new $root.NotesCode.Image();
            if (object.image != null)
                message.image = String(object.image);
            if (object.x != null)
                message.x = Number(object.x);
            if (object.y != null)
                message.y = Number(object.y);
            if (object.scaleX != null)
                message.scaleX = Number(object.scaleX);
            if (object.scaleY != null)
                message.scaleY = Number(object.scaleY);
            return message;
        };

        /**
         * Creates a plain object from an Image message. Also converts values to other types if specified.
         * @function toObject
         * @memberof NotesCode.Image
         * @static
         * @param {NotesCode.Image} message Image
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Image.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.image = "";
                object.x = 0;
                object.y = 0;
                object.scaleX = 0;
                object.scaleY = 0;
            }
            if (message.image != null && message.hasOwnProperty("image"))
                object.image = message.image;
            if (message.x != null && message.hasOwnProperty("x"))
                object.x = options.json && !isFinite(message.x) ? String(message.x) : message.x;
            if (message.y != null && message.hasOwnProperty("y"))
                object.y = options.json && !isFinite(message.y) ? String(message.y) : message.y;
            if (message.scaleX != null && message.hasOwnProperty("scaleX"))
                object.scaleX = options.json && !isFinite(message.scaleX) ? String(message.scaleX) : message.scaleX;
            if (message.scaleY != null && message.hasOwnProperty("scaleY"))
                object.scaleY = options.json && !isFinite(message.scaleY) ? String(message.scaleY) : message.scaleY;
            return object;
        };

        /**
         * Converts this Image to JSON.
         * @function toJSON
         * @memberof NotesCode.Image
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Image.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Image
         * @function getTypeUrl
         * @memberof NotesCode.Image
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Image.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/NotesCode.Image";
        };

        return Image;
    })();

    NotesCode.TextBlock = (function() {

        /**
         * Properties of a TextBlock.
         * @memberof NotesCode
         * @interface ITextBlock
         * @property {string|null} [path] TextBlock path
         * @property {number|null} [x] TextBlock x
         * @property {number|null} [y] TextBlock y
         * @property {number|null} [w] TextBlock w
         * @property {number|null} [h] TextBlock h
         * @property {number|null} [fontSize] TextBlock fontSize
         * @property {string|null} [fontFamily] TextBlock fontFamily
         * @property {string|null} [color] TextBlock color
         * @property {number|null} [contentType] TextBlock contentType
         */

        /**
         * Constructs a new TextBlock.
         * @memberof NotesCode
         * @classdesc Represents a TextBlock.
         * @implements ITextBlock
         * @constructor
         * @param {NotesCode.ITextBlock=} [properties] Properties to set
         */
        function TextBlock(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * TextBlock path.
         * @member {string} path
         * @memberof NotesCode.TextBlock
         * @instance
         */
        TextBlock.prototype.path = "";

        /**
         * TextBlock x.
         * @member {number} x
         * @memberof NotesCode.TextBlock
         * @instance
         */
        TextBlock.prototype.x = 0;

        /**
         * TextBlock y.
         * @member {number} y
         * @memberof NotesCode.TextBlock
         * @instance
         */
        TextBlock.prototype.y = 0;

        /**
         * TextBlock w.
         * @member {number} w
         * @memberof NotesCode.TextBlock
         * @instance
         */
        TextBlock.prototype.w = 0;

        /**
         * TextBlock h.
         * @member {number} h
         * @memberof NotesCode.TextBlock
         * @instance
         */
        TextBlock.prototype.h = 0;

        /**
         * TextBlock fontSize.
         * @member {number} fontSize
         * @memberof NotesCode.TextBlock
         * @instance
         */
        TextBlock.prototype.fontSize = 0;

        /**
         * TextBlock fontFamily.
         * @member {string} fontFamily
         * @memberof NotesCode.TextBlock
         * @instance
         */
        TextBlock.prototype.fontFamily = "";

        /**
         * TextBlock color.
         * @member {string} color
         * @memberof NotesCode.TextBlock
         * @instance
         */
        TextBlock.prototype.color = "";

        /**
         * TextBlock contentType.
         * @member {number} contentType
         * @memberof NotesCode.TextBlock
         * @instance
         */
        TextBlock.prototype.contentType = 0;

        /**
         * Creates a new TextBlock instance using the specified properties.
         * @function create
         * @memberof NotesCode.TextBlock
         * @static
         * @param {NotesCode.ITextBlock=} [properties] Properties to set
         * @returns {NotesCode.TextBlock} TextBlock instance
         */
        TextBlock.create = function create(properties) {
            return new TextBlock(properties);
        };

        /**
         * Encodes the specified TextBlock message. Does not implicitly {@link NotesCode.TextBlock.verify|verify} messages.
         * @function encode
         * @memberof NotesCode.TextBlock
         * @static
         * @param {NotesCode.ITextBlock} message TextBlock message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        TextBlock.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.path != null && Object.hasOwnProperty.call(message, "path"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.path);
            if (message.x != null && Object.hasOwnProperty.call(message, "x"))
                writer.uint32(/* id 2, wireType 0 =*/16).int32(message.x);
            if (message.y != null && Object.hasOwnProperty.call(message, "y"))
                writer.uint32(/* id 3, wireType 0 =*/24).int32(message.y);
            if (message.w != null && Object.hasOwnProperty.call(message, "w"))
                writer.uint32(/* id 4, wireType 0 =*/32).int32(message.w);
            if (message.h != null && Object.hasOwnProperty.call(message, "h"))
                writer.uint32(/* id 5, wireType 0 =*/40).int32(message.h);
            if (message.fontSize != null && Object.hasOwnProperty.call(message, "fontSize"))
                writer.uint32(/* id 6, wireType 0 =*/48).int32(message.fontSize);
            if (message.fontFamily != null && Object.hasOwnProperty.call(message, "fontFamily"))
                writer.uint32(/* id 7, wireType 2 =*/58).string(message.fontFamily);
            if (message.color != null && Object.hasOwnProperty.call(message, "color"))
                writer.uint32(/* id 8, wireType 2 =*/66).string(message.color);
            if (message.contentType != null && Object.hasOwnProperty.call(message, "contentType"))
                writer.uint32(/* id 9, wireType 0 =*/72).int32(message.contentType);
            return writer;
        };

        /**
         * Encodes the specified TextBlock message, length delimited. Does not implicitly {@link NotesCode.TextBlock.verify|verify} messages.
         * @function encodeDelimited
         * @memberof NotesCode.TextBlock
         * @static
         * @param {NotesCode.ITextBlock} message TextBlock message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        TextBlock.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a TextBlock message from the specified reader or buffer.
         * @function decode
         * @memberof NotesCode.TextBlock
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {NotesCode.TextBlock} TextBlock
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        TextBlock.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.NotesCode.TextBlock();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.path = reader.string();
                        break;
                    }
                case 2: {
                        message.x = reader.int32();
                        break;
                    }
                case 3: {
                        message.y = reader.int32();
                        break;
                    }
                case 4: {
                        message.w = reader.int32();
                        break;
                    }
                case 5: {
                        message.h = reader.int32();
                        break;
                    }
                case 6: {
                        message.fontSize = reader.int32();
                        break;
                    }
                case 7: {
                        message.fontFamily = reader.string();
                        break;
                    }
                case 8: {
                        message.color = reader.string();
                        break;
                    }
                case 9: {
                        message.contentType = reader.int32();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a TextBlock message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof NotesCode.TextBlock
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {NotesCode.TextBlock} TextBlock
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        TextBlock.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a TextBlock message.
         * @function verify
         * @memberof NotesCode.TextBlock
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        TextBlock.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.path != null && message.hasOwnProperty("path"))
                if (!$util.isString(message.path))
                    return "path: string expected";
            if (message.x != null && message.hasOwnProperty("x"))
                if (!$util.isInteger(message.x))
                    return "x: integer expected";
            if (message.y != null && message.hasOwnProperty("y"))
                if (!$util.isInteger(message.y))
                    return "y: integer expected";
            if (message.w != null && message.hasOwnProperty("w"))
                if (!$util.isInteger(message.w))
                    return "w: integer expected";
            if (message.h != null && message.hasOwnProperty("h"))
                if (!$util.isInteger(message.h))
                    return "h: integer expected";
            if (message.fontSize != null && message.hasOwnProperty("fontSize"))
                if (!$util.isInteger(message.fontSize))
                    return "fontSize: integer expected";
            if (message.fontFamily != null && message.hasOwnProperty("fontFamily"))
                if (!$util.isString(message.fontFamily))
                    return "fontFamily: string expected";
            if (message.color != null && message.hasOwnProperty("color"))
                if (!$util.isString(message.color))
                    return "color: string expected";
            if (message.contentType != null && message.hasOwnProperty("contentType"))
                if (!$util.isInteger(message.contentType))
                    return "contentType: integer expected";
            return null;
        };

        /**
         * Creates a TextBlock message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof NotesCode.TextBlock
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {NotesCode.TextBlock} TextBlock
         */
        TextBlock.fromObject = function fromObject(object) {
            if (object instanceof $root.NotesCode.TextBlock)
                return object;
            let message = new $root.NotesCode.TextBlock();
            if (object.path != null)
                message.path = String(object.path);
            if (object.x != null)
                message.x = object.x | 0;
            if (object.y != null)
                message.y = object.y | 0;
            if (object.w != null)
                message.w = object.w | 0;
            if (object.h != null)
                message.h = object.h | 0;
            if (object.fontSize != null)
                message.fontSize = object.fontSize | 0;
            if (object.fontFamily != null)
                message.fontFamily = String(object.fontFamily);
            if (object.color != null)
                message.color = String(object.color);
            if (object.contentType != null)
                message.contentType = object.contentType | 0;
            return message;
        };

        /**
         * Creates a plain object from a TextBlock message. Also converts values to other types if specified.
         * @function toObject
         * @memberof NotesCode.TextBlock
         * @static
         * @param {NotesCode.TextBlock} message TextBlock
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        TextBlock.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.path = "";
                object.x = 0;
                object.y = 0;
                object.w = 0;
                object.h = 0;
                object.fontSize = 0;
                object.fontFamily = "";
                object.color = "";
                object.contentType = 0;
            }
            if (message.path != null && message.hasOwnProperty("path"))
                object.path = message.path;
            if (message.x != null && message.hasOwnProperty("x"))
                object.x = message.x;
            if (message.y != null && message.hasOwnProperty("y"))
                object.y = message.y;
            if (message.w != null && message.hasOwnProperty("w"))
                object.w = message.w;
            if (message.h != null && message.hasOwnProperty("h"))
                object.h = message.h;
            if (message.fontSize != null && message.hasOwnProperty("fontSize"))
                object.fontSize = message.fontSize;
            if (message.fontFamily != null && message.hasOwnProperty("fontFamily"))
                object.fontFamily = message.fontFamily;
            if (message.color != null && message.hasOwnProperty("color"))
                object.color = message.color;
            if (message.contentType != null && message.hasOwnProperty("contentType"))
                object.contentType = message.contentType;
            return object;
        };

        /**
         * Converts this TextBlock to JSON.
         * @function toJSON
         * @memberof NotesCode.TextBlock
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        TextBlock.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for TextBlock
         * @function getTypeUrl
         * @memberof NotesCode.TextBlock
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        TextBlock.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/NotesCode.TextBlock";
        };

        return TextBlock;
    })();

    return NotesCode;
})();

export { $root as default };
