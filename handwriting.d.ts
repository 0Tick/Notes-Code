import * as $protobuf from "protobufjs";
import Long = require("long");
/** Namespace NotesCode. */
export namespace NotesCode {

    /** Properties of a Document. */
    interface IDocument {

        /** Document strokes */
        strokes?: (NotesCode.IStroke[]|null);

        /** Document images */
        images?: (NotesCode.IImage[]|null);

        /** Document textBlocks */
        textBlocks?: (NotesCode.ITextBlock[]|null);
    }

    /** Represents a Document. */
    class Document implements IDocument {

        /**
         * Constructs a new Document.
         * @param [properties] Properties to set
         */
        constructor(properties?: NotesCode.IDocument);

        /** Document strokes. */
        public strokes: NotesCode.IStroke[];

        /** Document images. */
        public images: NotesCode.IImage[];

        /** Document textBlocks. */
        public textBlocks: NotesCode.ITextBlock[];

        /**
         * Creates a new Document instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Document instance
         */
        public static create(properties?: NotesCode.IDocument): NotesCode.Document;

        /**
         * Encodes the specified Document message. Does not implicitly {@link NotesCode.Document.verify|verify} messages.
         * @param message Document message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: NotesCode.IDocument, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Document message, length delimited. Does not implicitly {@link NotesCode.Document.verify|verify} messages.
         * @param message Document message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: NotesCode.IDocument, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Document message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Document
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): NotesCode.Document;

        /**
         * Decodes a Document message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Document
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): NotesCode.Document;

        /**
         * Verifies a Document message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Document message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Document
         */
        public static fromObject(object: { [k: string]: any }): NotesCode.Document;

        /**
         * Creates a plain object from a Document message. Also converts values to other types if specified.
         * @param message Document
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: NotesCode.Document, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Document to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for Document
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a Stroke. */
    interface IStroke {

        /** Stroke points */
        points?: (NotesCode.IPoint[]|null);

        /** Stroke color */
        color?: (string|null);

        /** Stroke width */
        width?: (number|null);

        /** Stroke minX */
        minX?: (number|null);

        /** Stroke minY */
        minY?: (number|null);

        /** Stroke maxX */
        maxX?: (number|null);

        /** Stroke maxY */
        maxY?: (number|null);
    }

    /** Represents a Stroke. */
    class Stroke implements IStroke {

        /**
         * Constructs a new Stroke.
         * @param [properties] Properties to set
         */
        constructor(properties?: NotesCode.IStroke);

        /** Stroke points. */
        public points: NotesCode.IPoint[];

        /** Stroke color. */
        public color: string;

        /** Stroke width. */
        public width: number;

        /** Stroke minX. */
        public minX: number;

        /** Stroke minY. */
        public minY: number;

        /** Stroke maxX. */
        public maxX: number;

        /** Stroke maxY. */
        public maxY: number;

        /**
         * Creates a new Stroke instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Stroke instance
         */
        public static create(properties?: NotesCode.IStroke): NotesCode.Stroke;

        /**
         * Encodes the specified Stroke message. Does not implicitly {@link NotesCode.Stroke.verify|verify} messages.
         * @param message Stroke message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: NotesCode.IStroke, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Stroke message, length delimited. Does not implicitly {@link NotesCode.Stroke.verify|verify} messages.
         * @param message Stroke message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: NotesCode.IStroke, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Stroke message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Stroke
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): NotesCode.Stroke;

        /**
         * Decodes a Stroke message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Stroke
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): NotesCode.Stroke;

        /**
         * Verifies a Stroke message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Stroke message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Stroke
         */
        public static fromObject(object: { [k: string]: any }): NotesCode.Stroke;

        /**
         * Creates a plain object from a Stroke message. Also converts values to other types if specified.
         * @param message Stroke
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: NotesCode.Stroke, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Stroke to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for Stroke
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a Point. */
    interface IPoint {

        /** Point pressure */
        pressure?: (number|null);

        /** Point x */
        x?: (number|null);

        /** Point y */
        y?: (number|null);
    }

    /** Represents a Point. */
    class Point implements IPoint {

        /**
         * Constructs a new Point.
         * @param [properties] Properties to set
         */
        constructor(properties?: NotesCode.IPoint);

        /** Point pressure. */
        public pressure: number;

        /** Point x. */
        public x: number;

        /** Point y. */
        public y: number;

        /**
         * Creates a new Point instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Point instance
         */
        public static create(properties?: NotesCode.IPoint): NotesCode.Point;

