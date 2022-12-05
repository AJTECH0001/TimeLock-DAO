import Cbor from "../../cbor/Cbor";
import CborObj from "../../cbor/CborObj";
import CborArray from "../../cbor/CborObj/CborArray";
import CborBytes from "../../cbor/CborObj/CborBytes";
import CborUInt from "../../cbor/CborObj/CborUInt";
import CborString from "../../cbor/CborString";
import { CanBeUInteger, forceUInteger } from "../../types/ints/Integer";
import JsRuntime from "../../utils/JsRuntime";
import Hash28 from "../hashes/Hash28/Hash28";

export type NativeScript
    = ScriptSignature
    | ScriptAll
    | ScriptAny
    | ScriptAtLeast
    | ScriptAfter
    | ScriptBefore

export default NativeScript;

export interface ScriptSignature {
    type: "sig",
    keyHash: Hash28 | string
}

export interface ScriptAll {
    type: "all",
    scripts: NativeScript[]
}

export interface ScriptAny {
    type: "any",
    scripts: NativeScript[]
}

export interface ScriptAtLeast {
    type: "atLeast",
    required: CanBeUInteger,
    scripts: NativeScript[]
}

export interface ScriptAfter {
    type: "after",
    slot: CanBeUInteger
}

export interface ScriptBefore {
    type: "before",
    slot: CanBeUInteger
}

const hello: NativeScript = {
    type: "all",
    scripts:
    [
      {
        type: "after",
        slot: 22
      },
      {
        type: "sig",
        keyHash: "966e394a544f242081e41d1965137b1bb412ac230d40ed5407821c37"
      }
    ]
};

export function nativeScriptToCborObj( nativeScript: NativeScript ): CborObj
{
    const type = nativeScript.type;

    if( type === "sig" )
    {
        const keyHash = nativeScript.keyHash;

        return new CborArray([
            new CborUInt( 0 ),
            new CborBytes(
                (
                    keyHash instanceof Hash28 ?
                        keyHash :
                        new Hash28( keyHash )
                ).asBytes
            )
        ]);
    }
    if( type === "all" || type === "any" )
        return new CborArray([
            new CborUInt( type === "all" ? 1 : 2 ),
            new CborArray(
                nativeScript.scripts.map( nativeScriptToCborObj )
            )
        ]);
    if( type === "atLeast" )
        return new CborArray([
            new CborUInt( 3 ),
            new CborUInt( forceUInteger( nativeScript.required ).asBigInt ),
            new CborArray(
                nativeScript.scripts.map( nativeScriptToCborObj )
            )
        ]);
    if( type === "after" || type === "before" )
        return new CborArray([
            new CborUInt( type === "after" ? 4 : 5 ),
            new CborUInt( forceUInteger( nativeScript.slot ).asBigInt ),
        ]);

    throw JsRuntime.makeNotSupposedToHappenError(
        "unmatched 'nativeScript.type' while converting to cbor"
    );
}
export function nativeScriptToCbor( nativeScript: NativeScript ): CborString
{
    return Cbor.encode( nativeScriptToCborObj( nativeScript ) );
}