        /**
         * Encodes the specified Point message. Does not implicitly {@link NotesCode.Point.verify|verify} messages.
         * @param message Point message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: NotesCode.IPoint, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Point message, length delimited. Does not implicitly {@link NotesCode.Point.verify|verify} messages.
         * @param message Point message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: NotesCode.IPoint, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Point message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Point
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): NotesCode.Point;

        /**
         * Decodes a Point message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Point
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): NotesCode.Point;

        /**
         * Verifies a Point message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Point message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Point
         */
        public static fromObject(object: { [k: string]: any }): NotesCode.Point;

        /**
         * Creates a plain object from a Point message. Also converts values to other types if specified.
         * @param message Point
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: NotesCode.Point, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Point to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for Point
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of an Image. */
    interface IImage {

        /** Image image */
        image?: (string|null);

        /** Image x */
        x?: (number|null);

        /** Image y */
        y?: (number|null);

        /** Image scaleX */
        scaleX?: (number|null);

        /** Image scaleY */
        scaleY?: (number|null);
    }

    /** Represents an Image. */
    class Image implements IImage {

        /**
         * Constructs a new Image.
         * @param [properties] Properties to set
         */
        constructor(properties?: NotesCode.IImage);

        /** Image image. */
        public image: string;

        /** Image x. */
        public x: number;

        /** Image y. */
        public y: number;

        /** Image scaleX. */
        public scaleX: number;

        /** Image scaleY. */
        public scaleY: number;

        /**
         * Creates a new Image instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Image instance
         */
        public static create(properties?: NotesCode.IImage): NotesCode.Image;

        /**
         * Encodes the specified Image message. Does not implicitly {@link NotesCode.Image.verify|verify} messages.
         * @param message Image message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: NotesCode.IImage, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Image message, length delimited. Does not implicitly {@link NotesCode.Image.verify|verify} messages.
         * @param message Image message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: NotesCode.IImage, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an Image message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Image
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): NotesCode.Image;

        /**
         * Decodes an Image message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Image
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): NotesCode.Image;

        /**
         * Verifies an Image message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an Image message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Image
         */
        public static fromObject(object: { [k: string]: any }): NotesCode.Image;

        /**
         * Creates a plain object from an Image message. Also converts values to other types if specified.
         * @param message Image
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: NotesCode.Image, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Image to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for Image
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a TextBlock. */
    interface ITextBlock {

        /** TextBlock path */
        path?: (string|null);

        /** TextBlock x */
        x?: (number|null);

        /** TextBlock y */
        y?: (number|null);

        /** TextBlock w */
        w?: (number|null);

        /** TextBlock h */
        h?: (number|null);

        /** TextBlock fontSize */
        fontSize?: (number|null);

        /** TextBlock fontFamily */
        fontFamily?: (string|null);

        /** TextBlock color */
        color?: (string|null);

        /** TextBlock contentType */
        contentType?: (number|null);
    }

    /** Represents a TextBlock. */
    class TextBlock implements ITextBlock {

        /**
         * Constructs a new TextBlock.
         * @param [properties] Properties to set
         */
        constructor(properties?: NotesCode.ITextBlock);

        /** TextBlock path. */
        public path: string;

        /** TextBlock x. */
        public x: number;

        /** TextBlock y. */
        public y: number;

        /** TextBlock w. */
        public w: number;

        /** TextBlock h. */
        public h: number;

        /** TextBlock fontSize. */
        public fontSize: number;

        /** TextBlock fontFamily. */
        public fontFamily: string;

        /** TextBlock color. */
        public color: string;

        /** TextBlock contentType. */
        public contentType: number;

        /**
         * Creates a new TextBlock instance using the specified properties.
         * @param [properties] Properties to set
         * @returns TextBlock instance
         */
        public static create(properties?: NotesCode.ITextBlock): NotesCode.TextBlock;

        /**
         * Encodes the specified TextBlock message. Does not implicitly {@link NotesCode.TextBlock.verify|verify} messages.
         * @param message TextBlock message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: NotesCode.ITextBlock, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified TextBlock message, length delimited. Does not implicitly {@link NotesCode.TextBlock.verify|verify} messages.
         * @param message TextBlock message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: NotesCode.ITextBlock, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a TextBlock message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns TextBlock
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): NotesCode.TextBlock;

        /**
         * Decodes a TextBlock message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns TextBlock
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): NotesCode.TextBlock;

        /**
         * Verifies a TextBlock message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a TextBlock message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns TextBlock
         */
        public static fromObject(object: { [k: string]: any }): NotesCode.TextBlock;

        /**
         * Creates a plain object from a TextBlock message. Also converts values to other types if specified.
         * @param message TextBlock
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: NotesCode.TextBlock, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this TextBlock to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for TextBlock
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }
}
